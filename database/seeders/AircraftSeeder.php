<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Aircraft;
use App\Models\User;
use Illuminate\Database\Seeder;

final class AircraftSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $users = User::factory(3)->create();
        }

        $users->each(function (User $user): void {
            Aircraft::factory(5)->for($user)->create();
        });
    }
}
