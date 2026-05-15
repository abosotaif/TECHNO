<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * Realistic-looking sample data for a tech retailer demo.
     * Each category has a curated brand pool and price band so the seeded
     * catalog feels plausible rather than uniform Faker noise.
     */
    private const CATALOG = [
        'laptops' => [
            'brands'  => ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI'],
            'models'  => ['ProBook', 'Inspiron', 'XPS', 'ThinkPad', 'ZenBook', 'VivoBook', 'Aspire', 'Modern'],
            'price'   => [499, 3299],
        ],
        'tablets' => [
            'brands'  => ['Apple', 'Samsung', 'Lenovo', 'Huawei', 'Xiaomi'],
            'models'  => ['Tab', 'Pad', 'iPad', 'Galaxy Tab'],
            'price'   => [149, 1599],
        ],
        'smartphones' => [
            'brands'  => ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Google', 'Honor'],
            'models'  => ['Pro', 'Ultra', 'Plus', 'Lite', 'Edge', 'Note'],
            'price'   => [199, 1899],
        ],
        'accessories' => [
            'brands'  => ['Logitech', 'Anker', 'Belkin', 'JBL', 'Sony', 'UGREEN'],
            'models'  => ['Hub', 'Charger', 'Headphones', 'Mouse', 'Keyboard', 'Cable', 'Stand'],
            'price'   => [9, 299],
        ],
        'monitors' => [
            'brands'  => ['Dell', 'LG', 'Samsung', 'BenQ', 'Asus', 'Acer'],
            'models'  => ['UltraSharp', 'UltraGear', 'ProArt', 'Odyssey', 'Predator'],
            'price'   => [129, 1499],
        ],
    ];

    public function definition(): array
    {
        $category = fake()->randomElement(array_keys(self::CATALOG));
        $cat      = self::CATALOG[$category];

        $brand    = fake()->randomElement($cat['brands']);
        $model    = fake()->randomElement($cat['models']);
        $variant  = strtoupper(fake()->bothify('?#?#'));

        $name      = trim("{$brand} {$model} {$variant}");
        $price     = fake()->randomFloat(2, $cat['price'][0], $cat['price'][1]);
        $hasSale   = fake()->boolean(30);
        $original  = $hasSale ? round($price * fake()->randomFloat(2, 1.1, 1.4), 2) : null;

        return [
            'name'           => $name,
            'slug'           => Str::slug($name).'-'.Str::lower(Str::random(6)),
            'sku'            => strtoupper(Str::substr($brand, 0, 3)).'-'.Str::upper(Str::random(8)),
            'category'       => $category,
            'brand'          => $brand,
            'description'    => fake()->paragraphs(2, true),
            'price'          => $price,
            'original_price' => $original,
            'currency'       => 'USD',
            'stock'          => fake()->numberBetween(0, 250),
            'image_url'      => 'https://picsum.photos/seed/'.Str::random(8).'/800/600',
            'is_active'      => true,
            'is_featured'    => fake()->boolean(20),
        ];
    }

    public function featured(): static
    {
        return $this->state(fn () => ['is_featured' => true]);
    }
}
