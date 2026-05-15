<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| products.{productId} is intentionally a public channel — anyone browsing a
| product page can subscribe. No authorization callback is needed.
|
| Add private channels here if/when we introduce per-user notifications.
*/

// Example for the future:
// Broadcast::channel('orders.{orderId}', function ($user, int $orderId) {
//     return Order::where('id', $orderId)->where('user_id', $user->id)->exists();
// });
