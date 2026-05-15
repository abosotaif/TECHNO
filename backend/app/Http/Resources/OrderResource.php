<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'user_id'          => $this->user_id,
            'status'           => $this->status,
            'subtotal'         => (float) $this->subtotal,
            'shipping'         => (float) $this->shipping,
            'total'            => (float) $this->total,
            'currency'         => $this->currency,
            'shipping_name'    => $this->shipping_name,
            'shipping_phone'   => $this->shipping_phone,
            'shipping_address' => $this->shipping_address,
            'shipping_city'    => $this->shipping_city,
            'shipping_country' => $this->shipping_country,
            'shipping_notes'   => $this->shipping_notes,
            'items'            => OrderItemResource::collection($this->whenLoaded('items')),
            'created_at'       => optional($this->created_at)->toIso8601String(),
            'updated_at'       => optional($this->updated_at)->toIso8601String(),
        ];
    }
}
