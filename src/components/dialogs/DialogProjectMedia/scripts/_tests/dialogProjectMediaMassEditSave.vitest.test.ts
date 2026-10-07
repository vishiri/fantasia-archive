import { expect, test, vi } from 'vitest'

import type { I_faProjectMediaMassEditRow } from 'app/types/I_faProjectMediaDomain'
import type { I_ref } from 'app/types/I_vueCompositionShims'

import { persistDialogProjectMediaMassEdit, bindDialogProjectMediaMassEditSave } from '../dialogProjectMediaMassEditSave'

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
    isNew: true,
    type: 'external',
    updatedAtMs: 0
  }
}

/**
 * persistDialogProjectMediaMassEdit
 * Successful list save clears rows and selects the list panel.
 */
test('Test that persistDialogProjectMediaMassEdit list success clears rows', async () => {
  const dialogModel = createRef(true)
  const massEditRows = createRef([sampleRow()])
  const selectedPanel = createRef('mediaMassEdit' as const)
  const runFaActionAwait = vi.fn(async () => true)
  await persistDialogProjectMediaMassEdit({
    afterSuccess: 'list',
    dialogModel,
    mapRowsToUpsertItems: (rows) => rows.map((row) => ({
      displayName: row.displayName,
      externalEmbed: row.externalEmbed,
      externalLink: row.externalLink,
      externalType: row.externalType,
      id: row.id,
      internalLink: row.internalLink,
      internalType: row.internalType,
      type: row.type
    })),
    massEditRows,
    runFaActionAwait,
    selectedPanel
  })
  expect(massEditRows.value).toEqual([])
  expect(selectedPanel.value).toBe('mediaList')
  expect(dialogModel.value).toBe(true)
  expect(runFaActionAwait).toHaveBeenCalledOnce()
})

/**
 * persistDialogProjectMediaMassEdit
 * Successful close save dismisses the dialog.
 */
test('Test that persistDialogProjectMediaMassEdit close success dismisses', async () => {
  const dialogModel = createRef(true)
  const massEditRows = createRef([sampleRow()])
  const selectedPanel = createRef('mediaMassEdit' as const)
  await persistDialogProjectMediaMassEdit({
    afterSuccess: 'close',
    dialogModel,
    mapRowsToUpsertItems: () => [],
    massEditRows,
    runFaActionAwait: async () => true,
    selectedPanel
  })
  expect(dialogModel.value).toBe(false)
  expect(selectedPanel.value).toBe('mediaMassEdit')
})

/**
 * persistDialogProjectMediaMassEdit
 * Failed save leaves session rows and the open dialog.
 */
test('Test that persistDialogProjectMediaMassEdit failed save keeps session', async () => {
  const dialogModel = createRef(true)
  const massEditRows = createRef([sampleRow()])
  const selectedPanel = createRef('mediaMassEdit' as const)
  await persistDialogProjectMediaMassEdit({
    afterSuccess: 'close',
    dialogModel,
    mapRowsToUpsertItems: () => [],
    massEditRows,
    runFaActionAwait: async () => false,
    selectedPanel
  })
  expect(dialogModel.value).toBe(true)
  expect(massEditRows.value).toHaveLength(1)
})

