import type { I_qMenuViewportPointerPosition } from 'app/types/I_qMenuViewportPointerPosition'

export function resolveQMenuViewportPointerPositionFromMouseEvent (
  event: MouseEvent
): I_qMenuViewportPointerPosition {
  return {
    left: event.clientX,
    top: event.clientY
  }
}
