import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Enforce consistent spacing
      "indent": ["error", 2], // 2 spaces for indentation
      "no-mixed-spaces-and-tabs": "error", // Disallow mixed spaces and tabs
      "space-before-function-paren": ["error", "always"], // Space before function parentheses
      "space-in-parens": ["error", "never"], // No spaces inside parentheses
      "key-spacing": ["error", { beforeColon: false, afterColon: true }], // Consistent spacing in object keys
      "comma-spacing": ["error", { before: false, after: true }], // Space after commas

      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn"],
    },
  },
];

export default eslintConfig;