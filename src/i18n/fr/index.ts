import { specialCharacterFixer } from '../specialCharactersFixer'

import advancedSearchCheatSheet from './documents/advancedSearchCheatSheet.md'
import advancedSearchGuide from './documents/advancedSearchGuide.md'
import changeLog from './documents/changeLog.md'
import license from './documents/license.md'
import tipsTricksTrivia from './documents/tipsTricksTrivia.md'

import T_helpInfo from './components/AppControlMenus/T_helpInfo'
import T_project from './components/AppControlMenus/T_project'
import T_tools from './components/AppControlMenus/T_tools'
import T_documents from './components/AppControlMenus/T_documents'

import T_aboutFantasiaArchive from './dialogs/T_aboutFantasiaArchive'

import T_socialContactButtons from './components/SocialContactButtons/T_socialContactButtons'

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
    aboutFantasiaArchive: T_aboutFantasiaArchive
  },

  // COMPONENT - GLOBAL WINDOW BUTTONS
  GlobalWindowButtons: {
    minimizeButton: 'Réduire',
    resizeButton: 'Redimensionner',
    maximizeButton: 'Maximiser',
    close: 'Fermer'
  },

  // COMPONENT - APP CONTROL MENUS
  AppControlMenus: {
    project: T_project,
    tools: T_tools,
    documents: T_documents,
    helpInfo: T_helpInfo
  },

  // COMPONENT - SOCIAL CONTACT BUTTONS
  SocialContactButtons: T_socialContactButtons

}
