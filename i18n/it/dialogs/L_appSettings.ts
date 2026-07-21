export default {
  title: 'Fantasia Archive Impostazioni',
  saveButton: 'Salva impostazioni',
  closeButton: 'Chiudi senza salvare',
  settingsSearchPlaceholder: 'Cerca nelle impostazioni...',
  searchNoResultsTitle: 'Nessuna corrispondenza di ricerca',
  searchNoResultsDescription: 'Fantasia purtroppo non ha trovato nessuna ambientazione che stavi cercando. Forse provare un termine di ricerca diverso?',
  appOptionsCategories: {
    accessibility: {
      title: 'Accessibilità',
      tags: 'a11y, leggibilità, visibilità, assistivo',
      accessibility: {
        subtitle: 'Accessibilità',
        tags: 'a11y, leggibilità, visibilità, assistivo',
      }
    },
    developerSettings: {
      title: 'Impostazioni dello sviluppatore',
      tags: 'sviluppatore, debug, diagnostica, interno',
      documentBody: {
        subtitle: 'Corpo del documento',
        tags: 'ID documento, metadati di debug, campi interni',
      }
    },
    documentViewEdit: {
      title: 'Pagina: Visualizzazione/modifica del documento',
      tags: 'pagina del documento, modalità di visualizzazione, modalità di modifica, lettore',
      documentBody: {
        subtitle: 'Corpo del documento',
        tags: 'area contenuto, campi, lettura, area editor',
      },
    },
    hierarchicalTree: {
      title: 'Albero gerarchico',
      tags: 'barra laterale, struttura, navigatore, albero del progetto',
      iconSettings: {
        subtitle: 'Impostazioni delle icone',
        tags: 'icone di azione, pulsanti dell\'albero, icone di riga',
      },
      informationDisplaySettings: {
        subtitle: 'Impostazioni di visualizzazione delle informazioni',
        tags: 'conteggi, numeri, indice dell\'ordine, visualizzazione dei metadati',
      },
      tagSettings: {
        subtitle: 'Impostazioni dei tag',
        tags: 'etichette, visualizzazione dei tag, raggruppamento dei tag',
      },
      treeBehavior: {
        subtitle: 'Comportamento dell\'albero',
        tags: 'espandere, comprimere, espandere tutto, interazione',
      },
    },

    popupsFloatingWindows: {
      title: 'Popup e finestre mobili',
      tags: 'finestre di dialogo, sovrapposizioni, modali, finestre',
      floatingWindows: {
        subtitle: 'Finestre galleggianti',
        tags: 'stacca, finestra secondaria, multi finestra',
      },
      quickSearchDialog: {
        subtitle: 'Quick-search/Quick-add dialog',
        tags: 'quick search, quick add, keyboard search, finder, popup close'
      }
    },
    visualAccessibility: {
      title: 'Immagini e funzionalità a livello di app',
      tags: 'aspetto, interfaccia, globale, interfaccia utente, aspetto grafico',
      applicationExtras: {
        subtitle: 'Extra dell\'applicazione',
        tags: 'mascotte, peluche, fantasia, extra',
      },
      appControlBar: {
        subtitle: 'Barra di controllo dell\'app',
        tags: 'barra degli strumenti, barra superiore, intestazione, documento cromato',
      },
      tabBehavior: {
        subtitle: 'Comportamento della scheda',
        tags: 'cambiare scheda, tabstrip, comportamento al passaggio del mouse',
      },
      visualsAppwideFunctionality: {
        subtitle: 'Immagini e funzionalità a livello di app',
        tags: 'tema, cromo, layout, opzioni generali',
      }
    },
    projectOverview: {
      title: 'Pagina: Panoramica del progetto',
      tags: 'home progetto, dashboard, panoramica, area di lavoro',
      projectOverviewBehavior: {
        subtitle: 'Comportamento panoramica del progetto',
        tags: 'suggerimenti, trucchi, lo sapevi, scheda panoramica',
      }
    },
    welcomeScreen: {
      title: 'Schermata di benvenuto',
      tags: 'splash, schermata iniziale, benvenuto, primo avvio, home',
      welcomeScreenBehavior: {
        subtitle: 'Comportamento della schermata di benvenuto',
        tags: 'suggerimenti per l\'avvio, collegamenti social, onboarding, splash',
      }
    }
  },
  appOptions: {
    aggressiveRelationshipFilter: {
      title: 'Selezione delle relazioni aggressive',
      description: 'Attiva la modalità di suggerimento automatico aggressiva per tutte le ricerche di relazioni nell\'app in modalità di modifica del documento. Senza questa opzione attivata, dopo il filtraggio, il primo elemento dell\'elenco non verrà selezionato automaticamente. L\'attivazione di questa funzionalità aggiunge questa funzionalità, consentendo una selezione molto più comoda dei documenti esistenti sacrificando un po\' di comodità durante la creazione di nuovi al volo.',
      tags: 'suggerimento automatico, completamento automatico, prima corrispondenza, elenco filtri, selezione esistente, ricerca relazione',
    },
    allowQuickPopupSameKeyClose: {
      title: 'Chiudi i popup rapidi con lo stesso tasto',
      description: 'Consente di chiudere i popup di ricerca rapida e di aggiunta rapida con la stessa combinazione di tasti utilizzata per aprirli.',
      tags: 'attiva/disattiva scorciatoia, stesso tasto di scelta rapida, aggiunta rapida, elimina popup',
    },
    allowWiderScrollbars: {
      title: 'Barre di scorrimento più ampie',
      description: 'Questa impostazione allarga le barre di scorrimento di FA e pertanto consente lo scorrimento manuale con clic direttamente su di esse per i dispositivi che non supportano lo scorrimento standard (ad esempio mouse senza rotella di scorrimento).',
      tags: 'larghezza della barra di scorrimento, scorrimento con clic, mouse senza rotella, trackball, tocco',
    },
    disableCategoryCount: {
      title: 'Nascondi il conteggio delle categorie',
      description: 'Nascondi i numeri di categoria nell’albero gerarchico',
      tags: 'conteggio semplificato, numero unico, meno disordine',
    },
    compactTags: {
      title: 'Tag compatti',
      description: 'Determina se i tag vengono visualizzati come singole categorie o come una categoria con ciascun tag come sottocategoria.',
      tags: 'raggruppamento di tag, cartella di tag singola, tag nidificati, gerarchia di tag',
    },
    darkMode: {
      title: 'Modalità oscura',
      description: 'Passa dalla modalità chiara a quella scura per l\'app.',
      tags: 'buio, luce, tema, tematizzazione, colore, colori',
    },
    disableCloseAfterSelectQuickSearch: {
      title: 'Interrompe la chiusura dopo la selezione',
      description: 'Normalmente la ricerca rapida si chiude dopo aver selezionato un elemento da essa. L\'attivazione di questa funzione impedisce tale comportamento, consentendoti di aprire più risultati di ricerca uno dopo l\'altro.',
      tags: 'mantieni aperto, risultati multipli, batch aperto, la ricerca rapida rimane aperta',
    },
    disableAppControlBar: {
      title: 'Disabilita la barra di controllo dell\'app',
      description: 'Se desideri massimizzare lo spazio di lavoro sul documento, puoi disabilitare la barra dei pulsanti in alto con questa impostazione. I pulsanti di controllo necessari verranno spostati nella parte superiore del corpo del documento principale, mentre il resto delle funzionalità sarà accessibile tramite combinazioni di tasti o tramite il menu dell\'app in alto a sinistra.',
      tags: 'nascondi barra degli strumenti, massimizza lo spazio, larghezza intera, intestazione del documento',
    },
    disableAppControlBarContentButtons: {
      title: 'Disable app control bar content buttons',
      description: 'Toggles the project contents (document search, document creation, etc.) on the app control bar on or off.',
      tags: 'quick search, quick add, document create, content tools, control bar buttons'
    },
    disableAppControlBarFunctionButtons: {
      title: 'Disable app control bar function buttons',
      description: 'Toggles the app functional buttons (noteboards, hierarchical tree toggling, etc.) on the app control bar on or off.',
      tags: 'noteboard, tree toggle, sidebar hide, function tools, control bar buttons'
    },
    disableAppControlBarGuides: {
      title: 'Disattiva le guide della barra di controllo dell\'app',
      description: 'Attiva o disattiva le guide adatte ai principianti sulla barra di controllo dell\'app.',
      tags: 'suggerimenti per principianti, banner tutorial, segni di coach, aiuto sulla barra di controllo',
    },
    disableDocumentCounts: {
      title: 'Nascondi il conteggio dei documenti',
      description: 'Nascondi i numeri di documento nell’albero gerarchico',
      tags: 'totali disattivati, nessun conteggio, le statistiche vengono nascoste',
    },
    disableDocumentToolTips: {
      title: 'Disabilita le descrizioni comandi del documento',
      description: 'Se non ti piacciono i suggerimenti per la visualizzazione del documento, puoi disattivarli globalmente qui.',
      tags: 'testo al passaggio del mouse, aiuto sul campo, popover, suggerimenti per la visualizzazione del documento',
    },
    disableQuickSearchCategoryPrecheck: {
      title: 'Non precontrollare il filtro della categoria',
      description: 'Normalmente le categorie sono incluse nella ricerca rapida. L\'abilitazione di questa opzione inverte tale comportamento.',
      tags: 'filtro di categoria, ambito di ricerca, include categorie, filtro predefinito',
    },
    disableSpellCheck: {
      title: 'Disabilita il controllo ortografico',
      description: 'Disabilita il controllo ortografico, grammaticale e delle parole nella modalità di modifica del documento.',
      tags: 'ortografia, grammatica, correzione, sottolineatura rossa, scrittura, dizionario',
      note: 'Per avere effetto è necessario il riavvio completo dell\'app!',
    },

    doubleDashDocCount: {
      title: 'Divisore di conteggio pronunciato',
      description: 'Questa impostazione aggiunge un altro carattere \\\\| tra la categoria e il conteggio dei documenti nell\'albero gerarchico.',
      tags: 'pipe, delimitatore, separatore, formato di conteggio, conteggi di alberi',
    },

    forceSublevelCollapseInTree: {
      title: 'Force sublevel collapse in the tree',
      description: 'Forces sublevels of the closed node in the hierarchical tree to close as well when a parent node is closed. Normally, they remember the pre-close state and will reopen as they were when closed.',
      tags: 'force collapse, close children, parent node, nested tree, remember expand'
    },
    hideAdvSearchCheatsheetButton: {
      title: 'Nascondi il pulsante di aiuto sulle relazioni',
      description: 'Nasconde il pulsante di aiuto del cheatsheet di ricerca avanzata nei campi del tipo di relazione.',
      tags: 'campo di relazione, cheatsheet, icona di aiuto, selettore di collegamenti, ricerca avanzata',
    },
    hideDeadCrossThrough: {
      title: 'Nascondi barrato',
      description: 'Questa impostazione nasconde l\'effetto barrato sui documenti morti, spariti o distrutti per aumentare la visibilità.',
      tags: 'barrato, deceduto, distrutto, scomparso, stato del documento, barrato',
    },
    hideDocumentTitles: {
      title: 'Nascondi i titoli dei documenti',
      description: 'Nasconde i titoli delle sezioni grandi nella visualizzazione del documento. Tieni presente che ciò potrebbe comportare cambiamenti di layout relativamente selvaggi, che in alcuni casi potrebbero rendere il documento indisciplinato.',
      tags: 'intestazioni di sezione, gruppi di campi, etichette della struttura del documento',
    },
    hideEmptyFields: {
      title: 'Nascondi i campi vuoti',
      description: 'Nasconde i campi senza alcun valore compilato, in modalità di visualizzazione (non modifica). Tieni presente che ciò potrebbe comportare cambiamenti di layout relativamente selvaggi, che in alcuni casi potrebbero rendere il documento indisciplinato.',
      tags: 'campi vuoti, visualizzazione di sola lettura, documento compatto, spostamento del layout',
    },
    hideHierarchyTree: {
      title: 'Hide hierarchical tree',
      description: 'Controls whether the hierarchical tree is shown.',
      tags: 'sidebar off, navigator hidden, tree panel, outline hide'
    },
    hidePlushes: {
      title: 'Nascondi la mascotte di Fantasia',
      description: 'Nasconde l\'incredibilmente adorabile e fantastica Fantasia, il piccolo drago arcano. Come potresti! :(',
      tags: 'drago, mascotte, peluche, personaggio, decorazione, uovo di pasqua',
    },
    hideTooltipsProject: {
      title: 'Nascondi suggerimenti sulla panoramica del progetto',
      description: 'Nasconde la scheda informativa con suggerimenti e trucchi della panoramica del progetto.',
      tags: 'home progetto, scheda dashboard, suggerimenti generali',
    },
    hideTooltipsStart: {
      title: 'Nascondi il popup dei suggerimenti nella schermata iniziale',
      description: 'Nasconde il popup di suggerimenti e trucchi della schermata iniziale.',
      tags: 'primo lancio, onboarding, splash, suggerimenti per l\'avvio, trucchi',
    },
    hideTreeIconAddUnder: {
      title: 'Nascondi l\'icona "Aggiungi sotto".',
      description: 'Questa opzione nasconde l\'icona "Aggiungi un nuovo documento sotto il genitore selezionato".',
      tags: 'aggiungi figlio, nuovo sotto, più sotto, crea sotto',
    },
    hideTreeIconEdit: {
      title: 'Nascondi l\'icona "Modifica".',
      description: 'Questa opzione nasconde l\'icona Modifica della riga.',
      tags: 'icona a forma di matita, riga di modifica, albero di modifica rapida',
    },
    hideTreeIconView: {
      title: 'Nascondi l\'icona "Apri".',
      description: 'Questa opzione nasconde l\'icona Apri della riga.',
      tags: 'icona apri, vai al documento, pulsante apri riga',
    },
    hideTreeLines: {
      title: 'Hide tree lines',
      description: 'Hides the structural help-lines in the hierarchy tree.',
      tags: 'lines, helplines, structure, tree, hierarchical, hierarchical tree'
    },
    hideTreeOrderNumbers: {
      title: 'Nascondi i numeri dell\'ordine',
      description: 'Nasconde i numeri degli ordini personalizzati a sinistra dei nomi.',
      tags: 'indice di sequenza, ordine manuale, prefisso di rango, margine interno sinistro',
    },
    hideRecentProjectTooltip: {
      title: 'Nascondi la descrizione comando "Sfoglia gli ultimi progetti".',
      description: 'Nasconde la descrizione comando nell\'area Sfoglia progetti più recenti accanto a Riprendi ultimo progetto nella schermata di benvenuto.',
      tags: 'progetto, caricamento, caricamento in corso, più recente, recente, introduzione, avvio, benvenuto, descrizione comandi, popup, descrizioni comandi, pop up',
    },
    hideWelcomeScreenSocials: {
      title: 'Nascondi i collegamenti social della schermata di benvenuto',
      description: 'Nasconde tutti i collegamenti social nella schermata di benvenuto.',
      tags: 'Discord, Twitter, link alla community, social media, benvenuto',
    },
    skipWelcomeScreen: {
      title: 'Salta la schermata di benvenuto',
      description: 'Salta la schermata di benvenuto e tenta di caricare direttamente l\'ultimo progetto all\'avvio dell\'app.',
      tags: 'progetto, caricamento, caricamento in corso, più recente, recente, introduzione, avvio, benvenuto',
    },
    invertCategoryPosition: {
      title: 'Invertire la posizione della categoria',
      description: 'Cambia le posizioni della categoria e dei numeri del documento.',
      tags: 'scambiare numeri, ordine di conteggio, categoria e conteggio di documenti',
    },
    limitEditorHeight: {
      title: 'Limita l\'altezza dell\'editor di testo',
      description: 'Determina se l\'editor di testo ha un\'altezza limitata quando non è in modalità a schermo intero.',
      tags: 'altezza dell\'area di testo, testo lungo, editor di espansione, editor di scorrimento',
    },
    logFullActivityPayload: {
      title: "Registra payload completo dell'attività",
      description: "Se questa opzione è abilitata, l'attività registrerà i payload completi in tutte le situazioni (normalmente registra solo in situazioni senza errori e senza avvisi). Ciò può essere utile quando si esegue un debug approfondito che richiede una registrazione precisa dei risultati.",
      tags: 'debug, risoluzione problemi, DevTools, payload, attività, registrazione',
    },
    noProjectName: {
      title: 'Nascondi il nome del progetto nell\'albero',
      description: 'Determina se il nome del progetto viene visualizzato nell\'albero gerarchico.',
      tags: 'etichetta radice, albero del titolo del progetto, nascondi intestazione',
    },
    noTags: {
      title: 'Nascondi i tag nell\'albero',
      description: 'Determina se i tag vengono visualizzati nell\'albero gerarchico.',
      tags: 'etichette disattivate, striscia di etichette, etichette ad albero, nascondi etichette',
    },
    preventAutoScroll: {
      title: 'Impedisci lo scorrimento automatico',
      description: 'Determina se i documenti richiamano le loro posizioni di scorrimento e lo scorrimento automatico quando si passa dall\'uno all\'altro.',
      tags: 'posizione di scorrimento, ricorda scorrimento, salta all\'inizio, cambio di scheda',
    },
    preventFilledAppNoteBoardPopup: {
      title: 'Prevent filled app noteboard from showing',
      description: 'When enabled, the app noteboard will not open automatically at app start when it still contains notes from previous FA sessions.',
      tags: 'app noteboard, sticky notes, startup, auto open, reminders'
    },
    preventFilledProjectNoteBoardPopup: {
      title: 'Prevent filled project noteboard from showing',
      description: 'When enabled, the project noteboard will not open automatically when a project loads if it still contains notes from previous project sessions.',
      tags: 'project noteboard, sticky notes, project open, auto open, reminders'
    },

    preventPreviewsDocuments: {
      title: 'Impedisci le anteprime dei documenti',
      description: 'Controlla se le anteprime rapide al passaggio del mouse vengono visualizzate nella visualizzazione del documento e nei campi di relazione.',
      tags: 'scheda al passaggio del mouse, sbirciatina, popup di relazione, anteprima in linea',
    },
    preventPreviewsPopups: {
      title: 'Impedisci le anteprime dei documenti nelle finestre di dialogo',
      description: 'Controlla se vengono visualizzate le anteprime rapide al passaggio del mouse quando si selezionano i documenti nelle finestre di dialogo (ad esempio il selettore di documenti esistenti).',
      tags: 'finestra di dialogo del documento esistente, selezione al passaggio del mouse, scelta del documento, anteprima modale',
    },
    preventPreviewsTabs: {
      title: 'Impedisci le anteprime dei documenti sulle schede',
      description: 'Controlla se le anteprime rapide al passaggio del mouse vengono visualizzate sulle schede dei documenti nella barra delle schede.',
      tags: 'passaggio del mouse sulla scheda, anteprima della tabstrip, visualizzazione della barra del titolo',
    },
    preventPreviewsTree: {
      title: 'Impedisci le anteprime dei documenti al passaggio del mouse',
      description: 'Controlla se le anteprime rapide al passaggio del mouse vengono visualizzate nell\'albero gerarchico. Quando le anteprime al passaggio del mouse rimangono abilitate, possono avere un impatto notevole sulle prestazioni dell\'app.',
      tags: 'passaggio del mouse sull\'albero, ritardo, lento, fps, prestazioni, anteprima nella barra laterale',
      note: 'Può avere un impatto notevole sulle prestazioni dell\'app!',
    },
    showDocumentID: {
      title: 'Mostra gli ID dei documenti',
      description: 'Se abilitato, il corpo del documento mostrerà anche il valore dell\'ID del documento interno.',
      tags: 'debug, ID interno, identificatore, strumenti di sviluppo, risoluzione dei problemi',
    },
    tagsAtTop: {
      title: 'Tag principali nell\'albero',
      description: 'Mostra i tag nella parte superiore dell\'albero gerarchico.',
      tags: 'ordine dei tag, prima i tag, sopra le categorie',
    },
    textShadow: {
      title: 'Ombra del testo',
      description: 'Questa impostazione attiva/disattiva le ombre del testo nell\'albero gerarchico, nei popup di ricerca delle relazioni e nelle schede, consentendo un aspetto più prominente del testo rispetto allo sfondo.',
      tags: 'contrasto, leggibilità, ombra, contorno, leggibilità, chiarezza del testo',
    }
  }
}
