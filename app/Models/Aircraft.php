<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AircraftStatus;
use Carbon\CarbonInterface;
use Database\Factories\AircraftFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read string $id
 * @property-read string $user_id
 * @property-read string $name
 * @property-read string $model
 * @property-read string $manufacturer
 * @property-read string|null $location
 * @property-read AircraftStatus $status
 * @property-read string|null $notes
 * @property-read CarbonInterface|null $purchased_at
 * @property-read CarbonInterface|null $last_flight_at
 * @property-read CarbonInterface|null $last_maintenance_at
 * @property-read CarbonInterface $created_at
 * @property-read CarbonInterface $updated_at
 */
final class Aircraft extends Model
{
    /** @use HasFactory<AircraftFactory> */
    use HasFactory;

    use HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'model',
        'manufacturer',
        'location',
        'status',
        'notes',
        'purchased_at',
        'last_flight_at',
        'last_maintenance_at',
    ];

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'status' => AircraftStatus::class,
            'purchased_at' => 'datetime',
            'last_flight_at' => 'datetime',
            'last_maintenance_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
