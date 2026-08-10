import { createFileRoute, Link } from "@tanstack/react-router";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved jobs — Job Hunt" },
      { name: "description", content: "The roles you bookmarked to revisit later." },
      { property: "og:title", content: "Saved jobs — Job Hunt" },
      { property: "og:description", content: "The roles you bookmarked to revisit later." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { jobs, saved, user } = useStore();
  const savedJobs = jobs.filter((job) => saved.includes(job.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Saved jobs</h1>
      <p className="mt-2 text-muted-foreground">Bookmarks stay here until you apply or remove them.</p>

      {!user ? (
        <div className="mt-10 rounded-xl border border-border/70 p-10 text-center">
          <p className="text-muted-foreground">Sign in to keep a list of saved roles.</p>
          <Button className="mt-4" asChild>
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      ) : savedJobs.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          Nothing saved yet — tap the bookmark icon on any job.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {savedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}