import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import {
  HawaiiProxyConfig,
  hawaiiAssetPrefix,
  hawaiiMfeName,
  hawaiiProxy,
  overridePlatformManifest,
} from "hawaii-dev-tools";
import { name as packageName, version as packageVersion } from "./package.json";

export default defineConfig({
  server: {
    port: 1337,
    open: true,
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      // generate a MF-compatible name, using the package name
      name: "previewBuilder",
      exposes: {
        // expose the mfe.ts javascript module under the public name "App"
        "./PreviewBuilder": "./src/mfe",
      },
    }),
  ],
  output: {
    assetPrefix: hawaiiAssetPrefix(packageName, packageVersion),
  },
});
