import type { I_ref, I_vueComponentPublicInstance } from 'app/types/I_vueCompositionShims'

import type { T_dialogKeybindSettingsTableLayoutObserveModuleDeps } from 'app/types/I_dialogKeybindSettings'
import type { T_dialogKeybindTableLayoutRun } from 'app/types/I_dialogKeybindSettingsFactories'

export function resolveDialogKeybindSettingsBodySectionHTMLElement (
  inst: I_vueComponentPublicInstance | null
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

async function dialogKeybindSettingsTableLayoutAfterOpenDelay (
  nextTick: () => Promise<void>
): Promise<void> {
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })
}

function tableLayoutMeasure (
  computeDialogKeybindSettingsTableMaxHeightPx: (
    sectionElement: HTMLElement,
    minPx?: number
  ) => number,
  ctx: T_dialogKeybindTableLayoutRun
): void {
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
  window.removeEventListener('resize', measure)
  ctx.observer?.disconnect()
  ctx.observer = null
}

function tableLayoutStart (
  ctx: T_dialogKeybindTableLayoutRun,
  measure: () => void
): void {
  tableLayoutStop(ctx, measure)
  const el = ctx.getSectionElement()
  if (!el) {
    return
  }
  ctx.observer = new ResizeObserver(measure)
  ctx.observer.observe(el)
  window.addEventListener('resize', measure)
  measure()
}

async function tableLayoutOnModelChange (
  open: boolean,
  gen: number,
  ctx: T_dialogKeybindTableLayoutRun,
  measure: () => void,
  nextTick: () => Promise<void>
): Promise<void> {
  if (!open) {
    tableLayoutStop(ctx, measure)
    ctx.tableMaxHeightPx.value = null
    return
  }
  await dialogKeybindSettingsTableLayoutAfterOpenDelay(nextTick)
  if (gen !== ctx.generation) {
    return
  }
  tableLayoutStart(ctx, measure)
}

export function useDialogKeybindSettingsTableLayout (
  deps: T_dialogKeybindSettingsTableLayoutObserveModuleDeps,
  args: {
    dialogModel: I_ref<boolean>
    getSectionElement: () => HTMLElement | null
  }
): {
    tableMaxHeightPx: I_ref<number | null>
  } {
  const tableMaxHeightPx = deps.ref<number | null>(null)
  const ctx: T_dialogKeybindTableLayoutRun = {
    generation: 0,
    getSectionElement: args.getSectionElement,
    observer: null,
    tableMaxHeightPx
  }
  const measureAndApply = (): void => {
    tableLayoutMeasure(deps.computeDialogKeybindSettingsTableMaxHeightPx, ctx)
  }

  deps.watch(
    () => args.dialogModel.value,
    async (open) => {
      const gen = ++ctx.generation
      await tableLayoutOnModelChange(open, gen, ctx, measureAndApply, deps.nextTick)
    },
    { immediate: true }
  )

  deps.onBeforeUnmount(() => {
    ctx.generation += 1
    tableLayoutStop(ctx, measureAndApply)
  })

  return {
    tableMaxHeightPx
  }
}

export function useDialogKeybindSettingsTableChrome (
  deps: T_dialogKeybindSettingsTableLayoutObserveModuleDeps,
  dialogModel: I_ref<boolean>
): {
    bodySectionRef: I_ref<I_vueComponentPublicInstance | null>
    dialogKeybindSettingsTableHeightStyle: ReturnType<typeof deps.computed<Record<string, string> | undefined>>
  } {
  const bodySectionRef = deps.ref<I_vueComponentPublicInstance | null>(null)
  const { tableMaxHeightPx } = useDialogKeybindSettingsTableLayout(deps, {
    dialogModel,
    getSectionElement (): HTMLElement | null {
      return resolveDialogKeybindSettingsBodySectionHTMLElement(bodySectionRef.value)
    }
  })
  const dialogKeybindSettingsTableHeightStyle = deps.computed((): Record<string, string> | undefined => {
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
