export default {
  title: 'Configuración del proyecto',
  closeButton: 'Cerrar sin guardar',
  saveButton: 'Guardar configuración',
  saveWithoutClosingButton: 'Guardar sin cerrar',
  saveErrors: {
    tooltipIntro: 'No se puede guardar. Se encontraron los siguientes errores:',
    bulletWorldNameRequired: 'El nombre del mundo es obligatorio para «{worldLabel}».',
    bulletDuplicatePalette: 'Colores duplicados encontrados en la paleta de «{worldLabel}».',
    bulletDocumentTemplateNameRequired: 'El nombre de la plantilla de documento es obligatorio para «{templateLabel}».',
    bulletWorldTemplateGroupNameRequired: 'El nombre del grupo de plantillas es obligatorio para «{worldLabel}».',
    bulletWorldTemplateDuplicateDocumentTemplate: 'Plantilla de documento duplicada «{templateLabel}» en «{worldLabel}».'
  },
  singularPluralMissing: {
    bothIntro: 'Faltan traducciones para el idioma actual:',
    singularBullet: 'Falta la forma singular',
    pluralBullet: 'Falta la forma plural',
    usingFallback: 'Se usa el respaldo de {fallbackLanguageName}'
  },
  categories: {
    generalSettings: {
      title: 'Configuración general'
    },
    worldsSettings: {
      title: 'Mundos'
    },
    documentTemplatesSettings: {
      title: 'Plantillas de documentos'
    }
  },
  fields: {
    projectName: {
      title: 'Nombre del proyecto',
      label: 'Nombre del proyecto',
      errorRequired: 'El nombre del proyecto es obligatorio.'
    },
    worldName: {
      title: 'Nombre del mundo',
      label: 'Nombre del mundo',
      errorRequired: 'El nombre del mundo es obligatorio.'
    },
    worldColor: {
      title: 'Color',
      label: 'Color del mundo',
      tooltip: 'Este color determina cómo aparece su mundo en varios lugares del proyecto: iconos, texto y elementos de interfaz similares.',
      helpAriaLabel: 'Ayuda sobre el color del mundo'
    },
    worldColorPalette: {
      label: 'Paleta de colores del mundo',
      tooltipIntro: 'La paleta de colores le permite predefinir colores que se utilizarán más adelante en todo el proyecto sin tener que seleccionarlos manualmente cada vez. Esto permite la coherencia entre documentos cuando sea necesario.',
      tooltipRightClickIntro: 'Más acciones disponibles al hacer clic con el botón derecho en colores individuales:',
      tooltipRightClickDeletion: 'Eliminación',
      tooltipRightClickDuplication: 'Duplicación',
      addButton: 'Agregar color',
      helpAriaLabel: 'Ayuda sobre la paleta de colores del mundo',
      swatchAriaLabel: 'Editar muestra de color {hex}',
      contextMenu: {
        duplicateColor: 'Duplicar color',
        deleteColor: 'Eliminar color'
      }
    },
    worldTemplateLayout: {
      layoutTitle: 'Árbol jerárquico del mundo',
      availableTemplatesTitle: 'Plantillas de documentos disponibles',
      availableTemplatesFilterAriaLabel: 'Filtrar plantillas de documentos disponibles',
      availableTemplatesFilterClearAriaLabel: 'Borrar filtro de plantillas de documentos disponibles',
      availableTemplatesFilterPlaceholder: 'Buscar…',
      emptyFilteredAvailableTemplates: 'Ninguna plantilla de documento coincide con su búsqueda.',
      addGroupButton: 'Agregar grupo',
      defaultNewGroupName: 'Nuevo grupo',
      editGroupTooltip: 'Renombrar grupo',
      editTemplateTooltip: 'Ajustar apodo de la plantilla',
      emptyAvailableTemplates: 'Todas las plantillas de documentos están asignadas a este mundo.',
      groupNameErrorRequired: 'El nombre del grupo es obligatorio.',
      groupRenameInputLabel: 'Nombre del grupo',
      placementNicknameHoverOriginalNameLabel: 'Nombre original',
      placementNicknameHoverNicknameLabel: 'Apodo',
      removeGroupTooltip: 'Eliminar grupo',
      removeTemplateTooltip: 'Eliminar plantilla de documento',
      templateCanonicalNameLabel: 'Nombre de la plantilla de documento',
      templateCanonicalNameTooltip: 'Para renombrar correctamente una plantilla de documento completa, vaya a la sección «Plantillas de documentos» de este cuadro de diálogo de edición y ajústela allí.',
      templateNicknameLabel: 'Apodo dentro de este mundo',
      templateNicknameTooltip: 'Establecer un apodo le permite renombrar rápidamente una plantilla de documento dentro de un mundo específico sin cambiar su nombre real en todo el proyecto.',
      missingGroupDisplayNameTreeTooltip:
        'Faltan algunas traducciones para el idioma seleccionado actualmente en este nombre de grupo.',
      missingPlacementNicknameTreeTooltip:
        'Faltan algunas traducciones para el idioma seleccionado actualmente en este apodo de ubicación.',
      missingDocumentTemplateTitleTreeTooltip:
        'Faltan algunas traducciones para el idioma seleccionado actualmente en el título de esta plantilla de documento.',
      contextMenu: {
        renameGroup: 'Renombrar grupo',
        deleteGroup: 'Eliminar grupo'
      },
      renameDialog: {
        title: 'Renombrar grupo',
        confirmButton: 'Renombrar'
      }
    },
    documentTemplateName: {
      title: 'Nombre de la plantilla de documento',
      label: 'Nombre de la plantilla de documento',
      errorRequired: 'Se requiere al menos una traducción del título de la plantilla de documento.'
    },
    documentTemplateWorldAppendix: {
      title: 'Apéndice del mundo',
      label: 'Apéndice del mundo',
      tooltip: 'El apéndice del mundo es una descripción breve y única para su plantilla de documento cuando se empareja con mundos individuales. Esto evita confusiones cuando varias plantillas de documentos comparten el mismo nombre en distintos mundos. El apéndice le ayuda a distinguirlas de un vistazo. Este campo aparece solo en la pestaña de mundos al emparejar plantillas con mundos, en ningún otro lugar.',
      helpAriaLabel: 'Ayuda sobre el apéndice del mundo'
    },
    documentTemplateIcon: {
      title: 'Icono',
      label: 'Icono'
    }
  },
  panels: {
    worlds: {
      title: 'Mundos del proyecto',
      addWorldButton: 'Agregar mundo',
      defaultNewWorldName: 'Nuevo mundo',
      deleteWorldButton: 'Eliminar mundo',
      emptyFilteredWorlds: 'Ningún mundo coincide con su búsqueda.',
      filterAriaLabel: 'Filtrar mundos',
      filterClearAriaLabel: 'Borrar filtro de mundos',
      filterPlaceholder: 'Buscar…',
      missingTranslationsTabTooltip: 'Faltan algunas traducciones para el idioma seleccionado actualmente en este mundo.',
      deleteConfirm: {
        confirmDeleteButton: 'Confirmar eliminación',
        message: '¿Está seguro de que desea eliminar este mundo? Los documentos y la configuración vinculados a él no se podrán recuperar después. Se perderán para siempre.'
      },
      removeDisabledHasDocuments: 'Elimine los documentos de este mundo antes de eliminarlo.',
      removeDisabledLastWorld: 'Un proyecto debe tener al menos un mundo en todo momento. Cree otro primero para eliminar este.'
    },
    documentTemplates: {
      title: 'Plantillas de documentos',
      addFirstTemplateButton: 'Agregar su primera plantilla',
      addTemplateButton: 'Agregar plantilla de documento',
      defaultNewTemplateName: 'Nueva plantilla de documento',
      deleteTemplateButton: 'Eliminar plantilla',
      emptyFilteredTemplates: 'Ninguna plantilla de documento coincide con su búsqueda.',
      filterAriaLabel: 'Filtrar plantillas de documentos',
      filterClearAriaLabel: 'Borrar filtro de plantillas de documentos',
      filterPlaceholder: 'Buscar…',
      missingTranslationsTabTooltip: 'Faltan algunas traducciones para el idioma seleccionado actualmente en esta plantilla de documento.',
      deleteConfirm: {
        confirmDeleteButton: 'Confirmar eliminación',
        message: '¿Está seguro de que desea eliminar esta plantilla de documento? Todos los campos conectados a esta plantilla en cualquier otra plantilla dejarán de funcionar. Además, todos los documentos conectados dejarán de mostrar sus datos si se rellenaron con esta plantilla. Esta eliminación puede tener efectos secundarios no deseados.'
      },
      removeDisabledHasDocuments: 'Elimine los documentos que usan esta plantilla antes de eliminarla.'
    }
  }
}
