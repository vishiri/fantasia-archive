import type { I_FaFloatingWindowFrameLayout } from 'app/types/I_faFloatingWindowFrameLayout'
import type { T_faFloatingWindowResizeEdge } from 'app/types/I_faFloatingWindowResize'
import type { T_faFloatingWindowResizePointerSessionDeps } from 'app/types/I_faFloatingWindowResizePointerSession'

interface I_faFloatingWindowFrameAxisRef {
  value: number
}

interface I_faFloatingWindowFrameBoolRef {
  value: boolean
}

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
    private readonly sessionDeps: T_faFloatingWindowResizePointerSessionDeps,
    private readonly layout: I_FaFloatingWindowFrameLayout,
    private readonly x: I_faFloatingWindowFrameAxisRef,
    private readonly y: I_faFloatingWindowFrameAxisRef,
    private readonly w: I_faFloatingWindowFrameAxisRef,
    private readonly h: I_faFloatingWindowFrameAxisRef,
    private readonly raiseZ: () => void,
    private readonly isResizeActive: I_faFloatingWindowFrameBoolRef
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
    this.sessionDeps.addWindowEventListener('pointermove', this.onResizeMove)
    this.sessionDeps.addWindowEventListener('pointerup', this.onResizeEnd)
    this.sessionDeps.addWindowEventListener('pointercancel', this.onResizeEnd)
  }

  private teardownWindowListeners (): void {
    if (this.moveRafId !== null) {
      this.sessionDeps.cancelAnimationFrame(this.moveRafId)
      this.moveRafId = null
    }
    this.pendingMoveEvent = null
    this.sessionDeps.removeWindowEventListener('pointermove', this.onResizeMove)
    this.sessionDeps.removeWindowEventListener('pointerup', this.onResizeEnd)
    this.sessionDeps.removeWindowEventListener('pointercancel', this.onResizeEnd)
  }

  private flushPendingResize (): void {
    if (this.pendingMoveEvent === null || this.resizePointerId === null || this.activeEdge === null) {
      return
    }
    const e = this.pendingMoveEvent
    this.pendingMoveEvent = null
    this.sessionDeps.applySample(
      this.sessionDeps.sampleDeps,
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
    this.moveRafId = this.sessionDeps.requestAnimationFrame(() => {
      this.moveRafId = null
      this.flushPendingResize()
    })
  }

  private readonly onResizeEnd = (e: PointerEvent): void => {
    if (this.resizePointerId === null || e.pointerId !== this.resizePointerId) {
      return
    }
    if (this.moveRafId !== null) {
      this.sessionDeps.cancelAnimationFrame(this.moveRafId)
      this.moveRafId = null
    }
    this.flushPendingResize()
    this.resizePointerId = null
    this.activeEdge = null
    this.isResizeActive.value = false
    this.teardownWindowListeners()
  }
}
