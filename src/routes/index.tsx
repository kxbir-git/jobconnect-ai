import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "@/components/job-card";
import { useJobs } from "@/lib/queries";

const FILTERS = ["All", "Full-time", "Part-time", "Contract", "Internship"] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Job Hunt — Find your next role" },
      {
        name: "description",
        content:
          "Browse engineering, data and design roles, save favourites, and apply in a couple of clicks.",
      },
      { property: "og:title", content: "Job Hunt — Find your next role" },
      {
        property: "og:description",
        content: "Browse curated roles, save favourites, and apply in a couple of clicks.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: jobs = [], isLoading, isError } = useJobs();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesType = filter === "All" || job.jobType === filter;
      const matchesQuery =
        !q ||
        [job.title, job.company, job.location, ...job.tags]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesType && matchesQuery;
    });
  }, [jobs, query, filter]);

  return (
    <div>
      <section className="hero-surface border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <p className="text-sm font-medium tracking-wide text-primary-glow uppercase">
            {jobs.length} open roles this week
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl leading-tight font-semibold sm:text-6xl">
            Find the job that <span className="text-gradient">fits</span>, not just the one
            that&apos;s open.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Search roles from vetted teams, save the ones worth a second look, and track every
            application in one place.
          </p>

          <div className="relative mt-8 max-w-xl">
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, skill, company or city"
              className="h-13 rounded-full pl-11"
              aria-label="Search jobs"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((option) => (
            <button key={option} onClick={() => setFilter(option)}>
              <Badge
                variant={filter === option ? "default" : "outline"}
                className="cursor-pointer px-3 py-1"
              >
                {option}
              </Badge>
            </button>
          ))}
          <span className="ml-auto text-sm text-muted-foreground">
            {results.length} result{results.length === 1 ? "" : "s"}
          </span>
        </div>

        {isLoading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <p className="py-16 text-center text-muted-foreground">
            We couldn&apos;t load jobs right now. Please refresh and try again.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {results.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {!isLoading && !isError && results.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            No jobs match that search yet — try a different keyword.
          </p>
        )}
      </section>
    </div>
  );
}
