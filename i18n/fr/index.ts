import { specialCharacterFixer } from '../specialCharactersFixer'

import advancedSearchCheatSheet from './documents/advancedSearchCheatSheet.md?raw'
import advancedSearchGuide from './documents/advancedSearchGuide.md?raw'
import changeLog from '../en-US/documents/changeLog.md?raw'
import license from './documents/license.md?raw'
import tipsTricksTrivia from './documents/tipsTricksTrivia.md?raw'

import L_helpInfo from './components/globals/AppControlMenus/L_helpInfo'
import L_project from './components/globals/AppControlMenus/L_project'
import L_tools from './components/globals/AppControlMenus/L_tools'
import L_documents from './components/globals/AppControlMenus/L_documents'
import L_GlobalLanguageSelector from './components/globals/GlobalLanguageSelector/L_GlobalLanguageSelector'

import L_aboutFantasiaArchive from './dialogs/L_aboutFantasiaArchive'
import L_DialogActionMonitor from './dialogs/L_DialogActionMonitor'
import L_dialogKeybindSettings from './dialogs/L_dialogKeybindSettings'
import L_markdownDocument from './dialogs/L_markdownDocument'
import L_programSettings from './dialogs/L_programSettings'
import L_faActionManager from './globalFunctionality/L_faActionManager'
import L_faKeybinds from './globalFunctionality/L_faKeybinds'
import L_faUserSettings from './globalFunctionality/L_faUserSettings'
import L_spellChecker from './globalFunctionality/L_spellChecker'

import L_socialContactButtons from './components/other/SocialContactButtons/L_socialContactButtons'

export default {
  // GLOBAL - DOCUMENTS
  documents: {
    advancedSearchCheatSheet: specialCharacterFixer(advancedSearchCheatSheet),
    advancedSearchGuide: specialCharacterFixer(advancedSearchGuide),
    changeLog: specialCharacterFixer(changeLog),
    license: specialCharacterFixer(license),
    tipsTricksTrivia: specialCharacterFixer(tipsTricksTrivia)
  },

  // GLOBAL - APP TEXTS
  app: {
    name: 'FA - en français !'
  },

  // PAGE - ERROR NOT FOUND
  ErrorNotFound: {
    title: 'ERREUR/NON TROUVÉ',
    subTitleFirst: 'Quelque chose s\'est terriblement cassé quelque part',
    subTitleSecond: 'Fantasia fait de son mieux pour le réparer !',
    ctaText: 'Retour à l\'écran de démarrage de l\'application'
  },

  // QUASAR COMPONENT - NOTIFY
  QuasarNotify: {
    didYouKnow: 'Le saviez-vous ?'
  },

  // DIALOGS
  Dialogs: {
    aboutFantasiaArchive: L_aboutFantasiaArchive,
    actionMonitor: L_DialogActionMonitor,
    keybindSettings: L_dialogKeybindSettings,
    markdownDocument: L_markdownDocument,
    programSettings: L_programSettings
  },

  // DIALOGS (lowercase key path parity)
  dialogs: {
    aboutFantasiaArchive: L_aboutFantasiaArchive,
    actionMonitor: L_DialogActionMonitor,
    keybindSettings: L_dialogKeybindSettings,
    markdownDocument: L_markdownDocument,
    programSettings: L_programSettings
  },

  // COMPONENT - GLOBAL WINDOW BUTTONS
  GlobalWindowButtons: {
    minimizeButton: 'Réduire',
    resizeButton: 'Redimensionner',
    maximizeButton: 'Maximiser',
    close: 'Fermer'
  },

  // COMPONENT - APP CONTROL MENUS
  appControlMenus: {
    project: L_project,
    tools: L_tools,
    documents: L_documents,
    helpInfo: L_helpInfo
  },

  AppControlMenus: {
    project: L_project,
    tools: L_tools,
    documents: L_documents,
    helpInfo: L_helpInfo
  },

  // COMPONENT - GLOBAL LANGUAGE SELECTOR
  globalLanguageSelector: L_GlobalLanguageSelector,

  // COMPONENT - SOCIAL CONTACT BUTTONS
  SocialContactButtons: L_socialContactButtons,
  socialContactButtons: L_socialContactButtons,

  // GLOBAL FUNCTIONALITY (lowercase key path parity)
  globalFunctionality: {
    faActionManager: L_faActionManager,
    faKeybinds: L_faKeybinds,
    faUserSettings: L_faUserSettings,
    spellChecker: L_spellChecker
  }

}
