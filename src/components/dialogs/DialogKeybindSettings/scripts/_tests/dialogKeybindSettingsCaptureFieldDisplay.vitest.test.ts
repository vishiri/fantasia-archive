import { reactive } from 'vue'
import { expect, test } from 'vitest'

import { useDialogKeybindSettingsCaptureFieldDisplay } from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsCaptureFieldDisplay'

test('useDialogKeybindSettingsCaptureFieldDisplay surfaces guidance text when only captureInfoMessage is set', () => {
  const props = reactive({
    captureError: false,
    captureErrorMessage: '',
    captureInfoMessage: 'hint',
    captureLabel: '',
    statusRegionId: 'x'
  })
  const {
    activeFieldMessage,
    hasError
  } = useDialogKeybindSettingsCaptureFieldDisplay(props)
  expect(activeFieldMessage.value).toBe('hint')
  expect(hasError.value).toBe(false)
})

test('useDialogKeybindSettingsCaptureFieldDisplay leaves active message empty when no status text', () => {
  const props = reactive({
    captureError: false,
    captureErrorMessage: '',
    captureInfoMessage: '',
    captureLabel: '',
    statusRegionId: 'x'
  })
  const {
    activeFieldMessage,
    hasError
  } = useDialogKeybindSettingsCaptureFieldDisplay(props)
  expect(activeFieldMessage.value).toBe('')
  expect(hasError.value).toBe(false)
})

test('useDialogKeybindSettingsCaptureFieldDisplay prefers conflict message and hasError when captureError', () => {
  const props = reactive({
    captureError: true,
    captureErrorMessage: 'bad',
    captureInfoMessage: 'hint',
    captureLabel: '',
    statusRegionId: 'x'
  })
  const {
    activeFieldMessage,
    hasError
  } = useDialogKeybindSettingsCaptureFieldDisplay(props)
  expect(activeFieldMessage.value).toBe('bad')
  expect(hasError.value).toBe(true)
})
