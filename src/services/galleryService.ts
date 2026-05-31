import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { GalleryAlbum, GalleryImage } from '../types';
import { sanitizeStorageFileName } from '../utils/homepageImages';

type GalleryAlbumRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  is_public: boolean;
  display_order: number;
};

type GalleryImageRow = {
  id: string;
  album_id: string;
  title: string;
  alt_text: string | null;
  image_url: string;
  storage_path: string | null;
  is_featured: boolean;
  display_order: number;
};

const ALBUM_COLUMNS = 'id,title,slug,description,cover_image_url,is_public,display_order';
const IMAGE_COLUMNS = 'id,album_id,title,alt_text,image_url,storage_path,is_featured,display_order';

function createSlug(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || `album-${Date.now()}`;
}

function mapGalleryImage(row: GalleryImageRow): GalleryImage {
  return {
    id: row.id,
    title: row.title,
    alt: row.alt_text || row.title,
    url: row.image_url,
    storagePath: row.storage_path || undefined,
    displayOrder: row.display_order,
    isFeatured: row.is_featured,
  };
}

function mapGalleryAlbum(row: GalleryAlbumRow, images: GalleryImageRow[]): GalleryAlbum {
  const photos = images.map(mapGalleryImage);
  const headingImageUrls = photos
    .filter((photo) => photo.isFeatured)
    .slice(0, 3)
    .map((photo) => photo.url);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description || '',
    cover: row.cover_image_url || photos[0]?.url || '',
    displayOrder: row.display_order,
    isPublic: row.is_public,
    headingImageUrls,
    photos,
  };
}

export async function getGalleryAlbums() {
  if (!isSupabaseConfigured || !supabase) return [];

  const [albumsResult, imagesResult] = await Promise.all([
    supabase
      .from('gallery_albums')
      .select(ALBUM_COLUMNS)
      .order('display_order', { ascending: true }),
    supabase
      .from('gallery_images')
      .select(IMAGE_COLUMNS)
      .order('display_order', { ascending: true }),
  ]);

  if (albumsResult.error) throw new Error(albumsResult.error.message);
  if (imagesResult.error) throw new Error(imagesResult.error.message);

  const images = (imagesResult.data ?? []) as GalleryImageRow[];
  return ((albumsResult.data ?? []) as GalleryAlbumRow[]).map((album) =>
    mapGalleryAlbum(
      album,
      images.filter((image) => image.album_id === album.id),
    ),
  );
}

