export default {
  ariaLabel: 'Import or export app configuration',
  title: 'Import / Export App Configuration',
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
      exportFirst: 'If you wish to keep your existing App Settings, App Keybinds, Custom App CSS, and App Noteboard, export them first, then import the replacement configuration.',
      importOverwrites: 'Importing WILL overwrite your existing App Settings, App Keybinds, Custom App CSS, and App Noteboard according to your choices in the next step.',
      selectiveImport: 'It is possible to import only a single part of the app configuration (App Settings, App Keybinds, Custom App CSS, or App Noteboard) without overwriting the rest of the existing configuration based on what you choose to import in the next step.'
    }
  },
  checkboxes: {
    appSettings: 'App Settings',
    keybinds: 'App Keybinds',
    appNoteboard: 'App Noteboard',
    appStyling: 'Custom App CSS'
  },
  createExportFile: 'Create export file',
  importSelected: 'Import selected',
  toasts: {
    exportSuccess: 'Configuration successfully exported',
    importSuccess: 'Configuration successfully imported'
  },
  errors: {
    desktopOnly: 'App configuration is only available in the desktop app.',
    exportToFileFailed: 'Export to file failed',
    importValidationFailed: 'Import validation failed'
  }
}
