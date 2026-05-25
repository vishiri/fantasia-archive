import debounce from 'lodash-es/debounce'
import { watch, type Ref } from 'vue'

import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun'
import type { T_faActionId } from 'app/types/I_faActionManagerDomain'

/**
 * Debounced persistence of a floating window frame layout (silent; failures surface through the action manager).
 */
export function useFaFloatingWindowFramePersist (opts: {
  debounceMs?: number
  failureActionId: T_faActionId
  h: Ref<number>
  persistFrame: () => Promise<void>
  windowModel: Ref<boolean>
  w: Ref<number>
  x: Ref<number>
  y: Ref<number>
}): void {
  const debounceMs = opts.debounceMs ?? 280

  async function persistFrameNow (): Promise<void> {
    if (!opts.windowModel.value) {
      return
    }
    try {
      await opts.persistFrame()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      void runFaAction(opts.failureActionId, { message })
    }
  }

  const schedulePersist = debounce(() => {
    void persistFrameNow()
  }, debounceMs)

  watch(
    [
      opts.x,
      opts.y,
      opts.w,
      opts.h
    ],
    () => {
      if (!opts.windowModel.value) {
        return
      }
      schedulePersist()
    }
  )

  watch(
    () => opts.windowModel.value,
    (open, wasOpen) => {
      if (!open && wasOpen) {
        schedulePersist.flush()
        void persistFrameNow()
      }
    },
    { immediate: true }
  )
}
