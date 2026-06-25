export default {
  title: 'Fantasia Archive Configuración',
  saveButton: 'Guardar configuración',
  closeButton: 'Cerrar sin guardar',
  settingsSearchPlaceholder: 'Busca en la configuración...',
  searchNoResultsTitle: 'No hay resultados de búsqueda',
  searchNoResultsDescription: 'Lamentablemente, Fantasia no encontró ninguna configuración que estaba buscando. ¿Quizás probar con un término de búsqueda diferente?',
  appOptionsCategories: {
    accessibility: {
      title: 'Accesibilidad',
      tags: 'a11y, legibilidad, visibilidad, asistencia',
      accessibility: {
        subtitle: 'Accesibilidad',
        tags: 'a11y, legibilidad, visibilidad, asistencia',
      }
    },
    developerSettings: {
      title: 'Configuración de desarrollador',
      tags: 'desarrollador, depuración, diagnóstico, interno',
      documentBody: {
        subtitle: 'Cuerpo del documento',
        tags: 'identificación del documento, metadatos de depuración, campos internos',
      }
    },
    documentViewEdit: {
      title: 'Ver/editar documento',
      tags: 'página de documento, modo de visualización, modo de edición, lector',
      documentBody: {
        subtitle: 'Cuerpo del documento',
        tags: 'área de contenido, campos, lectura, área de edición',
      },
      documentControlBar: {
        subtitle: 'barra de control de documentos',
        tags: 'barra de herramientas, barra superior, encabezado, documento cromado',
      }
    },
    hierarchicalTree: {
      title: 'árbol jerárquico',
      tags: 'barra lateral, esquema, navegador, árbol de proyectos',
      iconSettings: {
        subtitle: 'Configuración de iconos',
        tags: 'iconos de acción, botones de árbol, iconos de fila',
      },
      informationDisplaySettings: {
        subtitle: 'Configuración de visualización de información',
        tags: 'recuentos, números, índice de orden, visualización de metadatos',
      },
      tagSettings: {
        subtitle: 'Configuración de etiquetas',
        tags: 'etiquetas, visualización de etiquetas, agrupación de etiquetas',
      },
      treeBehavior: {
        subtitle: 'Comportamiento del árbol',
        tags: 'expandir, contraer, expandir todo, interacción',
      },
      treeSettings: {
        subtitle: 'Configuración del árbol',
        tags: 'panel de árbol, visibilidad de la barra lateral, diseño de árbol',
      }
    },
    openedDocumentsTabs: {
      title: 'Abrir pestañas de documentos',
      tags: 'barra de pestañas, archivos abiertos, multitarea',
      tabBehavior: {
        subtitle: 'Comportamiento de pestaña',
        tags: 'cambiar de pestaña, barra de pestañas, comportamiento de desplazamiento',
      }
    },
    popupsFloatingWindows: {
      title: 'Ventanas emergentes y flotantes',
      tags: 'diálogos, superposiciones, modales, ventanas',
      floatingWindows: {
        subtitle: 'Ventanas flotantes',
        tags: 'separar, ventana secundaria, ventana múltiple',
      },
      quickSearchDialog: {
        subtitle: 'Diálogo de búsqueda rápida',
        tags: 'búsqueda rápida, búsqueda por teclado, buscador',
      },
      universalDialogSettings: {
        subtitle: 'Configuración de diálogo universal',
        tags: 'todos los cuadros de diálogo, comportamiento global de ventanas emergentes',
      }
    },
    visualAccessibility: {
      title: 'Imágenes y funcionalidad para toda la aplicación',
      tags: 'apariencia, interfaz, global, ui, apariencia',
      applicationExtras: {
        subtitle: 'Extras de la aplicación',
        tags: 'mascota, felpa, fantasia, extras',
      },
      visualsAppwideFunctionality: {
        subtitle: 'Imágenes y funcionalidad para toda la aplicación',
        tags: 'tema, chrome, diseño, opciones generales',
      }
    },
    projectOverview: {
      title: 'Página: Resumen del proyecto',
      tags: 'inicio del proyecto, panel, resumen, espacio de trabajo',
      projectOverviewBehavior: {
        subtitle: 'Comportamiento del resumen del proyecto',
        tags: 'consejos, trucos, sabías que, tarjeta de resumen',
      }
    },
    welcomeScreen: {
      title: 'Pantalla de bienvenida',
      tags: 'bienvenida, pantalla de inicio, bienvenida, primer lanzamiento, inicio',
      welcomeScreenBehavior: {
        subtitle: 'Comportamiento de la pantalla de bienvenida',
        tags: 'consejos de inicio, enlaces sociales, incorporación, presentación',
      }
    }
  },
  appOptions: {
    aggressiveRelationshipFilter: {
      title: 'Selección de relaciones agresivas.',
      description: 'Activa el modo agresivo de sugerencia automática para todas las búsquedas de relaciones en la aplicación en el modo de edición de documentos. Sin esto activado, después del filtrado, el primer elemento de la lista no se selecciona automáticamente. Activar esto agrega esta funcionalidad, lo que permite una selección mucho más conveniente de documentos existentes y al mismo tiempo sacrifica un poco de conveniencia al crear otros nuevos sobre la marcha.',
      tags: 'sugerencia automática, autocompletar, primera coincidencia, lista de filtros, selección existente, búsqueda de relaciones',
    },
    allowQuickPopupSameKeyClose: {
      title: 'Cerrar ventanas emergentes rápidas con la misma tecla',
      description: 'Permite cerrar las ventanas emergentes de búsqueda rápida y adición rápida con la misma combinación de teclas que se utilizó para abrirlas.',
      tags: 'alternar acceso directo, misma tecla de acceso rápido, agregar rápidamente, descartar ventana emergente',
    },
    allowWiderScrollbars: {
      title: 'Barras de desplazamiento más anchas',
      description: 'Esta configuración hace que las barras de desplazamiento de FA sean más anchas y, por lo tanto, permite el desplazamiento manual con clic directamente sobre ellas para dispositivos que no admiten el desplazamiento estándar (por ejemplo, ratones sin rueda de desplazamiento).',
      tags: 'ancho de la barra de desplazamiento, desplazamiento con clic, mouse sin rueda, trackball, toque',
    },
    compactDocumentCount: {
      title: 'Ocultar recuento de categorías',
      description: 'Muestra el recuento de documentos sin el número secundario por categoría.',
      tags: 'recuento simplificado, número único, menos desorden',
    },
    compactTags: {
      title: 'Etiquetas compactas',
      description: 'Determina si las etiquetas se muestran como categorías individuales o como una categoría con cada etiqueta como una subcategoría.',
      tags: 'agrupación de etiquetas, carpeta de etiquetas únicas, etiquetas anidadas, jerarquía de etiquetas',
    },
    darkMode: {
      title: 'modo oscuro',
      description: 'Cambie entre el modo claro y oscuro para la aplicación.',
      tags: 'oscuro, claro, tema, tematización, color, colores',
    },
    disableCloseAfterSelectQuickSearch: {
      title: 'Dejar de cerrar después de la selección',
      description: 'Normalmente, la búsqueda rápida se cierra después de seleccionar un elemento. Activar esta función evita ese comportamiento, permitiéndole abrir varios resultados de búsqueda uno tras otro.',
      tags: 'mantener abierto, múltiples resultados, lote abierto, búsqueda rápida permanece abierta',
    },
    disableDocumentControlBar: {
      title: 'Deshabilitar la barra de control de documentos',
      description: 'Si desea maximizar su espacio de trabajo en el documento, puede desactivar la barra de botones superior con esta configuración. Los botones de control necesarios se moverán a la parte superior del cuerpo del documento principal, mientras que se podrá acceder al resto de la funcionalidad mediante combinaciones de teclas o mediante el menú de la aplicación en la parte superior izquierda.',
      tags: 'Ocultar barra de herramientas, maximizar espacio, ancho completo, encabezado de documento',
    },
    disableDocumentControlBarGuides: {
      title: 'Desactivar guías de documentos',
      description: 'Activa o desactiva las guías para principiantes en la barra de control de documentos.',
      tags: 'sugerencias para principiantes, pancartas de tutoriales, marcas de entrenador, ayuda de la barra de control',
    },
    disableDocumentCounts: {
      title: 'Ocultar el recuento de documentos por completo',
      description: 'Oculta toda la información del recuento de documentos en el árbol jerárquico.',
      tags: 'Totales desactivados, sin recuentos, estadísticas ocultas.',
    },
    disableDocumentToolTips: {
      title: 'Deshabilitar la información sobre herramientas del documento',
      description: 'Si no le gustan las descripciones emergentes de la vista de documentos, puede desactivarlas globalmente aquí.',
      tags: 'texto al pasar el cursor, ayuda de campo, ventana emergente, sugerencias para ver documentos',
    },
    disableQuickSearchCategoryPrecheck: {
      title: 'No verificar previamente el filtro de categoría',
      description: 'Normalmente, las categorías se incluyen en la búsqueda rápida. Habilitar esta opción revierte ese comportamiento.',
      tags: 'filtro de categoría, alcance de búsqueda, incluir categorías, filtro predeterminado',
    },
    disableSpellCheck: {
      title: 'Desactivar el corrector ortográfico',
      description: 'Desactiva la revisión ortográfica, gramatical y de palabras en el modo de edición de documentos.',
      tags: 'ortografía, gramática, revisiones, subrayado rojo, escritura, diccionario',
      note: '¡Necesita reiniciar completamente la aplicación para que surta efecto!',
    },
    doNotCollapseTreeOptions: {
      title: 'Prevenir el colapso de subniveles en el árbol.',
      description: 'Impide que se cierren las subcategorías del árbol jerárquico cuando se cierra una categoría principal.',
      tags: 'recordar expandido, anidado abierto, acordeón, colapsar niños',
    },
    doubleDashDocCount: {
      title: 'Divisor de recuento pronunciado',
      description: 'Esta configuración agrega otro carácter \\\\| entre la categoría y el recuento de documentos en el árbol jerárquico.',
      tags: 'canalización, delimitador, separador, formato de recuento, recuentos de árboles',
    },
    hideAdvSearchCheatsheetButton: {
      title: 'Ocultar botón de ayuda para relaciones',
      description: 'Oculta el botón de ayuda de la hoja de referencia de búsqueda avanzada en los campos de tipo de relación.',
      tags: 'campo de relación, hoja de referencia, icono de ayuda, selector de enlaces, búsqueda avanzada',
    },
    hideDeadCrossThrough: {
      title: 'Ocultar tachado',
      description: 'Esta configuración oculta el efecto de tachado en documentos muertos, desaparecidos o destruidos para aumentar la visibilidad.',
      tags: 'tachado, fallecido, destruido, desaparecido, estado del documento, tachado',
    },
    hideDocumentTitles: {
      title: 'Ocultar títulos de documentos',
      description: 'Oculta los títulos de las secciones grandes en la vista del documento. Tenga en cuenta que esto puede dar lugar a cambios de diseño relativamente bruscos, lo que puede hacer que el documento parezca rebelde en algunos casos.',
      tags: 'encabezados de sección, grupos de campos, etiquetas de estructura de documento',
    },
    hideEmptyFields: {
      title: 'Ocultar campos vacíos',
      description: 'Oculta campos sin ningún valor completado, en modo de visualización (sin edición). Tenga en cuenta que esto puede dar lugar a cambios de diseño relativamente bruscos, lo que puede hacer que el documento parezca rebelde en algunos casos.',
      tags: 'campos en blanco, vista de solo lectura, documento compacto, cambio de diseño',
    },
    hideHierarchyTree: {
      title: 'Ocultar árbol jerárquico',
      description: 'Controla si se muestra el árbol jerárquico.',
      tags: 'barra lateral desactivada, navegador oculto, panel de árbol, contorno oculto',
    },
    hidePlushes: {
      title: 'Ocultar mascota de Fantasía',
      description: 'Oculta la increíblemente adorable e impresionante Fantasía, el pequeño dragón arcano. ¡Cómo pudiste! :(',
      tags: 'dragón, mascota, felpa, personaje, decoración, huevo de Pascua',
    },
    hideTooltipsProject: {
      title: 'Ocultar sugerencias sobre la descripción general del proyecto',
      description: 'Oculta la tarjeta de información de consejos y trucos de descripción general del proyecto.',
      tags: 'inicio del proyecto, tarjeta del panel de control, sugerencias generales',
    },
    hideTooltipsStart: {
      title: 'Ocultar ventana emergente de sugerencias en la pantalla de inicio',
      description: 'Oculta la ventana emergente de consejos y trucos de la pantalla de inicio.',
      tags: 'primer lanzamiento, incorporación, presentación, consejos de inicio, trucos',
    },
    hideTreeExtraIcons: {
      title: 'Ocultar iconos adicionales',
      description: 'Oculta los íconos que normalmente se muestran por conveniencia pero que no agregan funcionalidad; por ejemplo, el ícono "Abrir documento" al lado de un documento sin nodos secundarios, que también se puede abrir con un clic izquierdo normal en lugar del ícono.',
      tags: 'iconos redundantes, desorden, árbol mínimo, acciones opcionales',
    },
    hideTreeIconAddUnder: {
      title: 'Ocultar el ícono "Agregar debajo"',
      description: 'Esta opción oculta el icono "Agregar un nuevo documento debajo del padre seleccionado".',
      tags: 'agregar niño, nuevo debajo, más debajo, crear debajo',
    },
    hideTreeIconEdit: {
      title: 'Ocultar el icono "Editar"',
      description: 'Esta opción oculta el icono Editar fila.',
      tags: 'icono de lápiz, fila de edición, árbol de edición rápida',
    },
    hideTreeIconView: {
      title: 'Ocultar el icono "Abrir"',
      description: 'Esta opción oculta el icono Abrir fila.',
      tags: 'icono de abrir, ir al documento, botón de abrir fila',
    },
    hideTreeOrderNumbers: {
      title: 'Ocultar números de pedido',
      description: 'Oculta los números de pedido personalizados a la izquierda de los nombres.',
      tags: 'índice de secuencia, orden manual, prefijo de clasificación, canal izquierdo',
    },
    hideRecentProjectTooltip: {
      title: 'Ocultar información sobre herramientas "Examinar los últimos proyectos"',
      description: 'Oculta la información sobre herramientas en el cursor de exploración de últimos proyectos junto a Reanudar el último proyecto en la pantalla de bienvenida.',
      tags: 'proyecto, cargar, cargando, último, reciente, introducción, inicio, bienvenido, información sobre herramientas, ventana emergente, información sobre herramientas, ventana emergente',
    },
    hideWelcomeScreenSocials: {
      title: 'Ocultar enlaces sociales de la pantalla de bienvenida',
      description: 'Oculta todos los enlaces sociales en la pantalla de bienvenida.',
      tags: 'discordia, twitter, enlaces comunitarios, redes sociales, bienvenido',
    },
    skipWelcomeScreen: {
      title: 'Saltar pantalla de bienvenida',
      description: 'Omite la pantalla de bienvenida e intenta cargar el proyecto más reciente directamente al iniciar la aplicación.',
      tags: 'proyecto, cargar, cargando, último, reciente, introducción, inicio, bienvenido',
    },
    invertCategoryPosition: {
      title: 'Invertir posición de categoría',
      description: 'Cambia las posiciones de la categoría y los números de documento.',
      tags: 'intercambiar números, orden de conteo, categoría versus conteo de documentos',
    },
    invertTreeSorting: {
      title: 'Invertir ordenación personalizada del árbol',
      description: 'Ordena los documentos en el árbol jerárquico en la dirección opuesta a la predeterminada: de mayor a menor.',
      tags: 'orden inverso, orden personalizado, dirección de clasificación, ascendente descendente',
    },
    limitEditorHeight: {
      title: 'Limitar la altura del editor de texto',
      description: 'Determina si el editor de texto tiene una altura limitada cuando no está en modo de pantalla completa.',
      tags: 'altura del área de texto, texto largo, editor expandido, editor de desplazamiento',
    },
    logFullActivityPayload: {
      title: 'Registrar carga útil completa de actividad',
      description: 'Si esto está habilitado, la actividad registrará cargas útiles completas en todas las situaciones (normalmente se registra solo en situaciones sin errores ni advertencias). Esto puede resultar útil cuando se realiza una depuración profunda que necesita un registro preciso de los resultados.',
      tags: 'depuración, solución de problemas, DevTools, carga útil, actividad, registro',
    },
    noProjectName: {
      title: 'Ocultar el nombre del proyecto en el árbol',
      description: 'Determina si el nombre del proyecto se muestra en el árbol jerárquico.',
      tags: 'etiqueta raíz, árbol de título del proyecto, ocultar encabezado',
    },
    noTags: {
      title: 'Ocultar etiquetas en el árbol',
      description: 'Determina si las etiquetas se muestran en el árbol jerárquico.',
      tags: 'etiquetas desactivadas, tira de etiquetas, etiquetas de árbol, ocultar etiquetas',
    },
    preventAutoScroll: {
      title: 'Evitar el desplazamiento automático',
      description: 'Determina si los documentos recuerdan sus posiciones de desplazamiento y se desplazan automáticamente al cambiar entre ellos.',
      tags: 'posición de desplazamiento, recordar desplazamiento, saltar al principio, cambiar de pestaña',
    },
    preventFilledNoteBoardPopup: {
      title: 'Evitar que se muestre el cuaderno lleno',
      description: 'Cuando está habilitado, el bloc de notas no se abrirá automáticamente al iniciar la aplicación cuando todavía contenga notas de sesiones FA anteriores.',
      tags: 'notas adhesivas, bloc de notas, inicio, apertura automática, recordatorios',
    },
    preventPreviewsDocuments: {
      title: 'Evitar vistas previas de documentos',
      description: 'Controla si las vistas previas rápidas al pasar el mouse se muestran en la vista del documento y en los campos de relación.',
      tags: 'tarjeta flotante, vistazo, ventana emergente de relación, vista previa en línea',
    },
    preventPreviewsPopups: {
      title: 'Evitar vistas previas de documentos en cuadros de diálogo',
      description: 'Controla si se muestran vistas previas rápidas al pasar el mouse al seleccionar documentos en cuadros de diálogo (por ejemplo, el selector de documentos existentes).',
      tags: 'cuadro de diálogo de documento existente, selector de desplazamiento, selector de documentos, vista previa modal',
    },
    preventPreviewsTabs: {
      title: 'Evitar vistas previas de documentos en pestañas',
      description: 'Controla si las vistas previas rápidas al pasar el mouse se muestran en las pestañas del documento en la barra de pestañas.',
      tags: 'desplazamiento sobre la pestaña, vista previa de la barra de pestañas, vista previa de la barra de título',
    },
    preventPreviewsTree: {
      title: 'Evitar vistas previas de documentos al pasar el mouse',
      description: 'Controla si las vistas previas rápidas al pasar el mouse se muestran en el árbol jerárquico. Cuando las vistas previas al pasar el mouse permanecen habilitadas, pueden tener un impacto importante en el rendimiento de la aplicación.',
      tags: 'desplazamiento del árbol, retraso, lento, fps, rendimiento, vista previa de la barra lateral',
      note: '¡Puede tener un gran impacto en el rendimiento de la aplicación!',
    },
    showDocumentID: {
      title: 'Mostrar ID de documentos',
      description: 'Si esto está habilitado, el cuerpo del documento también mostrará el valor de ID del documento interno.',
      tags: 'depuración, identificación interna, identificador, herramientas de desarrollo, solución de problemas',
    },
    tagsAtTop: {
      title: 'Etiquetas principales en el árbol',
      description: 'Muestra etiquetas en la parte superior del árbol jerárquico.',
      tags: 'orden de etiquetas, etiquetas primero, categorías anteriores',
    },
    textShadow: {
      title: 'Sombra de texto',
      description: 'Esta configuración alterna las sombras del texto en el árbol jerárquico, las ventanas emergentes de búsqueda de relaciones y las pestañas, lo que permite una apariencia más destacada del texto sobre el fondo.',
      tags: 'contraste, legibilidad, sombra, contorno, legibilidad, claridad del texto',
    }
  }
}
