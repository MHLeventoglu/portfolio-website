import { supabase } from './supabase'

const BUCKET = 'images'

/**
 * Upload an image to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} path - Storage path (e.g. "profile/avatar" or "blog/my-post")
 * @returns {Promise<string>} Public URL of the uploaded image
 */
export async function uploadImage(file, path) {
  if (!supabase) throw new Error('Supabase is not configured')

  // Determine file extension
  const ext = file.name.split('.').pop()
  const fullPath = `${path}.${ext}`

  // Upload (upsert to overwrite if exists)
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fullPath, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) throw error

  // Return public URL
  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fullPath)

  // Append cache-busting timestamp
  return `${data.publicUrl}?t=${Date.now()}`
}

/**
 * Delete an image from Supabase Storage
 * @param {string} url - The full public URL of the image
 */
export async function deleteImage(url) {
  if (!supabase || !url) return

  // Extract the path from the public URL
  // URL format: https://<project>.supabase.co/storage/v1/object/public/images/<path>
  try {
    const urlObj = new URL(url.split('?')[0]) // strip query params
    const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${BUCKET}/`)
    if (pathParts.length < 2) return

    const filePath = pathParts[1]
    await supabase.storage.from(BUCKET).remove([filePath])
  } catch {
    console.warn('Could not delete image:', url)
  }
}
