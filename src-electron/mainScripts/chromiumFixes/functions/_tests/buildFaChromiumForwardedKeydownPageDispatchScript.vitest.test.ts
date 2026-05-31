import { expect, test } from 'vitest'

import { buildFaChromiumForwardedKeydownPageDispatchScript } from '../buildFaChromiumForwardedKeydownPageDispatchScript'

test('buildFaChromiumForwardedKeydownPageDispatchScript embeds dom code in KeyboardEvent', () => {
  const script = buildFaChromiumForwardedKeydownPageDispatchScript('KeyO')

  expect(script).toContain('"KeyO"')
  expect(script).toContain('KeyboardEvent')
  expect(script).toContain('ctrlKey: true')
  expect(script).toContain('shiftKey: true')
})
