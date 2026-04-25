export default {
  ariaLabel: 'Importer ou exporter la configuration du programme',
  title: 'Importer / exporter la configuration du programme',
  stepper: {
    importPanel: 'Sélection des éléments à importer',
    rootPanel: 'Importer ou exporter',
    exportPanel: 'Sélection des éléments à exporter'
  },
  importButton: 'Importer',
  exportButton: 'Exporter',
  exportHint: 'Choisissez les paramètres à inclure dans le fichier d’export.',
  importSelectHint: 'Choisissez les éléments à restaurer à partir du fichier.',
  notice: {
    heading: 'Veuillez noter ce qui suit :',
    list: {
      exportFirst: 'Si vous souhaitez conserver vos réglages, raccourcis et feuille de style actuels, exportez-les d’abord, puis importez les nouveaux seulement ensuite.',
      importOverwrites: 'L’import ÉCRASERA vos paramètres, raccourcis et feuille de style actuels selon les choix que vous ferez à l’étape suivante.',
      selectiveImport: 'Vous pouvez n’importer qu’une partie de la configuration (paramètres, raccourcis ou CSS) sans écraser le reste, selon ce que vous choisirez d’importer à l’étape suivante.'
    }
  },
  checkboxes: {
    programSettings: 'Paramètres du programme',
    keybinds: 'Raccourcis clavier',
    programStyling: 'CSS personnalisé du programme'
  },
  createExportFile: 'Créer le fichier d’export',
  importSelected: 'Importer la sélection',
  toasts: {
    exportSuccess: 'Configuration exportée',
    importSuccess: 'Configuration importée'
  }
}
