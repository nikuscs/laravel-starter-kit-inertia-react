---
name: debug
description: Investigate bugs systematically with evidence gathering and hypothesis testing. Use when debugging, troubleshooting, finding bugs, or diagnosing errors.
effort: high
model: opus
---

# Debug

Investigate issues methodically using evidence gathering and hypothesis testing — not random guessing.

## Step 1: Understand the Issue

Ask: **"What's the issue you're seeing?"**

Get specifics:

- Error message (exact text)
- Where it happens (route, controller, component)
- When it started (after what change?)
- Can it be reproduced?

## Step 2: Gather Evidence

### Error Context

```bash
git log --oneline -10
git diff HEAD~3 --name-only
```

### Locate the Error

| Error Type | Where to Look |
| --- | --- |
| PHP runtime | Stack trace -> file:line |
| Validation | `app/Http/Requests/` |
| Type error (PHP) | `phpstan` output |
| Type error (TS) | `tsc --noEmit` output |
| Controller | `app/Http/Controllers/` |
| Action | `app/Actions/` |
| Model | `app/Models/` |
| Route | `routes/web.php` |
| Inertia page | `resources/js/pages/` |
| Component | `resources/js/components/` |
| Migration | `database/migrations/` |

### Read the Relevant Code

Don't assume — read the actual code at the error location.

### Check Related Files

| If Issue Is In | Also Check |
| --- | --- |
| Controller | Form Request, Action, Route |
| Action | Model, related Actions |
| Form Request | Controller using it, validation rules |
| Inertia page | Controller passing props, layout |
| Component | Props types, hooks, parent page |
| Migration | Model `$fillable`, `$casts` |

## Step 3: Form Hypotheses

List 2-3 possible causes (most likely first):

```
1. **Most Likely**: [Description]
   - Evidence: [What points to this]
   - Verify: [How to test]

2. **Possible**: [Description]
   - Evidence: [What points to this]
   - Verify: [How to test]
```

## Step 4: Test Hypotheses

Test ONE at a time, starting with most likely.

### For PHP Errors

Common causes:

- Missing `declare(strict_types=1)` causing type coercion
- Missing `$fillable` or `$casts` on model
- Form Request validation not matching expected input
- Route model binding mismatch

### For TypeScript Errors

Common causes:

- Inertia page props not matching controller data
- Missing type for shared Inertia data
- Wayfinder types out of date (run `php artisan wayfinder:generate`)

### For Inertia Errors

Common causes:

- Controller not returning `Inertia::render()` correctly
- Page component not in expected path
- Props mismatch between controller and page

## Step 5: Verify Fix

```bash
composer test:lint
composer test:types
composer test:unit
```

Check for regressions — search for similar patterns elsewhere.

## Rules

- **One fix at a time** — propose, wait for go-ahead, apply
- **Two-strike rule** — if a fix doesn't work twice, stop and share what you've tried
- **Stay focused** — if the bug is in function A, fix function A, not B and C
- **Fix the cause, not the symptom** — no suppressing errors or adding `@phpstan-ignore`
- **Prove it works** — run the relevant test or show the output after fixing
