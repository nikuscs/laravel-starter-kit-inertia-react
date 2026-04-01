# Aircraft Inventory — Implementation Plan

Single-page CRUD feature for managing airplane inventory. One table, user-scoped, Inertia-based, mobile-first UI with Shadcn/ui. Each user sees only their own aircraft.

## Naming

- **Model**: `Aircraft` (industry standard, same singular/plural)
- **Table**: `aircraft`
- **Route prefix**: `/aircraft`
- **Pages directory**: `resources/js/pages/aircraft/`

## Schema: `aircraft`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | primary key (HasUuids) |
| `user_id` | foreignUuid | required — FK to users, cascadeOnDelete |
| `name` | string | required, max:255 — friendly name or tail number |
| `model` | string | required, max:255 — e.g. "Cessna 172", "737-800" |
| `manufacturer` | string | required, max:255 — e.g. "Boeing", "Cessna" |
| `location` | string(255) | nullable — free text, e.g. "Hangar 3, KJFK" |
| `status` | string | required — backed by AircraftStatus enum |
| `notes` | text | nullable — free-form |
| `purchased_at` | timestamp | nullable |
| `last_flight_at` | timestamp | nullable |
| `last_maintenance_at` | timestamp | nullable |
| `created_at` | timestamp | auto |
| `updated_at` | timestamp | auto |

No soft deletes. Single table. FK to `users` with cascade delete — when a user is deleted, their aircraft go too.

---

## Code Snippets

### Enum: `app/Enums/AircraftStatus.php`

```php
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
```

### Migration: `database/migrations/xxxx_create_aircraft_table.php`

```php
<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aircraft', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('model');
            $table->string('manufacturer');
            $table->string('location')->nullable();
            $table->string('status');
            $table->text('notes')->nullable();
            $table->timestamp('purchased_at')->nullable();
            $table->timestamp('last_flight_at')->nullable();
            $table->timestamp('last_maintenance_at')->nullable();
            $table->timestamps();
        });
    }
};
```

### Model: `app/Models/Aircraft.php`

```php
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
```

### User model addition: `app/Models/User.php`

Add the `aircraft()` relationship to the existing User model:

```php
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @return HasMany<Aircraft, $this>
 */
public function aircraft(): HasMany
{
    return $this->hasMany(Aircraft::class);
}
```

### Factory: `database/factories/AircraftFactory.php`

```php
<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\AircraftStatus;
use App\Models\Aircraft;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Aircraft>
 */
final class AircraftFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $manufacturers = [
            'Boeing' => ['737-800', '747-400', '777-300ER', '787-9'],
            'Airbus' => ['A320neo', 'A330-300', 'A350-900', 'A380-800'],
            'Cessna' => ['172 Skyhawk', '208 Caravan', 'Citation CJ4'],
            'Embraer' => ['E175', 'E190-E2', 'Phenom 300E'],
            'Bombardier' => ['CRJ-900', 'Global 7500', 'Challenger 350'],
        ];

        $manufacturer = fake()->randomElement(array_keys($manufacturers));

        return [
            'user_id' => User::factory(),
            'name' => strtoupper(fake()->randomLetter() . fake()->randomLetter()) . '-' . fake()->unique()->numerify('###'),
            'model' => fake()->randomElement($manufacturers[$manufacturer]),
            'manufacturer' => $manufacturer,
            'location' => fake()->optional(0.8)->city(),
            'status' => fake()->randomElement(AircraftStatus::cases()),
            'notes' => fake()->optional(0.3)->sentence(),
            'purchased_at' => fake()->optional(0.7)->dateTimeBetween('-10 years', '-1 year'),
            'last_flight_at' => fake()->optional(0.6)->dateTimeBetween('-6 months', 'now'),
            'last_maintenance_at' => fake()->optional(0.5)->dateTimeBetween('-1 year', 'now'),
        ];
    }

    public function active(): self
    {
        return $this->state(fn (array $attributes): array => [
            'status' => AircraftStatus::Active,
        ]);
    }

    public function retired(): self
    {
        return $this->state(fn (array $attributes): array => [
            'status' => AircraftStatus::Retired,
        ]);
    }
}
```

### Seeder: `database/seeders/AircraftSeeder.php`

```php
<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Aircraft;
use App\Models\User;
use Illuminate\Database\Seeder;

final class AircraftSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $users = User::factory(3)->create();
        }

        $users->each(function (User $user): void {
            Aircraft::factory(5)->for($user)->create();
        });
    }
}
```

### DatabaseSeeder update: `database/seeders/DatabaseSeeder.php`

