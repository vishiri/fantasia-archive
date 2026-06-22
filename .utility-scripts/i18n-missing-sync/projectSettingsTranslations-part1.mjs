/**
 * Curated translations for Project Settings dialog and related missing locale keys (part 1).
 * Locales: de, fr, es, it, pt
 */

export const PROJECT_SETTINGS_BY_LOCALE = {
  de: {
    title: 'Projekteinstellungen',
    closeButton: 'Schließen ohne zu speichern',
    saveButton: 'Einstellungen speichern',
    'saveErrors.tooltipIntro': 'Speichern nicht möglich. Folgende Fehler wurden gefunden:',
    'saveErrors.bulletWorldNameRequired': 'Weltname ist für „{worldLabel}" erforderlich.',
    'saveErrors.bulletDuplicatePalette': 'Doppelte Farben in der Farbpalette von „{worldLabel}" gefunden.',
    'saveErrors.bulletDocumentTemplateNameRequired': 'Dokumentvorlagenname ist für „{templateLabel}" erforderlich.',
    'saveErrors.bulletWorldTemplateGroupNameRequired': 'Vorlagengruppenname ist für „{worldLabel}" erforderlich.',
    'saveErrors.bulletWorldTemplateDuplicateDocumentTemplate': 'Doppelte Dokumentvorlage „{templateLabel}" in „{worldLabel}".',
    'categories.generalSettings.title': 'Allgemeine Einstellungen',
    'categories.worldsSettings.title': 'Welten',
    'categories.documentTemplatesSettings.title': 'Dokumentvorlagen',
    'fields.projectName.title': 'Projektname',
    'fields.projectName.label': 'Projektname',
    'fields.projectName.errorRequired': 'Projektname ist erforderlich.',
    'fields.worldName.title': 'Weltname',
    'fields.worldName.label': 'Weltname',
    'fields.worldName.errorRequired': 'Weltname ist erforderlich.',
    'fields.worldColor.title': 'Farbe',
    'fields.worldColor.label': 'Weltenfarbe',
    'fields.worldColor.tooltip': 'Diese Farbe bestimmt, wie Ihre Welt an verschiedenen Stellen im Projekt erscheint — Symbole, Text und ähnliche UI-Elemente.',
    'fields.worldColorPalette.label': 'Welten-Farbpalette',
    'fields.worldColorPalette.tooltipIntro': 'Mit der Farbpalette können Sie Farben vordefinieren, die später im gesamten Projekt verwendet werden, ohne sie jedes Mal manuell auswählen zu müssen. Dies ermöglicht dokumentübergreifende Konsistenz, wenn erforderlich.',
    'fields.worldColorPalette.tooltipRightClickIntro': 'Weitere Aktionen sind per Rechtsklick auf einzelne Farben verfügbar:',
    'fields.worldColorPalette.tooltipRightClickDeletion': 'Löschen',
    'fields.worldColorPalette.tooltipRightClickDuplication': 'Duplizieren',
    'fields.worldColorPalette.addButton': 'Farbe hinzufügen',
    'fields.worldColorPalette.contextMenu.duplicateColor': 'Farbe duplizieren',
    'fields.worldColorPalette.contextMenu.deleteColor': 'Farbe löschen',
    'fields.worldTemplateLayout.layoutTitle': 'Hierarchischer Baum der Welt',
    'fields.worldTemplateLayout.availableTemplatesTitle': 'Verfügbare Dokumentvorlagen',
    'fields.worldTemplateLayout.availableTemplatesFilterAriaLabel': 'Verfügbare Dokumentvorlagen filtern',
    'fields.worldTemplateLayout.availableTemplatesFilterClearAriaLabel': 'Filter für verfügbare Dokumentvorlagen löschen',
    'fields.worldTemplateLayout.availableTemplatesFilterPlaceholder': 'Suchen…',
    'fields.worldTemplateLayout.emptyFilteredAvailableTemplates': 'Keine Dokumentvorlagen entsprechen Ihrer Suche.',
    'fields.worldTemplateLayout.addGroupButton': 'Gruppe hinzufügen',
    'fields.worldTemplateLayout.defaultNewGroupName': 'Neue Gruppe',
    'fields.worldTemplateLayout.editGroupTooltip': 'Gruppe umbenennen',
    'fields.worldTemplateLayout.editTemplateTooltip': 'Spitzname der Vorlage anpassen',
    'fields.worldTemplateLayout.emptyAvailableTemplates': 'Alle Dokumentvorlagen sind dieser Welt zugewiesen.',
    'fields.worldTemplateLayout.groupNameErrorRequired': 'Gruppenname ist erforderlich.',
    'fields.worldTemplateLayout.groupRenameInputLabel': 'Name der Gruppe',
    'fields.worldTemplateLayout.placementNicknameHoverOriginalNameLabel': 'Originalname',
    'fields.worldTemplateLayout.placementNicknameHoverNicknameLabel': 'Spitzname',
    'fields.worldTemplateLayout.removeGroupTooltip': 'Gruppe entfernen',
    'fields.worldTemplateLayout.removeTemplateTooltip': 'Dokumentvorlage entfernen',
    'fields.worldTemplateLayout.templateCanonicalNameLabel': 'Dokumentvorlagenname',
    'fields.worldTemplateLayout.templateCanonicalNameTooltip': 'Um eine gesamte Dokumentvorlage ordnungsgemäß umzubenennen, gehen Sie bitte zum Abschnitt „Dokumentvorlagen" dieses Bearbeitungsdialogs und passen Sie sie dort an.',
    'fields.worldTemplateLayout.templateNicknameLabel': 'Spitzname in dieser Welt',
    'fields.worldTemplateLayout.templateNicknameTooltip': 'Mit einem Spitznamen können Sie eine Dokumentvorlage innerhalb einer bestimmten Welt schnell umbenennen, ohne ihren echten Namen im gesamten Projekt zu ändern.',
    'fields.worldTemplateLayout.contextMenu.renameGroup': 'Gruppe umbenennen',
    'fields.worldTemplateLayout.contextMenu.deleteGroup': 'Gruppe löschen',
    'fields.worldTemplateLayout.renameDialog.title': 'Gruppe umbenennen',
    'fields.worldTemplateLayout.renameDialog.confirmButton': 'Umbenennen',
    'fields.documentTemplateName.title': 'Dokumentvorlagenname',
    'fields.documentTemplateName.label': 'Dokumentvorlagenname',
    'fields.documentTemplateName.errorRequired': 'Mindestens eine Übersetzung des Dokumentvorlagentitels ist erforderlich.',
    'fields.documentTemplateName.fallbackWarningTooltip':
      'Für dieses Feld fehlt die Übersetzung in der aktuellen Sprache.\nFallback verwendet: {fallbackLanguageName}',
    'fields.documentTemplateTitleTranslations.tooltip': 'Übersetzungen bearbeiten',
    'fields.documentTemplateWorldAppendix.title': 'Welt-Anhang',
    'fields.documentTemplateWorldAppendix.label': 'Welt-Anhang',
    'fields.documentTemplateWorldAppendix.tooltip': 'Der Welt-Anhang ist eine kurze, eindeutige Beschreibung für Ihre Dokumentvorlage, wenn sie einzelnen Welten zugeordnet ist. Dies verhindert Verwechslungen, wenn mehrere Dokumentvorlagen in verschiedenen Welten denselben Namen tragen. Der Anhang hilft Ihnen, sie auf einen Blick zu unterscheiden. Dieses Feld erscheint nur auf dem Welten-Tab bei der Zuordnung von Vorlagen zu Welten, sonst nirgends.',
    'fields.documentTemplateIcon.title': 'Symbol',
    'fields.documentTemplateIcon.label': 'Symbol',
    'panels.worlds.title': 'Welten des Projekts',
    'panels.worlds.addWorldButton': 'Welt hinzufügen',
    'panels.worlds.defaultNewWorldName': 'Neue Welt',
    'panels.worlds.deleteWorldButton': 'Welt löschen',
    'panels.worlds.emptyFilteredWorlds': 'Keine Welten entsprechen Ihrer Suche.',
    'panels.worlds.filterAriaLabel': 'Welten filtern',
    'panels.worlds.filterClearAriaLabel': 'Weltenfilter löschen',
    'panels.worlds.filterPlaceholder': 'Suchen…',
    'panels.worlds.deleteConfirm.confirmDeleteButton': 'Löschen bestätigen',
    'panels.worlds.deleteConfirm.message': 'Möchten Sie diese Welt wirklich löschen? Dokumente und Einstellungen, die mit ihr verknüpft sind, können danach nicht wiederhergestellt werden. Sie gehen für immer verloren.',
    'panels.worlds.removeDisabledHasDocuments': 'Entfernen Sie Dokumente aus dieser Welt, bevor Sie sie löschen.',
    'panels.worlds.removeDisabledLastWorld': 'Ein Projekt muss jederzeit mindestens eine Welt haben. Erstellen Sie zuerst eine weitere, um diese zu löschen.',
    'panels.documentTemplates.title': 'Dokumentvorlagen',
    'panels.documentTemplates.addFirstTemplateButton': 'Erste Vorlage hinzufügen',
    'panels.documentTemplates.addTemplateButton': 'Dokumentvorlage hinzufügen',
    'panels.documentTemplates.defaultNewTemplateName': 'Neue Dokumentvorlage',
    'panels.documentTemplates.deleteTemplateButton': 'Vorlage löschen',
    'panels.documentTemplates.emptyFilteredTemplates': 'Keine Dokumentvorlagen entsprechen Ihrer Suche.',
    'panels.documentTemplates.filterAriaLabel': 'Dokumentvorlagen filtern',
    'panels.documentTemplates.filterClearAriaLabel': 'Filter für Dokumentvorlagen löschen',
    'panels.documentTemplates.filterPlaceholder': 'Suchen…',
    'panels.documentTemplates.missingTranslationsTabTooltip':
      'Einige Übersetzungen für die aktuell ausgewählte Sprache fehlen in dieser Dokumentvorlage.',
    'panels.documentTemplates.deleteConfirm.confirmDeleteButton': 'Löschen bestätigen',
    'panels.documentTemplates.deleteConfirm.message': 'Möchten Sie diese Dokumentvorlage wirklich löschen? Alle Felder, die in anderen Vorlagen mit dieser Vorlage verbunden sind, funktionieren nicht mehr. Außerdem zeigen alle verbundenen Dokumente ihre Daten nicht mehr an, falls welche mit dieser Vorlage ausgefüllt wurden. Diese Löschung kann unbeabsichtigte Nebenwirkungen haben.',
    'panels.documentTemplates.removeDisabledHasDocuments': 'Entfernen Sie Dokumente, die diese Vorlage verwenden, bevor Sie sie löschen.'
  },
  fr: {
    title: 'Paramètres du projet',
    closeButton: 'Fermer sans enregistrer',
    saveButton: 'Enregistrer les paramètres',
    'saveErrors.tooltipIntro': 'Impossible d\'enregistrer. Les erreurs suivantes ont été détectées :',
    'saveErrors.bulletWorldNameRequired': 'Le nom du monde est requis pour « {worldLabel} ».',
    'saveErrors.bulletDuplicatePalette': 'Couleurs en double trouvées dans la palette de « {worldLabel} ».',
    'saveErrors.bulletDocumentTemplateNameRequired': 'Le nom du modèle de document est requis pour « {templateLabel} ».',
    'saveErrors.bulletWorldTemplateGroupNameRequired': 'Le nom du groupe de modèles est requis pour « {worldLabel} ».',
    'saveErrors.bulletWorldTemplateDuplicateDocumentTemplate': 'Modèle de document en double « {templateLabel} » dans « {worldLabel} ».',
    'categories.generalSettings.title': 'Paramètres généraux',
    'categories.worldsSettings.title': 'Mondes',
    'categories.documentTemplatesSettings.title': 'Modèles de documents',
    'fields.projectName.title': 'Nom du projet',
    'fields.projectName.label': 'Nom du projet',
    'fields.projectName.errorRequired': 'Le nom du projet est requis.',
    'fields.worldName.title': 'Nom du monde',
    'fields.worldName.label': 'Nom du monde',
    'fields.worldName.errorRequired': 'Le nom du monde est requis.',
    'fields.worldColor.title': 'Couleur',
    'fields.worldColor.label': 'Couleur du monde',
    'fields.worldColor.tooltip': 'Cette couleur détermine l\'apparence de votre monde à divers endroits du projet — icônes, texte et éléments d\'interface similaires.',
    'fields.worldColorPalette.label': 'Palette de couleurs du monde',
    'fields.worldColorPalette.tooltipIntro': 'La palette de couleurs vous permet de prédéfinir des couleurs qui seront ensuite utilisées dans l\'ensemble du projet sans avoir à les sélectionner manuellement à chaque fois. Cela permet une cohérence inter-documents lorsque cela est nécessaire.',
    'fields.worldColorPalette.tooltipRightClickIntro': 'D\'autres actions sont disponibles en cliquant avec le bouton droit sur des couleurs individuelles :',
    'fields.worldColorPalette.tooltipRightClickDeletion': 'Suppression',
    'fields.worldColorPalette.tooltipRightClickDuplication': 'Duplication',
    'fields.worldColorPalette.addButton': 'Ajouter une couleur',
    'fields.worldColorPalette.contextMenu.duplicateColor': 'Dupliquer la couleur',
    'fields.worldColorPalette.contextMenu.deleteColor': 'Supprimer la couleur',
    'fields.worldTemplateLayout.layoutTitle': 'Arbre hiérarchique du monde',
    'fields.worldTemplateLayout.availableTemplatesTitle': 'Modèles de documents disponibles',
    'fields.worldTemplateLayout.availableTemplatesFilterAriaLabel': 'Filtrer les modèles de documents disponibles',
    'fields.worldTemplateLayout.availableTemplatesFilterClearAriaLabel': 'Effacer le filtre des modèles de documents disponibles',
    'fields.worldTemplateLayout.availableTemplatesFilterPlaceholder': 'Rechercher…',
    'fields.worldTemplateLayout.emptyFilteredAvailableTemplates': 'Aucun modèle de document ne correspond à votre recherche.',
    'fields.worldTemplateLayout.addGroupButton': 'Ajouter un groupe',
    'fields.worldTemplateLayout.defaultNewGroupName': 'Nouveau groupe',
    'fields.worldTemplateLayout.editGroupTooltip': 'Renommer le groupe',
    'fields.worldTemplateLayout.editTemplateTooltip': 'Ajuster le surnom du modèle',
    'fields.worldTemplateLayout.emptyAvailableTemplates': 'Tous les modèles de documents sont assignés à ce monde.',
    'fields.worldTemplateLayout.groupNameErrorRequired': 'Le nom du groupe est requis.',
    'fields.worldTemplateLayout.groupRenameInputLabel': 'Nom du groupe',
    'fields.worldTemplateLayout.placementNicknameHoverOriginalNameLabel': 'Nom d\'origine',
    'fields.worldTemplateLayout.placementNicknameHoverNicknameLabel': 'Surnom',
    'fields.worldTemplateLayout.removeGroupTooltip': 'Supprimer le groupe',
    'fields.worldTemplateLayout.removeTemplateTooltip': 'Supprimer le modèle de document',
    'fields.worldTemplateLayout.templateCanonicalNameLabel': 'Nom du modèle de document',
    'fields.worldTemplateLayout.templateCanonicalNameTooltip': 'Pour renommer correctement un modèle de document entier, veuillez vous rendre dans la section « Modèles de documents » de cette boîte de dialogue de modification et l\'ajuster là-bas.',
    'fields.worldTemplateLayout.templateNicknameLabel': 'Surnom dans ce monde',
    'fields.worldTemplateLayout.templateNicknameTooltip': 'Définir un surnom vous permet de renommer rapidement un modèle de document dans un monde spécifique sans modifier son vrai nom dans l\'ensemble du projet.',
    'fields.worldTemplateLayout.contextMenu.renameGroup': 'Renommer le groupe',
    'fields.worldTemplateLayout.contextMenu.deleteGroup': 'Supprimer le groupe',
    'fields.worldTemplateLayout.renameDialog.title': 'Renommer le groupe',
    'fields.worldTemplateLayout.renameDialog.confirmButton': 'Renommer',
    'fields.documentTemplateName.title': 'Nom du modèle de document',
    'fields.documentTemplateName.label': 'Nom du modèle de document',
    'fields.documentTemplateName.errorRequired': 'Au moins une traduction du titre du modèle de document est requise.',
    'fields.documentTemplateName.fallbackWarningTooltip':
      'Ce champ n\'a pas de traduction dans la langue actuelle.\nFallback utilisé : {fallbackLanguageName}',
    'fields.documentTemplateTitleTranslations.tooltip': 'Modifier les traductions',
    'fields.documentTemplateWorldAppendix.title': 'Annexe du monde',
    'fields.documentTemplateWorldAppendix.label': 'Annexe du monde',
    'fields.documentTemplateWorldAppendix.tooltip': 'L\'annexe du monde est une courte description unique pour votre modèle de document lorsqu\'il est associé à des mondes individuels. Cela évite la confusion lorsque plusieurs modèles de documents portent le même nom dans différents mondes. L\'annexe vous aide à les distinguer d\'un coup d\'œil. Ce champ n\'apparaît que dans l\'onglet Mondes lors de l\'association des modèles aux mondes, nulle part ailleurs.',
    'fields.documentTemplateIcon.title': 'Icône',
    'fields.documentTemplateIcon.label': 'Icône',
    'panels.worlds.title': 'Mondes du projet',
    'panels.worlds.addWorldButton': 'Ajouter un monde',
    'panels.worlds.defaultNewWorldName': 'Nouveau monde',
    'panels.worlds.deleteWorldButton': 'Supprimer le monde',
    'panels.worlds.emptyFilteredWorlds': 'Aucun monde ne correspond à votre recherche.',
    'panels.worlds.filterAriaLabel': 'Filtrer les mondes',
    'panels.worlds.filterClearAriaLabel': 'Effacer le filtre des mondes',
    'panels.worlds.filterPlaceholder': 'Rechercher…',
    'panels.worlds.deleteConfirm.confirmDeleteButton': 'Confirmer la suppression',
    'panels.worlds.deleteConfirm.message': 'Voulez-vous vraiment supprimer ce monde ? Les documents et paramètres qui y sont liés ne pourront pas être récupérés par la suite. Ils seront perdus à jamais.',
    'panels.worlds.removeDisabledHasDocuments': 'Supprimez les documents de ce monde avant de le supprimer.',
    'panels.worlds.removeDisabledLastWorld': 'Un projet doit toujours avoir au moins un monde. Créez-en un autre d\'abord pour supprimer celui-ci.',
    'panels.documentTemplates.title': 'Modèles de documents',
    'panels.documentTemplates.addFirstTemplateButton': 'Ajouter votre premier modèle',
    'panels.documentTemplates.addTemplateButton': 'Ajouter un modèle de document',
    'panels.documentTemplates.defaultNewTemplateName': 'Nouveau modèle de document',
    'panels.documentTemplates.deleteTemplateButton': 'Supprimer le modèle',
    'panels.documentTemplates.emptyFilteredTemplates': 'Aucun modèle de document ne correspond à votre recherche.',
    'panels.documentTemplates.filterAriaLabel': 'Filtrer les modèles de documents',
    'panels.documentTemplates.filterClearAriaLabel': 'Effacer le filtre des modèles de documents',
    'panels.documentTemplates.filterPlaceholder': 'Rechercher…',
    'panels.documentTemplates.missingTranslationsTabTooltip':
      'Certaines traductions pour la langue actuellement sélectionnée manquent dans ce modèle de document.',
    'panels.documentTemplates.deleteConfirm.confirmDeleteButton': 'Confirmer la suppression',
    'panels.documentTemplates.deleteConfirm.message': 'Voulez-vous vraiment supprimer ce modèle de document ? Tous les champs connectés à ce modèle dans d\'autres modèles cesseront de fonctionner. De plus, tous les documents connectés cesseront d\'afficher leurs données s\'ils ont été remplis à l\'aide de ce modèle. Cette suppression peut avoir des effets secondaires involontaires.',
    'panels.documentTemplates.removeDisabledHasDocuments': 'Supprimez les documents utilisant ce modèle avant de le supprimer.'
  },
  es: {
    title: 'Configuración del proyecto',
    closeButton: 'Cerrar sin guardar',
    saveButton: 'Guardar configuración',
    'saveErrors.tooltipIntro': 'No se puede guardar. Se encontraron los siguientes errores:',
    'saveErrors.bulletWorldNameRequired': 'El nombre del mundo es obligatorio para «{worldLabel}».',
    'saveErrors.bulletDuplicatePalette': 'Colores duplicados encontrados en la paleta de «{worldLabel}».',
    'saveErrors.bulletDocumentTemplateNameRequired': 'El nombre de la plantilla de documento es obligatorio para «{templateLabel}».',
    'saveErrors.bulletWorldTemplateGroupNameRequired': 'El nombre del grupo de plantillas es obligatorio para «{worldLabel}».',
    'saveErrors.bulletWorldTemplateDuplicateDocumentTemplate': 'Plantilla de documento duplicada «{templateLabel}» en «{worldLabel}».',
    'categories.generalSettings.title': 'Configuración general',
    'categories.worldsSettings.title': 'Mundos',
    'categories.documentTemplatesSettings.title': 'Plantillas de documentos',
    'fields.projectName.title': 'Nombre del proyecto',
    'fields.projectName.label': 'Nombre del proyecto',
    'fields.projectName.errorRequired': 'El nombre del proyecto es obligatorio.',
    'fields.worldName.title': 'Nombre del mundo',
    'fields.worldName.label': 'Nombre del mundo',
    'fields.worldName.errorRequired': 'El nombre del mundo es obligatorio.',
    'fields.worldColor.title': 'Color',
    'fields.worldColor.label': 'Color del mundo',
    'fields.worldColor.tooltip': 'Este color determina cómo aparece su mundo en varios lugares del proyecto: iconos, texto y elementos de interfaz similares.',
    'fields.worldColorPalette.label': 'Paleta de colores del mundo',
    'fields.worldColorPalette.tooltipIntro': 'La paleta de colores le permite predefinir colores que se utilizarán más adelante en todo el proyecto sin tener que seleccionarlos manualmente cada vez. Esto permite la coherencia entre documentos cuando sea necesario.',
    'fields.worldColorPalette.tooltipRightClickIntro': 'Más acciones disponibles al hacer clic con el botón derecho en colores individuales:',
    'fields.worldColorPalette.tooltipRightClickDeletion': 'Eliminación',
    'fields.worldColorPalette.tooltipRightClickDuplication': 'Duplicación',
    'fields.worldColorPalette.addButton': 'Agregar color',
    'fields.worldColorPalette.contextMenu.duplicateColor': 'Duplicar color',
    'fields.worldColorPalette.contextMenu.deleteColor': 'Eliminar color',
    'fields.worldTemplateLayout.layoutTitle': 'Árbol jerárquico del mundo',
    'fields.worldTemplateLayout.availableTemplatesTitle': 'Plantillas de documentos disponibles',
    'fields.worldTemplateLayout.availableTemplatesFilterAriaLabel': 'Filtrar plantillas de documentos disponibles',
    'fields.worldTemplateLayout.availableTemplatesFilterClearAriaLabel': 'Borrar filtro de plantillas de documentos disponibles',
    'fields.worldTemplateLayout.availableTemplatesFilterPlaceholder': 'Buscar…',
    'fields.worldTemplateLayout.emptyFilteredAvailableTemplates': 'Ninguna plantilla de documento coincide con su búsqueda.',
    'fields.worldTemplateLayout.addGroupButton': 'Agregar grupo',
    'fields.worldTemplateLayout.defaultNewGroupName': 'Nuevo grupo',
    'fields.worldTemplateLayout.editGroupTooltip': 'Renombrar grupo',
    'fields.worldTemplateLayout.editTemplateTooltip': 'Ajustar apodo de la plantilla',
    'fields.worldTemplateLayout.emptyAvailableTemplates': 'Todas las plantillas de documentos están asignadas a este mundo.',
    'fields.worldTemplateLayout.groupNameErrorRequired': 'El nombre del grupo es obligatorio.',
    'fields.worldTemplateLayout.groupRenameInputLabel': 'Nombre del grupo',
    'fields.worldTemplateLayout.placementNicknameHoverOriginalNameLabel': 'Nombre original',
    'fields.worldTemplateLayout.placementNicknameHoverNicknameLabel': 'Apodo',
    'fields.worldTemplateLayout.removeGroupTooltip': 'Eliminar grupo',
    'fields.worldTemplateLayout.removeTemplateTooltip': 'Eliminar plantilla de documento',
    'fields.worldTemplateLayout.templateCanonicalNameLabel': 'Nombre de la plantilla de documento',
    'fields.worldTemplateLayout.templateCanonicalNameTooltip': 'Para renombrar correctamente una plantilla de documento completa, vaya a la sección «Plantillas de documentos» de este cuadro de diálogo de edición y ajústela allí.',
    'fields.worldTemplateLayout.templateNicknameLabel': 'Apodo dentro de este mundo',
    'fields.worldTemplateLayout.templateNicknameTooltip': 'Establecer un apodo le permite renombrar rápidamente una plantilla de documento dentro de un mundo específico sin cambiar su nombre real en todo el proyecto.',
    'fields.worldTemplateLayout.contextMenu.renameGroup': 'Renombrar grupo',
    'fields.worldTemplateLayout.contextMenu.deleteGroup': 'Eliminar grupo',
    'fields.worldTemplateLayout.renameDialog.title': 'Renombrar grupo',
    'fields.worldTemplateLayout.renameDialog.confirmButton': 'Renombrar',
    'fields.documentTemplateName.title': 'Nombre de la plantilla de documento',
    'fields.documentTemplateName.label': 'Nombre de la plantilla de documento',
    'fields.documentTemplateName.errorRequired': 'Se requiere al menos una traducción del título de la plantilla de documento.',
    'fields.documentTemplateName.fallbackWarningTooltip':
      'A este campo le falta la traducción del idioma actual.\nFallback usado: {fallbackLanguageName}',
    'fields.documentTemplateTitleTranslations.tooltip': 'Editar traducciones',
    'fields.documentTemplateWorldAppendix.title': 'Apéndice del mundo',
    'fields.documentTemplateWorldAppendix.label': 'Apéndice del mundo',
    'fields.documentTemplateWorldAppendix.tooltip': 'El apéndice del mundo es una descripción breve y única para su plantilla de documento cuando se empareja con mundos individuales. Esto evita confusiones cuando varias plantillas de documentos comparten el mismo nombre en distintos mundos. El apéndice le ayuda a distinguirlas de un vistazo. Este campo aparece solo en la pestaña de mundos al emparejar plantillas con mundos, en ningún otro lugar.',
    'fields.documentTemplateIcon.title': 'Icono',
    'fields.documentTemplateIcon.label': 'Icono',
    'panels.worlds.title': 'Mundos del proyecto',
    'panels.worlds.addWorldButton': 'Agregar mundo',
    'panels.worlds.defaultNewWorldName': 'Nuevo mundo',
    'panels.worlds.deleteWorldButton': 'Eliminar mundo',
    'panels.worlds.emptyFilteredWorlds': 'Ningún mundo coincide con su búsqueda.',
    'panels.worlds.filterAriaLabel': 'Filtrar mundos',
    'panels.worlds.filterClearAriaLabel': 'Borrar filtro de mundos',
    'panels.worlds.filterPlaceholder': 'Buscar…',
    'panels.worlds.deleteConfirm.confirmDeleteButton': 'Confirmar eliminación',
    'panels.worlds.deleteConfirm.message': '¿Está seguro de que desea eliminar este mundo? Los documentos y la configuración vinculados a él no se podrán recuperar después. Se perderán para siempre.',
    'panels.worlds.removeDisabledHasDocuments': 'Elimine los documentos de este mundo antes de eliminarlo.',
    'panels.worlds.removeDisabledLastWorld': 'Un proyecto debe tener al menos un mundo en todo momento. Cree otro primero para eliminar este.',
    'panels.documentTemplates.title': 'Plantillas de documentos',
    'panels.documentTemplates.addFirstTemplateButton': 'Agregar su primera plantilla',
    'panels.documentTemplates.addTemplateButton': 'Agregar plantilla de documento',
    'panels.documentTemplates.defaultNewTemplateName': 'Nueva plantilla de documento',
    'panels.documentTemplates.deleteTemplateButton': 'Eliminar plantilla',
    'panels.documentTemplates.emptyFilteredTemplates': 'Ninguna plantilla de documento coincide con su búsqueda.',
    'panels.documentTemplates.filterAriaLabel': 'Filtrar plantillas de documentos',
    'panels.documentTemplates.filterClearAriaLabel': 'Borrar filtro de plantillas de documentos',
    'panels.documentTemplates.filterPlaceholder': 'Buscar…',
    'panels.documentTemplates.missingTranslationsTabTooltip':
      'Faltan algunas traducciones para el idioma seleccionado actualmente en esta plantilla de documento.',
    'panels.documentTemplates.deleteConfirm.confirmDeleteButton': 'Confirmar eliminación',
    'panels.documentTemplates.deleteConfirm.message': '¿Está seguro de que desea eliminar esta plantilla de documento? Todos los campos conectados a esta plantilla en cualquier otra plantilla dejarán de funcionar. Además, todos los documentos conectados dejarán de mostrar sus datos si se rellenaron con esta plantilla. Esta eliminación puede tener efectos secundarios no deseados.',
    'panels.documentTemplates.removeDisabledHasDocuments': 'Elimine los documentos que usan esta plantilla antes de eliminarla.'
  },
  it: {
    title: 'Impostazioni del progetto',
    closeButton: 'Chiudi senza salvare',
    saveButton: 'Salva impostazioni',
    'saveErrors.tooltipIntro': 'Impossibile salvare. Sono stati rilevati i seguenti errori:',
    'saveErrors.bulletWorldNameRequired': 'Il nome del mondo è obbligatorio per «{worldLabel}».',
    'saveErrors.bulletDuplicatePalette': 'Colori duplicati trovati nella tavolozza di «{worldLabel}».',
    'saveErrors.bulletDocumentTemplateNameRequired': 'Il nome del modello di documento è obbligatorio per «{templateLabel}».',
    'saveErrors.bulletWorldTemplateGroupNameRequired': 'Il nome del gruppo di modelli è obbligatorio per «{worldLabel}».',
    'saveErrors.bulletWorldTemplateDuplicateDocumentTemplate': 'Modello di documento duplicato «{templateLabel}» in «{worldLabel}».',
    'categories.generalSettings.title': 'Impostazioni generali',
    'categories.worldsSettings.title': 'Mondi',
    'categories.documentTemplatesSettings.title': 'Modelli di documento',
    'fields.projectName.title': 'Nome del progetto',
    'fields.projectName.label': 'Nome del progetto',
    'fields.projectName.errorRequired': 'Il nome del progetto è obbligatorio.',
    'fields.worldName.title': 'Nome del mondo',
    'fields.worldName.label': 'Nome del mondo',
    'fields.worldName.errorRequired': 'Il nome del mondo è obbligatorio.',
    'fields.worldColor.title': 'Colore',
    'fields.worldColor.label': 'Colore del mondo',
    'fields.worldColor.tooltip': 'Questo colore determina l\'aspetto del mondo in vari punti del progetto — icone, testo e elementi dell\'interfaccia simili.',
    'fields.worldColorPalette.label': 'Tavolozza colori del mondo',
    'fields.worldColorPalette.tooltipIntro': 'La tavolozza colori consente di predefinire colori che verranno utilizzati in seguito nell\'intero progetto senza doverli selezionare manualmente ogni volta. Ciò permette coerenza tra documenti quando necessario.',
    'fields.worldColorPalette.tooltipRightClickIntro': 'Altre azioni disponibili con clic destro sui singoli colori:',
    'fields.worldColorPalette.tooltipRightClickDeletion': 'Eliminazione',
    'fields.worldColorPalette.tooltipRightClickDuplication': 'Duplicazione',
    'fields.worldColorPalette.addButton': 'Aggiungi colore',
    'fields.worldColorPalette.contextMenu.duplicateColor': 'Duplica colore',
    'fields.worldColorPalette.contextMenu.deleteColor': 'Elimina colore',
    'fields.worldTemplateLayout.layoutTitle': 'Albero gerarchico del mondo',
    'fields.worldTemplateLayout.availableTemplatesTitle': 'Modelli di documento disponibili',
    'fields.worldTemplateLayout.availableTemplatesFilterAriaLabel': 'Filtra modelli di documento disponibili',
    'fields.worldTemplateLayout.availableTemplatesFilterClearAriaLabel': 'Cancella filtro modelli di documento disponibili',
    'fields.worldTemplateLayout.availableTemplatesFilterPlaceholder': 'Cerca…',
    'fields.worldTemplateLayout.emptyFilteredAvailableTemplates': 'Nessun modello di documento corrisponde alla ricerca.',
    'fields.worldTemplateLayout.addGroupButton': 'Aggiungi gruppo',
    'fields.worldTemplateLayout.defaultNewGroupName': 'Nuovo gruppo',
    'fields.worldTemplateLayout.editGroupTooltip': 'Rinomina gruppo',
    'fields.worldTemplateLayout.editTemplateTooltip': 'Modifica soprannome del modello',
    'fields.worldTemplateLayout.emptyAvailableTemplates': 'Tutti i modelli di documento sono assegnati a questo mondo.',
    'fields.worldTemplateLayout.groupNameErrorRequired': 'Il nome del gruppo è obbligatorio.',
    'fields.worldTemplateLayout.groupRenameInputLabel': 'Nome del gruppo',
    'fields.worldTemplateLayout.placementNicknameHoverOriginalNameLabel': 'Nome originale',
    'fields.worldTemplateLayout.placementNicknameHoverNicknameLabel': 'Soprannome',
    'fields.worldTemplateLayout.removeGroupTooltip': 'Rimuovi gruppo',
    'fields.worldTemplateLayout.removeTemplateTooltip': 'Rimuovi modello di documento',
    'fields.worldTemplateLayout.templateCanonicalNameLabel': 'Nome del modello di documento',
    'fields.worldTemplateLayout.templateCanonicalNameTooltip': 'Per rinominare correttamente un intero modello di documento, andare alla sezione «Modelli di documento» di questa finestra di modifica e modificarlo lì.',
    'fields.worldTemplateLayout.templateNicknameLabel': 'Soprannome in questo mondo',
    'fields.worldTemplateLayout.templateNicknameTooltip': 'Impostare un soprannome consente di rinominare rapidamente un modello di documento all\'interno di un mondo specifico senza modificarne il nome reale in tutto il progetto.',
    'fields.worldTemplateLayout.contextMenu.renameGroup': 'Rinomina gruppo',
    'fields.worldTemplateLayout.contextMenu.deleteGroup': 'Elimina gruppo',
    'fields.worldTemplateLayout.renameDialog.title': 'Rinomina gruppo',
    'fields.worldTemplateLayout.renameDialog.confirmButton': 'Rinomina',
    'fields.documentTemplateName.title': 'Nome del modello di documento',
    'fields.documentTemplateName.label': 'Nome del modello di documento',
    'fields.documentTemplateName.errorRequired': 'È richiesta almeno una traduzione del titolo del modello di documento.',
    'fields.documentTemplateName.fallbackWarningTooltip':
      'A questo campo manca la traduzione nella lingua corrente.\nFallback utilizzato: {fallbackLanguageName}',
    'fields.documentTemplateTitleTranslations.tooltip': 'Modifica traduzioni',
    'fields.documentTemplateWorldAppendix.title': 'Appendice del mondo',
    'fields.documentTemplateWorldAppendix.label': 'Appendice del mondo',
    'fields.documentTemplateWorldAppendix.tooltip': 'L\'appendice del mondo è una breve descrizione univoca per il modello di documento quando è associato a singoli mondi. Evita confusione quando più modelli di documento condividono lo stesso nome in mondi diversi. L\'appendice aiuta a distinguerli a colpo d\'occhio. Questo campo appare solo nella scheda Mondi durante l\'associazione dei modelli ai mondi, da nessun\'altra parte.',
    'fields.documentTemplateIcon.title': 'Icona',
    'fields.documentTemplateIcon.label': 'Icona',
    'panels.worlds.title': 'Mondi del progetto',
    'panels.worlds.addWorldButton': 'Aggiungi mondo',
    'panels.worlds.defaultNewWorldName': 'Nuovo mondo',
    'panels.worlds.deleteWorldButton': 'Elimina mondo',
    'panels.worlds.emptyFilteredWorlds': 'Nessun mondo corrisponde alla ricerca.',
    'panels.worlds.filterAriaLabel': 'Filtra mondi',
    'panels.worlds.filterClearAriaLabel': 'Cancella filtro mondi',
    'panels.worlds.filterPlaceholder': 'Cerca…',
    'panels.worlds.deleteConfirm.confirmDeleteButton': 'Conferma eliminazione',
    'panels.worlds.deleteConfirm.message': 'Eliminare davvero questo mondo? I documenti e le impostazioni collegati non potranno essere recuperati in seguito. Andranno persi per sempre.',
    'panels.worlds.removeDisabledHasDocuments': 'Rimuovere i documenti da questo mondo prima di eliminarlo.',
    'panels.worlds.removeDisabledLastWorld': 'Un progetto deve avere sempre almeno un mondo. Crearne un altro prima di eliminare questo.',
    'panels.documentTemplates.title': 'Modelli di documento',
    'panels.documentTemplates.addFirstTemplateButton': 'Aggiungi il primo modello',
    'panels.documentTemplates.addTemplateButton': 'Aggiungi modello di documento',
    'panels.documentTemplates.defaultNewTemplateName': 'Nuovo modello di documento',
    'panels.documentTemplates.deleteTemplateButton': 'Elimina modello',
    'panels.documentTemplates.emptyFilteredTemplates': 'Nessun modello di documento corrisponde alla ricerca.',
    'panels.documentTemplates.filterAriaLabel': 'Filtra modelli di documento',
    'panels.documentTemplates.filterClearAriaLabel': 'Cancella filtro modelli di documento',
    'panels.documentTemplates.filterPlaceholder': 'Cerca…',
    'panels.documentTemplates.missingTranslationsTabTooltip':
      'Mancano alcune traduzioni per la lingua attualmente selezionata in questo modello di documento.',
    'panels.documentTemplates.deleteConfirm.confirmDeleteButton': 'Conferma eliminazione',
    'panels.documentTemplates.deleteConfirm.message': 'Eliminare davvero questo modello di documento? Tutti i campi collegati a questo modello in altri modelli smetteranno di funzionare. Inoltre, tutti i documenti collegati smetteranno di mostrare i dati se erano stati compilati con questo modello. Questa eliminazione può avere effetti collaterali indesiderati.',
    'panels.documentTemplates.removeDisabledHasDocuments': 'Rimuovere i documenti che usano questo modello prima di eliminarlo.'
  },
  pt: {
    title: 'Configurações do projeto',
    closeButton: 'Fechar sem salvar',
    saveButton: 'Salvar configurações',
    'saveErrors.tooltipIntro': 'Não foi possível salvar. Foram encontrados os seguintes erros:',
    'saveErrors.bulletWorldNameRequired': 'O nome do mundo é obrigatório para «{worldLabel}».',
    'saveErrors.bulletDuplicatePalette': 'Cores duplicadas encontradas na paleta de «{worldLabel}».',
    'saveErrors.bulletDocumentTemplateNameRequired': 'O nome do modelo de documento é obrigatório para «{templateLabel}».',
    'saveErrors.bulletWorldTemplateGroupNameRequired': 'O nome do grupo de modelos é obrigatório para «{worldLabel}».',
    'saveErrors.bulletWorldTemplateDuplicateDocumentTemplate': 'Modelo de documento duplicado «{templateLabel}» em «{worldLabel}».',
    'categories.generalSettings.title': 'Configurações gerais',
    'categories.worldsSettings.title': 'Mundos',
    'categories.documentTemplatesSettings.title': 'Modelos de documento',
    'fields.projectName.title': 'Nome do projeto',
    'fields.projectName.label': 'Nome do projeto',
    'fields.projectName.errorRequired': 'O nome do projeto é obrigatório.',
    'fields.worldName.title': 'Nome do mundo',
    'fields.worldName.label': 'Nome do mundo',
    'fields.worldName.errorRequired': 'O nome do mundo é obrigatório.',
    'fields.worldColor.title': 'Cor',
    'fields.worldColor.label': 'Cor do mundo',
    'fields.worldColor.tooltip': 'Esta cor determina como o seu mundo aparece em vários lugares do projeto — ícones, texto e elementos de interface semelhantes.',
    'fields.worldColorPalette.label': 'Paleta de cores do mundo',
    'fields.worldColorPalette.tooltipIntro': 'A paleta de cores permite predefinir cores que serão usadas posteriormente em todo o projeto sem precisar selecioná-las manualmente a cada vez. Isso permite consistência entre documentos quando necessário.',
    'fields.worldColorPalette.tooltipRightClickIntro': 'Mais ações disponíveis ao clicar com o botão direito em cores individuais:',
    'fields.worldColorPalette.tooltipRightClickDeletion': 'Exclusão',
    'fields.worldColorPalette.tooltipRightClickDuplication': 'Duplicação',
    'fields.worldColorPalette.addButton': 'Adicionar cor',
    'fields.worldColorPalette.contextMenu.duplicateColor': 'Duplicar cor',
    'fields.worldColorPalette.contextMenu.deleteColor': 'Excluir cor',
    'fields.worldTemplateLayout.layoutTitle': 'Árvore hierárquica do mundo',
    'fields.worldTemplateLayout.availableTemplatesTitle': 'Modelos de documento disponíveis',
    'fields.worldTemplateLayout.availableTemplatesFilterAriaLabel': 'Filtrar modelos de documento disponíveis',
    'fields.worldTemplateLayout.availableTemplatesFilterClearAriaLabel': 'Limpar filtro de modelos de documento disponíveis',
    'fields.worldTemplateLayout.availableTemplatesFilterPlaceholder': 'Pesquisar…',
    'fields.worldTemplateLayout.emptyFilteredAvailableTemplates': 'Nenhum modelo de documento corresponde à sua pesquisa.',
    'fields.worldTemplateLayout.addGroupButton': 'Adicionar grupo',
    'fields.worldTemplateLayout.defaultNewGroupName': 'Novo grupo',
    'fields.worldTemplateLayout.editGroupTooltip': 'Renomear grupo',
    'fields.worldTemplateLayout.editTemplateTooltip': 'Ajustar apelido do modelo',
    'fields.worldTemplateLayout.emptyAvailableTemplates': 'Todos os modelos de documento estão atribuídos a este mundo.',
    'fields.worldTemplateLayout.groupNameErrorRequired': 'O nome do grupo é obrigatório.',
    'fields.worldTemplateLayout.groupRenameInputLabel': 'Nome do grupo',
    'fields.worldTemplateLayout.placementNicknameHoverOriginalNameLabel': 'Nome original',
    'fields.worldTemplateLayout.placementNicknameHoverNicknameLabel': 'Apelido',
    'fields.worldTemplateLayout.removeGroupTooltip': 'Remover grupo',
    'fields.worldTemplateLayout.removeTemplateTooltip': 'Remover modelo de documento',
    'fields.worldTemplateLayout.templateCanonicalNameLabel': 'Nome do modelo de documento',
    'fields.worldTemplateLayout.templateCanonicalNameTooltip': 'Para renomear corretamente um modelo de documento inteiro, acesse a seção «Modelos de documento» desta caixa de diálogo de edição e ajuste-o lá.',
    'fields.worldTemplateLayout.templateNicknameLabel': 'Apelido neste mundo',
    'fields.worldTemplateLayout.templateNicknameTooltip': 'Definir um apelido permite renomear rapidamente um modelo de documento dentro de um mundo específico sem alterar o nome real em todo o projeto.',
    'fields.worldTemplateLayout.contextMenu.renameGroup': 'Renomear grupo',
    'fields.worldTemplateLayout.contextMenu.deleteGroup': 'Excluir grupo',
    'fields.worldTemplateLayout.renameDialog.title': 'Renomear grupo',
    'fields.worldTemplateLayout.renameDialog.confirmButton': 'Renomear',
    'fields.documentTemplateName.title': 'Nome do modelo de documento',
    'fields.documentTemplateName.label': 'Nome do modelo de documento',
    'fields.documentTemplateName.errorRequired': 'Pelo menos uma tradução do título do modelo de documento é obrigatória.',
    'fields.documentTemplateName.fallbackWarningTooltip':
      'Este campo não tem tradução no idioma atual.\nFallback usado: {fallbackLanguageName}',
    'fields.documentTemplateTitleTranslations.tooltip': 'Editar traduções',
    'fields.documentTemplateWorldAppendix.title': 'Apêndice do mundo',
    'fields.documentTemplateWorldAppendix.label': 'Apêndice do mundo',
    'fields.documentTemplateWorldAppendix.tooltip': 'O apêndice do mundo é uma descrição curta e única para o seu modelo de documento quando ele é associado a mundos individuais. Isso evita confusão quando vários modelos de documento compartilham o mesmo nome em mundos diferentes. O apêndice ajuda a distingui-los rapidamente. Este campo aparece apenas na aba Mundos ao associar modelos a mundos, em nenhum outro lugar.',
    'fields.documentTemplateIcon.title': 'Ícone',
    'fields.documentTemplateIcon.label': 'Ícone',
    'panels.worlds.title': 'Mundos do projeto',
    'panels.worlds.addWorldButton': 'Adicionar mundo',
    'panels.worlds.defaultNewWorldName': 'Novo mundo',
    'panels.worlds.deleteWorldButton': 'Excluir mundo',
    'panels.worlds.emptyFilteredWorlds': 'Nenhum mundo corresponde à sua pesquisa.',
    'panels.worlds.filterAriaLabel': 'Filtrar mundos',
    'panels.worlds.filterClearAriaLabel': 'Limpar filtro de mundos',
    'panels.worlds.filterPlaceholder': 'Pesquisar…',
    'panels.worlds.deleteConfirm.confirmDeleteButton': 'Confirmar exclusão',
    'panels.worlds.deleteConfirm.message': 'Tem certeza de que deseja excluir este mundo? Documentos e configurações vinculados a ele não poderão ser recuperados depois. Serão perdidos para sempre.',
    'panels.worlds.removeDisabledHasDocuments': 'Remova os documentos deste mundo antes de excluí-lo.',
    'panels.worlds.removeDisabledLastWorld': 'Um projeto deve ter pelo menos um mundo o tempo todo. Crie outro primeiro para excluir este.',
    'panels.documentTemplates.title': 'Modelos de documento',
    'panels.documentTemplates.addFirstTemplateButton': 'Adicionar seu primeiro modelo',
    'panels.documentTemplates.addTemplateButton': 'Adicionar modelo de documento',
    'panels.documentTemplates.defaultNewTemplateName': 'Novo modelo de documento',
    'panels.documentTemplates.deleteTemplateButton': 'Excluir modelo',
    'panels.documentTemplates.emptyFilteredTemplates': 'Nenhum modelo de documento corresponde à sua pesquisa.',
    'panels.documentTemplates.filterAriaLabel': 'Filtrar modelos de documento',
    'panels.documentTemplates.filterClearAriaLabel': 'Limpar filtro de modelos de documento',
    'panels.documentTemplates.filterPlaceholder': 'Pesquisar…',
    'panels.documentTemplates.missingTranslationsTabTooltip':
      'Algumas traduções para o idioma selecionado atualmente estão ausentes neste modelo de documento.',
    'panels.documentTemplates.deleteConfirm.confirmDeleteButton': 'Confirmar exclusão',
    'panels.documentTemplates.deleteConfirm.message': 'Tem certeza de que deseja excluir este modelo de documento? Todos os campos conectados a este modelo em qualquer outro modelo deixarão de funcionar. Além disso, todos os documentos conectados deixarão de exibir seus dados se algum foi preenchido usando este modelo. Esta exclusão pode ter efeitos colaterais indesejados.',
    'panels.documentTemplates.removeDisabledHasDocuments': 'Remova os documentos que usam este modelo antes de excluí-lo.'
  }
}

