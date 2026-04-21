import { onMounted, ref, watch, type Ref } from 'vue'

import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'
import { S_FaProgramStyling } from 'app/src/stores/S_FaProgramStyling'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun'

import {
  useMonacoMount,
  type I_FaMonacoMount
} from 'app/src/components/dialogs/DialogProgramStyling/scripts/useMonacoMount'

/**
 * Internal alias for the Pinia generic store accessed via 'S_DialogComponent'.
 * Avoids importing the Pinia 'StoreGeneric' type into the dialog template.
 */
type T_resolvedDialogComponentStore = ReturnType<typeof S_DialogComponent> | null

function resolveDialogComponentStore (): T_resolvedDialogComponentStore {
  try {
    return S_DialogComponent()
  } catch {
    return null
  }
}

/**
 * Public surface returned by 'useDialogProgramStyling'. Exposes:
 *  - reactive 'dialogModel' for the persistent QDialog,
 *  - 'workingCss' (the editor's working copy that lives only while the dialog is open),
 *  - the Monaco mount handle,
 *  - lifecycle callbacks (open / show / hide / save).
 */
export interface I_FaDialogProgramStylingState {
  closeWithoutSaving: () => void
  dialogModel: Ref<boolean>
  documentName: Ref<T_dialogName>
  editorHostRef: Ref<HTMLDivElement | null>
  monaco: I_FaMonacoMount
  onDialogHide: () => void
  onDialogShow: () => Promise<void>
  saveAndCloseDialog: () => Promise<void>
  workingCss: Ref<string>
}

export function useDialogProgramStyling (props: { directInput?: T_dialogName }): I_FaDialogProgramStylingState {
  const dialogModel = ref(false)
  const documentName = ref<T_dialogName>('ProgramStyling')
  const workingCss = ref('')
  const editorHostRef = ref<HTMLDivElement | null>(null)

  const monaco = useMonacoMount({
    onChange (next: string): void {
      workingCss.value = next
    }
  })

  function syncWorkingFromStore (): void {
    workingCss.value = S_FaProgramStyling().css
  }

  function openDialog (): void {
    syncWorkingFromStore()
    dialogModel.value = true
  }

  async function onDialogShow (): Promise<void> {
    if (editorHostRef.value === null) {
      return
    }
    await monaco.mountInto(editorHostRef.value, workingCss.value)
  }

  function onDialogHide (): void {
    monaco.disposeEditor()
    workingCss.value = ''
  }

  function closeWithoutSaving (): void {
    dialogModel.value = false
  }

  async function saveAndCloseDialog (): Promise<void> {
    const ok = await runFaActionAwait('saveProgramStyling', { css: workingCss.value })
    if (ok) {
      dialogModel.value = false
    }
  }

  watch(
    () => resolveDialogComponentStore()?.dialogUUID,
    () => {
      const store = resolveDialogComponentStore()
      if (store?.dialogToOpen === 'ProgramStyling') {
        openDialog()
      }
    }
  )

  watch(
    () => props.directInput,
    () => {
      if (props.directInput === 'ProgramStyling') {
        openDialog()
      }
    }
  )

  onMounted(() => {
    if (props.directInput === 'ProgramStyling') {
      openDialog()
    }
  })

  return {
    closeWithoutSaving,
    dialogModel,
    documentName,
    editorHostRef,
    monaco,
    onDialogHide,
    onDialogShow,
    saveAndCloseDialog,
    workingCss
  }
}
