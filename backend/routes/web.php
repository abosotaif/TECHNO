<?php

use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name'    => config('app.name'),
        'status'  => 'ok',
        'docs'    => '/api',
    ]);
});

// SEO: dynamic sitemap of public pages + active products.
Route::get('/sitemap.xml', SitemapController::class)->name('sitemap');
