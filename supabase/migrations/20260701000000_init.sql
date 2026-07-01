-- Create assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coachee_name TEXT NOT NULL,
    coachee_email TEXT NOT NULL,
    stage TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Chờ nhận xét',
    scores JSONB NOT NULL, -- stores { L, P, I, S }
    answers JSONB NOT NULL, -- stores { q1_q12, q13_opts, q13_reason, q14_opts, q14_reason, q15_commitment, q15_reason }
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create coach_reviews table
CREATE TABLE IF NOT EXISTS public.coach_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL UNIQUE REFERENCES public.assessments(id) ON DELETE CASCADE,
    coach_id UUID DEFAULT auth.uid(),
    q13_stars INT NOT NULL CHECK (q13_stars BETWEEN 1 AND 3),
    q14_stars INT NOT NULL CHECK (q14_stars BETWEEN 1 AND 3),
    q15_stars INT NOT NULL CHECK (q15_stars BETWEEN 1 AND 3),
    feedback TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_reviews ENABLE ROW LEVEL SECURITY;

-- Policies for assessments table
-- 1. Anyone (public coachee) can insert their assessment
CREATE POLICY "Allow public insert" 
ON public.assessments 
FOR INSERT 
TO public 
WITH CHECK (true);

-- 2. Anyone can select (read) assessments (required for mock login)
CREATE POLICY "Allow public select" 
ON public.assessments 
FOR SELECT 
TO public 
USING (true);

-- 3. Anyone can update assessments (e.g. status)
CREATE POLICY "Allow public update" 
ON public.assessments 
FOR UPDATE 
TO public 
USING (true)
WITH CHECK (true);

-- Policies for coach_reviews table
-- 1. Anyone can perform actions (CRUD) on reviews
CREATE POLICY "Allow public manage reviews" 
ON public.coach_reviews 
FOR ALL 
TO public 
USING (true)
WITH CHECK (true);
