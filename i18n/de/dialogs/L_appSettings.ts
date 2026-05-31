export default {
  title: 'Fantasia Archive-Einstellungen',
  saveButton: 'Einstellungen speichern',
  closeButton: 'Schließen ohne zu speichern',
  settingsSearchPlaceholder: 'Durchsuchen Sie die Einstellungen...',
  searchNoResultsTitle: 'Kein Suchtreffer',
  searchNoResultsDescription: 'Fantasia hat leider keine Einstellungen gefunden, nach denen Sie gesucht haben. Versuchen Sie es vielleicht mit einem anderen Suchbegriff?',
  appOptionsCategories: {
    accessibility: {
      title: 'Zugänglichkeit',
      tags: 'a11y, Lesbarkeit, Sichtbarkeit, unterstützend',
      accessibility: {
        subtitle: 'Zugänglichkeit',
        tags: 'a11y, Lesbarkeit, Sichtbarkeit, unterstützend',
      }
    },
    developerSettings: {
      title: 'Entwicklereinstellungen',
      tags: 'Entwickler, Debug, Diagnose, intern',
      documentBody: {
        subtitle: 'Dokumentkörper',
        tags: 'Dokument-ID, Debug-Metadaten, interne Felder',
      }
    },
    documentViewEdit: {
      title: 'Dokumentansicht/Bearbeitung',
      tags: 'Dokumentseite, Ansichtsmodus, Bearbeitungsmodus, Reader',
      documentBody: {
        subtitle: 'Dokumentkörper',
        tags: 'Inhaltsbereich, Felder, Lesen, Editorbereich',
      },
      documentControlBar: {
        subtitle: 'Dokumentenkontrollleiste',
        tags: 'Symbolleiste, obere Leiste, Kopfzeile, Dokumentchrom',
      }
    },
    hierarchicalTree: {
      title: 'Hierarchischer Baum',
      tags: 'Seitenleiste, Gliederung, Navigator, Projektbaum',
      iconSettings: {
        subtitle: 'Symboleinstellungen',
        tags: 'Aktionssymbole, Baumschaltflächen, Zeilensymbole',
      },
      informationDisplaySettings: {
        subtitle: 'Einstellungen für die Informationsanzeige',
        tags: 'Zählungen, Zahlen, Bestellindex, Metadatenanzeige',
      },
      tagSettings: {
        subtitle: 'Tag-Einstellungen',
        tags: 'Beschriftungen, Tag-Anzeige, Tag-Gruppierung',
      },
      treeBehavior: {
        subtitle: 'Baumverhalten',
        tags: 'erweitern, reduzieren, alles erweitern, Interaktion',
      },
      treeSettings: {
        subtitle: 'Baumeinstellungen',
        tags: 'Baum-Panel, Sichtbarkeit der Seitenleiste, Baum-Layout',
      }
    },
    openedDocumentsTabs: {
      title: 'Dokumentregisterkarten öffnen',
      tags: 'Tab-Leiste, geöffnete Dateien, Multitasking',
      tabBehavior: {
        subtitle: 'Tab-Verhalten',
        tags: 'Tabs wechseln, Tabstrip, Hover-Verhalten',
      }
    },
    popupsFloatingWindows: {
      title: 'Popups und schwebende Fenster',
      tags: 'Dialoge, Überlagerungen, Modalitäten, Fenster',
      floatingWindows: {
        subtitle: 'Schwebende Fenster',
        tags: 'Abtrennen, Zweitfenster, Mehrfachfenster',
      },
      quickSearchDialog: {
        subtitle: 'Schnellsuchdialog',
        tags: 'Schnellsuche, Tastatursuche, Finder',
      },
      universalDialogSettings: {
        subtitle: 'Universelle Dialogeinstellungen',
        tags: 'alle Dialoge, globales Popup-Verhalten',
      }
    },
    visualAccessibility: {
      title: 'Visuals und App-weite Funktionalität',
      tags: 'Erscheinungsbild, Benutzeroberfläche, global, Benutzeroberfläche, Erscheinungsbild',
      applicationExtras: {
        subtitle: 'Anwendungsextras',
        tags: 'Maskottchen, Plüsch, Fantasia, Extras',
      },
      visualsAppwideFunctionality: {
        subtitle: 'Visuals und App-weite Funktionalität',
        tags: 'Thema, Chrom, Layout, allgemeine Optionen',
      }
    },
    projectOverview: {
      title: 'Seite: Projektübersicht',
      tags: 'Projektstart, Dashboard, Übersicht, Arbeitsbereich',
      projectOverviewBehavior: {
        subtitle: 'Verhalten der Projektübersicht',
        tags: 'Tipps, Tricks, Wussten Sie schon, Übersichtskarte',
      }
    },
    welcomeScreen: {
      title: 'Willkommensbildschirm',
      tags: 'Splash, Startbildschirm, Willkommen, erster Start, Startseite',
      welcomeScreenBehavior: {
        subtitle: 'Verhalten des Begrüßungsbildschirms',
        tags: 'Startup-Tipps, soziale Links, Onboarding, Splash',
      }
    }
  },
  appOptions: {
    aggressiveRelationshipFilter: {
      title: 'Auswahl aggressiver Beziehungen',
      description: 'Aktiviert den aggressiven Autosuggest-Modus für alle Beziehungssuchen in der gesamten App im Dokumentbearbeitungsmodus. Wenn diese Option nicht aktiviert ist, wird nach dem Filtern das erste Element in der Liste nicht automatisch ausgewählt. Wenn Sie diese Option aktivieren, wird diese Funktionalität hinzugefügt – was eine viel bequemere Auswahl vorhandener Dokumente ermöglicht, während beim Erstellen neuer Dokumente im Handumdrehen ein wenig Komfort eingebüßt wird.',
      tags: 'Autosuggest, Autovervollständigung, erste Übereinstimmung, Filterliste, Vorhandenes auswählen, Beziehungssuche',
    },
    allowQuickPopupSameKeyClose: {
      title: 'Schließen Sie schnelle Popups mit derselben Taste',
      description: 'Ermöglicht das Schließen der Schnellsuch- und Schnellhinzufügen-Popups mit derselben Tastenkombination, mit der sie geöffnet wurden.',
      tags: 'Verknüpfung umschalten, gleicher Hotkey, Popup schnell hinzufügen, schließen',
    },
    allowWiderScrollbars: {
      title: 'Breitere Bildlaufleisten',
      description: 'Diese Einstellung macht die Bildlaufleisten von FA breiter und ermöglicht daher manuelles Klicken und Scrollen direkt auf ihnen für Geräte, die das Standard-Scrollen nicht unterstützen (z. B. Mäuse ohne Scrollrad).',
      tags: 'Breite der Bildlaufleiste, Scrollen durch Klicken, Maus ohne Rad, Trackball, Touch',
    },
    compactDocumentCount: {
      title: 'Anzahl der Kategorien ausblenden',
      description: 'Zeigt die Anzahl der Dokumente ohne die sekundäre Nummer pro Kategorie an.',
      tags: 'vereinfachte Zählung, einzelne Zahl, weniger Unordnung',
    },
    compactTags: {
      title: 'Kompakte Tags',
      description: 'Legt fest, ob Tags als einzelne Kategorien oder als eine Kategorie mit jedem Tag als Unterkategorie angezeigt werden.',
      tags: 'Tag-Gruppierung, einzelner Tag-Ordner, verschachtelte Tags, Tag-Hierarchie',
    },
    darkMode: {
      title: 'Dunkler Modus',
      description: 'Wechseln Sie zwischen Hell- und Dunkelmodus für die App.',
      tags: 'dunkel, hell, Thema, Thematisierung, Farbe, Farben',
    },
    disableCloseAfterSelectQuickSearch: {
      title: 'Stoppen Sie das Schließen nach der Auswahl',
      description: 'Normalerweise wird die Schnellsuche geschlossen, nachdem ein Element ausgewählt wurde. Wenn Sie diese Funktion aktivieren, wird dieses Verhalten verhindert, sodass Sie mehrere Suchergebnisse nacheinander öffnen können.',
      tags: 'Offen halten, mehrere Ergebnisse, Batch offen, Schnellsuche bleibt geöffnet',
    },
    disableDocumentControlBar: {
      title: 'Dokumentkontrollleiste deaktivieren',
      description: 'Wenn Sie Ihren Arbeitsbereich im Dokument maximieren möchten, können Sie mit dieser Einstellung die obere Schaltflächenleiste deaktivieren. Die erforderlichen Steuerschaltflächen werden an den oberen Rand des Hauptdokumentkörpers verschoben, während der Rest der Funktionalität über Tastenkombinationen oder über das App-Menü oben links zugänglich ist.',
      tags: 'Symbolleiste ausblenden, Platz maximieren, volle Breite, Dokumentkopfzeile',
    },
    disableDocumentControlBarGuides: {
      title: 'Dokumentführungen deaktivieren',
      description: 'Schaltet die anfängerfreundlichen Hilfslinien in der Dokumentkontrollleiste ein oder aus.',
      tags: 'Anfängerhinweise, Tutorial-Banner, Trainernoten, Hilfe zur Steuerleiste',
    },
    disableDocumentCounts: {
      title: 'Dokumentanzahl vollständig ausblenden',
      description: 'Versteckt alle Informationen zur Dokumentanzahl in der hierarchischen Struktur.',
      tags: 'Summen aus, keine Zählungen, Statistiken ausgeblendet',
    },
    disableDocumentToolTips: {
      title: 'Dokument-Tooltips deaktivieren',
      description: 'Wenn Ihnen die Tooltips in der Dokumentansicht nicht gefallen, können Sie sie hier global deaktivieren.',
      tags: 'Hovertext, Feldhilfe, Popover, Hinweise zur Dokumentansicht',
    },
    disableQuickSearchCategoryPrecheck: {
      title: 'Überprüfen Sie den Kategoriefilter nicht vorab',
      description: 'Normalerweise werden Kategorien in die Schnellsuche einbezogen. Durch Aktivieren dieser Option wird dieses Verhalten umgekehrt.',
      tags: 'Kategoriefilter, Suchbereich, Kategorien einschließen, Standardfilter',
    },
    disableSpellCheck: {
      title: 'Rechtschreibprüfung deaktivieren',
      description: 'Deaktiviert die Rechtschreib-, Grammatik- und Wortprüfung im Dokumentbearbeitungsmodus.',
      tags: 'Rechtschreibung, Grammatik, Korrekturlesen, rote Unterstreichung, Schreiben, Wörterbuch',
      note: 'Erfordert einen vollständigen Neustart der App, um wirksam zu werden!',
    },
    doNotCollapseTreeOptions: {
      title: 'Verhindern Sie den Zusammenbruch einer Unterebene im Baum',
      description: 'Verhindert, dass Unterkategorien in der hierarchischen Struktur geschlossen werden, wenn eine übergeordnete Kategorie geschlossen wird.',
      tags: 'Erinnern Sie sich an erweiterte, verschachtelte, offene, Akkordeon- und zusammengeklappte Kinder',
    },
    doubleDashDocCount: {
      title: 'Ausgesprochener Zählteiler',
      description: 'Diese Einstellung fügt ein weiteres Zeichen \\\\| zwischen der Kategorie und der Dokumentanzahl in der hierarchischen Struktur hinzu.',
      tags: 'Pipe, Trennzeichen, Trennzeichen, Zählformat, Baumzählungen',
    },
    hideAdvSearchCheatsheetButton: {
      title: 'Hilfeschaltfläche „Beziehungen ausblenden“.',
      description: 'Versteckt die Spickzettel-Hilfeschaltfläche für die erweiterte Suche in Beziehungstypfeldern.',
      tags: 'Beziehungsfeld, Cheatsheet, Hilfesymbol, Linkauswahl, erweiterte Suche',
    },
    hideDeadCrossThrough: {
      title: 'Durchgestrichen ausblenden',
      description: 'Diese Einstellung verbirgt den Durchstreichungseffekt bei toten, verschwundenen oder zerstörten Dokumenten, um die Sichtbarkeit zu erhöhen.',
      tags: 'durchgestrichen, verstorben, zerstört, verschwunden, Dokumentenstatus, durchgestrichen',
    },
    hideDocumentTitles: {
      title: 'Dokumenttitel ausblenden',
      description: 'Blendet die großen Abschnittstitel in der Dokumentansicht aus. Bitte beachten Sie, dass dies zu relativ wilden Layoutverschiebungen führen kann, die das Dokument in manchen Fällen unruhig wirken lassen.',
      tags: 'Abschnittsüberschriften, Feldgruppen, Dokumentstrukturbezeichnungen',
    },
    hideEmptyFields: {
      title: 'Leere Felder ausblenden',
      description: 'Versteckt Felder ohne ausgefüllten Wert im Ansichtsmodus (ohne Bearbeitung). Bitte beachten Sie, dass dies zu relativ wilden Layoutverschiebungen führen kann, die das Dokument in manchen Fällen unruhig wirken lassen.',
      tags: 'leere Felder, schreibgeschützte Ansicht, kompaktes Dokument, Layoutverschiebung',
    },
    hideHierarchyTree: {
      title: 'Hierarchischen Baum ausblenden',
      description: 'Steuert, ob der hierarchische Baum angezeigt wird.',
      tags: 'Seitenleiste aus, Navigator ausgeblendet, Baumansicht, Umriss ausblenden',
    },
    hidePlushes: {
      title: 'Fantasia-Maskottchen verstecken',
      description: 'Versteckt die unglaublich bezaubernde und fantastische Fantasia, den winzigen arkanen Drachen. Wie konntest du! :(',
      tags: 'Drache, Maskottchen, Plüsch, Charakter, Dekoration, Osterei',
    },
    hideTooltipsProject: {
      title: 'Tipps zur Projektübersicht ausblenden',
      description: 'Blendet die Infokarte mit Tipps und Tricks zur Projektübersicht aus.',
      tags: 'Projekthomepage, Dashboard-Karte, Übersichtshinweise',
    },
    hideTooltipsStart: {
      title: 'Tipps-Popup auf dem Startbildschirm ausblenden',
      description: 'Blendet das Popup mit Tipps und Tricks auf dem Startbildschirm aus.',
      tags: 'Erster Start, Onboarding, Splash, Startup-Tipps, Tricks',
    },
    hideTreeExtraIcons: {
      title: 'Zusätzliche Symbole ausblenden',
      description: 'Blendet Symbole aus, die normalerweise der Einfachheit halber angezeigt werden, aber keine Funktionalität hinzufügen – zum Beispiel das Symbol „Dokument öffnen“ neben einem Dokument ohne untergeordnete Knoten, das genauso gut mit einem normalen Linksklick anstelle des Symbols geöffnet werden kann.',
      tags: 'überflüssige Symbole, Unordnung, minimaler Baum, optionale Aktionen',
    },
    hideTreeIconAddUnder: {
      title: 'Symbol „Hinzufügen unter“ ausblenden',
      description: 'Diese Option verbirgt das Symbol „Neues Dokument unter dem ausgewählten übergeordneten Dokument hinzufügen“.',
      tags: 'Untergeordnetes Element hinzufügen, neues unter, plus unter, unten erstellen',
    },
    hideTreeIconEdit: {
      title: 'Symbol „Bearbeiten“ ausblenden',
      description: 'Diese Option verbirgt das Zeilenbearbeitungssymbol.',
      tags: 'Bleistiftsymbol, Zeile bearbeiten, Baum schnell bearbeiten',
    },
    hideTreeIconView: {
      title: '„Öffnen“-Symbol ausblenden',
      description: 'Diese Option blendet das Zeilensymbol „Öffnen“ aus.',
      tags: 'Öffnen-Symbol, zum Dokument gehen, Schaltfläche zum Öffnen der Zeile',
    },
    hideTreeOrderNumbers: {
      title: 'Bestellnummern ausblenden',
      description: 'Blendet die benutzerdefinierten Bestellnummern links neben den Namen aus.',
      tags: 'Sequenzindex, manuelle Reihenfolge, Rangpräfix, linker Bundsteg',
    },
    hideRecentProjectTooltip: {
      title: 'Tooltip „Neueste Projekte durchsuchen“ ausblenden',
      description: 'Blendet den Tooltip im Cursor zum Durchsuchen der neuesten Projekte neben „Neuestes Projekt fortsetzen“ auf dem Begrüßungsbildschirm aus.',
      tags: 'Projekt, laden, wird geladen, neueste, aktuell, Einführung, Start, Willkommen, Tooltip, Pop-up, Tooltips, Pop-up',
    },
    hideWelcomeScreenSocials: {
      title: 'Soziale Links auf dem Begrüßungsbildschirm ausblenden',
      description: 'Versteckt alle sozialen Links auf dem Willkommensbildschirm.',
      tags: 'Discord, Twitter, Community-Links, soziale Medien, willkommen',
    },
    skipWelcomeScreen: {
      title: 'Begrüßungsbildschirm überspringen',
      description: 'Überspringt den Begrüßungsbildschirm und versucht, das neueste Projekt direkt beim Starten der App zu laden.',
      tags: 'Projekt, laden, laden, neueste, aktuell, Einführung, Start, willkommen',
    },
    invertCategoryPosition: {
      title: 'Kategorieposition umkehren',
      description: 'Vertauscht die Positionen der Kategorie- und Dokumentnummern.',
      tags: 'Nummern austauschen, Zählreihenfolge, Kategorie vs. Dokumentanzahl',
    },
    invertTreeSorting: {
      title: 'Kehren Sie die Sortierung nach benutzerdefinierter Baumreihenfolge um',
      description: 'Sortiert Dokumente im hierarchischen Baum in der entgegengesetzten Richtung zur Standardrichtung: von der höchsten zur niedrigsten.',
      tags: 'umgekehrte Reihenfolge, benutzerdefinierte Reihenfolge, Sortierrichtung, aufsteigend absteigend',
    },
    limitEditorHeight: {
      title: 'Begrenzen Sie die Höhe des Texteditors',
      description: 'Bestimmt, ob der Texteditor eine begrenzte Höhe hat, wenn er sich nicht im Vollbildmodus befindet.',
      tags: 'Textbereichshöhe, Langtext, Expand-Editor, Scroll-Editor',
    },
    noProjectName: {
      title: 'Projektnamen im Baum ausblenden',
      description: 'Legt fest, ob der Projektname überhaupt im hierarchischen Baum angezeigt wird.',
      tags: 'Stammbezeichnung, Projekttitelbaum, Kopfzeile ausblenden',
    },
    noTags: {
      title: 'Tags im Baum ausblenden',
      description: 'Legt fest, ob Tags überhaupt im hierarchischen Baum angezeigt werden.',
      tags: 'Etiketten ausschalten, Streifen markieren, Baumetiketten markieren, Etiketten ausblenden',
    },
    preventAutoScroll: {
      title: 'Automatisches Scrollen verhindern',
      description: 'Legt fest, ob Dokumente ihre Bildlaufpositionen abrufen und automatisch scrollen, wenn zwischen ihnen gewechselt wird.',
      tags: 'Scrollposition, Scrollen merken, nach oben springen, Tabulatorwechsel',
    },
    preventFilledNoteBoardPopup: {
      title: 'Verhindern Sie, dass eine gefüllte Notiztafel angezeigt wird',
      description: 'Wenn diese Option aktiviert ist, wird das Notizbrett beim Start der App nicht automatisch geöffnet, wenn es noch Notizen aus früheren FA-Sitzungen enthält.',
      tags: 'Haftnotizen, Notiztafel, Start, automatisches Öffnen, Erinnerungen',
    },
    preventPreviewsDocuments: {
      title: 'Dokumentvorschauen verhindern',
      description: 'Steuert, ob Schnellvorschauen beim Hover in der Dokumentansicht und in Beziehungsfeldern angezeigt werden.',
      tags: 'Hover-Karte, Peek, Beziehungs-Popup, Inline-Vorschau',
    },
    preventPreviewsPopups: {
      title: 'Dokumentvorschauen in Dialogen verhindern',
      description: 'Steuert, ob bei der Auswahl von Dokumenten in Dialogen (z. B. der Auswahl für vorhandene Dokumente) Schnellvorschauen beim Hover angezeigt werden.',
      tags: 'Vorhandenes Dokumentdialog, Auswahl-Hover, Dokumentauswahl, modale Vorschau',
    },
    preventPreviewsTabs: {
      title: 'Dokumentvorschauen auf Registerkarten verhindern',
      description: 'Steuert, ob Schnellvorschauen beim Bewegen des Mauszeigers auf Dokumentregisterkarten in der Registerkartenleiste angezeigt werden.',
      tags: 'Tab-Hover, Tab-Strip-Vorschau, Blick auf die Titelleiste',
    },
    preventPreviewsTree: {
      title: 'Dokumentvorschau beim Hover verhindern',
      description: 'Steuert, ob Schnellvorschauen beim Hover im hierarchischen Baum angezeigt werden. Wenn die Hover-Vorschau aktiviert bleibt, kann sie einen großen Einfluss auf die App-Leistung haben.',
      tags: 'Baum-Hover, Verzögerung, langsam, fps, Leistung, Seitenleistenvorschau',
      note: 'Kann einen großen Einfluss auf die App-Leistung haben!',
    },
    showDocumentID: {
      title: 'Dokument-IDs anzeigen',
      description: 'Wenn dies aktiviert ist, zeigt der Dokumenttext auch den internen Dokument-ID-Wert an.',
      tags: 'Debuggen, interne ID, Kennung, Entwicklungstools, Fehlerbehebung',
    },
    tagsAtTop: {
      title: 'Top-Tags im Baum',
      description: 'Zeigt Tags oben im hierarchischen Baum an.',
      tags: 'Tag-Reihenfolge, Tags zuerst, oberhalb der Kategorien',
    },
    textShadow: {
      title: 'Textschatten',
      description: 'Diese Einstellung schaltet Textschatten in der hierarchischen Struktur, in Popups für die Beziehungssuche und in Registerkarten um und ermöglicht so eine auffälligere Darstellung von Text vor dem Hintergrund.',
      tags: 'Kontrast, Lesbarkeit, Schatten, Umriss, Lesbarkeit, Textklarheit',
    }
  }
}
