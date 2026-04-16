import globals from "globals";
import js from "@eslint/js";
import prettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  {
    ignores: ["assets/js/flexsearch.js", "assets/js/prism.js", "public/**", "resources/**"],
  },
  js.configs.recommended,
  prettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      sourceType: "module",
    },
  },
];
