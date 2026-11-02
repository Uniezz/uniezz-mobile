# Agent instructions

## Code style

- Read and follow `docs/csg.md` for React code, including web code. Adapt React Native-specific APIs and examples to their web equivalents while preserving the guide's component, hook, typing, organization, and separation-of-concerns principles; also follow this codebase's established patterns.
- Inspect nearby components and hooks before changing structure. Prefer the smallest change that fits the established pattern.
- Destructure hook results to the values a component uses. Call shared TanStack Query hooks in the components that need them; rely on the query cache instead of adding context or prop plumbing for cached server data.
- Implement page state and page layout in the route file under `src/app`. Put smaller feature-specific components in separate files under `src/components/<feature>`. Put components intended for reuse across features in `src/ui`. Do not create catch-all component modules just to shorten a file.
- Every `src/components/<feature>` folder must have an `index.ts` that exports its public components.
- Define feature data and screen state types in `src/@types`. Import them directly from `src/@types`; never create `types.ts` in a component folder or re-export types through a component `index.ts`. Component-local prop types may stay beside their component.
- Follow the existing mobile UI component pattern in `src/ui`: give each shared UI component its own file and export its public API from `src/ui/index.ts`. Keep public prop types explicit.
- When multiple reasonable component structures or style conventions remain, ask the user which they prefer before refactoring. Do not ask about formatting choices already settled by Prettier or the surrounding code.

## Project conventions

- Reuse existing UI components, hooks, API functions, schemas, and query patterns.
- Keep API calls in `src/api`, query and mutation logic in `src/hooks`, pages in `src/app`, and extracted feature UI in `src/components/<feature>`.
- Preserve existing behavior unless the request calls for changing it.
- Do not start a development server unless the user explicitly asks.
