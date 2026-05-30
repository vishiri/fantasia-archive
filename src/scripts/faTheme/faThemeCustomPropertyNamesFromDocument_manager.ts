import { createFaThemeCustomPropertyNamesFromDocument } from './functions/createFaThemeCustomPropertyNamesFromDocument'
import {
  faThemeFromThrowable,
  getFaThemeDocumentStyleSheets
} from './faThemeCustomPropertyNamesFromDocumentWiring'

const faThemeCustomPropertyNamesFromDocumentApi = createFaThemeCustomPropertyNamesFromDocument({
  fromThrowable: faThemeFromThrowable,
  getDocumentStyleSheets: getFaThemeDocumentStyleSheets
})

export const collectFaColorCustomPropertyNamesFromDocument =
  faThemeCustomPropertyNamesFromDocumentApi.collectFaColorCustomPropertyNamesFromDocument
