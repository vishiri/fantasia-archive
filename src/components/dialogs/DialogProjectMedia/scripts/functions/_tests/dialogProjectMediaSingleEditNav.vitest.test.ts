import { expect, test, vi } from 'vitest'

import type { I_faProjectMedia, I_faProjectMediaMassEditRow } from 'app/types/I_faProjectMediaDomain'
import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

import {
  bindFaProjectMediaSingleEditSlideNav,
  isFaProjectMediaSlideNavDisabled,
  resolveFaProjectMediaSlideListIndex,
  resolveFaProjectMediaSlideNeighborItem,
  tryOpenFaProjectMediaSingleEditSlideNeighbor
} from '../dialogProjectMediaSingleEditNav'

function createRef<T> (value: T): I_ref<T> {
  return { value } as I_ref<T>
}

const firstItem: I_faProjectMedia = {
  createdAtMs: 2,
  displayName: 'new',
  externalEmbed: '',
  externalLink: 'https://a.test/new.png',
  externalType: 'linked',
  id: 'first',
  internalEmbed: null,
  internalLink: '',
  internalType: 'linked_outside',
  type: 'external',
  updatedAtMs: 2
}

const secondItem: I_faProjectMedia = {
  ...firstItem,
  createdAtMs: 1,
  displayName: 'old',
  id: 'second',
  updatedAtMs: 1
}

const items = [firstItem, secondItem]

/**
 * resolveFaProjectMediaSlideListIndex
 * Missing ids are -1.
 */
test('Test that resolveFaProjectMediaSlideListIndex finds id or returns -1', () => {
  expect(resolveFaProjectMediaSlideListIndex(items, 'second')).toBe(1)
  expect(resolveFaProjectMediaSlideListIndex(items, null)).toBe(-1)
  expect(resolveFaProjectMediaSlideListIndex(items, 'missing')).toBe(-1)
})

/**
 * isFaProjectMediaSlideNavDisabled
 * Dirty or ends disable the matching arrow.
 */
test('Test that isFaProjectMediaSlideNavDisabled covers dirty first and last', () => {
  expect(isFaProjectMediaSlideNavDisabled({
    direction: 'previous',
    index: 1,
    isDirty: true,
    length: 2
  })).toBe(true)
  expect(isFaProjectMediaSlideNavDisabled({
    direction: 'previous',
    index: 0,
    isDirty: false,
    length: 2
  })).toBe(true)
  expect(isFaProjectMediaSlideNavDisabled({
    direction: 'next',
    index: 1,
    isDirty: false,
    length: 2
  })).toBe(true)
  expect(isFaProjectMediaSlideNavDisabled({
    direction: 'next',
    index: 0,
    isDirty: false,
    length: 2
  })).toBe(false)
  expect(isFaProjectMediaSlideNavDisabled({
    direction: 'next',
    index: -1,
    isDirty: false,
    length: 2
  })).toBe(true)
})

/**
 * resolveFaProjectMediaSlideNeighborItem
 * Step walks the visible list.
 */
test('Test that resolveFaProjectMediaSlideNeighborItem walks list ends', () => {
  expect(resolveFaProjectMediaSlideNeighborItem({
    currentId: 'first',
    items,
    step: 1
  })?.id).toBe('second')
  expect(resolveFaProjectMediaSlideNeighborItem({
    currentId: 'first',
    items,
    step: -1
  })).toBeNull()
  expect(resolveFaProjectMediaSlideNeighborItem({
    currentId: 'missing',
    items,
    step: 1
  })).toBeNull()
})

/**
 * tryOpenFaProjectMediaSingleEditSlideNeighbor
 * Dirty or missing neighbor does not open.
 */
