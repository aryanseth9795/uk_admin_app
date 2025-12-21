import { useMutation, useQuery } from "@tanstack/react-query";

import { api } from "@/api/client";

/* -------- Admin Profile -------- */

export interface AdminProfile {
  _id: string;
  name: string;
  role: string;
  mobilenumber?: string;
}

export const useAdminProfile = () => {
  // console.log("useradmun")
  return useQuery<AdminProfile>({
    queryKey: ["admin-profile"],
    queryFn: async () => {

      const res = await api.get("/admin/me");
    
      return res.data.admin as AdminProfile;
    },
  });
};

export const useUpdateAdminProfile = () => {
  return useMutation({
    mutationFn: async (payload: Partial<AdminProfile>) => {
      const res = await api.put("/admin/me", payload);
      return res.data.admin as AdminProfile;
    },
  });
};







// export const useGetAdminProductList = (params?: GetAdminProductListParams) => {
//   const { search, brand, category, page = 1 } = params || {};

//   return useQuery<AdminProductListResponse>({
//     queryKey: ['', search ?? '', brand ?? '', category ?? '', page],
//     queryFn: async () => {
//       console.log("yha query call hui")
//       const res = await api.get('/admin/products', {
//         params: {
//           page,
//           search: search || undefined,
//           brand: brand || undefined,
//           category: category || undefined,
//         },
//       });

//       return res.data;
//     },
//   });
// };
/* -------- Products (admin) -------- */


type GetAdminProductListParams = {
  page?: number;
  search?: string;
  category?: string;
  subCategory?: string;
  subSubCategory?: string;
  brand?: string;
  tags?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string; // 'true'
};

export interface AdminProductListResponse {
  success: boolean;
  page: number;
  limit: number;
  totalProducts: number;
  totalPages: number;
  hasNextPage: boolean;
  products: Array<{
    _id: string;
    name: string;
    brand: string;
    thumbnail?: {
      publicId?: string;
      url?: string;
      secureUrl?: string;
    };
    variants: Array<{
      _id: string;
      stock: number;
      mrp: number;
      sellingPrices: Array<{
        minQuantity: number;
        price: number;
        discount: number;
      }>;
    }>;
  }>;
}
export const useGetAdminProductList = (params?: GetAdminProductListParams) => {
  const {
    page = 1,
    search,
    category,
    subCategory,
    subSubCategory,
    brand,
    tags,
    minPrice,
    maxPrice,
    inStock,
  } = params || {};

  return useQuery<AdminProductListResponse>({
    queryKey: [
      'product-list',
      {
        page,
        search,
        category,
        subCategory,
        subSubCategory,
        brand,
        tags,
        minPrice,
        maxPrice,
        inStock,
      },
    ],
    queryFn: async () => {
      const res = await api.get('/admin/getproducts', {
        params: {
          page,
          search: search || undefined,
          category: category || undefined,
          subCategory: subCategory || undefined,
          subSubCategory: subSubCategory || undefined,
          brand: brand || undefined,
          tags: tags || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          inStock: inStock || undefined, // 'true'
        },
      });

      return res.data;
    },
  });
};


export type AdminProductCategory = "beauty" | "gift" | "grocery" | "general";



interface CreateAdminProductArgs {
  formData: FormData; // for real API (Multer + Cloudinary)
}

export const 
useCreateAdminProduct = () => {
  return useMutation({
    mutationFn: async ({ formData }: CreateAdminProductArgs) => {
      console.log(formData)
    
      const res = await api.post("/admin/addproduct", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    mutationKey:["product-list"]
  });

};


export const useGetProductDetail = (id: string) => {
  // console.log(id)
  return useQuery({
    queryKey: ['admin-product-detail', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/admin/products/${id}`);
      // console.log(res.data)
      return res?.data?.product||"No"; // this will be your full product doc
    },
  });
};

/* -------- Stock Update -------- */
export interface UpdateStockPayload {
  productId: string;
  variantId: string;
  quantity: number;
}

export const useUpdateStock = () => {
  return useMutation({
    mutationFn: async (payload: UpdateStockPayload) => {
      const res = await api.post("/admin/stockproduct", payload);
      return res.data;
    },
  });
};

/* -------- Delete Product -------- */
export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: async (productId: string) => {
      const res = await api.delete(`/admin/product/${productId}`);
      return res.data;
    },
  });
};

/* -------- Update Product -------- */
export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: async ({ productId, formData }: { productId: string; formData: FormData }) => {
      const res = await api.put(`/admin/product/${productId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
  });
};