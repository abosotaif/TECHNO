<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        return [
            'name'           => ['required', 'string', 'max:180'],
            'slug'           => ['nullable', 'string', 'max:200', Rule::unique('products', 'slug')->ignore($productId)],
            'sku'            => ['nullable', 'string', 'max:64', Rule::unique('products', 'sku')->ignore($productId)],
            'category'       => ['required', 'string', 'max:60'],
            'brand'          => ['nullable', 'string', 'max:80'],
            'description'    => ['nullable', 'string'],
            'price'          => ['required', 'numeric', 'min:0'],
            'original_price' => ['nullable', 'numeric', 'min:0', 'gte:price'],
            'currency'       => ['nullable', 'string', 'size:3'],
            'stock'          => ['nullable', 'integer', 'min:0'],
            'image_url'      => ['nullable', 'url', 'max:500'],
            'is_active'      => ['nullable', 'boolean'],
            'is_featured'    => ['nullable', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->filled('slug') && $this->filled('name')) {
            $this->merge(['slug' => Str::slug($this->input('name')).'-'.Str::lower(Str::random(6))]);
        }
    }
}
