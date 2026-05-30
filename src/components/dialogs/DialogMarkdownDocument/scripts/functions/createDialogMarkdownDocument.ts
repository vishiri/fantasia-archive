import type { T_documentName } from 'app/types/T_appDialogsAndDocuments'
import type { I_ref } from 'app/types/I_vueCompositionShims'

interface I_dialogMarkdownStoreLike {
  dialogUUID?: unknown
  documentToOpen?: unknown
}

export function createDialogMarkdownDocument (deps: {
  computed: <T>(getter: () => T) => { value: T }
  isNonEmptyMarkdownDocumentName: (documentToOpen: unknown) => documentToOpen is T_documentName
  onMounted: (hook: () => void) => void
  ref: <T>(value: T) => I_ref<T>
  registerMarkdownDialogStackGuard: (dialogModel: I_ref<boolean>) => void
  resolveDialogMarkdownDocumentAriaLabel: (
    documentName: string,
    t: (key: string) => string
  ) => string
  resolveDialogMarkdownStore: () => I_dialogMarkdownStoreLike | null
  t: (key: string) => string
  watch: (source: () => unknown, effect: () => void) => void
}): {
    resolveDialogMarkdownStore: () => I_dialogMarkdownStoreLike | null
    useDialogMarkdownDocument: (props: { directInput?: T_documentName }) => {
      dialogAriaLabel: { value: string }
      dialogModel: I_ref<boolean>
      documentName: I_ref<string>
    }
  } {
  const resolveDialogMarkdownStore = deps.resolveDialogMarkdownStore

  const useDialogMarkdownDocument = (props: {
    directInput?: T_documentName
  }) => {
    const dialogModel = deps.ref(false)
    deps.registerMarkdownDialogStackGuard(dialogModel)
    const documentName = deps.ref('')

    const dialogAriaLabel = deps.computed(() => {
      return deps.resolveDialogMarkdownDocumentAriaLabel(
        documentName.value,
        deps.t
      )
    })

    function openDialog (input: T_documentName): void {
      documentName.value = input
      dialogModel.value = true
    }

    deps.watch(() => resolveDialogMarkdownStore()?.dialogUUID, () => {
      const dialogMarkdownStore = resolveDialogMarkdownStore()
      if (deps.isNonEmptyMarkdownDocumentName(dialogMarkdownStore?.documentToOpen)) {
        openDialog(dialogMarkdownStore.documentToOpen)
      }
    })

    deps.watch(() => props.directInput, () => {
      if (props.directInput !== undefined && props.directInput !== '') {
        openDialog(props.directInput)
      }
    })

    deps.onMounted(() => {
      if (props.directInput !== undefined && props.directInput !== '') {
        openDialog(props.directInput)
      }
    })

    return {
      dialogAriaLabel,
      dialogModel,
      documentName
    }
  }

  return {
    resolveDialogMarkdownStore,
    useDialogMarkdownDocument
  }
}
