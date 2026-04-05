import { specialCharacterFixer } from '../specialCharactersFixer'

import advancedSearchCheatSheet from './documents/advancedSearchCheatSheet.md?raw'
import advancedSearchGuide from './documents/advancedSearchGuide.md?raw'
import changeLog from './documents/changeLog.md?raw'
import license from './documents/license.md?raw'
import tipsTricksTrivia from './documents/tipsTricksTrivia.md?raw'

import T_helpInfo from './components/AppControlMenus/T_helpInfo'
import T_project from './components/AppControlMenus/T_project'
import T_tools from './components/AppControlMenus/T_tools'
import T_documents from './components/AppControlMenus/T_documents'

import T_GlobalWindowButtons from './components/GlobalWindowButtons/T_GlobalWindowButtons'
import T_FantasiaMascotImage from './components/FantasiaMascotImage/T_FantasiaMascotImage'
import T_socialContactButtons from './components/SocialContactButtons/T_socialContactButtons'

import T_aboutFantasiaArchive from './dialogs/T_aboutFantasiaArchive'
import T_markdownDocument from './dialogs/T_markdownDocument'
import T_programSettings from './dialogs/T_programSettings'

import T_faUserSettings from './globalFunctionality/T_faUserSettings'
import T_spellChecker from './globalFunctionality/T_spellChecker'
import T_unsortedAppTexts from './globalFunctionality/T_unsortedAppTexts'

import T_ErrorNotFound from './pages/T_ErrorNotFound'

export default {
  // GLOBAL - DOCUMENTS
  documents: {
    advancedSearchCheatSheet: specialCharacterFixer(advancedSearchCheatSheet),
    advancedSearchGuide: specialCharacterFixer(advancedSearchGuide),
    changeLog: specialCharacterFixer(changeLog),
    license: specialCharacterFixer(license),
    tipsTricksTrivia: specialCharacterFixer(tipsTricksTrivia)
  },

  // PAGE - ERROR NOT FOUND
  errorNotFound: T_ErrorNotFound,

  // DIALOGS
  dialogs: {
    aboutFantasiaArchive: T_aboutFantasiaArchive,
    markdownDocument: T_markdownDocument,
    programSettings: T_programSettings
  },

  // COMPONENT - GLOBAL WINDOW BUTTONS
  globalWindowButtons: T_GlobalWindowButtons,

  // COMPONENT - APP CONTROL MENUS
  appControlMenus: {
    project: T_project,
    tools: T_tools,
    documents: T_documents,
    helpInfo: T_helpInfo
  },

  // COMPONENT - SOCIAL CONTACT BUTTONS
  socialContactButtons: T_socialContactButtons,

  // COMPONENT - FANTASIA MASCOT IMAGE
  fantasiaMascotImage: T_FantasiaMascotImage,

  // GLOBAL FUNCTIONALITY
  globalFunctionality: {
    faUserSettings: T_faUserSettings,
    spellChecker: T_spellChecker,
    unsortedAppTexts: T_unsortedAppTexts
  }

}
