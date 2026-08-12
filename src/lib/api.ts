import { supabase } from "@/integrations/supabase/client";

export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";

export type Job = {
  id: string;
  title: string;
  company: string;
  companyId: string | null;
  location: string;
  jobType: JobType;
  salary: string;
  experience: string;
  postedAt: string;
  createdBy: string | null;
  description: string;
  requirements: string[];
  tags: string[];
};

export type Company = {
  id: string;
  name: string;
  website: string;
  location: string;
  about: string;
  createdBy: string | null;
};

type JobRow = {
  id: string;
  title: string;
  company_id: string | null;
  company_name: string;
  location: string;
  job_type: string;
  salary: string;
  experience: string;
  description: string;
  requirements: string[];
  tags: string[];
  created_by: string | null;
  created_at: string;
};

type CompanyRow = {
  id: string;
  name: string;
  website: string;
  location: string;
  about: string;
  created_by: string | null;
};

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

function toJob(row: JobRow): Job {
  return {
    id: row.id,
    title: row.title,
    company: row.company_name,
    companyId: row.company_id,
    location: row.location,
    jobType: row.job_type as JobType,
    salary: row.salary,
    experience: row.experience,
    postedAt: relativeTime(row.created_at),
    createdBy: row.created_by,
    description: row.description,
    requirements: row.requirements ?? [],
    tags: row.tags ?? [],
  };
}

function toCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    name: row.name,
    website: row.website,
    location: row.location,
    about: row.about,
    createdBy: row.created_by,
  };
}

export async function fetchJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as JobRow[]).map(toJob);
}

export async function fetchJob(id: string): Promise<Job | null> {
  const { data, error } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? toJob(data as JobRow) : null;
}

export async function fetchCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data as CompanyRow[]).map(toCompany);
}

export async function fetchSavedJobIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from("saved_jobs").select("job_id").eq("user_id", userId);
  if (error) throw error;
  return (data as { job_id: string }[]).map((row) => row.job_id);
}

export async function saveJob(userId: string, jobId: string) {
  const { error } = await supabase.from("saved_jobs").insert({ user_id: userId, job_id: jobId });
  if (error) throw error;
}

export async function unsaveJob(userId: string, jobId: string) {
  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("user_id", userId)
    .eq("job_id", jobId);
  if (error) throw error;
}

export type NewCompany = Omit<Company, "id" | "createdBy">;

export async function createCompany(userId: string, company: NewCompany): Promise<Company> {
  const { data, error } = await supabase
    .from("companies")
    .insert({ ...company, created_by: userId })
    .select("*")
    .single();
  if (error) throw error;
  return toCompany(data as CompanyRow);
}

export type NewJob = {
  title: string;
  companyId: string;
  companyName: string;
  location: string;
  jobType: JobType;
  salary: string;
  experience: string;
  description: string;
  requirements: string[];
  tags: string[];
};

export async function createJob(userId: string, job: NewJob): Promise<Job> {
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      title: job.title,
      company_id: job.companyId,
      company_name: job.companyName,
      location: job.location,
      job_type: job.jobType,
      salary: job.salary,
      experience: job.experience,
      description: job.description,
      requirements: job.requirements,
      tags: job.tags,
      created_by: userId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return toJob(data as JobRow);
}

export async function deleteJob(jobId: string) {
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);
  if (error) throw error;
}

/** Stand-in for the AI recommendation call: scores by tag / type / location overlap. */
export function recommendJobs(job: Job, pool: Job[], limit = 3): Job[] {
  return pool
    .filter((candidate) => candidate.id !== job.id)
    .map((candidate) => {
      const tagOverlap = candidate.tags.filter((tag) => job.tags.includes(tag)).length * 3;
      const typeScore = candidate.jobType === job.jobType ? 2 : 0;
      const locationScore = candidate.location === job.location ? 2 : 0;
      return { candidate, score: tagOverlap + typeScore + locationScore };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}
