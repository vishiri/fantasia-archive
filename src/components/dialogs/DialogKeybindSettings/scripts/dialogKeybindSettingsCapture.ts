import type { ComputedRef, Ref } from 'vue'

import {
  bindOnCaptureClear,
  bindOnCaptureSet,
  bindOnOpenCapture,
  makeDialogKeybindCaptureKeydownHandler
} from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsCaptureHandlers'
import {
  buildDialogKeybindCaptureActionDeps,
  createDialogKeybindCaptureRefs,
  registerDialogKeybindCaptureOpenWatch,
  type T_dialogKeybindCaptureRefsBundle
} from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsCaptureInfrastructure'
import type {
  T_createDialogKeybindSettingsCaptureResult,
  T_dialogKeybindCaptureActionDeps
} from 'app/types/I_dialogKeybindSettings'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'

function buildDialogKeybindSettingsCaptureApi (params: {
  actionDeps: T_dialogKeybindCaptureActionDeps
  refs: T_dialogKeybindCaptureRefsBundle
  removeCaptureListener: () => void
}): T_createDialogKeybindSettingsCaptureResult {
  const {
    actionDeps,
    refs,
    removeCaptureListener
  } = params

  return {
    captureActionName: refs.captureActionName,
    captureError: refs.captureError,
    captureErrorMessage: refs.captureErrorMessage,
    captureInfoMessage: refs.captureInfoMessage,
    captureLabel: refs.captureLabel,
    captureOpen: refs.captureOpen,
    onCaptureClear: bindOnCaptureClear(actionDeps),
    onCaptureSet: bindOnCaptureSet(actionDeps),
    onOpenCapture: bindOnOpenCapture(actionDeps),
    pendingChord: refs.pendingChord,
    removeCaptureListener
  }
}

function createDialogKeybindSettingsCaptureKeydown (params: {
  platform: ComputedRef<NodeJS.Platform>
  refs: T_dialogKeybindCaptureRefsBundle
  t: (key: string) => string
  workingOverrides: Ref<I_faKeybindsRoot['overrides']>
}): {
    handleCaptureKeydown: (e: KeyboardEvent) => void
    removeCaptureListener: () => void
  } {
  const {
    platform,
    refs,
    t,
    workingOverrides
  } = params

  const handleCaptureKeydown = makeDialogKeybindCaptureKeydownHandler({
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
  })

  function removeCaptureListener (): void {
    window.removeEventListener('keydown', handleCaptureKeydown, true)
  }

  return {
    handleCaptureKeydown,
    removeCaptureListener
  }
}

function initDialogKeybindSettingsCapture (params: {
  platform: ComputedRef<NodeJS.Platform>
  t: (key: string) => string
  workingOverrides: Ref<I_faKeybindsRoot['overrides']>
}): {
    actionDeps: T_dialogKeybindCaptureActionDeps
    refs: T_dialogKeybindCaptureRefsBundle
    removeCaptureListener: () => void
  } {
  const {
    platform,
    t,
    workingOverrides
  } = params

  const refs = createDialogKeybindCaptureRefs()

  const {
    handleCaptureKeydown,
    removeCaptureListener
  } = createDialogKeybindSettingsCaptureKeydown({
    platform,
    refs,
    t,
    workingOverrides
  })

  registerDialogKeybindCaptureOpenWatch({
    captureActionName: refs.captureActionName,
    captureOpen: refs.captureOpen,
    editingCommandId: refs.editingCommandId,
    removeCaptureListener
  })

  const actionDeps = buildDialogKeybindCaptureActionDeps({
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

export function createDialogKeybindSettingsCapture (params: {
  platform: ComputedRef<NodeJS.Platform>
  t: (key: string) => string
  workingOverrides: Ref<I_faKeybindsRoot['overrides']>
}): T_createDialogKeybindSettingsCaptureResult {
  const {
    actionDeps,
    refs,
    removeCaptureListener
  } = initDialogKeybindSettingsCapture(params)

  return buildDialogKeybindSettingsCaptureApi({
    actionDeps,
    refs,
    removeCaptureListener
  })
}
