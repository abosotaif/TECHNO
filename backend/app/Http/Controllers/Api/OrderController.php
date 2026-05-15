<?php

namespace App\Http\Controllers\Api;

use App\Events\ProductStockUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * GET /api/orders — current user's orders.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->with('items')
            ->orderByDesc('created_at')
            ->paginate(10);

        return OrderResource::collection($orders);
    }

    /**
     * GET /api/orders/{order} — single order, owner only.
     */
    public function show(Request $request, Order $order): JsonResponse
    {
        $this->ensureOwner($request, $order);
        $order->load('items');

        return response()->json(['data' => new OrderResource($order)]);
    }

    /**
     * POST /api/orders — place a new order.
     *
     * NOTE: this currently marks the order as 'paid' immediately. A real
     * deployment must integrate a payment gateway (Stripe/Paymob/etc) and
     * only flip 'pending' -> 'paid' on a verified webhook callback.
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $userId  = $request->user()->id;

        /** @var array{order: Order, touched: array<int, Product>} $result */
        $result = DB::transaction(function () use ($payload, $userId) {
            // Lock referenced product rows for the duration of the tx.
            $productIds = collect($payload['items'])->pluck('product_id')->unique();

            /** @var \Illuminate\Support\Collection<int, Product> $products */
            $products = Product::query()
                ->whereIn('id', $productIds)
                ->where('is_active', true)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $errors    = [];
            $subtotal  = 0.0;
            $rows      = [];

            foreach ($payload['items'] as $i => $item) {
                /** @var Product|null $p */
                $p = $products->get($item['product_id']);

                if (! $p) {
                    $errors["items.$i.product_id"] = ['Product is unavailable.'];
                    continue;
                }
                if ($p->stock < $item['quantity']) {
                    $errors["items.$i.quantity"] = ["Only {$p->stock} in stock for {$p->name}."];
                    continue;
                }

                $unit  = (float) $p->price;
                $line  = round($unit * $item['quantity'], 2);
                $subtotal += $line;

                $rows[] = [
                    'product'  => $p,
                    'qty'      => (int) $item['quantity'],
                    'unit'     => $unit,
                    'line'     => $line,
                ];
            }

            if (! empty($errors)) {
                throw ValidationException::withMessages($errors);
            }

            // Flat-rate shipping: free over $200, otherwise $10. Easy to swap.
            $shipping = $subtotal >= 200 ? 0.0 : 10.0;
            $total    = round($subtotal + $shipping, 2);

            $order = Order::create([
                'user_id'          => $userId,
                'status'           => Order::STATUS_PAID, // payment stub: see method docblock
                'subtotal'         => $subtotal,
                'shipping'         => $shipping,
                'total'            => $total,
                'currency'         => 'USD',
                'shipping_name'    => $payload['shipping_name'],
                'shipping_phone'   => $payload['shipping_phone'],
                'shipping_address' => $payload['shipping_address'],
                'shipping_city'    => $payload['shipping_city'],
                'shipping_country' => $payload['shipping_country'] ?? 'IQ',
                'shipping_notes'   => $payload['shipping_notes'] ?? null,
            ]);

            $touched = [];

            foreach ($rows as $row) {
                /** @var Product $p */
                $p = $row['product'];

                OrderItem::create([
                    'order_id'          => $order->id,
                    'product_id'        => $p->id,
                    'product_name'      => $p->name,
                    'product_sku'       => $p->sku,
                    'product_image_url' => $p->image_url,
                    'unit_price'        => $row['unit'],
                    'quantity'          => $row['qty'],
                    'line_total'        => $row['line'],
                ]);

                $p->decrement('stock', $row['qty']);
                $p->refresh();
                $touched[] = $p;
            }

            return [
                'order'   => $order->load('items'),
                'touched' => $touched,
            ];
        });

        // Broadcast stock changes after the transaction commits so listeners
        // always see the new value if they refetch via REST.
        foreach ($result['touched'] as $p) {
            ProductStockUpdated::dispatch($p);
        }

        return response()->json(['data' => new OrderResource($result['order'])], 201);
    }

    private function ensureOwner(Request $request, Order $order): void
    {
        $user = $request->user();
        if (! $user || ($order->user_id !== $user->id && ! $user->isAdmin())) {
            abort(404);
        }
    }
}
