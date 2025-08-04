import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Next.js presets you already have
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // ↓ NEW block – overrides or adds rules
  {
    rules: {
      // disable the “no-explicit-any” rule project-wide
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
