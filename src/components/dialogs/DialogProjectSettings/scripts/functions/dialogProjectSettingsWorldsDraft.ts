import type {
  I_dialogProjectSettingsSaveValidationError,
  I_dialogProjectSettingsSaveValidationTooltipContent,
  I_dialogProjectSettingsWorldDraft
} from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_faProjectWorldSnapshotItem } from 'app/types/I_faProjectWorldDomain'

const HEX_COLOR_SEGMENT = /^#[0-9a-fA-F]{6}$/

/**
 * True when a draft color_pallete string repeats a #RRGGBB value (case-insensitive).
 */
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

/**
 * True when a world color_pallete draft has duplicate #RRGGBB entries.
 */
export function isDialogProjectSettingsWorldColorPalleteInvalid (
  colorPallete: string
): boolean {
  return hasDialogProjectSettingsColorPalleteCaseInsensitiveDuplicates(colorPallete)
}

/**
 * Resolves the quoted world name used in save-validation messages.
 */
export function resolveDialogProjectSettingsWorldSaveErrorDisplayName (
  displayName: string,
  defaultNewWorldName: string
): string {
  const trimmed = displayName.trim()
  return trimmed.length > 0 ? trimmed : defaultNewWorldName
}

/**
 * Collects ordered save-blocking validation errors for the Project Settings draft.
 */
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
    if (isDialogProjectSettingsWorldNameInvalid(world.displayName)) {
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
  }
  return errors
}

/**
 * Builds the multi-line save-errors tooltip body (intro plus dashed bullet lines).
 */
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

/**
 * Normalizes a draft color_pallete string: unique #RRGGBB segments, uppercase, semicolon-separated.
 */
function normalizeDialogProjectSettingsColorPallete (colorPallete: string): string {
  const trimmed = colorPallete.trim()
  if (trimmed.length === 0) {
    return ''
  }
  const seen = new Set<string>()
  const normalized: string[] = []
  for (const segment of trimmed.split(';')) {
    const part = segment.trim()
    if (part.length === 0) {
      continue
    }
    if (!HEX_COLOR_SEGMENT.test(part)) {
      continue
    }
    const upper = part.toUpperCase()
    const key = upper.toLowerCase()
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    normalized.push(upper)
  }
  return normalized.join(';')
}

/**
 * True when the trimmed project name is empty.
 */
export function isDialogProjectSettingsProjectNameInvalid (projectName: string): boolean {
  return projectName.trim().length === 0
}

/**
 * True when any world row has an empty trimmed display name.
 */
export function hasDialogProjectSettingsWorldNameValidationError (
  worlds: I_dialogProjectSettingsWorldDraft[] | null
): boolean {
  if (worlds === null) {
    return true
  }
  return worlds.some((world) => world.displayName.trim().length === 0)
}

/**
 * True when a world row tab should use validation error styling.
 */
export function isDialogProjectSettingsWorldTabValidationError (
  world: I_dialogProjectSettingsWorldDraft
): boolean {
  return isDialogProjectSettingsWorldNameInvalid(world.displayName) ||
    isDialogProjectSettingsWorldColorPalleteInvalid(world.colorPallete)
}

/**
 * True when a specific world name field should show error styling.
 */
export function isDialogProjectSettingsWorldNameInvalid (displayName: string): boolean {
  return displayName.trim().length === 0
}

/**
 * True when any world row has a duplicate #RRGGBB entry in color_pallete (case-insensitive).
 */
export function hasDialogProjectSettingsWorldColorPalleteValidationError (
  worlds: I_dialogProjectSettingsWorldDraft[] | null
): boolean {
  if (worlds === null) {
    return true
  }
  return worlds.some((world) => isDialogProjectSettingsWorldColorPalleteInvalid(world.colorPallete))
}

/**
 * True when Save settings should stay disabled for the full dialog draft.
 */
export function isDialogProjectSettingsDialogSaveDisabled (
  projectName: string,
  worlds: I_dialogProjectSettingsWorldDraft[] | null
): boolean {
  return isDialogProjectSettingsProjectNameInvalid(projectName) ||
    hasDialogProjectSettingsWorldNameValidationError(worlds) ||
    hasDialogProjectSettingsWorldColorPalleteValidationError(worlds)
}

/**
 * Maps dialog draft rows to the IPC snapshot payload.
 */
export function mapDialogProjectSettingsWorldsToSnapshot (
  worlds: I_dialogProjectSettingsWorldDraft[]
): I_faProjectWorldSnapshotItem[] {
  return worlds.map((world) => {
    const trimmedColor = world.color.trim()
    const item: I_faProjectWorldSnapshotItem = {
      displayName: world.displayName.trim(),
      id: world.id
    }
    if (trimmedColor.length > 0) {
      item.color = trimmedColor
    }
    const normalizedPallete = normalizeDialogProjectSettingsColorPallete(world.colorPallete)
    if (normalizedPallete.length > 0) {
      item.colorPallete = normalizedPallete
    }
    return item
  })
}

/**
 * Appends a new draft world row with a client-generated id at the bottom of the list.
 */
export function appendDialogProjectSettingsWorldDraft (
  worlds: I_dialogProjectSettingsWorldDraft[],
  defaultDisplayName: string
): I_dialogProjectSettingsWorldDraft[] {
  const id = crypto.randomUUID()
  return [
    ...worlds,
    {
      color: '',
      colorPallete: '',
      displayName: defaultDisplayName,
      documentCount: 0,
      id
    }
  ]
}

/**
 * True when the remove control must stay disabled for this row.
 */
export function isDialogProjectSettingsWorldRemoveDisabled (
  worlds: I_dialogProjectSettingsWorldDraft[],
  world: I_dialogProjectSettingsWorldDraft
): boolean {
  if (worlds.length <= 1) {
    return true
  }
  return world.documentCount > 0
}
