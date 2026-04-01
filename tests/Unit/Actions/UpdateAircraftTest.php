<?php

declare(strict_types=1);

use App\Actions\UpdateAircraft;
use App\Enums\AircraftStatus;
use App\Models\Aircraft;

it('may update an aircraft', function (): void {
    $aircraft = Aircraft::factory()->create([
        'name' => 'Old Name',
        'status' => AircraftStatus::Active,
    ]);

    $action = resolve(UpdateAircraft::class);

    $updated = $action->handle($aircraft, [
        'name' => 'New Name',
        'status' => AircraftStatus::Maintenance,
    ]);

    expect($updated->name)->toBe('New Name')
        ->and($updated->status)->toBe(AircraftStatus::Maintenance);
});
