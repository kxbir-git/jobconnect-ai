import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useStore } from "@/lib/store";
import { useJobs } from "@/lib/queries";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Job Hunt" },
      { name: "description", content: "Manage your bio, skills, resume link and applications." },
      { property: "og:title", content: "Your profile — Job Hunt" },
      { property: "og:description", content: "Manage your bio, skills, resume and applications." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, applied, updateProfile } = useStore();
  const { data: jobs = [] } = useJobs();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">You&apos;re signed out</h1>
        <p className="mt-2 text-muted-foreground">Sign in to view your profile.</p>
        <Button className="mt-6" asChild>
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold">{user.name}</h1>
      <p className="mt-1 text-muted-foreground">
        {user.email} · {user.role === "recruiter" ? "Recruiter" : "Job seeker"}
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <ProfileForm />
        <PasswordCard />
      </div>

      <Card className="mt-6 border-border/70">
        <CardHeader>
          <CardTitle>Applications ({applied.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {applied.length === 0 && (
            <p className="text-sm text-muted-foreground">You haven&apos;t applied to any jobs yet.</p>
          )}
          {jobs
            .filter((job) => applied.includes(job.id))
            .map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-4"
              >
                <div>
                  <Link
                    to="/jobs/$jobId"
                    params={{ jobId: job.id }}
                    className="font-medium hover:text-primary-glow"
                  >
                    {job.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {job.company} · {job.location}
                  </p>
                </div>
                <Badge variant="secondary">Submitted</Badge>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );

  function ProfileForm() {
    const [bio, setBio] = useState(user!.bio);
    const [skills, setSkills] = useState(user!.skills.join(", "));
    const [resumeUrl, setResumeUrl] = useState(user!.resumeUrl);

    return (
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              rows={4}
              onChange={(event) => setBio(event.target.value)}
              placeholder="A short intro for recruiters"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Input
              id="skills"
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
              placeholder="React, TypeScript, SQL"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resume">Resume link</Label>
            <Input
              id="resume"
              value={resumeUrl}
              onChange={(event) => setResumeUrl(event.target.value)}
              placeholder="https://drive.google.com/..."
            />
          </div>
          <Button
            onClick={() => {
              updateProfile({
                bio,
                resumeUrl,
                skills: skills
                  .split(",")
                  .map((skill) => skill.trim())
                  .filter(Boolean),
              });
              toast.success("Profile updated");
            }}
          >
            Save changes
          </Button>
        </CardContent>
      </Card>
    );
  }
}

function PasswordCard() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>Change password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <Button
          disabled={busy}
          onClick={() => {
            if (password.length < 6) {
              toast.error("Use a password of 6+ characters");
              return;
            }
            setBusy(true);
            void supabase.auth.updateUser({ password }).then(({ error }) => {
              setBusy(false);
              if (error) {
                toast.error(error.message);
                return;
              }
              setPassword("");
              toast.success("Password updated");
            });
          }}
        >
          Update password
        </Button>
      </CardContent>
    </Card>
  );
}