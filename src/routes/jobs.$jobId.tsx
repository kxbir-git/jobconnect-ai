import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Bookmark, BookmarkCheck, Building2, Clock, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JobCard } from "@/components/job-card";
import { recommendJobs } from "@/lib/api";
import { useJob, useJobs, useSavedJobIds, useToggleSaved } from "@/lib/queries";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/jobs/$jobId")({
  head: () => ({
    meta: [
      { title: "Job details — Job Hunt" },
      { name: "description", content: "Role details, requirements and similar openings." },
      { property: "og:title", content: "Job details — Job Hunt" },
      { property: "og:description", content: "Role details, requirements and similar openings." },
    ],
  }),
  component: JobDetail,
});

function JobDetail() {
  const { jobId } = Route.useParams();
  const { applied, user, applyToJob } = useStore();
  const { data: job, isLoading } = useJob(jobId);
  const { data: jobs = [] } = useJobs();
  const { data: saved = [] } = useSavedJobIds();
  const toggleSaved = useToggleSaved();

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-24 text-muted-foreground">Loading…</div>;
  }
  if (!job) throw notFound();

  const isSaved = saved.includes(job.id);
  const hasApplied = applied.includes(job.id);
  const related = recommendJobs(job, jobs);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to jobs
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{job.title}</h1>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Building2 className="size-4" /> {job.company}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" /> {job.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-4" /> {job.postedAt}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">{job.jobType}</Badge>
            <Badge variant="outline">{job.experience}</Badge>
            <Badge variant="outline">{job.salary}</Badge>
          </div>

          <p className="mt-8 leading-relaxed text-muted-foreground">{job.description}</p>

          <h2 className="mt-8 text-xl font-semibold">What we&apos;re looking for</h2>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            {job.requirements.map((requirement) => (
              <li key={requirement} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-glow" />
                {requirement}
              </li>
            ))}
          </ul>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="border-border/70">
            <CardContent className="space-y-3 p-5">
              <Button
                className="w-full"
                disabled={hasApplied}
                onClick={() => {
                  if (!user) {
                    toast.error("Sign in to apply");
                    return;
                  }
                  applyToJob(job.id);
                  toast.success("Application sent");
                }}
              >
                {hasApplied ? "Applied" : "Apply now"}
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  if (!user) {
                    toast.error("Sign in to save jobs");
                    return;
                  }
                  toggleSaved.mutate(
                    { jobId: job.id, isSaved },
                    {
                      onSuccess: (nowSaved) =>
                        toast.success(nowSaved ? "Saved for later" : "Removed from saved"),
                      onError: () => toast.error("Could not update saved jobs"),
                    },
                  );
                }}
              >
                {isSaved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                {isSaved ? "Saved" : "Save job"}
              </Button>
              <p className="pt-1 text-xs text-muted-foreground">
                Applications go straight to the hiring team at {job.company}.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      <section className="mt-14">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary-glow" />
          <h2 className="text-xl font-semibold">Recommended for you</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Matched on skills, role type and location.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => (
            <JobCard key={item.id} job={item} />
          ))}
        </div>
      </section>
    </div>
  );
}