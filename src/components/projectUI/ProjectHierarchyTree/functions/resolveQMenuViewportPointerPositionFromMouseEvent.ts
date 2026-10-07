import type { I_qMenuViewportPointerPosition } from 'app/types/I_qMenuViewportPointerPosition'

export function resolveQMenuViewportPointerPositionFromMouseEvent (
  event: MouseEvent
): I_qMenuViewportPointerPosition {
  const left = event.clientX
  const top = event.clientY
  return {
    left,
    top
  }
}
