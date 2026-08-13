import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompanies, useCreateCompany, useCreateJob, useJobs } from "@/lib/queries";

export const Route = createFileRoute("/recruiter/")({
  head: () => ({
    meta: [
      { title: "Recruiter dashboard — Job Hunt" },
      { name: "description", content: "Create companies, post roles and review applicants." },
      { property: "og:title", content: "Recruiter dashboard — Job Hunt" },
      { property: "og:description", content: "Create companies, post roles and review applicants." },
    ],
  }),
  component: RecruiterDashboard,
});

function RecruiterDashboard() {
  const { data: companies = [] } = useCompanies();
  const { data: jobs = [] } = useJobs();
  const { applicants } = useStore();
  const addCompany = useCreateCompany();
  const addJob = useCreateJob();

  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [companyAbout, setCompanyAbout] = useState("");

  const [jobTitle, setJobTitle] = useState("");
  const [jobCompanyId, setJobCompanyId] = useState(companies[0]?.id ?? "");
  const [jobLocation, setJobLocation] = useState("");
  const [jobSalary, setJobSalary] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTags, setJobTags] = useState("");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Recruiter dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Manage companies, publish openings and track who applied.
      </p>

      <Tabs defaultValue="jobs" className="mt-8">
        <TabsList>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="post">Post a job</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="mt-6 space-y-3">
          {jobs.map((job) => {
            const count = applicants.filter((applicant) => applicant.jobId === job.id).length;
            return (
              <div
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 p-4"
              >
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {job.company} · {job.location} · {job.jobType}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{count} applicants</Badge>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/recruiter/applicants/$jobId" params={{ jobId: job.id }}>
                      View applicants
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="companies" className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            {companies.map((company) => (
              <div key={company.id} className="rounded-lg border border-border/60 p-4">
                <p className="font-medium">{company.name}</p>
                <p className="text-sm text-muted-foreground">
                  {company.location} · {company.website}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{company.about}</p>
              </div>
            ))}
          </div>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>New company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="c-name">Name</Label>
                <Input
                  id="c-name"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-site">Website</Label>
                <Input
                  id="c-site"
                  value={companyWebsite}
                  onChange={(event) => setCompanyWebsite(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-loc">Location</Label>
                <Input
                  id="c-loc"
                  value={companyLocation}
                  onChange={(event) => setCompanyLocation(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-about">About</Label>
                <Textarea
                  id="c-about"
                  rows={3}
                  value={companyAbout}
                  onChange={(event) => setCompanyAbout(event.target.value)}
                />
              </div>
              <Button
                onClick={() => {
                  if (companyName.trim().length < 2) {
                    toast.error("Company name is required");
                    return;
                  }
                  addCompany.mutate(
                    {
                      name: companyName,
                      website: companyWebsite,
                      location: companyLocation,
                      about: companyAbout,
                    },
                    {
                      onSuccess: () => {
                        setCompanyName("");
                        setCompanyWebsite("");
                        setCompanyLocation("");
                        setCompanyAbout("");
                        toast.success("Company created");
                      },
                      onError: (error) => toast.error(error.message),
                    },
                  );
                }}
              >
                Create company
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="post" className="mt-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Post a job</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="j-title">Title</Label>
                <Input
                  id="j-title"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="j-company">Company</Label>
                <select
                  id="j-company"
                  value={jobCompanyId}
                  onChange={(event) => setJobCompanyId(event.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="j-loc">Location</Label>
                <Input
                  id="j-loc"
                  value={jobLocation}
                  onChange={(event) => setJobLocation(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="j-salary">Salary</Label>
                <Input
                  id="j-salary"
                  value={jobSalary}
                  onChange={(event) => setJobSalary(event.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="j-tags">Skills (comma separated)</Label>
                <Input
                  id="j-tags"
                  value={jobTags}
                  onChange={(event) => setJobTags(event.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="j-desc">Description</Label>
                <Textarea
                  id="j-desc"
                  rows={4}
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Button
                  onClick={() => {
                    const company = companies.find((item) => item.id === jobCompanyId);
                    if (!jobTitle.trim() || !company) {
                      toast.error("Title and company are required");
                      return;
                    }
                    addJob.mutate(
                      {
                        title: jobTitle,
                        companyName: company.name,
                        companyId: company.id,
                        location: jobLocation || company.location,
                        jobType: "Full-time",
                        salary: jobSalary || "Not disclosed",
                        experience: "2–4 years",
                        description: jobDescription,
                        requirements: [],
                        tags: jobTags
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      },
                      {
                        onSuccess: () => {
                          setJobTitle("");
                          setJobLocation("");
                          setJobSalary("");
                          setJobDescription("");
                          setJobTags("");
                          toast.success("Job published");
                        },
                        onError: (error) => toast.error(error.message),
                      },
                    );
                  }}
                >
                  Publish job
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}