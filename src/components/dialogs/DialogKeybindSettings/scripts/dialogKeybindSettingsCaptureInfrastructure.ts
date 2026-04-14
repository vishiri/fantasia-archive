import { ref, watch, type ComputedRef, type Ref } from 'vue'

import type { T_dialogKeybindCaptureActionDeps } from 'app/types/I_dialogKeybindSettings'
import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'

export function createDialogKeybindCaptureRefs (): {
  captureActionName: Ref<string>
  captureBaselineChord: Ref<I_faChordSerialized | null>
  captureError: Ref<boolean>
  captureErrorMessage: Ref<string>
  captureInfoMessage: Ref<string>
  captureLabel: Ref<string>
  captureOpen: Ref<boolean>
  editingCommandId: Ref<T_faKeybindCommandId | null>
  pendingChord: Ref<I_faChordSerialized | null>
} {
  const captureOpen = ref(false)
  const captureActionName = ref('')
  const editingCommandId = ref<T_faKeybindCommandId | null>(null)
  const pendingChord = ref<I_faChordSerialized | null>(null)
  const captureBaselineChord = ref<I_faChordSerialized | null>(null)
  const captureLabel = ref('')
  const captureError = ref(false)
  const captureErrorMessage = ref('')
  const captureInfoMessage = ref('')

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

export type T_dialogKeybindCaptureRefsBundle = ReturnType<typeof createDialogKeybindCaptureRefs>

export function registerDialogKeybindCaptureOpenWatch (params: {
  captureActionName: Ref<string>
  captureOpen: Ref<boolean>
  editingCommandId: Ref<T_faKeybindCommandId | null>
  removeCaptureListener: () => void
}): void {
  const {
    captureActionName,
    captureOpen,
    editingCommandId,
    removeCaptureListener
  } = params

  watch(captureOpen, (open) => {
    if (!open) {
      removeCaptureListener()
      editingCommandId.value = null
      captureActionName.value = ''
    }
  })
}

export function buildDialogKeybindCaptureActionDeps (params: {
  handleCaptureKeydown: (e: KeyboardEvent) => void
  platform: ComputedRef<NodeJS.Platform>
  refs: T_dialogKeybindCaptureRefsBundle
  removeCaptureListener: () => void
  t: (key: string) => string
  workingOverrides: Ref<I_faKeybindsRoot['overrides']>
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
