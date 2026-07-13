import { specialCharacterFixer } from '../specialCharactersFixer'

import advancedSearchCheatSheet from './documents/advancedSearchCheatSheet.md?raw'
import advancedSearchGuide from './documents/advancedSearchGuide.md?raw'
import changeLog from './documents/changeLog.md?raw'
import license from '../en-US/documents/license.md?raw'
import tipsTricksTrivia from './documents/tipsTricksTrivia.md?raw'

import L_FantasiaMascotImage from './components/elements/FantasiaMascotImage/L_FantasiaMascotImage'
import L_FaColorPickerInput from './components/elements/FaColorPickerInput/L_FaColorPickerInput'
import L_FaIconPickerInput from './components/elements/FaIconPickerInput/L_FaIconPickerInput'
import L_FaLocaleTranslationsInput from './components/elements/FaLocaleTranslationsInput/L_FaLocaleTranslationsInput'
import L_helpInfo from './components/globals/AppControlMenus/L_helpInfo'
import L_project from './components/globals/AppControlMenus/L_project'
import L_tools from './components/globals/AppControlMenus/L_tools'
import L_documents from './components/globals/AppControlMenus/L_documents'

import L_GlobalLanguageSelector from './components/globals/GlobalLanguageSelector/L_GlobalLanguageSelector'
import L_GlobalWindowButtons from './components/globals/GlobalWindowButtons/L_GlobalWindowButtons'
import L_socialContactButtons from './components/other/SocialContactButtons/L_socialContactButtons'

import L_aboutFantasiaArchive from './dialogs/L_aboutFantasiaArchive'
import L_DialogActionMonitor from './dialogs/L_DialogActionMonitor'
import L_markdownDocument from './dialogs/L_markdownDocument'
import L_newProject from './dialogs/L_newProject'
import L_dialogKeybindSettings from './dialogs/L_dialogKeybindSettings'
import L_importExportAppConfig from './dialogs/L_importExportAppConfig'
import L_appSettings from './dialogs/L_appSettings'
import L_projectSettings from './dialogs/L_projectSettings'
import L_discardOpenedDocumentTab from './components/dialogs/L_discardOpenedDocumentTab'
import L_deleteOpenedDocument from '../en-US/components/dialogs/L_deleteOpenedDocument'
import L_appNoteboard from './floatingWindows/L_appNoteboard'
import L_projectNoteboard from './floatingWindows/L_projectNoteboard'
import L_appStylingFloating from './floatingWindows/L_appStyling'
import L_projectStylingFloating from './floatingWindows/L_projectStyling'

import L_faActionManager from './globalFunctionality/L_faActionManager'
import L_faKeybinds from './globalFunctionality/L_faKeybinds'
import L_faAppNoteboard from './globalFunctionality/L_faAppNoteboard'
import L_faProjectNoteboard from './globalFunctionality/L_faProjectNoteboard'
import L_faAppStyling from './globalFunctionality/L_faAppStyling'
import L_faProjectStyling from './globalFunctionality/L_faProjectStyling'
import L_faProjectSession from './globalFunctionality/L_faProjectSession'
import L_faUserSettings from './globalFunctionality/L_faUserSettings'
import L_faOpenedDocuments from '../en-US/globalFunctionality/L_faOpenedDocuments'
import L_faProjectSettings from './globalFunctionality/L_faProjectSettings'
import L_spellChecker from './globalFunctionality/L_spellChecker'
import L_unsortedAppTexts from './globalFunctionality/L_unsortedAppTexts'

import L_mainLayout from './layouts/L_mainLayout'
import L_ErrorNotFound from './pages/L_ErrorNotFound'
import L_projectHierarchyTree from './components/projectUI/ProjectHierarchyTree/L_projectHierarchyTree'
import L_projectHierarchyTreeSearch from './components/projectUI/ProjectHierarchyTreeSearch/L_projectHierarchyTreeSearch'
import L_projectOverview from './components/projectUI/ProjectOverview/L_projectOverview'
import L_projectDocumentControlBar from './components/projectUI/L_projectDocumentControlBar'
import L_splashPage from './pages/L_splashPage'
import L_documentWorkspacePage from './pages/L_documentWorkspacePage'

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

  // PAGE - DOCUMENT WORKSPACE
  documentWorkspacePage: L_documentWorkspacePage,

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
    appSettings: L_appSettings,
    projectSettings: L_projectSettings,
    discardOpenedDocumentTab: L_discardOpenedDocumentTab,
    deleteOpenedDocument: L_deleteOpenedDocument
  },

  // FLOATING WINDOWS (in-renderer movable / resizable surfaces)
  floatingWindows: {
    appNoteboard: L_appNoteboard,
    appStyling: L_appStylingFloating,
    projectNoteboard: L_projectNoteboard,
    projectStyling: L_projectStylingFloating
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

  // COMPONENT - FA COLOR PICKER INPUT
  faColorPickerInput: L_FaColorPickerInput,

  // COMPONENT - FA ICON PICKER INPUT
  faIconPickerInput: L_FaIconPickerInput,

  // COMPONENT - FA LOCALE TRANSLATIONS INPUT
  faLocaleTranslationsInput: L_FaLocaleTranslationsInput,

  // COMPONENT - PROJECT UI
  projectUI: {
    projectHierarchyTree: L_projectHierarchyTree,
    projectHierarchyTreeSearch: L_projectHierarchyTreeSearch,
    projectOverview: L_projectOverview,
    projectDocumentControlBar: L_projectDocumentControlBar
  },

  // GLOBAL FUNCTIONALITY
  globalFunctionality: {
    faActionManager: L_faActionManager,
    faKeybinds: L_faKeybinds,
    faAppNoteboard: L_faAppNoteboard,
    faProjectNoteboard: L_faProjectNoteboard,
    faAppStyling: L_faAppStyling,
    faProjectStyling: L_faProjectStyling,
    faProjectSession: L_faProjectSession,
    faOpenedDocuments: L_faOpenedDocuments,
    faProjectSettings: L_faProjectSettings,
    faUserSettings: L_faUserSettings,
    spellChecker: L_spellChecker,
    unsortedAppTexts: L_unsortedAppTexts
  }
}
