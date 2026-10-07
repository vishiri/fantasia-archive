import { ref } from 'vue'
import { expect, test } from 'vitest'

import { createUseGlobalWindowButtons } from '../functions/createUseGlobalWindowButtons'

test('Test that an older maximized check does not overwrite a newer one', async () => {
  let releaseSlowCheck: ((value: boolean) => void) | undefined
  let checks = 0
  let intervalHandler: (() => void) | undefined
  const useButtons = createUseGlobalWindowButtons({
    checkWindowMaximized: () => {
      checks += 1
      if (checks === 2) {
        return new Promise<boolean>((resolve) => {
          releaseSlowCheck = resolve
        })
      }
      if (checks === 3) {
        return Promise.resolve(false)
      }
      return Promise.resolve(true)
    },
    clearInterval: () => undefined,
    getMode: () => 'electron',
    hasFaWindowControlBridge: () => true,
    onMounted: (hook) => {
      void hook()
    },
    onUnmounted: () => undefined,
    ref,
    runFaAction: () => undefined,
    setInterval: (handler) => {
      intervalHandler = handler
      return 1
    },
    shouldPollMaximized: () => true
  })
  const buttons = useButtons()
  await Promise.resolve()
  await Promise.resolve()
  const poll = intervalHandler
  if (poll === undefined) {
    throw new Error('maximized poll interval was not armed')
  }
  poll()
  await Promise.resolve()
  poll()
  await Promise.resolve()
  const finishSlowCheck = releaseSlowCheck
  if (finishSlowCheck === undefined) {
    throw new Error('slow maximized check was not started')
  }
  finishSlowCheck(true)
  await Promise.resolve()
  expect(buttons.isMaximized.value).toBe(false)
})
