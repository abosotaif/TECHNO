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
        User::firstOrCreate(
            ['email' => 'admin@vision-techno.test'],
            [
                'name'     => 'Admin',
                'password' => Hash::make('password'),
            ],
        );

        if (Product::count() === 0) {
            Product::factory()->count(24)->create();
        }
    }
}
