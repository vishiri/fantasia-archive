import type { I_ref } from 'app/types/I_vueCompositionShims'

export function createFaColorPickerPopoverEmit (deps: {
  onUnmounted: (fn: () => void) => void
  ref: <T>(value: T) => I_ref<T>
  throttle: <T extends (...args: never[]) => void>(
    fn: T,
    wait: number,
    options?: {
      leading?: boolean
      trailing?: boolean
    }
  ) => T & {
    cancel: () => void
    flush: () => void
  }
  throttleMs: number
  watch: (
    source: () => string,
    effect: (value: string) => void
  ) => void
}): (
    props: { modelValue: string },
    emitModelValue: (value: string) => void
  ) => {
    onPickerChange: (value: string | null) => void
    onPickerMenuHide: () => void
    onPickerUpdate: (value: string | null) => void
    resolveLiveColorString: () => string
  } {
  return function useFaColorPickerPopoverEmit (
    props: { modelValue: string },
    emitModelValue: (value: string) => void
  ) {
    const pickerDraftHex = deps.ref<string | null>(null)

    const throttledEmit = deps.throttle((value: string) => {
      emitModelValue(value)
    }, deps.throttleMs, {
      leading: true,
      trailing: true
    })

    deps.onUnmounted(() => {
      throttledEmit.cancel()
    })

    deps.watch(() => props.modelValue, (modelValue) => {
      if (pickerDraftHex.value !== null && modelValue === pickerDraftHex.value) {
        pickerDraftHex.value = null
      }
    })

    function resolveLiveColorString (): string {
      if (pickerDraftHex.value !== null) {
        return pickerDraftHex.value
      }
      return props.modelValue
    }

    function onPickerUpdate (value: string | null): void {
      const next = value ?? ''
      pickerDraftHex.value = next
      throttledEmit(next)
    }

    function onPickerChange (value: string | null): void {
      const next = value ?? ''
      pickerDraftHex.value = null
      throttledEmit.cancel()
      emitModelValue(next)
    }

    function onPickerMenuHide (): void {
      throttledEmit.flush()
      pickerDraftHex.value = null
    }

    return {
      onPickerChange,
      onPickerMenuHide,
      onPickerUpdate,
      resolveLiveColorString
    }
  }
}
