import { beforeEach, expect, test, vi } from 'vitest'

import { attachFaWorkspaceSidebarLiveWidthSync } from '../faWorkspaceSidebarLiveWidthSyncWiring'

type T_resizeObserverCallback = (entries: ResizeObserverEntry[]) => void

let resizeObserverCallback: T_resizeObserverCallback | undefined

beforeEach(() => {
  resizeObserverCallback = undefined
  vi.stubGlobal('ResizeObserver', class {
    constructor (callback: T_resizeObserverCallback) {
      resizeObserverCallback = callback
    }

    observe (): void {}

    disconnect (): void {}
  })
})

test('Test that attachFaWorkspaceSidebarLiveWidthSync seeds width from the panel element', () => {
  const onWidthPx = vi.fn()
  const panelElement = {
    getBoundingClientRect: () => ({
      width: 512
    })
  } as HTMLElement

  attachFaWorkspaceSidebarLiveWidthSync({
    onWidthPx,
    panelElement
  })

  expect(onWidthPx).toHaveBeenCalledWith(512)
})

test('Test that attachFaWorkspaceSidebarLiveWidthSync forwards ResizeObserver content width', () => {
  const onWidthPx = vi.fn()
  const panelElement = {
    getBoundingClientRect: () => ({
      width: 400
    })
  } as HTMLElement

  attachFaWorkspaceSidebarLiveWidthSync({
    onWidthPx,
    panelElement
  })

  resizeObserverCallback?.([
    {
      contentRect: {
        width: 468.5
      }
    } as ResizeObserverEntry
  ])

  expect(onWidthPx).toHaveBeenLastCalledWith(468.5)
})
