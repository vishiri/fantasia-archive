import { expect, test, vi } from 'vitest'

import type { I_faProjectMediaMassEditRow } from 'app/types/I_faProjectMediaDomain'

import {
  applyDialogProjectMediaSingleEditSlideArrowKeydown,
  blurDialogProjectMediaActiveElement,
  createDialogProjectMediaSingleEditSlideNavActions,
  isDialogProjectMediaSingleEditSlideNavFieldActive,
  resolveDialogProjectMediaSingleEditSlideArrowNav
} from '../dialogProjectMediaSingleEditSlideArrowNav'

/**
 * isDialogProjectMediaSingleEditSlideNavFieldActive
 * Native edit controls, contenteditable, Quasar field, and open menus count.
 */
test('Test that isDialogProjectMediaSingleEditSlideNavFieldActive detects edit controls', () => {
  expect(isDialogProjectMediaSingleEditSlideNavFieldActive(null)).toBe(false)
  expect(isDialogProjectMediaSingleEditSlideNavFieldActive(document)).toBe(false)
  expect(isDialogProjectMediaSingleEditSlideNavFieldActive(document.createElement('div')))
    .toBe(false)
  expect(isDialogProjectMediaSingleEditSlideNavFieldActive(document.createElement('input')))
    .toBe(true)
  expect(isDialogProjectMediaSingleEditSlideNavFieldActive(document.createElement('textarea')))
    .toBe(true)
  expect(isDialogProjectMediaSingleEditSlideNavFieldActive(document.createElement('select')))
    .toBe(true)
  expect(isDialogProjectMediaSingleEditSlideNavFieldActive(document.createElement('video')))
    .toBe(true)
  expect(isDialogProjectMediaSingleEditSlideNavFieldActive(document.createElement('audio')))
    .toBe(true)
  const editable = document.createElement('div')
  editable.setAttribute('contenteditable', 'true')
  expect(isDialogProjectMediaSingleEditSlideNavFieldActive(editable)).toBe(true)
  const nested = document.createElement('span')
  editable.appendChild(nested)
  expect(isDialogProjectMediaSingleEditSlideNavFieldActive(nested)).toBe(true)
  const field = document.createElement('div')
  field.className = 'q-field'
  const fieldChild = document.createElement('span')
  field.appendChild(fieldChild)
  expect(isDialogProjectMediaSingleEditSlideNavFieldActive(field)).toBe(true)
  expect(isDialogProjectMediaSingleEditSlideNavFieldActive(fieldChild)).toBe(true)
  const menu = document.createElement('div')
  menu.className = 'q-menu'
  const menuItem = document.createElement('div')
  menu.appendChild(menuItem)
  expect(isDialogProjectMediaSingleEditSlideNavFieldActive(menuItem)).toBe(true)
})

/**
 * blurDialogProjectMediaActiveElement
 * Blurs an HTMLElement; ignores non-element focus.
 */
test('Test that blurDialogProjectMediaActiveElement blurs HTMLElement only', () => {
  const field = document.createElement('input')
  document.body.appendChild(field)
  field.focus()
  expect(document.activeElement).toBe(field)
  blurDialogProjectMediaActiveElement(field)
  expect(document.activeElement).not.toBe(field)
  field.remove()
  blurDialogProjectMediaActiveElement(null)
  blurDialogProjectMediaActiveElement(document)
})

const unlockedNav = {
  altKey: false,
  ctrlKey: false,
  isFieldActive: false,
  isNextLocked: false,
  isPreviousLocked: false,
  metaKey: false,
  shiftKey: false
} as const

/**
 * resolveDialogProjectMediaSingleEditSlideArrowNav
 * Unmodified arrows match the buttons; fields, modifiers, and locks no-op.
 */
