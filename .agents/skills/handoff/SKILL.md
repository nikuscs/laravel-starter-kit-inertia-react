---
name: handoff
description: Create a handoff document for session continuity. Use when saving progress, creating a handoff, or when context is getting full and work continues later.
model: sonnet
---

# Handoff

Capture everything needed for a fresh session to continue seamlessly.

## Step 1: Gather Context

```bash
git branch --show-current
git status --short
git log --oneline -10
git diff --stat
git stash list
```

## Step 2: Create Handoff Document

Save to `docs/handoffs/YYYY-MM-DD-<topic>.md`:

```markdown
# Handoff: [Topic]

**Date**: YYYY-MM-DD HH:MM
**Branch**: `branch-name`
**Goal**: [What we were accomplishing]

---

## Original Request

> [User's original request verbatim]

[Any clarifications]

---

## Work Completed

### Files Created

- `path/to/file` - [Purpose]

### Files Modified

- `path/to/file:42-67` - [What changed]

### Decisions Made

1. **[Decision]**: [Reasoning]

### Discoveries

- [Important finding]

---

## Work Remaining

### Next Steps

1. [ ] [Task] - `file:line` reference
2. [ ] [Task]

### Blocked

- [ ] [Task] - Blocked by: [reason]

---

## What Didn't Work

1. **[Approach]**: [Why it failed]

---

## Critical Context

### Key Files

1. `path/to/file` - [Why important]

### Assumptions

- [Things assumed but not verified]

---

## Current State

- **Tests Pass**: yes / no
- **Lint Clean**: yes / no
- **Types Clean**: yes / no

### Uncommitted Changes

[git status output]

---

## Resume Instructions

1. `git checkout branch-name`
2. Read: [key files]
3. Start with: [first action]
4. Run: `composer test`
```

### Quick Handoff

For simpler tasks, use a condensed format:

```markdown
# Quick Handoff: [Topic]

**Branch**: `branch-name`
**Status**: [In progress / Blocked]

## Done

- [x] Thing 1

## Next

- [ ] Thing 2 (`file:line`)

## Key Files

- `path/to/file`

## Notes

- [Important context]
```

## Step 3: After Creating

1. Tell the user where the file was saved
2. Optionally commit the handoff document
3. Explain how to resume: read the handoff file in the next session
