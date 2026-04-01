<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\AircraftStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class CreateAircraftRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'manufacturer' => ['required', 'string', 'max:255'],
            'status' => ['required', Rule::enum(AircraftStatus::class)],
            'location' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'purchased_at' => ['nullable', 'date'],
            'last_flight_at' => ['nullable', 'date'],
            'last_maintenance_at' => ['nullable', 'date'],
        ];
    }
}
