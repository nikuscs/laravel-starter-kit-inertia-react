# Laravel Starter Kit

Laravel 13, PHP 8.5, Inertia v3, React 19, TypeScript, Tailwind v4, Shadcn/ui.
Auth via Fortify. Type-safe routing via Wayfinder. Testing via Pest 5.

## Writing Code

- Write code a teammate can scan and understand without asking questions. `$user->orders()->create($data)` tells you exactly what's happening — that's the target
- Follow patterns already in the codebase. When code looks the same everywhere, people stop needing to read it carefully. That's the goal
- Trust internal code. Validate at system boundaries (user input, external APIs) — don't guard against things that can't go wrong inside the app
- If the code reads clearly without it, leave it out. Skip docblocks on obvious methods, intermediate variables for single-use values, wrapper functions that just forward args
- If PHPStan, Pint, or OxLint complains, fix the code, not the tooling. Don't add `@phpstan-ignore`, `// @ts-ignore`, or `as any` without understanding what the tool is catching first

## Before Implementing

These checks are blocking — not aspirational. Code that fails any of them gets rewritten before merge.

- A teammate must understand this in a single read. If it needs a comment to explain _what_ it does (not _why_), rewrite it
- The new code must not be slower than what it replaces. Don't add an extra DB query "for clarity". Don't trade a simple loop for a chain that allocates intermediate arrays
- Someone adding a new field or case should touch one or two places — not five. No tight coupling, but no premature abstraction either
- Every function, type, file, and abstraction must be used in more than one place _right now_. A helper called once is noise. Three similar lines beat a premature abstraction

## Skills

Before implementing, trigger the matching skill — it has patterns, conventions, and file templates.

| What you're doing | Skill |
| --- | --- |
| New route + controller + action + page | `/new-route` |
| Action class (business logic) | `/new-action` |
| Eloquent model + migration + factory | `/new-model` |
| React component | `/new-component` |
| Inertia page | `/new-page` |
| Pest test file | `/new-test` |
| Code review | `/code-review` then `/evaluate-findings` |
| Clean up changed code | `/deslop` |
| Quality check before PR | `/quality-gate` |
| Pull request | `/pr` |
| Bug investigation | `/debug` |
| Codebase orientation | `/code-scan` |
| Session handoff | `/handoff` |

Don't start from scratch when a skill template exists.

## Project Layout

| Path | What lives there |
| --- | --- |
| `app/Actions/` | Single-purpose action classes |
| `app/Http/Controllers/` | Thin controllers — delegate to Actions |
| `app/Http/Requests/` | Form request validation |
| `app/Http/Middleware/` | Inertia, appearance middleware |
| `app/Models/` | Eloquent models |
| `app/Enums/` | PHP enums |
| `app/Services/` | Service classes |
| `resources/js/pages/` | Inertia pages |
| `resources/js/components/` | React components (`ui/` = Shadcn) |
| `resources/js/layouts/` | Page layouts |
| `resources/js/hooks/` | React hooks |
| `resources/js/types/` | TypeScript types |
| `routes/web.php` | All web routes |
| `database/migrations/` | Database migrations |
| `database/factories/` | Model factories |
| `tests/` | Pest test files |

Auto-generated (gitignored — don't edit): `resources/js/actions/`, `resources/js/routes/`, `resources/js/wayfinder/`

## Quality Gate

Every one of these must pass before committing. No exceptions.

```bash
composer test:lint      # Pint + Rector + OxLint
composer test:types     # PHPStan (level max) + tsc --noEmit
composer test:unit      # Pest with 100% coverage
```

Run `composer test` to execute all three in sequence.

Individual tools when you need them:

| Tool | Fix | Check only |
| --- | --- | --- |
| PHP formatting | `pint --parallel` | `pint --parallel --test` |
| PHP refactoring | `rector` | `rector --dry-run` |
| PHP static analysis | — | `phpstan` |
| JS/TS lint + format | `bun run lint` | `bun run test:lint` |
| TypeScript types | — | `bun run test:types` |
| All tests | — | `composer test:unit` |
| Everything | `composer lint` | `composer test` |

Pint runs automatically via hook on every file save. Don't fight it.

## Wayfinder

Wayfinder generates TypeScript route helpers and controller action bindings from Laravel routes. The generated files are gitignored — never edit them by hand.

- Regenerate after changing routes, controllers, or controller method signatures: `php artisan wayfinder:generate`
- Stale generated files cause TypeScript errors (missing exports, broken `.form()` types). When you see route-related TS errors, regenerate before debugging
- In dev (`composer dev`), the Vite plugin regenerates automatically on file changes. Manual regeneration is needed outside of dev or after branch switches

## Testing

- Use Pest syntax: `it()`, `expect()`, chained expectations
- Test behavior, not implementation details
- Use model factories for all test data — never manual inserts
- 100% code coverage is enforced. Missing coverage blocks the build
- Test both the happy path and the failure path
- Use `actingAs($user)` for auth, `assertInertia()` for pages, `assertSessionHasErrors()` for validation

## Working Together

- When asked a question, answer it directly before investigating or fixing anything. Don't jump into refactoring when a yes/no was all that was asked
- For large changes, implement one piece first and ask for feedback before continuing
- When given more than one task, create a task for each one before starting. Work through them one at a time
- Don't refactor code that isn't part of the current task
- Don't add comments, docstrings, or type annotations to code you didn't change
- When unsure about a convention or pattern, grep the codebase first. Don't rely on assumptions — the codebase is always right, memory drifts

## Debugging

- Don't guess — gather evidence first. Read the error message and stack trace before changing anything
- Check `git log --oneline -5` to see what changed recently
- Propose the fix and wait for a go-ahead. One change at a time
- Two failed attempts at the same fix means stop. Share what you've tried, what you've ruled out, and ask for direction
- If the bug is in function A, fix function A. Don't refactor B and C "while you're at it"
- Don't add `?.`, try/catch, fallback values, or type casts to silence an error. Find why the value is wrong upstream
- After a fix, run the relevant test or show the output. Don't say "this should work"

## File Organization

- Handoff documents go in `docs/handoffs/YYYY-MM-DD-<topic>.md`
- Plans the user asks to save go in `docs/pending-plans/<topic>.md`
- Analysis, investigation, and code review reports go in `docs/reports/YYYY-MM-DD-<topic>.md`
- `.agents/` is the source of truth for skills and rules. Edit files there, not the symlinked copies
- `make agents-setup` regenerates all symlinks into `.claude/` and `.codex/`
