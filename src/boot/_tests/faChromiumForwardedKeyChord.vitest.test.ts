import { afterEach, expect, test, vi } from 'vitest'

const runBootMock = vi.hoisted(() => vi.fn())

vi.mock('../scripts/faChromiumForwardedKeyChord_manager', () => ({
  runFaChromiumForwardedKeyChordBoot: runBootMock
}))

import faChromiumForwardedKeyChord from '../faChromiumForwardedKeyChord'

afterEach(() => {
  runBootMock.mockReset()
})

test('faChromiumForwardedKeyChord boot invokes runFaChromiumForwardedKeyChordBoot', async () => {
  runBootMock.mockResolvedValue(undefined)
  const run = faChromiumForwardedKeyChord as () => Promise<void>
  await run()
  expect(runBootMock).toHaveBeenCalledOnce()
})
