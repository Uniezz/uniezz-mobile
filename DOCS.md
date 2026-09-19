# Project Documentation 📚

Welcome to your new Madis Expo app! This document provides links to the documentation for the libraries installed in your project.

## Core Technologies 🚀

- **Expo**: [https://docs.expo.dev/](https://docs.expo.dev/)
- **Expo Router**: [https://docs.expo.dev/router/introduction/](https://docs.expo.dev/router/introduction/)
- **React Native**: [https://reactnative.dev/docs/environment-setup](https://reactnative.dev/docs/environment-setup)

## Internationalization 🌍

- **i18next**: [https://www.i18next.com/](https://www.i18next.com/)
- **React i18next**: [https://react.i18next.com/](https://react.i18next.com/)
- **Expo Localization**: [https://docs.expo.dev/versions/latest/sdk/localization/](https://docs.expo.dev/versions/latest/sdk/localization/)

## Styling 🎨

- **React Native Unistyles**: [https://www.unistyl.es/v3/start/introduction/](https://www.unistyl.es/v3/start/introduction/)
- **Zustand** (Theme State): [https://zustand.docs.pmnd.rs/learn/getting-started/introduction](https://zustand.docs.pmnd.rs/learn/getting-started/introduction)
- **React Native MMKV** (Theme Persistence): [https://github.com/mrousavy/react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- **Nitro Modules**: [https://github.com/mrousavy/nitro](https://github.com/mrousavy/nitro)

## Backend & Data Fetching 🌐

Uniezz does **not** use Supabase or any other BaaS. The app talks to the Uniezz **Go API**; media lives in **AWS S3**.

- **Uniezz API (Go):** auth, profiles, feed, chat, and the rest of the product. Base URL from app config — never call AWS or identity providers (USOS, Entra) from the client
- **Media (AWS S3):** photos, chat attachments, exam files. The Go API authorizes uploads and issues object URLs; the app does not hold long-lived AWS keys
- **TanStack Query (React Query)**: [https://tanstack.com/query/latest/docs/framework/react/quick-start](https://tanstack.com/query/latest/docs/framework/react/quick-start)
- **Async Storage**: [https://react-native-async-storage.github.io/2.0/Usage/](https://react-native-async-storage.github.io/2.0/Usage/)

## Additional Libraries 📦

- **Gorhom Bottom Sheet**: [https://gorhom.github.io/react-native-bottom-sheet/](https://gorhom.github.io/react-native-bottom-sheet/)
- **React Native Reanimated**: [https://docs.swmansion.com/react-native-reanimated/](https://docs.swmansion.com/react-native-reanimated/)
- **React Native Gesture Handler**: [https://docs.swmansion.com/react-native-gesture-handler/](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started//)
- **React Native Toast Message**: [https://github.com/calintamas/react-native-toast-message](https://github.com/calintamas/react-native-toast-message)
- **Expo Haptics**: [https://docs.expo.dev/versions/latest/sdk/haptics/](https://docs.expo.dev/versions/latest/sdk/haptics/)
- **React Native SVG**: [https://github.com/software-mansion/react-native-svg](https://github.com/software-mansion/react-native-svg)
- **React Native SVG Transformer**: [https://github.com/kristerkari/react-native-svg-transformer](https://github.com/kristerkari/react-native-svg-transformer)
- **React Hook Form**: [https://react-hook-form.com/get-started](https://react-hook-form.com/get-started)
- **Zod**: [https://zod.dev/](https://zod.dev/)
- **Hook Form Resolvers**: [https://github.com/react-hook-form/resolvers](https://github.com/react-hook-form/resolvers)
- **Lodash**: [https://lodash.com/docs/](https://lodash.com/docs/)
- **Shopify FlashList**: [https://shopify.github.io/flash-list/docs/](https://shopify.github.io/flash-list/docs/)
- **Legend List**: [https://legendapp.com/open-source/list/](https://legendapp.com/open-source/list/)

## React 19.2 Features ⚛️

This template is built on React 19.2 and ships runnable examples of its newer APIs (see `src/components/examples`).

- **React Compiler**: enabled via `experiments.reactCompiler` in `app.json` — it auto-memoizes components so you rarely need `useMemo`/`useCallback`. [Docs](https://react.dev/learn/react-compiler)
- **`use` API + `<Suspense>`**: `src/components/examples/SuspenseScreenExample.tsx` reads a promise with `use()` and lets `<Suspense>` handle the loading state instead of `if (isLoading)` branches. [Docs](https://react.dev/reference/react/use)
- **Screen-level loading & error without conditionals**: Suspense handles _loading_; an Error Boundary handles _errors_. `src/ui/withSuspense.tsx` is a HOC that composes both (with full-screen `UILoadingScreen` + `UIErrorScreen`) — wrap a screen/route with it instead of writing `if (error) return <UIErrorScreen/>`. Keep it at the screen level; widgets should own their inline states. [Suspense](https://react.dev/reference/react/Suspense) · [react-error-boundary](https://github.com/bvaughn/react-error-boundary)
- **`useActionState`**: `src/components/examples/ActionStateExample.tsx` manages an async action's pending/error/result state. [Docs](https://react.dev/reference/react/useActionState)
- **`useEffectEvent`**: `src/components/examples/EffectEventExample.tsx` reads the latest props/state inside an Effect without re-running it. [Docs](https://react.dev/reference/react/useEffectEvent)
- **`<Activity>`**: `src/components/examples/ActivityExample.tsx` keeps a hidden subtree mounted (state preserved, pre-rendered at low priority). [Docs](https://react.dev/reference/react/Activity)

## Next Steps 🛠️

1. **Install Dependencies**: `bun install`
2. **Run Prebuild**: `bun expo prebuild`
3. **Start Development**: `bun ios` or `bun android`
