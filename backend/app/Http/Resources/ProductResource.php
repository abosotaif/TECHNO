<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'sku'            => $this->sku,
            'category'       => $this->category,
            'brand'          => $this->brand,
            'description'    => $this->description,
            'price'          => (float) $this->price,
            'original_price' => $this->original_price !== null ? (float) $this->original_price : null,
            'currency'       => $this->currency,
            'stock'          => (int) $this->stock,
            'image_url'      => $this->image_url,
            'is_active'      => (bool) $this->is_active,
            'is_featured'    => (bool) $this->is_featured,
            'created_at'     => optional($this->created_at)->toIso8601String(),
            'updated_at'     => optional($this->updated_at)->toIso8601String(),
        ];
    }
}
