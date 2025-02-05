import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*vitest.@(spec|test).?(c|m)[jt]s?(x)'],
    reporters: ['default', 'json'],
    outputFile: 'test-results/test-results-vitest.json'
  }
})
