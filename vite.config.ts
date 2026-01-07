import config from "@vuebro/configs/vite";
import { defineConfig, mergeConfig } from "vite";

export default mergeConfig(
  config,
  defineConfig({
    build: {
      emptyOutDir: false,
      lib: {
        entry: "src/loader-sfc.ts",
        fileName: "loader-sfc.esm-browser.prod",
        formats: ["es"],
      },
      minify: "terser",
      rollupOptions: { external: ["vue"] },
    },
  }),
);
