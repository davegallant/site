import eslintPluginPrettier from "eslint-plugin-prettier";
import globals from "globals";

// Note: assets/js/flexsearch.js is intentionally excluded: it contains Hugo
// template expressions ({{ }}) that are expanded at build time, so it is not
// valid standalone JavaScript for linting.
export default [
  {
    ignores: ["node_modules/", "public/", "resources/", ".hugo_build.lock"],
  },
  {
    files: [
      "assets/js/dark-mode.js",
      "assets/js/prism.js",
      "assets/js/menu.js",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
    },
    plugins: { prettier: eslintPluginPrettier },
    rules: { "prettier/prettier": "error" },
  },
];