async function uploadGalleryImage(albumSlug: string, file: File) {
  if (!supabase) throw new Error('Supabase is not configured.');

  const storagePath = `gallery/${albumSlug}/${Date.now()}-${crypto.randomUUID()}-${sanitizeStorageFileName(file.name) || 'image'}`;
  const { error: uploadError } = await supabase.storage
    .from('site-assets')
    .upload(storagePath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from('site-assets').getPublicUrl(storagePath);
  return {
    publicUrl: data.publicUrl,
    storagePath,
  };
}

export async function saveGalleryAlbums(albums: GalleryAlbum[]) {
  if (!isSupabaseConfigured || !supabase) {
    return albums.map((album, albumIndex) => ({
      ...album,
      displayOrder: albumIndex,
      photos: album.photos.map((photo, photoIndex) => ({
        ...photo,
        displayOrder: photoIndex,
        isFeatured: album.headingImageUrls?.includes(photo.url) ?? false,
      })),
    }));
  }

  for (const [albumIndex, album] of albums.entries()) {
    const albumSlug = album.slug || createSlug(album.title);
    const albumPayload = {
      title: album.title.trim() || 'Untitled Album',
      slug: albumSlug,
      description: album.description || null,
      is_public: album.isPublic ?? true,
      display_order: albumIndex,
      updated_at: new Date().toISOString(),
    };

    const albumQuery = album.id
      ? supabase.from('gallery_albums').update(albumPayload).eq('id', album.id).select(ALBUM_COLUMNS).single()
      : supabase.from('gallery_albums').insert({ ...albumPayload, cover_image_url: null }).select(ALBUM_COLUMNS).single();

    const { data: savedAlbum, error: albumError } = await albumQuery;
    if (albumError || !savedAlbum) throw new Error(albumError?.message ?? 'Album could not be saved.');

    const { data: existingImages, error: existingImagesError } = await supabase
      .from('gallery_images')
      .select(IMAGE_COLUMNS)
      .eq('album_id', savedAlbum.id);

    if (existingImagesError) throw new Error(existingImagesError.message);

    const existingImageRows = (existingImages ?? []) as GalleryImageRow[];
    const incomingImageIds = album.photos.map((photo) => photo.id).filter(Boolean);
    const deletedImages = existingImageRows.filter((image) => !incomingImageIds.includes(image.id));

    if (deletedImages.length) {
      const { error: deleteError } = await supabase
        .from('gallery_images')
        .delete()
        .in('id', deletedImages.map((image) => image.id));

      if (deleteError) throw new Error(deleteError.message);

      const storagePaths = deletedImages.map((image) => image.storage_path).filter(Boolean) as string[];
      if (storagePaths.length) {
        await supabase.storage.from('site-assets').remove(storagePaths);
      }
    }

    const savedPhotos: GalleryImage[] = [];
    const urlMap = new Map<string, string>();

    for (const [photoIndex, photo] of album.photos.entries()) {
      const photoTitle = photo.title.trim() || 'Gallery image';
      const isFeatured = album.headingImageUrls?.includes(photo.url) ?? false;
      let imageUrl = photo.url;
      let storagePath = photo.storagePath || null;

      if (photo.pendingFile) {
        const uploaded = await uploadGalleryImage(savedAlbum.slug, photo.pendingFile);
        imageUrl = uploaded.publicUrl;
        storagePath = uploaded.storagePath;
        urlMap.set(photo.url, uploaded.publicUrl);
      }

      const imagePayload = {
        album_id: savedAlbum.id,
        title: photoTitle,
        alt_text: photo.alt || photoTitle,
        image_url: imageUrl,
        storage_path: storagePath,
        is_featured: isFeatured,
        display_order: photoIndex,
        updated_at: new Date().toISOString(),
      };

      const imageQuery = photo.id && !photo.id.startsWith('pending-')
        ? supabase.from('gallery_images').update(imagePayload).eq('id', photo.id).select(IMAGE_COLUMNS).single()
        : supabase.from('gallery_images').insert(imagePayload).select(IMAGE_COLUMNS).single();

      const { data: savedImage, error: imageError } = await imageQuery;
      if (imageError || !savedImage) {
        if (photo.pendingFile && storagePath) {
          await supabase.storage.from('site-assets').remove([storagePath]);
        }
        throw new Error(imageError?.message ?? 'Gallery image could not be saved.');
      }

      savedPhotos.push(mapGalleryImage(savedImage as GalleryImageRow));
    }

    const savedCoverUrl = urlMap.get(album.cover) || album.cover || savedPhotos[0]?.url || null;
    const { error: coverError } = await supabase
      .from('gallery_albums')
      .update({
        cover_image_url: savedCoverUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', savedAlbum.id);

    if (coverError) throw new Error(coverError.message);
  }

  return getGalleryAlbums();
}

export async function deleteGalleryAlbum(album: GalleryAlbum) {
  if (!isSupabaseConfigured || !supabase || !album.id) return;

  const storagePaths = album.photos.map((photo) => photo.storagePath).filter(Boolean) as string[];
  const { error } = await supabase.from('gallery_albums').delete().eq('id', album.id);
  if (error) throw new Error(error.message);

  if (storagePaths.length) {
    await supabase.storage.from('site-assets').remove(storagePaths);
  }
}
