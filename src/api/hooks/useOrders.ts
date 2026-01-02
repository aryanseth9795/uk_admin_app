// src/api/hooks/useOrders.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client"; // ⬅️ adjust this path to your api client

// ---------- Types ----------

export type OrderStatus = "placed" | "shipped" | "delivered" | "cancelled";

export interface Order {
  _id: string;
  product: [];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type OrdersFilters = {
  status: OrderStatus | "all";
  from?: string; // ISO date string (optional)
  to?: string; // ISO date string (optional)
};

// ---------- Hooks ----------

export const useOrders = (filters: OrdersFilters) => {
  return useQuery<Order[]>({
    queryKey: ["orders", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};

      if (filters.status && filters.status !== "all") {
        params.status = filters.status;
      }
      if (filters.from) {
        params.from = filters.from;
      }
      if (filters.to) {
        params.to = filters.to;
      }

      const res = await api.get("/admin/allorders/date", { params });
      const orders = (res.data.orders || []) as Order[];
      return orders;
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { orderId: string; status: OrderStatus }) => {
      // API expects OrderId (capital O) per documentation
      const res = await api.put("/admin/orders/status", {
        OrderId: payload.orderId,
        status: payload.status,
      });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      // invalidate all order lists (any filters)
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      // invalidate this specific order detail
      queryClient.invalidateQueries({
        queryKey: ["order", variables.orderId],
      });
    },
  });
};

export type OrderItemDetail = {
  _id: string;
  variantId: string;
  name: string;
  quantity: number;
  thumbnail?: {
    url?: string;
    secureUrl?: string;
    publicId?: string;
  };
};

export interface OrderDetail {
  _id: string; // order id
  name: string;
  mobilenumber: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  address: {
    Receiver_Name: string;
    Receiver_MobileNumber: string;
    Address_Line1: string;
    Address_Line2?: string;
    City: string;
    pincode: string;
    label: string;
  };
  totalAmount: number;
  noOfProducts: number;
  products: OrderItemDetail[];
}

// replace the old hook with this
export const useOrderDetail = (orderId: string) => {
  return useQuery<OrderDetail>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await api.get(`/admin/orders/${orderId}`);
      return res.data.orderDetail as OrderDetail;
    },
    enabled: !!orderId,
  });
};
