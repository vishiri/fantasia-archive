export default {
  ariaLabel: 'Tuo tai vie sovellusmääritykset',
  title: 'Tuo / Vie sovellusmääritykset',
  stepper: {
    importPanel: 'Valitse tuotavat osat',
    rootPanel: 'Tuonti tai vienti',
    exportPanel: 'Valitse vietävät osat',
  },
  importButton: 'Tuoda',
  exportButton: 'Viedä',
  exportHint: 'Valitse vientitiedostoon sisällytettävät asetukset',
  importSelectHint: 'Valitse tiedostosta ladattavat asetukset',
  notice: {
    heading: 'Huomioi seuraavat asiat:',
    list: {
      exportFirst: 'Jos haluat säilyttää nykyiset sovellusasetukset, sovellusnäppäimet, mukautetut sovellukset CSS ja sovellusmuistio, vie ne ensin ja tuo sitten korvaava kokoonpano.',
      importOverwrites: 'Tuominen korvaa nykyiset sovellusasetukset, sovellusnäppäimet, mukautetut sovellukset CSS ja sovellusmuistio seuraavassa vaiheessa tekemiesi valintojen mukaisesti.',
      selectiveImport: 'On mahdollista tuoda vain yksi osa sovelluksen määrityksistä (App Settings, App Keybinds, Custom App CSS tai App Noteboard) ilman, että muuta olemassa olevaa määritystä korvataan sen perusteella, mitä valitset tuotavan seuraavassa vaiheessa.',
    }
  },
  checkboxes: {
    appSettings: 'Sovellusasetukset',
    keybinds: 'Sovellusnäppäimet',
    appNoteboard: 'App Muistitaulu',
    appStyling: 'Muokattu sovellus CSS',
  },
  createExportFile: 'Luo vientitiedosto',
  importSelected: 'Tuonti valittu',
  toasts: {
    exportSuccess: 'Kokoonpanon vienti onnistui',
    importSuccess: 'Kokoonpanon tuonti onnistui',
  },
  errors: {
    desktopOnly: 'Sovelluksen määritykset ovat käytettävissä vain työpöytäsovelluksessa.',
    exportToFileFailed: 'Vienti tiedostoon epäonnistui',
    importValidationFailed: 'Tuonnin vahvistus epäonnistui'
  }
}
