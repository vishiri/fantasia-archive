import { expect, test, vi } from 'vitest'

import { createFaActionManagerRunForward } from '../functions/createFaActionManagerRunForward'

test('Test that runFaActionThroughForward throws before wireFaActionManagerRunForward', () => {
  const api = createFaActionManagerRunForward()

  expect(() => {
    api.runFaActionThroughForward('toggleDeveloperTools', undefined)
  }).toThrow('faActionManager runFaAction forward is not wired yet')
})

test('Test that runFaActionThroughForward delegates after wireFaActionManagerRunForward', () => {
  const api = createFaActionManagerRunForward()
  const runFaAction = vi.fn()

  api.wireFaActionManagerRunForward({
    runFaAction
  })
  api.runFaActionThroughForward('toggleDeveloperTools', undefined)

  expect(runFaAction).toHaveBeenCalledWith('toggleDeveloperTools', undefined)
})
