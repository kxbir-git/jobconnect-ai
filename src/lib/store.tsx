import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { applicants as seedApplicants, type Applicant } from "./mock-data";

export type Role = "student" | "recruiter";

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: Role;
  bio: string;
  skills: string[];
  resumeUrl: string;
};

const LOCAL_KEY = "jobhunt-local-v2";

type LocalState = { applied: string[]; applicants: Applicant[] };

const initialLocal: LocalState = { applied: [], applicants: seedApplicants };

type StoreValue = {
  session: Session | null;
  userId: string | null;
  user: Profile | null;
  hydrated: boolean;
  applied: string[];
  applicants: Applicant[];
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  applyToJob: (jobId: string) => void;
  setApplicantStatus: (applicantId: string, status: Applicant["status"]) => void;
  logout: () => Promise<void>;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [local, setLocal] = useState<LocalState>(initialLocal);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LOCAL_KEY);
      if (raw) setLocal({ ...initialLocal, ...(JSON.parse(raw) as Partial<LocalState>) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(local));
  }, [local, hydrated]);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (!data) {
      setUser(null);
      return;
    }
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      role: (data.role as Role) ?? "student",
      bio: data.bio ?? "",
      skills: data.skills ?? [],
      resumeUrl: data.resume_url ?? "",
    });
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        void loadProfile(nextSession.user.id);
      } else {
        setUser(null);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) void loadProfile(data.session.user.id);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const userId = session?.user?.id ?? null;

  const refreshProfile = useCallback(async () => {
    if (userId) await loadProfile(userId);
  }, [userId, loadProfile]);

  const updateProfile = useCallback(
    async (patch: Partial<Profile>) => {
      if (!userId) return;
      const payload: {
        name?: string;
        role?: string;
        bio?: string;
        skills?: string[];
        resume_url?: string;
      } = {};
      if (patch.name !== undefined) payload.name = patch.name;
      if (patch.role !== undefined) payload.role = patch.role;
      if (patch.bio !== undefined) payload.bio = patch.bio;
      if (patch.skills !== undefined) payload.skills = patch.skills;
      if (patch.resumeUrl !== undefined) payload.resume_url = patch.resumeUrl;
      const { error } = await supabase.from("profiles").update(payload).eq("id", userId);
      if (error) throw error;
      await loadProfile(userId);
    },
    [userId, loadProfile],
  );

  const applyToJob = useCallback((jobId: string) => {
    setLocal((s) => (s.applied.includes(jobId) ? s : { ...s, applied: [...s.applied, jobId] }));
  }, []);

  const setApplicantStatus = useCallback(
    (applicantId: string, status: Applicant["status"]) => {
      setLocal((s) => ({
        ...s,
        applicants: s.applicants.map((a) => (a.id === applicantId ? { ...a, status } : a)),
      }));
    },
    [],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      session,
      userId,
      user,
      hydrated,
      applied: local.applied,
      applicants: local.applicants,
      refreshProfile,
      updateProfile,
      applyToJob,
      setApplicantStatus,
      logout,
    }),
    [
      session,
      userId,
      user,
      hydrated,
      local,
      refreshProfile,
      updateProfile,
      applyToJob,
      setApplicantStatus,
      logout,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
