import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { HomePageImage, HomePageImageRow } from '../types';
import { mapHomePageImage, sanitizeStorageFileName } from '../utils/homepageImages';

const HOME_IMAGE_COLUMNS = 'id,title,image_url,storage_path,display_order';

export async function getHomePageImages() {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from('homepage_images')
    .select(HOME_IMAGE_COLUMNS)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapHomePageImage(row as HomePageImageRow));
}

export async function uploadHomePageImages(files: File[], currentCount: number) {
  if (!isSupabaseConfigured || !supabase) {
    return files.map((file, index) => ({
      id: `${file.name}-${crypto.randomUUID()}`,
      title: file.name.replace(/\.[^.]+$/, ''),
      url: URL.createObjectURL(file),
      displayOrder: currentCount + index,
    }));
  }

  const uploadedImages: HomePageImage[] = [];

  for (const file of files) {
    const storagePath = `homepage/${Date.now()}-${crypto.randomUUID()}-${sanitizeStorageFileName(file.name) || 'image'}`;
    const { error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(storagePath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = supabase.storage.from('site-assets').getPublicUrl(storagePath);
    const displayOrder = currentCount + uploadedImages.length;
    const { data, error } = await supabase
      .from('homepage_images')
      .insert({
        title: file.name.replace(/\.[^.]+$/, ''),
        image_url: publicUrlData.publicUrl,
        storage_path: storagePath,
        display_order: displayOrder,
        is_active: true,
      })
      .select(HOME_IMAGE_COLUMNS)
      .single();

    if (error || !data) {
      await supabase.storage.from('site-assets').remove([storagePath]);
      throw new Error(error?.message ?? 'Image record could not be saved.');
    }

    uploadedImages.push(mapHomePageImage(data as HomePageImageRow));
  }

  return uploadedImages;
}

export async function deleteHomePageImage(image: HomePageImage) {
  if (!isSupabaseConfigured || !supabase) return;

  const { error } = await supabase.from('homepage_images').delete().eq('id', image.id);
  if (error) throw new Error(error.message);

  if (image.storagePath) {
    await supabase.storage.from('site-assets').remove([image.storagePath]);
  }
}

export async function reorderHomePageImages(images: HomePageImage[]) {
  if (!isSupabaseConfigured || !supabase) return;

  const updates = images.map((image) =>
    supabase
      .from('homepage_images')
      .update({ display_order: image.displayOrder })
      .eq('id', image.id),
  );
  const results = await Promise.all(updates);
  const failedUpdate = results.find((result) => result.error);
  if (failedUpdate?.error) throw new Error(failedUpdate.error.message);
}
