import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.json",
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "\\.module\\.css$": "<rootDir>/src/__mocks__/css-modules.ts",
  },
  testMatch: ["<rootDir>/src/**/*.test.ts"],
};

export default config;