test('Test that persistDialogProjectMediaMassEdit keeps rows edited during save', async () => {
  let finishSave: ((saved: boolean) => void) | undefined
  const pendingSave = new Promise<boolean>((resolve) => {
    finishSave = resolve
  })
  const dialogModel = createRef(true)
  const massEditRows = createRef([sampleRow()])
  const selectedPanel = createRef('mediaMassEdit' as const)
  const savePromise = persistDialogProjectMediaMassEdit({
    afterSuccess: 'list',
    dialogModel,
    mapRowsToUpsertItems: (rows) => rows.map((row) => ({
      displayName: row.displayName,
      externalEmbed: row.externalEmbed,
      externalLink: row.externalLink,
      externalType: row.externalType,
      id: row.id,
      internalLink: row.internalLink,
      internalType: row.internalType,
      type: row.type
    })),
    massEditRows,
    runFaActionAwait: async () => pendingSave,
    selectedPanel
  })
  const liveRow = massEditRows.value[0]
  if (liveRow === undefined) {
    throw new Error('missing mass-edit row')
  }
  liveRow.displayName = 'typed during save'
  const finish = finishSave
  if (finish === undefined) {
    throw new Error('missing save resolver')
  }
  finish(true)
  await savePromise
  expect(massEditRows.value).toHaveLength(1)
  expect(massEditRows.value[0]?.displayName).toBe('typed during save')
  expect(selectedPanel.value).toBe('mediaMassEdit')
  expect(dialogModel.value).toBe(true)
})

/**
 * persistDialogProjectMediaMassEdit
 * A second save waits, then writes the title typed during the first save.
 */
test('Test that a second project media save waits for the in-flight save', async () => {
  let finishSave: ((saved: boolean) => void) | undefined
  const pendingSave = new Promise<boolean>((resolve) => {
    finishSave = resolve
  })
  const calls: string[] = []
  const dialogModel = createRef(true)
  const massEditRows = createRef([sampleRow()])
  const selectedPanel = createRef('mediaMassEdit' as const)
  const mapRowsToUpsertItems = (rows: I_faProjectMediaMassEditRow[]) => rows.map((row) => ({
    displayName: row.displayName,
    externalEmbed: row.externalEmbed,
    externalLink: row.externalLink,
    externalType: row.externalType,
    id: row.id,
    internalLink: row.internalLink,
    internalType: row.internalType,
    type: row.type
  }))
  const runFaActionAwait = vi.fn(async (
    _id: 'saveProjectMedia',
    payload: { items: Array<{ displayName: string }> }
  ) => {
    const displayName = payload.items[0]?.displayName ?? ''
    calls.push(displayName)
    if (calls.length === 1) {
      return await pendingSave
    }
    return true
  })
  const firstSave = persistDialogProjectMediaMassEdit({
    afterSuccess: 'list',
    dialogModel,
    mapRowsToUpsertItems,
    massEditRows,
    runFaActionAwait,
    selectedPanel
  })
  const liveRow = massEditRows.value[0]
  if (liveRow === undefined) {
    throw new Error('missing mass-edit row')
  }
  liveRow.displayName = 'typed during save'
  const secondSave = persistDialogProjectMediaMassEdit({
    afterSuccess: 'list',
    dialogModel,
    mapRowsToUpsertItems,
    massEditRows,
    runFaActionAwait,
    selectedPanel
  })
  await Promise.resolve()
  expect(calls).toEqual(['one'])
  const finish = finishSave
  if (finish === undefined) {
    throw new Error('missing save resolver')
  }
  finish(true)
  await firstSave
  await secondSave
  expect(calls).toEqual(['one', 'typed during save'])
  expect(massEditRows.value).toEqual([])
  expect(selectedPanel.value).toBe('mediaList')
})

/**
 * bindDialogProjectMediaMassEditSave
 * Wires list vs close after persist.
 */
test('Test that bindDialogProjectMediaMassEditSave list and close call persist', async () => {
  const dialogModel = createRef(true)
  const massEditRows = createRef([sampleRow()])
  const selectedPanel = createRef('mediaMassEdit' as const)
  const { saveAndBackToList, saveAndClose } = bindDialogProjectMediaMassEditSave({
    dialogModel,
    mapRowsToUpsertItems: () => [],
    massEditRows,
    runFaActionAwait: async () => true,
    selectedPanel
  })
  await saveAndBackToList()
  expect(selectedPanel.value).toBe('mediaList')
  selectedPanel.value = 'mediaMassEdit'
  dialogModel.value = true
  massEditRows.value = [sampleRow()]
  await saveAndClose()
  expect(dialogModel.value).toBe(false)
})
