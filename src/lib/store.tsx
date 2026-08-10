import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applicants as seedApplicants,
  companies as seedCompanies,
  jobs as seedJobs,
  type Applicant,
  type Company,
  type Job,
} from "./mock-data";

export type Role = "student" | "recruiter";

export type User = {
  name: string;
  email: string;
  role: Role;
  bio: string;
  skills: string[];
  resumeUrl: string;
};

type State = {
  user: User | null;
  saved: string[];
  applied: string[];
  jobs: Job[];
  companies: Company[];
  applicants: Applicant[];
};

const STORAGE_KEY = "jobhunt-state-v1";

const initialState: State = {
  user: null,
  saved: [],
  applied: [],
  jobs: seedJobs,
  companies: seedCompanies,
  applicants: seedApplicants,
};

type StoreValue = State & {
  hydrated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
  toggleSaved: (jobId: string) => boolean;
  applyToJob: (jobId: string) => void;
  addCompany: (company: Omit<Company, "id">) => void;
  addJob: (job: Omit<Job, "id" | "postedAt">) => void;
  updateJob: (jobId: string, patch: Partial<Job>) => void;
  setApplicantStatus: (applicantId: string, status: Applicant["status"]) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as Partial<State>) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const login = useCallback((user: User) => setState((s) => ({ ...s, user })), []);
  const logout = useCallback(() => setState((s) => ({ ...s, user: null })), []);
  const updateProfile = useCallback(
    (patch: Partial<User>) =>
      setState((s) => (s.user ? { ...s, user: { ...s.user, ...patch } } : s)),
    [],
  );

  const toggleSaved = useCallback((jobId: string) => {
    let nowSaved = false;
    setState((s) => {
      nowSaved = !s.saved.includes(jobId);
      return {
        ...s,
        saved: nowSaved ? [...s.saved, jobId] : s.saved.filter((id) => id !== jobId),
      };
    });
    return nowSaved;
  }, []);

  const applyToJob = useCallback((jobId: string) => {
    setState((s) =>
      s.applied.includes(jobId) ? s : { ...s, applied: [...s.applied, jobId] },
    );
  }, []);

  const addCompany = useCallback((company: Omit<Company, "id">) => {
    setState((s) => ({
      ...s,
      companies: [...s.companies, { ...company, id: `c${Date.now()}` }],
    }));
  }, []);

  const addJob = useCallback((job: Omit<Job, "id" | "postedAt">) => {
    setState((s) => ({
      ...s,
      jobs: [{ ...job, id: `j${Date.now()}`, postedAt: "Just now" }, ...s.jobs],
    }));
  }, []);

  const updateJob = useCallback((jobId: string, patch: Partial<Job>) => {
    setState((s) => ({
      ...s,
      jobs: s.jobs.map((job) => (job.id === jobId ? { ...job, ...patch } : job)),
    }));
  }, []);

  const setApplicantStatus = useCallback((applicantId: string, status: Applicant["status"]) => {
    setState((s) => ({
      ...s,
      applicants: s.applicants.map((a) => (a.id === applicantId ? { ...a, status } : a)),
    }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      hydrated,
      login,
      logout,
      updateProfile,
      toggleSaved,
      applyToJob,
      addCompany,
      addJob,
      updateJob,
      setApplicantStatus,
    }),
    [
      state,
      hydrated,
      login,
      logout,
      updateProfile,
      toggleSaved,
      applyToJob,
      addCompany,
      addJob,
      updateJob,
      setApplicantStatus,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}