# uniezz mobile

Expo / React Native app. Package manager is **Bun** — use `bun` / `bunx`, not npm or npx.

## Get started

```bash
bun install
bun start
```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

Native run scripts:

```bash
bun ios
bun android
```

Routes live in `src/app/` — [file-based routing](https://docs.expo.dev/router/introduction) via Expo Router.

Checks:

```bash
bun lint
bun run typecheck
bun test
```

`bun install` runs `prepare`, which points Git at `.githooks/`. The pre-commit hook
checks staged JS/TS/JSON/Markdown files with Prettier, so run `bun run format`
before committing if it complains.

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/)
- [Expo on GitHub](https://github.com/expo/expo)
- [Discord community](https://chat.expo.dev)
