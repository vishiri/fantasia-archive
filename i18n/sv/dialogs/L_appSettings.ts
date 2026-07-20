export default {
  title: 'Fantasia Archive Inställningar',
  saveButton: 'Spara inställningar',
  closeButton: 'Stäng utan att spara',
  settingsSearchPlaceholder: 'Sök i inställningarna...',
  searchNoResultsTitle: 'Ingen sökmatchning',
  searchNoResultsDescription: 'Fantasia hittade tyvärr inga inställningar du letade efter. Kanske prova en annan sökterm?',
  appOptionsCategories: {
    accessibility: {
      title: 'Tillgänglighet',
      tags: 'a11y, läsbarhet, synlighet, assisterande',
      accessibility: {
        subtitle: 'Tillgänglighet',
        tags: 'a11y, läsbarhet, synlighet, assisterande',
      }
    },
    developerSettings: {
      title: 'Utvecklarinställningar',
      tags: 'utvecklare, debug, diagnostik, intern',
      documentBody: {
        subtitle: 'Dokumentets brödtext',
        tags: 'dokument-id, felsökningsmetadata, interna fält',
      }
    },
    documentViewEdit: {
      title: 'Sida: Visa/redigera dokument',
      tags: 'dokumentsida, visningsläge, redigeringsläge, läsare',
      documentBody: {
        subtitle: 'Dokumentets brödtext',
        tags: 'innehållsområde, fält, läsning, redaktörsområde',
      },
    },
    hierarchicalTree: {
      title: 'Hierarkiskt träd',
      tags: 'sidofält, disposition, navigator, projektträd',
      iconSettings: {
        subtitle: 'Ikoninställningar',
        tags: 'åtgärdsikoner, trädknappar, radikoner',
      },
      informationDisplaySettings: {
        subtitle: 'Inställningar för informationsvisning',
        tags: 'antal, siffror, orderindex, metadatavisning',
      },
      tagSettings: {
        subtitle: 'Tagginställningar',
        tags: 'etiketter, taggvisning, tagggruppering',
      },
      treeBehavior: {
        subtitle: 'Trädbeteende',
        tags: 'expandera, kollapsa, expandera allt, interaktion',
      },
    },

    popupsFloatingWindows: {
      title: 'Popup-fönster och flytande fönster',
      tags: 'dialoger, överlägg, modaler, fönster',
      floatingWindows: {
        subtitle: 'Flytande fönster',
        tags: 'lossa, sekundärt fönster, multifönster',
      },
      quickSearchDialog: {
        subtitle: 'Snabbsökningsdialog',
        tags: 'snabbsökning, tangentbordssökning, hitta',
      },
      universalDialogSettings: {
        subtitle: 'Universella dialoginställningar',
        tags: 'alla dialogrutor, globalt popup-beteende',
      }
    },
    visualAccessibility: {
      title: 'Visuals och app-omfattande funktionalitet',
      tags: 'utseende, gränssnitt, globalt, användargränssnitt, utseende och känsla',
      applicationExtras: {
        subtitle: 'Applikationstillägg',
        tags: 'maskot, plysch, fantasia, extramaterial',
      },
      appControlBar: {
        subtitle: 'Appkontrollfält',
        tags: 'verktygsfält, toppfält, sidhuvud, dokument krom',
      },
      tabBehavior: {
        subtitle: 'Tabbeteende',
        tags: 'byta flikar, flikremsa, hovringsbeteende',
      },
      visualsAppwideFunctionality: {
        subtitle: 'Visuals och app-omfattande funktionalitet',
        tags: 'tema, krom, layout, allmänna alternativ',
      }
    },
    projectOverview: {
      title: 'Sida: Projektöversikt',
      tags: 'projekthem, instrumentpanel, översikt, arbetsyta',
      projectOverviewBehavior: {
        subtitle: 'Beteende för projektöversikt',
        tags: 'tips, tricks, visste du, översiktskort',
      }
    },
    welcomeScreen: {
      title: 'Välkomstskärm',
      tags: 'stänk, startskärm, välkomst, första lansering, hem',
      welcomeScreenBehavior: {
        subtitle: 'Välkomstskärmens beteende',
        tags: 'starttips, sociala länkar, onboarding, splash',
      }
    }
  },
  appOptions: {
    aggressiveRelationshipFilter: {
      title: 'Val av aggressiva relationer',
      description: 'Aktiverar det aggressiva autosuggest-läget för alla relationssökningar i appen i dokumentredigeringsläge. Utan detta aktiverat, efter filtrering, väljs inte det första objektet i listan automatiskt. Om du aktiverar det här läggs den här funktionen till – vilket möjliggör ett mycket bekvämare urval av befintliga dokument samtidigt som du offra lite bekvämlighet när du skapar nya i farten.',
      tags: 'autosuggest, autocomplete, first match, filter list, pick exist, relation search',
    },
    allowQuickPopupSameKeyClose: {
      title: 'Stäng snabba popup-fönster med samma nyckel',
      description: 'Tillåter stängning av snabbsöknings- och snabbläggs popup-fönster med samma tangentkombination som användes för att öppna dem.',
      tags: 'växla genväg, samma snabbtangent, snabbt lägga till, avvisa popup',
    },
    allowWiderScrollbars: {
      title: 'Bredare rullningslister',
      description: 'Den här inställningen gör FAs rullningslister bredare och tillåter därför manuell klickrullning direkt på dem för enheter som inte stöder standardrullning (till exempel möss utan rullningshjul).',
      tags: 'rullningslistens bredd, klicka rulla, mus utan hjul, styrkula, beröring',
    },
    disableCategoryCount: {
      title: 'Dölj kategoriantal',
      description: 'Dölj kategorinummer i det hierarkiska trädet',
      tags: 'förenklat antal, enstaka tal, mindre röran',
    },
    compactTags: {
      title: 'Kompakta taggar',
      description: 'Bestämmer om taggar visas som enskilda kategorier eller som en kategori med varje tagg som en underkategori.',
      tags: 'tagggruppering, enstaka taggmapp, kapslade taggar, tagghierarki',
    },
    darkMode: {
      title: 'Mörkt läge',
      description: 'Växla mellan ljust och mörkt läge för appen.',
      tags: 'mörkt, ljust, tema, tema, färg, färger',
    },
    disableCloseAfterSelectQuickSearch: {
      title: 'Sluta stänga efter val',
      description: 'Normalt stängs snabbsökningen efter att ett objekt har valts från det. Genom att aktivera den här funktionen förhindras det beteendet, vilket gör att du kan öppna flera sökresultat efter varandra.',
      tags: 'håll öppet, flera resultat, batch öppen, snabbsökning förblir öppen',
    },
    disableAppControlBar: {
      title: 'Inaktivera appkontrollfältet',
      description: 'Om du vill maximera ditt arbetsutrymme på dokumentet kan du inaktivera den övre knappraden med den här inställningen. De nödvändiga kontrollknapparna kommer att flyttas till toppen av huvuddokumentets huvuddel, medan resten av funktionaliteten kommer att vara tillgänglig via tangentbindningar eller via appmenyn uppe till vänster.',
      tags: 'verktygsfältet dölj, maximera utrymmet, full bredd, dokumenthuvud',
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
      title: 'Inaktivera guider för appkontrollfältet',
      description: 'Slår på eller av de nybörjarvänliga guiderna på appkontrollfältet.',
      tags: 'nybörjartips, tutorialbanderoller, coachmärken, hjälp för kontrollfältet',
    },
    disableDocumentCounts: {
      title: 'Dölj antalet dokument',
      description: 'Dölj dokumentnummer i det hierarkiska trädet',
      tags: 'slutar, inga räknas, statistik döljer sig',
    },
    disableDocumentToolTips: {
      title: 'Inaktivera dokumentverktygstips',
      description: 'Om du ogillar verktygstipsen för dokumentvisning kan du stänga av dem globalt här.',
      tags: 'hovra text, fälthjälp, popover, dokumentvisningstips',
    },
    disableQuickSearchCategoryPrecheck: {
      title: 'Förkontrollera inte kategorifiltret',
      description: 'Normalt ingår kategorier i snabbsökningen. Om du aktiverar det här alternativet vänder du det beteendet.',
      tags: 'kategorifilter, sökomfång, inkludera kategorier, standardfilter',
    },
    disableSpellCheck: {
      title: 'Inaktivera stavningskontroll',
      description: 'Inaktiverar stavnings-, grammatik- och ordkontroll i dokumentredigeringsläge.',
      tags: 'stavning, grammatik, korrektur, röd understrykning, skrift, ordbok',
      note: 'Behöver en fullständig omstart av appen för att träda i kraft!',
    },
    doNotCollapseTreeOptions: {
      title: 'Förhindra undernivåkollaps i trädet',
      description: 'Förhindrar att underkategorier i det hierarkiska trädet stängs när en överordnad kategori stängs.',
      tags: 'minns expanderade, kapslade öppna, dragspel, kollaps barn',
    },
    doubleDashDocCount: {
      title: 'Uttalad räknedelare',
      description: 'Den här inställningen lägger till ytterligare ett \\\\|-tecken mellan kategorin och dokumentantalet i det hierarkiska trädet.',
      tags: 'rör, avgränsare, avgränsare, räkneformat, trädräkningar',
    },
    hideAdvSearchCheatsheetButton: {
      title: 'Dölj hjälpknapp för relationer',
      description: 'Döljer hjälpknappen för avancerad sökning av fuskblad i fält för relationstyp.',
      tags: 'relationsfält, fuskblad, hjälpikon, länkväljare, avancerad sökning',
    },
    hideDeadCrossThrough: {
      title: 'Göm genomslag',
      description: 'Den här inställningen döljer genomslagseffekten på döda, borta eller förstörda dokument för att öka synligheten.',
      tags: 'genomstruken, avliden, förstörd, borta, dokumentstatus, överstruken',
    },
    hideDocumentTitles: {
      title: 'Dölj dokumenttitlar',
      description: 'Döljer de stora avsnittstitlarna i dokumentvyn. Observera att detta kan resultera i relativt vilda layoutförskjutningar, vilket kan få dokumentet att se oregerligt ut i vissa fall.',
      tags: 'avsnittsrubriker, fältgrupper, dokumentstrukturetiketter',
    },
    hideEmptyFields: {
      title: 'Göm tomma fält',
      description: 'Döljer fält utan något värde ifyllt, i visningsläge (icke-redigera). Observera att detta kan resultera i relativt vilda layoutförskjutningar, vilket kan få dokumentet att se oregerligt ut i vissa fall.',
      tags: 'tomma fält, skrivskyddad vy, kompakt dokument, layoutförskjutning',
    },
    hideHierarchyTree: {
      title: 'Hide hierarchical tree',
      description: 'Controls whether the hierarchical tree is shown.',
      tags: 'sidebar off, navigator hidden, tree panel, outline hide'
    },
    hidePlushes: {
      title: 'Göm Fantasia-maskot',
      description: 'Döljer den otroligt bedårande och fantastiska Fantasia, den lilla mystiska draken. Hur kunde du! :(',
      tags: 'drake, maskot, plysch, karaktär, dekoration, påskägg',
    },
    hideTooltipsProject: {
      title: 'Dölj tips om projektöversikt',
      description: 'Döljer informationskortet för tips och tricks för projektöversikten.',
      tags: 'projekthem, instrumentpanelskort, översiktstips',
    },
    hideTooltipsStart: {
      title: 'Dölj tipspopup på startskärmen',
      description: 'Döljer popupen med tips och tricks på startskärmen.',
      tags: 'första lansering, onboarding, splash, starttips, tricks',
    },
    hideTreeIconAddUnder: {
      title: 'Dölj ikonen "Lägg till under".',
      description: 'Det här alternativet döljer ikonen "Lägg till ett nytt dokument under den valda föräldern".',
      tags: 'lägg till barn, ny under, plus under, skapa nedan',
    },
    hideTreeIconEdit: {
      title: 'Dölj "Redigera"-ikonen',
      description: 'Detta alternativ döljer radredigeringsikonen.',
      tags: 'pennikon, redigera rad, snabbredigeringsträd',
    },
    hideTreeIconView: {
      title: 'Dölj ikonen "Öppna".',
      description: 'Detta alternativ döljer raden Öppna ikonen.',
      tags: 'öppna ikon, gå till dokument, rad öppna knapp',
    },
    hideTreeLines: {
      title: 'Hide tree lines',
      description: 'Hides the structural help-lines in the hierarchy tree.',
      tags: 'lines, helplines, structure, tree, hierarchical, hierarchical tree'
    },
    hideTreeOrderNumbers: {
      title: 'Dölj ordernummer',
      description: 'Döljer de anpassade ordningsnumren till vänster om namnen.',
      tags: 'sekvensindex, manuell ordning, rangprefix, vänster ränna',
    },
    hideRecentProjectTooltip: {
      title: 'Dölj verktygstipset "Bläddra i senaste projekt".',
      description: 'Döljer verktygstipset på raden Bläddra-senaste-projekt bredvid Återuppta senaste projekt på välkomstskärmen.',
      tags: 'projekt, ladda, laddar, senaste, senaste, intro, start, välkommen, verktygstips, popup, verktygstips, pop up',
    },
    hideWelcomeScreenSocials: {
      title: 'Dölj sociala länkar på välkomstskärmen',
      description: 'Döljer alla sociala länkar på välkomstskärmen.',
      tags: 'discord, twitter, community-länkar, sociala medier, välkommen',
    },
    skipWelcomeScreen: {
      title: 'Hoppa över välkomstskärmen',
      description: 'Hoppar över välkomstskärmen och försöker ladda det senaste projektet direkt när appen startas.',
      tags: 'projekt, ladda, ladda, senaste, senaste, intro, start, välkommen',
    },
    invertCategoryPosition: {
      title: 'Invertera kategoriposition',
      description: 'Växlar positionerna för kategori- och dokumentnumren.',
      tags: 'bytesnummer, räkningsordning, kategori vs dokumentantal',
    },
    limitEditorHeight: {
      title: 'Begränsa textredigerarens höjd',
      description: 'Avgör om textredigeraren har begränsad höjd när den inte är i helskärmsläge.',
      tags: 'textarea höjd, lång text, expandera editor, scroll editor',
    },
    logFullActivityPayload: {
      title: 'Logga fullständig aktivitetsnyttolast',
      description: 'Om detta är aktiverat kommer aktiviteten att logga full nyttolast i alla situationer (normalt loggar den endast i icke-fel- och icke-varningssituationer). Detta kan vara användbart när du gör djup felsökning som kräver exakt loggning av resultat.',
      tags: 'felsökning, felsökning av problem, DevTools, nyttolast, aktivitet, loggning',
    },
    noProjectName: {
      title: 'Göm projektnamnet i trädet',
      description: 'Bestämmer om projektnamnet överhuvudtaget visas i det hierarkiska trädet.',
      tags: 'rotetikett, projekttitelträd, header hide',
    },
    noTags: {
      title: 'Göm taggar i trädet',
      description: 'Bestämmer om taggar överhuvudtaget visas i det hierarkiska trädet.',
      tags: 'etiketter av, etikettremsa, trädetiketter, dölj etiketter',
    },
    preventAutoScroll: {
      title: 'Förhindra automatisk rullning',
      description: 'Bestämmer om dokument kommer ihåg sina rullningspositioner och automatiskt rullning när de växlar mellan dem.',
      tags: 'rulla position, kom ihåg rulla, hoppa till toppen, tabbbrytare',
    },
    preventFilledNoteBoardPopup: {
      title: 'Förhindra att fylld anteckningstavla visas',
      description: 'När det är aktiverat kommer anteckningsbordet inte att öppnas automatiskt vid appstart när det fortfarande innehåller anteckningar från tidigare FA-sessioner.',
      tags: 'klisterlappar, anteckningstavla, start, automatisk öppning, påminnelser',
    },
    preventPreviewsDocuments: {
      title: 'Förhindra förhandsgranskning av dokument',
      description: 'Styr om snabbförhandsvisningar vid hovring visas i dokumentvyn och i relationsfält.',
      tags: 'sväva kort, titt, relation popup, inline förhandsvisning',
    },
    preventPreviewsPopups: {
      title: 'Förhindra förhandsgranskning av dokument i dialogrutor',
      description: 'Styr om snabbförhandsvisningar vid hovring visas när dokument väljs i dialoger (till exempel väljaren för befintliga dokument).',
      tags: 'befintlig dokumentdialogruta, pekare, dokumentväljare, modal förhandsgranskning',
    },
    preventPreviewsTabs: {
      title: 'Förhindra dokumentförhandsvisningar på flikar',
      description: 'Styr om snabbförhandsvisningar vid hovring visas på dokumentflikarna i flikfältet.',
      tags: 'flikhovring, förhandsgranskning av flikremsor, titt på titelraden',
    },
    preventPreviewsTree: {
      title: 'Förhindra förhandsgranskning av dokument när du håller muspekaren',
      description: 'Styr om snabbförhandsvisningar vid hovring visas i det hierarkiska trädet. När förhandsvisningar av svävaren förblir aktiverade kan de ha stor inverkan på appens prestanda.',
      tags: 'trädsvävning, fördröjning, långsam, fps, prestanda, förhandsvisning av sidofältet',
      note: 'Kan ha stor inverkan på appens prestanda!',
    },
    showDocumentID: {
      title: 'Visa dokument-ID',
      description: 'Om detta är aktiverat kommer dokumentets brödtext också att visa det interna dokumentets ID-värde.',
      tags: 'debug, internt id, identifierare, dev-verktyg, felsökning',
    },
    tagsAtTop: {
      title: 'Topptaggar i trädet',
      description: 'Visar taggar överst i det hierarkiska trädet.',
      tags: 'taggordning, taggar först, ovanstående kategorier',
    },
    textShadow: {
      title: 'Text skugga',
      description: 'Den här inställningen växlar textskuggor i det hierarkiska trädet, popup-fönster för relationssökning och flikar, vilket möjliggör ett mer framträdande utseende för text mot bakgrunden.',
      tags: 'kontrast, läsbarhet, skugga, kontur, läsbarhet, texttydlighet',
    }
  }
}
