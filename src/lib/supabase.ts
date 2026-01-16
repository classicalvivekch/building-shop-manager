import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create Supabase client with service role for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

/**
 * Upload a file to Supabase Storage
 * @param file - The file buffer to upload
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadToSupabase(
    file: Buffer,
    bucket: string,
    path: string,
    contentType: string
): Promise<string> {
    const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(path, file, {
            contentType,
            upsert: true
        })

    if (error) {
        console.error('Supabase upload error:', error)
        throw new Error(`Failed to upload file: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(data.path)

    return urlData.publicUrl
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 */
export async function deleteFromSupabase(bucket: string, path: string): Promise<void> {
    const { error } = await supabaseAdmin.storage
        .from(bucket)
        .remove([path])

    if (error) {
        console.error('Supabase delete error:', error)
        throw new Error(`Failed to delete file: ${error.message}`)
    }
}
