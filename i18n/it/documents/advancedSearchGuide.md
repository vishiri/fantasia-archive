# Guida alla ricerca avanzata

---

## Introduzione

Fantasia Archive è dotato di un motore di ricerca abbastanza avanzato nella maggior parte dei campi di ricerca in grado di eseguire ricerche in tutti i tipi di documenti o in tipi specifici, ad esempio i campi di relazione multipli e singoli su ciascuna pagina del documento e il popup di ricerca rapida.

---

## Corrispondenza e ordinamento della ricerca intelligente

La ricerca stessa funziona come segue: puoi inserire un numero qualsiasi di parole e il software le elaborerà individualmente purché siano separate da spazi bianchi.

### La ricerca segue queste regole

- **La ricerca non fa distinzione tra maiuscole e minuscole, il che significa che puoi digitare tutto in MAIUSCOLO o minuscolo (o in qualsiasi altro modo), non importa**
- **Le parole possono essere in qualsiasi ordine**
  - Esempio: "castello spaventoso oscuro" verrà trovato anche se si digita "castello spaventoso oscuro".
- **Anche parti di parole possono comunque produrre una corrispondenza riuscita**
  - Esempio: "Dark spaventoso castello" verrà trovato anche se si digita "sca tle ark".
- **I documenti vengono ordinati per priorità secondo le seguenti regole:**
  1. **L'incontro diretto ha la priorità su tutto il resto**
      - Esempio: "castello spaventoso oscuro" è una corrispondenza diretta per una ricerca contenente "castello spaventoso oscuro".
  2. **La corrispondenza della parola intera ha la priorità sui frammenti**
      - Ogni parola completamente abbinata conta individualmente; più corrispondenze complete ha il documento, più alto sarà nell'elenco
      - Esempio: "Dark spaventoso castello" ha 2 parole intere corrispondenti da "dark spaventoso tle".
  3. **I frammenti sono in fondo all'elenco**
      - Ogni frammento abbinato conta individualmente; più frammenti ha il documento, più in alto sarà nell'elenco
      - Esempio: "Dark spaventoso castello" ha 2 corrispondenze di frammenti da "sca tle".- **Puoi includere "Altri nomi" nella ricerca anteponendo "@" alla stringa di ricerca**
  - Esempio: `@Vampire lair` (se il tuo documento `Dark spaventoso castello` aveva `Vampire lair` in Altri nomi, la ricerca lo troverà in questo modo)

---

## Filtraggio

Oltre alla funzionalità di ricerca avanzata, Fantasia Archive offre anche un filtraggio istantaneo tramite più attributi per restringere ulteriormente i risultati della ricerca.

- **NOTA: tutti i seguenti valori di filtro (incluso il filtro di ricerca completa nella sezione successiva) supportano la corrispondenza di qualsiasi parte del testo di ricerca con qualsiasi parte del termine di ricerca**
  - Esempio: `>nada` corrisponderà a `Continente > Nord America > Canada > Toronto`

### Il filtraggio funziona nei seguenti modi e segue queste regole:

- **Nessuno dei seguenti termini del filtro NON entrerà in conflitto con la normale ricerca di parole; quindi potete usarli insieme**
- **Puoi utilizzare solo un'istanza di ciascuno dei seguenti tipi di filtro alla volta; tuttavia, diversi tipi di filtro potrebbero essere attivi contemporaneamente**
- **Il filtro non fa distinzione tra maiuscole e minuscole, il che significa che puoi digitare tutto in MAIUSCOLO o minuscolo, non importa**
- **Se il termine del filtro conteneva spazi bianchi, sostituiscili con il simbolo `-`**
  - Esempio: desideri cercare un tag chiamato "Personaggi del giocatore", per trovare una corrispondenza completa con questo tag, dovrai digitare "#personaggi-giocatore"
- **Il filtro del percorso gerarchico rimuove automaticamente tutti i simboli `>` dal percorso; ciò comporta la loro omissione dalla stringa di filtro**
  - Esempio: desideri cercare un percorso gerarchico contenente il seguente `>USA > Virginia > Richmond`; per corrispondere completamente a questo percorso gerarchico, dovrai digitare `>usa-virginia-richmond`
