<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'name'        => Str::title($name),
            'slug'        => Str::slug($name).'-'.Str::lower(Str::random(6)),
            'category'    => fake()->randomElement(['laptops', 'tablets', 'smartphones', 'accessories', 'monitors']),
            'brand'       => fake()->randomElement(['Apple', 'Samsung', 'HP', 'Dell', 'Lenovo', 'Asus', 'Sony']),
            'description' => fake()->paragraph(),
            'price'       => fake()->randomFloat(2, 49, 4500),
            'currency'    => 'USD',
            'stock'       => fake()->numberBetween(0, 250),
            'image_url'   => 'https://picsum.photos/seed/'.Str::random(8).'/600/400',
            'is_active'   => true,
        ];
    }
}
