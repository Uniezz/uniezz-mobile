const { getDefaultConfig } = require("expo/metro-config");
const { withNanoIcons } = require("react-native-nano-icons/metro");

const config = getDefaultConfig(__dirname);
// run each module on first use instead of all at startup, so barrel imports (@/hooks, @/utils) don't load every file eagerly;
// Expo leaves this off by default. Side-effect imports (`import "@/schemas"`) still run in order
config.transformer.getTransformOptions = async () => ({
  transform: { experimentalImportSupport: true, inlineRequires: true },
});
config.resolver.blockList = [
  ...config.resolver.blockList,
  /[\\/]\.env\.staging\.local$/,
];

module.exports = withNanoIcons(config);
