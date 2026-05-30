import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

import type {
  T_createDialogKeybindSettingsCaptureResult,
  T_dialogKeybindCaptureActionDeps,
  T_dialogKeybindCaptureKeydownDeps,
  T_dialogKeybindCaptureRefsBundle
} from 'app/types/I_dialogKeybindSettings'
import type { T_dialogKeybindSettingsCaptureFactoryDeps } from 'app/types/I_dialogKeybindSettingsFactories'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'

export function buildDialogKeybindSettingsCaptureApi (
  deps: T_dialogKeybindSettingsCaptureFactoryDeps,
  params: {
    actionDeps: T_dialogKeybindCaptureActionDeps
    refs: T_dialogKeybindCaptureRefsBundle
    removeCaptureListener: () => void
  }
): T_createDialogKeybindSettingsCaptureResult {
  const {
    actionDeps,
    refs,
    removeCaptureListener
  } = params

  const onCaptureClear = deps.bindOnCaptureClear(actionDeps)
  const onCaptureSet = deps.bindOnCaptureSet(actionDeps)
  const onOpenCapture = deps.bindOnOpenCapture(actionDeps)
  return {
    captureActionName: refs.captureActionName,
    captureError: refs.captureError,
    captureErrorMessage: refs.captureErrorMessage,
    captureInfoMessage: refs.captureInfoMessage,
    captureLabel: refs.captureLabel,
    captureOpen: refs.captureOpen,
    onCaptureClear,
    onCaptureSet,
    onOpenCapture,
    pendingChord: refs.pendingChord,
    removeCaptureListener
  }
}

export function initDialogKeybindSettingsCapture (
  deps: T_dialogKeybindSettingsCaptureFactoryDeps,
  params: {
    platform: I_computedRef<NodeJS.Platform>
    t: (key: string) => string
    workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
  }
): {
    actionDeps: T_dialogKeybindCaptureActionDeps
    refs: T_dialogKeybindCaptureRefsBundle
    removeCaptureListener: () => void
  } {
  const {
    platform,
    t,
    workingOverrides
  } = params

  const refs = deps.createDialogKeybindCaptureRefs()

  const keydownDeps: T_dialogKeybindCaptureKeydownDeps = {
    captureBaselineChord: refs.captureBaselineChord,
    captureError: refs.captureError,
    captureErrorMessage: refs.captureErrorMessage,
    captureInfoMessage: refs.captureInfoMessage,
    captureLabel: refs.captureLabel,
    captureOpen: refs.captureOpen,
    editingCommandId: refs.editingCommandId,
    pendingChord: refs.pendingChord,
    platform,
    t,
    workingOverrides
  }

  const handleCaptureKeydown = deps.makeDialogKeybindCaptureKeydownHandler(keydownDeps)
  const removeCaptureListener = (): void => {
    deps.removeKeydownListener(handleCaptureKeydown)
  }

  deps.registerDialogKeybindCaptureOpenWatch({
    captureActionName: refs.captureActionName,
    captureOpen: refs.captureOpen,
    editingCommandId: refs.editingCommandId,
    removeCaptureListener
  })

  const actionDeps = deps.buildDialogKeybindCaptureActionDeps({
    handleCaptureKeydown,
    platform,
    refs,
    removeCaptureListener,
    t,
    workingOverrides
  })

  return {
    actionDeps,
    refs,
    removeCaptureListener
  }
}

export function createDialogKeybindSettingsCaptureInstance (
  deps: T_dialogKeybindSettingsCaptureFactoryDeps,
  params: {
    platform: I_computedRef<NodeJS.Platform>
    t: (key: string) => string
    workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
  }
): T_createDialogKeybindSettingsCaptureResult {
  const init = initDialogKeybindSettingsCapture(deps, params)
  return buildDialogKeybindSettingsCaptureApi(deps, init)
}
