const path = require("node:path");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const defaultConfig = getDefaultConfig(projectRoot);

/** @type {import('metro-config').MetroConfig} */
const config = {
  watchFolders: [monorepoRoot],
  resolver: {
    platforms: ["android", "ios", "native", "web"],
    unstable_enableSymlinks: true,
    unstable_enablePackageExports: true,
    nodeModulesPaths: [
      path.resolve(projectRoot, "node_modules"),
      path.resolve(monorepoRoot, "node_modules")
    ]
  }
};

module.exports = mergeConfig(defaultConfig, config);
