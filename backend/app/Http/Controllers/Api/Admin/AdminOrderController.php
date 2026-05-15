<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminOrderController extends Controller
{
    /**
     * GET /api/admin/orders
     * Optional filters: ?status=, ?q= (matches order id, shipping_name, shipping_phone)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Order::query()->with('items')->orderByDesc('created_at');

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        if ($q = $request->string('q')->toString()) {
            $query->where(function ($qq) use ($q) {
                $qq->where('id', $q)
                   ->orWhere('shipping_name', 'like', "%{$q}%")
                   ->orWhere('shipping_phone', 'like', "%{$q}%");
            });
        }

        return OrderResource::collection($query->paginate(15)->withQueryString());
    }

    public function show(Order $order): JsonResponse
    {
        $order->load('items');
        return response()->json(['data' => new OrderResource($order)]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $order->update(['status' => $request->validated('status')]);
        $order->load('items');

        return response()->json(['data' => new OrderResource($order)]);
    }
}
