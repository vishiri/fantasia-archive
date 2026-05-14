import { specialCharacterFixer } from '../specialCharactersFixer'

import advancedSearchCheatSheet from '../en-US/documents/advancedSearchCheatSheet.md?raw'
import advancedSearchGuide from '../en-US/documents/advancedSearchGuide.md?raw'
import changeLog from '../en-US/documents/changeLog.md?raw'
import license from '../en-US/documents/license.md?raw'
import tipsTricksTrivia from '../en-US/documents/tipsTricksTrivia.md?raw'

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
import L_importExportAppConfig from './dialogs/L_importExportAppConfig'
import L_newProject from './dialogs/L_newProject'
import L_markdownDocument from './dialogs/L_markdownDocument'
import L_appSettings from '../en-US/dialogs/L_appSettings'
import L_appNoteboard from './floatingWindows/L_appNoteboard'
import L_projectNoteboard from './floatingWindows/L_projectNoteboard'
import L_appStylingFloating from './floatingWindows/L_appStyling'

import L_faActionManager from './globalFunctionality/L_faActionManager'
import L_faKeybinds from './globalFunctionality/L_faKeybinds'
import L_faAppNoteboard from './globalFunctionality/L_faAppNoteboard'
import L_faProjectNoteboard from './globalFunctionality/L_faProjectNoteboard'
import L_faAppStyling from './globalFunctionality/L_faAppStyling'
import L_faProjectSession from './globalFunctionality/L_faProjectSession'
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
    importExportAppConfig: L_importExportAppConfig,
    keybindSettings: L_dialogKeybindSettings,
    markdownDocument: L_markdownDocument,
    newProject: L_newProject,
    appSettings: L_appSettings
  },

  // FLOATING WINDOWS (in-renderer movable / resizable surfaces)
  floatingWindows: {
    appNoteboard: L_appNoteboard,
    appStyling: L_appStylingFloating,
    projectNoteboard: L_projectNoteboard
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
    faAppNoteboard: L_faAppNoteboard,
    faProjectNoteboard: L_faProjectNoteboard,
    faAppStyling: L_faAppStyling,
    faProjectSession: L_faProjectSession,
    faUserSettings: L_faUserSettings,
    spellChecker: L_spellChecker,
    unsortedAppTexts: L_unsortedAppTexts
  }
}
