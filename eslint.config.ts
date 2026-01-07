import shared from "@skaldapp/configs/eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(shared, {
  languageOptions: {
    parserOptions: {
      projectService: { allowDefaultProject: ["*.config.ts"] },
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
