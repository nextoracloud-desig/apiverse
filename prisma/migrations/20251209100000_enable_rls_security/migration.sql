-- Enable RLS on specific tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserApiKey" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApiView" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApiUsageMetric" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApiLockInScore" ENABLE ROW LEVEL SECURITY;

-- Policy: User (Users can read/update their own profile)
-- Note: 'id' is the primary key of User, matching auth.uid()
CREATE POLICY "Users can read own data" ON "User" FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own data" ON "User" FOR UPDATE USING (auth.uid()::text = id);
-- Insert is usually handled by Service Role (NextAuth adapter), but if needed:
-- CREATE POLICY "Users can insert own data" ON "User" FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Policy: Session (Users can read/delete their own sessions)
CREATE POLICY "Users can read own sessions" ON "Session" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own sessions" ON "Session" FOR DELETE USING (auth.uid()::text = "userId");

-- Policy: UserApiKey (Strict ownership)
CREATE POLICY "Users can read own api keys" ON "UserApiKey" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can create own api keys" ON "UserApiKey" FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own api keys" ON "UserApiKey" FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own api keys" ON "UserApiKey" FOR DELETE USING (auth.uid()::text = "userId");

-- Policy: ApiView (Users can read their own history)
CREATE POLICY "Users can read own history" ON "ApiView" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own history" ON "ApiView" FOR INSERT WITH CHECK (auth.uid()::text = "userId");

-- Policy: VerificationToken (Sensitive, Service Role Only)
-- We DENY all access to public/authenticated users. Only Postgres/Service Role can access.
CREATE POLICY "Deny public access" ON "VerificationToken" FOR ALL USING (false);

-- Policy: ApiUsageMetric (Internal, Service Role Only)
CREATE POLICY "Deny public access" ON "ApiUsageMetric" FOR ALL USING (false);

-- Policy: ApiLockInScore (Internal, Service Role Only)
CREATE POLICY "Deny public access" ON "ApiLockInScore" FOR ALL USING (false);

-- Note: Tables like "Api", "Post", "Comment" remain public (RLS disabled) as requested.
