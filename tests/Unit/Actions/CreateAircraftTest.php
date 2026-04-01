<?php

declare(strict_types=1);

use App\Actions\CreateAircraft;
use App\Enums\AircraftStatus;
use App\Models\Aircraft;
use App\Models\User;

it('may create an aircraft', function (): void {
    $user = User::factory()->create();
    $action = resolve(CreateAircraft::class);

    $aircraft = $action->handle([
        'user_id' => $user->id,
        'name' => 'AB-123',
        'model' => '737-800',
        'manufacturer' => 'Boeing',
        'status' => AircraftStatus::Active,
        'location' => 'Hangar 3',
        'notes' => null,
        'purchased_at' => '2024-01-15',
        'last_flight_at' => null,
        'last_maintenance_at' => null,
    ]);

    expect($aircraft)->toBeInstanceOf(Aircraft::class)
        ->and($aircraft->name)->toBe('AB-123')
        ->and($aircraft->manufacturer)->toBe('Boeing')
        ->and($aircraft->status)->toBe(AircraftStatus::Active)
        ->and($aircraft->user_id)->toBe($user->id);
});
