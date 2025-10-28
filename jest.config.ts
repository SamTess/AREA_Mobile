import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|react-clone-referenced-element|@react-native|@react-navigation|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-native-.*|@expo/.*|@unimodules/.*|unimodules-.*|sentry-expo|nativewind|@gluestack-ui/.*|@gluestack-style/.*)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native$': 'react-native',
    '\\.(css|less|sass|scss)$': '<rootDir>/test-utils/styleMock.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.web.tsx',
    '!**/*.web.ts',
    '!**/*.next15.tsx',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: ['/node_modules/', '/Android/', '/.expo/', '/AREA_Web/', '/AREA_Back/'],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};

export default config;
