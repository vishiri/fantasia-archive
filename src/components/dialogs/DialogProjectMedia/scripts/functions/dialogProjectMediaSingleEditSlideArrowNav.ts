import type { I_faProjectMediaMassEditRow } from 'app/types/I_faProjectMediaDomain'

/**
 * ArrowLeft / ArrowRight match Previous / Next on the list single-edit slide.
 */

function isHtmlElementTarget (target: EventTarget | null): target is HTMLElement {
  return target instanceof HTMLElement
}

/**
 * True when an edit control has focus so arrows must not swap media and Escape must not close.
 */
export function isDialogProjectMediaSingleEditSlideNavFieldActive (
  target: EventTarget | null
): boolean {
  if (!isHtmlElementTarget(target)) {
    return false
  }
  const tag = target.tagName
  if (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    tag === 'VIDEO' ||
    tag === 'AUDIO'
  ) {
    return true
  }
  if (target.isContentEditable) {
    return true
  }
  if (target.closest('[contenteditable="true"]') !== null) {
    return true
  }
  if (target.closest('.q-field') !== null) {
    return true
  }
  return target.closest('.q-menu') !== null
}

/**
 * Leave the focused edit control. No-op when focus is not an HTMLElement.
 */
export function blurDialogProjectMediaActiveElement (
  activeElement: EventTarget | null
): void {
  if (!isHtmlElementTarget(activeElement)) {
    return
  }
  activeElement.blur()
}

/**
 * Previous, next, or no-op. Locked flags match the Previous / Next buttons.
 */
export function resolveDialogProjectMediaSingleEditSlideArrowNav (input: {
  altKey: boolean
  ctrlKey: boolean
  isFieldActive: boolean
  isNextLocked: boolean
  isPreviousLocked: boolean
  key: string
  metaKey: boolean
  shiftKey: boolean
}): 'next' | 'previous' | null {
  if (input.isFieldActive) {
    return null
  }
  if (input.altKey || input.ctrlKey || input.metaKey || input.shiftKey) {
    return null
  }
  if (input.key === 'ArrowLeft') {
    if (input.isPreviousLocked) {
      return null
    }
    return 'previous'
  }
  if (input.key === 'ArrowRight') {
    if (input.isNextLocked) {
      return null
    }
    return 'next'
  }
  return null
}

/**
 * Run Previous / Next from a window keydown when the resolver says so.
 */
export function applyDialogProjectMediaSingleEditSlideArrowKeydown (input: {
  altKey: boolean
  ctrlKey: boolean
  isNextLocked: boolean
  isPreviousLocked: boolean
  key: string
  metaKey: boolean
  onNext: () => void
  onPrevious: () => void
  preventDefault: () => void
  shiftKey: boolean
  target: EventTarget | null
}): void {
  const direction = resolveDialogProjectMediaSingleEditSlideArrowNav({
    altKey: input.altKey,
    ctrlKey: input.ctrlKey,
    isFieldActive: isDialogProjectMediaSingleEditSlideNavFieldActive(input.target),
    isNextLocked: input.isNextLocked,
    isPreviousLocked: input.isPreviousLocked,
    key: input.key,
    metaKey: input.metaKey,
    shiftKey: input.shiftKey
  })
  if (direction === null) {
    return
  }
  input.preventDefault()
  if (direction === 'previous') {
    input.onPrevious()
    return
  }
  input.onNext()
}

/**
 * Click and ArrowLeft / ArrowRight handlers that share the slide animation lock.
 */
export function createDialogProjectMediaSingleEditSlideNavActions (input: {
  beginNavTrackMove: () => void
  clearNavFinishTimer: () => void
  emitNext: () => void
  emitPrevious: () => void
  finishNavAnimation: () => void
  getIsNextLocked: () => boolean
  getIsPreviousLocked: () => boolean
  getLiveRow: () => I_faProjectMediaMassEditRow | null
  nextTick: (cb: () => void) => unknown
  setDirection: (direction: 'next' | 'previous' | null) => void
  setFinishTimer: (id: number) => void
  setIsNavTrackMoving: (value: boolean) => void
  setOutgoingRow: (row: I_faProjectMediaMassEditRow | null) => void
  setTimeoutFn: (cb: () => void, ms: number) => number
  slideMs: number
}): {
    onNextClick: () => void
    onPreviousClick: () => void
    onWindowKeydown: (event: KeyboardEvent) => void
  } {
  function emitNav (direction: 'next' | 'previous'): void {
    if (direction === 'previous') {
      input.emitPrevious()
      return
    }
    input.emitNext()
  }

  function startNavSlide (direction: 'next' | 'previous'): void {
    const current = input.getLiveRow()
    if (current === null) {
      emitNav(direction)
      return
    }
    input.clearNavFinishTimer()
    input.setOutgoingRow({ ...current })
    input.setDirection(direction)
    input.setIsNavTrackMoving(false)
    emitNav(direction)
    input.setFinishTimer(input.setTimeoutFn(input.finishNavAnimation, input.slideMs))
    void input.nextTick(input.beginNavTrackMove)
  }

  function onPreviousClick (): void {
    if (input.getIsPreviousLocked()) {
      return
    }
    startNavSlide('previous')
  }

  function onNextClick (): void {
    if (input.getIsNextLocked()) {
      return
    }
    startNavSlide('next')
  }

  function onWindowKeydown (event: KeyboardEvent): void {
    applyDialogProjectMediaSingleEditSlideArrowKeydown({
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      isNextLocked: input.getIsNextLocked(),
      isPreviousLocked: input.getIsPreviousLocked(),
      key: event.key,
      metaKey: event.metaKey,
      onNext: onNextClick,
      onPrevious: onPreviousClick,
      preventDefault: () => {
        event.preventDefault()
      },
      shiftKey: event.shiftKey,
      target: event.target
    })
  }

  return {
    onNextClick,
    onPreviousClick,
    onWindowKeydown
  }
}
