export default {
  ariaLabel: 'Import or export program configuration',
  title: 'Import / Export program configuration',
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
      exportFirst: 'If you wish to keep your existing settings, keybinds, and styling, you should export them first and ONLY then import any new ones.',
      importOverwrites: 'Importing WILL overwrite your existing program settings, keybinds, and styling according to your choices in the next step.',
      selectiveImport: 'It is possible to import only a single part of the program configuration (program settings, keybinds, or styling) without overwriting the rest of the existing configuration based on what you choose to import in the next step.'
    }
  },
  checkboxes: {
    programSettings: 'Program settings',
    keybinds: 'Program keybinds',
    programStyling: 'Custom program CSS'
  },
  createExportFile: 'Create export file',
  importSelected: 'Import selected',
  toasts: {
    exportSuccess: 'Configuration successfully exported',
    importSuccess: 'Configuration successfully imported'
  }
}
