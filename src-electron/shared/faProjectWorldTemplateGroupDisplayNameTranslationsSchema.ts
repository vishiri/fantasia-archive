import { FA_PROJECT_WORLD_TEMPLATE_GROUP_DISPLAY_NAME_TRANSLATIONS_JSON_MAX_LENGTH } from 'app/src-electron/mainScripts/projectManagement/functions/faProjectDbSchemaDdl'
import {
  hasFaProjectWorldTemplateGroupDisplayNameTranslation,
  normalizeFaProjectWorldTemplateGroupDisplayNameTranslations
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplateGroupDisplayName_manager'
import type { I_faProjectWorldTemplateGroupDisplayNameTranslations } from 'app/types/I_faProjectWorldTemplateGroupDisplayNameTranslations'

import { FA_PROJECT_NAME_MAX_LEN } from './faProjectConstants'
import { createFaProjectLocaleTranslationsJsonApi } from './faProjectLocaleTranslationsJsonApi'

const groupDisplayNameTranslationsApi = createFaProjectLocaleTranslationsJsonApi<I_faProjectWorldTemplateGroupDisplayNameTranslations>({
  valueMaxLength: FA_PROJECT_NAME_MAX_LEN,
  jsonMaxLength: FA_PROJECT_WORLD_TEMPLATE_GROUP_DISPLAY_NAME_TRANSLATIONS_JSON_MAX_LENGTH,
  storageLimitMessage: 'World template group display name translations exceed storage limit',
  normalize: normalizeFaProjectWorldTemplateGroupDisplayNameTranslations,
  hasTranslation: hasFaProjectWorldTemplateGroupDisplayNameTranslation,
  requiredTranslationMessage: 'At least one world template group display name translation is required'
})

export const parseFaProjectWorldTemplateGroupDisplayNameTranslationsJson =
  groupDisplayNameTranslationsApi.parseJson

export const serializeFaProjectWorldTemplateGroupDisplayNameTranslationsJson =
  groupDisplayNameTranslationsApi.serializeJson

export const faProjectWorldTemplateGroupDisplayNameTranslationsSnapshotSchema =
  groupDisplayNameTranslationsApi.snapshotSchema

export const parseFaProjectWorldTemplateGroupDisplayNameTranslationsSnapshot =
  groupDisplayNameTranslationsApi.parseSnapshot
