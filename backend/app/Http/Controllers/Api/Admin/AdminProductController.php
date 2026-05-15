<?php

namespace App\Http\Controllers\Api\Admin;

use App\Events\ProductStockUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Admin product management. Unlike the public ProductController#index this
 * returns inactive products too and supports a 'trashed' switch later.
 */
class AdminProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::query()->orderByDesc('created_at');

        if ($q = $request->string('q')->toString()) {
            $query->where(function ($qq) use ($q) {
                $qq->where('name', 'like', "%{$q}%")
                   ->orWhere('sku', 'like', "%{$q}%");
            });
        }

        if ($category = $request->string('category')->toString()) {
            $query->where('category', $category);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return ProductResource::collection($query->paginate(15)->withQueryString());
    }

    public function store(ProductRequest $request): JsonResponse
    {
        $product = Product::create($request->validated());
        return response()->json(['data' => new ProductResource($product)], 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json(['data' => new ProductResource($product)]);
    }

    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        $previousStock = (int) $product->stock;
        $product->update($request->validated());

        // Broadcast only when stock actually changed; admins editing a name
        // or description shouldn't ping every connected client.
        if ((int) $product->stock !== $previousStock) {
            ProductStockUpdated::dispatch($product);
        }

        return response()->json(['data' => new ProductResource($product)]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();
        return response()->json(null, 204);
    }
}
