export type Applicant = {
  id: string;
  jobId: string;
  name: string;
  email: string;
  skills: string[];
  status: "Pending" | "Shortlisted" | "Rejected";
  appliedAt: string;
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
  },
  {
    id: "a2",
    jobId: "",
    name: "Sara Iyer",
    email: "sara@example.com",
    skills: ["React", "CSS"],
    status: "Pending",
    appliedAt: "2 days ago",
  },
];
