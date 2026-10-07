import type {
  I_faColorPickerPaletteAppendConfig,
  T_createUseFaColorPickerPaletteAppendDeps,
  T_faColorPickerAppendToWorldPaletteEmit
} from 'app/types/I_faColorPickerInput'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

const faColorPickerPaletteAppendTailByKey = new Map<string, Promise<void>>()
let faColorPickerDraftPaletteAppendQueueSerial = 0

function createFaColorPickerDraftPaletteAppendQueueKey (): string {
  faColorPickerDraftPaletteAppendQueueSerial += 1
  const draftQueueKey = `draft:${faColorPickerDraftPaletteAppendQueueSerial}`
  return draftQueueKey
}

function resolveFaColorPickerPaletteAppendQueueKey (
  mode: I_faColorPickerPaletteAppendConfig['mode'],
  worldId: string | undefined,
  draftQueueKey: string,
  readWorldId: (id: string | undefined) => string
): string {
  if (mode !== 'persist') {
    return draftQueueKey
  }
  const resolvedWorldId = readWorldId(worldId)
  if (resolvedWorldId.length === 0) {
    return draftQueueKey
  }
  const persistQueueKey = `persist:${resolvedWorldId}`
  return persistQueueKey
}

function clearFaColorPickerPaletteAppendTail (
  queueKey: string,
  settled: Promise<void>
): void {
  if (faColorPickerPaletteAppendTailByKey.get(queueKey) === settled) {
    faColorPickerPaletteAppendTailByKey.delete(queueKey)
  }
}

function enqueueFaColorPickerPaletteAppend (
  queueKey: string,
  work: () => Promise<void>
): Promise<void> {
  const previous = faColorPickerPaletteAppendTailByKey.get(queueKey) ?? Promise.resolve()
  const run = previous.then(work, work)
  let settled: Promise<void> = Promise.resolve()
  settled = run.then(
    () => {
      clearFaColorPickerPaletteAppendTail(queueKey, settled)
    },
    () => {
      clearFaColorPickerPaletteAppendTail(queueKey, settled)
    }
  )
  faColorPickerPaletteAppendTailByKey.set(queueKey, settled)
  return run
}

type T_faColorPickerPaletteAppendProps = {
  modelValue: string
  paletteAppend?: I_faColorPickerPaletteAppendConfig | undefined
}

type T_faColorPickerPaletteAppendApi = {
  isPaletteAppendDisabled: I_computedRef<boolean>
  isPaletteAppendDuplicate: I_computedRef<boolean>
  isPaletteAppendInvalidHex: I_computedRef<boolean>
  onPaletteAppendClick: () => Promise<void>
  showPaletteAppendButton: I_computedRef<boolean>
}

function createFaColorPickerPaletteAppendApi (
  deps: T_createUseFaColorPickerPaletteAppendDeps,
  props: T_faColorPickerPaletteAppendProps,
  emitAppendToWorldPalette: T_faColorPickerAppendToWorldPaletteEmit,
  resolveLiveColorString: () => string,
  refreshProjectColorPalette?: () => Promise<void>
): T_faColorPickerPaletteAppendApi {
  const showPaletteAppendButton = deps.computed(() => props.paletteAppend !== undefined)

  const appendHexCandidate = deps.computed(() => resolveLiveColorString().trim())

  const isPaletteAppendDuplicate = deps.computed(() => {
    return deps.isFaColorPickerPaletteAppendDuplicate(
      props.paletteAppend,
      appendHexCandidate.value,
      deps.faProjectWorldColorPaletteContainsHex,
      deps.isFaProjectWorldStorageHexColor
    )
  })

  const isPaletteAppendInvalidHex = deps.computed(() => {
    const hex = appendHexCandidate.value
    if (hex.length === 0) {
      return true
    }
    return !deps.isFaProjectWorldStorageHexColor(hex)
  })

  const isPaletteAppendDisabled = deps.computed(() => {
    return deps.isFaColorPickerPaletteAppendDisabled(
      props.paletteAppend,
      appendHexCandidate.value,
      deps.appendFaProjectWorldColorPaletteHex,
      deps.faProjectWorldColorPaletteContainsHex,
      deps.isFaProjectWorldStorageHexColor,
      deps.paletteMaxLength,
      deps.readFaColorPickerPaletteAppendWorldId
    )
  })

  const draftAppendQueueKey = createFaColorPickerDraftPaletteAppendQueueKey()

  function paletteAppendDisabledFor (
    config: I_faColorPickerPaletteAppendConfig,
    hex: string
  ): boolean {
    return deps.isFaColorPickerPaletteAppendDisabled(
      config,
      hex,
      deps.appendFaProjectWorldColorPaletteHex,
      deps.faProjectWorldColorPaletteContainsHex,
      deps.isFaProjectWorldStorageHexColor,
      deps.paletteMaxLength,
      deps.readFaColorPickerPaletteAppendWorldId
    )
  }

  async function runPaletteAppendFromLatestConfig (hex: string): Promise<void> {
    const config = props.paletteAppend
    if (config === undefined || paletteAppendDisabledFor(config, hex)) {
      return
    }
    await deps.runFaColorPickerPaletteAppendClick(
      config,
      hex,
      deps.appendFaProjectWorldColorPaletteHex,
      deps.paletteMaxLength,
      deps.persistWorldColorPalette,
      deps.readFaColorPickerPaletteAppendWorldId,
      deps.refreshProjectWorldColorPalette,
      emitAppendToWorldPalette,
      refreshProjectColorPalette
    )
  }

  async function onPaletteAppendClick (): Promise<void> {
    const config = props.paletteAppend
    const hex = appendHexCandidate.value
    if (config === undefined || isPaletteAppendDisabled.value) {
      return
    }
    const queueKey = resolveFaColorPickerPaletteAppendQueueKey(
      config.mode,
      config.worldId,
      draftAppendQueueKey,
      deps.readFaColorPickerPaletteAppendWorldId
    )
    await enqueueFaColorPickerPaletteAppend(queueKey, () => {
      return runPaletteAppendFromLatestConfig(hex)
    })
  }

  return {
    isPaletteAppendDisabled,
    isPaletteAppendDuplicate,
    isPaletteAppendInvalidHex,
    onPaletteAppendClick,
    showPaletteAppendButton
  }
}

export function createUseFaColorPickerPaletteAppend (
  deps: T_createUseFaColorPickerPaletteAppendDeps
): (
    props: T_faColorPickerPaletteAppendProps,
    emitAppendToWorldPalette: T_faColorPickerAppendToWorldPaletteEmit,
    resolveLiveColorString: () => string,
    refreshProjectColorPalette?: () => Promise<void>
  ) => T_faColorPickerPaletteAppendApi {
  return function useFaColorPickerPaletteAppend (
    props,
    emitAppendToWorldPalette,
    resolveLiveColorString,
    refreshProjectColorPalette
  ) {
    return createFaColorPickerPaletteAppendApi(
      deps,
      props,
      emitAppendToWorldPalette,
      resolveLiveColorString,
      refreshProjectColorPalette
    )
  }
}
