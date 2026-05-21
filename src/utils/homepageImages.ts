import type { HomePageImage, HomePageImageRow } from '../types';

export function mapHomePageImage(row: HomePageImageRow): HomePageImage {
  return {
    id: row.id,
    title: row.title,
    url: row.image_url,
    storagePath: row.storage_path,
    displayOrder: row.display_order,
  };
}

export function sanitizeStorageFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
