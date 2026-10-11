const { getDefaultConfig } = require("expo/metro-config");
const { withNanoIcons } = require("react-native-nano-icons/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNanoIcons(config);
