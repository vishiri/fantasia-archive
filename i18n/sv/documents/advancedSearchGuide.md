# Avancerad sökguide

---

## Introduktion

Fantasia Archive levereras med en ganska avancerad sökmotor i de flesta sökfält som kan söka i antingen alla dokumenttyper eller specifika typer – till exempel de multipla och enkla relationsfälten på varje dokumentsida och snabbsökningspopupen.

---

## Intelligent sökmatchning och sortering

Själva sökningen fungerar enligt följande: du kan ange valfritt antal ord, och programvaran kommer att bearbeta dem individuellt så länge de är åtskilda av blanksteg.

### Sökningen följer dessa regler

- **Sökningen är skiftlägeskänslig, vilket innebär att du kan skriva allt med VERSALER eller gemener (eller något annat sätt), det spelar ingen roll**
- **Orden kan vara i valfri ordning**
  - Exempel: "Dark scary castle" kommer att hittas även om du skriver "scary castle dark"
- **Även delar av ord kan fortfarande ge en framgångsrik matchning**
  - Exempel: `Dark scary castle` kommer att hittas även om du skriver `sca tle ark`
- **Dokument sorteras efter prioritet enligt följande regler:**
  1. **Direktmatchning har företräde framför allt annat**
      - Exempel: "Dark scary castle" är en direkt matchning för en sökning som innehåller "dark scary castle"
  2. **Fullordsmatchning har prioritet framför fragment**
      - Varje helt matchat ord räknas individuellt; ju fler fullständiga matchningar dokumentet har, desto högre kommer det att vara i listan
      - Exempel: "Mörkt läskigt slott" har två fullständiga ordmatchningar från "mörkt läskigt slott"
  3. **Fragment finns längst ner på listan**
      - Varje matchat fragment räknas individuellt; ju fler fragment dokumentet har, desto högre kommer det att vara i listan
      - Exempel: `Dark scary castle` har 2 fragmentmatchningar från `sca tle`- **Du kan inkludera "Andra namn" i sökningen genom att prefixet "@" till söksträngen**
  - Exempel: `@Vampire lair` (om ditt `Dark Scary castle`-dokument hade `Vampire lair` i Andra namn, kommer sökningen att hitta det på detta sätt)

---

## Filtrering

Förutom den avancerade sökfunktionen erbjuder Fantasia Archive även omedelbar filtrering via flera attribut för att ytterligare begränsa sökresultaten.

- **NOTE: All of the following filter values (including the Full-search filtering in the next section) support matching any part of the search text with any part of the search term**
  - Exempel: `>nada` kommer att matcha med `Kontinent > Nordamerika > Kanada > Toronto`

### Filtreringen fungerar på följande sätt och följer dessa regler:

- **Någon av följande filtertermer KOMMER INTE i konflikt med normal ordsökning; därför kan du använda dem tillsammans**
- **Du kan bara använda en instans av var och en av följande filtertyper åt gången; dock kan olika filtertyper vara aktiva tillsammans**
- **Filtret är skiftlägeskänsligt, vilket innebär att du kan skriva allt med VERSORER eller gemener, det spelar ingen roll**
- **Om din filterterm innehöll blanksteg, ersätt dem med "-"-symbolen**
  - Exempel: Du vill söka efter en tagg som heter "Player Characters", för att helt matcha denna tagg måste du skriva "#player-characters"
- **Det hierarkiska sökvägsfiltret tar automatiskt bort alla `>`-symboler från sökvägen; detta resulterar i att de utelämnas från filtersträngen**
  - Exempel: Du vill söka efter en hierarkisk sökväg som innehåller följande `USA > Virginia > Richmond`, för att helt matcha denna hierarkiska sökväg måste du skriva `>usa-virginia-richmond`
- **Följande filtertermer kan användas**
  - `$` - Symbol för sökning av dokumenttyp
  - `#` - Symbol för taggsökning
  - `>` - Symbol för hierarkisk sökväg
  - `^` - Symbol för sökning med villkorlig switch (specifika typer och värden nedan)- `^c` - Visar endast dokument med `Är en kategori` markerad
    - `^d` - Visar endast dokument med `Is Dead/Gone/Destroyed` markerad
    - `^f` - Visar endast dokument med `Är klar` markerat
    - `^m` - Visar endast dokument med `Är ett mindre dokument` markerat, som normalt är osynliga och filtrerade bort

## Helsökningsfiltrering

Den här funktionen är främst avsedd för dem som behöver fullskalig sökning som kan genomsöka vilket fält som helst i vilket dokument som helst för att matcha värden nästan var som helst i datan. Fullständig sökningsfiltrering låter dig begränsa resultaten genom att söka i hela dokumentdatabasen och hitta vad du behöver.

### Några varningsord

**Fullständig sökning är ett mycket kraftfullt men krävande verktyg – ju större ditt projekt växer, desto mer krävande blir det. Om du till exempel har mer än 2000 dokument och sökningen måste genomsöka dem alla, kan det ta några sekunder för en fullständig sökning att uppdatera dina resultat. Tänk på detta: det kan involvera mycket data.**

### Filtreringen fungerar på följande sätt och följer dessa regler

- **Fullsökningen kan användas i kombination med andra filter och/eller vanliga söktermer**
- **Det är möjligt att bara ha en enda instans av hela sökningen närvarande i sökningen samtidigt**
- **Filtret är skiftlägeskänsligt, vilket innebär att du kan skriva allt med VERSORER eller gemener, det spelar ingen roll**
- **När det gäller listor och multirelationer konverteras alla angivna värden till en lång textrad för sökningens skull**
  - Exempel med ett fält som heter "Lokala valutor":
    - Ursprungliga värden: "Canadian Dollar" "American Dollar" "Euro" "Klingon Darsek"
    - Konverterade värden: "kanadensisk-dollar-amerikansk-dollar-euro-klingon-darsek"
- **Följande filtertermer måste användas i söksträngen**
  - `%` - Symbol för början av fullständig sökning
  - `:` - Symbol för avgränsaren mellan fältnamnet och fältvärdet
- **Det är möjligt att använda exakt sökning**
  - Både fältnamnet och dess värde kan lindas in i individuella avgränsare
  - Exempel för båda exakt: `%"local-currency":"någon-valuta"`
  - Exempel på exakt fältnamn: `%"local-currency":some-currency`- Exempel på exakt fältvärde: `%local-currencies:"some-currency"`

- **Om din filterterm innehöll blanksteg, ersätt dem med "-"-symbolen**
  - Exempel: Du vill söka efter ett fält som heter "Lokala valutor" som innehåller "Kanadensiska dollar" som värde; för att helt matcha det fältet och värdet, skriv `%local-currencies:canadian-dollars`
- **Det är möjligt att göra en fulltextsökning, kontrollera alla fält för önskad text genom att göra följande: `%:canadian-dollars`**
- **En lista över fält/fälttyper som fullständig sökning inte fungerar med:**
  - Fälttypen "Break" (detta är de stora titlarna som finns i hela dokumentet)
  - Fälttypen "Taggar" (denna är täckt med ett mer sofistikerat taggfilter)
  - Fälttypen "Switch" (denna innehåller inga textvärden för att jämna filtrera och täcks delvis av sökalternativet för switch)
  - "Namn"-fältet (det här är huvudproblemet med sökningen och den normala sökningen är mycket mer avancerad för att söka igenom den här)
  - Fältet "Hör till under" (det här täcks av en mycket mer avancerad hierarkisk sökväg)