---
name: pr
description: Create a well-structured pull request with title, description, and checks. Use when opening a PR, submitting for review, or making a pull request.
effort: high
model: sonnet
---

# Pull Request

Create well-structured, comprehensive pull requests that make reviewing easy.

## Step 1: Check Current State

```bash
git branch --show-current
git status --short
git log origin/$(git branch --show-current)..HEAD --oneline 2>/dev/null || echo "Branch not pushed"
```

## Step 2: Analyze Changes

```bash
# Commit history
git log main..HEAD --oneline
git log main..HEAD --pretty=format:"%h %s%n%b"

# Changes
git diff main...HEAD --name-status
git diff main...HEAD --stat
git diff main...HEAD

# Special files
git diff main...HEAD --name-only | grep -E "migration|\.sql"
git diff main...HEAD -- '**/composer.json'
git diff main...HEAD -- '**/.env*'
```

Read changed files for full context.

## Step 3: Pre-PR Checklist

| Check | Command |
| --- | --- |
| All changes committed | `git status` |
| Lint passes | `composer test:lint` |
| Types check | `composer test:types` |
| Tests pass | `composer test:unit` |

Push if needed:

```bash
git push -u origin HEAD
```

## Step 4: Create PR

Title format: `<type>(<scope>): <short description>`

Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`

```bash
gh pr create \
  --title "feat(domain): description" \
  --body "$(cat <<'EOF'
## Summary

[Brief description of the change and its motivation]

## Changes

- Change 1
- Change 2

## Test Plan

1. Step 1
2. Step 2

---

Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Auto-detect PR Type

| Pattern | Type |
| --- | --- |
| New Action/Controller/Model | `feat` |
| Test files only | `test` |
| `composer.json` changes | `chore(deps)` |
| Migrations | `feat` + migration note |

### Large PRs (>500 lines)

Warn the user and suggest splitting into smaller PRs.

## Step 5: After Creation

1. Return PR URL
2. Suggest: add screenshots (if UI change), request reviewers
