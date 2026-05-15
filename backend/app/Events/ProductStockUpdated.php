<?php

namespace App\Events;

use App\Models\Product;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast on stock changes so connected clients can update PDPs and
 * "out of stock" badges without polling.
 *
 * Channel:  products.{productId}
 * Event:    .product.stock.updated   (leading dot = use literal name, not class)
 */
class ProductStockUpdated implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public int $productId;
    public int $stock;
    public ?string $sku;

    public function __construct(Product $product)
    {
        $this->productId = (int) $product->id;
        $this->stock     = (int) $product->stock;
        $this->sku       = $product->sku;
    }

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [new Channel("products.{$this->productId}")];
    }

    public function broadcastAs(): string
    {
        return 'product.stock.updated';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'product_id' => $this->productId,
            'stock'      => $this->stock,
            'sku'        => $this->sku,
        ];
    }
}