export const SMALL_LOCALE_STRINGS = {
  de: {
    faProjectSettings: {
      bridgeMissing: 'Projekteinstellungen sind in dieser Umgebung nicht verfügbar.',
      loadError: 'Beim Laden der Projekteinstellungen ist ein Fehler aufgetreten. Details finden Sie in den DevTools.',
      saveError: 'Beim Speichern der Projekteinstellungen ist ein Fehler aufgetreten. Details finden Sie in den DevTools.',
      saveMismatchLog: 'Abweichung der Projekteinstellungen nach dem Speichern',
      saveSuccess: 'Projekteinstellungen erfolgreich gespeichert.'
    },
    faColorPickerInput: {
      appendToWorldPaletteDuplicateTooltip: 'Diese Farbe existiert bereits in der Farbpalette der Welt.',
      appendToWorldPaletteTooltip: 'Diese Farbe zur Farbpalette der Welt hinzufügen.'
    },
    faIconPickerInput: {
      emptyResultsMessage: 'Keine Symbole entsprechen Ihrer Suche.',
      searchPlaceholder: 'Symbole durchsuchen',
      triggerTooltipClick: 'Klicken, um Symbol auszuwählen',
      triggerTooltipCurrentIcon: 'Aktuelles Symbol: {iconName}'
    },
    projectOverview: {
      noActiveProjectName: 'Kein Projekt geladen',
      projectOverviewFor: 'Projektübersicht für'
    },
    logFullActivityPayload: {
      title: 'Vollständige Aktivitätsnutzlast protokollieren',
      description:
        'Wenn aktiviert, protokolliert die Aktivität vollständige Nutzlasten. Dies kann bei der Fehlersuche nützlich sein, wenn präzise Protokollierung von Ergebnissen erforderlich ist.',
      tags: 'Debug, Fehlersuche, DevTools, Nutzlast, Aktivität, Protokollierung'
    },
    faActionManager: {
      labels: {
        openProjectSettingsDialog: 'Projekteinstellungen öffnen',
        saveProjectSettings: 'Projekteinstellungen speichern'
      }
    },
    socialContactButtons: {
      buttonReddit: {
        label: 'Reddit'
      }
    }
  },
  fr: {
    faProjectSettings: {
      bridgeMissing: 'Les paramètres du projet ne sont pas disponibles dans cet environnement.',
      loadError: 'Une erreur s\'est produite lors du chargement des paramètres du projet. Consultez les DevTools pour plus de détails.',
      saveError: 'Une erreur s\'est produite lors de l\'enregistrement des paramètres du projet. Consultez les DevTools pour plus de détails.',
      saveMismatchLog: 'Incohérence des paramètres du projet après enregistrement',
      saveSuccess: 'Paramètres du projet enregistrés avec succès.'
    },
    faColorPickerInput: {
      appendToWorldPaletteDuplicateTooltip: 'Cette couleur existe déjà dans la palette du monde.',
      appendToWorldPaletteTooltip: 'Ajouter cette couleur à la palette du monde.'
    },
    faIconPickerInput: {
      emptyResultsMessage: 'Aucune icône ne correspond à votre recherche.',
      searchPlaceholder: 'Rechercher des icônes',
      triggerTooltipClick: 'Cliquer pour choisir une icône',
      triggerTooltipCurrentIcon: 'Icône actuelle : {iconName}'
    },
    projectOverview: {
      noActiveProjectName: 'Aucun projet chargé',
      projectOverviewFor: 'Aperçu du projet pour'
    },
    logFullActivityPayload: {
      title: 'Journaliser la charge utile complète de l\'activité',
      description:
        'Si activé, l\'activité journalisera les charges utiles complètes. Cela peut être utile pour un débogage approfondi nécessitant une journalisation précise des résultats.',
      tags: 'débogage, dépannage, DevTools, charge utile, activité, journalisation'
    },
    faActionManager: {
      labels: {
        openProjectSettingsDialog: 'Ouvrir les paramètres du projet',
        saveProjectSettings: 'Enregistrer les paramètres du projet'
      }
    },
    socialContactButtons: {
      buttonReddit: {
        label: 'Reddit'
      }
    }
  },
  es: {
    faProjectSettings: {
      bridgeMissing: 'La configuración del proyecto no está disponible en este entorno.',
      loadError: 'Se produjo un error al cargar la configuración del proyecto. Consulte DevTools para obtener detalles.',
      saveError: 'Se produjo un error al guardar la configuración del proyecto. Consulte DevTools para obtener detalles.',
      saveMismatchLog: 'Discrepancia en la configuración del proyecto después de guardar',
      saveSuccess: 'Configuración del proyecto guardada correctamente.'
    },
    faColorPickerInput: {
      appendToWorldPaletteDuplicateTooltip: 'Este color ya existe en la paleta del mundo.',
      appendToWorldPaletteTooltip: 'Agregar este color a la paleta del mundo.'
    },
    faIconPickerInput: {
      emptyResultsMessage: 'Ningún icono coincide con su búsqueda.',
      searchPlaceholder: 'Buscar iconos',
      triggerTooltipClick: 'Hacer clic para elegir icono',
      triggerTooltipCurrentIcon: 'Icono actual: {iconName}'
    },
    projectOverview: {
      noActiveProjectName: 'Ningún proyecto cargado',
      projectOverviewFor: 'Resumen del proyecto para'
    },
    logFullActivityPayload: {
      title: 'Registrar carga útil completa de actividad',
      description:
        'Si está habilitado, la actividad registrará cargas útiles completas. Esto puede ser útil al depurar en profundidad y necesitar un registro preciso de los resultados.',
      tags: 'depuración, solución de problemas, DevTools, carga útil, actividad, registro'
    },
    faActionManager: {
      labels: {
        openProjectSettingsDialog: 'Abrir configuración del proyecto',
        saveProjectSettings: 'Guardar configuración del proyecto'
      }
    },
    socialContactButtons: {
      buttonReddit: {
        label: 'Reddit'
      }
    }
  },
  it: {
    faProjectSettings: {
      bridgeMissing: 'Le impostazioni del progetto non sono disponibili in questo ambiente.',
      loadError: 'Si è verificato un errore durante il caricamento delle impostazioni del progetto. Consultare DevTools per i dettagli.',
      saveError: 'Si è verificato un errore durante il salvataggio delle impostazioni del progetto. Consultare DevTools per i dettagli.',
      saveMismatchLog: 'Discrepanza delle impostazioni del progetto dopo il salvataggio',
      saveSuccess: 'Impostazioni del progetto salvate correttamente.'
    },
    faColorPickerInput: {
      appendToWorldPaletteDuplicateTooltip: 'Questo colore esiste già nella tavolozza del mondo.',
      appendToWorldPaletteTooltip: 'Aggiungi questo colore alla tavolozza del mondo.'
    },
    faIconPickerInput: {
      emptyResultsMessage: 'Nessuna icona corrisponde alla ricerca.',
      searchPlaceholder: 'Cerca icone',
      triggerTooltipClick: 'Fare clic per scegliere l\'icona',
      triggerTooltipCurrentIcon: 'Icona corrente: {iconName}'
    },
    projectOverview: {
      noActiveProjectName: 'Nessun progetto caricato',
      projectOverviewFor: 'Panoramica del progetto per'
    },
    logFullActivityPayload: {
      title: 'Registra payload completo dell\'attività',
      description:
        'Se abilitato, l\'attività registrerà payload completi. Può essere utile per un debug approfondito che richiede una registrazione precisa dei risultati.',
      tags: 'debug, risoluzione problemi, DevTools, payload, attività, registrazione'
    },
    faActionManager: {
      labels: {
        openProjectSettingsDialog: 'Apri impostazioni del progetto',
        saveProjectSettings: 'Salva impostazioni del progetto'
      }
    },
    socialContactButtons: {
      buttonReddit: {
        label: 'Reddit'
      }
    }
  },
  pt: {
    faProjectSettings: {
      bridgeMissing: 'As configurações do projeto não estão disponíveis neste ambiente.',
      loadError: 'Ocorreu um erro ao carregar as configurações do projeto. Consulte o DevTools para obter detalhes.',
      saveError: 'Ocorreu um erro ao salvar as configurações do projeto. Consulte o DevTools para obter detalhes.',
      saveMismatchLog: 'Incompatibilidade nas configurações do projeto após salvar',
      saveSuccess: 'Configurações do projeto salvas com sucesso.'
    },
    faColorPickerInput: {
      appendToWorldPaletteDuplicateTooltip: 'Esta cor já existe na paleta do mundo.',
      appendToWorldPaletteTooltip: 'Adicionar esta cor à paleta do mundo.'
    },
    faIconPickerInput: {
      emptyResultsMessage: 'Nenhum ícone corresponde à sua pesquisa.',
      searchPlaceholder: 'Pesquisar ícones',
      triggerTooltipClick: 'Clique para escolher ícone',
      triggerTooltipCurrentIcon: 'Ícone atual: {iconName}'
    },
    projectOverview: {
      noActiveProjectName: 'Nenhum projeto carregado',
      projectOverviewFor: 'Visão geral do projeto para'
    },
    logFullActivityPayload: {
      title: 'Registrar carga útil completa da atividade',
      description:
        'Se habilitado, a atividade registrará cargas úteis completas. Isso pode ser útil em depuração profunda que exige registro preciso dos resultados.',
      tags: 'depuração, solução de problemas, DevTools, carga útil, atividade, registro'
    },
    faActionManager: {
      labels: {
        openProjectSettingsDialog: 'Abrir configurações do projeto',
        saveProjectSettings: 'Salvar configurações do projeto'
      }
    },
    socialContactButtons: {
      buttonReddit: {
        label: 'Reddit'
      }
    }
  }
}
