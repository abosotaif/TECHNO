import { api } from '@/features/api/api';

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  product_sku: string | null;
  product_image_url: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  shipping_notes: string | null;
  items: OrderItem[];
  created_at: string | null;
  updated_at: string | null;
}

export interface OrderListResponse {
  data: Order[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface CreateOrderArgs {
  items: Array<{ product_id: number; quantity: number }>;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country?: string;
  shipping_notes?: string;
}

export const ordersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMyOrders: build.query<OrderListResponse, void>({
      query: () => '/orders',
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((o) => ({ type: 'Order' as const, id: o.id })),
              { type: 'Order' as const, id: 'LIST' },
            ]
          : [{ type: 'Order' as const, id: 'LIST' }],
    }),

    getOrder: build.query<{ data: Order }, number>({
      query: (id) => `/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),

    createOrder: build.mutation<{ data: Order }, CreateOrderArgs>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }, { type: 'Product', id: 'LIST' }],
    }),
  }),
});

export const { useGetMyOrdersQuery, useGetOrderQuery, useCreateOrderMutation } = ordersApi;
