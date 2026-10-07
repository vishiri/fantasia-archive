import type {
  I_faProjectMediaMassEditRow,
  I_faProjectMediaUpsertItem,
  T_faProjectMediaPanel
} from 'app/types/I_faProjectMediaDomain'
import type { I_ref } from 'app/types/I_vueCompositionShims'

import { enqueueDialogProjectMediaSave } from './dialogProjectMediaSaveQueue'

const listPanel: T_faProjectMediaPanel = 'mediaList'

export async function persistDialogProjectMediaMassEdit (input: {
  afterSuccess: 'close' | 'list'
  dialogModel: I_ref<boolean>
  mapRowsToUpsertItems: (rows: I_faProjectMediaMassEditRow[]) => I_faProjectMediaUpsertItem[]
  massEditRows: I_ref<I_faProjectMediaMassEditRow[]>
  runFaActionAwait: (
    id: 'saveProjectMedia',
    payload: { items: I_faProjectMediaUpsertItem[] }
  ) => Promise<boolean>
  selectedPanel: I_ref<T_faProjectMediaPanel>
}): Promise<void> {
  const rowsAtSave = input.massEditRows.value
  const savedSnapshot = JSON.stringify(rowsAtSave)
  const items = input.mapRowsToUpsertItems(rowsAtSave)
  await enqueueDialogProjectMediaSave(async () => {
    const saved = await input.runFaActionAwait('saveProjectMedia', { items })
    if (!saved) {
      return
    }
    if (JSON.stringify(input.massEditRows.value) !== savedSnapshot) {
      return
    }
    if (input.afterSuccess === 'close') {
      input.dialogModel.value = false
      return
    }
    input.massEditRows.value = []
    input.selectedPanel.value = listPanel
  })
}

export function bindDialogProjectMediaMassEditSave (input: {
  dialogModel: I_ref<boolean>
  mapRowsToUpsertItems: (rows: I_faProjectMediaMassEditRow[]) => I_faProjectMediaUpsertItem[]
  massEditRows: I_ref<I_faProjectMediaMassEditRow[]>
  runFaActionAwait: (
    id: 'saveProjectMedia',
    payload: { items: I_faProjectMediaUpsertItem[] }
  ) => Promise<boolean>
  selectedPanel: I_ref<T_faProjectMediaPanel>
}): {
    saveAndBackToList: () => Promise<void>
    saveAndClose: () => Promise<void>
  } {
  async function saveAndBackToList (): Promise<void> {
    await persistDialogProjectMediaMassEdit({
      afterSuccess: 'list',
      dialogModel: input.dialogModel,
      mapRowsToUpsertItems: input.mapRowsToUpsertItems,
      massEditRows: input.massEditRows,
      runFaActionAwait: input.runFaActionAwait,
      selectedPanel: input.selectedPanel
    })
  }
  async function saveAndClose (): Promise<void> {
    await persistDialogProjectMediaMassEdit({
      afterSuccess: 'close',
      dialogModel: input.dialogModel,
      mapRowsToUpsertItems: input.mapRowsToUpsertItems,
      massEditRows: input.massEditRows,
      runFaActionAwait: input.runFaActionAwait,
      selectedPanel: input.selectedPanel
    })
  }
  return {
    saveAndBackToList,
    saveAndClose
  }
}
