import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { type Role } from "@/lib/store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Job Hunt" },
      { name: "description", content: "Create a Job Hunt account or sign in with your email and password." },
      { property: "og:title", content: "Sign in — Job Hunt" },
      { property: "og:description", content: "Create an account or sign in with your email and password." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (mode === "signup" && name.trim().length < 2) {
      toast.error("Enter your name");
      return;
    }
    setBusy(true);
    const { error } =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { name: name.trim() || email.split("@")[0]!, role } },
          })
        : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("You're signed in");
    void navigate({ to: role === "recruiter" ? "/recruiter" : "/profile" });
  };

  return (
    <div className="hero-surface min-h-[calc(100vh-4rem)]">
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
        <h1 className="text-center text-3xl font-semibold">Welcome to Job Hunt</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sign in instantly — no email verification needed.
        </p>

        <Card className="mt-8 border-border/70">
          <CardContent className="p-6">
            <Tabs value={mode} onValueChange={(value) => setMode(value as "signin" | "signup")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Create account</TabsTrigger>
                </TabsList>

                <TabsContent value="signup" className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Aarav Mehta"
                    />
                  </div>
                </TabsContent>

                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="At least 6 characters"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>I am a</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["student", "recruiter"] as Role[]).map((option) => (
                        <Button
                          key={option}
                          type="button"
                          variant={role === option ? "default" : "outline"}
                          onClick={() => setRole(option)}
                        >
                          {option === "student" ? "Job seeker" : "Recruiter"}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" disabled={busy} onClick={() => void submit()}>
                    {mode === "signup" ? "Create account" : "Sign in"}
                  </Button>
                </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}