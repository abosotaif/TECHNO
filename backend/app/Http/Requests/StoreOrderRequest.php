<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'items'                  => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id'     => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'       => ['required', 'integer', 'min:1', 'max:50'],

            'shipping_name'          => ['required', 'string', 'max:120'],
            'shipping_phone'         => ['required', 'string', 'max:40'],
            'shipping_address'       => ['required', 'string', 'max:255'],
            'shipping_city'          => ['required', 'string', 'max:80'],
            'shipping_country'       => ['nullable', 'string', 'max:80'],
            'shipping_notes'         => ['nullable', 'string', 'max:500'],
        ];
    }
}
