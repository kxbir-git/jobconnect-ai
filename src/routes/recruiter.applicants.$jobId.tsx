import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/recruiter/applicants/$jobId")({
  head: () => ({
    meta: [
      { title: "Applicants — Job Hunt" },
      { name: "description", content: "Review and shortlist candidates for this opening." },
      { property: "og:title", content: "Applicants — Job Hunt" },
      { property: "og:description", content: "Review and shortlist candidates for this opening." },
    ],
  }),
  component: ApplicantsPage,
});

function ApplicantsPage() {
  const { jobId } = Route.useParams();
  const { jobs, applicants, setApplicantStatus } = useStore();
  const job = jobs.find((item) => item.id === jobId);
  if (!job) throw notFound();

  const list = applicants.filter((applicant) => applicant.jobId === jobId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        to="/recruiter"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      <h1 className="mt-6 text-3xl font-semibold">{job.title}</h1>
      <p className="mt-1 text-muted-foreground">
        {list.length} applicant{list.length === 1 ? "" : "s"} · {job.company}
      </p>

      <div className="mt-8 space-y-3">
        {list.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">No applications yet.</p>
        )}
        {list.map((applicant) => (
          <div
            key={applicant.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/60 p-4"
          >
            <div>
              <p className="font-medium">{applicant.name}</p>
              <p className="text-sm text-muted-foreground">
                {applicant.email} · applied {applicant.appliedAt}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {applicant.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={applicant.status === "Rejected" ? "destructive" : "secondary"}
              >
                {applicant.status}
              </Badge>
              <Button
                size="sm"
                onClick={() => {
                  setApplicantStatus(applicant.id, "Shortlisted");
                  toast.success(`${applicant.name} shortlisted`);
                }}
              >
                Shortlist
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setApplicantStatus(applicant.id, "Rejected");
                  toast(`${applicant.name} rejected`);
                }}
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}