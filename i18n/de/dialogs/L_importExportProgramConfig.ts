export default {
  ariaLabel: 'Programmkonfiguration importieren oder exportieren',
  title: 'Programmkonfiguration importieren / exportieren',
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
      exportFirst: 'Wenn du deine bisherigen Einstellungen, Tastaturkürzel und Styling behalten willst, exportiere sie zuerst und importiere danach ERST die neuen Konfigurationen.',
      importOverwrites: 'Beim Import werden deine bisherigen Programmeinstellungen, Tastaturkürzel und Styling je nach deiner Auswahl im nächsten Schritt überschrieben.',
      selectiveImport: 'Du kannst nur einen Teil der Programmkonfiguration importieren (Programmeinstellungen, Tastaturkürzel oder Styling) und den übrigen Teil der bisherigen Konfiguration dabei beibehalten — abhängig von deiner Auswahl im nächsten Schritt.'
    }
  },
  checkboxes: {
    programSettings: 'Programmeinstellungen',
    keybinds: 'Tastaturkürzel',
    programStyling: 'Benutzerdefiniertes Programm-CSS'
  },
  createExportFile: 'Exportdatei erstellen',
  importSelected: 'Auswahl importieren',
  toasts: {
    exportSuccess: 'Konfiguration exportiert',
    importSuccess: 'Konfiguration importiert'
  }
}
