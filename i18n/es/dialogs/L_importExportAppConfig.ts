export default {
  ariaLabel: 'Importar o exportar la configuración de la aplicación',
  title: 'Importar/Exportar configuración de la aplicación',
  stepper: {
    importPanel: 'Seleccionar piezas para importar',
    rootPanel: 'Importar o exportar',
    exportPanel: 'Seleccionar piezas para exportar',
  },
  importButton: 'Importar',
  exportButton: 'Exportar',
  exportHint: 'Elija qué configuraciones incluir en el archivo de exportación',
  importSelectHint: 'Elija qué configuraciones cargar desde el archivo',
  notice: {
    heading: 'Tenga en cuenta lo siguiente:',
    list: {
      exportFirst: 'Si desea conservar la configuración de la aplicación, las combinaciones de teclas de la aplicación, la aplicación personalizada CSS y el bloc de notas de la aplicación existentes, expórtelos primero y luego importe la configuración de reemplazo.',
      importOverwrites: 'La importación sobrescribirá la configuración de la aplicación existente, las combinaciones de teclas de la aplicación, la aplicación personalizada CSS y el bloc de notas de la aplicación según sus elecciones en el siguiente paso.',
      selectiveImport: 'Es posible importar solo una parte de la configuración de la aplicación (Configuración de la aplicación, Combinaciones de teclas de la aplicación, Aplicación personalizada CSS o Bloc de notas de la aplicación) sin sobrescribir el resto de la configuración existente según lo que elija importar en el siguiente paso.',
    }
  },
  checkboxes: {
    appSettings: 'Configuración de la aplicación',
    keybinds: 'Combinaciones de teclas de aplicaciones',
    appNoteboard: 'Bloc de notas de aplicaciones',
    appStyling: 'Aplicación personalizada CSS',
  },
  createExportFile: 'Crear archivo de exportación',
  importSelected: 'Importar seleccionado',
  toasts: {
    exportSuccess: 'Configuración exportada exitosamente',
    importSuccess: 'Configuración importada exitosamente',
  }
}
