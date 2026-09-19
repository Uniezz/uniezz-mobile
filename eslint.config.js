// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");
const reactCompiler = require("eslint-plugin-react-compiler");

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      "react-compiler": reactCompiler,
    },
    rules: {
      "prettier/prettier": "warn",
      // Surfaces components the React Compiler can't optimize, for your real app code.
      "react-compiler/react-compiler": "warn",
    },
  },
  {
    // The bundled eslint-plugin-react-hooks (v5) doesn't yet recognize the stable
    // useEffectEvent, so the example there needs an exhaustive-deps escape hatch,
    // which in turn trips the compiler rule. These example files are throwaway
    // references, so exempt them rather than ship a spurious warning.
    files: ["src/components/examples/**"],
    rules: { "react-compiler/react-compiler": "off" },
  },
  {
    ignores: ["dist/*", "node_modules/*", ".expo/*"],
  },
]);
