<?php

declare(strict_types=1);

use App\Enums\AircraftStatus;
use App\Models\Aircraft;
use App\Models\User;

beforeEach(function (): void {
    config()->set('inertia.ssr.enabled', false);
});

it('renders aircraft index page with only own aircraft', function (): void {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    Aircraft::factory(3)->for($user)->create();
    Aircraft::factory(2)->for($otherUser)->create();

    $response = $this->actingAs($user)
        ->get(route('aircraft.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('aircraft/index')
            ->has('aircraft.data', 3));
});

it('paginates aircraft at 10 per page', function (): void {
    $user = User::factory()->create();
    Aircraft::factory(15)->for($user)->create();

    $response = $this->actingAs($user)
        ->get(route('aircraft.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('aircraft.data', 10)
            ->where('aircraft.last_page', 2));
});

it('renders create form', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->get(route('aircraft.create'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('aircraft/create')
            ->has('statuses'));
});

it('may store a new aircraft', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('aircraft.store'), [
            'name' => 'AB-001',
            'model' => '737-800',
            'manufacturer' => 'Boeing',
            'status' => 'active',
            'location' => 'Hangar 3',
            'notes' => null,
            'purchased_at' => '2024-01-15',
            'last_flight_at' => null,
            'last_maintenance_at' => null,
        ]);

    $aircraft = Aircraft::query()->where('name', 'AB-001')->first();

    $response->assertRedirectToRoute('aircraft.show', $aircraft);

    expect($aircraft)->not->toBeNull()
        ->and($aircraft->manufacturer)->toBe('Boeing')
        ->and($aircraft->status)->toBe(AircraftStatus::Active)
        ->and($aircraft->user_id)->toBe($user->id);
});

it('renders show page for own aircraft', function (): void {
    $user = User::factory()->create();
    $aircraft = Aircraft::factory()->for($user)->create();

    $response = $this->actingAs($user)
        ->get(route('aircraft.show', $aircraft));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('aircraft/show')
            ->has('aircraft'));
});

it('forbids viewing another user aircraft', function (): void {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $aircraft = Aircraft::factory()->for($otherUser)->create();

    $response = $this->actingAs($user)
        ->get(route('aircraft.show', $aircraft));

    $response->assertForbidden();
});

it('renders edit form for own aircraft', function (): void {
    $user = User::factory()->create();
    $aircraft = Aircraft::factory()->for($user)->create();

    $response = $this->actingAs($user)
        ->get(route('aircraft.edit', $aircraft));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('aircraft/edit')
            ->has('aircraft')
            ->has('statuses'));
});

it('may update own aircraft', function (): void {
    $user = User::factory()->create();
    $aircraft = Aircraft::factory()->for($user)->create(['name' => 'Old Name']);

    $response = $this->actingAs($user)
        ->put(route('aircraft.update', $aircraft), [
            'name' => 'New Name',
            'model' => $aircraft->model,
            'manufacturer' => $aircraft->manufacturer,
            'status' => $aircraft->status->value,
            'location' => $aircraft->location,
            'notes' => $aircraft->notes,
            'purchased_at' => $aircraft->purchased_at?->toDateString(),
            'last_flight_at' => $aircraft->last_flight_at?->toDateString(),
            'last_maintenance_at' => $aircraft->last_maintenance_at?->toDateString(),
        ]);

    $response->assertRedirectToRoute('aircraft.show', $aircraft);

    expect($aircraft->refresh()->name)->toBe('New Name');
});

it('forbids updating another user aircraft', function (): void {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $aircraft = Aircraft::factory()->for($otherUser)->create();

    $response = $this->actingAs($user)
        ->put(route('aircraft.update', $aircraft), [
            'name' => 'Hijacked',
            'model' => $aircraft->model,
            'manufacturer' => $aircraft->manufacturer,
            'status' => $aircraft->status->value,
        ]);

    $response->assertForbidden();
});

it('may delete own aircraft', function (): void {
    $user = User::factory()->create();
    $aircraft = Aircraft::factory()->for($user)->create();

    $response = $this->actingAs($user)
        ->delete(route('aircraft.destroy', $aircraft));

    $response->assertRedirectToRoute('aircraft.index');

    expect(Aircraft::query()->find($aircraft->id))->toBeNull();
});

it('forbids deleting another user aircraft', function (): void {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $aircraft = Aircraft::factory()->for($otherUser)->create();

    $response = $this->actingAs($user)
        ->delete(route('aircraft.destroy', $aircraft));

    $response->assertForbidden();
});

it('requires authentication', function (): void {
    $response = $this->get(route('aircraft.index'));

    $response->assertRedirect(route('login'));
});

it('requires name when storing', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->fromRoute('aircraft.create')
        ->post(route('aircraft.store'), [
            'model' => '737-800',
            'manufacturer' => 'Boeing',
            'status' => 'active',
        ]);

    $response->assertRedirectToRoute('aircraft.create')
        ->assertSessionHasErrors('name');
});

it('requires valid status when storing', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->fromRoute('aircraft.create')
        ->post(route('aircraft.store'), [
            'name' => 'AB-001',
            'model' => '737-800',
            'manufacturer' => 'Boeing',
            'status' => 'invalid-status',
        ]);

    $response->assertRedirectToRoute('aircraft.create')
        ->assertSessionHasErrors('status');
});
