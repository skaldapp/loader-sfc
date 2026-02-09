import shared from "@skaldapp/configs/eslint";
import { defineConfig } from "eslint/config";

const allowDefaultProject = ["*.config.ts"],
  projectService = { allowDefaultProject },
  tsconfigRootDir = import.meta.dirname,
  parserOptions = { projectService, tsconfigRootDir },
  languageOptions = { parserOptions };

export default defineConfig(shared, { languageOptions });
