export type ApplicantStatus = "Pending" | "Shortlisted" | "Hired" | "Rejected";

export type Applicant = {
  id: string;
  jobId: string;
  name: string;
  email: string;
  skills: string[];
  status: ApplicantStatus;
  appliedAt: string;
  /** Days between application and hiring decision (used for time-to-hire). */
  daysToDecision: number;
};

/** Demo applicant pipeline — applications are not backed by the database yet. */
export const applicants: Applicant[] = [
  {
    id: "a1",
    jobId: "",
    name: "Aarav Mehta",
    email: "aarav@example.com",
    skills: ["React", "TypeScript"],
    status: "Shortlisted",
    appliedAt: "1 day ago",
    daysToDecision: 6,
  },
  {
    id: "a2",
    jobId: "",
    name: "Sara Iyer",
    email: "sara@example.com",
    skills: ["React", "CSS"],
    status: "Pending",
    appliedAt: "2 days ago",
    daysToDecision: 0,
  },
  {
    id: "a3",
    jobId: "",
    name: "Rohit Nair",
    email: "rohit@example.com",
    skills: ["Node.js", "Postgres"],
    status: "Hired",
    appliedAt: "3 weeks ago",
    daysToDecision: 14,
  },
  {
    id: "a4",
    jobId: "",
    name: "Neha Kapoor",
    email: "neha@example.com",
    skills: ["Product", "Analytics"],
    status: "Rejected",
    appliedAt: "2 weeks ago",
    daysToDecision: 9,
  },
  {
    id: "a5",
    jobId: "",
    name: "Imran Sheikh",
    email: "imran@example.com",
    skills: ["Figma", "Design systems"],
    status: "Hired",
    appliedAt: "1 month ago",
    daysToDecision: 21,
  },
  {
    id: "a6",
    jobId: "",
    name: "Divya Rao",
    email: "divya@example.com",
    skills: ["Python", "ML"],
    status: "Pending",
    appliedAt: "4 days ago",
    daysToDecision: 0,
  },
];

/**
 * Demo applicants ship without a job id; spread them across the live jobs so the
 * dashboard has something to summarise.
 */
export function assignApplicantsToJobs(list: Applicant[], jobIds: string[]): Applicant[] {
  if (jobIds.length === 0) return list;
  return list.map((applicant, index) =>
    applicant.jobId ? applicant : { ...applicant, jobId: jobIds[index % jobIds.length]! },
  );
}
