import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { type Role } from "@/lib/store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Job Hunt" },
      { name: "description", content: "Create a Job Hunt account or sign in with an email code." },
      { property: "og:title", content: "Sign in — Job Hunt" },
      { property: "og:description", content: "Create an account or sign in with an email code." },
    ],
  }),
  component: AuthPage,
});

type Step = "form" | "otp";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    if (!email.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }
    if (mode === "signup" && name.trim().length < 2) {
      toast.error("Enter your name");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: mode === "signup",
        data: { name: name.trim() || email.split("@")[0]!, role },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setStep("otp");
    toast.success(`Verification code sent to ${email}`);
  };

  const verify = async () => {
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
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
        <h1 className="text-center text-3xl font-semibold">
          {step === "otp" ? "Check your inbox" : "Welcome to Job Hunt"}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {step === "otp"
            ? `We sent a 6-digit code to ${email}.`
            : "One code, no passwords to remember."}
        </p>

        <Card className="mt-8 border-border/70">
          <CardContent className="p-6">
            {step === "form" ? (
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

                  <Button className="w-full" disabled={busy} onClick={() => void sendCode()}>
                    Send verification code
                  </Button>
                </div>
              </Tabs>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={code} onChange={setCode}>
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button className="w-full" disabled={busy} onClick={() => void verify()}>
                  Verify and continue
                </Button>
                <div className="flex justify-between text-sm">
                  <button
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setStep("form")}
                  >
                    Change email
                  </button>
                  <button className="text-primary-glow hover:underline" onClick={() => void sendCode()}>
                    Resend code
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}