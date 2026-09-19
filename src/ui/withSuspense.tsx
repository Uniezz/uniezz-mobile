import { ComponentType, ReactNode, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { UIErrorScreen } from "./UIErrorScreen";
import { UILoadingScreen } from "./UILoadingScreen";

type WithSuspenseOptions = {
  /** Custom loading fallback (defaults to UILoadingScreen). */
  loadingFallback?: ReactNode;
  /**
   * Called when the user retries from the error screen. Use it to clear any
   * cached promise / refetch so a fresh attempt is made (see useMockResource).
   */
  onReset?: () => void;
};

/**
 * Wraps a SCREEN in an Error Boundary + <Suspense> so its loading and error
 * states are handled by full-screen fallbacks instead of `isLoading` / `error`
 * branches. This is the React 19 replacement for the conditional
 * "render UIErrorScreen if error" pattern.
 *
 * Use this at the screen/route level only — the fallbacks (UILoadingScreen /
 * UIErrorScreen) take over the whole screen. Smaller widgets that shouldn't
 * blank out the entire screen should handle their own inline loading/error UI.
 *
 * Usage (in a route file):
 *   export default withSuspense(ProfileScreen, { onReset: resetUserResource });
 */
export function withSuspense<P extends object>(
  Component: ComponentType<P>,
  options: WithSuspenseOptions = {},
) {
  function SuspendedComponent(props: P) {
    return (
      <ErrorBoundary
        FallbackComponent={UIErrorScreen}
        onReset={options.onReset}
      >
        <Suspense fallback={options.loadingFallback ?? <UILoadingScreen />}>
          <Component {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  SuspendedComponent.displayName = `withSuspense(${Component.displayName ?? Component.name ?? "Component"})`;

  return SuspendedComponent;
}
