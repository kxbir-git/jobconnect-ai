CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'student',
  bio TEXT NOT NULL DEFAULT '',
  skills TEXT[] NOT NULL DEFAULT '{}',
  resume_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  about TEXT NOT NULL DEFAULT '',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.companies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "companies_public_read" ON public.companies FOR SELECT USING (true);
CREATE POLICY "companies_insert_own" ON public.companies FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "companies_update_own" ON public.companies FOR UPDATE TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY "companies_delete_own" ON public.companies FOR DELETE TO authenticated USING (auth.uid() = created_by);
CREATE TRIGGER companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  job_type TEXT NOT NULL DEFAULT 'Full-time',
  salary TEXT NOT NULL DEFAULT 'Not disclosed',
  experience TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  requirements TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs_public_read" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "jobs_insert_own" ON public.jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "jobs_update_own" ON public.jobs FOR UPDATE TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY "jobs_delete_own" ON public.jobs FOR DELETE TO authenticated USING (auth.uid() = created_by);
CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX jobs_created_at_idx ON public.jobs (created_at DESC);

CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_jobs TO authenticated;
GRANT ALL ON public.saved_jobs TO service_role;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_jobs_select_own" ON public.saved_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "saved_jobs_insert_own" ON public.saved_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_jobs_delete_own" ON public.saved_jobs FOR DELETE TO authenticated USING (auth.uid() = user_id);

INSERT INTO public.companies (id, name, website, location, about) VALUES
('11111111-1111-4111-8111-111111111111', 'Nimbus Labs', 'nimbuslabs.io', 'Bengaluru, IN', 'Cloud infrastructure tooling for fast-moving product teams.'),
('22222222-2222-4222-8222-222222222222', 'Northwind Analytics', 'northwind.dev', 'Remote', 'Data platform helping retailers forecast demand.'),
('33333333-3333-4333-8333-333333333333', 'Vertex Health', 'vertexhealth.com', 'Pune, IN', 'Digital care records for clinics and hospitals.');

INSERT INTO public.jobs (title, company_id, company_name, location, job_type, salary, experience, description, requirements, tags, created_at) VALUES
('Frontend Engineer', '11111111-1111-4111-8111-111111111111', 'Nimbus Labs', 'Bengaluru, IN', 'Full-time', '₹18–28 LPA', '2–4 years', 'Build the dashboard experience used by thousands of engineers to ship infrastructure. You will own features end to end, from design review through rollout.', ARRAY['Strong React and TypeScript fundamentals','Comfort with design systems and accessibility','Experience shipping to production weekly'], ARRAY['React','TypeScript','Tailwind'], now() - interval '2 days'),
('Backend Engineer (Node.js)', '11111111-1111-4111-8111-111111111111', 'Nimbus Labs', 'Remote', 'Full-time', '₹20–32 LPA', '3–6 years', 'Design APIs and background pipelines that keep customer clusters healthy. Expect deep work on reliability and performance.', ARRAY['Node.js and REST API design','Postgres or Mongo at scale','Observability mindset'], ARRAY['Node.js','APIs','Databases'], now() - interval '4 days'),
('Data Analyst', '22222222-2222-4222-8222-222222222222', 'Northwind Analytics', 'Remote', 'Contract', '₹80k–1.2L / month', '1–3 years', 'Turn messy retail data into forecasts merchandisers actually trust. You will partner directly with customer success.', ARRAY['SQL fluency','Python or R','Clear written communication'], ARRAY['SQL','Python','Forecasting'], now() - interval '7 days'),
('Product Designer', '22222222-2222-4222-8222-222222222222', 'Northwind Analytics', 'Hyderabad, IN', 'Full-time', '₹16–24 LPA', '3–5 years', 'Own the end-to-end design of our forecasting workspace, from research to polished interface specs.', ARRAY['Portfolio of shipped B2B work','Systems thinking','Prototyping skills'], ARRAY['Figma','B2B','Design Systems'], now() - interval '3 days'),
('QA Automation Intern', '33333333-3333-4333-8333-333333333333', 'Vertex Health', 'Pune, IN', 'Internship', '₹35k / month', '0–1 years', 'Join the quality team and help automate regression suites for our clinical records product.', ARRAY['Basic JavaScript','Curiosity about testing','Attention to detail'], ARRAY['Testing','Playwright','JavaScript'], now()),
('Full Stack Engineer', '33333333-3333-4333-8333-333333333333', 'Vertex Health', 'Pune, IN', 'Full-time', '₹15–26 LPA', '2–5 years', 'Work across React and Node to deliver features that clinicians rely on every single day.', ARRAY['React + Node experience','Understanding of auth and RBAC','Care for data privacy'], ARRAY['React','Node.js','MongoDB'], now() - interval '5 days'),
('DevOps Engineer', '11111111-1111-4111-8111-111111111111', 'Nimbus Labs', 'Remote', 'Part-time', '₹1.5L / month', '4+ years', 'Keep our deploy pipelines fast and boring. Own CI/CD, infra as code, and incident tooling.', ARRAY['Terraform','Kubernetes','CI/CD pipelines'], ARRAY['Kubernetes','Terraform','CI/CD'], now() - interval '7 days');