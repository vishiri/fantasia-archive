# Erweiterte Suchanleitung

---

## Einführung

Fantasia Archive verfügt in den meisten Suchfeldern über eine ziemlich erweiterte Suchmaschine, die entweder alle Dokumenttypen oder bestimmte Typen durchsuchen kann – zum Beispiel die Mehrfach- und Einzelbeziehungsfelder auf jeder Dokumentseite und das Schnellsuch-Popup.

---

## Intelligente Suche, Zuordnung und Sortierung

Die Suche selbst funktioniert wie folgt: Sie können beliebig viele Wörter eingeben und die Software verarbeitet diese einzeln, sofern sie durch Leerzeichen getrennt sind.

### Die Suche folgt diesen Regeln

- **Bei der Suche wird die Groß-/Kleinschreibung nicht beachtet, was bedeutet, dass Sie alles in GROSS- oder Kleinbuchstaben (oder auf eine andere Art und Weise) eingeben können, es spielt keine Rolle**
- **Wörter können in beliebiger Reihenfolge sein**
  - Beispiel: „Dark Scary Castle“ wird auch dann gefunden, wenn Sie „Scary Castle Dark“ eingeben
- **Sogar Wortteile können immer noch zu einer erfolgreichen Übereinstimmung führen**
  - Beispiel: „Dark Scary Castle“ wird auch dann gefunden, wenn Sie „Sca tle Ark“ eingeben
- **Dokumente werden nach den folgenden Regeln nach Priorität sortiert:**
  1. **Direkte Übereinstimmung hat Vorrang vor allem anderen**
      - Beispiel: „Dark Scary Castle“ ist ein direkter Treffer für eine Suche, die „Dark Scary Castle“ enthält
  2. **Vollständige Wortübereinstimmung hat Vorrang vor Fragmenten**
      - Jedes vollständig übereinstimmende Wort zählt einzeln; Je mehr vollständige Übereinstimmungen das Dokument hat, desto weiter oben steht es in der Liste
      - Beispiel: „Dark Scary Castle“ enthält 2 vollständige Wortübereinstimmungen aus „Dark Scary Tle“.
  3. **Fragmente stehen am Ende der Liste**
      - Jedes übereinstimmende Fragment zählt einzeln; Je mehr Fragmente das Dokument enthält, desto weiter oben steht es in der Liste
      - Beispiel: „Dark Scary Castle“ hat 2 Fragment-Übereinstimmungen von „Sca tle“.- **Sie können „Andere Namen“ in die Suche einbeziehen, indem Sie der Suchzeichenfolge „@“ voranstellen**
  - Beispiel: „@Vampire Lair“ (wenn Ihr „Dark Scary Castle“-Dokument „Vampire Lair“ in „Andere Namen“ enthielt, wird die Suche es auf diese Weise finden)

---

## Filterung

Zusätzlich zur erweiterten Suchfunktion bietet Fantasia Archive auch eine sofortige Filterung über mehrere Attribute zur weiteren Eingrenzung der Suchergebnisse.

- **HINWEIS: Alle folgenden Filterwerte (einschließlich der Filterung „Vollständige Suche“ im nächsten Abschnitt) unterstützen die Übereinstimmung eines beliebigen Teils des Suchtexts mit einem beliebigen Teil des Suchbegriffs**
  - Beispiel: „>nada“ stimmt mit „Kontinent > Nordamerika > Kanada > Toronto“ überein

### Die Filterung funktioniert auf folgende Weise und folgt diesen Regeln:

- **Die folgenden Filterbegriffe stehen NICHT in Konflikt mit der normalen Wortsuche. daher können Sie sie zusammen verwenden**
- **Sie können jeweils nur eine Instanz jedes der folgenden Filtertypen verwenden; Allerdings können verschiedene Filtertypen gleichzeitig aktiv sein**
- **Der Filter unterscheidet nicht zwischen Groß- und Kleinschreibung, was bedeutet, dass Sie alles in GROSS- oder Kleinbuchstaben eingeben können, es spielt keine Rolle**
- **Wenn Ihr Filterbegriff Leerzeichen enthielt, ersetzen Sie diese durch das „-“-Symbol**
  - Beispiel: Sie möchten nach einem Tag namens „Spielercharaktere“ suchen. Um diesen Tag vollständig zu finden, müssen Sie „#Spielercharaktere“ eingeben
- **Der hierarchische Pfadfilter entfernt automatisch alle „>“-Symbole aus dem Pfad; Dies führt dazu, dass sie aus der Filterzeichenfolge weggelassen werden**
  - Beispiel: Sie möchten nach einem hierarchischen Pfad suchen, der Folgendes enthält: „USA > Virginia > Richmond“. Um diesen hierarchischen Pfad vollständig zu finden, müssen Sie „>usa-virginia-richmond“ eingeben
