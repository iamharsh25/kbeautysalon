import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { ServiceCategory } from '../types';
import { sanitizeStorageFileName } from '../utils/homepageImages';

type ServiceCategoryRow = {
  id: string;
  name: string;
  display_order: number;
  image_url?: string | null;
  icon_key?: string | null;
  background_color?: string | null;
};

type ServiceSubCategoryRow = {
  id: string;
  category_id: string;
  name: string;
  display_order: number;
};

export async function getServiceCategories() {
  if (!isSupabaseConfigured || !supabase) return [];

  const [categoriesResult, subCategoriesResult] = await Promise.all([
    supabase.from('service_categories').select('id,name,display_order,image_url,icon_key,background_color').order('display_order', { ascending: true }),
    supabase.from('service_sub_categories').select('id,category_id,name,display_order').order('display_order', { ascending: true }),
  ]);

  if (categoriesResult.error) throw new Error(categoriesResult.error.message);
  if (subCategoriesResult.error) throw new Error(subCategoriesResult.error.message);

  const subCategories = (subCategoriesResult.data ?? []) as ServiceSubCategoryRow[];
  return ((categoriesResult.data ?? []) as ServiceCategoryRow[]).map((category) => ({
    id: category.id,
    name: category.name,
    imageUrl: category.image_url || undefined,
    iconKey: category.icon_key || undefined,
    backgroundColor: category.background_color || undefined,
    subCategories: subCategories
      .filter((subCategory) => subCategory.category_id === category.id)
      .map((subCategory) => ({
        id: subCategory.id,
        name: subCategory.name,
      })),
  }));
}

export async function saveServiceCategories(categories: ServiceCategory[]) {
  if (!isSupabaseConfigured || !supabase) return categories;

  const { data: existingCategories, error: existingError } = await supabase
    .from('service_categories')
    .select('id');

  if (existingError) throw new Error(existingError.message);

  const incomingIds = categories.map((category) => category.id).filter(Boolean);
  const deletedCategoryIds = (existingCategories ?? [])
    .map((category) => category.id as string)
    .filter((id) => !incomingIds.includes(id));

  if (deletedCategoryIds.length) {
    const { error } = await supabase.from('service_categories').delete().in('id', deletedCategoryIds);
    if (error) throw new Error(error.message);
  }

  const savedCategories: ServiceCategory[] = [];

  for (const [categoryIndex, category] of categories.entries()) {
    const categoryPayload = {
      name: category.name,
      image_url: category.imageUrl || null,
      icon_key: category.iconKey || null,
      background_color: category.backgroundColor || null,
      display_order: categoryIndex,
      updated_at: new Date().toISOString(),
    };

    const categoryQuery = category.id
      ? supabase.from('service_categories').update(categoryPayload).eq('id', category.id).select('id,name,display_order,image_url,icon_key,background_color').single()
      : supabase.from('service_categories').insert(categoryPayload).select('id,name,display_order,image_url,icon_key,background_color').single();

    const { data: savedCategory, error: categoryError } = await categoryQuery;
    if (categoryError || !savedCategory) throw new Error(categoryError?.message ?? 'Category could not be saved.');

    const { data: existingSubCategories, error: existingSubError } = await supabase
      .from('service_sub_categories')
      .select('id')
      .eq('category_id', savedCategory.id);

    if (existingSubError) throw new Error(existingSubError.message);

    const incomingSubIds = category.subCategories.map((subCategory) => subCategory.id).filter(Boolean);
    const deletedSubIds = (existingSubCategories ?? [])
      .map((subCategory) => subCategory.id as string)
      .filter((id) => !incomingSubIds.includes(id));

    if (deletedSubIds.length) {
      const { error } = await supabase.from('service_sub_categories').delete().in('id', deletedSubIds);
      if (error) throw new Error(error.message);
    }

    const savedSubCategories = [];
    for (const [subCategoryIndex, subCategory] of category.subCategories.entries()) {
      const subPayload = {
        category_id: savedCategory.id,
        name: subCategory.name,
        display_order: subCategoryIndex,
        updated_at: new Date().toISOString(),
      };

      const subQuery = subCategory.id
        ? supabase.from('service_sub_categories').update(subPayload).eq('id', subCategory.id).select('id,name').single()
        : supabase.from('service_sub_categories').insert(subPayload).select('id,name').single();

      const { data: savedSubCategory, error: subCategoryError } = await subQuery;
      if (subCategoryError || !savedSubCategory) {
        throw new Error(subCategoryError?.message ?? 'Sub category could not be saved.');
      }

      savedSubCategories.push({
        id: savedSubCategory.id,
        name: savedSubCategory.name,
      });
    }

    savedCategories.push({
      id: savedCategory.id,
      name: savedCategory.name,
      imageUrl: savedCategory.image_url || undefined,
      iconKey: savedCategory.icon_key || undefined,
      backgroundColor: savedCategory.background_color || undefined,
      subCategories: savedSubCategories,
    });
  }

  return savedCategories;
}

export async function uploadServiceCategoryImage(file: File) {
  if (!isSupabaseConfigured || !supabase) return URL.createObjectURL(file);

  const storagePath = `service-categories/${Date.now()}-${crypto.randomUUID()}-${sanitizeStorageFileName(file.name) || 'category'}`;
  const { error: uploadError } = await supabase.storage
    .from('site-assets')
    .upload(storagePath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from('site-assets').getPublicUrl(storagePath);
  return data.publicUrl;
}
