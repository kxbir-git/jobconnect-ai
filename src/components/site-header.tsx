import { Link, useNavigate } from "@tanstack/react-router";
import { Briefcase, Bookmark, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export function SiteHeader() {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="size-4" />
          </span>
          <span className="font-display text-lg font-semibold">Job Hunt</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm sm:flex">
          <Link
            to="/"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
            activeOptions={{ exact: true }}
          >
            Jobs
          </Link>
          <Link
            to="/saved"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Saved
          </Link>
          <Link
            to="/recruiter"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Recruiter
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/saved" aria-label="Saved jobs">
                  <Bookmark className="size-4" />
                </Link>
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <Link to="/profile">
                  <UserIcon className="size-4" />
                  {user.name.split(" ")[0]}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Log out"
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
              >
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}