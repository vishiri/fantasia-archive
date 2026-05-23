export default {
  ariaLabel: 'App-Konfiguration importieren oder exportieren',
  title: 'App-Konfiguration importieren/exportieren',
  stepper: {
    importPanel: 'Wählen Sie Teile zum Importieren aus',
    rootPanel: 'Importieren oder exportieren',
    exportPanel: 'Wählen Sie Teile zum Exportieren aus',
  },
  importButton: 'Import',
  exportButton: 'Export',
  exportHint: 'Wählen Sie aus, welche Einstellungen in die Exportdatei einbezogen werden sollen',
  importSelectHint: 'Wählen Sie aus, welche Einstellungen aus der Datei geladen werden sollen',
  notice: {
    heading: 'Bitte beachten Sie Folgendes:',
    list: {
      exportFirst: 'Wenn Sie Ihre vorhandenen App-Einstellungen, App-Tastenkombinationen, benutzerdefinierten App CSS und App Noteboard beibehalten möchten, exportieren Sie sie zuerst und importieren Sie dann die Ersatzkonfiguration.',
      importOverwrites: 'Beim Importieren werden Ihre vorhandenen App-Einstellungen, App-Tastenkombinationen, benutzerdefinierten App CSS und App Noteboard entsprechend Ihren Entscheidungen im nächsten Schritt überschrieben.',
      selectiveImport: 'Es ist möglich, nur einen einzelnen Teil der App-Konfiguration (App-Einstellungen, App-Tastenkombinationen, benutzerdefinierte App CSS oder App Noteboard) zu importieren, ohne den Rest der vorhandenen Konfiguration zu überschreiben, je nachdem, was Sie im nächsten Schritt importieren möchten.',
    }
  },
  checkboxes: {
    appSettings: 'App-Einstellungen',
    keybinds: 'App-Tastenkombinationen',
    appNoteboard: 'App-Notizbrett',
    appStyling: 'Benutzerdefinierte App CSS',
  },
  createExportFile: 'Exportdatei erstellen',
  importSelected: 'Importieren ausgewählt',
  toasts: {
    exportSuccess: 'Konfiguration erfolgreich exportiert',
    importSuccess: 'Konfiguration erfolgreich importiert',
  }
}
