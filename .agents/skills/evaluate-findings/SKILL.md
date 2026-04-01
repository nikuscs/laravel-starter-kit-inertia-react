---
name: evaluate-findings
description: Triage external feedback (code reviews, PR comments, AI suggestions) with confidence-based filtering. Use to evaluate findings or filter false positives.
effort: high
model: opus
---

# Evaluate Findings

Confidence-based framework for evaluating external feedback (code reviews, AI suggestions, PR comments). Spawn a Devil's Advocate subagent to critically challenge non-trivial claims using research tools. Triage and classify findings — do not apply fixes. Return results for the main agent to act on.

## Step 1: Assess Each Finding

For each finding:

1. **Read the referenced code** at the mentioned location — include the full function or logical block, not just the flagged line
2. **Verify the claim** against the actual code — does the issue genuinely exist?
3. **Assign confidence**:

| Level | Criteria | Verdict |
| --- | --- | --- |
| **High** (>80%) | Clear bug, typo, missing check, obvious improvement, style violation matching project conventions | Accept |
| **Medium** (50-80%) | Likely valid but involves judgment calls or unclear project intent | Accept with caveats |
| **Low** (<50%) | Subjective preference, requires domain knowledge, might break things, reviewer may be wrong | Skip |

## Step 2: Devil's Advocate

After the initial assessment, spawn a subagent to critically challenge findings from a different angle using research tools.

### Spawn Condition

Spawn when there are **3 or more findings scored Medium or higher** that involve non-trivial claims — API behavior, correctness arguments, performance assertions, or anything not verifiable by reading the code alone.

**Skip** when all findings are clear-cut (typos, missing null checks, style issues) or total count is 1-2 trivial items.

### Subagent Instructions

Launch a single subagent (`model: "opus"`, do not set `run_in_background`). Provide:

1. The challenge-worthy findings with file locations, claims, and initial verdicts
2. Instructions to challenge each finding — try to prove it wrong, or confirm it with evidence

The subagent picks research tools based on claim type:

| Claim Type | Tool |
| --- | --- |
| API deprecated/removed/changed | WebSearch |
| Method doesn't exist / wrong signature | WebSearch |
| Code causes specific bug or behavior | Bash (isolated read-only test snippet) |
| Best practice or ecosystem claim | WebSearch |
| Laravel/PHP version compatibility | WebSearch -> WebFetch |

**Budget:** max 2 research actions per finding. If the first action is conclusive, skip the second.

### Subagent Verdicts

The subagent returns per finding:

- **Confirmed** — found evidence supporting the claim (with source)
- **Disputed** — found counter-evidence (with source and explanation)
- **Inconclusive** — no definitive evidence either way

## Step 3: Reconciliation

Merge subagent results with the initial assessment:

- **Confirmed**: verdict stands, confidence may increase. Note the evidence source.
- **Disputed**: if originally Accepted -> downgrade to Skip or flag with both perspectives. Never silently override — show the disagreement.
- **Inconclusive**: verdict stands, note the uncertainty.

Findings not investigated by the subagent keep their original assessment unchanged.

## Step 4: Format Output

Summarize the evaluated findings in a table.

When the Devil's Advocate subagent was **not** spawned:

| File | Issue | Confidence | Verdict |
| --- | --- | --- | --- |

When the subagent ran, add an Investigated column:

| File | Issue | Confidence | Verdict | Investigated |
| --- | --- | --- | --- | --- |

## Rules

- Never auto-dismiss findings about security defaults, permission escalation, or fail-open vs fail-closed behavior.
- If a finding references code that no longer exists, skip it and note that the code has diverged.
- If two findings conflict with each other, skip both and document the conflict.
- For each finding, clarify whether the issue was introduced by the PR/changeset or is pre-existing.
