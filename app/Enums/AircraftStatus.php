<?php

declare(strict_types=1);

namespace App\Enums;

enum AircraftStatus: string
{
    case Active = 'active';
    case Maintenance = 'maintenance';
    case Storage = 'storage';
    case Retired = 'retired';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Maintenance => 'In Maintenance',
            self::Storage => 'In Storage',
            self::Retired => 'Retired',
        };
    }
}
