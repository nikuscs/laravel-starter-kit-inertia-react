---
name: new-model
description: Create an Eloquent model with migration, factory, and relationships. Use when adding a new database entity.
---

# Create New Model

Create an Eloquent model with its migration, factory, and relationships.

## 1. Create the Migration

`database/migrations/YYYY_MM_DD_HHMMSS_create_{table}_table.php`:

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
        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->integer('quantity');
            $table->decimal('total', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
```

Use `php artisan make:migration create_{table}_table` to generate the timestamp.

## 2. Create the Model

`app/Models/{Name}.php`:

```php
<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Order extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'status',
        'quantity',
        'total',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total' => 'decimal:2',
            'quantity' => 'integer',
        ];
    }
}
```

Note: Models are `final` but NOT `readonly` (Eloquent requires mutable properties).

## 3. Create the Factory

`database/factories/{Name}Factory.php`:

```php
<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
final class OrderFactory extends Factory
{
    protected $model = Order::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'status' => 'pending',
            'quantity' => fake()->numberBetween(1, 10),
            'total' => fake()->randomFloat(2, 10, 500),
        ];
    }

    public function completed(): static
    {
        return $this->state(['status' => 'completed']);
    }
}
```

## 4. Add Relationship to Related Models

If the new model belongs to User, add the inverse in `app/Models/User.php`:

```php
/**
 * @return HasMany<Order, $this>
 */
public function orders(): HasMany
{
    return $this->hasMany(Order::class);
}
```

## 5. Run the Migration

```bash
php artisan migrate
```

## Conventions

- **Model class**: `final class` (not `readonly` — Eloquent needs mutable props)
- **Factory class**: `final class`
- **`$fillable`**: always define — prevent mass assignment
- **`casts()`**: define for non-string columns (integers, decimals, booleans, dates, enums)
- **Relationships**: typed return with generics (`BelongsTo<User, $this>`)
- **Enums**: use PHP enums for status-like columns, cast with `casts()`
- **Naming**: singular model (`Order`), plural table (`orders`), snake_case columns

## 6. Final Check

1. Migration creates the table with correct columns and foreign keys
2. Model has `$fillable` and `casts()`
3. Relationships are defined on both sides
4. Factory produces valid data
5. Run: `php artisan migrate && php artisan test`
