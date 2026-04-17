import type { ComponentPublicInstance } from 'vue'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
  type ComputedRef,
  type Ref
} from 'vue'

import { computeDialogKeybindSettingsTableMaxHeightPx } from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsTableLayoutSizing'

type T_dialogKeybindTableLayoutRun = {
  generation: number
  getSectionElement: () => HTMLElement | null
  observer: ResizeObserver | null
  tableMaxHeightPx: Ref<number | null>
}

/**
 * Resolves the measured HTMLElement for the keybind dialog body section ref.
 */
export function resolveDialogKeybindSettingsBodySectionHTMLElement (
  inst: ComponentPublicInstance | null
): HTMLElement | null {
  if (!inst) {
    return null
  }
  const raw = (inst as unknown as { $el?: unknown }).$el
  if (!(raw instanceof HTMLElement)) {
    return null
  }
  return raw
}

async function dialogKeybindSettingsTableLayoutAfterOpenDelay (): Promise<void> {
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })
}

function tableLayoutMeasure (ctx: T_dialogKeybindTableLayoutRun): void {
  const el = ctx.getSectionElement()
  if (!el) {
    return
  }
  ctx.tableMaxHeightPx.value = computeDialogKeybindSettingsTableMaxHeightPx(el)
}

function tableLayoutStop (
  ctx: T_dialogKeybindTableLayoutRun,
  measure: () => void
): void {
  window.removeEventListener(
    'resize',
    measure
  )
  ctx.observer?.disconnect()
  ctx.observer = null
}

function tableLayoutStart (
  ctx: T_dialogKeybindTableLayoutRun,
  measure: () => void
): void {
  tableLayoutStop(
    ctx,
    measure
  )
  const el = ctx.getSectionElement()
  if (!el) {
    return
  }
  ctx.observer = new ResizeObserver(measure)
  ctx.observer.observe(el)
  window.addEventListener(
    'resize',
    measure
  )
  measure()
}

async function tableLayoutOnModelChange (
  open: boolean,
  gen: number,
  ctx: T_dialogKeybindTableLayoutRun,
  measure: () => void
): Promise<void> {
  if (!open) {
    tableLayoutStop(
      ctx,
      measure
    )
    ctx.tableMaxHeightPx.value = null
    return
  }
  await dialogKeybindSettingsTableLayoutAfterOpenDelay()
  if (gen !== ctx.generation) {
    return
  }
  tableLayoutStart(
    ctx,
    measure
  )
}

/**
 * Observes the keybind dialog body section and keeps a q-table max-height in sync
 * with the flex layout (ResizeObserver + window resize while the dialog is open).
 */
export function useDialogKeybindSettingsTableLayout (args: {
  dialogModel: Ref<boolean>
  getSectionElement: () => HTMLElement | null
}): {
    tableMaxHeightPx: Ref<number | null>
  } {
  const tableMaxHeightPx = ref<number | null>(null)
  const ctx: T_dialogKeybindTableLayoutRun = {
    generation: 0,
    getSectionElement: args.getSectionElement,
    observer: null,
    tableMaxHeightPx
  }
  const measureAndApply = (): void => {
    tableLayoutMeasure(ctx)
  }

  watch(
    () => args.dialogModel.value,
    async (open) => {
      const gen = ++ctx.generation
      await tableLayoutOnModelChange(
        open,
        gen,
        ctx,
        measureAndApply
      )
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    ctx.generation += 1
    tableLayoutStop(
      ctx,
      measureAndApply
    )
  })

  return {
    tableMaxHeightPx
  }
}

/**
 * Binds the keybind settings q-card-section ref to table max-height layout updates.
 */
export function useDialogKeybindSettingsTableChrome (dialogModel: Ref<boolean>): {
  bodySectionRef: Ref<ComponentPublicInstance | null>
  dialogKeybindSettingsTableHeightStyle: ComputedRef<Record<string, string> | undefined>
} {
  const bodySectionRef = ref<ComponentPublicInstance | null>(null)
  const { tableMaxHeightPx } = useDialogKeybindSettingsTableLayout({
    dialogModel,
    getSectionElement (): HTMLElement | null {
      return resolveDialogKeybindSettingsBodySectionHTMLElement(bodySectionRef.value)
    }
  })
  const dialogKeybindSettingsTableHeightStyle = computed((): Record<string, string> | undefined => {
    const px = tableMaxHeightPx.value
    if (px === null) {
      return undefined
    }
    return {
      maxHeight: `${String(px)}px`
    }
  })
  return {
    bodySectionRef,
    dialogKeybindSettingsTableHeightStyle
  }
}
