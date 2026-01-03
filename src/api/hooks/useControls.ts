import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/api/client";

export const useSalesReport = (range: string) => {
  return useQuery({
    queryKey: ["report", range],
    queryFn: async () => {
      const res = await api.get("/admin/reports", { params: { range } });
      return res.data.report as {
        totalRevenue: number;
        totalOrders: number;
        totalProductsSold: number;
        byStatus?: Record<string, number>;
      };
    },
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await api.get("/admin/userlist");
      return res.data.users as any[];
    },
  });
};

export type ReportFilters = {
  from?: string;
  to?: string;
};

export interface ReportStats {
  revenue: number;
  totalOrders: number;
  totalProductSales: number;
  totalUsersOrdered: number;
  totalUsersRegistered: number;
}

export const useReport = (filters: ReportFilters = {}) => {
  return useQuery<ReportStats>({
    queryKey: ["report", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const res = await api.get("/admin/report", { params });
      const raw = res.data;

      return {
        revenue: raw.revenue ?? 0,
        totalOrders:
          raw.noOfOrders ?? raw.no_of_orders ?? raw["no.oforders"] ?? 0,
        totalProductSales:
          raw.noOfProductSales ??
          raw.no_of_product_sales ??
          raw["noofproductsales"] ??
          0,
        totalUsersOrdered:
          raw.noOfUsersOrdered ??
          raw.no_of_users_ordered ??
          raw["No.of userodered"] ??
          0,
        totalUsersRegistered:
          raw.noOfUsersRegistered ??
          raw.no_of_users_registered ??
          raw["No.users are registered"] ??
          0,
      };
    },
  });
};

// Brand Stats Hook
export interface BrandStat {
  brand: string;
  totalProducts: number;
  categoryBreakdown?: Array<{
    categoryId: string;
    categoryName: string;
    productCount: number;
  }>;
}

export const useBrandStats = (page: number = 1, limit: number = 100) => {
  return useQuery<BrandStat[]>({
    queryKey: ["brand-stats", page, limit],
    queryFn: async () => {
      const res = await api.get("/admin/brand-stats", {
        params: { page, limit },
      });
      return res.data.brands as BrandStat[];
    },
  });
};

// User Orders Hook
export interface UserOrder {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  noOfProducts?: number;
}

export const useUserOrders = (userId: string) => {
  return useQuery<UserOrder[]>({
    queryKey: ["user-orders", userId],
    queryFn: async () => {
      const res = await api.get(`/admin/orders/user/${userId}`);
      return res.data.orders as UserOrder[];
    },
    enabled: !!userId,
  });
};

// Inventory Management Hooks

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  inStockProducts: number;
}

// Using new inventory APIs from revamp.md
export const useProductStats = (threshold: number = 2) => {
  return useQuery<ProductStats>({
    queryKey: ["product-stats", threshold],
    queryFn: async () => {
      const res = await api.get("/admin/stats", {
        params: { threshold },
      });
      return res.data.stats as ProductStats;
    },
  });
};

export const useOutOfStockProducts = () => {
  return useInfiniteQuery({
    queryKey: ["out-of-stock-products"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get("/admin/out-of-stock", {
        params: { page: pageParam },
      });
      return res.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalProducts = lastPage.total || 0;
      const loadedProducts = allPages.reduce(
        (sum, page) => sum + (page.products?.length || 0),
        0
      );
      const lastPageCount = lastPage.products?.length || 0;
      const PAGE_SIZE = 50; // Default page size from backend

      // If total is missing or 0, use heuristic: if last page is full, there might be more
      if (totalProducts === 0 && lastPageCount >= PAGE_SIZE) {
        return allPages.length + 1;
      }

      // If we have more products to load, return next page number
      if (loadedProducts < totalProducts) {
        return allPages.length + 1;
      }
      return undefined; // No more pages
    },
    initialPageParam: 1,
  });
};

export const useLowStockProducts = (threshold: number = 2) => {
  return useInfiniteQuery({
    queryKey: ["low-stock-products", threshold],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get("/admin/low-stock", {
        params: { page: pageParam, threshold },
      });
      return res.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalProducts = lastPage.total || 0;
      const loadedProducts = allPages.reduce(
        (sum, page) => sum + (page.products?.length || 0),
        0
      );
      const lastPageCount = lastPage.products?.length || 0;
      const PAGE_SIZE = 50; // Default page size from backend

      // If total is missing or 0, use heuristic: if last page is full, there might be more
      if (totalProducts === 0 && lastPageCount >= PAGE_SIZE) {
        return allPages.length + 1;
      }

      // If we have more products to load, return next page number
      if (loadedProducts < totalProducts) {
        return allPages.length + 1;
      }
      return undefined; // No more pages
    },
    initialPageParam: 1,
  });
};
