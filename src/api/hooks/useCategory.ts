import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

/* -------- Category Types -------- */

export interface Category {
  _id: string;
  name: string;
 
  createdAt?: string;
  updatedAt?: string;
}

interface CreateCategoryPayload {
  name: string;
}

interface UpdateCategoryPayload {
  name?: string;
}

/* -------- Category Hooks -------- */

/**
 * Fetch all categories
 */
export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/admin/categories');
      // console.log(res)  
      return res?.data?.data || [];
    },
  });
};

/**
 * Create a new category
 */
export const useCreateCategory = () => {
  return useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      const res = await api.post('/admin/categories', payload);
      return res?.data;
    },
  });
};

/**
 * Update an existing category
 */
export const useUpdateCategory = () => {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) => {
      const res = await api.put(`/admin/categories/${id}`, payload);
      return res.data;
    },
  });
};

/**
 * Delete a category
 */
export const useDeleteCategory = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/categories/${id}`);
      return res.data;
    },
  });
};


/* -------- SubCategory Types -------- */

export interface SubCategory {
  _id: string;
  name: string;
  categoryId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateSubCategoryPayload {
  categoryId: string;
  name: string;
}

interface UpdateSubCategoryPayload {
  name?: string;
  categoryId?: string;
}

/* -------- SubCategory Hooks -------- */

/**
 * Fetch subcategories for a specific category
 */
export const useSubCategories = (categoryId?: string) => {
  return useQuery<SubCategory[]>({
    queryKey: ['subcategories', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      const res = await api.get(`/admin/categories/${categoryId}/sub`);
      return res?.data?.data || [];
    },
    enabled: !!categoryId,
  });
};

/**
 * Create a new subcategory
 */
export const useCreateSubCategory = () => {
  return useMutation({
    mutationFn: async (payload: CreateSubCategoryPayload) => {
      const { categoryId, name } = payload;
      const res = await api.post(`/admin/categories/${categoryId}/sub`, { name });
      return res?.data;
    },
  });
};

/**
 * Update an existing subcategory
 */
export const useUpdateSubCategory = () => {
  return useMutation({
    mutationFn: async ({ id, categoryId, payload }: { id: string; categoryId: string; payload: UpdateSubCategoryPayload }) => {
      const res = await api.put(`/admin/categories/${categoryId}/sub/${id}`, payload);
      return res?.data;
    },
  });
};

/**
 * Delete a subcategory
 */
export const useDeleteSubCategory = () => {
  return useMutation({
    mutationFn: async ({ id, categoryId }: { id: string; categoryId: string }) => {
      const res = await api.delete(`/admin/categories/${categoryId}/sub/${id}`);
      return res?.data;
    },
  });
};


/* -------- SubSubCategory Types -------- */

export interface SubSubCategory {
  _id: string;
  name: string;
  subCategoryId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateSubSubCategoryPayload {
  subCategoryId: string;
  name: string;
}

interface UpdateSubSubCategoryPayload {
  name?: string;
}

/* -------- SubSubCategory Hooks -------- */

/**
 * Fetch sub-subcategories for a specific subcategory
 */
export const useSubSubCategories = (subCategoryId?: string) => {
  return useQuery<SubSubCategory[]>({
    queryKey: ['subsubcategories', subCategoryId],
    queryFn: async () => {
      if (!subCategoryId) return [];
      const res = await api.get(`/admin/subcategories/${subCategoryId}/sub`);
      return res?.data?.data || [];
    },
    enabled: !!subCategoryId,
  });
};

/**
 * Create a new sub-subcategory
 */
export const useCreateSubSubCategory = () => {
  return useMutation({
    mutationFn: async (payload: CreateSubSubCategoryPayload) => {
      const { subCategoryId, name } = payload;
      const res = await api.post(`/admin/subcategories/${subCategoryId}/sub`, { name });
      return res?.data;
    },
  });
};

/**
 * Update an existing sub-subcategory
 */
export const useUpdateSubSubCategory = () => {
  return useMutation({
    mutationFn: async ({ id, subCategoryId, payload }: { id: string; subCategoryId: string; payload: UpdateSubSubCategoryPayload }) => {
      const res = await api.put(`/admin/subcategories/${subCategoryId}/sub/${id}`, payload);
      return res?.data;
    },
  });
};

/**
 * Delete a sub-subcategory
 */
export const useDeleteSubSubCategory = () => {
  return useMutation({
    mutationFn: async ({ id, subCategoryId }: { id: string; subCategoryId: string }) => {
      const res = await api.delete(`/admin/subcategories/${subCategoryId}/sub/${id}`);
      return res?.data;
    },
  });
};
