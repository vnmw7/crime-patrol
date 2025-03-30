// https://docs.expo.dev/guides/using-eslint/
// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ["expo", "prettier"],
  ignorePatterns: ["/dist/*"],
  overrides: [
    {
      files: ["jest.setup.js"],
      env: {
        jest: true,
      },
    },
  ],
};
