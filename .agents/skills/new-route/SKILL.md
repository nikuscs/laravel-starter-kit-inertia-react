---
name: new-route
description: Create a new route with controller, action, form request, and Inertia page. Use when adding a new page, endpoint, or feature route.
---

# Create New Route

Routes stay thin. Controllers delegate to Actions. Pages delegate to components.

## 1. Define the Route

Add to `routes/web.php` following the existing patterns:

```php
// Resource-style
Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
});
```

Guidelines:

- Use controller class references, not closures (except trivial Inertia renders)
- Add appropriate middleware (`auth`, `guest`, `verified`)
- Use dot-notation for route names: `orders.index`, `orders.show`
- State-changing routes use POST/PUT/PATCH/DELETE

## 2. Create the Controller

`app/Http/Controllers/{Name}Controller.php`:

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateOrder;
use App\Http\Requests\CreateOrderRequest;
use App\Models\Order;
use Illuminate\Container\Attributes\CurrentUser;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final readonly class OrderController
{
    public function index(): Response
    {
        return Inertia::render('orders/index', [
            'orders' => Order::query()->latest()->paginate(),
        ]);
    }

    public function show(Order $order): Response
    {
        return Inertia::render('orders/show', [
            'order' => $order,
        ]);
    }

    public function store(CreateOrderRequest $request, #[CurrentUser] User $user, CreateOrder $action): RedirectResponse
    {
        $action->handle($user, $request->validated());

        return to_route('orders.index');
    }
}
```

Guidelines:

- `final readonly` class
- Thin methods — delegate to Actions for business logic
- Use Form Requests for validation
- Use `#[CurrentUser]` for auth user access
- Return `Inertia::render()` for pages, `to_route()` for redirects

## 3. Create the Form Request (if needed)

`app/Http/Requests/{Verb}{Noun}Request.php`:

```php
<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

final class CreateOrderRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ];
    }
}
```

## 4. Create the Action (if needed)

`app/Actions/{VerbNoun}.php`:

```php
<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Order;
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

## 5. Create the Inertia Page

`resources/js/pages/{route-name}/{action}.tsx`:

```tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orders', href: '/orders' },
];

export default function OrdersIndex({ orders }: { orders: App.Models.Order[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />
            {/* Page content — keep thin, extract to components */}
        </AppLayout>
    );
}
```

## 6. Avoid These Mistakes

- No business logic in controllers — use Actions
- No inline validation in controllers — use Form Requests
- No closures in routes for anything non-trivial
- No hardcoded URLs in React — use Wayfinder helpers
- No heavy UI in pages — extract to components

## 7. Final Check

Before stopping:

1. Route is registered in `routes/web.php` with correct middleware
2. Controller is `final readonly` and thin
3. Form Request handles validation
4. Action handles business logic
5. Inertia page exists at the correct path
6. Run `composer test:lint && composer test:types`
