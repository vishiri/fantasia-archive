export default {
  ariaLabel: 'Importar ou exportar configuração do aplicativo',
  title: 'Importar/exportar configuração de aplicativo',
  stepper: {
    importPanel: 'Selecione peças para importar',
    rootPanel: 'Importar ou exportar',
    exportPanel: 'Selecione peças para exportar',
  },
  importButton: 'Importar',
  exportButton: 'Exportar',
  exportHint: 'Escolha quais configurações incluir no arquivo de exportação',
  importSelectHint: 'Escolha quais configurações carregar do arquivo',
  notice: {
    heading: 'Observe o seguinte:',
    list: {
      exportFirst: 'Se você deseja manter as configurações do aplicativo, os atalhos de teclado do aplicativo, o aplicativo personalizado CSS e o quadro de notas do aplicativo existentes, exporte-os primeiro e, em seguida, importe a configuração de substituição.',
      importOverwrites: 'A importação substituirá as configurações do aplicativo, os atalhos de teclado do aplicativo, o aplicativo personalizado CSS e o quadro de notas do aplicativo existentes, de acordo com suas escolhas na próxima etapa.',
      selectiveImport: 'É possível importar apenas uma única parte da configuração do aplicativo (configurações do aplicativo, atalhos de teclado do aplicativo, aplicativo personalizado CSS ou quadro de notas do aplicativo) sem substituir o restante da configuração existente com base no que você escolher importar na próxima etapa.',
    }
  },
  checkboxes: {
    appSettings: 'Configurações do aplicativo',
    keybinds: 'Atalhos de teclado do aplicativo',
    appNoteboard: 'Quadro de notas do aplicativo',
    appStyling: 'Aplicativo personalizado CSS',
  },
  createExportFile: 'Criar arquivo de exportação',
  importSelected: 'Importação selecionada',
  toasts: {
    exportSuccess: 'Configuração exportada com sucesso',
    importSuccess: 'Configuração importada com sucesso',
  },
  errors: {
    desktopOnly: 'A configuração do aplicativo está disponível apenas no aplicativo de desktop.',
    exportToFileFailed: 'Falha na exportação para arquivo',
    importValidationFailed: 'Falha na validação de importação'
  }
}
