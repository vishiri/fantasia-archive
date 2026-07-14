/** @vitest-environment jsdom */
import { expect, test } from 'vitest'

import { resolveQMenuViewportPointerPositionFromMouseEvent } from '../resolveQMenuViewportPointerPositionFromMouseEvent'

test('Test that resolveQMenuViewportPointerPositionFromMouseEvent maps client coordinates', () => {
  const event = new MouseEvent('contextmenu', {
    clientX: 128,
    clientY: 256
  })

  expect(resolveQMenuViewportPointerPositionFromMouseEvent(event)).toEqual({
    left: 128,
    top: 256
  })
})
