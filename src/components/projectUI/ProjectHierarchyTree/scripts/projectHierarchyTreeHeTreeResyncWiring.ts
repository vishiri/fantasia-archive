import type { Ref } from 'vue'

export function waitForNextAnimationFrame (
  requestAnimationFrame: (callback: () => void) => number
): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })
}

export function createProjectHierarchyTreeHeTreeResyncController (deps: {
  nextTick: () => Promise<void>
  reapplyHeTreeOpenState: () => void
  requestAnimationFrame: (callback: () => void) => number
  suppressTreeEmit: Ref<boolean>
  treeMountKey: Ref<number>
}) {
  let heTreeResyncInFlight: Promise<void> | null = null
  let programmaticHeTreeResyncActive = false

  async function resyncHeTreeFromPublishedTreeData (options?: {
    remount?: boolean
  }): Promise<void> {
    if (heTreeResyncInFlight !== null) {
      await heTreeResyncInFlight
    }
    const remount = options?.remount === true
    const resyncWork = (async () => {
      deps.suppressTreeEmit.value = true
      programmaticHeTreeResyncActive = true
      if (remount) {
        deps.treeMountKey.value += 1
        await deps.nextTick()
        await deps.nextTick()
        await waitForNextAnimationFrame(deps.requestAnimationFrame)
        deps.reapplyHeTreeOpenState()
      } else {
        // Soft path: no remount. Full reapplyHeTreeOpenState after a root slice
        // caused whole-tree blink. Finish opens the expand target instead.
        await deps.nextTick()
      }
      programmaticHeTreeResyncActive = false
      deps.suppressTreeEmit.value = false
    })()
    heTreeResyncInFlight = resyncWork
    try {
      await resyncWork
    } finally {
      programmaticHeTreeResyncActive = false
      if (heTreeResyncInFlight === resyncWork) {
        heTreeResyncInFlight = null
      }
    }
  }

  async function awaitHeTreeResyncIdle (): Promise<void> {
    if (heTreeResyncInFlight !== null) {
      await heTreeResyncInFlight
    }
  }

  function isProgrammaticHeTreeResyncActive (): boolean {
    return programmaticHeTreeResyncActive
  }

  return {
    awaitHeTreeResyncIdle,
    isProgrammaticHeTreeResyncActive,
    resyncHeTreeFromPublishedTreeData
  }
}
