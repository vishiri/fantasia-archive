import L_documents from './components/globals/AppControlMenus/L_documents'
import L_GlobalLanguageSelector from './components/globals/GlobalLanguageSelector/L_GlobalLanguageSelector'
import L_helpInfo from './components/globals/AppControlMenus/L_helpInfo'
import L_project from './components/globals/AppControlMenus/L_project'
import L_tools from './components/globals/AppControlMenus/L_tools'
import L_socialContactButtons from './components/other/SocialContactButtons/L_socialContactButtons'

import L_aboutFantasiaArchive from './dialogs/L_aboutFantasiaArchive'

import L_faUserSettings from './globalFunctionality/L_faUserSettings'
import L_spellChecker from './globalFunctionality/L_spellChecker'

export default {
  // GLOBAL - APP TEXTS
  app: {
    name: 'FA - but in german!'
  },

  // COMPONENT - APP CONTROL MENUS
  appControlMenus: {
    project: L_project,
    tools: L_tools,
    documents: L_documents,
    helpInfo: L_helpInfo
  },

  // DIALOGS
  dialogs: {
    aboutFantasiaArchive: L_aboutFantasiaArchive
  },

  // COMPONENT - GLOBAL LANGUAGE SELECTOR
  globalLanguageSelector: L_GlobalLanguageSelector,

  // COMPONENT - GLOBAL WINDOW BUTTONS
  GlobalWindowButtons: {
    minimizeButton: 'Minimize',
    resizeButton: 'Resize Down',
    maximizeButton: 'Maximize',
    close: 'Close'
  },

  // COMPONENT - FANTASIA MASCOT IMAGE
  FantasiaMascotImage: {
    label: 'Fantasia Maskottchen'
  },

  // COMPONENT - SOCIAL CONTACT BUTTONS
  socialContactButtons: L_socialContactButtons,

  // GLOBAL FUNCTIONALITY
  globalFunctionality: {
    faUserSettings: L_faUserSettings,
    spellChecker: L_spellChecker
  }
}
