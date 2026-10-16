const { getDefaultConfig } = require("expo/metro-config");
const { withNanoIcons } = require("react-native-nano-icons/metro");

const config = getDefaultConfig(__dirname);
config.resolver.blockList = [
  ...config.resolver.blockList,
  /[\\/]\.env\.staging\.local$/,
];

module.exports = withNanoIcons(config);
