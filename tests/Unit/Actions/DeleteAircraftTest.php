<?php

declare(strict_types=1);

use App\Actions\DeleteAircraft;
use App\Models\Aircraft;

it('may delete an aircraft', function (): void {
    $aircraft = Aircraft::factory()->create();

    $action = resolve(DeleteAircraft::class);
    $action->handle($aircraft);

    expect(Aircraft::query()->find($aircraft->id))->toBeNull();
});