- **È possibile utilizzare i seguenti termini di filtro**
  - `$` - Simbolo per la ricerca del tipo di documento
  - `#` - Simbolo per la ricerca dei tag
  - `>` - Simbolo per la ricerca gerarchica del percorso
  - `^` - Simbolo per la ricerca con cambio condizionale (tipi e valori specifici di seguito)- `^c` - Visualizza solo i documenti con la spunta su "È una categoria".
    - `^d` - Visualizza solo i documenti con la spunta su "È morto/andato/distrutto".
    - `^f` - Visualizza solo i documenti con la spunta su "È finito".
    - `^m` - Visualizza solo i documenti con la spunta su "È un documento minore", che normalmente sono invisibili e filtrati

## Filtraggio della ricerca completa

Questa funzionalità è pensata principalmente per coloro che necessitano di una ricerca su vasta scala in grado di eseguire la scansione di qualsiasi campo in qualsiasi documento per far corrispondere valori quasi ovunque nei dati. Il filtraggio della ricerca completa ti consente di restringere i risultati effettuando una ricerca nell'intero database di documenti e individuando ciò di cui hai bisogno.

### Alcune parole di cautela

**La ricerca completa è uno strumento molto potente ma impegnativo: quanto più grande cresce il tuo progetto, tanto più impegnativo diventa. Se disponi, ad esempio, di oltre 2000 documenti e la ricerca deve esaminarli tutti, la ricerca completa potrebbe richiedere alcuni secondi per aggiornare i risultati. Tienilo presente: può comportare molti dati.**

### Il filtraggio funziona nei seguenti modi e segue queste regole

- **La ricerca completa può essere utilizzata in combinazione con qualsiasi altro filtro e/o termine di ricerca normale**
- **È possibile avere solo una singola istanza della ricerca completa presente nella ricerca contemporaneamente**
- **Il filtro non fa distinzione tra maiuscole e minuscole, il che significa che puoi digitare tutto in MAIUSCOLO o minuscolo, non importa**
- **Nel caso di elenchi e relazioni multiple, tutti i valori immessi vengono convertiti in una lunga riga di testo per motivi di ricerca**
  - Esempio con un campo chiamato "Valute locali":
    - Valori originali: `Dollaro canadese` `Dollaro americano` `Euro` `Klingon Darsek`
    - Valori convertiti: `dollaro-canadese-dollaro-americano-euro-klingon-darsek`
- **I seguenti termini di filtro devono essere utilizzati all'interno della stringa di ricerca**
  - `%` - Simbolo per l'inizio della ricerca completa
  - `:` - Simbolo per il separatore tra il nome del campo e il valore del campo
- **È possibile utilizzare la ricerca precisa**
  - Sia il nome del campo che il suo valore possono essere racchiusi all'interno di delimitatori individuali
  - Esempio per entrambi precisi: `%"local-currencies":"some-currency"`
  - Esempio di nome campo preciso: `%"local-currencies":some-currency`- Esempio per un valore di campo preciso: `%valute-locali:"qualche-valuta"`

- **Se il termine del filtro conteneva spazi bianchi, sostituiscili con il simbolo `-`**
  - Esempio: desideri cercare un campo chiamato "Valute locali" che contiene "Dollari canadesi" come valore; per far corrispondere completamente il campo e il valore, digita "%valute-locali:dollari-canadesi".
- **È possibile effettuare una ricerca full-text, controllando tutti i campi per il testo desiderato procedendo come segue: `%:canadian-dollars`**
- **Un elenco di campi/tipi di campo con cui la ricerca completa non funziona:**
  - Il tipo di campo `Break` (questi sono i grandi titoli presenti in tutto il documento)
  - Il tipo di campo "Tag" (questo è coperto da un filtro tag più sofisticato)
  - Il tipo di campo "Switch" (questo non contiene valori di testo nemmeno da filtrare ed è parzialmente coperto dall'opzione di ricerca switch)
  - Il campo "Nome" (questo è l'elemento principale della ricerca e la ricerca normale è molto più avanzata per cercare attraverso questo)
  - Il campo "Appartiene a" (questo è coperto da una ricerca di percorsi gerarchici molto più avanzata)