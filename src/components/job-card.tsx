import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, MapPin, Clock, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Job } from "@/lib/mock-data";
import { useStore } from "@/lib/store";

export function JobCard({ job }: { job: Job }) {
  const { saved, user, toggleSaved } = useStore();
  const isSaved = saved.includes(job.id);

  return (
    <Card className="group border-border/70 bg-card/70 transition-colors hover:border-primary/60">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              to="/jobs/$jobId"
              params={{ jobId: job.id }}
              className="font-display text-lg font-semibold text-foreground hover:text-primary-glow"
            >
              {job.title}
            </Link>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={isSaved ? "Remove from saved" : "Save job"}
            onClick={() => {
              if (!user) {
                toast.error("Sign in to save jobs");
                return;
              }
              const nowSaved = toggleSaved(job.id);
              toast.success(nowSaved ? "Saved for later" : "Removed from saved");
            }}
          >
            {isSaved ? (
              <BookmarkCheck className="size-4 text-primary-glow" />
            ) : (
              <Bookmark className="size-4" />
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" /> {job.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <IndianRupee className="size-3" /> {job.salary}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" /> {job.postedAt}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{job.jobType}</Badge>
          {job.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}