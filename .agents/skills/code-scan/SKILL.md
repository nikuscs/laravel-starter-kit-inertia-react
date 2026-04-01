---
name: code-scan
description: Scan and index the codebase structure. Use for quick orientation, understanding project structure, finding classes, or pre-refactoring overview.
allowed-tools: Bash, Read, Glob, Grep
model: sonnet
---

# Code Scan

Index project structure for quick orientation.

## PHP Scan

### List all classes by directory

```bash
find app/ -name "*.php" -exec grep -l "^class\|^final\|^abstract\|^enum\|^interface" {} \; | sort
```

### Index Actions

```bash
grep -rn "public function handle" app/Actions/ --include="*.php" | sed 's/:.*public function /: /'
```

### Index Controllers

```bash
grep -rn "public function" app/Http/Controllers/ --include="*.php" | grep -v "__construct" | sed 's/:.*public function /: /'
```

### Index Models

```bash
grep -rn "^final\|^class" app/Models/ --include="*.php"
```

### Index Routes

```bash
grep -E "Route::(get|post|put|patch|delete|resource)" routes/web.php
```

### Index Form Requests

```bash
grep -rn "public function rules" app/Http/Requests/ --include="*.php" -l
```

### Index Migrations

```bash
ls -1 database/migrations/
```

## TypeScript/React Scan

### Index Pages

```bash
find resources/js/pages -name "*.tsx" | sort
```

### Index Components

```bash
find resources/js/components -name "*.tsx" -not -path "*/ui/*" | sort
```

### Index Hooks

```bash
find resources/js/hooks -name "*.ts" -o -name "*.tsx" | sort
```

### Index Types

```bash
find resources/js/types -name "*.ts" | sort
```

## Output

Present a clear summary:

1. **Stats**: total files by type (PHP classes, React components, pages, etc.)
2. **Actions**: list with their `handle()` signatures
3. **Controllers**: list with their public methods
4. **Pages**: Inertia pages and their paths
5. **Routes**: all registered web routes

If $ARGUMENTS is provided:
- If it looks like a directory path, scope the scan to that directory
- If it is "php" or "backend", scan only PHP files
- If it is "ts" or "frontend", scan only TypeScript/React files
- If it is "routes", focus on route listing
