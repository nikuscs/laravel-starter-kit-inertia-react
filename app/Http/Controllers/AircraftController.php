<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateAircraft;
use App\Actions\DeleteAircraft;
use App\Actions\UpdateAircraft;
use App\Enums\AircraftStatus;
use App\Http\Requests\CreateAircraftRequest;
use App\Http\Requests\UpdateAircraftRequest;
use App\Models\Aircraft;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final readonly class AircraftController
{
    public function index(#[CurrentUser] User $user): Response
    {
        return Inertia::render('aircraft/index', [
            'aircraft' => $user->aircraft()
                ->latest()
                ->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('aircraft/create', [
            'statuses' => AircraftStatus::cases(),
        ]);
    }

    public function store(CreateAircraftRequest $request, #[CurrentUser] User $user, CreateAircraft $action): RedirectResponse
    {
        $aircraft = $action->handle([...$request->validated(), 'user_id' => $user->id]);

        Inertia::flash('success', 'Aircraft created.');

        return to_route('aircraft.show', $aircraft);
    }

    public function show(#[CurrentUser] User $user, Aircraft $aircraft): Response
    {
        abort_unless($aircraft->user_id === $user->id, 403);

        return Inertia::render('aircraft/show', [
            'aircraft' => $aircraft,
        ]);
    }

    public function edit(#[CurrentUser] User $user, Aircraft $aircraft): Response
    {
        abort_unless($aircraft->user_id === $user->id, 403);

        return Inertia::render('aircraft/edit', [
            'aircraft' => $aircraft,
            'statuses' => AircraftStatus::cases(),
        ]);
    }

    public function update(UpdateAircraftRequest $request, #[CurrentUser] User $user, Aircraft $aircraft, UpdateAircraft $action): RedirectResponse
    {
        abort_unless($aircraft->user_id === $user->id, 403);

        $action->handle($aircraft, $request->validated());

        Inertia::flash('success', 'Aircraft updated.');

        return to_route('aircraft.show', $aircraft);
    }

    public function destroy(#[CurrentUser] User $user, Aircraft $aircraft, DeleteAircraft $action): RedirectResponse
    {
        abort_unless($aircraft->user_id === $user->id, 403);

        $action->handle($aircraft);

        Inertia::flash('success', 'Aircraft deleted.');

        return to_route('aircraft.index');
    }
}
