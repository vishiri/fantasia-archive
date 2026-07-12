import type { T_createDocumentWorkspacePageColorPickersDeps } from 'app/types/I_documentWorkspacePage'
import type { I_faColorPickerPaletteAppendConfig } from 'app/types/I_faColorPickerInput'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

function createDocumentWorkspacePageDocumentWorldComputed (deps: {
  computed: <T>(fn: () => T) => I_computedRef<T>
  documentTab: I_computedRef<I_faOpenedDocumentTab | null>
  worlds: I_computedRef<readonly I_faProjectHierarchyTreeWorkspaceWorld[]>
}): I_computedRef<I_faProjectHierarchyTreeWorkspaceWorld | null> {
  return deps.computed(() => {
    const tab = deps.documentTab.value
    if (tab === null || tab.worldId === undefined) {
      return null
    }
    return deps.worlds.value.find((world) => world.id === tab.worldId) ?? null
  })
}

function createDocumentWorkspacePageColorModels (deps: {
  computed: {
    <T>(options: {
      get: () => T
      set: (value: T) => void
    }): I_computedRef<T>
  }
  documentTab: I_computedRef<I_faOpenedDocumentTab | null>
  routeDocumentId: I_computedRef<string>
  updateDocumentBackgroundColorDraft: (documentId: string, value: string) => void
  updateDocumentTextColorDraft: (documentId: string, value: string) => void
}): {
    backgroundColorModel: I_computedRef<string>
    textColorModel: I_computedRef<string>
  } {
  const textColorModel = deps.computed({
    get () {
      return deps.documentTab.value?.documentTextColorDraft ?? ''
    },
    set (value: string) {
      if (deps.routeDocumentId.value.length === 0) {
        return
      }
      deps.updateDocumentTextColorDraft(deps.routeDocumentId.value, value)
    }
  })

  const backgroundColorModel = deps.computed({
    get () {
      return deps.documentTab.value?.documentBackgroundColorDraft ?? ''
    },
    set (value: string) {
      if (deps.routeDocumentId.value.length === 0) {
        return
      }
      deps.updateDocumentBackgroundColorDraft(deps.routeDocumentId.value, value)
    }
  })

  return {
    backgroundColorModel,
    textColorModel
  }
}

export function createDocumentWorkspacePageColorPickers (
  deps: T_createDocumentWorkspacePageColorPickersDeps
): {
    backgroundColorFieldLabel: I_computedRef<string>
    backgroundColorModel: I_computedRef<string>
    documentColorPickersReadOnly: I_computedRef<boolean>
    onAppendToWorldPalette: (colorPallete: string) => void
    textColorFieldLabel: I_computedRef<string>
    textColorModel: I_computedRef<string>
    worldColorPaletteAppend: I_computedRef<I_faColorPickerPaletteAppendConfig | undefined>
    worldPickerPalette: I_computedRef<readonly string[]>
  } {
  const documentWorld = createDocumentWorkspacePageDocumentWorldComputed(deps)

  const worldPickerPalette = deps.computed(() => {
    const world = documentWorld.value
    if (world === null) {
      return []
    }
    return deps.parseFaProjectWorldColorPalleteToHexList(world.colorPallete)
  })

  const worldColorPaletteAppend = deps.computed((): I_faColorPickerPaletteAppendConfig | undefined => {
    const world = documentWorld.value
    if (world === null) {
      return undefined
    }
    return {
      mode: 'persist',
      worldColorPalette: world.colorPallete,
      worldId: world.id
    }
  })

  const documentColorPickersReadOnly = deps.computed(() => {
    const tab = deps.documentTab.value
    if (tab === null) {
      return true
    }
    return deps.resolveOpenedDocumentTabIsInPreviewMode(tab.editState)
  })

  const colorModels = createDocumentWorkspacePageColorModels(deps)

  function onAppendToWorldPalette (colorPallete: string): void {
    const world = documentWorld.value
    if (world === null) {
      return
    }
    deps.patchWorldColorPalleteInLayout(world.id, colorPallete)
  }

  const textColorFieldLabel = deps.computed(() => {
    return deps.i18n.global.t('documentWorkspacePage.textColorFieldLabel')
  })

  const backgroundColorFieldLabel = deps.computed(() => {
    return deps.i18n.global.t('documentWorkspacePage.backgroundColorFieldLabel')
  })

  const backgroundColorModel = colorModels.backgroundColorModel
  const textColorModel = colorModels.textColorModel

  return {
    backgroundColorFieldLabel,
    backgroundColorModel,
    documentColorPickersReadOnly,
    onAppendToWorldPalette,
    textColorFieldLabel,
    textColorModel,
    worldColorPaletteAppend,
    worldPickerPalette
  }
}
