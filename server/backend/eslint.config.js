module.exports = [
  {
    ignores: ["node_modules/**", "dist/**"]
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["warn", { "vars": "all", "args": "none", "ignoreRestSiblings": true }],
      "no-console": "off",
      "no-undef": "error"
    }
  }
];
