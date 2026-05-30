import faThemeFromVite from 'app/src/css/fa-theme.scss?raw'

import { collectFaColorCustomPropertyNamesFromDocument } from './faThemeCustomPropertyNamesFromDocument_manager'
import { createFaThemeCustomPropertyNames } from './functions/createFaThemeCustomPropertyNames'

const faThemeCustomPropertyNamesApi = createFaThemeCustomPropertyNames({
  collectFaColorCustomPropertyNamesFromDocument,
  faThemeFromVite,
  hasDocument: () => typeof document !== 'undefined'
})

export const getFaColorCustomPropertyNamesForHelpPanel =
  faThemeCustomPropertyNamesApi.getFaColorCustomPropertyNamesForHelpPanel

export const parseFaColorCustomPropertyNamesFromThemeScss =
  faThemeCustomPropertyNamesApi.parseFaColorCustomPropertyNamesFromThemeScss
