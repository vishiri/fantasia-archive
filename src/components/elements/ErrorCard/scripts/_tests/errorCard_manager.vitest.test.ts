import { expect, test } from 'vitest'
import { ref } from 'vue'

import { useErrorCard } from '../errorCard_manager'

/**
 * useErrorCard
 * Binds scoped max-width from the width ref for the SFC stylesheet.
 */
test('Test that useErrorCard exposes errorCardMaxWidthPx from width ref', () => {
  const width = ref(420)
  const { errorCardMaxWidthPx } = useErrorCard(width)

  expect(errorCardMaxWidthPx.value).toBe('420px')

  width.value = 300
  expect(errorCardMaxWidthPx.value).toBe('300px')
})
