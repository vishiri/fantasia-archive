import type {
  I_dialogProjectSettingsSaveValidationError,
  I_dialogProjectSettingsSaveValidationTooltipContent,
  I_dialogProjectSettingsWorldDraft,
  I_dialogProjectSettingsWorldTemplateLayoutDraft
} from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'

import type { I_faProjectWorldDisplayNameTranslations } from 'app/types/I_faProjectWorldDisplayNameTranslations'

const HEX_COLOR_SEGMENT = /^#[0-9a-fA-F]{6}$/

function hasDialogProjectSettingsColorPalleteCaseInsensitiveDuplicates (
  colorPallete: string
): boolean {
  const trimmed = colorPallete.trim()
  if (trimmed.length === 0) {
    return false
  }
  const seen = new Set<string>()
  for (const segment of trimmed.split(';')) {
    const part = segment.trim()
    if (part.length === 0) {
      continue
    }
    if (!HEX_COLOR_SEGMENT.test(part)) {
      continue
    }
    const key = part.toLowerCase()
    if (seen.has(key)) {
      return true
    }
    seen.add(key)
  }
  return false
}

function worldTemplateLayoutHasDuplicateDocumentTemplatePlacements (
  templateLayout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): boolean {
  const seen = new Set<string>()
  for (const placement of templateLayout.placements) {
    const templateId = placement.documentTemplateId
    if (templateId.length === 0) {
      continue
    }
    if (seen.has(templateId)) {
      return true
    }
    seen.add(templateId)
  }
  return false
}

function worldTemplateLayoutHasDocumentTemplatePlacementValidationError (
  templateLayout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[] | null
): boolean {
  if (documentTemplates === null) {
    return false
  }
  for (const template of documentTemplates) {
    if (Object.values(template.titleTranslations).some((value) => (value ?? '').trim().length > 0)) {
      continue
    }
    for (const placement of templateLayout.placements) {
      if (placement.documentTemplateId === template.id) {
        return true
      }
    }
  }
  return false
}

function worldTemplateLayoutHasValidationError (
  templateLayout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): boolean {
  if (templateLayout.groups.some((group) => group.displayName.trim().length === 0)) {
    return true
  }
  return worldTemplateLayoutHasDuplicateDocumentTemplatePlacements(templateLayout)
}

function dialogProjectSettingsWorldNameTranslationsHasValue (
  displayNameTranslations: I_faProjectWorldDisplayNameTranslations
): boolean {
  for (const value of Object.values(displayNameTranslations)) {
    if ((value ?? '').trim().length > 0) {
      return true
    }
  }
  return false
}

export function isDialogProjectSettingsWorldNameInvalid (
  displayNameTranslations: I_faProjectWorldDisplayNameTranslations
): boolean {
  return !dialogProjectSettingsWorldNameTranslationsHasValue(displayNameTranslations)
}

export function isDialogProjectSettingsWorldColorPalleteInvalid (
  colorPallete: string
): boolean {
  return hasDialogProjectSettingsColorPalleteCaseInsensitiveDuplicates(colorPallete)
}

export function collectDialogProjectSettingsSaveValidationErrors (
  projectName: string,
  worlds: I_dialogProjectSettingsWorldDraft[] | null
): I_dialogProjectSettingsSaveValidationError[] {
  const errors: I_dialogProjectSettingsSaveValidationError[] = []
  if (isDialogProjectSettingsProjectNameInvalid(projectName)) {
    errors.push({
      kind: 'projectNameRequired'
    })
  }
  if (worlds === null) {
    return errors
  }
  for (let index = 0; index < worlds.length; index += 1) {
    const world = worlds[index]
    if (world === undefined) {
      continue
    }
    const worldIndexOneBased = index + 1
    if (isDialogProjectSettingsWorldNameInvalid(world.displayNameTranslations)) {
      errors.push({
        kind: 'worldNameRequired',
        worldIndexOneBased
      })
    }
    if (isDialogProjectSettingsWorldColorPalleteInvalid(world.colorPallete)) {
      errors.push({
        kind: 'duplicatePaletteColors',
        worldIndexOneBased
      })
    }
    if (world.templateLayout.groups.some((group) => group.displayName.trim().length === 0)) {
      errors.push({
        kind: 'worldTemplateGroupNameRequired',
        worldIndexOneBased
      })
    }
    if (worldTemplateLayoutHasDuplicateDocumentTemplatePlacements(world.templateLayout)) {
      errors.push({
        kind: 'worldTemplateDuplicateDocumentTemplate',
        worldIndexOneBased
      })
    }
  }
  return errors
}

export function buildDialogProjectSettingsSaveValidationTooltip (
  errors: readonly I_dialogProjectSettingsSaveValidationError[],
  introLine: string,
  resolveErrorMessage: (error: I_dialogProjectSettingsSaveValidationError) => string
): I_dialogProjectSettingsSaveValidationTooltipContent {
  if (errors.length === 0) {
    return {
      bullets: [],
      flatText: '',
      intro: ''
    }
  }
  const bullets = errors.map((error) => {
    return `- ${resolveErrorMessage(error)}`
  })
  const flatText = `${introLine}\n${bullets.join('\n')}`
  return {
    bullets,
    flatText,
    intro: introLine
  }
}

export function isDialogProjectSettingsProjectNameInvalid (projectName: string): boolean {
  return projectName.trim().length === 0
}

export function hasDialogProjectSettingsWorldNameValidationError (
  worlds: I_dialogProjectSettingsWorldDraft[] | null
): boolean {
  if (worlds === null) {
    return true
  }
  return worlds.some((world) => isDialogProjectSettingsWorldNameInvalid(world.displayNameTranslations))
}

export function isDialogProjectSettingsWorldTabValidationError (
  world: I_dialogProjectSettingsWorldDraft,
  documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[] | null = null
): boolean {
  return isDialogProjectSettingsWorldNameInvalid(world.displayNameTranslations) ||
    isDialogProjectSettingsWorldColorPalleteInvalid(world.colorPallete) ||
    worldTemplateLayoutHasValidationError(world.templateLayout) ||
    worldTemplateLayoutHasDocumentTemplatePlacementValidationError(
      world.templateLayout,
      documentTemplates
    )
}
export function hasDialogProjectSettingsWorldTemplateLayoutValidationError (
  worlds: I_dialogProjectSettingsWorldDraft[] | null,
  documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[] | null = null
): boolean {
  if (worlds === null) {
    return true
  }
  return worlds.some((world) => {
    return worldTemplateLayoutHasValidationError(world.templateLayout) ||
      worldTemplateLayoutHasDocumentTemplatePlacementValidationError(
        world.templateLayout,
        documentTemplates
      )
  })
}

export function hasDialogProjectSettingsWorldColorPalleteValidationError (
  worlds: I_dialogProjectSettingsWorldDraft[] | null
): boolean {
  if (worlds === null) {
    return true
  }
  return worlds.some((world) => isDialogProjectSettingsWorldColorPalleteInvalid(world.colorPallete))
}

export function isDialogProjectSettingsDialogSaveDisabled (
  projectName: string,
  worlds: I_dialogProjectSettingsWorldDraft[] | null
): boolean {
  if (isDialogProjectSettingsProjectNameInvalid(projectName) ||
    hasDialogProjectSettingsWorldNameValidationError(worlds) ||
    hasDialogProjectSettingsWorldColorPalleteValidationError(worlds)) {
    return true
  }
  return hasDialogProjectSettingsWorldTemplateLayoutValidationError(worlds)
}
