# Project Documentation 📚

Welcome to the uniezz mobile app! This document provides links to the documentation for the libraries installed in the project.

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

uniezz does **not** use Supabase or any other BaaS. The app talks to the uniezz **Go API**; media lives in **AWS S3**.

- **uniezz API (Go):** auth, profiles, feed, chat, and the rest of the product. Base URL from app config — never call AWS or identity providers (USOS, Entra) from the client
- **Media (AWS S3):** photos, chat attachments, exam files. The Go API authorizes uploads and issues object URLs; the app does not hold long-lived AWS keys
- **TanStack Query (React Query)**: [https://tanstack.com/query/latest/docs/framework/react/quick-start](https://tanstack.com/query/latest/docs/framework/react/quick-start)
- **openapi-fetch / openapi-typescript**: [https://openapi-ts.dev/](https://openapi-ts.dev/) — the client is typed from the API's `openapi.yaml`

## Local Storage & Platform 🔐

- **React Native MMKV**: [https://github.com/mrousavy/react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- **Expo Secure Store**: [https://docs.expo.dev/versions/latest/sdk/securestore/](https://docs.expo.dev/versions/latest/sdk/securestore/)
- **React Native Keyboard Controller**: [https://kirillzyusko.github.io/react-native-keyboard-controller/](https://kirillzyusko.github.io/react-native-keyboard-controller/)
- **MapLibre React Native**: [https://maplibre.org/maplibre-react-native/](https://maplibre.org/maplibre-react-native/)
- **PostHog React Native**: [https://posthog.com/docs/libraries/react-native](https://posthog.com/docs/libraries/react-native)

## Additional Libraries 📦

- **Gorhom Bottom Sheet**: [https://gorhom.github.io/react-native-bottom-sheet/](https://gorhom.github.io/react-native-bottom-sheet/)
- **React Native Reanimated**: [https://docs.swmansion.com/react-native-reanimated/](https://docs.swmansion.com/react-native-reanimated/)
- **React Native Gesture Handler**: [https://docs.swmansion.com/react-native-gesture-handler/](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started//)
- **Sonner Native** (toasts): [https://sonner.emilkowal.ski/](https://sonner.emilkowal.ski/)
- **Expo Haptics**: [https://docs.expo.dev/versions/latest/sdk/haptics/](https://docs.expo.dev/versions/latest/sdk/haptics/)
- **React Native SVG**: [https://github.com/software-mansion/react-native-svg](https://github.com/software-mansion/react-native-svg)
- **React Native SVG Transformer**: [https://github.com/kristerkari/react-native-svg-transformer](https://github.com/kristerkari/react-native-svg-transformer)
- **React Hook Form**: [https://react-hook-form.com/get-started](https://react-hook-form.com/get-started)
- **Zod**: [https://zod.dev/](https://zod.dev/)
- **Hook Form Resolvers**: [https://github.com/react-hook-form/resolvers](https://github.com/react-hook-form/resolvers)
- **Lodash**: [https://lodash.com/docs/](https://lodash.com/docs/)
- **Shopify FlashList**: [https://shopify.github.io/flash-list/docs/](https://shopify.github.io/flash-list/docs/)

## React 19.2 Features ⚛️

The app is built on React 19.2.

- **React Compiler**: enabled via `experiments.reactCompiler` in `app.json` — it auto-memoizes components, so avoid `useMemo`/`useCallback` unless profiling proves a need. [Docs](https://react.dev/learn/react-compiler)
- **Typed routes**: enabled via `experiments.typedRoutes` — route names and params are checked by TypeScript.

## Next Steps 🛠️

1. **Install Dependencies**: `bun install`
2. **Run Prebuild**: `bun expo prebuild`
3. **Start Development**: `bun ios` or `bun android`
