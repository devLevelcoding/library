/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'node',
  // Use babel-jest with next/babel preset — avoids SWC RSC boundary enforcement
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs|cjs)$': 'babel-jest',
  },
  moduleNameMapper: {
    // Path alias
    '^@/(.*)$': '<rootDir>/$1',
    // Stub CSS modules and static assets
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/style-mock.ts',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp)$': '<rootDir>/__mocks__/file-mock.ts',
    // Stub next/headers with a testable mock
    '^next/headers$': '<rootDir>/__mocks__/next-headers.ts',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(lucide-react|@radix-ui|class-variance-authority|tailwind-merge|clsx|cmdk)/)',
  ],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'actions/**/*.{ts,tsx}',
    'middleware.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

module.exports = config
