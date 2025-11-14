import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Upload image to Supabase Storage
 * @param file File to upload
 * @param folder Folder name in storage bucket (default: 'gambar-produk')
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  folder: string = 'gambar-produk'
): Promise<string> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Delete image from Supabase Storage
 * @param imageUrl Full URL of the image to delete
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/storage/v1/object/public/images/');
    if (pathParts.length < 2) {
      console.error('Invalid image URL format');
      return;
    }
    
    const filePath = pathParts[1];

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
    }
  } catch (error) {
    console.error('Error parsing image URL:', error);
  }
}
