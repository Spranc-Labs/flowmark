# Contributing to Flowmark

Thank you for your interest in contributing to Flowmark! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

Be respectful and professional. We welcome contributions from everyone regardless of experience level.

---

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- pnpm 10.x

### Setup

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/flowmark.git
   cd flowmark
   ```

3. **Install dependencies:**
   ```bash
   pnpm install
   ```

4. **Build the package:**
   ```bash
   cd packages/core
   pnpm run build
   ```

5. **Run tests:**
   ```bash
   pnpm test
   ```

---

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Test additions/changes

### Making Changes

1. **Create a new branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit frequently with clear messages

3. **Run tests and linting:**
   ```bash
   pnpm test
   pnpm run lint
   ```

4. **Build to verify:**
   ```bash
   pnpm run build
   ```

### Watch Mode (Development)

For active development with auto-rebuild:

```bash
pnpm run dev
```

This watches source files and rebuilds on changes.

---

## Submitting Changes

### Before Submitting

- [ ] All tests pass (`pnpm test`)
- [ ] Code builds successfully (`pnpm run build`)
- [ ] TypeScript has no errors (`pnpm run lint`)
- [ ] Code follows existing style and conventions
- [ ] New features include tests
- [ ] Documentation is updated if needed

### Creating a Pull Request

1. **Push your branch to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** on GitHub from your fork to the main repository

3. **Write a clear PR description:**
   - What does this PR do?
   - Why is this change needed?
   - How can reviewers test it?
   - Does it introduce breaking changes?

4. **Link related issues** (if any): "Fixes #123"

### PR Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, a maintainer will merge your PR

---

## Coding Standards

### TypeScript

- Use TypeScript strictly - avoid `any` types
- Export types for public APIs
- Document complex type definitions

### Code Style

- **Formatting:** Code is auto-formatted (no manual style needed)
- **Naming:**
  - `camelCase` for variables and functions
  - `PascalCase` for classes and types
  - `UPPER_CASE` for constants
- **Comments:** Add comments for complex logic, not obvious code

### File Organization

```
src/
├── adapters/        # Storage adapters
├── ui/              # UI components (selection toolbar)
├── highlighter.ts   # Main Highlighter class
├── types.ts         # Type definitions
└── *.ts             # Utility modules
```

---

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode (re-run on changes)
pnpm run test:watch

# Coverage report
pnpm run test:coverage
```

### Writing Tests

- Place test files next to the code: `filename.test.ts`
- Use descriptive test names: `it('should do X when Y happens', ...)`
- Test edge cases and error conditions
- Aim for high coverage on new code

**Example:**

```typescript
import { describe, it, expect } from 'vitest'
import { normalizeText } from './text-processor'

describe('normalizeText', () => {
  it('should remove extra whitespace', () => {
    expect(normalizeText('hello  world')).toBe('hello world')
  })

  it('should handle empty strings', () => {
    expect(normalizeText('')).toBe('')
  })
})
```

---

## Documentation

### README Updates

- Update `README.md` when adding new features
- Include code examples for new APIs
- Keep documentation clear and concise

### Code Documentation

- Add JSDoc comments for public APIs:

```typescript
/**
 * Creates a new highlight from a DOM Range.
 *
 * @param range - The DOM Range to highlight
 * @param color - Optional highlight color (CSS color value)
 * @returns Promise that resolves to the created Highlight
 *
 * @example
 * ```typescript
 * const selection = window.getSelection()
 * const range = selection.getRangeAt(0)
 * const highlight = await highlighter.createHighlight(range, '#fef08a')
 * ```
 */
async createHighlight(range: Range, color?: string): Promise<Highlight>
```

### CHANGELOG

- Update `CHANGELOG.md` for significant changes
- Follow [Keep a Changelog](https://keepachangelog.com/) format
- Categorize changes: Added, Changed, Deprecated, Removed, Fixed, Security

---

## Questions?

- Open an issue for questions or discussions
- Check existing issues before creating new ones
- Be patient - maintainers respond as time allows

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
