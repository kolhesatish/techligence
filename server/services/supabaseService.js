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

export default supabase;

