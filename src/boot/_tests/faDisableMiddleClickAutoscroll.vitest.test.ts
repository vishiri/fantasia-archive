import { expect, test, vi } from 'vitest'

import { createFaDisableMiddleClickAutoscrollBoot } from '../scripts/functions/createFaDisableMiddleClickAutoscrollBoot'
import { createHandleFaDisableMiddleClickAutoscrollMouseDown } from '../scripts/faDisableMiddleClickAutoscrollMouseDownWiring'

test('Test that handleFaDisableMiddleClickAutoscrollMouseDown prevents default on middle button only', () => {
  const handleFaDisableMiddleClickAutoscrollMouseDown = createHandleFaDisableMiddleClickAutoscrollMouseDown({
    isMiddleMouseButton: (event) => event.button === 1
  })
  const leftClickEvent = {
    button: 0,
    preventDefault: vi.fn()
  } as unknown as MouseEvent
  const middleClickEvent = {
    button: 1,
    preventDefault: vi.fn()
  } as unknown as MouseEvent

  handleFaDisableMiddleClickAutoscrollMouseDown(leftClickEvent)
  handleFaDisableMiddleClickAutoscrollMouseDown(middleClickEvent)

  expect(leftClickEvent.preventDefault).not.toHaveBeenCalled()
  expect(middleClickEvent.preventDefault).toHaveBeenCalledTimes(1)
})

test('Test that runFaDisableMiddleClickAutoscrollBoot registers capture mousedown listener', () => {
  const addDocumentListener = vi.fn()
  const boot = createFaDisableMiddleClickAutoscrollBoot({
    addDocumentListener,
    handleFaDisableMiddleClickAutoscrollMouseDown: vi.fn()
  })

  boot.runFaDisableMiddleClickAutoscrollBoot()

  expect(addDocumentListener).toHaveBeenCalledWith(
    'mousedown',
    expect.any(Function),
    { capture: true }
  )
})
