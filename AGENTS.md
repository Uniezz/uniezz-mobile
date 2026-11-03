# Agent instructions

## Code style

- Read and follow `docs/csg.md` for React code, including web code. Adapt React Native-specific APIs and examples to their web equivalents while preserving the guide's component, hook, typing, organization, and separation-of-concerns principles; also follow this codebase's established patterns.
- Inspect nearby components and hooks before changing structure. Prefer the smallest change that fits the established pattern.
- Destructure hook results to the values a component uses. Call shared TanStack Query hooks in the components that need them; rely on the query cache instead of adding context or prop plumbing for cached server data.
- Call the shared query hook where its data is needed. Always destructure the values used by the component and default collection data in the destructuring, for example `const { data: universities = [], isPending, isError, refetch } = useUniversities();`.
- Give each read query hook explicit `staleTime` and `gcTime` in its own query options. Do not move these timings to `src/utils`; mutations should invalidate or update affected keys so fresh data still appears after writes.
- Implement page state and page layout in the route file under `src/app`. Put smaller feature-specific components in separate files under `src/components/<feature>`. Put components intended for reuse across features in `src/ui`. Do not create catch-all component modules just to shorten a file.
- Use a feature `_layout.tsx` for nested routes under the same feature, and register that feature once in the parent navigator.
- Use React Hook Form and the matching schema for forms. Keep the form in its route when it is the page, including validation and submit handling.
- For React Hook Form controls, use the value and `onChange` from their `Controller` field. Do not add a separate `useWatch` for a value used only to render that control; use `useWatch` when another part of the screen needs to react to it.
- Every `src/components/<feature>` folder must have an `index.ts` that exports its public components.
- Define feature data and screen state types in `src/@types`. Import them directly from `src/@types`; never create `types.ts` in a component folder or re-export types through a component `index.ts`. Component-local prop types may stay beside their component.
- Give generated OpenAPI request and response shapes meaningful aliases in `src/@types/<domain>.ts` before using them in API functions or hooks. Do not place `components["schemas"][...]` inline in function signatures.
- Follow the existing mobile UI component pattern in `src/ui`: give each shared UI component its own file and export its public API from `src/ui/index.ts`. Keep public prop types explicit.
- Use Unistyles variants for shared component sizes and visual states; follow existing components such as `UIAvatar`. Do not add numeric size props with hardcoded defaults when a variant fits.
- Do not use `useUnistyles()` to read theme values for component styling. Use `StyleSheet.create((theme) => ...)` for styles and `withUnistyles` to map theme values into third-party component props, following Unistyles v3.
- Put third-party component style objects in `StyleSheet.create((theme) => ...)` and read tokens from `theme`; do not build them inline from an imported theme object.
- When multiple reasonable component structures or style conventions remain, ask the user which they prefer before refactoring. Do not ask about formatting choices already settled by Prettier or the surrounding code.

## Project conventions

- Reuse existing UI components, hooks, API functions, schemas, and query patterns.
- Do not add a shared UI component that only aliases another component. Keep a wrapper only when it provides distinct behavior or styling used by callers.
- Keep comment query and mutation hooks in their own file under `src/hooks`, separate from post hooks.
- Keep API calls in `src/api`, query and mutation logic in `src/hooks`, pages in `src/app`, and extracted feature UI in `src/components/<feature>`.
- Put domain option lists and constants, such as feed filter types, in `src/utils/<domain>.ts` and export them from `src/utils/index.ts`; import them into routes and components instead of defining them there.
- Use the typed OpenAPI client and match the current generated schema. Do not hand-edit generated schema types, invent endpoints, or cast around incompatible contracts.
- Make every API error identify the request method and schema path, HTTP status, and backend error code when available. Distinguish an empty successful response from a network failure and preserve the original cause. Do not throw generic messages such as `Missing profile response` or expose tokens, request bodies, or private response data in diagnostics. Keep localized user-facing error keys separate from diagnostic error messages.
- Handle HTTP errors, network failures, missing required response bodies, and endpoint-specific error translation keys in the OpenAPI client middleware. Do not repeat error checks or catch-and-rethrow wrappers in request helpers. Preserve intentional endpoint exceptions, such as an idempotent delete returning 404.
- Every change must match the established system design: component boundaries, naming, tokens, and data flow. Inspect the nearby implementation before adding a pattern.
- Before editing, inspect the installed version, existing usage, and documented capabilities of relevant libraries. Prefer their built-in lifecycle, animation, keyboard, and state APIs over custom effects, timers, refs, or new dependencies.
- Run the full `bunx expo lint` command and fix every warning and error before reporting a task done. Do not treat an exit code of zero with warnings as a clean lint result.
- Keep authentication response handling in the existing API client and session provider lifecycle. When an API middleware needs to clear a session, register and eject it from the provider using the client's middleware API; do not add a module-level callback setter to bridge into React state.
- Return or await query invalidation promises from mutation callbacks when subsequent work depends on them. Do not prefix `queryClient.invalidateQueries` with `void` to discard its promise.
- Pass an existing callback directly when its argument signature matches, for example `onRefresh={refetch}`. Do not wrap it solely to write `() => void refetch()`. When the event handler passes an event or the callback needs a guard, use the smallest wrapper and return its promise without `void`.
- Preserve existing behavior unless the request calls for changing it.
- Do not start a development server unless the user explicitly asks.
