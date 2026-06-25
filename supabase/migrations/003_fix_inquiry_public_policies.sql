-- Fix policies for ba_owner_inquiries and ba_booking_inquiries
-- Change from anon-only to public to support both anonymous and logged-in Google users.

-- ba_owner_inquiries
DROP POLICY IF EXISTS "Allow anonymous inserts" ON "public"."ba_owner_inquiries";
DROP POLICY IF EXISTS "Allow public select on owner inquiries" ON "public"."ba_owner_inquiries";
DROP POLICY IF EXISTS "Allow public inserts on owner inquiries" ON "public"."ba_owner_inquiries";

CREATE POLICY "Allow public inserts on owner inquiries" 
ON "public"."ba_owner_inquiries"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public select on owner inquiries" 
ON "public"."ba_owner_inquiries"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- ba_booking_inquiries
DROP POLICY IF EXISTS "Allow anonymous inserts" ON "public"."ba_booking_inquiries";
DROP POLICY IF EXISTS "Allow public select on booking inquiries" ON "public"."ba_booking_inquiries";
DROP POLICY IF EXISTS "Allow public inserts on booking inquiries" ON "public"."ba_booking_inquiries";

CREATE POLICY "Allow public inserts on booking inquiries" 
ON "public"."ba_booking_inquiries"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public select on booking inquiries" 
ON "public"."ba_booking_inquiries"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- ba_villa_assessments
DROP POLICY IF EXISTS "Allow anonymous inserts" ON "public"."ba_villa_assessments";
DROP POLICY IF EXISTS "Allow public select on villa assessments" ON "public"."ba_villa_assessments";
DROP POLICY IF EXISTS "Allow public inserts on villa assessments" ON "public"."ba_villa_assessments";

CREATE POLICY "Allow public inserts on villa assessments" 
ON "public"."ba_villa_assessments"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public select on villa assessments" 
ON "public"."ba_villa_assessments"
AS PERMISSIVE FOR SELECT
TO public
USING (true);
