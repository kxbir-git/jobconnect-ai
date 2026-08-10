export type Job = {
  id: string;
  title: string;
  company: string;
  companyId: string;
  location: string;
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship";
  salary: string;
  experience: string;
  postedAt: string;
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
};

export type Applicant = {
  id: string;
  jobId: string;
  name: string;
  email: string;
  skills: string[];
  status: "Pending" | "Shortlisted" | "Rejected";
  appliedAt: string;
};

export const companies: Company[] = [
  {
    id: "c1",
    name: "Nimbus Labs",
    website: "nimbuslabs.io",
    location: "Bengaluru, IN",
    about: "Cloud infrastructure tooling for fast-moving product teams.",
  },
  {
    id: "c2",
    name: "Northwind Analytics",
    website: "northwind.dev",
    location: "Remote",
    about: "Data platform helping retailers forecast demand.",
  },
  {
    id: "c3",
    name: "Vertex Health",
    website: "vertexhealth.com",
    location: "Pune, IN",
    about: "Digital care records for clinics and hospitals.",
  },
];

export const jobs: Job[] = [
  {
    id: "j1",
    title: "Frontend Engineer",
    company: "Nimbus Labs",
    companyId: "c1",
    location: "Bengaluru, IN",
    jobType: "Full-time",
    salary: "₹18–28 LPA",
    experience: "2–4 years",
    postedAt: "2 days ago",
    description:
      "Build the dashboard experience used by thousands of engineers to ship infrastructure. You will own features end to end, from design review through rollout.",
    requirements: [
      "Strong React and TypeScript fundamentals",
      "Comfort with design systems and accessibility",
      "Experience shipping to production weekly",
    ],
    tags: ["React", "TypeScript", "Tailwind"],
  },
  {
    id: "j2",
    title: "Backend Engineer (Node.js)",
    company: "Nimbus Labs",
    companyId: "c1",
    location: "Remote",
    jobType: "Full-time",
    salary: "₹20–32 LPA",
    experience: "3–6 years",
    postedAt: "4 days ago",
    description:
      "Design APIs and background pipelines that keep customer clusters healthy. Expect deep work on reliability and performance.",
    requirements: ["Node.js and REST API design", "Postgres or Mongo at scale", "Observability mindset"],
    tags: ["Node.js", "APIs", "Databases"],
  },
  {
    id: "j3",
    title: "Data Analyst",
    company: "Northwind Analytics",
    companyId: "c2",
    location: "Remote",
    jobType: "Contract",
    salary: "₹80k–1.2L / month",
    experience: "1–3 years",
    postedAt: "1 week ago",
    description:
      "Turn messy retail data into forecasts merchandisers actually trust. You will partner directly with customer success.",
    requirements: ["SQL fluency", "Python or R", "Clear written communication"],
    tags: ["SQL", "Python", "Forecasting"],
  },
  {
    id: "j4",
    title: "Product Designer",
    company: "Northwind Analytics",
    companyId: "c2",
    location: "Hyderabad, IN",
    jobType: "Full-time",
    salary: "₹16–24 LPA",
    experience: "3–5 years",
    postedAt: "3 days ago",
    description:
      "Own the end-to-end design of our forecasting workspace, from research to polished interface specs.",
    requirements: ["Portfolio of shipped B2B work", "Systems thinking", "Prototyping skills"],
    tags: ["Figma", "B2B", "Design Systems"],
  },
  {
    id: "j5",
    title: "QA Automation Intern",
    company: "Vertex Health",
    companyId: "c3",
    location: "Pune, IN",
    jobType: "Internship",
    salary: "₹35k / month",
    experience: "0–1 years",
    postedAt: "Today",
    description:
      "Join the quality team and help automate regression suites for our clinical records product.",
    requirements: ["Basic JavaScript", "Curiosity about testing", "Attention to detail"],
    tags: ["Testing", "Playwright", "JavaScript"],
  },
  {
    id: "j6",
    title: "Full Stack Engineer",
    company: "Vertex Health",
    companyId: "c3",
    location: "Pune, IN",
    jobType: "Full-time",
    salary: "₹15–26 LPA",
    experience: "2–5 years",
    postedAt: "5 days ago",
    description:
      "Work across React and Node to deliver features that clinicians rely on every single day.",
    requirements: ["React + Node experience", "Understanding of auth and RBAC", "Care for data privacy"],
    tags: ["React", "Node.js", "MongoDB"],
  },
  {
    id: "j7",
    title: "DevOps Engineer",
    company: "Nimbus Labs",
    companyId: "c1",
    location: "Remote",
    jobType: "Part-time",
    salary: "₹1.5L / month",
    experience: "4+ years",
    postedAt: "1 week ago",
    description: "Keep our deploy pipelines fast and boring. Own CI/CD, infra as code, and incident tooling.",
    requirements: ["Terraform", "Kubernetes", "CI/CD pipelines"],
    tags: ["Kubernetes", "Terraform", "CI/CD"],
  },
];

export const applicants: Applicant[] = [
  {
    id: "a1",
    jobId: "j1",
    name: "Aarav Mehta",
    email: "aarav@example.com",
    skills: ["React", "TypeScript"],
    status: "Shortlisted",
    appliedAt: "1 day ago",
  },
  {
    id: "a2",
    jobId: "j1",
    name: "Sara Iyer",
    email: "sara@example.com",
    skills: ["React", "CSS"],
    status: "Pending",
    appliedAt: "2 days ago",
  },
  {
    id: "a3",
    jobId: "j2",
    name: "Dev Patel",
    email: "dev@example.com",
    skills: ["Node.js", "Postgres"],
    status: "Pending",
    appliedAt: "3 days ago",
  },
  {
    id: "a4",
    jobId: "j4",
    name: "Nikita Rao",
    email: "nikita@example.com",
    skills: ["Figma", "Research"],
    status: "Rejected",
    appliedAt: "6 days ago",
  },
  {
    id: "a5",
    jobId: "j6",
    name: "Imran Sheikh",
    email: "imran@example.com",
    skills: ["React", "MongoDB"],
    status: "Shortlisted",
    appliedAt: "4 days ago",
  },
];

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