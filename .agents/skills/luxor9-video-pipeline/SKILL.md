```markdown
# luxor9-video-pipeline Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the core development patterns and conventions used in the `luxor9-video-pipeline` TypeScript codebase. You'll learn how to structure files, write and organize code, and follow the project's conventions for imports, exports, and testing. This guide also provides suggested commands for common workflows.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `videoProcessor.ts`, `frameExtractor.ts`

### Import Style
- Use **relative imports** for referencing modules within the project.
  - Example:
    ```typescript
    import { processFrame } from './frameProcessor';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```typescript
    // In videoProcessor.ts
    export function processVideo(input: string): void {
      // ...
    }
    ```

### Commit Patterns
- Commit messages are **freeform** and do not follow a strict convention.
- Average commit message length: **64 characters**.

## Workflows

### Adding a New Module
**Trigger:** When you need to add new functionality to the pipeline  
**Command:** `/add-module`

1. Create a new file using camelCase naming (e.g., `newFeature.ts`).
2. Implement your logic using named exports.
3. Import the module where needed using a relative path.
4. Write a corresponding test file (see Testing Patterns).

### Updating an Existing Module
**Trigger:** When modifying or improving existing functionality  
**Command:** `/update-module`

1. Locate the module file (e.g., `videoProcessor.ts`).
2. Make changes using the existing code style.
3. Update or add tests as necessary.
4. Commit changes with a descriptive message.

### Running Tests
**Trigger:** To verify code correctness after changes  
**Command:** `/run-tests`

1. Ensure all test files follow the `*.test.*` pattern (e.g., `videoProcessor.test.ts`).
2. Use the project's test runner (framework unknown; check project scripts).
3. Run the test command (e.g., `npm test` or equivalent).

## Testing Patterns

- Test files are named using the `*.test.*` pattern (e.g., `module.test.ts`).
- The specific testing framework is **unknown**; check the project for configuration or scripts.
- Place test files alongside the modules they test or in a dedicated test directory.
- Example test file structure:
  ```typescript
  // videoProcessor.test.ts
  import { processVideo } from './videoProcessor';

  describe('processVideo', () => {
    it('should process video input correctly', () => {
      // Test implementation
    });
  });
  ```

## Commands
| Command         | Purpose                                        |
|-----------------|------------------------------------------------|
| /add-module     | Scaffold and integrate a new module            |
| /update-module  | Update an existing module with new logic       |
| /run-tests      | Run all tests in the codebase                  |
```
