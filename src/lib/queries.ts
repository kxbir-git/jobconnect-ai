import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCompany,
  createJob,
  fetchCompanies,
  fetchJob,
  fetchJobs,
  fetchSavedJobIds,
  saveJob,
  unsaveJob,
  type Job,
  type NewCompany,
  type NewJob,
} from "./api";
import { useStore } from "./store";

export function useJobs() {
  return useQuery<Job[]>({ queryKey: ["jobs"], queryFn: fetchJobs });
}

export function useJob(jobId: string) {
  return useQuery({ queryKey: ["job", jobId], queryFn: () => fetchJob(jobId) });
}

export function useCompanies() {
  return useQuery({ queryKey: ["companies"], queryFn: fetchCompanies });
}

export function useSavedJobIds() {
  const { userId } = useStore();
  return useQuery({
    queryKey: ["saved", userId],
    queryFn: () => fetchSavedJobIds(userId!),
    enabled: Boolean(userId),
  });
}

export function useToggleSaved() {
  const { userId } = useStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, isSaved }: { jobId: string; isSaved: boolean }) => {
      if (!userId) throw new Error("Not signed in");
      if (isSaved) await unsaveJob(userId, jobId);
      else await saveJob(userId, jobId);
      return !isSaved;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["saved", userId] });
    },
  });
}

export function useCreateCompany() {
  const { userId } = useStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (company: NewCompany) => {
      if (!userId) throw new Error("Not signed in");
      return createCompany(userId, company);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useCreateJob() {
  const { userId } = useStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (job: NewJob) => {
      if (!userId) throw new Error("Not signed in");
      return createJob(userId, job);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
