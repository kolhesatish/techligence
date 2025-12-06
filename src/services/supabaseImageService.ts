import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with anon key for frontend operations
// IMPORTANT: Vite requires VITE_ prefix for client-side environment variables
// Your .env file must have: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase client initialized successfully');
} else {
  console.warn('⚠️ Supabase configuration missing for frontend!');
  console.warn('   Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  console.warn('   Image upload functionality will be disabled until configured.');
  console.warn('   Current env values:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseAnonKey?.length || 0
  });
}

/**
 * Upload image file to Supabase Storage (frontend)
 * @param {File} file - The image file to upload
 * @param {string} fileName - The name for the file (e.g., 'blog-123-1234567890.jpg')
 * @param {string} bucketName - The storage bucket name (default: 'blog-images')
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadBlogImageToSupabase = async (
  file: File,
  fileName: string,
  bucketName: string = 'blog-images'
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    if (!supabase || !supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase upload failed: Configuration missing', {
        hasSupabase: !!supabase,
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey
      });
      return {
        success: false,
        error: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file and restart the dev server.'
      };
    }

    console.log('📤 Uploading image to Supabase...', { fileName, bucketName, fileSize: file.size });

    // Upload to Supabase Storage
    const { data, error } = await supabase!.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('❌ Supabase upload error:', error);
      // Provide more helpful error messages
      let errorMessage = error.message || 'Failed to upload image to Supabase';
      if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
        errorMessage = `Bucket '${bucketName}' not found. Please create it in Supabase Storage (Dashboard > Storage > New Bucket).`;
      } else if (error.message?.includes('new row violates row-level security') || 
                 error.message?.includes('row-level security') ||
                 error.message?.includes('RLS') ||
                 error.message?.includes('policy')) {
        errorMessage = `Storage bucket RLS policy issue. The '${bucketName}' bucket needs RLS policies. Run the SQL in scripts/supabase-storage-policies.sql in your Supabase SQL Editor, or go to Storage > Policies > ${bucketName} and create policies for INSERT and SELECT operations.`;
      } else if (error.message?.includes('JWT') || error.message?.includes('token')) {
        errorMessage = 'Invalid Supabase key. Please check VITE_SUPABASE_ANON_KEY in your .env file.';
      } else if (error.message?.includes('permission denied') || error.message?.includes('Forbidden')) {
        errorMessage = `Permission denied. Check RLS policies for '${bucketName}' bucket. Allow public INSERT operations.`;
      }
      return {
        success: false,
        error: errorMessage
      };
    }

    // Get public URL
    const { data: urlData } = supabase!.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    console.log('✅ Image uploaded successfully:', urlData.publicUrl);
    return {
      success: true,
      url: urlData.publicUrl
    };
  } catch (error: any) {
    console.error('Error uploading image to Supabase:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred during upload'
    };
  }
};

/**
 * Generate a unique file name for blog images
 * @param {string} originalFileName - The original file name
 * @returns {string} - Unique file name with timestamp
 */
export const generateBlogImageFileName = (originalFileName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalFileName.split('.').pop() || 'jpg';
  return `blog-${timestamp}-${randomString}.${extension}`;
};

export default supabase;

