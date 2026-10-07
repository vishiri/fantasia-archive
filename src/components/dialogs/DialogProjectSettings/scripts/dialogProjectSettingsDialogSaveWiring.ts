import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_faProjectDocumentTemplateSnapshotItem } from 'app/types/I_faProjectDocumentTemplateDomain'
import type { I_faProjectWorldSnapshotItem } from 'app/types/I_faProjectWorldDomain'
import type { Ref } from 'app/types/I_vueCompositionRefs'

import {
  hasAnyDialogProjectSettingsWorldTemplatePlacement,
  resolveHideHierarchyTreeAfterEmptyWorldTemplateGate
} from 'app/src/scripts/projectWorlds/functions/faProjectWorldTemplatePlacementHideHierarchyTree'
import { areFaJsonSnapshotsEqual } from 'app/src/scripts/_utilities/functions/faJsonSnapshotsEqual'
import {
  applyDialogProjectSettingsSavedBaselines,
  cloneDialogProjectSettingsDraftsForSave
} from './dialogProjectSettingsDialogBaselineWiring'
import { mapDialogProjectSettingsDocumentTemplatesToSnapshot } from './dialogProjectSettingsDocumentTemplatesDraft'
import { isDialogProjectSettingsFullDialogSaveDisabled } from './dialogProjectSettingsDialogSaveValidation'
import { mapDialogProjectSettingsWorldsToSnapshot } from './dialogProjectSettingsWorldsSnapshotDraft'

let dialogProjectSettingsSaveTail: Promise<void> | undefined

function clearDialogProjectSettingsSaveTail (settled: Promise<void>): void {
  if (dialogProjectSettingsSaveTail === settled) {
    dialogProjectSettingsSaveTail = undefined
  }
}

async function persistDialogProjectSettingsDraftNow (deps: {
  patchHideHierarchyTreeSilently: (hideHierarchyTree: boolean) => Promise<void>
  runFaActionAwait: (
    id: 'saveProjectSettings',
    payload: {
      documentTemplates?: I_faProjectDocumentTemplateSnapshotItem[]
      settings: { projectName: string }
      worlds?: I_faProjectWorldSnapshotItem[]
    }
  ) => Promise<boolean>
}, params: {
  baselineDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  baselineSettings: Ref<I_faProjectSettingsRoot | null>
  baselineWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
  hadWorldTemplatePlacementsAtDialogOpen: Ref<boolean>
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localSettings: Ref<I_faProjectSettingsRoot | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
}): Promise<boolean> {
  const {
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    hadWorldTemplatePlacementsAtDialogOpen,
    localDocumentTemplates,
    localSettings,
    localWorlds
  } = params
  const savedDraft = cloneDialogProjectSettingsDraftsForSave({
    localDocumentTemplates,
    localSettings,
    localWorlds
  })
  if (savedDraft === null) {
    return false
  }
  const hadPlacementsBeforeDialogOpen = hadWorldTemplatePlacementsAtDialogOpen.value
  const trimmedName = savedDraft.settings.projectName.trim()
  if (
    isDialogProjectSettingsFullDialogSaveDisabled(
      trimmedName,
      savedDraft.worlds,
      savedDraft.documentTemplates
    )
  ) {
    return false
  }
  const worldsSnapshot = mapDialogProjectSettingsWorldsToSnapshot(savedDraft.worlds)
  const documentTemplatesSnapshot = mapDialogProjectSettingsDocumentTemplatesToSnapshot(
    savedDraft.documentTemplates
  )
  const saved = await deps.runFaActionAwait('saveProjectSettings', {
    documentTemplates: documentTemplatesSnapshot,
    settings: {
      projectName: trimmedName
    },
    worlds: worldsSnapshot
  })
  if (!saved) {
    return false
  }
  const nextHideHierarchyTree = resolveHideHierarchyTreeAfterEmptyWorldTemplateGate({
    hadPlacementsBeforeDialogOpen,
    hasPlacementsAfterSave: hasAnyDialogProjectSettingsWorldTemplatePlacement(savedDraft.worlds)
  })
  if (nextHideHierarchyTree !== null) {
    await deps.patchHideHierarchyTreeSilently(nextHideHierarchyTree)
  }
  applyDialogProjectSettingsSavedBaselines({
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    savedDocumentTemplates: savedDraft.documentTemplates,
    savedSettings: savedDraft.settings,
    savedWorlds: savedDraft.worlds
  })
  return true
}

export async function persistDialogProjectSettingsDraft (
  deps: Parameters<typeof persistDialogProjectSettingsDraftNow>[0],
  params: Parameters<typeof persistDialogProjectSettingsDraftNow>[1]
): Promise<boolean> {
  const previous = dialogProjectSettingsSaveTail
  const run = previous === undefined
    ? persistDialogProjectSettingsDraftNow(deps, params)
    : previous.then(() => persistDialogProjectSettingsDraftNow(deps, params))
  const settled = run.then(() => {
    clearDialogProjectSettingsSaveTail(settled)
  }, () => {
    clearDialogProjectSettingsSaveTail(settled)
  })
  dialogProjectSettingsSaveTail = settled
  return await run
}

export async function saveDialogProjectSettingsDraftWithoutClosing (
  deps: Parameters<typeof persistDialogProjectSettingsDraft>[0],
  params: Parameters<typeof persistDialogProjectSettingsDraft>[1]
): Promise<void> {
  await persistDialogProjectSettingsDraft(deps, params)
}

export async function saveDialogProjectSettingsDraftAndClose (deps: {
  patchHideHierarchyTreeSilently: (hideHierarchyTree: boolean) => Promise<void>
  runFaActionAwait: (
    id: 'saveProjectSettings',
    payload: {
      documentTemplates?: I_faProjectDocumentTemplateSnapshotItem[]
      settings: { projectName: string }
      worlds?: I_faProjectWorldSnapshotItem[]
    }
  ) => Promise<boolean>
}, params: {
  baselineDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  baselineSettings: Ref<I_faProjectSettingsRoot | null>
  baselineWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
  dialogModel: Ref<boolean>
  hadWorldTemplatePlacementsAtDialogOpen: Ref<boolean>
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localSettings: Ref<I_faProjectSettingsRoot | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
}): Promise<void> {
  const {
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    dialogModel,
    hadWorldTemplatePlacementsAtDialogOpen,
    localDocumentTemplates,
    localSettings,
    localWorlds
  } = params
  const saved = await persistDialogProjectSettingsDraft(deps, {
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    hadWorldTemplatePlacementsAtDialogOpen,
    localDocumentTemplates,
    localSettings,
    localWorlds
  })
  if (!saved) {
    return
  }
  const draftsStillMatchSave = areFaJsonSnapshotsEqual(localSettings.value, baselineSettings.value) &&
    areFaJsonSnapshotsEqual(localWorlds.value, baselineWorlds.value) &&
    areFaJsonSnapshotsEqual(localDocumentTemplates.value, baselineDocumentTemplates.value)
  if (!draftsStillMatchSave) {
    return
  }
  dialogModel.value = false
}
