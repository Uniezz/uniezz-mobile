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
    ignores: ["dist/*", "node_modules/*", ".expo/*"],
  },
]);
