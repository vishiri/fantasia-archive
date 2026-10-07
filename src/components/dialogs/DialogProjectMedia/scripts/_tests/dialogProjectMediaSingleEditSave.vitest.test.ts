import { expect, test, vi } from 'vitest'

import type { I_faProjectMediaMassEditRow } from 'app/types/I_faProjectMediaDomain'
import type { I_ref } from 'app/types/I_vueCompositionShims'

import {
  bindDialogProjectMediaSingleEditSave,
  persistDialogProjectMediaSingleEdit
} from '../dialogProjectMediaSingleEditSave'

function createRef<T> (value: T): I_ref<T> {
  return { value } as I_ref<T>
}

function sampleRow (): I_faProjectMediaMassEditRow {
  return {
    createdAtMs: 0,
    displayName: 'one',
    externalEmbed: '',
    externalLink: 'https://a.test/one',
    externalType: 'linked',
    id: 'a',
    internalEmbed: null,
    internalLink: '',
    internalType: 'linked_outside',
    isNew: false,
    type: 'external',
    updatedAtMs: 0
  }
}

/**
 * persistDialogProjectMediaSingleEdit
 * Null draft does not call save.
 */
test('Test that persistDialogProjectMediaSingleEdit no-ops when draft is null', async () => {
  const runFaActionAwait = vi.fn(async () => true)
  const closeSlide = vi.fn()
  const reloadList = vi.fn(async () => undefined)
  await persistDialogProjectMediaSingleEdit({
    afterSuccess: 'closeSlide',
    closeSlide,
    dialogModel: createRef(true),
    draft: createRef<I_faProjectMediaMassEditRow | null>(null),
    mapRowToUpsertItem: (row) => ({
      displayName: row.displayName,
      externalEmbed: row.externalEmbed,
      externalLink: row.externalLink,
      externalType: row.externalType,
      id: row.id,
      internalLink: row.internalLink,
      internalType: row.internalType,
      type: row.type
    }),
    rebindDraftFromList: vi.fn(),
    reloadList,
    runFaActionAwait
  })
  expect(runFaActionAwait).not.toHaveBeenCalled()
  expect(closeSlide).not.toHaveBeenCalled()
  expect(reloadList).not.toHaveBeenCalled()
})

/**
 * persistDialogProjectMediaSingleEdit
 * Failed save keeps the dialog and slide open.
 */
test('Test that persistDialogProjectMediaSingleEdit failed save stays open', async () => {
  const dialogModel = createRef(true)
  const closeSlide = vi.fn()
  const reloadList = vi.fn(async () => undefined)
  await persistDialogProjectMediaSingleEdit({
    afterSuccess: 'closeSlide',
    closeSlide,
    dialogModel,
    draft: createRef(sampleRow()),
    mapRowToUpsertItem: (row) => ({
      displayName: row.displayName,
      externalEmbed: row.externalEmbed,
      externalLink: row.externalLink,
      externalType: row.externalType,
      id: row.id,
      internalLink: row.internalLink,
      internalType: row.internalType,
      type: row.type
    }),
    rebindDraftFromList: vi.fn(),
    reloadList,
    runFaActionAwait: async () => false
  })
  expect(dialogModel.value).toBe(true)
  expect(closeSlide).not.toHaveBeenCalled()
  expect(reloadList).not.toHaveBeenCalled()
})

/**
 * persistDialogProjectMediaSingleEdit
 * Slide success closes the slide and reloads the list.
 */
