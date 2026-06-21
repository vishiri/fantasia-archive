import type { WatchSource } from 'vue'

import { scheduleScrollContainerToRevealLastItem } from 'app/src/scripts/dom/functions/scrollContainerToRevealLastItem'
import { shouldScrollContainerAfterItemCountIncrease } from 'app/src/scripts/dom/functions/shouldScrollContainerAfterItemCountIncrease'

export function createDialogProjectSettingsScrollOnAppendWatch (deps: {
  getCount: WatchSource<number>
  getScrollContainer: () => HTMLElement | null
  itemSelector: string
  nextTick: () => Promise<void>
  requestAnimationFrame: (callback: FrameRequestCallback) => number
  watch: (
    source: WatchSource<number>,
    callback: (nextCount: number, previousCount: number | undefined) => void
  ) => void
}): void {
  deps.watch(deps.getCount, (nextCount, previousCount) => {
    if (!shouldScrollContainerAfterItemCountIncrease(nextCount, previousCount)) {
      return
    }
    scheduleScrollContainerToRevealLastItem({
      getContainer: deps.getScrollContainer,
      itemSelector: deps.itemSelector,
      nextTick: deps.nextTick,
      requestAnimationFrame: deps.requestAnimationFrame
    })
  })
}
