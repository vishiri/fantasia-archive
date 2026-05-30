import { expect, test } from 'vitest'

import { shouldSuppressDevtoolsAutofillStderrChunk } from '../devtoolsAutofillStderrPattern'

/**
 * shouldSuppressDevtoolsAutofillStderrChunk
 * Filters known Autofill CDP stderr noise.
 */
test('shouldSuppressDevtoolsAutofillStderrChunk matches autofill enable noise', () => {
  expect(shouldSuppressDevtoolsAutofillStderrChunk("ERROR: Autofill.enable wasn't found")).toBe(true)
})

test('shouldSuppressDevtoolsAutofillStderrChunk ignores unrelated stderr', () => {
  expect(shouldSuppressDevtoolsAutofillStderrChunk('normal log line')).toBe(false)
})