test('Test that persistDialogProjectMediaSingleEdit slide success reloads list', async () => {
  const dialogModel = createRef(true)
  const closeSlide = vi.fn()
  const reloadList = vi.fn(async () => undefined)
  const runFaActionAwait = vi.fn(async () => true)
  await persistDialogProjectMediaSingleEdit({
    afterSuccess: 'closeSlide',
    closeSlide,
    dialogModel,
    draft: createRef(sampleRow()),
    mapRowToUpsertItem: (row) => ({
      displayName: row.displayName,
      externalEmbed: row.externalEmbed,
      externalLink: row.externalLink,
      externalType: row.externalType,
      id: row.id,
      internalLink: row.internalLink,
      internalType: row.internalType,
      type: row.type
    }),
    rebindDraftFromList: vi.fn(),
    reloadList,
    runFaActionAwait
  })
  expect(runFaActionAwait).toHaveBeenCalledWith('saveProjectMedia', {
    items: [{
      displayName: 'one',
      externalEmbed: '',
      externalLink: 'https://a.test/one',
      externalType: 'linked',
      id: 'a',
      internalLink: '',
      internalType: 'linked_outside',
      type: 'external'
    }]
  })
  expect(closeSlide).toHaveBeenCalledOnce()
  expect(reloadList).toHaveBeenCalledOnce()
  expect(dialogModel.value).toBe(true)
})

/**
 * persistDialogProjectMediaSingleEdit
 * Dialog success dismisses without reloading.
 */
test('Test that persistDialogProjectMediaSingleEdit closeDialog success dismisses', async () => {
  const dialogModel = createRef(true)
  const closeSlide = vi.fn()
  const reloadList = vi.fn(async () => undefined)
  await persistDialogProjectMediaSingleEdit({
    afterSuccess: 'closeDialog',
    closeSlide,
    dialogModel,
    draft: createRef(sampleRow()),
    mapRowToUpsertItem: (row) => ({
      displayName: row.displayName,
      externalEmbed: row.externalEmbed,
      externalLink: row.externalLink,
      externalType: row.externalType,
      id: row.id,
      internalLink: row.internalLink,
      internalType: row.internalType,
      type: row.type
    }),
    rebindDraftFromList: vi.fn(),
    reloadList,
    runFaActionAwait: async () => true
  })
  expect(dialogModel.value).toBe(false)
  expect(closeSlide).not.toHaveBeenCalled()
  expect(reloadList).not.toHaveBeenCalled()
})

/**
 * bindDialogProjectMediaSingleEditSave
 * Wrappers pick closeDialog vs closeSlide.
 */
test('Test that bindDialogProjectMediaSingleEditSave routes close vs slide', async () => {
  const dialogModel = createRef(true)
  const closeSlide = vi.fn()
  const reloadList = vi.fn(async () => undefined)
  const bound = bindDialogProjectMediaSingleEditSave({
    closeSlide,
    dialogModel,
    draft: createRef(sampleRow()),
    mapRowToUpsertItem: (row) => ({
      displayName: row.displayName,
      externalEmbed: row.externalEmbed,
      externalLink: row.externalLink,
      externalType: row.externalType,
      id: row.id,
      internalLink: row.internalLink,
      internalType: row.internalType,
      type: row.type
    }),
    rebindDraftFromList: vi.fn(),
    reloadList,
    runFaActionAwait: async () => true
  })
  await bound.saveSlide()
  expect(closeSlide).toHaveBeenCalledOnce()
  expect(dialogModel.value).toBe(true)
  await bound.saveAndCloseDialog()
  expect(dialogModel.value).toBe(false)
})

/**
 * persistDialogProjectMediaSingleEdit
 * Stay-open save reloads the list and rebinds the draft.
 */
test('Test that persistDialogProjectMediaSingleEdit staySlide rebinds after reload', async () => {
  const dialogModel = createRef(true)
  const closeSlide = vi.fn()
  const reloadList = vi.fn(async () => undefined)
  const rebindDraftFromList = vi.fn()
  await persistDialogProjectMediaSingleEdit({
    afterSuccess: 'staySlide',
    closeSlide,
    dialogModel,
    draft: createRef(sampleRow()),
    mapRowToUpsertItem: (row) => ({
      displayName: row.displayName,
      externalEmbed: row.externalEmbed,
      externalLink: row.externalLink,
      externalType: row.externalType,
      id: row.id,
      internalLink: row.internalLink,
      internalType: row.internalType,
      type: row.type
    }),
    rebindDraftFromList,
    reloadList,
    runFaActionAwait: async () => true
  })
  expect(closeSlide).not.toHaveBeenCalled()
  expect(reloadList).toHaveBeenCalledOnce()
  expect(rebindDraftFromList).toHaveBeenCalledWith('a')
  expect(dialogModel.value).toBe(true)
})

