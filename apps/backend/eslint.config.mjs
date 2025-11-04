// ESLint v9 flat config for @vivaform/backend (NestJS + TypeScript)
// ESM config

import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Ignore build artifacts
  {
    ignores: [
      "dist/**",
      "build/**",
      "coverage/**",
      "node_modules/**"
    ]
  },
  {
    files: [
      "src/**/*.ts",
      "vitest.config.ts",
      "vitest.e2e.config.ts"
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      // TypeScript best practices (minimal set)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" }
      ]
    }
  }
];
