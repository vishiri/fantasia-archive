import type {
  I_dialogKeybindSettingsRow,
  T_dialogKeybindCaptureActionDeps
} from 'app/types/I_dialogKeybindSettings'
import type { T_dialogKeybindSettingsCaptureHandlersFactoryBindings } from 'app/types/I_dialogKeybindSettingsFactories'

export function createDialogKeybindSettingsCaptureHandlers (
  bindings: T_dialogKeybindSettingsCaptureHandlersFactoryBindings
): {
    bindOnCaptureClear: (
      actionDeps: Pick<T_dialogKeybindCaptureActionDeps, 'captureBaselineChord' | 'captureError' | 'captureErrorMessage' | 'captureInfoMessage' | 'captureLabel' | 'captureOpen' | 'editingCommandId' | 'pendingChord' | 'workingOverrides'>
    ) => () => void
    bindOnCaptureSet: (actionDeps: T_dialogKeybindCaptureActionDeps) => () => void
    bindOnOpenCapture: (actionDeps: T_dialogKeybindCaptureActionDeps) => (row: I_dialogKeybindSettingsRow) => void
  } {
  const {
    bindOnCaptureClear: bindClearImpl,
    bindOnCaptureSet: bindSetImpl,
    bindOnOpenCapture: bindOpenImpl,
    handlersDeps
  } = bindings

  const bindOpenCapture = (
    actionDeps: T_dialogKeybindCaptureActionDeps
  ): ((row: I_dialogKeybindSettingsRow) => void) => {
    return bindOpenImpl(handlersDeps, actionDeps)
  }

  const bindCaptureSet = (actionDeps: T_dialogKeybindCaptureActionDeps): (() => void) => {
    return bindSetImpl(handlersDeps, actionDeps)
  }

  return {
    bindOnCaptureClear: bindClearImpl,
    bindOnCaptureSet: bindCaptureSet,
    bindOnOpenCapture: bindOpenCapture
  }
}
