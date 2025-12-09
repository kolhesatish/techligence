# Supabase Storage Setup for Blog Images

## Quick Setup Guide

### Step 1: Create the Storage Bucket

1. Go to your Supabase Dashboard: https://kkfqgceuoaovwfwewxof.supabase.co
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Enter bucket name: `blog-images`
5. Check **Public bucket** (this allows public access to images)
6. Click **Create bucket**

### Step 2: Set Up RLS Policies

You have two options:

#### Option A: Using SQL Editor (Recommended)

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy and paste the SQL from `scripts/supabase-storage-policies.sql`
4. Click **Run** (or press Ctrl+Enter)

#### Option B: Using Policy Editor

1. Go to **Storage** > **Policies**
2. Select the `blog-images` bucket
3. Click **New Policy**

**Policy 1: Allow Public Uploads**
- Policy name: `Allow public uploads to blog-images`
- Allowed operation: `INSERT`
- Target roles: `public`
- Policy definition: `bucket_id = 'blog-images'`
- With check expression: `bucket_id = 'blog-images'`

**Policy 2: Allow Public Reads**
- Policy name: `Allow public reads from blog-images`
- Allowed operation: `SELECT`
- Target roles: `public`
- Policy definition: `bucket_id = 'blog-images'`
- Using expression: `bucket_id = 'blog-images'`

### Step 3: Verify Setup

After setting up the policies, try uploading an image in the blog editor. It should work now!

## Troubleshooting

### Error: "new row violates row-level security"
- **Solution**: Make sure you've created the INSERT policy for the `blog-images` bucket
- Check that the policy target is `public` (not `authenticated`)

### Error: "Bucket not found"
- **Solution**: Create the bucket first (Step 1 above)
- Make sure the bucket name is exactly `blog-images`

### Error: "Permission denied"
- **Solution**: Check that both INSERT and SELECT policies exist
- Verify the bucket is set to **Public**

### Images upload but can't be viewed
- **Solution**: Make sure the SELECT policy exists
- Verify the bucket is set to **Public**

## SQL Commands Reference

If you prefer to run SQL directly, use these commands:

```sql
-- Allow public uploads
DROP POLICY IF EXISTS "Allow public uploads to blog-images" ON storage.objects;
CREATE POLICY "Allow public uploads to blog-images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'blog-images');

-- Allow public reads
DROP POLICY IF EXISTS "Allow public reads from blog-images" ON storage.objects;
CREATE POLICY "Allow public reads from blog-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-images');
```






