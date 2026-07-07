import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "node_modules/**", "public/**"],
  },
  {
    rules: {
      // Server actions and API handlers frequently receive `unknown` from
      // Zod-validated forms; keep this as a warning rather than an error.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
