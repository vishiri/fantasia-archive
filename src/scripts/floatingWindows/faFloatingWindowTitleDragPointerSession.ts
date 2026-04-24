import type { Ref } from 'vue'

import { applyFaFloatingWindowTitleDragFromPointer } from 'app/src/scripts/floatingWindows/faFloatingWindowTitleDragPointerApply'
import type { I_FaFloatingWindowFrameLayout } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'

/**
 * Window-level pointer listeners for floating-window title drag. Coalesces pointermove to one geometry update per frame.
 */
export class FaFloatingWindowTitleDragPointerSession {
  private dragPointerId: number | null = null
  private dragStartX = 0
  private dragStartY = 0
  private originX = 0
  private originY = 0
  private pendingMoveEvent: PointerEvent | null = null
  private moveRafId: number | null = null

  public constructor (
    private readonly layout: I_FaFloatingWindowFrameLayout,
    private readonly x: Ref<number>,
    private readonly y: Ref<number>,
    private readonly w: Ref<number>,
    private readonly h: Ref<number>,
    private readonly raiseZ: () => void,
    private readonly isDragActive: Ref<boolean>
  ) {}

  public dispose (): void {
    this.teardownWindowListeners()
  }

  public onTitlePointerDown (e: PointerEvent): void {
    if (e.button !== 0) {
      return
    }
    e.preventDefault()
    this.isDragActive.value = true
    this.dragPointerId = e.pointerId
    this.dragStartX = e.clientX
    this.dragStartY = e.clientY
    this.originX = this.x.value
    this.originY = this.y.value
    this.raiseZ()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    window.addEventListener('pointermove', this.onDragMove)
    window.addEventListener('pointerup', this.onDragEnd)
    window.addEventListener('pointercancel', this.onDragEnd)
  }

  private teardownWindowListeners (): void {
    if (this.moveRafId !== null) {
      window.cancelAnimationFrame(this.moveRafId)
      this.moveRafId = null
    }
    this.pendingMoveEvent = null
    window.removeEventListener('pointermove', this.onDragMove)
    window.removeEventListener('pointerup', this.onDragEnd)
    window.removeEventListener('pointercancel', this.onDragEnd)
  }

  private flushPendingTitleDrag (): void {
    if (this.pendingMoveEvent === null || this.dragPointerId === null) {
      return
    }
    const e = this.pendingMoveEvent
    this.pendingMoveEvent = null
    applyFaFloatingWindowTitleDragFromPointer(
      this.layout,
      e,
      this.dragStartX,
      this.dragStartY,
      this.originX,
      this.originY,
      this.w,
      this.h,
      this.x,
      this.y
    )
  }

  private readonly onDragMove = (e: PointerEvent): void => {
    if (this.dragPointerId === null || e.pointerId !== this.dragPointerId) {
      return
    }
    this.pendingMoveEvent = e
    if (this.moveRafId !== null) {
      return
    }
    this.moveRafId = window.requestAnimationFrame(() => {
      this.moveRafId = null
      this.flushPendingTitleDrag()
    })
  }

  private readonly onDragEnd = (e: PointerEvent): void => {
    if (this.dragPointerId === null || e.pointerId !== this.dragPointerId) {
      return
    }
    if (this.moveRafId !== null) {
      window.cancelAnimationFrame(this.moveRafId)
      this.moveRafId = null
    }
    this.flushPendingTitleDrag()
    this.dragPointerId = null
    this.isDragActive.value = false
    this.teardownWindowListeners()
  }
}
