-- =========================================================================
-- SYSTEM MIGRATION & RECREATION SCRIPT FOR CLOASTA WAITLIST
-- =========================================================================

CREATE TABLE IF NOT EXISTS cloasta_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'general',
  source TEXT DEFAULT 'direct',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cloasta_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_insert" ON cloasta_waitlist;
DROP POLICY IF EXISTS "allow_select" ON cloasta_waitlist;
DROP POLICY IF EXISTS "allow public insert" ON cloasta_waitlist;
DROP POLICY IF EXISTS "allow public select" ON cloasta_waitlist;
DROP POLICY IF EXISTS "anyone can join" ON cloasta_waitlist;
DROP POLICY IF EXISTS "public count" ON cloasta_waitlist;
DROP POLICY IF EXISTS "Allow anonymous inserts to waitlist" ON cloasta_waitlist;
DROP POLICY IF EXISTS "Allow anonymous select from waitlist" ON cloasta_waitlist;
DROP POLICY IF EXISTS "Restrict select to authenticated users" ON cloasta_waitlist;

CREATE POLICY "allow_insert"
ON cloasta_waitlist
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "allow_select"
ON cloasta_waitlist
FOR SELECT
TO anon
USING (true);
