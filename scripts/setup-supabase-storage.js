/**
 * Script to set up Supabase Storage bucket and policies for blog images
 * Run this with: node scripts/setup-supabase-storage.js
 * 
 * Make sure you have SUPABASE_URL and SERVICE_ROLE_SUPABASE in your server/.env file
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: join(__dirname, '../server/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SERVICE_ROLE_SUPABASE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('   Please set SUPABASE_URL and SERVICE_ROLE_SUPABASE in server/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const BUCKET_NAME = 'blog-images';

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage for blog images...\n');

  try {
    // Step 1: Check if bucket exists
    console.log('1. Checking if bucket exists...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);

    if (!bucketExists) {
      console.log(`   Bucket '${BUCKET_NAME}' not found. Creating...`);
      const { data: bucket, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
      });

      if (createError) {
        throw new Error(`Failed to create bucket: ${createError.message}`);
      }
      console.log(`   ✅ Bucket '${BUCKET_NAME}' created successfully!`);
    } else {
      console.log(`   ✅ Bucket '${BUCKET_NAME}' already exists.`);
    }

    // Step 2: Set up RLS policies
    console.log('\n2. Setting up RLS policies...');
    console.log('   Note: RLS policies need to be set manually in Supabase Dashboard.');
    console.log('   Go to: Storage > Policies > blog-images');
    console.log('\n   Create these policies:\n');
    
    console.log('   📤 Policy 1: Allow Public Uploads');
    console.log('   - Policy name: Allow public uploads');
    console.log('   - Allowed operation: INSERT');
    console.log('   - Policy definition:');
    console.log('     (bucket_id = \'blog-images\')');
    console.log('   - With check: true\n');

    console.log('   📥 Policy 2: Allow Public Reads');
    console.log('   - Policy name: Allow public reads');
    console.log('   - Allowed operation: SELECT');
    console.log('   - Policy definition:');
    console.log('     (bucket_id = \'blog-images\')');
    console.log('   - With check: true\n');

    console.log('   🗑️ Policy 3: Allow Public Deletes (optional)');
    console.log('   - Policy name: Allow public deletes');
    console.log('   - Allowed operation: DELETE');
    console.log('   - Policy definition:');
    console.log('     (bucket_id = \'blog-images\')');
    console.log('   - With check: true\n');

    console.log('   OR use this SQL in Supabase SQL Editor:\n');
    console.log(`   -- Allow public uploads
    CREATE POLICY "Allow public uploads" ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (bucket_id = '${BUCKET_NAME}');

    -- Allow public reads
    CREATE POLICY "Allow public reads" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = '${BUCKET_NAME}');

    -- Allow public deletes (optional)
    CREATE POLICY "Allow public deletes" ON storage.objects
    FOR DELETE
    TO public
    USING (bucket_id = '${BUCKET_NAME}');\n`);

    console.log('✅ Setup instructions displayed above.');
    console.log('\n📝 Next steps:');
    console.log('   1. Go to your Supabase Dashboard');
    console.log('   2. Navigate to Storage > Policies');
    console.log('   3. Select the blog-images bucket');
    console.log('   4. Click "New Policy" and create the policies above');
    console.log('   OR run the SQL commands in the SQL Editor\n');

  } catch (error) {
    console.error('❌ Error setting up storage:', error.message);
    process.exit(1);
  }
}

setupStorage();