```php
// Add to run():
$this->call([
    AircraftSeeder::class,
]);
```

### Actions: `app/Actions/CreateAircraft.php`

```php
<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Aircraft;

final readonly class CreateAircraft
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(array $data): Aircraft
    {
        return Aircraft::query()->create($data);
    }
}
```

### Actions: `app/Actions/UpdateAircraft.php`

```php
<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Aircraft;

final readonly class UpdateAircraft
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(Aircraft $aircraft, array $data): Aircraft
    {
        $aircraft->update($data);

        return $aircraft;
    }
}
```

### Actions: `app/Actions/DeleteAircraft.php`

```php
<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Aircraft;

final readonly class DeleteAircraft
{
    public function handle(Aircraft $aircraft): void
    {
        $aircraft->delete();
    }
}
```

### Form Request: `app/Http/Requests/CreateAircraftRequest.php`

```php
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
```

### Form Request: `app/Http/Requests/UpdateAircraftRequest.php`

```php
<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\AircraftStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateAircraftRequest extends FormRequest
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
```

### Controller: `app/Http/Controllers/AircraftController.php`

```php
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

        return to_route('aircraft.show', $aircraft);
    }

    public function destroy(#[CurrentUser] User $user, Aircraft $aircraft, DeleteAircraft $action): RedirectResponse
    {
        abort_unless($aircraft->user_id === $user->id, 403);

        $action->handle($aircraft);

        return to_route('aircraft.index');
    }
}
```

### Routes: `routes/web.php` (addition)

```php
// Inside the existing Route::middleware(['auth', 'verified'])->group(...)
Route::resource('aircraft', AircraftController::class);
```

### TypeScript Type: `resources/js/types/aircraft.ts`

```ts
export type AircraftStatus = 'active' | 'maintenance' | 'storage' | 'retired';

export type Aircraft = {
    id: string;
    name: string;
    model: string;
    manufacturer: string;
    location: string | null;
    status: AircraftStatus;
    notes: string | null;
    purchased_at: string | null;
    last_flight_at: string | null;
    last_maintenance_at: string | null;
    created_at: string;
    updated_at: string;
};

export type PaginatedAircraft = {
    data: Aircraft[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        per_page: number;
        to: number | null;
        total: number;
    };
};
```

Update `resources/js/types/index.ts`:

```ts
export type * from './auth';
export type * from './navigation';
export type * from './ui';
export type * from './aircraft';
```

### Sidebar: `resources/js/components/app-sidebar.tsx` (change)

```tsx
import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Plane } from 'lucide-react';
// ... existing imports
import { dashboard } from '@/routes';
import { index as aircraftIndex } from '@/routes/aircraft';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Aircraft',
        href: aircraftIndex(),
        icon: Plane,
    },
];

// ... rest unchanged
```

### Component: `resources/js/components/aircraft-form.tsx`

```tsx
import { Form } from '@inertiajs/react';
import AircraftController from '@/actions/App/Http/Controllers/AircraftController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Aircraft, AircraftStatus } from '@/types';

interface AircraftFormProps {
    aircraft?: Aircraft;
    statuses: { value: AircraftStatus; label: string }[];
}

const statusLabels: Record<AircraftStatus, string> = {
    active: 'Active',
    maintenance: 'In Maintenance',
    storage: 'In Storage',
    retired: 'Retired',
};

export default function AircraftForm({ aircraft, statuses }: AircraftFormProps) {
    const isEditing = !!aircraft;

    const formAction = isEditing
        ? AircraftController.update.form({ aircraft: aircraft.id })
        : AircraftController.store.form();

    return (
        <Form
            {...formAction}
            className="space-y-6"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={aircraft?.name}
                                required
                                placeholder="e.g. AB-123"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="manufacturer">Manufacturer</Label>
                            <Input
                                id="manufacturer"
                                name="manufacturer"
                                defaultValue={aircraft?.manufacturer}
                                required
                                placeholder="e.g. Boeing"
                            />
                            <InputError message={errors.manufacturer} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="model">Model</Label>
                            <Input
                                id="model"
                                name="model"
                                defaultValue={aircraft?.model}
                                required
                                placeholder="e.g. 737-800"
                            />
                            <InputError message={errors.model} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" defaultValue={aircraft?.status ?? 'active'}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {statusLabels[status.value]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                name="location"
                                defaultValue={aircraft?.location ?? ''}
                                placeholder="e.g. Hangar 3, KJFK"
                            />
                            <InputError message={errors.location} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="purchased_at">Purchased</Label>
                            <Input
                                id="purchased_at"
                                name="purchased_at"
                                type="date"
                                defaultValue={aircraft?.purchased_at?.split('T')[0] ?? ''}
                            />
                            <InputError message={errors.purchased_at} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="last_flight_at">Last flight</Label>
                            <Input
                                id="last_flight_at"
                                name="last_flight_at"
                                type="date"
                                defaultValue={aircraft?.last_flight_at?.split('T')[0] ?? ''}
                            />
                            <InputError message={errors.last_flight_at} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="last_maintenance_at">Last maintenance</Label>
                            <Input
                                id="last_maintenance_at"
                                name="last_maintenance_at"
                                type="date"
                                defaultValue={aircraft?.last_maintenance_at?.split('T')[0] ?? ''}
                            />
                            <InputError message={errors.last_maintenance_at} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <textarea
                            id="notes"
                            name="notes"
                            defaultValue={aircraft?.notes ?? ''}
                            rows={3}
                            className="border-input bg-transparent placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none"
                            placeholder="Any additional notes..."
                        />
                        <InputError message={errors.notes} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>
                            {isEditing ? 'Update aircraft' : 'Add aircraft'}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
```

