# Backend Rules

These rules apply to all PHP code under `app/`, `routes/`, `database/`, and `config/`.

## Classes

- Start every file with `declare(strict_types=1)`
- Make every class `final readonly` unless it extends a framework base class
- Models are `final` but not `readonly` — Eloquent requires mutable properties
- Put return types on every method. PHPStan level max enforces this

## Actions

Actions live in `app/Actions/`. One class, one job, one public method: `handle()`.

- Name: `VerbNoun` — `CreateUser`, `UpdateUserPassword`, `DeleteUser`
- Wrap multi-step mutations in `DB::transaction()`
- Mark password and secret parameters with `#[SensitiveParameter]`
- Don't put constructor logic in Actions — all inputs go through `handle()` parameters
- Don't call other Actions from an Action. Extract shared logic to a Service

## Controllers

Controllers live in `app/Http/Controllers/`. They accept input, delegate, and return a response. Nothing else.

- Don't put business logic in controllers — delegate to an Action
- Don't validate inline with `$request->validate()` — use a Form Request class
- Use `#[CurrentUser] User $user` for authenticated user injection
- Return `Inertia::render()` for pages, `to_route()` for redirects
- Controller classes are `final readonly`

## Form Requests

Form Requests live in `app/Http/Requests/`. They own all validation.

- Name: `VerbNounRequest` — `CreateOrderRequest`, `UpdateUserRequest`
- Type the `rules()` return as `array<string, ValidationRule|array<mixed>|string>`
- Use `Rule::unique()` and `Rule::exists()` for database validation rules

## Models

Models live in `app/Models/`.

- Always define `$fillable` — missing `$fillable` is a mass assignment vulnerability
- Always define `casts()` for non-string columns (integers, decimals, booleans, dates, enums)
- Always define `$hidden` for sensitive fields (passwords, tokens, secrets)
- Add `@property-read` PHPDoc annotations for every column — enables IDE autocompletion
- Type relationship returns with generics: `BelongsTo<User, $this>`
- Use PHP enums for status-like columns and cast them in `casts()`
- Use `HasUuids` when the primary key is a UUID

## Enums

Enums live in `app/Enums/`. Back them with strings:

```php
enum OrderStatus: string
{
    case Pending = 'pending';
    case Completed = 'completed';
}
```

## Routes

All web routes live in `routes/web.php`.

- Use controller class references: `[OrderController::class, 'index']`
- Closures are only acceptable for trivial Inertia renders: `fn () => Inertia::render('dashboard')`
- Group routes by middleware: `auth`, `guest`, `verified`
- Name routes with dot-notation: `orders.index`, `orders.show`
- State-changing operations use POST/PUT/PATCH/DELETE — never GET
- Don't duplicate middleware — group related routes under a single `middleware()` call

## Static Analysis

- PHPStan runs at level max. Don't lower it
- Don't add `@phpstan-ignore` without a comment explaining the specific reason
- Don't use `mixed` without justification — type everything
- Don't use loose comparisons (`==`). Use strict (`===`) — Pint enforces this

## Formatting

Pint runs automatically on save (via hook). The config is in `pint.json`.

- Don't fight Pint. If it reformats your code, that's the correct format
- `rector` applies automated refactoring rules. Run `rector --dry-run` to preview changes
