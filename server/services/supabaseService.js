import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SERVICE_ROLE_SUPABASE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase configuration missing!');
  console.error('   Please set SUPABASE_URL and SERVICE_ROLE_SUPABASE in your .env file');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Upload image file to Supabase Storage
 * @param {File|Buffer} file - The image file to upload
 * @param {string} fileName - The name for the file (e.g., 'product-123-1234567890.jpg')
 * @param {string} bucketName - The storage bucket name (default: 'product-images')
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadImageToSupabase = async (file, fileName, bucketName = 'product-images') => {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    // Multer provides file with buffer property
    let fileBuffer;
    if (file.buffer) {
      // Multer memory storage provides buffer directly
      fileBuffer = file.buffer;
    } else if (file instanceof Buffer) {
      fileBuffer = file;
    } else {
      throw new Error('Invalid file format. Expected multer file object with buffer property.');
    }

    // Determine content type from multer file object
    const contentType = file.mimetype || 'image/jpeg';
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: contentType,
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload image to Supabase'
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Error uploading image to Supabase:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred during upload'
    };
  }
};

/**
 * Delete image from Supabase Storage
 * @param {string} filePath - The path to the file in storage
 * @param {string} bucketName - The storage bucket name (default: 'product-images')
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteImageFromSupabase = async (filePath, bucketName = 'product-images') => {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete image from Supabase'
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting image from Supabase:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred during deletion'
    };
  }
};

/**
 * Ensure a Supabase storage bucket exists, create it if it doesn't
 * @param {string} bucketName - The bucket name to check/create
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const ensureBucketExists = async (bucketName) => {
  try {
    // Check if bucket exists by trying to list it
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return { success: false, error: listError.message };
    }

    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true, // Make bucket public so files can be accessed
        fileSizeLimit: 10485760, // 10MB limit
        allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      });

      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
        return { success: false, error: createError.message };
      }

      console.log(`Bucket ${bucketName} created successfully`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload resume file to Supabase Storage
 * @param {File|Buffer} file - The resume file to upload
 * @param {string} fileName - The name for the file (e.g., 'resume-123-1234567890.pdf')
 * @param {string} bucketName - The storage bucket name (default: 'resumes')
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadResumeToSupabase = async (file, fileName, bucketName = 'resumes') => {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    // Ensure bucket exists before uploading
    const bucketCheck = await ensureBucketExists(bucketName);
    if (!bucketCheck.success) {
      // If bucket creation fails, try using product-images bucket as fallback
      console.warn(`Failed to ensure ${bucketName} bucket exists, trying product-images as fallback`);
      const fallbackBucket = 'product-images';
      const fallbackCheck = await ensureBucketExists(fallbackBucket);
      if (!fallbackCheck.success) {
        return {
          success: false,
          error: `Failed to access storage buckets. Please create a '${bucketName}' or '${fallbackBucket}' bucket in Supabase Storage.`
        };
      }
      // Use fallback bucket
      bucketName = fallbackBucket;
    }

    // Multer provides file with buffer property
    let fileBuffer;
    if (file.buffer) {
      // Multer memory storage provides buffer directly
      fileBuffer = file.buffer;
    } else if (file instanceof Buffer) {
      fileBuffer = file;
    } else {
      throw new Error('Invalid file format. Expected multer file object with buffer property.');
    }

    // Determine content type from multer file object
    const contentType = file.mimetype || 'application/pdf';
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: contentType,
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('Supabase resume upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload resume to Supabase'
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path
    };
  } catch (error) {
    console.error('Error uploading resume to Supabase:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred during upload'
    };
  }
};

export default supabase;

