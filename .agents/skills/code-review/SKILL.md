---
name: code-review
description: Review code changes for bugs, security issues, and correctness problems. Use when asked to review code, review a PR, scan for bugs, or audit changes.
effort: high
model: opus
---

# Code Review

Multi-pass code review with parallel agents and validation. Only surfaces HIGH SIGNAL issues.

## Step 1: Gather Project Rules

Launch a haiku agent to return a list of file paths (not their contents) for all relevant instruction files:

- The root `CLAUDE.md` and `AGENTS.md` files, if they exist
- Any `CLAUDE.md` or `AGENTS.md` files in directories containing files modified by the diff
- `.agents/rules/` files

## Step 2: Get the Diff and PR Context

Run these in parallel:

### 2a. Get the diff

```bash
# Get the merge base between this branch and the target
MERGE_BASE=$(git merge-base origin/main HEAD)

# Get the committed diff against the merge base
git diff $MERGE_BASE HEAD

# Get any uncommitted changes (staged and unstaged)
git diff HEAD
```

Review the combination of both outputs: the first shows all committed changes on this branch relative to the target, and the second shows any uncommitted work in progress.

### 2b. Get PR context (if available)

```bash
gh pr view --json title,body,state,isDraft,mergeable,baseRefName,headRefName,labels,statusCheckRollup 2>/dev/null
```

### 2c. Launch a sonnet agent to summarize changes

Give it the diff command and ask for a concise summary of what changed and why.

## Step 3: Launch 4 Review Agents in Parallel

Use the Agent tool to launch all four agents in a single message. Each agent runs the diff command itself. Provide each agent with the PR title and description for context about the author's intent.

### Agents 1 + 2: CLAUDE.md / AGENTS.md Compliance (sonnet)

Two sonnet agents auditing changes for instruction file compliance in parallel. Split the changed files between them. When evaluating compliance for a file, only consider instruction files that share a file path with the file or its parents.

Check for:

1. **PHP conventions**: missing `declare(strict_types=1)`, non-final classes, business logic in controllers, missing Form Request validation, raw SQL instead of Eloquent
2. **Action pattern**: Actions must have a single `handle()` method, `final readonly` class
3. **Controller pattern**: thin controllers only — validate via Form Request, delegate to Action, return Inertia response or redirect
4. **Type safety**: missing return types, loose comparisons, missing `$fillable` or `$casts`
5. **Frontend patterns**: manual memoization (`useMemo`, `useCallback`, `React.memo`), hardcoded URLs instead of Wayfinder, modifying Shadcn/ui components

### Agent 3: Bug Detection (opus)

Scan for obvious bugs. Focus only on the diff itself without reading extra context. Flag only significant bugs; ignore nitpicks and likely false positives. Do not flag issues that you cannot validate without looking at context outside of the git diff.

### Agent 4: Introduced Problems (opus)

Look for problems in the introduced code: security issues, incorrect logic, race conditions, data loss. Only look for issues within the changed code.

Check specifically for:

- SQL injection (raw queries with user input)
- Mass assignment (missing `$fillable` / `$guarded`)
- Auth bypass (missing middleware)
- N+1 queries (missing `with()` eager loading)
- Exposed secrets

**CRITICAL: We only want HIGH SIGNAL issues.** This means:

- Objective bugs that will cause incorrect behavior at runtime
- Clear, unambiguous CLAUDE.md violations where you can quote the exact rule being broken
- Security issues with concrete exploit paths

We do NOT want:

- Subjective concerns or "suggestions"
- Style preferences not explicitly required by project instructions
- Potential issues that "might" be problems
- Anything requiring interpretation or judgment calls

If you are not certain an issue is real, do not flag it. False positives erode trust and waste reviewer time.

**All subagents must be explicitly instructed not to post comments themselves.** They return their findings only.

## Step 4: Validate Each Issue

For each issue found in Step 3, launch parallel subagents to validate it. Each validation agent receives:

- The PR title and description
- The issue description and file location
- Instructions to determine if the issue is truly a problem with high confidence

Use opus subagents for bugs and logic issues, sonnet agents for instruction file violations.

The validator's job:

- For "variable is not defined" — verify it's actually undefined in the code
- For instruction file violations — verify the rule is scoped for this file and is actually broken
- For bugs — verify the described behavior actually occurs given the code

Each validator returns: **Confirmed** or **Rejected** with evidence.

## Step 5: Filter and Compile

Remove any issues rejected in Step 4. These are confirmed false positives and must not appear in the final review.

### False Positive List (do NOT flag)

- Pre-existing issues not introduced by this changeset
- Something that appears buggy but is actually correct
- Pedantic nitpicks a senior engineer would not flag
- Issues that Pint, Rector, PHPStan, or OxLint will catch (do not run them to verify)
- General code quality concerns (e.g., lack of test coverage) unless explicitly required by project instructions
- Issues mentioned in project instructions but explicitly silenced in the code (e.g., via a `@phpstan-ignore` with comment)

## Step 6: Post Results

### If reviewing a GitHub PR

Post inline comments for each validated issue using `gh api`:

```bash
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments
```

**IMPORTANT: Only post ONE comment per unique issue.** Cite and link to the instruction file rule if applicable.

### Output Format

Write a numbered list of all validated issues:

```markdown
### #1 <Title of issue>

<Description of the problem and why it matters>

**File:** `path/to/file.php` (lines X-Y)
**Reason:** Bug / CLAUDE.md violation / Security

### #2 <Title of issue>

...
```

After all findings:

```markdown
## Summary

**Issues found:** N
**Verdict:** PASS / FAIL

<1-3 sentence explanation>
```

If there are zero validated issues, state that the code looks correct and stop.

## Step 7: Post-Review

Ask the user:

1. Want me to fix the issues automatically?
2. Any findings you disagree with?

## Fallback: No Subagents

If you don't have access to subagents, perform all steps yourself sequentially. Do each review axis (instruction compliance, bug scan, introduced problems) yourself, then validate each issue yourself before reporting.

Do not mention whether you used the fallback strategy.