### Component: `resources/js/components/delete-aircraft.tsx`

```tsx
import { Form } from '@inertiajs/react';
import AircraftController from '@/actions/App/Http/Controllers/AircraftController';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export default function DeleteAircraft({ aircraftId, aircraftName }: { aircraftId: string; aircraftName: string }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Delete aircraft</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete <strong>{aircraftName}</strong>? This action cannot be undone.
                </DialogDescription>

                <Form {...AircraftController.destroy.form({ aircraft: aircraftId })}>
                    {({ processing }) => (
                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button variant="destructive" disabled={processing} asChild>
                                <button type="submit">Delete</button>
                            </Button>
                        </DialogFooter>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
```

### Page: `resources/js/pages/aircraft/index.tsx`

```tsx
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import DeleteAircraft from '@/components/delete-aircraft';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { index as aircraftIndex, create, show, edit } from '@/routes/aircraft';
import type { BreadcrumbItem, PaginatedAircraft } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Aircraft', href: aircraftIndex() },
];

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    maintenance: 'outline',
    storage: 'secondary',
    retired: 'destructive',
};

const statusLabel: Record<string, string> = {
    active: 'Active',
    maintenance: 'In Maintenance',
    storage: 'In Storage',
    retired: 'Retired',
};

export default function Index({ aircraft }: { aircraft: PaginatedAircraft }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Aircraft" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">Aircraft</h1>
                    <Button asChild size="sm">
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add aircraft
                        </Link>
                    </Button>
                </div>

                {aircraft.data.length === 0 ? (
                    <p className="text-muted-foreground py-12 text-center text-sm">
                        No aircraft yet. Add your first one to get started.
                    </p>
                ) : (
                    <div className="grid gap-3">
                        {aircraft.data.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border"
                            >
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{item.name}</span>
                                        <Badge variant={statusVariant[item.status]}>
                                            {statusLabel[item.status]}
                                        </Badge>
                                    </div>
                                    <p className="text-muted-foreground text-sm">
                                        {item.manufacturer} {item.model}
                                        {item.location && <> &middot; {item.location}</>}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={show({ aircraft: item.id })}>View</Link>
                                    </Button>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={edit({ aircraft: item.id })}>Edit</Link>
                                    </Button>
                                    <DeleteAircraft aircraftId={item.id} aircraftName={item.name} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {aircraft.meta.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {aircraft.links.prev && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={aircraft.links.prev}>Previous</Link>
                            </Button>
                        )}
                        <span className="text-muted-foreground text-sm">
                            Page {aircraft.meta.current_page} of {aircraft.meta.last_page}
                        </span>
                        {aircraft.links.next && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={aircraft.links.next}>Next</Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
```

### Page: `resources/js/pages/aircraft/show.tsx`

