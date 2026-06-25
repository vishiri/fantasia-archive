export default {
  ariaLabel: 'Importa o esporta la configurazione dell\'app',
  title: 'Importa/Esporta la configurazione dell\'app',
  stepper: {
    importPanel: 'Seleziona le parti da importare',
    rootPanel: 'Importare o esportare',
    exportPanel: 'Seleziona le parti da esportare',
  },
  importButton: 'Importare',
  exportButton: 'Esportare',
  exportHint: 'Scegli quali impostazioni includere nel file di esportazione',
  importSelectHint: 'Scegli quali impostazioni caricare dal file',
  notice: {
    heading: 'Si prega di notare quanto segue:',
    list: {
      exportFirst: 'Se desideri mantenere le impostazioni dell\'app, le combinazioni di tasti dell\'app, l\'app personalizzata CSS e la Blocco note dell\'app esistenti, esportali prima, quindi importa la configurazione sostitutiva.',
      importOverwrites: 'L\'importazione sovrascriverà le impostazioni dell\'app esistenti, le combinazioni di tasti dell\'app, l\'app personalizzata CSS e la noteboard dell\'app in base alle scelte effettuate nel passaggio successivo.',
      selectiveImport: 'È possibile importare solo una singola parte della configurazione dell\'app (Impostazioni app, Tasti di scelta rapida dell\'app, App personalizzata CSS o Blocco note dell\'app) senza sovrascrivere il resto della configurazione esistente in base a ciò che scegli di importare nel passaggio successivo.',
    }
  },
  checkboxes: {
    appSettings: 'Impostazioni dell\'app',
    keybinds: 'Combinazioni di tasti dell\'app',
    appNoteboard: 'Blocco note dell\'app',
    appStyling: 'App personalizzata CSS',
  },
  createExportFile: 'Crea file di esportazione',
  importSelected: 'Importa selezionata',
  toasts: {
    exportSuccess: 'Configurazione esportata con successo',
    importSuccess: 'Configurazione importata con successo',
  },
  errors: {
    desktopOnly: 'La configurazione dell\'app è disponibile solo nell\'app desktop.',
    exportToFileFailed: 'Esportazione su file non riuscita',
    importValidationFailed: 'Convalida dell\'importazione non riuscita'
  }
}
