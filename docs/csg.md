# Coding Style Guide

This document outlines coding practices, patterns, and conventions for React Native applications with TypeScript. It serves as a reference for maintaining consistency and quality across mobile development projects.

## Table of Contents

1.  [Project Structure](#project-structure)
2.  [TypeScript Patterns](#typescript-patterns)
3.  [React Component Patterns](#react-component-patterns)
4.  [Custom Hooks Patterns](#custom-hooks-patterns)
5.  [API Layer Patterns](#api-layer-patterns)
6.  [State Management](#state-management)
7.  [Styling Patterns](#styling-patterns)
8.  [Error Handling](#error-handling)
9.  [Performance Considerations](#performance-considerations)
10. [Code Organization](#code-organization)

## Project Structure

### Directory Organization

Projects should follow a feature-based structure with clear separation of concerns:

```
src/
├── @types/           # TypeScript type definitions
├── api/              # API layer and data fetching
├── app/              # App pages and layouts (Expo Router/React Navigation)
├── components/       # Reusable UI components
├── contexts/         # React contexts for global state
├── hooks/            # Custom React hooks
├── ui/               # Base UI components and design system
├── utils/            # Utility functions
├── theme/            # Theme configuration and styling
└── localization/     # Internationalization
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `UIButton.tsx`, `UserProfile.tsx`)
- **Hooks**: camelCase starting with `use` (e.g., `useAuth.tsx`, `useData.ts`)
- **Utilities**: camelCase (e.g., `validations.ts`, `formatters.ts`)
- **Types**: camelCase (e.g., `database.types.ts`)
- **Constants**: camelCase (e.g., `config.ts`)

## TypeScript Patterns

### Type Definitions

Always define explicit types for function parameters, return values, and component props:

```typescript
// ✅ Good: Explicit type definitions
export type CreateItemData = {
  title: string;
  description: string;
  categoryId: string;
  externalLink?: string;
  tags: string[];
  imageUris: string[];
  visibility: "public" | "private";
};

export const createItem = async (
  userId: string,
  data: CreateItemData,
  tagIds: string[],
  tags: Omit<DatabaseTable<"tags">, "created_at">[],
): Promise<string> => {
  // Implementation
};
```

### Generic Types and Utility Types

Use TypeScript utility types for better type safety:

```typescript
// ✅ Good: Using utility types
export type UpdateItemData = {
  categoryId: string;
  externalLink?: string;
  tags: string[];
  visibility: "public" | "private";
};

// ✅ Good: Using Omit for excluding properties
tags: (Omit < DatabaseTable<"tags">, "created_at" > []);
```

### Type Guards and Validation

Implement type guards for runtime type checking:

```typescript
// ✅ Good: Type guard function
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isValidUUID = (uuid: string): boolean => {
  return UUID_REGEX.test(uuid);
};
```

## React Component Patterns

### Component Structure

Components should follow a consistent structure with clear prop interfaces:

```typescript
// ✅ Good: Clear prop interface and component structure
export type UIButtonProps = {
  onPress: VoidFunction | (() => Promise<void>) | undefined;
  title: string | React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
  icon?: React.ReactNode;
  handleLoading?: boolean;
} & UnistylesVariants<typeof styles>;

export function UIButton({
  onPress,
  title,
  style,
  disabled = false,
  icon,
  handleLoading = true,
  ...props
}: UIButtonProps) {
  // Component implementation
}
```

### Compound Components

Use compound components for complex UI patterns:

```typescript
// ✅ Good: Compound component pattern
export function ItemPreview({ ... }: ItemPreviewProps) {
  // Main component implementation
}

// Sub-component for specific use cases
ItemPreview.Small = function SmallItemPreview({ ... }: ItemPreviewProps & {
  swipeProgress: SharedValue<number>;
  position: "left" | "right";
}) {
  // Sub-component implementation
};
```

### Conditional Rendering

Use clear conditional rendering patterns:

```typescript
// ✅ Good: Clear conditional rendering
if (showAd && isAdLoading) {
  return (
    <View style={{ alignItems: "center", marginTop: "90%" }}>
      <UILoader />
    </View>
  );
}

if (showAd && nativeAd && !adError && initialized) {
  return (
    <SwipableAdvertisement
      onSwipeUp={onUpvote}
      onSwipeDown={onDownvote}
      nativeAd={nativeAd}
    />
  );
}
```

### Props Destructuring and Default Values

Always provide default values for optional props:

```typescript
// ✅ Good: Default values for optional props
export function UIText({
  children,
  style,
  isLoading = false,
  skeletonWidth,
  ...props
}: { isLoading?: boolean; skeletonWidth?: number } & TextProps &
  UnistylesVariants<typeof styles>) {
  // Implementation
}
```

## Custom Hooks Patterns

### Hook Naming and Structure

Custom hooks should follow consistent naming and structure patterns:

```typescript
// ✅ Good: Hook with clear purpose and error handling
export function useSignUp() {
  const { t } = useTranslation("app", { keyPrefix: "auth" });
  const { setUsername } = useInitialUsernamePersist();

  return useMutation({
    mutationKey: ["signUp"],
    mutationFn: async ({
      username,
      ...params
    }: Parameters<typeof signUp>[number] & { username: string }) => {
      setUsername(username);
      await signUp(params);
    },
    onSuccess: () => {
      Toast.show({
        text1: t(
          "signUpSuccess",
          "Sign up successful, please check your email for verification",
        ),
        type: "success",
      });
      router.navigate("/signIn");
    },
  });
}
```

### Query Hooks Pattern

Use consistent patterns for data fetching hooks:

```typescript
// ✅ Good: Consistent query hook pattern
export const useItemById = (itemId: string | undefined) => {
  return useQuery({
    queryKey: ["items", itemId],
    queryFn: () => {
      if (!itemId) {
        throw new Error("Item ID is required");
      }
      return getItemById(itemId);
    },
    enabled: !!itemId,
  });
};
```

### Mutation Hooks Pattern

Follow consistent patterns for mutation hooks with proper error handling:

```typescript
// ✅ Good: Mutation hook with comprehensive error handling
export const useDeleteItem = ({ onSuccess }: { onSuccess?: VoidFunction }) => {
  const { t } = useTranslation("app", { keyPrefix: "components" });
  const queryClient = useQueryClient();
  const { session } = useSession();

  return useMutation({
    mutationKey: ["deleteItem", session?.user.id],
    mutationFn: async (itemId: string) => {
      if (!session?.user.id) {
        throw new Error("User ID is required");
      }
      return await cleanupItem(itemId, session.user.id);
    },
    onSuccess: (_, itemId) => {
      // Cache invalidation
      queryClient.removeQueries({ queryKey: ["items", itemId] });
      queryClient.invalidateQueries({ queryKey: ["items"] });

      Toast.show({
        text1: t("itemDeleted", "Item deleted successfully!"),
        type: "success",
      });
      onSuccess?.();
    },
    onError: (error) => {
      Toast.show({
        text1: t("error", "Error"),
        text2: error.message || t("deleteFailed", "Failed to delete item"),
        type: "error",
      });
    },
  });
};
```

## API Layer Patterns

### Query Functions

API query functions should be pure and focused on data fetching:

```typescript
// ✅ Good: Pure query function with proper error handling
export const getItemById = async (itemId: string) =>
  executeQuery(
    async () =>
      await supabase.from("items").select("*").eq("id", itemId).single(),
  );
```

### Transaction Handling

Use proper transaction handling for complex operations:

```typescript
// ✅ Good: Transaction-like behavior with rollback
export const assignItemToCategory = async (
  itemId: string,
  currentCategoryId: string,
  newCategoryId: string,
  userId: string,
) => {
  // Get current state
  const { data: currentEntry, error: fetchError } = await supabase
    .from("item_categories")
    .select("id, position")
    .eq("item_id", itemId)
    .eq("category_id", currentCategoryId)
    .single();

  if (fetchError) {
    throw new Error(
      `Failed to find current category assignment: ${fetchError.message}`,
    );
  }

  // Perform operations with rollback capability
  const { error: deleteError } = await supabase
    .from("item_categories")
    .delete()
    .eq("item_id", itemId)
    .eq("category_id", currentCategoryId);

  if (deleteError) {
    throw new Error(
      `Failed to remove from current category: ${deleteError.message}`,
    );
  }

  // Insert with rollback
  const { data: newEntry, error: insertError } = await supabase
    .from("item_categories")
    .insert({
      item_id: itemId,
      category_id: newCategoryId,
      position: 0,
      added_by: userId,
    })
    .select()
    .single();

  if (insertError) {
    // Rollback: restore the original entry
    await supabase.from("item_categories").insert({
      item_id: itemId,
      category_id: currentCategoryId,
      position: currentEntry.position,
      added_by: userId,
    });
    throw new Error(`Failed to assign to new category: ${insertError.message}`);
  }

  return newEntry;
};
```

### Error Handling

Implement consistent error handling patterns:

```typescript
// ✅ Good: Centralized error handling utility
export const executeQuery = async <T>(
  queryFn: () => Promise<PostgrestResponse<T>>,
): Promise<T | null> => {
  try {
    const { data, error } = await queryFn();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (error) {
    console.error("Query execution failed:", error);
    throw error;
  }
};
```

## State Management

### Context Pattern

Use React Context for global state with proper typing:

```typescript
// ✅ Good: Typed context with clear interface
export const SessionContext = createContext<{
  session: Session | null;
}>({
  session: null,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
}
```

### Query Client Configuration

Configure React Query with proper persistence and network handling:

```typescript
// ✅ Good: Query client with persistence and network awareness
const storage = new MMKV({ id: "queries" });

function createMMKVPersister(key = "REACT_QUERY_CACHE"): Persister {
  return {
    persistClient: async (client) => {
      try {
        const data = JSON.stringify(client);
        storage.set(key, data);
      } catch (err) {
        console.error("Failed to persist client:", err);
      }
    },
    restoreClient: async () => {
      try {
        const cacheString = storage.getString(key);
        return cacheString ? JSON.parse(cacheString) : undefined;
      } catch (err) {
        console.error("Failed to restore client:", err);
        return undefined;
      }
    },
    removeClient: async () => {
      try {
        storage.delete(key);
      } catch (err) {
        console.error("Failed to remove client:", err);
      }
    },
  };
}

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});
```

## Styling Patterns

### Theme-Based Styling

Use a centralized theme system with consistent scaling:

```typescript
// ✅ Good: Theme-based styling with variants
const styles = StyleSheet.create((theme) => ({
  button: (disabled: boolean = false) => ({
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.ms(8),
    opacity: disabled ? 0.5 : 1,
    variants: {
      color: {
        default: {
          backgroundColor: theme.colors.darkGray,
        },
        onboarding: {
          backgroundColor: theme.colors.onboardingButton,
        },
        secondary: {
          backgroundColor: theme.colors.grayLighter,
        },
        purple: {
          backgroundColor: theme.colors.purple,
        },
        white: {
          backgroundColor: theme.colors.white,
        },
        destructive: {
          backgroundColor: theme.colors.error,
        },
      },
      size: {
        default: {
          height: theme.vs(50),
        },
        small: {
          height: theme.vs(36),
          paddingHorizontal: theme.ms(8),
        },
        large: {
          height: theme.vs(64),
        },
      },
    },
  }),
}));
```

### Responsive Design

Use theme-based scaling for responsive design:

```typescript
// ✅ Good: Responsive scaling utilities
export const lightTheme = {
  colors: {
    black: "#000000",
    white: "#F8FAF7",
    error: "#FF3F6C",
    primary: "#907AFE",
    // ... more colors
  },
  isIOS: Platform.OS === "ios",
  safeBottomInset: (inset: number) =>
    Platform.OS === "ios" ? inset : inset + vs(16),
  getHexColorWithOpacity,
  s,
  ms,
  vs,
  mvs,
};
```

### Component Variants

Use variant-based styling for component flexibility:

```typescript
// ✅ Good: Variant-based component styling
export function UIText({
  children,
  style,
  isLoading = false,
  skeletonWidth,
  ...props
}: { isLoading?: boolean; skeletonWidth?: number } & TextProps &
  UnistylesVariants<typeof styles>) {
  styles.useVariants(props);

  if (isLoading) {
    return (
      <Text style={style}>
        <UISkeleton show={isLoading} width={skeletonWidth}>
          <Text>{children}</Text>
        </UISkeleton>
      </Text>
    );
  }

  return (
    <Text style={[styles.text, style]} {...props}>
      {children}
    </Text>
  );
}
```

## Error Handling

### Consistent Error Patterns

Implement consistent error handling across the application:

```typescript
// ✅ Good: Consistent error handling in mutations
export const useGoogleAuth = () => {
  const { t } = useTranslation("app", { keyPrefix: "auth" });

  return useMutation({
    mutationKey: ["googleSignIn"],
    mutationFn: async () => {
      try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();

        if (userInfo.data?.idToken) {
          const data = await signInWithProvider({
            provider: "google",
            token: userInfo.data.idToken,
          });
          return data;
        } else {
          Toast.show({
            type: "warning",
            text1: t("signInCancelled", "Sign in cancelled"),
          });
        }
      } catch (error) {
        const code = get(error, "code");
        if (code) {
          switch (code) {
            case statusCodes.SIGN_IN_CANCELLED:
              Toast.show({
                type: "warning",
                text1: t("signInCancelled", "Sign in cancelled"),
              });
              break;
            case statusCodes.IN_PROGRESS:
              Toast.show({
                type: "warning",
                text1: t(
                  "signInAlreadyInProgress",
                  "Sign in already in progress",
                ),
              });
              break;
            case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
              throw new Error("Play services not available or outdated");
            default:
              throw error;
          }
        } else {
          throw error;
        }
      }
    },
  });
};
```

### Validation Patterns

Use Zod for runtime validation with internationalization:

```typescript
// ✅ Good: Validation with i18n support
export const usernameSchema = z
  .string()
  .min(3, {
    message: i18next.t(
      "app:validation.usernameMinLength",
      "Username must be at least 3 characters",
    ),
  })
  .max(32, {
    message: i18next.t(
      "app:validation.usernameMaxLength",
      "Username must be at most 32 characters",
    ),
  })
  .regex(/^[a-zA-Z0-9 _]+$/, {
    message: i18next.t(
      "app:validation.usernameFormat",
      "Username can only contain letters, numbers, spaces, underscores, and underscores",
    ),
  })
  .transform(normalizeUsername);
```

## Performance Considerations

### Memoization Patterns

Use memoization appropriately for performance optimization:

```typescript
// ✅ Good: Memoized values for expensive computations
const children = useMemo(() => {
  switch (true) {
    case loading && handleLoading:
      return <UILoader size="small" color={styles.loader.color} />;
    case typeof title === "string":
      return (
        <View style={styles.children}>
          {icon}
          <UIText size="buttons" style={styles.text}>
            {title}
          </UIText>
        </View>
      );
    case !!title:
      return title;
    default:
      return null;
  }
}, [loading, title, icon]);
```

### Callback Optimization

Use useCallback for event handlers to prevent unnecessary re-renders:

```typescript
// ✅ Good: Optimized callback with proper dependencies
const handlePress = useCallback(async () => {
  try {
    const res = onPress?.();
    if (res instanceof Promise) {
      setLoading(true);
      await res;
    }
  } finally {
    setLoading(false);
  }
}, [onPress]);
```

### Query Optimization

Configure queries with appropriate caching and stale time:

```typescript
// ✅ Good: Optimized query configuration
export const useUserSavedItemsPreview = (userId?: string) => {
  const { session } = useSession();
  const userIdToUse = userId || session?.user.id;

  return useQuery({
    queryKey: ["items", "saved", userIdToUse],
    queryFn: async () => {
      if (!userIdToUse) {
        throw new Error("User ID is required");
      }
      return await getUserSavedItemsPreview(userIdToUse);
    },
    enabled: !!userIdToUse,
    staleTime: dayjs.duration(5, "minutes").asMilliseconds(),
  });
};
```

## Code Organization

### Import Organization

Organize imports consistently:

```typescript
// ✅ Good: Organized imports
// 1. External libraries
import { useCallback, useMemo, useState } from "react";
import { View, ViewStyle } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

// 2. Internal utilities and components
import { UILoader } from "./UILoader";
import { UIPressable } from "./UIPressable";
import { UIText } from "./UIText";
```

### Function Organization

Organize functions with clear separation of concerns:

```typescript
// ✅ Good: Clear function organization
export function UIButton({
  onPress,
  title,
  style,
  disabled = false,
  icon,
  handleLoading = true,
  ...props
}: UIButtonProps) {
  // 1. Hook calls
  styles.useVariants(props);
  const [loading, setLoading] = useState(false);

  // 2. Computed values
  const children = useMemo(() => {
    // Implementation
  }, [loading, title, icon]);

  // 3. Event handlers
  const handlePress = useCallback(async () => {
    // Implementation
  }, [onPress]);

  // 4. Render
  return (
    <UIPressable
      style={[styles.button(disabled), style]}
      disabled={disabled}
      onPress={handlePress}
    >
      {children}
    </UIPressable>
  );
}
```

### File Structure

Maintain consistent file structure within components:

```typescript
// ✅ Good: Consistent file structure
// 1. Imports
// 2. Type definitions
// 3. Component implementation
// 4. Sub-components (if any)
// 5. Styles
// 6. Exports
```

## Best Practices Summary

1.  **Type Safety**: Always use TypeScript with explicit types
2.  **Error Handling**: Implement consistent error handling patterns
3.  **Performance**: Use memoization and optimization techniques appropriately
4.  **Consistency**: Follow established patterns throughout the codebase
5.  **Maintainability**: Write clear, self-documenting code
6.  **Testing**: Structure code to be easily testable
7.  **Accessibility**: Consider accessibility in component design
8.  **Internationalization**: Use i18n for all user-facing text
9.  **Performance**: Optimize for mobile performance
10. **Code Organization**: Maintain clear separation of concerns

## React 19.2 Patterns

These patterns target **React 19.2** and are scaffolded by `create-madis-app` under `src/ui` and `src/components/examples`. They favour declarative loading/error handling and the newer React APIs over manual state juggling.

### React Compiler

Enable the React Compiler for every app (Expo: `experiments.reactCompiler: true` in `app.json`). It auto-memoizes components and hook results, so:

- **Don't** reach for `useMemo` / `useCallback` / `React.memo` by default — let the compiler handle memoization. Add them back only when profiling proves a need.
- **Do** keep following the Rules of Hooks and keep render functions pure — the compiler relies on them.

### Screen-level loading & error: `<Suspense>` + Error Boundary

Suspense only handles the **loading** state (it catches a thrown promise). **Errors** are caught by an **Error Boundary** — Suspense cannot. Compose both with a HOC and apply it at the **screen / route level**.

```typescript
// ✅ Good: one HOC composes the Error Boundary + Suspense for a whole screen
export function withSuspense<P extends object>(
  Component: ComponentType<P>,
  options: { loadingFallback?: ReactNode; onReset?: () => void } = {},
) {
  return function SuspendedComponent(props: P) {
    return (
      <ErrorBoundary FallbackComponent={UIErrorScreen} onReset={options.onReset}>
        <Suspense fallback={options.loadingFallback ?? <UILoadingScreen />}>
          <Component {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

// Usage in a route file — wrap the screen, not individual widgets:
export default withSuspense(ProfileScreen, { onReset: resetUserResource });
```

**Rule of thumb:**

- Use `withSuspense` at the **screen/route level** — its fallbacks (`UILoadingScreen` / `UIErrorScreen`) take over the entire screen.
- Small **widgets** that shouldn't blank out the whole screen should manage their **own inline** loading/error UI instead of suspending up to the screen boundary.
- This replaces the old per-screen ladder:

```typescript
// ❌ Avoid: imperative loading/error branches in every data screen
if (isLoading) return <UILoader />;
if (error) return <UIErrorScreen error={error} />;
return <Content data={data} />;
```

> `react-error-boundary` types the caught value as `unknown`; use its `getErrorMessage(error)` helper to read a message safely.

### Reading data with the `use` API

`use(promise)` reads a promise **during render**: the component suspends while pending and throws if it rejects — so the screen needs no `useEffect` and no `isLoading`/`error` state.

```typescript
// ✅ Good: screen reads data with use(); withSuspense handles loading/error
function ProfileScreen() {
  const user = use(getUserResource());
  return (
    <UIScreen title="Profile">
      <Text>{user.name}</Text>
    </UIScreen>
  );
}
```

The promise **must be stable across renders** (cache it — e.g. a module-level cache, or TanStack Query's `useSuspenseQuery`), otherwise React suspends forever on a brand-new promise each render. With TanStack Query, `useSuspenseQuery` suspends while pending and throws on error in exactly the same way, so it slots straight into a `withSuspense` screen.

### Async actions with `useActionState`

`useActionState` manages the pending / error / result lifecycle of an async action. React Native has no DOM forms, so call the returned action directly with a payload; the action signature is `(previousState, payload) => nextState`.

```typescript
// ✅ Good: no manual isSubmitting / error state
async function submitAction(_prev: SubmitState, name: string): Promise<SubmitState> {
  if (!name.trim()) return { error: "Please enter a name" };
  await save(name);
  return { greeting: `Hello, ${name.trim()}!` };
}

export function NameForm() {
  const [state, submit, isPending] = useActionState(submitAction, {});
  const [name, setName] = useState("");
  return (
    <>
      <TextInput value={name} onChangeText={setName} editable={!isPending} />
      <UIButton title="Submit" disabled={isPending} onPress={() => submit(name)} />
    </>
  );
}
```

### `useEffectEvent`

`useEffectEvent` lets an Effect read the **latest** props/state **without** listing them as dependencies — so the Effect doesn't re-run (e.g. reconnect) just because an unrelated value changed.

```typescript
// ✅ Good: only roomId re-subscribes; the handler still sees the latest `muted`
function useRoom(roomId: string, muted: boolean) {
  const onConnected = useEffectEvent(() => {
    showToast(muted ? "connected (muted)" : "connected");
  });

  useEffect(() => {
    const connection = connect(roomId);
    connection.on("connected", () => onConnected());
    return () => connection.disconnect();
  }, [roomId]); // `muted` is intentionally NOT a dependency
}
```

Effect Events may only be called from inside Effects — never pass them as props or call them during render.

### `<Activity>`

`<Activity>` keeps part of the tree **mounted but hidden**: state is preserved, effects are paused, and React can pre-render hidden content at lower priority. Useful for tab-like UIs where you don't want to lose scroll position / form input when switching away.

```typescript
// ✅ Good: hidden tab keeps its state and is pre-rendered
<Activity mode={tab === "a" ? "visible" : "hidden"}>
  <TabAContent />
</Activity>
<Activity mode={tab === "b" ? "visible" : "hidden"}>
  <TabBContent />
</Activity>
```
