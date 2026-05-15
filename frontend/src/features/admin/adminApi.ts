import { api } from '@/features/api/api';
import type { Product } from '@/features/products/productsApi';
import type { Order, OrderStatus } from '@/features/orders/ordersApi';

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface AdminProductListResponse {
  data: Product[];
  meta: PaginationMeta;
}

interface AdminOrderListResponse {
  data: Order[];
  meta: PaginationMeta;
}

interface AdminProductsArgs {
  page?: number;
  q?: string;
  category?: string;
  is_active?: boolean;
}

interface AdminOrdersArgs {
  page?: number;
  status?: OrderStatus;
  q?: string;
}

export interface ProductPayload {
  name: string;
  slug?: string;
  sku?: string | null;
  category: string;
  brand?: string | null;
  description?: string | null;
  price: number;
  original_price?: number | null;
  currency?: string;
  stock?: number;
  image_url?: string | null;
  is_active?: boolean;
  is_featured?: boolean;
}

export const adminApi = api.injectEndpoints({
  endpoints: (build) => ({
    /* Products */
    getAdminProducts: build.query<AdminProductListResponse, AdminProductsArgs | void>({
      query: (args) => {
        const p = new URLSearchParams();
        if (args?.page) p.set('page', String(args.page));
        if (args?.q) p.set('q', args.q);
        if (args?.category) p.set('category', args.category);
        if (args?.is_active !== undefined) p.set('is_active', args.is_active ? '1' : '0');
        const qs = p.toString();
        return `/admin/products${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((p) => ({ type: 'Product' as const, id: p.id })),
              { type: 'Product' as const, id: 'ADMIN_LIST' },
            ]
          : [{ type: 'Product' as const, id: 'ADMIN_LIST' }],
    }),

    getAdminProduct: build.query<{ data: Product }, number>({
      query: (id) => `/admin/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Product', id }],
    }),

    createProduct: build.mutation<{ data: Product }, ProductPayload>({
      query: (body) => ({ url: '/admin/products', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Product', id: 'ADMIN_LIST' },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    updateProduct: build.mutation<{ data: Product }, { id: number; body: ProductPayload }>({
      query: ({ id, body }) => ({ url: `/admin/products/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'ADMIN_LIST' },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteProduct: build.mutation<void, number>({
      query: (id) => ({ url: `/admin/products/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'ADMIN_LIST' },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    /* Orders */
    getAdminOrders: build.query<AdminOrderListResponse, AdminOrdersArgs | void>({
      query: (args) => {
        const p = new URLSearchParams();
        if (args?.page) p.set('page', String(args.page));
        if (args?.status) p.set('status', args.status);
        if (args?.q) p.set('q', args.q);
        const qs = p.toString();
        return `/admin/orders${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((o) => ({ type: 'Order' as const, id: o.id })),
              { type: 'Order' as const, id: 'ADMIN_LIST' },
            ]
          : [{ type: 'Order' as const, id: 'ADMIN_LIST' }],
    }),

    getAdminOrder: build.query<{ data: Order }, number>({
      query: (id) => `/admin/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),

    updateOrderStatus: build.mutation<{ data: Order }, { id: number; status: OrderStatus }>({
      query: ({ id, status }) => ({
        url: `/admin/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'ADMIN_LIST' },
        { type: 'Order', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAdminProductsQuery,
  useGetAdminProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetAdminOrdersQuery,
  useGetAdminOrderQuery,
  useUpdateOrderStatusMutation,
} = adminApi;
