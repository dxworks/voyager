# AGENTS.md - Voyager

Voyager is a CLI tool (`@dxworks/voyager`) that orchestrates data extraction
and preparation for software system analysis. Users define a **mission** (a
YAML file) that lists which **instruments** (external analysis tools like
linters, complexity analyzers, etc.) to run against one or more code
repositories, with what parameters and environment variables. Voyager then
manages the full lifecycle: verifying tool requirements, executing each
instrument's commands in order, collecting logs, packaging all results into a
single zip archive with an HTML report, and optionally unpacking result
archives for further processing. It is used by engineering teams to run
repeatable, multi-tool data extraction and analysis preparation "missions"
with a single command.

## Build / Lint / Test Commands

```bash
# Install dependencies (requires Node 24.13.0)
npm install

# Build (clean + compile TypeScript + copy assets)
npm run build

# Lint
npm run lint
npm run lint:fix          # auto-fix

# Run all tests
npm test                  # or: npx jest --passWithNoTests

# Run a single test file
npx jest __tests__/variable/variable-handler.test.ts

# Run a single test by name
npx jest -t "default handler should pass"

# Watch mode
npm run test:dev

# Full create pipeline (build + test)
npm run create
```

## Project Structure

```
src/
  voyager.ts              # CLI entry point (commander)
  model/                  # TypeScript interfaces and classes (Instrument, Action, Command, Variable, etc.)
  context/                # Singleton MissionContext & ContextVariableProvider
  parser/                 # YAML mission/instrument file parsing
  runner/                 # Execution: mission-runner, instrument-runner, command-runner, action-runner
    default-actions/      # Built-in actions: clean, package, unpack, verify
  variable/               # VariableHandler, VariableProvider, variable substitution
  report/                 # Log collection, HTML report generation, mission summaries
    html/                 # HTML report utilities and generator
  assets/                 # Static asset files (copied to dist at build time)
__tests__/
  variable/               # Test files (*.test.ts)
  utils/                  # Test helpers/fixtures (*.utils.ts)
```

## TypeScript Configuration

- **Target**: ES2020, **Module**: CommonJS, **Module Resolution**: Node
- **Strict mode** enabled (`"strict": true`)
- `esModuleInterop: true`, `resolveJsonModule: true`, `forceConsistentCasingInFileNames: true`
- Output to `dist/`, source maps enabled, declarations generated
- Build config (`tsconfig.build.json`) excludes `__tests__/`

## Code Style Guidelines

### Formatting

- No semicolons at end of statements (except inside interfaces where members use semicolons)
- Single quotes for string literals: `'value'`
- Template literals with `${}` for string interpolation
- Braces on same line as declaration (K&R style), spaces inside braces for imports: `import {Foo} from './foo'`
- No trailing commas in function parameters; trailing commas in multi-line import lists
- 4-space indentation (inferred from source)
- Omit braces for single-statement `if`/`else`/`for` blocks:
  ```ts
  if (condition)
      doSomething()
  else
      doSomethingElse()
  ```

### Imports

- Use relative paths with explicit file reference (no extensions): `import {Foo} from '../model/Foo'`
- Group imports: project-local imports first, then npm packages, then Node built-ins
- Node built-ins use `node:` prefix for `path`: `import path from 'node:path'`
- Named imports preferred; default imports used for npm packages (`fs-extra`, `archiver`, `adm-zip`, `js-yaml`)
- Multi-line imports use trailing commas:
  ```ts
  import {
      cleanMission,
      findAndRunMission,
      openSummary,
  } from './runner/mission-runner'
  ```

### Naming Conventions

- **Interfaces**: PascalCase (`Instrument`, `CommandContext`, `VariableContext`)
- **Classes**: PascalCase (`VariableHandler`, `MissionContext`, `UnpackMapping`)
- **Class files**: PascalCase filename matching the class (`VariableHandler.ts`, `MissionContext.ts`)
- **Functions / variables / parameters**: camelCase (`runMission`, `instrumentKey`, `commandPath`)
- **Constants**: UPPER_SNAKE_CASE for module-level string constants (`RESULTS_ZIP_DIR`, `TARGET`, `REPO_NAME`)
- **Utility/function files**: kebab-case (`mission-runner.ts`, `variable-operations.ts`, `action-utils.ts`)
- **Test files**: `<name>.test.ts` in `__tests__/<module>/`
- **Test utilities**: `<name>.utils.ts` in `__tests__/utils/`
- **Private class fields**: underscore prefix with getter/setter (`private _name`, `get name()`)

### Types

- `any` is permitted (ESLint rule `@typescript-eslint/no-explicit-any: "off"`)
- Use `interface` for data shapes; `class` for stateful objects with methods
- Return `string | null` (not `undefined`) for "not found" patterns
- Type assertions use angle-bracket syntax: `<DefaultAction>action`, `<string>value`
- Type guard functions follow `instanceOfX` pattern: `function instanceOfCommand(object: any): boolean`
- Use `Map<K, V>` for key-value data (not plain objects) throughout the codebase

### Error Handling

- `try/catch` around I/O operations (file reads, command execution)
- Errors logged with `console.error()`, warnings with `console.warn()`
- Async command execution uses Promise with `resolve`/`reject` pattern
- Catch blocks typically log and re-throw or set failure state on summary objects
- No custom error classes; uses built-in `Error` with descriptive messages

### Async Patterns

- `async/await` for sequential operations; `.then()` for fire-and-forget
- Sequential iteration with `for...of` loops (not `Promise.all`) for instrument/action execution
- Functions that return promises are typed `Promise<void>`

### Testing

- Jest with ts-jest transform
- Test structure: `describe` blocks for feature groups, `test` (not `it`) for individual cases
- Test names: descriptive lowercase sentences (`'default handler should pass'`)
- Shared test fixtures in `__tests__/utils/*.utils.ts` as exported constants and factory functions
- Use `expect(...).toBe(...)` for primitives; custom equality helpers for Maps
- Imports from source use relative paths: `import {Foo} from '../../src/module/Foo'`

### Patterns

- **Singleton**: `MissionContext` uses `getInstance()` with module-level export: `export const missionContext = MissionContext.getInstance()`
- **Provider pattern**: `VariableProvider` holds `Variable[]`; `VariableHandler` aggregates multiple providers with priority ordering
- **Variable substitution**: `${varName}` syntax in strings, resolved via regex replacement
- **Commander CLI**: `program.command().description().option().action()` pattern in `voyager.ts`

## ESLint

- Flat config (`eslint.config.mjs`) using `@eslint/js` recommended + `typescript-eslint` recommended
- `@typescript-eslint/no-explicit-any` is turned off
- Ignores: `dist/`, `bin/`, `node_modules/`, `*.tsbuildinfo`

## CI

- GitHub Actions: `npm install && npm run create` (build + test) on every push
- Package registry: GitHub Packages (`@dxworks` scope via `.npmrc`)