test('Test that persistDialogProjectMediaSingleEdit staySlide skips rebind when the draft changes during reload', async () => {
  const dialogModel = createRef(true)
  const draft = createRef(sampleRow())
  const closeSlide = vi.fn()
  const rebindDraftFromList = vi.fn()
  await persistDialogProjectMediaSingleEdit({
    afterSuccess: 'staySlide',
    closeSlide,
    dialogModel,
    draft,
    mapRowToUpsertItem: (row) => ({
      displayName: row.displayName,
      externalEmbed: row.externalEmbed,
      externalLink: row.externalLink,
      externalType: row.externalType,
      id: row.id,
      internalLink: row.internalLink,
      internalType: row.internalType,
      type: row.type
    }),
    rebindDraftFromList,
    reloadList: async () => {
      draft.value = {
        ...sampleRow(),
        id: 'other'
      }
    },
    runFaActionAwait: async () => true
  })
  expect(rebindDraftFromList).not.toHaveBeenCalled()
  expect(draft.value?.id).toBe('other')
  expect(closeSlide).not.toHaveBeenCalled()
  expect(dialogModel.value).toBe(true)
})

test('Test that persistDialogProjectMediaSingleEdit keeps a draft edited during save', async () => {
  let finishSave: ((saved: boolean) => void) | undefined
  const pendingSave = new Promise<boolean>((resolve) => {
    finishSave = resolve
  })
  const dialogModel = createRef(true)
  const draft = createRef(sampleRow())
  const closeSlide = vi.fn()
  const reloadList = vi.fn(async () => undefined)
  const rebindDraftFromList = vi.fn()
  const savePromise = persistDialogProjectMediaSingleEdit({
    afterSuccess: 'staySlide',
    closeSlide,
    dialogModel,
    draft,
    mapRowToUpsertItem: (row) => ({
      displayName: row.displayName,
      externalEmbed: row.externalEmbed,
      externalLink: row.externalLink,
      externalType: row.externalType,
      id: row.id,
      internalLink: row.internalLink,
      internalType: row.internalType,
      type: row.type
    }),
    rebindDraftFromList,
    reloadList,
    runFaActionAwait: async () => pendingSave
  })
  const liveRow = draft.value
  if (liveRow === null) {
    throw new Error('missing draft')
  }
  liveRow.displayName = 'typed during save'
  const finish = finishSave
  if (finish === undefined) {
    throw new Error('missing save resolver')
  }
  finish(true)
  await savePromise
  expect(draft.value?.displayName).toBe('typed during save')
  expect(rebindDraftFromList).not.toHaveBeenCalled()
  expect(reloadList).not.toHaveBeenCalled()
  expect(closeSlide).not.toHaveBeenCalled()
  expect(dialogModel.value).toBe(true)
})

/**
 * bindDialogProjectMediaSingleEditSave
 * saveSlideStay keeps the slide open.
 */
test('Test that bindDialogProjectMediaSingleEditSave stay does not close slide', async () => {
  const closeSlide = vi.fn()
  const rebindDraftFromList = vi.fn()
  const bound = bindDialogProjectMediaSingleEditSave({
    closeSlide,
    dialogModel: createRef(true),
    draft: createRef(sampleRow()),
    mapRowToUpsertItem: (row) => ({
      displayName: row.displayName,
      externalEmbed: row.externalEmbed,
      externalLink: row.externalLink,
      externalType: row.externalType,
      id: row.id,
      internalLink: row.internalLink,
      internalType: row.internalType,
      type: row.type
    }),
    rebindDraftFromList,
    reloadList: async () => undefined,
    runFaActionAwait: async () => true
  })
  await bound.saveSlideStay()
  expect(closeSlide).not.toHaveBeenCalled()
  expect(rebindDraftFromList).toHaveBeenCalledWith('a')
})