test('Test that resolveDialogProjectMediaSingleEditSlideArrowNav matches unlocked arrow keys', () => {
  expect(resolveDialogProjectMediaSingleEditSlideArrowNav({
    ...unlockedNav,
    key: 'ArrowLeft'
  })).toBe('previous')
  expect(resolveDialogProjectMediaSingleEditSlideArrowNav({
    ...unlockedNav,
    key: 'ArrowRight'
  })).toBe('next')
  expect(resolveDialogProjectMediaSingleEditSlideArrowNav({
    ...unlockedNav,
    isFieldActive: true,
    key: 'ArrowRight'
  })).toBeNull()
  expect(resolveDialogProjectMediaSingleEditSlideArrowNav({
    ...unlockedNav,
    isPreviousLocked: true,
    key: 'ArrowLeft'
  })).toBeNull()
  expect(resolveDialogProjectMediaSingleEditSlideArrowNav({
    ...unlockedNav,
    isNextLocked: true,
    key: 'ArrowRight'
  })).toBeNull()
  expect(resolveDialogProjectMediaSingleEditSlideArrowNav({
    ...unlockedNav,
    isPreviousLocked: true,
    key: 'ArrowRight'
  })).toBe('next')
  expect(resolveDialogProjectMediaSingleEditSlideArrowNav({
    ...unlockedNav,
    altKey: true,
    key: 'ArrowLeft'
  })).toBeNull()
  expect(resolveDialogProjectMediaSingleEditSlideArrowNav({
    ...unlockedNav,
    ctrlKey: true,
    key: 'ArrowRight'
  })).toBeNull()
  expect(resolveDialogProjectMediaSingleEditSlideArrowNav({
    ...unlockedNav,
    metaKey: true,
    key: 'ArrowLeft'
  })).toBeNull()
  expect(resolveDialogProjectMediaSingleEditSlideArrowNav({
    ...unlockedNav,
    key: 'ArrowRight',
    shiftKey: true
  })).toBeNull()
  expect(resolveDialogProjectMediaSingleEditSlideArrowNav({
    ...unlockedNav,
    key: 'ArrowUp'
  })).toBeNull()
  expect(resolveDialogProjectMediaSingleEditSlideArrowNav({
    ...unlockedNav,
    key: 'Escape'
  })).toBeNull()
})

/**
 * applyDialogProjectMediaSingleEditSlideArrowKeydown
 * Calls the matching click path and preventDefault only when nav runs.
 */
test('Test that applyDialogProjectMediaSingleEditSlideArrowKeydown runs matching click handlers', () => {
  const onNext = vi.fn()
  const onPrevious = vi.fn()
  const preventDefault = vi.fn()
  applyDialogProjectMediaSingleEditSlideArrowKeydown({
    altKey: false,
    ctrlKey: false,
    isNextLocked: false,
    isPreviousLocked: false,
    key: 'ArrowRight',
    metaKey: false,
    onNext,
    onPrevious,
    preventDefault,
    shiftKey: false,
    target: document.createElement('div')
  })
  expect(preventDefault).toHaveBeenCalledOnce()
  expect(onNext).toHaveBeenCalledOnce()
  expect(onPrevious).not.toHaveBeenCalled()
  preventDefault.mockClear()
  onNext.mockClear()
  applyDialogProjectMediaSingleEditSlideArrowKeydown({
    altKey: false,
    ctrlKey: false,
    isNextLocked: false,
    isPreviousLocked: false,
    key: 'ArrowLeft',
    metaKey: false,
    onNext,
    onPrevious,
    preventDefault,
    shiftKey: false,
    target: document.createElement('div')
  })
  expect(onPrevious).toHaveBeenCalledOnce()
  expect(onNext).not.toHaveBeenCalled()
  preventDefault.mockClear()
  onPrevious.mockClear()
  applyDialogProjectMediaSingleEditSlideArrowKeydown({
    altKey: false,
    ctrlKey: false,
    isNextLocked: false,
    isPreviousLocked: false,
    key: 'ArrowRight',
    metaKey: false,
    onNext,
    onPrevious,
    preventDefault,
    shiftKey: false,
    target: document.createElement('input')
  })
  expect(preventDefault).not.toHaveBeenCalled()
  expect(onNext).not.toHaveBeenCalled()
  expect(onPrevious).not.toHaveBeenCalled()
})

