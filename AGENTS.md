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
- Never declare a top-level constant, array, or object in a route or component file, including skeleton shapes, placeholder data, sizes, delays, and lookup maps. Put it in `src/utils/<domain>.ts` with a comment saying what it is for, export it from `src/utils/index.ts`, and import it. Before finishing, check every changed route and component file for a top-level `const` other than the component, its `styles`, and wrapped third-party components.
- Use the typed OpenAPI client and match the current generated schema. Do not hand-edit generated schema types, invent endpoints, or cast around incompatible contracts.
- Make every API error identify the request method and schema path, HTTP status, and backend error code when available. Distinguish an empty successful response from a network failure and preserve the original cause. Do not throw generic messages such as `Missing profile response` or expose tokens, request bodies, or private response data in diagnostics. Keep localized user-facing error keys separate from diagnostic error messages.
- Handle HTTP errors, network failures, missing required response bodies, and endpoint-specific error translation keys in the OpenAPI client middleware. Do not repeat error checks or catch-and-rethrow wrappers in request helpers. Preserve intentional endpoint exceptions, such as an idempotent delete returning 404.
- Every change must match the established system design: component boundaries, naming, tokens, and data flow. Inspect the nearby implementation before adding a pattern.
- Before editing, inspect the installed version, existing usage, and documented capabilities of relevant libraries. Prefer their built-in lifecycle, animation, keyboard, and state APIs over custom effects, timers, refs, or new dependencies.
- On a bug, find the cause before changing code, and check whether that cause is a library. If it is, search that library's props for a fix before adding state, effects, or refs. If no prop fixes it, stop and ask the user, offering three ranked options.
- After fixing a bug, search the codebase for the same pattern (the same library prop, component, or code shape) in other places. List every place where the bug can also happen and ask the user whether to fix them. Do not fix them silently, and do not skip the search.
- Run the full `bunx expo lint` command and fix every warning and error before reporting a task done. Do not treat an exit code of zero with warnings as a clean lint result.
- Keep authentication response handling in the existing API client and session provider lifecycle. When an API middleware needs to clear a session, register and eject it from the provider using the client's middleware API; do not add a module-level callback setter to bridge into React state.
- Return or await query invalidation promises from mutation callbacks when subsequent work depends on them. Do not prefix `queryClient.invalidateQueries` with `void` to discard its promise.
- Pass an existing callback directly when its argument signature matches, for example `onRefresh={refetch}`. Do not wrap it solely to write `() => void refetch()`. When the event handler passes an event or the callback needs a guard, use the smallest wrapper and return its promise without `void`.
- Do not pass inline functions with logic to JSX props, such as `onPress={() => (router.canGoBack() ? router.back() : router.replace("/chat"))}`. Define a named handler in the component body, for example `const handleBackPress = () => { ... }`, and pass `onPress={handleBackPress}`. A direct callback reference such as `onRefresh={refetch}` stays as it is.
- Preserve existing behavior unless the request calls for changing it.
- Do not start a development server unless the user explicitly asks.

## UI behavior

- Make toggle actions such as follow and like optimistic, as Instagram does: update the cache in `onMutate`, keep the button enabled while the request runs, and give the mutation a `scope` so repeated taps run in order. Refetch only when the last queued mutation settles (`queryClient.isMutating({ mutationKey }) === 1`), so a refetch never flips the button back. Do not debounce with timers or refs.
- Do not show a success toast when the screen already shows the result, such as a follow button changing state. Show toasts for errors.
- On a screen with a form above a list, such as group settings, scroll only the list rows. Pin inputs, section headings such as "3 members", and actions outside the list.
- Show a Save button only when the form is dirty, in a `KeyboardStickyView` above the keyboard. Do not keep a Save button under the field.
- Put a secondary destructive action, such as leaving a group, in the header as a red icon button. Do not use a full-width button for it.
- Disable a footer `KeyboardStickyView` (`enabled={false}`) while another overlay, such as `UISearchOverlay`, owns the keyboard. Do not put a blurred or filled background behind a pinned footer button unless asked.
- Give scrollable lists on screens with inputs `keyboardDismissMode="on-drag"`.
- Do not repeat the screen title as a section heading on the same screen.
- Render lists of students as one inset panel with dividers, like `RowPickerItem` with `appearance="inset"`. Show the university as its logo plus the short code (`universityId.toUpperCase()`), not the full name.
- Make a student's avatar and name open their profile wherever they appear, including under group chat messages.
- Open an existing chat over the Chat tab (`router.dismissTo("/(tabs)/chat")`, then push it), so Back leads to the chat list, not the screen it was opened from.
- Format every displayed count with `formatCompactCount`. Keep the exact number in the accessibility label.
- Keep a control the same size in every state: use a constant border width and change only its color. Use an icon-only button with an `accessibilityLabel` when a label overflows in longer languages, such as Polish.
- Do not list universities or their number in copy, such as "the five Lublin universities": there are more, and the list grows. Say "Lublin universities"; the university list comes from the API (`useUniversities`).
- Show a count and its label on one line, such as "**2** Following", not stacked.
- Keep chat sync cursors (`changeSeq`) moving only through the catch-up (`catchUpChatThread`). Do not merge a send or other mutation response into the message cache first: that moves the cursor past messages others sent a moment earlier, and they are never fetched.
