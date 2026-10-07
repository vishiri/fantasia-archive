import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { Ref } from 'app/types/I_vueCompositionRefs'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { hasAnyDialogProjectSettingsWorldTemplatePlacement } from 'app/src/scripts/projectWorlds/functions/faProjectWorldTemplatePlacementHideHierarchyTree'
import { captureDialogProjectSettingsBaselines } from './dialogProjectSettingsDialogBaselineWiring'
import { syncDialogProjectSettingsAllWorldTemplateLayoutLocalizedPlacementLabels } from './dialogProjectSettingsDocumentTemplateLayoutTitleSyncWiring'

function dialogProjectSettingsHydrateDraftsChanged (input: {
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localSettings: Ref<I_faProjectSettingsRoot | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
  settingsAtStart: string
  templatesAtStart: string
  worldsAtStart: string
}): boolean {
  const settingsNow = JSON.stringify(input.localSettings.value)
  const worldsNow = JSON.stringify(input.localWorlds.value)
  const templatesNow = JSON.stringify(input.localDocumentTemplates.value)
  return settingsNow !== input.settingsAtStart ||
    worldsNow !== input.worldsAtStart ||
    templatesNow !== input.templatesAtStart
}

export async function hydrateDialogProjectSettingsDrafts (deps: {
  faProjectDocumentTemplatesFetchFreshForDialog: () => Promise<I_dialogProjectSettingsDocumentTemplateDraft[]>
  faProjectSettingsFetchFreshForDialog: () => Promise<I_faProjectSettingsRoot>
  faProjectWorldsFetchFreshForDialog: () => Promise<I_dialogProjectSettingsWorldDraft[]>
  getCurrentLanguageCode: () => T_faUserSettingsLanguageCode
  isStillCurrent?: () => boolean
  readProjectContentEpoch?: () => number
}, params: {
  baselineDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  baselineSettings: Ref<I_faProjectSettingsRoot | null>
  baselineWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
  hadWorldTemplatePlacementsAtDialogOpen: Ref<boolean>
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localSettings: Ref<I_faProjectSettingsRoot | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
  props: I_dialogProjectSettingsProps
}): Promise<void> {
  const {
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    hadWorldTemplatePlacementsAtDialogOpen,
    localDocumentTemplates,
    localSettings,
    localWorlds,
    props
  } = params
  const settingsAtStart = JSON.stringify(localSettings.value)
  const worldsAtStart = JSON.stringify(localWorlds.value)
  const templatesAtStart = JSON.stringify(localDocumentTemplates.value)
  const epochAtStart = deps.readProjectContentEpoch?.()
  let nextSettings: I_faProjectSettingsRoot
  if (props.directSettingsSnapshot !== undefined) {
    nextSettings = { ...props.directSettingsSnapshot }
  } else {
    const snapshot = await deps.faProjectSettingsFetchFreshForDialog()
    nextSettings = { ...snapshot }
  }
  let nextWorlds: I_dialogProjectSettingsWorldDraft[]
  if (props.directWorldsSnapshot !== undefined) {
    nextWorlds = props.directWorldsSnapshot.map((world) => ({ ...world }))
  } else {
    const worlds = await deps.faProjectWorldsFetchFreshForDialog()
    nextWorlds = worlds.map((world) => ({ ...world }))
  }
  let nextTemplates: I_dialogProjectSettingsDocumentTemplateDraft[]
  if (props.directDocumentTemplatesSnapshot !== undefined) {
    nextTemplates = props.directDocumentTemplatesSnapshot.map((template) => ({ ...template }))
  } else {
    const templates = await deps.faProjectDocumentTemplatesFetchFreshForDialog()
    nextTemplates = templates.map((template) => ({ ...template }))
  }
  const epochNow = deps.readProjectContentEpoch?.()
  if (epochNow !== epochAtStart) {
    return
  }
  if (deps.isStillCurrent !== undefined && !deps.isStillCurrent()) {
    return
  }
  const draftsChanged = dialogProjectSettingsHydrateDraftsChanged({
    localDocumentTemplates,
    localSettings,
    localWorlds,
    settingsAtStart,
    templatesAtStart,
    worldsAtStart
  })
  if (draftsChanged) {
    return
  }
  localSettings.value = nextSettings
  localWorlds.value = nextWorlds
  localDocumentTemplates.value = nextTemplates
  syncDialogProjectSettingsAllWorldTemplateLayoutLocalizedPlacementLabels({
    getCurrentLanguageCode: deps.getCurrentLanguageCode,
    localDocumentTemplates,
    localWorlds
  })
  hadWorldTemplatePlacementsAtDialogOpen.value = localWorlds.value === null
    ? false
    : hasAnyDialogProjectSettingsWorldTemplatePlacement(localWorlds.value)
  captureDialogProjectSettingsBaselines({
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    localDocumentTemplates,
    localSettings,
    localWorlds
  })
}
