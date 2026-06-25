export default {
  ariaLabel: 'Importera eller exportera appkonfiguration',
  title: 'Importera/exportera appkonfiguration',
  stepper: {
    importPanel: 'Välj delar att importera',
    rootPanel: 'Importera eller exportera',
    exportPanel: 'Välj delar att exportera',
  },
  importButton: 'Importera',
  exportButton: 'Exportera',
  exportHint: 'Välj vilka inställningar som ska inkluderas i exportfilen',
  importSelectHint: 'Välj vilka inställningar som ska laddas från filen',
  notice: {
    heading: 'Observera följande:',
    list: {
      exportFirst: 'Om du vill behålla dina befintliga appinställningar, appnyckelbindningar, anpassade appar CSS och appanteckningsbord, exportera dem först och importera sedan ersättningskonfigurationen.',
      importOverwrites: 'Importen KOMMER att skriva över dina befintliga appinställningar, appnyckelbindningar, anpassade appar CSS och appanteckningsbord enligt dina val i nästa steg.',
      selectiveImport: 'Det är möjligt att importera endast en enskild del av appkonfigurationen (Appinställningar, App Keybinds, Custom App CSS eller App Noteboard) utan att skriva över resten av den befintliga konfigurationen baserat på vad du väljer att importera i nästa steg.',
    }
  },
  checkboxes: {
    appSettings: 'Appinställningar',
    keybinds: 'App Keybinds',
    appNoteboard: 'App-anteckningstavla',
    appStyling: 'Anpassad app CSS',
  },
  createExportFile: 'Skapa exportfil',
  importSelected: 'Importera valt',
  toasts: {
    exportSuccess: 'Konfigurationen har exporterats',
    importSuccess: 'Konfigurationen har importerats',
  },
  errors: {
    desktopOnly: 'Appkonfiguration är endast tillgänglig i skrivbordsappen.',
    exportToFileFailed: 'Export till fil misslyckades',
    importValidationFailed: 'Importvalideringen misslyckades'
  }
}
