import type { RootState } from '@/app/store';
import type { CartItem } from '@/features/cart/cartSlice';

const SHIPPING_FLAT = 10;
const FREE_SHIPPING_THRESHOLD = 200;

export const selectCartItems = (s: RootState): CartItem[] => s.cart.items;

export const selectCartCount = (s: RootState): number =>
  s.cart.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectCartTotals = (s: RootState) => {
  const subtotal = s.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping =
    s.cart.items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;
  const currency = s.cart.items[0]?.currency ?? 'USD';
  return { subtotal, shipping, total, currency };
};
