export default {
  ariaLabel: 'Importer eller eksporter appkonfigurasjon',
  title: 'Importer / eksporter appkonfigurasjon',
  stepper: {
    importPanel: 'Velg deler som skal importeres',
    rootPanel: 'Importer eller eksporter',
    exportPanel: 'Velg deler som skal eksporteres',
  },
  importButton: 'Import',
  exportButton: 'Eksport',
  exportHint: 'Velg hvilke innstillinger som skal inkluderes i eksportfilen',
  importSelectHint: 'Velg hvilke innstillinger som skal lastes fra filen',
  notice: {
    heading: 'Vær oppmerksom på følgende:',
    list: {
      exportFirst: 'Hvis du ønsker å beholde dine eksisterende appinnstillinger, app-nøkkelbindinger, tilpasset app CSS og appnoteboard, eksporter du dem først og importerer deretter erstatningskonfigurasjonen.',
      importOverwrites: 'Importering VIL overskrive eksisterende appinnstillinger, app-nøkkelbindinger, tilpasset app CSS og appnoteboard i henhold til valgene dine i neste trinn.',
      selectiveImport: 'Det er mulig å importere kun en enkelt del av appkonfigurasjonen (Appinnstillinger, App Keybindings, Custom App CSS eller App Noteboard) uten å overskrive resten av den eksisterende konfigurasjonen basert på hva du velger å importere i neste trinn.',
    }
  },
  checkboxes: {
    appSettings: 'Appinnstillinger',
    keybinds: 'App-nøkkelbindinger',
    appNoteboard: 'App Noteboard',
    appStyling: 'Egendefinert app CSS',
  },
  createExportFile: 'Opprett eksportfil',
  importSelected: 'Importer valgt',
  toasts: {
    exportSuccess: 'Konfigurasjonen ble eksportert',
    importSuccess: 'Konfigurasjonen ble importert',
  }
}
