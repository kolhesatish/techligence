// services/supabaseService.js
// Fully featured safe Supabase service for local dev.
// Exports:
//   - default: supabaseClient
//   - uploadImageToSupabase(bucket, path, file, options)
//   - deleteImageFromSupabase(bucket, path)
//   - uploadResumeToSupabase(bucket, path, file, options)
//   - getPublicUrl(bucket, path)
// If SUPABASE_URL / SERVICE_ROLE_SUPABASE are missing, functions return safe stub responses.

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SERVICE_ROLE_SUPABASE;

let supabaseClient = null;
let supabaseConfigured = false;

if (SUPABASE_URL && SERVICE_ROLE) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE);
    supabaseConfigured = true;
    console.log('Supabase client initialized.');
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    supabaseClient = null;
    supabaseConfigured = false;
  }
} else {
  console.warn('Supabase not configured (SUPABASE_URL or SERVICE_ROLE_SUPABASE missing). Using stub.');
  // Minimal stub to avoid crashes
  supabaseClient = {
    from: () => ({ select: async () => ({ data: null, error: null }) }),
    auth: { signIn: async () => ({ data: null, error: null }) },
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: new Error('Supabase not configured') }),
        remove: async () => ({ data: null, error: new Error('Supabase not configured') }),
        createBucket: async () => ({ data: null, error: new Error('Supabase not configured') }),
        list: async () => ({ data: null, error: new Error('Supabase not configured') }),
        getPublicUrl: (path) => ({ publicUrl: null }),
      }),
    },
  };
}

/**
 * normalizeFileForUpload(file)
 * Accepts:
 *  - a string (local file path)
 *  - an object (Multer file) with .buffer, .path, .originalname
 *  - a Buffer / Stream
 * Returns: { body, filename } where body is Buffer/Stream and filename is string (used when needed)
 */
function normalizeFileForUpload(file) {
  if (!file) return { body: null, filename: null };

  // If multer file object (has buffer)
  if (file.buffer) {
    const filename = file.originalname || `file-${Date.now()}`;
    return { body: file.buffer, filename };
  }

  // If path string to local file
  if (typeof file === 'string') {
    const filename = file.split(/[\\/]/).pop();
    const stream = fs.createReadStream(file);
    return { body: stream, filename };
  }

  // If Buffer
  if (Buffer.isBuffer(file)) {
    const filename = `file-${Date.now()}`;
    return { body: file, filename };
  }

  // If it's already a stream
  if (file.readable) {
    const filename = file.filename || `file-${Date.now()}`;
    return { body: file, filename };
  }

  // otherwise fallback
  return { body: file, filename: file?.originalname || `file-${Date.now()}` };
}

/**
 * uploadImageToSupabase(bucket, path, file, options)
 */
export async function uploadImageToSupabase(bucket, path, file, options = { upsert: true }) {
  if (!supabaseConfigured) {
    return { data: null, error: { message: 'Supabase not configured', code: 'SUPABASE_NOT_CONFIGURED' } };
  }

  try {
    const { body } = normalizeFileForUpload(file);
    if (!body) return { data: null, error: new Error('No file provided') };

    const storage = supabaseClient.storage.from(bucket);
    const result = await storage.upload(path, body, options);

    if (result?.error) return { data: null, error: result.error };
    return { data: result?.data ?? null, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * deleteImageFromSupabase(bucket, path)
 */
export async function deleteImageFromSupabase(bucket, path) {
  if (!supabaseConfigured) {
    return { data: null, error: { message: 'Supabase not configured', code: 'SUPABASE_NOT_CONFIGURED' } };
  }

  try {
    const storage = supabaseClient.storage.from(bucket);
    // supabase-js remove accepts array of paths
    const result = await storage.remove([path]);
    if (result?.error) return { data: null, error: result.error };
    return { data: result?.data ?? null, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * uploadResumeToSupabase(bucket, path, file, options)
 * For resumes we can reuse image upload logic — exported separately because routes import it by name.
 */
export async function uploadResumeToSupabase(bucket, path, file, options = { upsert: true }) {
  // simply delegate to uploadImageToSupabase (semantic alias)
  return uploadImageToSupabase(bucket, path, file, options);
}

/**
 * getPublicUrl(bucket, path)
 */
export function getPublicUrl(bucket, path) {
  if (!supabaseConfigured) {
    return { data: null, error: { message: 'Supabase not configured', code: 'SUPABASE_NOT_CONFIGURED' } };
  }

  try {
    // For supabase-js v2: storage.from(bucket).getPublicUrl(path)
    const res = supabaseClient.storage.from(bucket).getPublicUrl(path);
    // res may be { data: { publicUrl }, error }
    return { data: res?.data ?? null, error: res?.error ?? null };
  } catch (err) {
    return { data: null, error: err };
  }
}

export default supabaseClient;
