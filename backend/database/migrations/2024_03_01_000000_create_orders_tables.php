<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // pending → paid → shipped → delivered, or cancelled at any point.
            $table->string('status', 20)->default('pending')->index();

            // Money is stored as decimals; the currency is the same per-line.
            $table->decimal('subtotal', 12, 2);
            $table->decimal('shipping', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->string('currency', 3)->default('USD');

            // Shipping snapshot.
            $table->string('shipping_name');
            $table->string('shipping_phone', 40);
            $table->string('shipping_address');
            $table->string('shipping_city', 80);
            $table->string('shipping_country', 80)->default('IQ');
            $table->string('shipping_notes', 500)->nullable();

            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();

            // Snapshot product fields so the line item is durable even if the
            // product is later edited or deleted.
            $table->string('product_name');
            $table->string('product_sku', 64)->nullable();
            $table->string('product_image_url')->nullable();

            $table->decimal('unit_price', 12, 2);
            $table->unsignedInteger('quantity');
            $table->decimal('line_total', 12, 2);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
