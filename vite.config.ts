import config from "@skaldapp/configs/vite";
import { defineConfig, mergeConfig } from "vite";

const emptyOutDir = false,
  entry = "src/loader-sfc.ts",
  external = ["vue"],
  fileName = "loader-sfc.esm-browser.prod",
  minify = "terser",
  rollupOptions = { external };

export default mergeConfig(
  config,
  defineConfig({
    build: {
      emptyOutDir,
      lib: { entry, fileName, formats: ["es"] },
      minify,
      rollupOptions,
    },
  }),
);
