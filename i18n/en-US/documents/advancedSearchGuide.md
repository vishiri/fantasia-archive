
# Advanced search guide

---

## Introduction

Fantasia Archive comes with a fairly advanced search engine in most search fields that can search across either all document types or specific types—for example, the multiple and single relationship fields on each document page and the quick-search popup.

---

## Intelligent search matching & sorting

The search itself works as follows: you can enter any number of words, and the software will process them individually as long as they are separated by whitespace.

### The search follows these rules

- **The search is case-insensitive, which means that you can type everything in UPPER or lower case (or any oThEr WaY), it won't matter**
- **Words can be in any order**
  - Example: `Dark scary castle` will be found even if you type `scary castle dark`
- **Even parts of words can still produce a successful match**
  - Example: `Dark scary castle` will be found even if you type `sca tle ark`
- **Documents are sorted by priority according to the following rules:**
  1. **Direct match has priority over everything else**
      - Example: `Dark scary castle` is a direct match for a search containing `dark scary castle`
  2. **Full word match has priority over fragments**
      - Each fully matched word counts individually; the more full-matches the document has, the higher it will be in the list
      - Example: `Dark scary castle` has 2 full word matches from `dark scary tle`
  3. **Fragments are at the bottom of the list**
      - Each fragment matched counts individually; the more fragments the document has, the higher it will be in the list
      - Example: `Dark scary castle` has 2 fragment matches from `sca tle`
- **You can include `Other names` in the search by prefixing `@` to the search string**
  - Example: `@Vampire lair` (if your `Dark scary castle` document had `Vampire lair` in Other names, the search will find it this way)

---

## Filtering

Except for the advanced search functionality, Fantasia Archive also offers instant filtering via multiple attributes for further narrowing search results.

- **NOTE: All of the following filter values (including the Full-search filtering in the next section) support matching any part of the search-text with any part of the search-term**
  - Example: `>nada` will match with `Continent > North America > Canada > Toronto`

### The filtering works in the following ways and follows these rules:

- **Any of the following filter terms WILL NOT conflict with the normal word search; therefore you can use them together**
- **You can use only one instance of each of the following filter types at a time; however, different filter types may be active together**
- **The filter is case-insensitive, which means that you can type everything in UPPER or lower case, it won't matter**
- **If your filter-term contained whitespaces, replace them with the `-` symbol**
  - Example: You wish to search for a tag called `Player Characters`, to fully match this tag, you will need to type `#player-characters`
- **The hierarchical path filter automatically removes all `>` symbols from the path; this results in their omission from the filter string**
  - Example: You wish to search for a hierarchical path containing the following `USA > Virginia > Richmond`, to fully match this hierarchical path, you will need to type `>usa-virginia-richmond`
- **The following filter terms may be used**
  - `$` - Symbol for document type search
  - `#` - Symbol for tag search
  - `>` - Symbol for hierarchical path search
  - `^` - Symbol for conditional-switch search (specific types and values below)
    - `^c` - Displays only documents with `Is a category` ticked on
    - `^d` - Displays only documents with `Is Dead/Gone/Destroyed` ticked on
    - `^f` - Displays only documents with `Is finished` ticked on
    - `^m` - Displays only documents with `Is a minor document` ticked on that are normally invisible and filtered out

## Full-search filtering

This feature is meant mostly for those who need full-scale search that can crawl any field in any document to match values almost anywhere in the data. Full-search filtering lets you narrow results by searching the whole document database and pinpointing what you need.

### A few words of caution

**Full search is a very powerful but demanding tool—the larger your project grows, the more demanding it becomes. If you have, for example, 2000+ documents and the search has to crawl through all of them, full search might take a few seconds to refresh your results. Keep this in mind: it can involve a lot of data.**

### The filtering works in the following ways and follows these rules

- **The full-search can be used in combination with any other filters and/or normal search terms**
- **It is possible to have only a single instance of the full-search present in the search at once**
- **The filter is case-insensitive, which means that you can type everything in UPPER or lower case, it won't matter**
- **In the case of lists and multi-relationships, all the entered values get converted to one big text-line for the sake of searching**
  - Example with a field called `Local currencies`:
    - Original values: `Canadian Dollar` `American Dollar` `Euro` `Klingon Darsek`
    - Converted values: `canadian-dollar-american-dollar-euro-klingon-darsek`
- **The following filter terms must be used inside the search string**
  - `%` - Symbol for the beginning full-search
  - `:` - Symbol for the division between the field-name and field value
- **It is possible to use precise searching**
  - Both the field name and its value can be wrapped inside individual delimiters
  - Example for both precise: `%"local-currencies":"some-currency"`
  - Example for precise field name: `%"local-currencies":some-currency`
  - Example for precise field value: `%local-currencies:"some-currency"`

- **If your filter-term contained whitespaces, replace them with the `-` symbol**
  - Example: You wish to search for a field called `Local Currencies` that contains `Canadian Dollars` as its value; to fully match that field and value, type `%local-currencies:canadian-dollars`
- **It is possible to do a full-text search, checking all fields for the desired text by doing the following: `%:canadian-dollars`**
- **A list of fields/field types the full-search doesn't work with:**
  - The `Break` field type (these are the big titles present throughout the document)
  - The `Tags` field type (this one is covered with a more sophisticated tag filter)
  - The `Switch` field type (this one doesn't contain any text values to even filter and is partially covered by the switch search option)
  - The `Name` field (this one is the main concern of the search and the normal search is far more advanced for searching through this one)
  - The `Belongs under` field (this one is covered by a much more advanced hierarchical path search)
