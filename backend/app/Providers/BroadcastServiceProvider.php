<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Loads broadcasting routes and the channel authorization callbacks
        // defined in routes/channels.php.
        Broadcast::routes();

        require base_path('routes/channels.php');
    }
}
