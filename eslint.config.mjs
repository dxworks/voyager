// @ts-check
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
    // Global ignores (replaces .eslintignore)
    {
        ignores: [
            "dist/**",
            "bin/**",
            "node_modules/**",
            "*.tsbuildinfo",
        ],
    },

    // Base JS recommended rules
    eslint.configs.recommended,

    // TypeScript recommended rules
    tseslint.configs.recommended,

    // Optional extras if you want (uncomment later):
    // tseslint.configs.strict,
    // tseslint.configs.stylistic,
);
