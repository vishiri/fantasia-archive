import { parseFaProjectDocumentTemplateTitleTranslationsJson } from 'app/src-electron/shared/faProjectDocumentTemplateTitleTranslationsSchema'
import { parseFaProjectDocumentTemplateWorldAppendixTranslationsJson } from 'app/src-electron/shared/faProjectDocumentTemplateWorldAppendixTranslationsSchema'
import { parseFaProjectWorldDisplayNameTranslationsJson } from 'app/src-electron/shared/faProjectWorldDisplayNameTranslationsSchema'

import {
  createMapFaProjectDocumentTemplateRow,
  createMapFaProjectWorldRow
} from './functions/faProjectContentRowMap'

export {
  mapFaProjectDocumentRow,
  mapFaProjectNamedEntityRow,
  mapFaProjectWorldTemplateGroupRow,
  mapFaProjectWorldTemplatePlacementForProjectSettingsRow
} from './functions/faProjectContentRowMap'

export const mapFaProjectDocumentTemplateRow = createMapFaProjectDocumentTemplateRow({
  parseTitleTranslationsJson: parseFaProjectDocumentTemplateTitleTranslationsJson,
  parseWorldAppendixTranslationsJson: parseFaProjectDocumentTemplateWorldAppendixTranslationsJson
})

export const mapFaProjectWorldRow = createMapFaProjectWorldRow({
  parseDisplayNameTranslationsJson: parseFaProjectWorldDisplayNameTranslationsJson
})
