import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'
import type { T_dialogKeybindCaptureActionDeps } from 'app/types/I_dialogKeybindSettings'
import type { T_dialogKeybindCaptureRefsBundle } from 'app/types/I_dialogKeybindSettings'
import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'

type T_createDialogKeybindSettingsCaptureInfrastructureDeps = {
  ref: <T>(value: T) => I_ref<T>
  watch: (
    source: I_ref<boolean>,
    effect: (open: boolean) => void
  ) => void
}

function createDialogKeybindCaptureRefs (
  deps: T_createDialogKeybindSettingsCaptureInfrastructureDeps
): T_dialogKeybindCaptureRefsBundle {
  const captureOpen = deps.ref(false)
  const captureActionName = deps.ref('')
  const editingCommandId = deps.ref<T_faKeybindCommandId | null>(null)
  const pendingChord = deps.ref<I_faChordSerialized | null>(null)
  const captureBaselineChord = deps.ref<I_faChordSerialized | null>(null)
  const captureLabel = deps.ref('')
  const captureError = deps.ref(false)
  const captureErrorMessage = deps.ref('')
  const captureInfoMessage = deps.ref('')

  return {
    captureActionName,
    captureBaselineChord,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    captureOpen,
    editingCommandId,
    pendingChord
  }
}

function registerDialogKeybindCaptureOpenWatch (
  deps: T_createDialogKeybindSettingsCaptureInfrastructureDeps,
  params: {
    captureActionName: I_ref<string>
    captureOpen: I_ref<boolean>
    editingCommandId: I_ref<T_faKeybindCommandId | null>
    removeCaptureListener: () => void
  }
): void {
  const {
    captureActionName,
    captureOpen,
    editingCommandId,
    removeCaptureListener
  } = params

  deps.watch(captureOpen, (open) => {
    if (!open) {
      removeCaptureListener()
      editingCommandId.value = null
      captureActionName.value = ''
    }
  })
}

function buildDialogKeybindCaptureActionDeps (params: {
  handleCaptureKeydown: (e: KeyboardEvent) => void
  platform: I_computedRef<NodeJS.Platform>
  refs: T_dialogKeybindCaptureRefsBundle
  removeCaptureListener: () => void
  t: (key: string) => string
  workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
}): T_dialogKeybindCaptureActionDeps {
  const {
    handleCaptureKeydown,
    platform,
    refs,
    removeCaptureListener,
    t,
    workingOverrides
  } = params

  return {
    captureActionName: refs.captureActionName,
    captureBaselineChord: refs.captureBaselineChord,
    captureError: refs.captureError,
    captureErrorMessage: refs.captureErrorMessage,
    captureInfoMessage: refs.captureInfoMessage,
    captureLabel: refs.captureLabel,
    captureOpen: refs.captureOpen,
    editingCommandId: refs.editingCommandId,
    handleCaptureKeydown,
    pendingChord: refs.pendingChord,
    platform,
    removeCaptureListener,
    t,
    workingOverrides
  }
}

export function createDialogKeybindSettingsCaptureInfrastructure (
  deps: T_createDialogKeybindSettingsCaptureInfrastructureDeps
): {
    buildDialogKeybindCaptureActionDeps: (params: {
      handleCaptureKeydown: (e: KeyboardEvent) => void
      platform: I_computedRef<NodeJS.Platform>
      refs: T_dialogKeybindCaptureRefsBundle
      removeCaptureListener: () => void
      t: (key: string) => string
      workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
    }) => T_dialogKeybindCaptureActionDeps
    createDialogKeybindCaptureRefs: () => T_dialogKeybindCaptureRefsBundle
    registerDialogKeybindCaptureOpenWatch: (params: {
      captureActionName: I_ref<string>
      captureOpen: I_ref<boolean>
      editingCommandId: I_ref<T_faKeybindCommandId | null>
      removeCaptureListener: () => void
    }) => void
  } {
  return {
    buildDialogKeybindCaptureActionDeps,
    createDialogKeybindCaptureRefs: () => createDialogKeybindCaptureRefs(deps),
    registerDialogKeybindCaptureOpenWatch: (params) => registerDialogKeybindCaptureOpenWatch(deps, params)
  }
}
