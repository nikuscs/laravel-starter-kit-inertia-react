<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Aircraft;

final readonly class UpdateAircraft
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(Aircraft $aircraft, array $data): Aircraft
    {
        $aircraft->update($data);

        return $aircraft;
    }
}
