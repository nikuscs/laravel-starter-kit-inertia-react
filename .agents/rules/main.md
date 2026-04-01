# Project Rules

## PHP Rules

- Every PHP file starts with `declare(strict_types=1)`
- Classes are `final readonly` by default
- Actions are single-purpose: one public `handle()` method
- Controllers are thin: validate via Form Request, delegate to Action, return response
- No business logic in controllers — ever
- Validation lives in Form Request classes, not controllers or actions
- Use Eloquent relationships and query scopes — no raw SQL unless performance-critical
- Return types on all methods — Larastan enforces this at level max
- No `@phpstan-ignore` without a comment explaining why

## TypeScript / React Rules

- No manual memoization (React Compiler handles it)
- No `any` types — use proper typing
- Components forward `className` via `cn()` for composability
- Do not modify `components/ui/` files — these are Shadcn primitives
- Use Wayfinder route helpers for navigation — never hardcode URLs
- Pages receive props from Inertia — type them explicitly

## Testing Rules

- Use Pest's expressive syntax (`it()`, `expect()`)
- Test behavior, not implementation
- Use model factories for test data
- 100% code coverage is required (enforced by CI)

## Quality Gate

Before committing, all of these must pass:

```bash
composer test:lint      # Pint + Rector + OxLint
composer test:types     # PHPStan + TypeScript
composer test:unit      # Pest with coverage
```
