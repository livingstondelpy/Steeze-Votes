import { supabase, isSupabaseConfigured } from './supabase';

export type StorageBucket = 'contest-banners' | 'nominee-photos' | 'organizer-avatars' | 'sponsor-logos';

/**
 * Generate a safe unique filename preserving extension.
 */
function sanitizeFilename(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanBase = originalName
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);
  return `${Date.now()}_${cleanBase}.${ext}`;
}

/**
 * Upload an asset to Supabase Storage enforcing folder path conventions:
 * - Banners, Nominees, Sponsor logos: `{contest_id}/{filename}`
 * - Organizer avatars: `{auth_uid}/{filename}`
 */
export async function uploadAssetToStorage(params: {
  bucket: StorageBucket;
  file: File | Blob;
  originalFileName?: string;
  folderId: string; // contestId for banners/nominees/sponsors, or organizerAuthUid for avatars
}): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  const { bucket, file, originalFileName = 'upload.jpg', folderId } = params;

  if (!isSupabaseConfigured()) {
    // If Supabase not configured in preview, create object URL or base64 fallback
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ success: true, publicUrl: reader.result as string });
      reader.onerror = () => resolve({ success: false, error: 'Could not read file locally.' });
      reader.readAsDataURL(file);
    });
  }

  try {
    const filename = sanitizeFilename(originalFileName);
    // Strict path structure matching Supabase storage RLS policies:
    const storagePath = `${folderId}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg',
      });

    if (uploadError) {
      console.error(`Storage upload error to ${bucket}/${storagePath}:`, uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    return {
      success: true,
      publicUrl: urlData.publicUrl,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Storage upload failed.' };
  }
}

export async function uploadContestBanner(file: File, contestId: string) {
  return uploadAssetToStorage({
    bucket: 'contest-banners',
    file,
    originalFileName: file.name,
    folderId: contestId,
  });
}

export async function uploadNomineePhoto(file: File, contestId: string) {
  return uploadAssetToStorage({
    bucket: 'nominee-photos',
    file,
    originalFileName: file.name,
    folderId: contestId,
  });
}

export async function uploadSponsorLogo(file: File, contestId: string) {
  return uploadAssetToStorage({
    bucket: 'sponsor-logos',
    file,
    originalFileName: file.name,
    folderId: contestId,
  });
}

export async function uploadOrganizerAvatar(file: File, organizerUid: string) {
  return uploadAssetToStorage({
    bucket: 'organizer-avatars',
    file,
    originalFileName: file.name,
    folderId: organizerUid,
  });
}
