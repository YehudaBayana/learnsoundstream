const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/__tests__/**/*.spec.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/src/components/ui/Card.test.tsx",
    "/src/components/ui/ConfirmationModal.test.tsx",
    "/src/components/ui/ContextMenu.test.tsx",
    "/src/components/ui/DataDisplay.test.tsx",
    "/src/components/ui/Feedback.test.tsx",
    "/src/components/ui/Form.test.tsx",
    "/src/components/ui/Heading.test.tsx",
    "/src/components/ui/Misc.test.tsx",
    "/src/components/ui/Modal.test.tsx",
    "/src/components/ui/Navigation.test.tsx",
    "/src/components/ui/PageShell.test.tsx",
  ],
};

module.exports = createJestConfig(customJestConfig);
