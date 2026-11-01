import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globalSetup: './tests/globalSetup.ts',
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
  },
})