test('Test that tryOpenFaProjectMediaSingleEditSlideNeighbor opens only a clean neighbor', () => {
  const draft = createRef<I_faProjectMediaMassEditRow | null>({
    createdAtMs: firstItem.createdAtMs,
    displayName: firstItem.displayName,
    externalEmbed: firstItem.externalEmbed,
    externalLink: firstItem.externalLink,
    externalType: firstItem.externalType,
    id: firstItem.id,
    internalEmbed: firstItem.internalEmbed,
    internalLink: firstItem.internalLink,
    internalType: firstItem.internalType,
    isNew: false,
    type: firstItem.type,
    updatedAtMs: firstItem.updatedAtMs
  })
  const openSlide = vi.fn()
  tryOpenFaProjectMediaSingleEditSlideNeighbor({
    draft,
    isDirty: { value: true } as I_computedRef<boolean>,
    isSlideOpen: createRef(true),
    listMediaItems: createRef(items),
    openSlide,
    step: 1
  })
  expect(openSlide).not.toHaveBeenCalled()
  tryOpenFaProjectMediaSingleEditSlideNeighbor({
    draft,
    isDirty: { value: false } as I_computedRef<boolean>,
    isSlideOpen: createRef(false),
    listMediaItems: createRef(items),
    openSlide,
    step: 1
  })
  expect(openSlide).not.toHaveBeenCalled()
  tryOpenFaProjectMediaSingleEditSlideNeighbor({
    draft,
    isDirty: { value: false } as I_computedRef<boolean>,
    isSlideOpen: createRef(true),
    listMediaItems: createRef(items),
    openSlide,
    step: 1
  })
  expect(openSlide).toHaveBeenCalledWith(secondItem)
  tryOpenFaProjectMediaSingleEditSlideNeighbor({
    draft,
    isDirty: { value: false } as I_computedRef<boolean>,
    isSlideOpen: createRef(true),
    listMediaItems: createRef(items),
    openSlide,
    step: -1
  })
  expect(openSlide).toHaveBeenCalledTimes(1)
})

/**
 * bindFaProjectMediaSingleEditSlideNav
 * Flags follow list position and dirty.
 */
test('Test that bindFaProjectMediaSingleEditSlideNav disables ends and dirty', () => {
  const draft = createRef<I_faProjectMediaMassEditRow | null>({
    createdAtMs: firstItem.createdAtMs,
    displayName: firstItem.displayName,
    externalEmbed: firstItem.externalEmbed,
    externalLink: firstItem.externalLink,
    externalType: firstItem.externalType,
    id: firstItem.id,
    internalEmbed: firstItem.internalEmbed,
    internalLink: firstItem.internalLink,
    internalType: firstItem.internalType,
    isNew: false,
    type: firstItem.type,
    updatedAtMs: firstItem.updatedAtMs
  })
  const isDirty = createRef(false)
  const listMediaItems = createRef(items)
  const openSlide = vi.fn()
  const bound = bindFaProjectMediaSingleEditSlideNav({
    computed: (getter) => {
      return {
        get value () {
          return getter()
        }
      } as I_computedRef<ReturnType<typeof getter>>
    },
    draft,
    isDirty: {
      get value () {
        return isDirty.value
      }
    } as I_computedRef<boolean>,
    isSlideOpen: createRef(true),
    listMediaItems,
    openSlide
  })
  expect(bound.isSlidePreviousDisabled.value).toBe(true)
  expect(bound.isSlideNextDisabled.value).toBe(false)
  bound.openSingleEditSlideNext()
  expect(openSlide).toHaveBeenCalledWith(secondItem)
  draft.value = {
    ...draft.value as I_faProjectMediaMassEditRow,
    id: secondItem.id
  }
  expect(bound.isSlidePreviousDisabled.value).toBe(false)
  expect(bound.isSlideNextDisabled.value).toBe(true)
  bound.openSingleEditSlidePrevious()
  expect(openSlide).toHaveBeenCalledWith(firstItem)
  isDirty.value = true
  expect(bound.isSlidePreviousDisabled.value).toBe(true)
  expect(bound.isSlideNextDisabled.value).toBe(true)
})
