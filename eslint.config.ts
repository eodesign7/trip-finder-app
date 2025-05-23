import { Linter } from "eslint";
import * as tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import * as reactPlugin from "eslint-plugin-react";
import * as reactHooks from "eslint-plugin-react-hooks";

const config: Linter.FlatConfig[] = [
  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      ".next/",
      "server/dist/",
      "eslint.config.ts",
      "vite.config.ts",
      "tailwind.config.ts",
    ],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ["./tsconfig.app.json", "./server/tsconfig.json"],
      },
    },
    plugins: {
      // @ts-expect-error: @typescript-eslint/eslint-plugin Flat config type mismatch
      "@typescript-eslint": tseslint.default,
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      // Tu si môžeš pridať vlastné pravidlá
    },
  },
];

export default config;
