export default {
  ariaLabel: 'Import or export app configuration',
  title: 'Import / Export app configuration',
  stepper: {
    importPanel: 'Select parts to import',
    rootPanel: 'Import or export',
    exportPanel: 'Select parts to export'
  },
  importButton: 'Import',
  exportButton: 'Export',
  exportHint: 'Choose which settings to include in the export file',
  importSelectHint: 'Choose which settings to load from the file',
  notice: {
    heading: 'Please note the following:',
    list: {
      exportFirst: 'If you wish to keep your existing settings, keybinds, custom app CSS, and app note board, you should export them first and ONLY then import any new ones.',
      importOverwrites: 'Importing WILL overwrite your existing app settings, keybinds, custom app CSS, and app note board according to your choices in the next step.',
      selectiveImport: 'It is possible to import only a single part of the app configuration (app settings, keybinds, custom app CSS, or app note board) without overwriting the rest of the existing configuration based on what you choose to import in the next step.'
    }
  },
  checkboxes: {
    appSettings: 'App settings',
    keybinds: 'App keybinds',
    appNoteboard: 'App note board',
    appStyling: 'Custom app CSS'
  },
  createExportFile: 'Create export file',
  importSelected: 'Import selected',
  toasts: {
    exportSuccess: 'Configuration successfully exported',
    importSuccess: 'Configuration successfully imported'
  }
}
