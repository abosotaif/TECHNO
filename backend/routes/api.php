<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API
|--------------------------------------------------------------------------
*/

Route::get('/health', fn () => response()->json(['status' => 'ok']));

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Public read-only product browsing.
Route::get('/products',                [ProductController::class, 'index']);
Route::get('/products/{product:slug}', [ProductController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Authenticated API (Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('/me',      [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // Orders (owner-only). Admin sees all via /api/admin/orders later.
    Route::get('/orders',          [OrderController::class, 'index']);
    Route::get('/orders/{order}',  [OrderController::class, 'show']);
    Route::post('/orders',         [OrderController::class, 'store']);

    // Admin-only mutations on products. EnsureAdmin middleware is added in step 3.
    Route::post('/products',            [ProductController::class, 'store']);
    Route::put('/products/{product}',   [ProductController::class, 'update']);
    Route::patch('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
});
