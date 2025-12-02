
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useSalesReport = (range: string) => {
  return useQuery({
    queryKey: ['report', range],
    queryFn: async () => {
    
      
      const res = await api.get('/admin/reports', { params: { range } });
      return res.data.report as {
        totalRevenue: number;
        totalOrders: number;
        totalProductsSold: number;
        byStatus?: Record<string, number>;
      };
    },
  });
};

export const useStockSummary = () => {
  return useQuery({
    queryKey: ['stock-summary'],
    queryFn: async () => {
    
      const res = await api.get('/admin/stocks/summary');
      return res.data.summary as {
        outOfStock: number;
        lowStock: number;
        totalProducts: number;
      };
    },
  });
};

export const useStockList = (type: 'out-of-stock' | 'low-stock' | 'all') => {
  return useQuery({
    queryKey: ['stocks', type],
    queryFn: async () => {
    
      const res = await api.get('/admin/stocks', { params: { type } });
      return res.data.products as any[];
    },
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
     
      const res = await api.get('/admin/userlist');
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
    queryKey: ['report', filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      // 🔁 adjust URL if needed
      const res = await api.get('/admin/report', { params });
      const raw = res.data;

      return {
        revenue: raw.revenue ?? 0,
        totalOrders:
          raw.noOfOrders ??
          raw.no_of_orders ??
          raw['no.oforders'] ??
          0,
        totalProductSales:
          raw.noOfProductSales ??
          raw.no_of_product_sales ??
          raw['noofproductsales'] ??
          0,
        totalUsersOrdered:
          raw.noOfUsersOrdered ??
          raw.no_of_users_ordered ??
          raw['No.of userodered'] ??
          0,
        totalUsersRegistered:
          raw.noOfUsersRegistered ??
          raw.no_of_users_registered ??
          raw['No.users are registered'] ??
          0,
      };
    },
  });
};