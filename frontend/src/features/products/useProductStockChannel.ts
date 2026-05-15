import { useEffect } from 'react';

import { getEcho } from '@/lib/echo';

interface StockEventPayload {
  product_id: number;
  stock: number;
  sku: string | null;
}

/**
 * Subscribes to the public `products.{productId}` Reverb channel and calls
 * `onStockChange` whenever a `product.stock.updated` event arrives. Cleans up
 * its own listener and leaves the channel on unmount.
 *
 * No-ops when Echo isn't configured (e.g. dev without Reverb running) so the
 * UI continues to work via plain REST.
 */
export function useProductStockChannel(
  productId: number | null | undefined,
  onStockChange: (stock: number) => void,
): void {
  useEffect(() => {
    if (!productId) return;
    const echo = getEcho();
    if (!echo) return;

    const channelName = `products.${productId}`;
    const channel = echo.channel(channelName);

    const handler = (e: StockEventPayload) => {
      if (typeof e?.stock === 'number') onStockChange(e.stock);
    };

    // Reverb broadcasts the event under its `broadcastAs()` name with a
    // leading dot to indicate "literal name, not class".
    channel.listen('.product.stock.updated', handler);

    return () => {
      channel.stopListening('.product.stock.updated', handler);
      echo.leave(channelName);
    };
    // onStockChange must be stable from the caller (use useCallback) to
    // avoid resubscribing on every render.
  }, [productId, onStockChange]);
}