function createSlideNavActionsHarness (options?: {
  isNextLocked?: boolean
  isPreviousLocked?: boolean
  liveRow?: I_faProjectMediaMassEditRow | null
}): {
    beginNavTrackMove: ReturnType<typeof vi.fn>
    emitNext: ReturnType<typeof vi.fn>
    emitPrevious: ReturnType<typeof vi.fn>
    finishNavAnimation: ReturnType<typeof vi.fn>
    navActions: ReturnType<typeof createDialogProjectMediaSingleEditSlideNavActions>
    nextTick: ReturnType<typeof vi.fn>
    setDirection: ReturnType<typeof vi.fn>
    setFinishTimer: ReturnType<typeof vi.fn>
    setIsNavTrackMoving: ReturnType<typeof vi.fn>
    setOutgoingRow: ReturnType<typeof vi.fn>
    setTimeoutFn: ReturnType<typeof vi.fn>
  } {
  const beginNavTrackMove = vi.fn()
  const emitNext = vi.fn()
  const emitPrevious = vi.fn()
  const finishNavAnimation = vi.fn()
  const nextTick = vi.fn((cb: () => void) => {
    cb()
    return undefined
  })
  const setDirection = vi.fn()
  const setFinishTimer = vi.fn()
  const setIsNavTrackMoving = vi.fn()
  const setOutgoingRow = vi.fn()
  const setTimeoutFn = vi.fn((cb: () => void, _ms: number) => {
    cb()
    return 7
  })
  const liveRow = options?.liveRow === undefined
    ? {
        createdAtMs: 0,
        displayName: 'bar',
        externalEmbed: '',
        externalLink: 'https://cdn.example.com/foo/bar.png',
        externalType: 'linked' as const,
        id: 'row-1',
        internalEmbed: null,
        internalLink: '',
        internalType: 'linked_outside' as const,
        isNew: false,
        type: 'external' as const,
        updatedAtMs: 0
      }
    : options.liveRow
  const navActions = createDialogProjectMediaSingleEditSlideNavActions({
    beginNavTrackMove,
    clearNavFinishTimer: vi.fn(),
    emitNext,
    emitPrevious,
    finishNavAnimation,
    getIsNextLocked: () => options?.isNextLocked === true,
    getIsPreviousLocked: () => options?.isPreviousLocked === true,
    getLiveRow: () => liveRow,
    nextTick,
    setDirection,
    setFinishTimer,
    setIsNavTrackMoving,
    setOutgoingRow,
    setTimeoutFn,
    slideMs: 300
  })
  return {
    beginNavTrackMove,
    emitNext,
    emitPrevious,
    finishNavAnimation,
    navActions,
    nextTick,
    setDirection,
    setFinishTimer,
    setIsNavTrackMoving,
    setOutgoingRow,
    setTimeoutFn
  }
}

/**
 * createDialogProjectMediaSingleEditSlideNavActions
 * Clicks and arrows share locked + animation start; null row skips the clone.
 */
test('Test that createDialogProjectMediaSingleEditSlideNavActions starts nav from clicks and arrows', () => {
  const unlocked = createSlideNavActionsHarness()
  unlocked.navActions.onNextClick()
  expect(unlocked.emitNext).toHaveBeenCalledOnce()
  expect(unlocked.setOutgoingRow).toHaveBeenCalledOnce()
  expect(unlocked.setDirection).toHaveBeenCalledWith('next')
  expect(unlocked.setIsNavTrackMoving).toHaveBeenNthCalledWith(1, false)
  expect(unlocked.beginNavTrackMove).toHaveBeenCalledOnce()
  expect(unlocked.setTimeoutFn).toHaveBeenCalledOnce()
  expect(unlocked.finishNavAnimation).toHaveBeenCalledOnce()
  expect(unlocked.setFinishTimer).toHaveBeenCalledWith(7)

  const locked = createSlideNavActionsHarness({
    isNextLocked: true,
    isPreviousLocked: true
  })
  locked.navActions.onNextClick()
  locked.navActions.onPreviousClick()
  expect(locked.emitNext).not.toHaveBeenCalled()
  expect(locked.emitPrevious).not.toHaveBeenCalled()

  const empty = createSlideNavActionsHarness({
    liveRow: null
  })
  empty.navActions.onPreviousClick()
  expect(empty.emitPrevious).toHaveBeenCalledOnce()
  expect(empty.setOutgoingRow).not.toHaveBeenCalled()

  const arrows = createSlideNavActionsHarness()
  const arrowEvent = new KeyboardEvent('keydown', {
    bubbles: true,
    key: 'ArrowLeft'
  })
  const preventDefault = vi.spyOn(arrowEvent, 'preventDefault')
  arrows.navActions.onWindowKeydown(arrowEvent)
  expect(preventDefault).toHaveBeenCalledOnce()
  expect(arrows.emitPrevious).toHaveBeenCalledOnce()
})
