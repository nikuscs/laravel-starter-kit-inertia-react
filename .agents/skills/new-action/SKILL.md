---
name: new-action
description: Create a Laravel Action class. Use when adding business logic that should live in a single-purpose action class.
---

# Create New Action

Actions are single-purpose classes that encapsulate business logic. They live in `app/Actions/` and have one public method: `handle()`.

## 1. Check for Existing Actions

Before creating, search `app/Actions/` for similar functionality:

```bash
ls app/Actions/
```

## 2. Create the Action

`app/Actions/{VerbNoun}.php`:

```php
<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\User;
use Illuminate\Support\Facades\DB;

final readonly class CreateOrder
{
    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(User $user, array $attributes): Order
    {
        return DB::transaction(function () use ($user, $attributes): Order {
            return $user->orders()->create($attributes);
        });
    }
}
```

## Conventions

- **Class name**: `VerbNoun` — `CreateUser`, `UpdateUserPassword`, `DeleteUser`
- **Class declaration**: `final readonly class`
- **Single method**: `handle()` — no other public methods
- **Return type**: always declare it
- **Transactions**: wrap multi-step mutations in `DB::transaction()`
- **Events**: dispatch events after mutations when needed (`event(new OrderCreated($order))`)
- **`#[SensitiveParameter]`**: on any password or secret parameter

## Patterns From This Project

### Simple create

```php
final readonly class CreateUser
{
    public function handle(array $attributes, #[SensitiveParameter] string $password): User
    {
        return DB::transaction(function () use ($attributes, $password): User {
            $user = User::query()->create([...$attributes, 'password' => $password]);
            event(new Registered($user));
            return $user;
        });
    }
}
```

### Simple update

```php
final readonly class UpdateUser
{
    public function handle(User $user, array $attributes): void
    {
        $user->update($attributes);
    }
}
```

### Delete with side effects

```php
final readonly class DeleteUser
{
    public function handle(User $user): void
    {
        $user->delete();
    }
}
```

## 3. Wire It Up

Actions are injected via constructor injection in controllers:

```php
public function store(CreateOrderRequest $request, #[CurrentUser] User $user, CreateOrder $action): RedirectResponse
{
    $action->handle($user, $request->validated());
    return to_route('orders.index');
}
```

Laravel's service container auto-resolves the Action — no manual binding needed.

## 4. Final Check

1. Class is `final readonly`
2. Only one public method: `handle()`
3. Return type declared
4. `declare(strict_types=1)` at top
5. Multi-step mutations wrapped in `DB::transaction()`
6. Sensitive parameters annotated with `#[SensitiveParameter]`
