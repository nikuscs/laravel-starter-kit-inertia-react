<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Aircraft;

final readonly class CreateAircraft
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(array $data): Aircraft
    {
        return Aircraft::query()->create($data);
    }
}
