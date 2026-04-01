<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\AircraftStatus;
use App\Models\Aircraft;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Aircraft>
 */
final class AircraftFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $manufacturers = [
            'Boeing' => ['737-800', '747-400', '777-300ER', '787-9'],
            'Airbus' => ['A320neo', 'A330-300', 'A350-900', 'A380-800'],
            'Cessna' => ['172 Skyhawk', '208 Caravan', 'Citation CJ4'],
            'Embraer' => ['E175', 'E190-E2', 'Phenom 300E'],
            'Bombardier' => ['CRJ-900', 'Global 7500', 'Challenger 350'],
        ];

        /** @var string $manufacturer */
        $manufacturer = fake()->randomElement(array_keys($manufacturers));

        return [
            'user_id' => User::factory(),
            'name' => mb_strtoupper(fake()->randomLetter().fake()->randomLetter()).'-'.fake()->unique()->numerify('###'),
            'model' => fake()->randomElement($manufacturers[$manufacturer]),
            'manufacturer' => $manufacturer,
            'location' => fake()->optional(0.8)->city(),
            'status' => fake()->randomElement(AircraftStatus::cases()),
            'notes' => fake()->optional(0.3)->sentence(),
            'purchased_at' => fake()->optional(0.7)->dateTimeBetween('-10 years', '-1 year'),
            'last_flight_at' => fake()->optional(0.6)->dateTimeBetween('-6 months', 'now'),
            'last_maintenance_at' => fake()->optional(0.5)->dateTimeBetween('-1 year', 'now'),
        ];
    }

    public function active(): self
    {
        return $this->state(fn (array $attributes): array => [
            'status' => AircraftStatus::Active,
        ]);
    }

    public function retired(): self
    {
        return $this->state(fn (array $attributes): array => [
            'status' => AircraftStatus::Retired,
        ]);
    }
}
