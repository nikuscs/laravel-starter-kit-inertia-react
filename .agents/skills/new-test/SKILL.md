---
name: new-test
description: Create a Pest test file with project patterns. Use when adding tests, writing test cases, or setting up test fixtures.
---

# Create New Test

## Test Infrastructure

- **Pest 5**: Test framework with expressive syntax
- **SQLite**: In-memory database for tests
- **Factories**: Model factories for test data
- **Laravel test helpers**: `actingAs()`, `assertRedirect()`, `assertInertia()`

## File Structure

```
tests/
  Feature/
    Actions/             # Tests for Action classes
    Http/
      Controllers/       # Tests for controller endpoints
    Models/              # Tests for model behavior
  Unit/                  # Pure unit tests (no database)
  Pest.php              # Pest configuration
  TestCase.php          # Base test case
```

## Test Pattern — Feature Test

Feature tests for controllers (the most common type):

```php
<?php

declare(strict_types=1);

use App\Models\User;

it('can view the dashboard', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard'));
});

it('redirects guests to login', function (): void {
    $this->get('/dashboard')
        ->assertRedirect('/login');
});
```

## Test Pattern — Action Test

```php
<?php

declare(strict_types=1);

use App\Actions\CreateUser;
use App\Models\User;

it('creates a user with valid attributes', function (): void {
    $action = new CreateUser;

    $user = $action->handle([
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ], 'password123');

    expect($user)
        ->toBeInstanceOf(User::class)
        ->name->toBe('John Doe')
        ->email->toBe('john@example.com');

    $this->assertDatabaseHas('users', [
        'email' => 'john@example.com',
    ]);
});
```

## Test Pattern — Validation Test

```php
<?php

declare(strict_types=1);

use App\Models\User;

it('validates required fields when creating', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/orders', [])
        ->assertSessionHasErrors(['product_id', 'quantity']);
});

it('validates quantity is positive', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/orders', [
            'product_id' => 1,
            'quantity' => -1,
        ])
        ->assertSessionHasErrors('quantity');
});
```

## Test Pattern — Model Test

```php
<?php

declare(strict_types=1);

use App\Models\Order;
use App\Models\User;

it('belongs to a user', function (): void {
    $order = Order::factory()->for(User::factory())->create();

    expect($order->user)
        ->toBeInstanceOf(User::class);
});
```

## Key Rules

- Use Pest's expressive syntax: `it()`, `expect()`, chained expectations
- Use model factories for ALL test data — never insert manually
- Test descriptions: lowercase, describe behavior (`'can update user profile'`)
- Test both success and error paths
- Test auth: use `actingAs()` for authenticated routes
- Test validation: assert `assertSessionHasErrors()`
- Test Inertia: use `assertInertia()` for page assertions
- Group related tests in the same file with `describe()` if needed
- No mocking framework internals — test behavior, not implementation

## Run Tests

```bash
# All tests
composer test:unit

# Specific file
php artisan test tests/Feature/Http/Controllers/OrderControllerTest.php

# Specific test
php artisan test --filter="can create an order"

# With coverage
XDEBUG_MODE="coverage" pest --parallel --coverage
```

## Naming Convention

Test file: `tests/Feature/Http/Controllers/OrderControllerTest.php`
- Feature tests mirror the `app/` structure
- Suffix with `Test.php`

## Final Check

1. Test file is in the correct directory
2. Uses factories for test data
3. Tests both happy path and error cases
4. Auth middleware tested (guest redirect, authorized access)
5. Run: `php artisan test <test-file>`