- **Die folgenden Filterbegriffe können verwendet werden**
  - „$“ – Symbol für die Dokumenttypsuche
  - „#“ – Symbol für die Tag-Suche
  - „>“ – Symbol für die hierarchische Pfadsuche
  - „^“ – Symbol für die Suche nach bedingten Schaltern (spezifische Typen und Werte unten)- „^c“ – Zeigt nur Dokumente an, bei denen „Ist eine Kategorie“ aktiviert ist
    - „^d“ – Zeigt nur Dokumente an, bei denen „Ist tot/weg/zerstört“ aktiviert ist
    - „^f“ – Zeigt nur Dokumente an, bei denen „Ist fertig“ aktiviert ist
    - „^m“ – Zeigt nur Dokumente an, bei denen „Ist ein untergeordnetes Dokument“ aktiviert ist, die normalerweise unsichtbar sind und herausgefiltert werden

## Vollständige Suchfilterung

Diese Funktion ist vor allem für diejenigen gedacht, die eine umfassende Suche benötigen, die jedes Feld in jedem Dokument durchsuchen kann, um Werte an fast jeder beliebigen Stelle in den Daten abzugleichen. Mit der vollständigen Suchfilterung können Sie die Ergebnisse eingrenzen, indem Sie die gesamte Dokumentdatenbank durchsuchen und genau das finden, was Sie benötigen.

### Ein paar Worte der Vorsicht

**Die vollständige Suche ist ein sehr leistungsfähiges, aber anspruchsvolles Tool – je größer Ihr Projekt wird, desto anspruchsvoller wird es. Wenn Sie beispielsweise mehr als 2.000 Dokumente haben und die Suche alle Dokumente durchsuchen muss, kann es einige Sekunden dauern, bis die vollständige Suche Ihre Ergebnisse aktualisiert. Bedenken Sie Folgendes: Es kann viele Daten umfassen.**

### Die Filterung funktioniert auf folgende Weise und folgt diesen Regeln

- **Die Vollsuche kann in Kombination mit beliebigen anderen Filtern und/oder normalen Suchbegriffen verwendet werden**
- **Es ist möglich, dass nur eine einzige Instanz der vollständigen Suche gleichzeitig in der Suche vorhanden ist**
- **Der Filter unterscheidet nicht zwischen Groß- und Kleinschreibung, was bedeutet, dass Sie alles in GROSS- oder Kleinbuchstaben eingeben können, es spielt keine Rolle**
- **Bei Listen und Mehrfachbeziehungen werden alle eingegebenen Werte aus Suchgründen in eine lange Textzeile umgewandelt**
  - Beispiel mit einem Feld namens „Lokale Währungen“:
    - Ursprüngliche Werte: „Kanadischer Dollar“, „Amerikanischer Dollar“, „Euro“, „Klingonischer Darsek“.
    - Umgerechnete Werte: „canadian-dollar-american-dollar-euro-klingon-darsek“.
- **Die folgenden Filterbegriffe müssen innerhalb der Suchzeichenfolge verwendet werden**
  - „%“ – Symbol für die beginnende Vollsuche
  - `:` – Symbol für das Trennzeichen zwischen Feldname und Feldwert
- **Es ist möglich, eine präzise Suche zu verwenden**
  - Sowohl der Feldname als auch sein Wert können in einzelne Trennzeichen eingeschlossen werden
  - Beispiel für beides präzise: `%"local-currencies":"some-currency"`
  - Beispiel für einen genauen Feldnamen: „%"local-currencies":some-currency“.– Beispiel für einen genauen Feldwert: „%local-currencies:“some-currency““.

- **Wenn Ihr Filterbegriff Leerzeichen enthielt, ersetzen Sie diese durch das „-“-Symbol**
  - Beispiel: Sie möchten nach einem Feld namens „Lokale Währungen“ suchen, dessen Wert „Kanadische Dollar“ enthält. Um dieses Feld und diesen Wert vollständig abzugleichen, geben Sie „%local-currencies:canadian-dollars“ ein
- **Es ist möglich, eine Volltextsuche durchzuführen und alle Felder auf den gewünschten Text zu überprüfen, indem Sie Folgendes tun: „%:canadian-dollars“**
- **Eine Liste von Feldern/Feldtypen, mit denen die vollständige Suche nicht funktioniert:**
  - Der Feldtyp „Unterbrechung“ (dies sind die großen Titel, die im gesamten Dokument vorhanden sind)
  - Der Feldtyp „Tags“ (dieser ist mit einem ausgefeilteren Tag-Filter abgedeckt)
  - Der Feldtyp „Schalter“ (dieser enthält keine zu filternden Textwerte und wird teilweise von der Schaltersuchoption abgedeckt)
  - Das Feld „Name“ (dieses ist das Hauptanliegen der Suche und die normale Suche ist weitaus komplexer, um dieses Feld zu durchsuchen)
  - Das Feld „Gehört unter“ (dieses wird durch eine viel erweiterte hierarchische Pfadsuche abgedeckt)