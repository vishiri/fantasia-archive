export default {
  ariaLabel: 'Importer ou exporter la configuration de l’app',
  title: 'Importer / exporter la configuration de l’app',
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
      exportFirst: 'Si vous souhaitez conserver vos réglages, raccourcis, CSS personnalisé de l’app et tableau de notes actuels, exportez-les d’abord, puis importez les nouveaux seulement ensuite.',
      importOverwrites: 'L’import ÉCRASERA vos paramètres de l’app, raccourcis, CSS personnalisé de l’app et tableau de notes actuels selon les choix que vous ferez à l’étape suivante.',
      selectiveImport: 'Vous pouvez n’importer qu’une partie de la configuration de l’app (paramètres de l’app, raccourcis, CSS personnalisé de l’app ou tableau de notes) sans écraser le reste, selon ce que vous choisirez d’importer à l’étape suivante.'
    }
  },
  checkboxes: {
    appSettings: 'Paramètres de l’app',
    keybinds: 'Raccourcis de l’app',
    appNoteboard: 'Tableau de notes de l’app',
    appStyling: 'CSS personnalisé de l’app'
  },
  createExportFile: 'Créer le fichier d’export',
  importSelected: 'Importer la sélection',
  toasts: {
    exportSuccess: 'Configuration exportée',
    importSuccess: 'Configuration importée'
  }
}
