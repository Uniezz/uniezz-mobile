# Agent instructions

## Code style

- Read and follow `docs/csg.md` for React code, including web code. Adapt React Native-specific APIs and examples to their web equivalents while preserving the guide's component, hook, typing, organization, and separation-of-concerns principles; also follow this codebase's established patterns.
- Inspect nearby components and hooks before changing structure. Prefer the smallest change that fits the established pattern.
- Destructure hook results to the values a component uses. Call shared TanStack Query hooks in the components that need them; rely on the query cache instead of adding context or prop plumbing for cached server data.
- Keep components responsible for their own UI and local interaction state. Put feature-specific components in separate files under `src/components/features/<feature>`. Put components intended for reuse across features in `src/ui/components`. Do not create catch-all component modules just to shorten a file.
- Every `src/components/features/<feature>` folder must have an `index.ts` that exports its public components and types.
- Follow the UI component folder pattern in `src/ui/components/UISegmented`: give each UI component its own folder, a component file, an `index.ts` that exports its public API, and an export from `src/ui/components/index.ts`. Keep public prop types explicit and export them from the folder index.
- When multiple reasonable component structures or style conventions remain, ask the user which they prefer before refactoring. Do not ask about formatting choices already settled by Prettier or the surrounding code.

## Project conventions

- Reuse existing UI components, hooks, API functions, schemas, and query patterns.
- Keep API calls in `src/api`, query and mutation logic in `src/hooks`, route composition in `src/routes`, and feature UI in `src/components/features`.
- Preserve existing behavior unless the request calls for changing it.
- Do not start a development server unless the user explicitly asks.