```tsx
import { Head, Link } from '@inertiajs/react';
import DeleteAircraft from '@/components/delete-aircraft';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { index as aircraftIndex, edit } from '@/routes/aircraft';
import type { Aircraft, BreadcrumbItem } from '@/types';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    maintenance: 'outline',
    storage: 'secondary',
    retired: 'destructive',
};

const statusLabel: Record<string, string> = {
    active: 'Active',
    maintenance: 'In Maintenance',
    storage: 'In Storage',
    retired: 'Retired',
};

function formatDate(dateString: string | null): string | null {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function Show({ aircraft }: { aircraft: Aircraft }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Aircraft', href: aircraftIndex() },
        { title: aircraft.name, href: aircraftIndex() },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={aircraft.name} />

            <div className="flex flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CardTitle className="text-xl">{aircraft.name}</CardTitle>
                                <Badge variant={statusVariant[aircraft.status]}>
                                    {statusLabel[aircraft.status]}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={edit({ aircraft: aircraft.id })}>Edit</Link>
                                </Button>
                                <DeleteAircraft aircraftId={aircraft.id} aircraftName={aircraft.name} />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <p className="text-muted-foreground text-sm">Manufacturer</p>
                                <p className="font-medium">{aircraft.manufacturer}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm">Model</p>
                                <p className="font-medium">{aircraft.model}</p>
                            </div>
                            {aircraft.location && (
                                <div>
                                    <p className="text-muted-foreground text-sm">Location</p>
                                    <p className="font-medium">{aircraft.location}</p>
                                </div>
                            )}
                        </div>

                        {(aircraft.purchased_at || aircraft.last_flight_at || aircraft.last_maintenance_at) && (
                            <>
                                <Separator />
                                <div className="grid gap-4 sm:grid-cols-3">
                                    {aircraft.purchased_at && (
                                        <div>
                                            <p className="text-muted-foreground text-sm">Purchased</p>
                                            <p className="font-medium">{formatDate(aircraft.purchased_at)}</p>
                                        </div>
                                    )}
                                    {aircraft.last_flight_at && (
                                        <div>
                                            <p className="text-muted-foreground text-sm">Last flight</p>
                                            <p className="font-medium">{formatDate(aircraft.last_flight_at)}</p>
                                        </div>
                                    )}
                                    {aircraft.last_maintenance_at && (
                                        <div>
                                            <p className="text-muted-foreground text-sm">Last maintenance</p>
                                            <p className="font-medium">{formatDate(aircraft.last_maintenance_at)}</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {aircraft.notes && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-muted-foreground mb-1 text-sm">Notes</p>
                                    <p className="text-sm">{aircraft.notes}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
```

### Page: `resources/js/pages/aircraft/create.tsx`

```tsx
import { Head } from '@inertiajs/react';
import AircraftForm from '@/components/aircraft-form';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index as aircraftIndex, create } from '@/routes/aircraft';
import type { AircraftStatus, BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Aircraft', href: aircraftIndex() },
    { title: 'Add aircraft', href: create() },
];

export default function Create({ statuses }: { statuses: { value: AircraftStatus; label: string }[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add aircraft" />

            <div className="flex flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <Heading title="Add aircraft" description="Add a new aircraft to your inventory" />
                    </CardHeader>
                    <CardContent>
                        <AircraftForm statuses={statuses} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
```

### Page: `resources/js/pages/aircraft/edit.tsx`

```tsx
import { Head } from '@inertiajs/react';
import AircraftForm from '@/components/aircraft-form';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index as aircraftIndex, edit } from '@/routes/aircraft';
import type { Aircraft, AircraftStatus, BreadcrumbItem } from '@/types';

export default function Edit({
    aircraft,
    statuses,
}: {
    aircraft: Aircraft;
    statuses: { value: AircraftStatus; label: string }[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Aircraft', href: aircraftIndex() },
        { title: aircraft.name, href: edit({ aircraft: aircraft.id }) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${aircraft.name}`} />

            <div className="flex flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <Heading title={`Edit ${aircraft.name}`} description="Update aircraft details" />
                    </CardHeader>
                    <CardContent>
                        <AircraftForm aircraft={aircraft} statuses={statuses} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
```

### Unit Test: `tests/Unit/Actions/CreateAircraftTest.php`

```php
<?php

declare(strict_types=1);

use App\Actions\CreateAircraft;
use App\Enums\AircraftStatus;
use App\Models\Aircraft;
use App\Models\User;

it('may create an aircraft', function (): void {
    $user = User::factory()->create();
    $action = resolve(CreateAircraft::class);

    $aircraft = $action->handle([
        'user_id' => $user->id,
        'name' => 'AB-123',
        'model' => '737-800',
        'manufacturer' => 'Boeing',
        'status' => AircraftStatus::Active,
        'location' => 'Hangar 3',
        'notes' => null,
        'purchased_at' => '2024-01-15',
        'last_flight_at' => null,
        'last_maintenance_at' => null,
    ]);

    expect($aircraft)->toBeInstanceOf(Aircraft::class)
        ->and($aircraft->name)->toBe('AB-123')
        ->and($aircraft->manufacturer)->toBe('Boeing')
        ->and($aircraft->status)->toBe(AircraftStatus::Active)
        ->and($aircraft->user_id)->toBe($user->id);
});
```

### Unit Test: `tests/Unit/Actions/UpdateAircraftTest.php`

```php
<?php

