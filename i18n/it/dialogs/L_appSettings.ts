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
      title: 'Visualizzazione/modifica del documento',
      tags: 'pagina del documento, modalità di visualizzazione, modalità di modifica, lettore',
      documentBody: {
        subtitle: 'Corpo del documento',
        tags: 'area contenuto, campi, lettura, area editor',
      },
      documentControlBar: {
        subtitle: 'Barra di controllo del documento',
        tags: 'barra degli strumenti, barra superiore, intestazione, documento cromato',
      }
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
      treeSettings: {
        subtitle: 'Impostazioni dell\'albero',
        tags: 'pannello ad albero, visibilità della barra laterale, layout ad albero',
      }
    },
    openedDocumentsTabs: {
      title: 'Apri le schede dei documenti',
      tags: 'barra delle schede, file aperti, multitasking',
      tabBehavior: {
        subtitle: 'Comportamento della scheda',
        tags: 'cambiare scheda, tabstrip, comportamento al passaggio del mouse',
      }
    },
    popupsFloatingWindows: {
      title: 'Popup e finestre mobili',
      tags: 'finestre di dialogo, sovrapposizioni, modali, finestre',
      floatingWindows: {
        subtitle: 'Finestre galleggianti',
        tags: 'stacca, finestra secondaria, multi finestra',
      },
      quickSearchDialog: {
        subtitle: 'Finestra di dialogo di ricerca rapida',
        tags: 'ricerca rapida, ricerca da tastiera, finder',
      },
      universalDialogSettings: {
        subtitle: 'Impostazioni di dialogo universali',
        tags: 'tutte le finestre di dialogo, comportamento popup globale',
      }
    },
    visualAccessibility: {
      title: 'Immagini e funzionalità a livello di app',
      tags: 'aspetto, interfaccia, globale, interfaccia utente, aspetto grafico',
      applicationExtras: {
        subtitle: 'Extra dell\'applicazione',
        tags: 'mascotte, peluche, fantasia, extra',
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
    compactDocumentCount: {
      title: 'Nascondi il conteggio delle categorie',
      description: 'Mostra il conteggio dei documenti senza il numero secondario per categoria.',
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
    disableDocumentControlBar: {
      title: 'Disabilita la barra di controllo del documento',
      description: 'Se desideri massimizzare lo spazio di lavoro sul documento, puoi disabilitare la barra dei pulsanti in alto con questa impostazione. I pulsanti di controllo necessari verranno spostati nella parte superiore del corpo del documento principale, mentre il resto delle funzionalità sarà accessibile tramite combinazioni di tasti o tramite il menu dell\'app in alto a sinistra.',
      tags: 'nascondi barra degli strumenti, massimizza lo spazio, larghezza intera, intestazione del documento',
    },
    disableDocumentControlBarGuides: {
      title: 'Disattiva le guide dei documenti',
      description: 'Attiva o disattiva le guide adatte ai principianti sulla barra di controllo del documento.',
      tags: 'suggerimenti per principianti, banner tutorial, segni di coach, aiuto sulla barra di controllo',
    },
    disableDocumentCounts: {
      title: 'Nascondi completamente il conteggio dei documenti',
      description: 'Nasconde tutte le informazioni sul conteggio dei documenti nell\'albero gerarchico.',
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
    doNotCollapseTreeOptions: {
      title: 'Prevenire il collasso del sottolivello dell\'albero',
      description: 'Impedisce la chiusura delle sottocategorie nell\'albero gerarchico quando viene chiusa una categoria principale.',
      tags: 'ricorda i bambini espansi, annidati, aperti, a fisarmonica, crollati',
    },
    doubleDashDocCount: {
      title: 'Divisore di conteggio pronunciato',
      description: 'Questa impostazione aggiunge un altro carattere \\\\| tra la categoria e il conteggio dei documenti nell\'albero gerarchico.',
      tags: 'pipe, delimitatore, separatore, formato di conteggio, conteggi di alberi',
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
      title: 'Nascondi albero gerarchico',
      description: 'Controlla se viene visualizzato l\'albero gerarchico.',
      tags: 'barra laterale disattivata, navigatore nascosto, pannello ad albero, contorno nascosto',
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
    hideTreeExtraIcons: {
      title: 'Nascondi icone extra',
      description: 'Nasconde le icone che normalmente vengono visualizzate per comodità ma non aggiungono funzionalità, ad esempio l\'icona "Apri documento" accanto a un documento senza nodi secondari, che può anche essere aperta con un normale clic sinistro invece dell\'icona.',
      tags: 'icone ridondanti, disordine, struttura minimale, azioni opzionali',
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
    invertTreeSorting: {
      title: 'Inverte l\'ordinamento personalizzato dell\'albero',
      description: 'Ordina i documenti nell\'albero gerarchico nella direzione opposta rispetto a quella predefinita: dal più alto al più basso.',
      tags: 'ordine inverso, ordine personalizzato, direzione di ordinamento, ascendente discendente',
    },
    limitEditorHeight: {
      title: 'Limita l\'altezza dell\'editor di testo',
      description: 'Determina se l\'editor di testo ha un\'altezza limitata quando non è in modalità a schermo intero.',
      tags: 'altezza dell\'area di testo, testo lungo, editor di espansione, editor di scorrimento',
    },
    logFullActivityPayload: {
      title: "Registra payload completo dell'attività",
      description: "Se abilitato, l'attività registrerà payload completi. Può essere utile per un debug approfondito che richiede una registrazione precisa dei risultati.",
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
    preventFilledNoteBoardPopup: {
      title: 'Impedisce la visualizzazione degli appunti pieni',
      description: 'Se abilitato, la lavagna non si aprirà automaticamente all\'avvio dell\'app quando contiene ancora note delle sessioni FA precedenti.',
      tags: 'note adesive, blocco note, avvio, apertura automatica, promemoria',
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
