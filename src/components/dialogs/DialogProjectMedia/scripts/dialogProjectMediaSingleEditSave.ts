import type {
  I_faProjectMediaMassEditRow,
  I_faProjectMediaUpsertItem
} from 'app/types/I_faProjectMediaDomain'
import type { I_ref } from 'app/types/I_vueCompositionShims'

import { enqueueDialogProjectMediaSave } from './dialogProjectMediaSaveQueue'

export async function persistDialogProjectMediaSingleEdit (input: {
  afterSuccess: 'closeDialog' | 'closeSlide' | 'staySlide'
  closeSlide: () => void
  dialogModel: I_ref<boolean>
  draft: I_ref<I_faProjectMediaMassEditRow | null>
  mapRowToUpsertItem: (row: I_faProjectMediaMassEditRow) => I_faProjectMediaUpsertItem
  rebindDraftFromList: (id: string) => void
  reloadList: () => Promise<void>
  runFaActionAwait: (
    id: 'saveProjectMedia',
    payload: { items: I_faProjectMediaUpsertItem[] }
  ) => Promise<boolean>
}): Promise<void> {
  const row = input.draft.value
  if (row === null) {
    return
  }
  const savedSnapshot = JSON.stringify(row)
  const items = [input.mapRowToUpsertItem(row)]
  const savedId = row.id
  await enqueueDialogProjectMediaSave(async () => {
    const saved = await input.runFaActionAwait('saveProjectMedia', { items })
    if (!saved) {
      return
    }
    if (JSON.stringify(input.draft.value) !== savedSnapshot) {
      return
    }
    await applyDialogProjectMediaSingleEditSaveSuccess({
      afterSuccess: input.afterSuccess,
      closeSlide: input.closeSlide,
      dialogModel: input.dialogModel,
      draft: input.draft,
      rebindDraftFromList: input.rebindDraftFromList,
      reloadList: input.reloadList,
      savedId,
      savedSnapshot
    })
  })
}

async function applyDialogProjectMediaSingleEditSaveSuccess (input: {
  afterSuccess: 'closeDialog' | 'closeSlide' | 'staySlide'
  closeSlide: () => void
  dialogModel: I_ref<boolean>
  draft: I_ref<I_faProjectMediaMassEditRow | null>
  rebindDraftFromList: (id: string) => void
  reloadList: () => Promise<void>
  savedId: string
  savedSnapshot: string
}): Promise<void> {
  if (input.afterSuccess === 'closeDialog') {
    input.dialogModel.value = false
    return
  }
  if (input.afterSuccess === 'staySlide') {
    await input.reloadList()
    if (JSON.stringify(input.draft.value) !== input.savedSnapshot) {
      return
    }
    input.rebindDraftFromList(input.savedId)
    return
  }
  input.closeSlide()
  await input.reloadList()
}

export function bindDialogProjectMediaSingleEditSave (input: {
  closeSlide: () => void
  dialogModel: I_ref<boolean>
  draft: I_ref<I_faProjectMediaMassEditRow | null>
  mapRowToUpsertItem: (row: I_faProjectMediaMassEditRow) => I_faProjectMediaUpsertItem
  rebindDraftFromList: (id: string) => void
  reloadList: () => Promise<void>
  runFaActionAwait: (
    id: 'saveProjectMedia',
    payload: { items: I_faProjectMediaUpsertItem[] }
  ) => Promise<boolean>
}): {
    saveAndCloseDialog: () => Promise<void>
    saveSlide: () => Promise<void>
    saveSlideStay: () => Promise<void>
  } {
  async function saveAndCloseDialog (): Promise<void> {
    await persistDialogProjectMediaSingleEdit({
      afterSuccess: 'closeDialog',
      closeSlide: input.closeSlide,
      dialogModel: input.dialogModel,
      draft: input.draft,
      mapRowToUpsertItem: input.mapRowToUpsertItem,
      rebindDraftFromList: input.rebindDraftFromList,
      reloadList: input.reloadList,
      runFaActionAwait: input.runFaActionAwait
    })
  }
  async function saveSlide (): Promise<void> {
    await persistDialogProjectMediaSingleEdit({
      afterSuccess: 'closeSlide',
      closeSlide: input.closeSlide,
      dialogModel: input.dialogModel,
      draft: input.draft,
      mapRowToUpsertItem: input.mapRowToUpsertItem,
      rebindDraftFromList: input.rebindDraftFromList,
      reloadList: input.reloadList,
      runFaActionAwait: input.runFaActionAwait
    })
  }
  async function saveSlideStay (): Promise<void> {
    await persistDialogProjectMediaSingleEdit({
      afterSuccess: 'staySlide',
      closeSlide: input.closeSlide,
      dialogModel: input.dialogModel,
      draft: input.draft,
      mapRowToUpsertItem: input.mapRowToUpsertItem,
      rebindDraftFromList: input.rebindDraftFromList,
      reloadList: input.reloadList,
      runFaActionAwait: input.runFaActionAwait
    })
  }
  return {
    saveAndCloseDialog,
    saveSlide,
    saveSlideStay
  }
}
