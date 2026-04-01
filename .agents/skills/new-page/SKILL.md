---
name: new-page
description: Create an Inertia page with layout, types, and route. Use when adding a new page to the frontend.
---

# Create New Page

Inertia pages are React components that receive props from Laravel controllers. They should be thin — delegate heavy UI to components.

## 1. Create the Page Component

`resources/js/pages/{route-name}/{action}.tsx`:

```tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Orders', href: '/orders' },
];

interface OrdersIndexProps {
    orders: {
        data: App.Models.Order[];
        links: Record<string, string | null>;
        meta: { current_page: number; last_page: number };
    };
}

export default function OrdersIndex({ orders }: OrdersIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />
            <div className="flex flex-col gap-6 p-6">
                <h1 className="text-2xl font-bold">Orders</h1>
                {/* Extract to <OrderList /> component */}
            </div>
        </AppLayout>
    );
}
```

## 2. Page Path Convention

The page path must match the first argument of `Inertia::render()`:

| Controller | Inertia::render() | Page file |
|---|---|---|
| `OrderController@index` | `'orders/index'` | `pages/orders/index.tsx` |
| `OrderController@show` | `'orders/show'` | `pages/orders/show.tsx` |
| `UserProfileController@edit` | `'user-profile/edit'` | `pages/user-profile/edit.tsx` |

## 3. Layout Selection

Choose the layout based on the page type:

```tsx
// Authenticated pages with sidebar
import AppLayout from '@/layouts/app-layout';

// Auth pages (login, register)
import AuthLayout from '@/layouts/auth-layout';

// Settings pages
import SettingsLayout from '@/layouts/settings/layout';
```

## 4. Forms on Pages

Use Inertia's `useForm` for form state and submission:

```tsx
import { useForm } from '@inertiajs/react';

export default function CreateOrder() {
    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        quantity: 1,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/orders');
    }

    return (
        <form onSubmit={submit}>
            {/* Use Shadcn/ui Input, Button, etc. */}
        </form>
    );
}
```

## 5. Receiving Props

Props come from the controller. Type them explicitly:

```php
// Controller
return Inertia::render('orders/show', [
    'order' => $order->load('user'),
    'canEdit' => $request->user()->can('update', $order),
]);
```

```tsx
// Page
interface OrderShowProps {
    order: App.Models.Order & { user: App.Models.User };
    canEdit: boolean;
}

export default function OrderShow({ order, canEdit }: OrderShowProps) {
    // ...
}
```

## 6. Keep Pages Thin

- Extract lists to `<OrderList />` components
- Extract forms to `<CreateOrderForm />` components
- Extract complex UI sections to named components
- A page should ideally be under 50 lines

## 7. Final Check

1. Page file matches `Inertia::render()` path
2. Props are typed
3. Correct layout selected
4. Heavy UI extracted to components
5. `<Head title="..." />` is set
6. Breadcrumbs defined if using AppLayout
