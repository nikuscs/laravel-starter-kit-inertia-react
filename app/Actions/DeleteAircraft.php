<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Aircraft;

final readonly class DeleteAircraft
{
    public function handle(Aircraft $aircraft): void
    {
        $aircraft->delete();
    }
}
