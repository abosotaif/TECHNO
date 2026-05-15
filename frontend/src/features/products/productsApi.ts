import { api } from '@/features/api/api';

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  brand: string | null;
  description: string | null;
  price: number;
  currency: string;
  stock: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ProductListResponse {
  data: Product[];
  meta: PaginationMeta;
  links: { first: string | null; last: string | null; next: string | null; prev: string | null };
}

export interface ProductSingleResponse {
  data: Product;
}

export interface ProductListArgs {
  page?: number;
  perPage?: number;
  q?: string;
  category?: string;
  brand?: string;
}

export const productsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<ProductListResponse, ProductListArgs | void>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args?.page) params.set('page', String(args.page));
        if (args?.perPage) params.set('per_page', String(args.perPage));
        if (args?.q) params.set('q', args.q);
        if (args?.category) params.set('category', args.category);
        if (args?.brand) params.set('brand', args.brand);
        const qs = params.toString();
        return `/products${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),

    getProduct: build.query<ProductSingleResponse, string>({
      query: (slug) => `/products/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: 'Product', id: slug }],
    }),
  }),
});

export const { useGetProductsQuery, useGetProductQuery } = productsApi;