declare(strict_types=1);

use App\Actions\UpdateAircraft;
use App\Enums\AircraftStatus;
use App\Models\Aircraft;

it('may update an aircraft', function (): void {
    $aircraft = Aircraft::factory()->create([
        'name' => 'Old Name',
        'status' => AircraftStatus::Active,
    ]);

    $action = resolve(UpdateAircraft::class);

    $updated = $action->handle($aircraft, [
        'name' => 'New Name',
        'status' => AircraftStatus::Maintenance,
    ]);

    expect($updated->name)->toBe('New Name')
        ->and($updated->status)->toBe(AircraftStatus::Maintenance);
});
```

### Unit Test: `tests/Unit/Actions/DeleteAircraftTest.php`

```php
<?php

declare(strict_types=1);

use App\Actions\DeleteAircraft;
use App\Models\Aircraft;

it('may delete an aircraft', function (): void {
    $aircraft = Aircraft::factory()->create();

    $action = resolve(DeleteAircraft::class);
    $action->handle($aircraft);

    expect(Aircraft::query()->find($aircraft->id))->toBeNull();
});
```

### Feature Test: `tests/Feature/Controllers/AircraftControllerTest.php`

```php
<?php

declare(strict_types=1);

use App\Enums\AircraftStatus;
use App\Models\Aircraft;
use App\Models\User;

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
            ->where('aircraft.meta.last_page', 2));
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
```

---

## Implementation Waves

Structured for maximum agent parallelism. Each wave completes before the next starts.

### Wave 1 — Plumbing (3 agents, parallel)

No dependencies between these. Pure file creation.

| Agent | Files |
|---|---|
| **A: Enum + Migration** | `app/Enums/AircraftStatus.php`, `database/migrations/xxxx_create_aircraft_table.php` |
| **B: Model + Factory + Seeder** | `app/Models/Aircraft.php`, `database/factories/AircraftFactory.php`, `database/seeders/AircraftSeeder.php`, update `DatabaseSeeder` |
| **C: Actions + Form Requests** | `app/Actions/CreateAircraft.php`, `UpdateAircraft.php`, `DeleteAircraft.php`, `app/Http/Requests/CreateAircraftRequest.php`, `UpdateAircraftRequest.php` |

### Wave 2 — Wiring (1 agent)

Depends on Wave 1 — controller imports actions, requests, and model.

| Agent | Files |
|---|---|
| **D: Controller + Routes + Types** | `app/Http/Controllers/AircraftController.php`, update `routes/web.php`, `resources/js/types/aircraft.ts`, update `types/index.ts`. Then run `php artisan wayfinder:generate` |

### Wave 3 — Frontend (3 agents, parallel)

Depends on Wave 2 — needs Wayfinder-generated route/action helpers.

| Agent | Files |
|---|---|
| **E: Components** | `resources/js/components/aircraft-form.tsx`, `resources/js/components/delete-aircraft.tsx` |
| **F: Pages** | `resources/js/pages/aircraft/index.tsx`, `show.tsx`, `create.tsx`, `edit.tsx` |
| **G: Sidebar** | Update `resources/js/components/app-sidebar.tsx` |

> E and F have a dependency (pages import components). Run E first, then F — or let F reference the known interface.

### Wave 4 — Tests (2 agents, parallel)

Depends on all code existing.

| Agent | Files |
|---|---|
| **H: Unit tests** | `tests/Unit/Actions/CreateAircraftTest.php`, `UpdateAircraftTest.php`, `DeleteAircraftTest.php` |
| **I: Feature tests** | `tests/Feature/Controllers/AircraftControllerTest.php` |

### Wave 5 — Quality Gate (1 agent)

```bash
composer lint    # Auto-fix formatting
composer test    # Full suite: lint check + types + unit tests
```

Fix any failures, re-run until green.

## Summary

- **Backend**: 1 enum, 1 migration, 1 model (+ User relationship), 1 factory, 1 seeder, 3 actions, 2 form requests, 1 controller
- **Frontend**: 1 TS type file, 2 components, 4 pages, 1 sidebar update
- **Tests**: 3 unit test files, 1 feature test file (includes ownership authorization tests)
- **Total files**: ~19 new files, ~4 modified files (User model, DatabaseSeeder, web.php, app-sidebar, types/index)
- **Waves**: 5 waves, max 3 agents parallel per wave
