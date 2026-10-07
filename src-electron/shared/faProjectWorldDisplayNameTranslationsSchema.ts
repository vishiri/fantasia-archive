import { FA_PROJECT_WORLD_DISPLAY_NAME_TRANSLATIONS_JSON_MAX_LENGTH } from 'app/src-electron/mainScripts/projectManagement/functions/faProjectDbSchemaDdl'
import {
  hasFaProjectWorldDisplayNameTranslation,
  normalizeFaProjectWorldDisplayNameTranslations
} from 'app/src/scripts/projectWorlds/faProjectWorldDisplayName_manager'
import type { I_faProjectWorldDisplayNameTranslations } from 'app/types/I_faProjectWorldDisplayNameTranslations'

import { FA_PROJECT_NAME_MAX_LEN } from './faProjectConstants'
import { createFaProjectLocaleTranslationsJsonApi } from './faProjectLocaleTranslationsJsonApi'

const worldDisplayNameTranslationsApi = createFaProjectLocaleTranslationsJsonApi<I_faProjectWorldDisplayNameTranslations>({
  valueMaxLength: FA_PROJECT_NAME_MAX_LEN,
  jsonMaxLength: FA_PROJECT_WORLD_DISPLAY_NAME_TRANSLATIONS_JSON_MAX_LENGTH,
  storageLimitMessage: 'World display name translations exceed storage limit',
  normalize: normalizeFaProjectWorldDisplayNameTranslations,
  hasTranslation: hasFaProjectWorldDisplayNameTranslation,
  requiredTranslationMessage: 'At least one world display name translation is required'
})

export const parseFaProjectWorldDisplayNameTranslationsJson = worldDisplayNameTranslationsApi.parseJson

export const serializeFaProjectWorldDisplayNameTranslationsJson = worldDisplayNameTranslationsApi.serializeJson

export const faProjectWorldDisplayNameTranslationsSnapshotSchema =
  worldDisplayNameTranslationsApi.snapshotSchema

export const parseFaProjectWorldDisplayNameTranslationsSnapshot =
  worldDisplayNameTranslationsApi.parseSnapshot
