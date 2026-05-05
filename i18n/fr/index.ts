import { specialCharacterFixer } from '../specialCharactersFixer'

import advancedSearchCheatSheet from './documents/advancedSearchCheatSheet.md?raw'
import advancedSearchGuide from './documents/advancedSearchGuide.md?raw'
import changeLog from '../en-US/documents/changeLog.md?raw'
import license from './documents/license.md?raw'
import tipsTricksTrivia from './documents/tipsTricksTrivia.md?raw'

import L_FantasiaMascotImage from './components/elements/FantasiaMascotImage/L_FantasiaMascotImage'
import L_helpInfo from './components/globals/AppControlMenus/L_helpInfo'
import L_project from './components/globals/AppControlMenus/L_project'
import L_tools from './components/globals/AppControlMenus/L_tools'
import L_documents from './components/globals/AppControlMenus/L_documents'
import L_GlobalLanguageSelector from './components/globals/GlobalLanguageSelector/L_GlobalLanguageSelector'
import L_GlobalWindowButtons from './components/globals/GlobalWindowButtons/L_GlobalWindowButtons'
import L_socialContactButtons from './components/other/SocialContactButtons/L_socialContactButtons'

import L_aboutFantasiaArchive from './dialogs/L_aboutFantasiaArchive'
import L_DialogActionMonitor from './dialogs/L_DialogActionMonitor'
import L_dialogKeybindSettings from './dialogs/L_dialogKeybindSettings'
import L_importExportProgramConfig from './dialogs/L_importExportProgramConfig'
import L_newProjectSettings from './dialogs/L_newProjectSettings'
import L_markdownDocument from './dialogs/L_markdownDocument'
import L_programSettings from './dialogs/L_programSettings'
import L_programStylingFloating from './floatingWindows/L_programStyling'

import L_faActionManager from './globalFunctionality/L_faActionManager'
import L_faKeybinds from './globalFunctionality/L_faKeybinds'
import L_faProgramStyling from './globalFunctionality/L_faProgramStyling'
import L_faUserSettings from './globalFunctionality/L_faUserSettings'
import L_spellChecker from './globalFunctionality/L_spellChecker'
import L_unsortedAppTexts from './globalFunctionality/L_unsortedAppTexts'

import L_mainLayout from './layouts/L_mainLayout'
import L_ErrorNotFound from './pages/L_ErrorNotFound'
import L_splashPage from './pages/L_splashPage'

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
  errorNotFound: L_ErrorNotFound,

  // PAGE - SPLASH / WELCOME
  splashPage: L_splashPage,

  // LAYOUT - MAIN
  mainLayout: L_mainLayout,

  // DIALOGS
  dialogs: {
    aboutFantasiaArchive: L_aboutFantasiaArchive,
    actionMonitor: L_DialogActionMonitor,
    importExportProgramConfig: L_importExportProgramConfig,
    keybindSettings: L_dialogKeybindSettings,
    markdownDocument: L_markdownDocument,
    newProjectSettings: L_newProjectSettings,
    programSettings: L_programSettings
  },

  // FLOATING WINDOWS (in-renderer movable / resizable surfaces)
  floatingWindows: {
    programStyling: L_programStylingFloating
  },

  // COMPONENT - GLOBAL LANGUAGE SELECTOR
  globalLanguageSelector: L_GlobalLanguageSelector,

  // COMPONENT - GLOBAL WINDOW BUTTONS
  globalWindowButtons: L_GlobalWindowButtons,

  // COMPONENT - APP CONTROL MENUS
  appControlMenus: {
    project: L_project,
    tools: L_tools,
    documents: L_documents,
    helpInfo: L_helpInfo
  },

  // COMPONENT - SOCIAL CONTACT BUTTONS
  socialContactButtons: L_socialContactButtons,

  // COMPONENT - FANTASIA MASCOT IMAGE
  fantasiaMascotImage: L_FantasiaMascotImage,

  // GLOBAL FUNCTIONALITY
  globalFunctionality: {
    faActionManager: L_faActionManager,
    faKeybinds: L_faKeybinds,
    faProgramStyling: L_faProgramStyling,
    faUserSettings: L_faUserSettings,
    spellChecker: L_spellChecker,
    unsortedAppTexts: L_unsortedAppTexts
  }
}
