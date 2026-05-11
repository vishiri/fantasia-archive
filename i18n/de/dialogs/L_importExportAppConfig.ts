export default {
  ariaLabel: 'App-Konfiguration importieren oder exportieren',
  title: 'App-Konfiguration importieren / exportieren',
  stepper: {
    importPanel: 'Teile zum Import wählen',
    rootPanel: 'Import oder Export',
    exportPanel: 'Teile für den Export wählen'
  },
  importButton: 'Importieren',
  exportButton: 'Exportieren',
  exportHint: 'Wähle, welche Einstellungen in die Exportdatei aufgenommen werden sollen.',
  importSelectHint: 'Wähle, welche Teile aus der Datei wiederhergestellt werden sollen.',
  notice: {
    heading: 'Bitte beachte Folgendes:',
    list: {
      exportFirst: 'Wenn du deine bisherigen Einstellungen, Tastaturkürzel, benutzerdefiniertes App-CSS und App-Noteboard behalten willst, exportiere sie zuerst und importiere danach ERST die neuen Konfigurationen.',
      importOverwrites: 'Beim Import werden deine bisherigen App-Einstellungen, Tastaturkürzel, benutzerdefiniertes App-CSS und App-Noteboard je nach deiner Auswahl im nächsten Schritt überschrieben.',
      selectiveImport: 'Du kannst nur einen Teil der App-Konfiguration importieren (App-Einstellungen, Tastaturkürzel, benutzerdefiniertes App-CSS oder App-Noteboard) und den übrigen Teil der bisherigen Konfiguration dabei beibehalten — abhängig von deiner Auswahl im nächsten Schritt.'
    }
  },
  checkboxes: {
    appSettings: 'App-Einstellungen',
    keybinds: 'App-Tastaturkürzel',
    appNoteboard: 'App-Noteboard',
    appStyling: 'Benutzerdefiniertes App-CSS'
  },
  createExportFile: 'Exportdatei erstellen',
  importSelected: 'Auswahl importieren',
  toasts: {
    exportSuccess: 'Konfiguration exportiert',
    importSuccess: 'Konfiguration importiert'
  }
}
