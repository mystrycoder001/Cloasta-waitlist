-- =========================================================================
-- SYSTEM MIGRATION & RECREATION SCRIPT FOR CLOASTA WAITLIST
-- =========================================================================

-- OPTION 1: COMPLETE RECREATION (Use this if you are setting up fresh)
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS public.cloasta_waitlist CASCADE;

CREATE TABLE public.cloasta_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    source TEXT,
    position BIGINT GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.cloasta_waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert waitlist signups
CREATE POLICY "Allow anonymous inserts to waitlist" 
ON public.cloasta_waitlist 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow anonymous users to select (required for returning the position on insert)
CREATE POLICY "Allow anonymous select from waitlist"
ON public.cloasta_waitlist
FOR SELECT
TO anon
USING (true);

-- Restrict read/update/delete to authenticated admins
CREATE POLICY "Restrict select to authenticated users" 
ON public.cloasta_waitlist 
FOR ALL
TO authenticated 
USING (true);


-- -------------------------------------------------------------------------
-- OPTION 2: SAFE NON-DESTRUCTIVE MIGRATION (Use this if you have existing signups)
-- -------------------------------------------------------------------------
-- ALTER TABLE public.cloasta_waitlist ADD COLUMN IF NOT EXISTS position BIGINT GENERATED ALWAYS AS IDENTITY;
-- DROP POLICY IF EXISTS "Restrict select to authenticated users" ON public.cloasta_waitlist;
-- CREATE POLICY "Allow anonymous select from waitlist" ON public.cloasta_waitlist FOR SELECT TO anon USING (true);
