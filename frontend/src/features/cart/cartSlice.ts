import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Product } from '@/features/products/productsApi';

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  quantity: number;
  stock: number;
}

export interface CartState {
  items: CartItem[];
}

const STORAGE_KEY = 'vt_cart';

const readInitial = (): CartState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.items)) return { items: parsed.items };
    return { items: [] };
  } catch {
    return { items: [] };
  }
};

const persist = (state: CartState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full / disabled — ignore */
  }
};

const slice = createSlice({
  name: 'cart',
  initialState: readInitial(),
  reducers: {
    addToCart: (
      state,
      { payload }: PayloadAction<{ product: Product; quantity?: number }>,
    ) => {
      const qty = Math.max(1, payload.quantity ?? 1);
      const p = payload.product;
      const existing = state.items.find((i) => i.productId === p.id);

      if (existing) {
        existing.stock = p.stock;
        existing.price = p.price;
        existing.quantity = Math.min(existing.stock, existing.quantity + qty);
      } else {
        state.items.push({
          productId: p.id,
          slug: p.slug,
          name: p.name,
          price: p.price,
          currency: p.currency,
          imageUrl: p.image_url,
          stock: p.stock,
          quantity: Math.min(p.stock, qty),
        });
      }
      persist(state);
    },
    setQuantity: (
      state,
      { payload }: PayloadAction<{ productId: number; quantity: number }>,
    ) => {
      const item = state.items.find((i) => i.productId === payload.productId);
      if (!item) return;
      item.quantity = Math.max(1, Math.min(item.stock, payload.quantity));
      persist(state);
    },
    removeFromCart: (state, { payload }: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.productId !== payload);
      persist(state);
    },
    clearCart: (state) => {
      state.items = [];
      persist(state);
    },
  },
});

export const { addToCart, setQuantity, removeFromCart, clearCart } = slice.actions;
export default slice.reducer;
