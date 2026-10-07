import type { I_dialogComponentStoreLike } from 'app/types/I_dialogComponentStoreLike'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

type T_createDialogNewProjectDeps = {
  FA_PROJECT_NAME_MAX_LEN: number
  computed: <T>(getter: () => T) => I_computedRef<T>
  isDialogNewProjectCreateDisabled: (projectName: string) => boolean
  isDialogNewProjectDirectInput: (input: T_dialogName | undefined) => boolean
  isDialogNewProjectStoreTarget: (dialogToOpen: unknown) => boolean
  nextTick: () => Promise<void>
  onMounted: (hook: () => void) => void
  ref: <T>(value: T) => I_ref<T>
  registerComponentDialogStackGuard: (dialogModel: I_ref<boolean>) => void
  resolveDialogComponentStoreOrNull: () => I_dialogComponentStoreLike | null
  shouldSubmitDialogNewProjectOnEnter: (event: {
    isComposing: boolean
    keyCode: number
  }) => boolean
  runFaActionAwait: (
    id: 'createNewProject',
    payload: { projectName: string }
  ) => Promise<boolean>
  watch: (
    source: I_ref<boolean> | (() => unknown),
    effect: (value?: boolean) => void | Promise<void>
  ) => void
}

let dialogNewProjectCreateInFlight = false

async function runDialogNewProjectCreate (
  deps: T_createDialogNewProjectDeps,
  projectName: string,
  closeDialog: () => void,
  readLiveProjectName: (() => string) | undefined
): Promise<void> {
  if (dialogNewProjectCreateInFlight) {
    return
  }
  dialogNewProjectCreateInFlight = true
  try {
    const ok = await deps.runFaActionAwait('createNewProject', { projectName })
    if (!ok) {
      return
    }
    if (
      readLiveProjectName !== undefined &&
      readLiveProjectName().trim() !== projectName
    ) {
      return
    }
    closeDialog()
  } finally {
    dialogNewProjectCreateInFlight = false
  }
}

async function focusDialogNewProjectNameInputAfterShow (
  deps: T_createDialogNewProjectDeps,
  nameInputRef: I_ref<{ focus: () => void } | null>
): Promise<void> {
  await deps.nextTick()
  nameInputRef.value?.focus()
}

function dialogNewProjectOpenDialog (
  documentName: I_ref<string>,
  dialogModel: I_ref<boolean>,
  input: T_dialogName
): void {
  documentName.value = input
  dialogModel.value = true
}

function dialogNewProjectCloseDialog (dialogModel: I_ref<boolean>): void {
  dialogModel.value = false
}

function useDialogNewProject (
  deps: T_createDialogNewProjectDeps,
  props: { directInput?: T_dialogName | undefined }
): {
    createDisabled: I_computedRef<boolean>
    dialogModel: I_ref<boolean>
    documentName: I_ref<string>
    nameInputRef: I_ref<{ focus: () => void } | null>
    onClickCreate: () => Promise<void>
    onDialogShow: () => void
    onNameInputEnter: (event: { isComposing: boolean; keyCode: number }) => void
    projectName: I_ref<string>
  } {
  const dialogModel = deps.ref(false)
  const projectName = deps.ref('')
  const nameInputRef = deps.ref<{ focus: () => void } | null>(null)
  deps.registerComponentDialogStackGuard(dialogModel)
  const documentName = deps.ref('')

  const onDialogShow = (): void => {
    void focusDialogNewProjectNameInputAfterShow(deps, nameInputRef)
  }

  deps.watch(dialogModel, (isOpen) => {
    if (isOpen) {
      projectName.value = ''
    }
  })

  const createDisabled = deps.computed(() => {
    return deps.isDialogNewProjectCreateDisabled(projectName.value)
  })

  const openDialog = (input: T_dialogName): void => {
    dialogNewProjectOpenDialog(documentName, dialogModel, input)
  }

  const closeDialog = (): void => {
    dialogNewProjectCloseDialog(dialogModel)
  }

  const onClickCreate = async (): Promise<void> => {
    if (createDisabled.value) {
      return
    }
    await runDialogNewProjectCreate(
      deps,
      projectName.value.trim(),
      closeDialog,
      () => projectName.value
    )
  }

  const onNameInputEnter = (event: { isComposing: boolean; keyCode: number }): void => {
    if (!deps.shouldSubmitDialogNewProjectOnEnter(event)) {
      return
    }
    void onClickCreate()
  }

  deps.watch(() => deps.resolveDialogComponentStoreOrNull()?.dialogUUID, () => {
    const dialogComponentStore = deps.resolveDialogComponentStoreOrNull()
    if (
      dialogComponentStore !== null &&
      deps.isDialogNewProjectStoreTarget(dialogComponentStore.dialogToOpen)
    ) {
      openDialog(dialogComponentStore.dialogToOpen as T_dialogName)
    }
  })

  deps.watch(() => props.directInput, () => {
    if (deps.isDialogNewProjectDirectInput(props.directInput)) {
      openDialog(props.directInput as T_dialogName)
    }
  })

  deps.onMounted(() => {
    if (deps.isDialogNewProjectDirectInput(props.directInput)) {
      openDialog(props.directInput as T_dialogName)
    }
  })

  return {
    createDisabled,
    dialogModel,
    documentName,
    nameInputRef,
    onClickCreate,
    onDialogShow,
    onNameInputEnter,
    projectName
  }
}

export function createDialogNewProject (deps: T_createDialogNewProjectDeps): {
  resolveDialogComponentStoreOrNull: () => I_dialogComponentStoreLike | null
  runDialogNewProjectCreate: (
    projectName: string,
    closeDialog: () => void,
    readLiveProjectName?: () => string
  ) => Promise<void>
  useDialogNewProject: (props: { directInput?: T_dialogName | undefined }) => ReturnType<typeof useDialogNewProject>
} {
  const resolveDialogComponentStoreOrNull = deps.resolveDialogComponentStoreOrNull
  const runDialogNewProjectCreateBound = (
    projectName: string,
    closeDialog: () => void,
    readLiveProjectName?: () => string
  ): Promise<void> => {
    return runDialogNewProjectCreate(deps, projectName, closeDialog, readLiveProjectName)
  }
  const useDialogNewProjectBound = (
    props: { directInput?: T_dialogName | undefined }
  ): ReturnType<typeof useDialogNewProject> => {
    return useDialogNewProject(deps, props)
  }

  return {
    resolveDialogComponentStoreOrNull,
    runDialogNewProjectCreate: runDialogNewProjectCreateBound,
    useDialogNewProject: useDialogNewProjectBound
  }
}
