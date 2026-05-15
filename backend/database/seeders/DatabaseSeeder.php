<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@vision-techno.test'],
            [
                'name'     => 'Admin',
                'password' => Hash::make('password'),
                'is_admin' => true,
            ],
        );

        if (Product::count() === 0) {
            // 60 random products + 6 explicitly featured.
            Product::factory()->count(60)->create();
            Product::factory()->count(6)->featured()->create();
        }
    }
}
