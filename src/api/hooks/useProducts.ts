import { USE_MOCKS } from '@/utils/devToggle';
import { mockService } from '@/mocks/mockService';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  subCategory?: string;
  thumbnailUrl?: string;
  price: number;
  stock: number;
}

interface ProductFilters {
  category?: string;
  brand?: string;
  search?: string;
}

// export const useProducts = (filters: ProductFilters) => {
//   return useQuery<Product[]>({
//     queryKey: ['products', filters],
//     queryFn: async () => {
    
//         return res.products as Product[];
//       }
//       const res = await api.get('/products', {
//         params: {
//           category: filters.category,
//           brand: filters.brand,
//           q: filters.search,
//         },
//       });
//       return res.data.products as Product[];
//     },
//   });
// };

export const useProductDetail = (productId: string) => {
  return useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: async () => {
     
      const res = await api.get(`/products/${productId}`);
      return res.data.product as Product;
    },
    enabled: !!productId,
  });
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/admin/addproduct', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });
};

export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: async ({ productId, formData }: { productId: string; formData: FormData }) => {
      const res = await api.put(`/admin/products/${productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });
};
