import type { Ref } from 'vue'

import type { I_FaFloatingWindowFrameLayout } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'
import {
  computeFaFloatingWindowResizeFrame,
  type T_faFloatingWindowResizeEdge
} from 'app/src/scripts/floatingWindows/faFloatingWindowResizeGeometry'

/**
 * Applies one pointer position to floating-window geometry during resize (used from rAF-batched pointermove).
 */
export function applyFaFloatingWindowResizePointerSample (
  layout: I_FaFloatingWindowFrameLayout,
  activeEdge: T_faFloatingWindowResizeEdge,
  originX: number,
  originY: number,
  originW: number,
  originH: number,
  startCx: number,
  startCy: number,
  e: PointerEvent,
  x: Ref<number>,
  y: Ref<number>,
  w: Ref<number>,
  h: Ref<number>
): void {
  const deltaX = e.clientX - startCx
  const deltaY = e.clientY - startCy
  const viewport = {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight
  }
  const next = computeFaFloatingWindowResizeFrame(
    layout,
    viewport,
    activeEdge,
    {
      x: originX,
      y: originY,
      w: originW,
      h: originH
    },
    deltaX,
    deltaY
  )
  x.value = next.x
  y.value = next.y
  w.value = next.w
  h.value = next.h
}

/**
 * Window-level pointer listeners for floating-window resize. Coalesces pointermove to one geometry update per animation frame.
 */
export class FaFloatingWindowResizePointerSession {
  private resizePointerId: number | null = null
  private activeEdge: T_faFloatingWindowResizeEdge | null = null
  private startCx = 0
  private startCy = 0
  private originX = 0
  private originY = 0
  private originW = 0
  private originH = 0
  private pendingMoveEvent: PointerEvent | null = null
  private moveRafId: number | null = null

  public constructor (
    private readonly layout: I_FaFloatingWindowFrameLayout,
    private readonly x: Ref<number>,
    private readonly y: Ref<number>,
    private readonly w: Ref<number>,
    private readonly h: Ref<number>,
    private readonly raiseZ: () => void,
    private readonly isResizeActive: Ref<boolean>
  ) {}

  public dispose (): void {
    this.teardownWindowListeners()
  }

  public onResizePointerDown (edge: T_faFloatingWindowResizeEdge, e: PointerEvent): void {
    if (e.button !== 0) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    this.raiseZ()
    this.isResizeActive.value = true
    this.activeEdge = edge
    this.resizePointerId = e.pointerId
    this.startCx = e.clientX
    this.startCy = e.clientY
    this.originX = this.x.value
    this.originY = this.y.value
    this.originW = this.w.value
    this.originH = this.h.value
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    window.addEventListener('pointermove', this.onResizeMove)
    window.addEventListener('pointerup', this.onResizeEnd)
    window.addEventListener('pointercancel', this.onResizeEnd)
  }

  private teardownWindowListeners (): void {
    if (this.moveRafId !== null) {
      window.cancelAnimationFrame(this.moveRafId)
      this.moveRafId = null
    }
    this.pendingMoveEvent = null
    window.removeEventListener('pointermove', this.onResizeMove)
    window.removeEventListener('pointerup', this.onResizeEnd)
    window.removeEventListener('pointercancel', this.onResizeEnd)
  }

  private flushPendingResize (): void {
    if (this.pendingMoveEvent === null || this.resizePointerId === null || this.activeEdge === null) {
      return
    }
    const e = this.pendingMoveEvent
    this.pendingMoveEvent = null
    applyFaFloatingWindowResizePointerSample(
      this.layout,
      this.activeEdge,
      this.originX,
      this.originY,
      this.originW,
      this.originH,
      this.startCx,
      this.startCy,
      e,
      this.x,
      this.y,
      this.w,
      this.h
    )
  }

  private readonly onResizeMove = (e: PointerEvent): void => {
    if (this.resizePointerId === null || e.pointerId !== this.resizePointerId || this.activeEdge === null) {
      return
    }
    this.pendingMoveEvent = e
    if (this.moveRafId !== null) {
      return
    }
    this.moveRafId = window.requestAnimationFrame(() => {
      this.moveRafId = null
      this.flushPendingResize()
    })
  }

  private readonly onResizeEnd = (e: PointerEvent): void => {
    if (this.resizePointerId === null || e.pointerId !== this.resizePointerId) {
      return
    }
    if (this.moveRafId !== null) {
      window.cancelAnimationFrame(this.moveRafId)
      this.moveRafId = null
    }
    this.flushPendingResize()
    this.resizePointerId = null
    this.activeEdge = null
    this.isResizeActive.value = false
    this.teardownWindowListeners()
  }
}
