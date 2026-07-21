export default {
  title: 'Fantasia Archive Innstillinger',
  saveButton: 'Lagre innstillinger',
  closeButton: 'Lukk uten å lagre',
  settingsSearchPlaceholder: 'Søk i innstillingene...',
  searchNoResultsTitle: 'Ingen søketreff',
  searchNoResultsDescription: 'Fantasia fant dessverre ingen innstillinger du lette etter. Kanskje prøve et annet søkeord?',
  appOptionsCategories: {
    accessibility: {
      title: 'Tilgjengelighet',
      tags: 'a11y, lesbarhet, synlighet, hjelpemiddel',
      accessibility: {
        subtitle: 'Tilgjengelighet',
        tags: 'a11y, lesbarhet, synlighet, hjelpemiddel',
      }
    },
    developerSettings: {
      title: 'Utviklerinnstillinger',
      tags: 'utvikler, feilsøking, diagnostikk, intern',
      documentBody: {
        subtitle: 'Dokumentets brødtekst',
        tags: 'dokument-ID, feilsøkingsmetadata, interne felt',
      }
    },
    documentViewEdit: {
      title: 'Side: Vis/rediger dokument',
      tags: 'dokumentside, visningsmodus, redigeringsmodus, leser',
      documentBody: {
        subtitle: 'Dokumentets brødtekst',
        tags: 'innholdsområde, felt, lesing, redaktørområde',
      },
    },
    hierarchicalTree: {
      title: 'Hierarkisk tre',
      tags: 'sidefelt, disposisjon, navigator, prosjekttre',
      iconSettings: {
        subtitle: 'Ikoninnstillinger',
        tags: 'handlingsikoner, treknapper, radikoner',
      },
      informationDisplaySettings: {
        subtitle: 'Innstillinger for informasjonsvisning',
        tags: 'antall, tall, ordreindeks, metadatavisning',
      },
      tagSettings: {
        subtitle: 'Tag-innstillinger',
        tags: 'etiketter, tag-visning, tag-gruppering',
      },
      treeBehavior: {
        subtitle: 'Treets oppførsel',
        tags: 'utvide, kollapse, utvide alt, interaksjon',
      },
    },

    popupsFloatingWindows: {
      title: 'Popup-vinduer og flytende vinduer',
      tags: 'dialoger, overlegg, modaler, vinduer',
      floatingWindows: {
        subtitle: 'Flytende vinduer',
        tags: 'løsne, sekundærvindu, multivindu',
      },
      quickSearchDialog: {
        subtitle: 'Quick-search/Quick-add dialog',
        tags: 'quick search, quick add, keyboard search, finder, popup close'
      }
    },
    visualAccessibility: {
      title: 'Visuelt og app-omfattende funksjonalitet',
      tags: 'utseende, grensesnitt, globalt, ui, utseende og følelse',
      applicationExtras: {
        subtitle: 'Applikasjonstillegg',
        tags: 'maskot, plysj, fantasia, statister',
      },
      appControlBar: {
        subtitle: 'Appkontrollinje',
        tags: 'verktøylinje, topplinje, topptekst, dokumentkrom',
      },
      tabBehavior: {
        subtitle: 'Faneatferd',
        tags: 'bytte faner, tabulatorstripe, sveveadferd',
      },
      visualsAppwideFunctionality: {
        subtitle: 'Visuelt og app-omfattende funksjonalitet',
        tags: 'tema, krom, layout, generelle alternativer',
      }
    },
    projectOverview: {
      title: 'Side: Prosjektoversikt',
      tags: 'prosjekthjem, dashbord, oversikt, arbeidsområde',
      projectOverviewBehavior: {
        subtitle: 'Atferd for prosjektoversikt',
        tags: 'tips, triks, visste du, oversiktskort',
      }
    },
    welcomeScreen: {
      title: 'Velkomstskjerm',
      tags: 'splash, startskjerm, velkomst, første lansering, hjem',
      welcomeScreenBehavior: {
        subtitle: 'Velkomstskjermadferd',
        tags: 'oppstartstips, sosiale lenker, onboarding, splash',
      }
    }
  },
  appOptions: {
    aggressiveRelationshipFilter: {
      title: 'Valg av aggressive forhold',
      description: 'Slår på den aggressive autosuggest-modusen for alle relasjonssøk på tvers av appen i dokumentredigeringsmodus. Uten dette slått på, etter filtrering, blir ikke det første elementet i listen valgt automatisk. Når du slår på dette, legger du til denne funksjonaliteten – noe som gir mye mer praktisk valg av eksisterende dokumenter, samtidig som du ofrer litt av bekvemmeligheten når du oppretter nye på farten.',
      tags: 'autosuggest, autocomplet, first match, filter list, velg eksisterende, relasjonssøk',
    },
    allowQuickPopupSameKeyClose: {
      title: 'Lukk hurtige popup-vinduer med samme nøkkel',
      description: 'Tillater lukking av hurtigsøk og hurtigleggende popup-vinduer med samme tastekombinasjon som ble brukt til å åpne dem.',
      tags: 'veksle snarvei, samme hurtigtast, hurtig legg til, avvis popup',
    },
    allowWiderScrollbars: {
      title: 'Bredere rullefelt',
      description: 'Denne innstillingen gjør rullefeltene til FA bredere og tillater derfor manuell klikkrulling direkte på dem for enheter som ikke støtter standard rulling (for eksempel mus uten rullehjul).',
      tags: 'rullefeltbredde, klikkrull, mus uten hjul, styrekule, berøring',
    },
    disableCategoryCount: {
      title: 'Skjul kategoriantall',
      description: 'Skjul kategorinumre i det hierarkiske treet',
      tags: 'forenklet telling, enkelt tall, mindre rot',
    },
    compactTags: {
      title: 'Kompakte tagger',
      description: 'Bestemmer om tagger skal vises som individuelle kategorier eller som én kategori med hver kode som en underkategori.',
      tags: 'tag-gruppering, enkelt tag-mappe, nestede tagger, tag-hierarki',
    },
    darkMode: {
      title: 'Mørk modus',
      description: 'Bytt mellom lys og mørk modus for appen.',
      tags: 'mørk, lys, tema, tema, farge, farger',
    },
    disableCloseAfterSelectQuickSearch: {
      title: 'Stopp lukking etter valg',
      description: 'Vanligvis lukkes hurtigsøket etter at et element er valgt fra det. Ved å slå på denne funksjonen forhindrer du denne oppførselen, og lar deg åpne flere søkeresultater etter hverandre.',
      tags: 'hold åpent, flere resultater, batch åpen, hurtigsøk forblir åpent',
    },
    disableAppControlBar: {
      title: 'Deaktiver appkontrollinjen',
      description: 'Hvis du vil maksimere arbeidsplassen på dokumentet, kan du deaktivere den øverste knappelinjen med denne innstillingen. De nødvendige kontrollknappene vil bli flyttet til toppen av hoveddokumentets hoveddel, mens resten av funksjonaliteten vil være tilgjengelig via tastebindinger eller gjennom appmenyen øverst til venstre.',
      tags: 'verktøylinje skjule, maksimer plass, full bredde, dokumentoverskrift',
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
      title: 'Deaktiver veiledninger for appkontrollinjen',
      description: 'Slår de nybegynnervennlige guidene på appkontrollinjen på eller av.',
      tags: 'nybegynnertips, veiledningsbannere, trenermerker, kontrolllinjehjelp',
    },
    disableDocumentCounts: {
      title: 'Skjul dokumentantallet',
      description: 'Skjul dokumentnumre i det hierarkiske treet',
      tags: 'totalt, ingen tellinger, statistikk skjuler',
    },
    disableDocumentToolTips: {
      title: 'Deaktiver dokumentverktøytips',
      description: 'Hvis du ikke liker verktøytipsene for dokumentvisning, kan du slå dem av globalt her.',
      tags: 'hover tekst, felthjelp, popover, dokumentvisning hint',
    },
    disableQuickSearchCategoryPrecheck: {
      title: 'Ikke forhåndssjekk kategorifilteret',
      description: 'Normalt er kategorier inkludert i hurtigsøket. Aktivering av dette alternativet reverserer atferden.',
      tags: 'kategorifilter, søkeomfang, inkludere kategorier, standardfilter',
    },
    disableSpellCheck: {
      title: 'Deaktiver stavekontroll',
      description: 'Deaktiverer stave-, grammatikk- og ordkontroll i dokumentredigeringsmodus.',
      tags: 'rettskrivning, grammatikk, korrektur, rød understreking, skriving, ordbok',
      note: 'Trenger en fullstendig omstart av appen for å tre i kraft!',
    },

    doubleDashDocCount: {
      title: 'Uttalt telledeler',
      description: 'Denne innstillingen legger til et nytt \\\\| tegn mellom kategorien og dokumentantallet i det hierarkiske treet.',
      tags: 'pipe, skilletegn, skilletegn, telleformat, tretellinger',
    },

    forceSublevelCollapseInTree: {
      title: 'Force sublevel collapse in the tree',
      description: 'Forces sublevels of the closed node in the hierarchical tree to close as well when a parent node is closed. Normally, they remember the pre-close state and will reopen as they were when closed.',
      tags: 'force collapse, close children, parent node, nested tree, remember expand'
    },
    hideAdvSearchCheatsheetButton: {
      title: 'Skjul hjelpeknapp for relasjoner',
      description: 'Skjuler hjelpeknappen for avansert søk jukseark i feltene for relasjonstype.',
      tags: 'forholdsfelt, jukseark, hjelpeikon, lenkevelger, avansert søk',
    },
    hideDeadCrossThrough: {
      title: 'Skjul gjennomstreking',
      description: 'Denne innstillingen skjuler gjennomslagseffekten på døde, borte eller ødelagte dokumenter for å øke synligheten.',
      tags: 'gjennomstreket, død, ødelagt, borte, dokumentstatus, overstreket',
    },
    hideDocumentTitles: {
      title: 'Skjul dokumenttitler',
      description: 'Skjuler de store seksjonstitlene i dokumentvisningen. Vær oppmerksom på at dette kan føre til relativt ville layoutskifter, som kan få dokumentet til å se uregjerlig ut i noen tilfeller.',
      tags: 'seksjonsoverskrifter, feltgrupper, dokumentstrukturetiketter',
    },
    hideEmptyFields: {
      title: 'Skjul tomme felt',
      description: 'Skjuler felt uten verdi utfylt, i visningsmodus (ikke-redigering). Vær oppmerksom på at dette kan føre til relativt ville layoutskifter, som kan få dokumentet til å se uregjerlig ut i noen tilfeller.',
      tags: 'tomme felt, skrivebeskyttet visning, kompakt dokument, layoutskift',
    },
    hideHierarchyTree: {
      title: 'Hide hierarchical tree',
      description: 'Controls whether the hierarchical tree is shown.',
      tags: 'sidebar off, navigator hidden, tree panel, outline hide'
    },
    hidePlushes: {
      title: 'Skjul Fantasia-maskot',
      description: 'Skjuler den utrolig bedårende og fantastiske Fantasia, den lille mystiske dragen. Hvordan kunne du det! :(',
      tags: 'drage, maskot, plysj, karakter, dekorasjon, påskeegg',
    },
    hideTooltipsProject: {
      title: 'Skjul tips om prosjektoversikt',
      description: 'Skjuler informasjonskortet for tips og triks for prosjektoversikten.',
      tags: 'prosjekthjem, dashbordkort, oversiktstips',
    },
    hideTooltipsStart: {
      title: 'Skjul tips popup på startskjermen',
      description: 'Skjuler popup-vinduet for tips og triks på startskjermen.',
      tags: 'første lansering, onboarding, splash, oppstartstips, triks',
    },
    hideTreeIconAddUnder: {
      title: 'Skjul "Legg til under"-ikonet',
      description: 'Dette alternativet skjuler "Legg til et nytt dokument under den valgte overordnede"-ikonet.',
      tags: 'legg til barn, ny under, pluss under, opprett nedenfor',
    },
    hideTreeIconEdit: {
      title: 'Skjul "Rediger"-ikonet',
      description: 'Dette alternativet skjuler radredigeringsikonet.',
      tags: 'blyantikon, rediger rad, hurtigredigeringstre',
    },
    hideTreeIconView: {
      title: 'Skjul "Åpne"-ikonet',
      description: 'Dette alternativet skjuler rad Åpne-ikonet.',
      tags: 'åpne ikon, gå til dokument, rad åpne knapp',
    },
    hideTreeLines: {
      title: 'Hide tree lines',
      description: 'Hides the structural help-lines in the hierarchy tree.',
      tags: 'lines, helplines, structure, tree, hierarchical, hierarchical tree'
    },
    hideTreeOrderNumbers: {
      title: 'Skjul ordrenummer',
      description: 'Skjuler de egendefinerte rekkefølgenumrene til venstre for navnene.',
      tags: 'sekvensindeks, manuell rekkefølge, rangprefiks, venstre takrenne',
    },
    hideRecentProjectTooltip: {
      title: 'Skjul "Bla gjennom siste prosjekter" verktøytips',
      description: 'Skjuler verktøytipset på feltet Bla gjennom siste prosjekter ved siden av Gjenoppta siste prosjekt på velkomstskjermen.',
      tags: 'prosjekt, last, laster, siste, siste, introduksjon, start, velkommen, verktøytips, popup, verktøytips, pop up',
    },
    hideWelcomeScreenSocials: {
      title: 'Skjul sosiale lenker på velkomstskjermen',
      description: 'Skjuler alle sosiale lenker på velkomstskjermen.',
      tags: 'discord, twitter, fellesskapslenker, sosiale medier, velkommen',
    },
    skipWelcomeScreen: {
      title: 'Hopp over velkomstskjermen',
      description: 'Hopper over velkomstskjermen og prøver å laste det siste prosjektet direkte når appen startes.',
      tags: 'prosjekt, last, lasting, siste, siste, intro, start, velkommen',
    },
    invertCategoryPosition: {
      title: 'Inverter kategoriposisjon',
      description: 'Bytter plassering av kategori- og dokumentnumre.',
      tags: 'bytte tall, tellerekkefølge, kategori vs dokumentantall',
    },
    limitEditorHeight: {
      title: 'Begrens tekstredigeringshøyden',
      description: 'Bestemmer om tekstredigereren har begrenset høyde når den ikke er i fullskjermmodus.',
      tags: 'tekstområde høyde, lang tekst, utvide editor, rulle editor',
    },
    logFullActivityPayload: {
      title: 'Logg full aktivitetsnyttelast',
      description: 'Hvis dette er aktivert, vil aktiviteten logge full nyttelast i alle situasjoner (normalt logger den kun i ikke-feil- og ikke-varslingssituasjoner). Dette kan være nyttig når du utfører dyp feilsøking som krever nøyaktig logging av resultater.',
      tags: 'feilsøking, feilretting, DevTools, nyttelast, aktivitet, logging',
    },
    noProjectName: {
      title: 'Skjul prosjektnavn i treet',
      description: 'Bestemmer om prosjektnavnet i det hele tatt skal vises i det hierarkiske treet.',
      tags: 'rotetikett, prosjekttitteltre, overskriftsskjul',
    },
    noTags: {
      title: 'Skjul tagger i treet',
      description: 'Bestemmer om tagger i det hele tatt skal vises i det hierarkiske treet.',
      tags: 'etiketter av, merkestripe, treetiketter, skjul etiketter',
    },
    preventAutoScroll: {
      title: 'Forhindre automatisk rulling',
      description: 'Bestemmer om dokumenter husker rulleposisjonene og ruller automatisk når de bytter mellom dem.',
      tags: 'rull posisjon, husk rull, hopp til toppen, tabulatorbryter',
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
      title: 'Forhindre forhåndsvisninger av dokumenter',
      description: 'Kontrollerer om hurtigforhåndsvisninger ved hover vises i dokumentvisningen og i relasjonsfelt.',
      tags: 'hover card, kikk, relasjonspopup, innebygd forhåndsvisning',
    },
    preventPreviewsPopups: {
      title: 'Forhindre forhåndsvisning av dokumenter i dialoger',
      description: 'Kontrollerer om hurtigforhåndsvisninger ved peker skal vises når du velger dokumenter i dialoger (for eksempel eksisterende dokumentvelger).',
      tags: 'eksisterende dokumentdialog, velgerpeker, dokumentvelger, modal forhåndsvisning',
    },
    preventPreviewsTabs: {
      title: 'Forhindre forhåndsvisning av dokumenter på faner',
      description: 'Kontrollerer om hurtigforhåndsvisninger ved hover skal vises på dokumentfaner i fanelinjen.',
      tags: 'tabulatorovervåking, forhåndsvisning av tabulatorstripe, titt på tittellinjen',
    },
    preventPreviewsTree: {
      title: 'Forhindre forhåndsvisninger av dokumenter ved sveving',
      description: 'Kontrollerer om hurtigforhåndsvisninger ved hover vises i det hierarkiske treet. Når hover-forhåndsvisninger forblir aktivert, kan de ha stor innvirkning på appytelsen.',
      tags: 'tresveving, lag, sakte, fps, ytelse, forhåndsvisning av sidefelt',
      note: 'Kan ha stor innvirkning på appytelsen!',
    },
    showDocumentID: {
      title: 'Vis dokument-ID-er',
      description: 'Hvis dette er aktivert, vil dokumentteksten også vise den interne dokument-ID-verdien.',
      tags: 'feilsøking, intern id, identifikator, utviklerverktøy, feilsøking',
    },
    tagsAtTop: {
      title: 'Toppmerker i treet',
      description: 'Viser tagger øverst i det hierarkiske treet.',
      tags: 'tagrekkefølge, tagger først, over kategoriene',
    },
    textShadow: {
      title: 'Tekstskygge',
      description: 'Denne innstillingen veksler mellom tekstskygger i det hierarkiske treet, popup-vinduer for relasjonssøk og faner, noe som gir et mer fremtredende utseende for tekst mot bakgrunnen.',
      tags: 'kontrast, lesbarhet, skygge, disposisjon, lesbarhet, tekstklarhet',
    }
  }
}
