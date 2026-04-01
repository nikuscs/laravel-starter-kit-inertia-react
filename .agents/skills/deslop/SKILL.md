---
name: deslop
description: Review changed files for reuse, quality, and efficiency, then fix issues found. Use when asked to simplify, clean up, deslop, or improve code quality.
effort: high
---

# Deslop

Clean changed code so it matches the project's real conventions, not just whatever happens to compile.

## 1. Pick the Review Scope

Review:

- the current diff against `main`, or
- the files the user explicitly named, or
- the files you just changed in this session

Do not widen the scope without a reason.

## 2. Review for These Things

### Reuse

- Search for existing utilities, Actions, or components before keeping a new one.
- Check `app/Actions/` for existing Actions that could be reused.
- Check `resources/js/components/ui/` for existing Shadcn primitives.
- Check `resources/js/hooks/` for existing hooks.

### Structure

- Controllers must be thin — delegate to Actions.
- Validation must live in Form Request classes.
- Business logic belongs in Actions or Services, never controllers.
- React components should forward props and merge `className` with `cn()`.
- Pages should be thin wrappers — heavy UI belongs in components.

### Naming

- Follow existing naming conventions (see CLAUDE.md).
- Actions: `VerbNoun` (`CreateUser`, not `UserCreator`).
- Controllers: `NounController`.
- Form Requests: `VerbNounRequest`.

### Substance

- Delete single-use abstractions that add ceremony.
- Remove defensive code against values the system already guarantees.
- Inline or simplify helpers that are only called once.
- Keep code close to where it is used.

## 3. Fix the Issues Directly

This skill is for cleanup, not reporting.

For each real issue:

1. Read the surrounding code.
2. Confirm the fix matches nearby patterns.
3. Edit the file directly.
4. Do not make unrelated refactors while you are there.

## 4. Verify

Run lint and type checks for the changed code:

```bash
composer test:lint
composer test:types
```

## 5. Stop Condition

You are done when:

- the changed code matches project conventions
- the obvious reuse issues are gone
- lint and type checks pass

If the code is already clean, say that explicitly and stop.
