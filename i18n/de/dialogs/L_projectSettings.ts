export default {
  title: 'Projekteinstellungen',
  closeButton: 'Schließen ohne zu speichern',
  saveButton: 'Einstellungen speichern',
  saveWithoutClosingButton: 'Speichern ohne zu schließen',
  saveErrors: {
    tooltipIntro: 'Speichern nicht möglich. Folgende Fehler wurden gefunden:',
    bulletWorldNameRequired: 'Weltname ist für „{worldLabel}" erforderlich.',
    bulletDuplicatePalette: 'Doppelte Farben in der Farbpalette von „{worldLabel}" gefunden.',
    bulletDocumentTemplateNameRequired: 'Dokumentvorlagenname ist für „{templateLabel}" erforderlich.',
    bulletWorldTemplateGroupNameRequired: 'Vorlagengruppenname ist für „{worldLabel}" erforderlich.',
    bulletWorldTemplateDuplicateDocumentTemplate: 'Doppelte Dokumentvorlage „{templateLabel}" in „{worldLabel}".'
  },
  singularPluralMissing: {
    bothIntro: 'Fehlende Übersetzungen für die aktuelle Sprache:',
    singularBullet: 'Singularform fehlt',
    pluralBullet: 'Pluralform fehlt',
    usingFallback: 'Fallback verwendet: {fallbackLanguageName}'
  },
  categories: {
    generalSettings: {
      title: 'Allgemeine Einstellungen'
    },
    worldsSettings: {
      title: 'Welten'
    },
    documentTemplatesSettings: {
      title: 'Dokumentvorlagen'
    }
  },
  fields: {
    projectName: {
      title: 'Projektname',
      label: 'Projektname',
      errorRequired: 'Projektname ist erforderlich.'
    },
    worldName: {
      title: 'Weltname',
      label: 'Weltname',
      errorRequired: 'Weltname ist erforderlich.'
    },
    worldColor: {
      title: 'Farbe',
      label: 'Weltenfarbe',
      tooltip: 'Diese Farbe bestimmt, wie Ihre Welt an verschiedenen Stellen im Projekt erscheint — Symbole, Text und ähnliche UI-Elemente.',
      helpAriaLabel: 'Hilfe zur Weltfarbe'
    },
    worldColorPalette: {
      label: 'Welten-Farbpalette',
      tooltipIntro: 'Mit der Farbpalette können Sie Farben vordefinieren, die später im gesamten Projekt verwendet werden, ohne sie jedes Mal manuell auswählen zu müssen. Dies ermöglicht dokumentübergreifende Konsistenz, wenn erforderlich.',
      tooltipRightClickIntro: 'Weitere Aktionen sind per Rechtsklick auf einzelne Farben verfügbar:',
      tooltipRightClickDeletion: 'Löschen',
      tooltipRightClickDuplication: 'Duplizieren',
      addButton: 'Farbe hinzufügen',
      helpAriaLabel: 'Hilfe zur Weltfarbpalette',
      swatchAriaLabel: 'Farbfeld {hex} bearbeiten',
      contextMenu: {
        duplicateColor: 'Farbe duplizieren',
        deleteColor: 'Farbe löschen'
      }
    },
    worldTemplateLayout: {
      layoutTitle: 'Hierarchischer Baum der Welt',
      availableTemplatesTitle: 'Verfügbare Dokumentvorlagen',
      availableTemplatesFilterAriaLabel: 'Verfügbare Dokumentvorlagen filtern',
      availableTemplatesFilterClearAriaLabel: 'Filter für verfügbare Dokumentvorlagen löschen',
      availableTemplatesFilterPlaceholder: 'Suchen…',
      emptyFilteredAvailableTemplates: 'Keine Dokumentvorlagen entsprechen Ihrer Suche.',
      addGroupButton: 'Gruppe hinzufügen',
      defaultNewGroupName: 'Neue Gruppe',
      editGroupTooltip: 'Gruppe umbenennen',
      editTemplateTooltip: 'Spitzname der Vorlage anpassen',
      emptyAvailableTemplates: 'Alle Dokumentvorlagen sind dieser Welt zugewiesen.',
      groupNameErrorRequired: 'Gruppenname ist erforderlich.',
      groupRenameInputLabel: 'Name der Gruppe',
      placementNicknameHoverOriginalNameLabel: 'Originalname',
      placementNicknameHoverNicknameLabel: 'Spitzname',
      removeGroupTooltip: 'Gruppe entfernen',
      removeTemplateDisabledHasDocuments:
        'Entfernen Sie alle mit dieser Vorlage verbundenen Dokumente, bevor Sie sie entfernen.',
      removeTemplateTooltip: 'Dokumentvorlage entfernen',
      templateCanonicalNameLabel: 'Dokumentvorlagenname',
      templateCanonicalNameTooltip: 'Um eine gesamte Dokumentvorlage ordnungsgemäß umzubenennen, gehen Sie bitte zum Abschnitt „Dokumentvorlagen" dieses Bearbeitungsdialogs und passen Sie sie dort an.',
      templateNicknameLabel: 'Spitzname in dieser Welt',
      templateNicknameTooltip: 'Mit einem Spitznamen können Sie eine Dokumentvorlage innerhalb einer bestimmten Welt schnell umbenennen, ohne ihren echten Namen im gesamten Projekt zu ändern.',
      missingGroupDisplayNameTreeTooltip:
        'Einige Übersetzungen für die aktuell ausgewählte Sprache fehlen bei diesem Gruppennamen.',
      missingPlacementNicknameTreeTooltip:
        'Einige Übersetzungen für die aktuell ausgewählte Sprache fehlen bei diesem Platzierungs-Spitznamen.',
      missingDocumentTemplateTitleTreeTooltip:
        'Einige Übersetzungen für die aktuell ausgewählte Sprache fehlen beim Titel dieser Dokumentvorlage.',
      contextMenu: {
        renameGroup: 'Gruppe umbenennen',
        deleteGroup: 'Gruppe löschen'
      },
      renameDialog: {
        title: 'Gruppe umbenennen',
        confirmButton: 'Umbenennen'
      }
    },
    documentTemplateName: {
      title: 'Dokumentvorlagenname',
      label: 'Dokumentvorlagenname',
      errorRequired: 'Mindestens eine Übersetzung des Dokumentvorlagentitels ist erforderlich.'
    },
    documentTemplateWorldAppendix: {
      title: 'Welt-Anhang',
      label: 'Welt-Anhang',
      tooltip: 'Der Welt-Anhang ist eine kurze, eindeutige Beschreibung für Ihre Dokumentvorlage, wenn sie einzelnen Welten zugeordnet ist. Dies verhindert Verwechslungen, wenn mehrere Dokumentvorlagen in verschiedenen Welten denselben Namen tragen. Der Anhang hilft Ihnen, sie auf einen Blick zu unterscheiden. Dieses Feld erscheint nur auf dem Welten-Tab bei der Zuordnung von Vorlagen zu Welten, sonst nirgends.',
      helpAriaLabel: 'Hilfe zum Weltanhang'
    },
    documentTemplateIcon: {
      title: 'Symbol',
      label: 'Symbol'
    }
  },
  panels: {
    worlds: {
      title: 'Welten des Projekts',
      addWorldButton: 'Welt hinzufügen',
      defaultNewWorldName: 'Neue Welt',
      deleteWorldButton: 'Welt löschen',
      emptyFilteredWorlds: 'Keine Welten entsprechen Ihrer Suche.',
      filterAriaLabel: 'Welten filtern',
      filterClearAriaLabel: 'Weltenfilter löschen',
      filterPlaceholder: 'Suchen…',
      missingTranslationsTabTooltip: 'Einige Übersetzungen für die aktuell ausgewählte Sprache fehlen in dieser Welt.',
      deleteConfirm: {
        confirmDeleteButton: 'Löschen bestätigen',
        message: 'Möchten Sie diese Welt wirklich löschen? Dokumente und Einstellungen, die mit ihr verknüpft sind, können danach nicht wiederhergestellt werden. Sie gehen für immer verloren.'
      },
      removeDisabledHasDocuments: 'Entfernen Sie Dokumente aus dieser Welt, bevor Sie sie löschen.',
      removeDisabledLastWorld: 'Ein Projekt muss jederzeit mindestens eine Welt haben. Erstellen Sie zuerst eine weitere, um diese zu löschen.'
    },
    documentTemplates: {
      title: 'Dokumentvorlagen',
      addFirstTemplateButton: 'Erste Vorlage hinzufügen',
      addTemplateButton: 'Dokumentvorlage hinzufügen',
      defaultNewTemplateName: 'Neue Dokumentvorlage',
      deleteTemplateButton: 'Vorlage löschen',
      emptyFilteredTemplates: 'Keine Dokumentvorlagen entsprechen Ihrer Suche.',
      filterAriaLabel: 'Dokumentvorlagen filtern',
      filterClearAriaLabel: 'Filter für Dokumentvorlagen löschen',
      filterPlaceholder: 'Suchen…',
      missingTranslationsTabTooltip: 'Einige Übersetzungen für die aktuell ausgewählte Sprache fehlen in dieser Dokumentvorlage.',
      deleteConfirm: {
        confirmDeleteButton: 'Löschen bestätigen',
        message: 'Möchten Sie diese Dokumentvorlage wirklich löschen? Alle Felder, die in anderen Vorlagen mit dieser Vorlage verbunden sind, funktionieren nicht mehr. Außerdem zeigen alle verbundenen Dokumente ihre Daten nicht mehr an, falls welche mit dieser Vorlage ausgefüllt wurden. Diese Löschung kann unbeabsichtigte Nebenwirkungen haben.'
      },
      removeDisabledHasDocuments: 'Entfernen Sie Dokumente, die diese Vorlage verwenden, bevor Sie sie löschen.'
    }
  }
}
