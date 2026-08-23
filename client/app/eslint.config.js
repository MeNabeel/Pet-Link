module.exports = [
  {
    ignores: ["node_modules/**", ".expo/**", "dist/**"]
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        React: "readonly",
        window: "readonly",
        document: "readonly",
        FileReader: "readonly",
        console: "readonly",
        alert: "readonly",
        fetch: "readonly",
        require: "readonly",
        module: "readonly",
        process: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        navigator: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["warn", { "vars": "all", "args": "none", "ignoreRestSiblings": true }],
      "no-console": "off",
      "no-undef": "error"
    }
  }
];
