import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // localStorage hydration in useEffect is an established pattern throughout this codebase
      "react-hooks/set-state-in-effect": "warn",
      // `any` types are pre-existing in API/service layers
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Design prototype sketches — not part of the app
    "design/**",
    // Vendored / generated files in public
    "public/**",
  ]),
]);

export default eslintConfig;
