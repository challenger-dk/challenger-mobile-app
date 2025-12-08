const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Configure Metro resolver to handle @/ alias
config.resolver = {
  ...config.resolver,
  alias: {
    '@': projectRoot,
  },
};

module.exports = withNativeWind(config, { input: './global.css' });
