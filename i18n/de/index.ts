import L_documents from './components/globals/AppControlMenus/L_documents'
import L_GlobalLanguageSelector from './components/globals/GlobalLanguageSelector/L_GlobalLanguageSelector'
import L_helpInfo from './components/globals/AppControlMenus/L_helpInfo'
import L_project from './components/globals/AppControlMenus/L_project'
import L_tools from './components/globals/AppControlMenus/L_tools'
import L_socialContactButtons from './components/other/SocialContactButtons/L_socialContactButtons'

import L_aboutFantasiaArchive from './dialogs/L_aboutFantasiaArchive'
import L_DialogActionMonitor from './dialogs/L_DialogActionMonitor'
import L_dialogKeybindSettings from './dialogs/L_dialogKeybindSettings'

import L_faActionManager from './globalFunctionality/L_faActionManager'
import L_faKeybinds from './globalFunctionality/L_faKeybinds'
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
    aboutFantasiaArchive: L_aboutFantasiaArchive,
    actionMonitor: L_DialogActionMonitor,
    keybindSettings: L_dialogKeybindSettings
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
    faActionManager: L_faActionManager,
    faKeybinds: L_faKeybinds,
    faUserSettings: L_faUserSettings,
    spellChecker: L_spellChecker
  }
}
