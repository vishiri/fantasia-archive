export default {
  ariaLabel: 'Importer ou exporter la configuration de l\'application',
  title: 'Importer/Exporter la configuration de l\'application',
  stepper: {
    importPanel: 'Sélectionnez les pièces à importer',
    rootPanel: 'Importer ou exporter',
    exportPanel: 'Sélectionnez les pièces à exporter',
  },
  importButton: 'Importer',
  exportButton: 'Exporter',
  exportHint: 'Choisissez les paramètres à inclure dans le fichier d\'exportation',
  importSelectHint: 'Choisissez les paramètres à charger à partir du fichier',
  notice: {
    heading: 'Veuillez noter ce qui suit :',
    list: {
      exportFirst: 'Si vous souhaitez conserver vos paramètres d\'application existants, vos raccourcis clavier d\'application, votre application personnalisée CSS et votre tableau de notes d\'application, exportez-les d\'abord, puis importez la configuration de remplacement.',
      importOverwrites: 'L\'importation écrasera vos paramètres d\'application existants, vos raccourcis clavier d\'application, votre application personnalisée CSS et votre tableau de notes d\'application en fonction de vos choix à l\'étape suivante.',
      selectiveImport: 'Il est possible d\'importer une seule partie de la configuration de l\'application (paramètres de l\'application, raccourcis clavier de l\'application, application personnalisée CSS ou tableau de notes de l\'application) sans écraser le reste de la configuration existante en fonction de ce que vous choisissez d\'importer à l\'étape suivante.',
    }
  },
  checkboxes: {
    appSettings: 'Paramètres de l\'application',
    keybinds: 'Raccourcis clavier d\'application',
    appNoteboard: 'Tableau de notes de l\'application',
    appStyling: 'Application personnalisée CSS',
  },
  createExportFile: 'Créer un fichier d\'exportation',
  importSelected: 'Importer la sélection',
  toasts: {
    exportSuccess: 'Configuration exportée avec succès',
    importSuccess: 'Configuration importée avec succès',
  }
}
