import { ref } from 'vue'
import { expect, test, vi } from 'vitest'

import { createGlobalLanguageSelectorSpellcheckRefreshControl } from '../functions/createGlobalLanguageSelectorSpellcheckRefreshControl'

const tooltipAutoOpenDelayMs = 360

function mountSpellcheckRefreshControl () {
  const queuedNextTicks: Array<() => void> = []
  let unmount = (): void => undefined
  let propsWatch: ((visible: boolean) => void) | undefined
  const props = {
    show: false
  }
  const api = createGlobalLanguageSelectorSpellcheckRefreshControl({
    nextTick: (fn) => {
      if (fn !== undefined) {
        queuedNextTicks.push(() => {
          fn()
        })
      }
      return Promise.resolve()
    },
    onBeforeUnmount: (hook) => {
      unmount = hook
    },
    ref,
    runFaActionAwait: async () => true,
    watch: (_source, effect) => {
      propsWatch = effect
    }
  })
  const control = api.useGlobalLanguageSelectorSpellcheckRefreshControl(props)
  if (propsWatch === undefined) {
    throw new Error('spellcheck refresh watch was not registered')
  }
  const watchShow = propsWatch
  return {
    control,
    flushNextTicks: () => {
      const batch = queuedNextTicks.splice(0, queuedNextTicks.length)
      for (const run of batch) {
        run()
      }
    },
    props,
    unmount: () => {
      unmount()
    },
    watchShow
  }
}

test('Test that a hidden spellcheck refresh does not open the tooltip from a late timer', async () => {
  vi.useFakeTimers()
  const harness = mountSpellcheckRefreshControl()
  harness.props.show = true
  harness.watchShow(true)
  harness.props.show = false
  harness.watchShow(false)
  harness.flushNextTicks()
  await vi.advanceTimersByTimeAsync(tooltipAutoOpenDelayMs)
  expect(harness.control.tooltipOpen.value).toBe(false)
  harness.unmount()
  vi.useRealTimers()
})

test('Test that a second spellcheck refresh show replaces the pending tooltip timer', async () => {
  vi.useFakeTimers()
  const harness = mountSpellcheckRefreshControl()
  harness.props.show = true
  harness.watchShow(true)
  harness.watchShow(true)
  harness.flushNextTicks()
  harness.props.show = false
  harness.watchShow(false)
  await vi.advanceTimersByTimeAsync(tooltipAutoOpenDelayMs)
  expect(harness.control.tooltipOpen.value).toBe(false)
  harness.unmount()
  vi.useRealTimers()
})
