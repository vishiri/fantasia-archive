# Guia de pesquisa avançada

---

## Introdução

Fantasia Archive vem com um mecanismo de pesquisa bastante avançado na maioria dos campos de pesquisa que pode pesquisar em todos os tipos de documentos ou em tipos específicos - por exemplo, os campos de relacionamento únicos e múltiplos em cada página do documento e o pop-up de pesquisa rápida.

---

## Correspondência e classificação de pesquisa inteligente

A pesquisa em si funciona da seguinte maneira: você pode inserir qualquer número de palavras, e o software irá processá-las individualmente, desde que estejam separadas por espaços em branco.

### A pesquisa segue estas regras

- **A pesquisa não diferencia maiúsculas de minúsculas, o que significa que você pode digitar tudo em MAIÚSCULAS ou minúsculas (ou de qualquer outra forma), não importa**
- **As palavras podem estar em qualquer ordem**
  - Exemplo: `Castelo escuro e assustador` será encontrado mesmo se você digitar `castelo assustador escuro`
- **Mesmo partes de palavras ainda podem produzir uma correspondência bem-sucedida**
  - Exemplo: `Castelo escuro e assustador` será encontrado mesmo se você digitar `sca tle ark`
- **Os documentos são ordenados por prioridade de acordo com as seguintes regras:**
  1. **A correspondência direta tem prioridade sobre todo o resto**
      - Exemplo: `Castelo sombrio e assustador` é uma correspondência direta para uma pesquisa contendo `castelo sombrio e assustador`
  2. **A correspondência completa da palavra tem prioridade sobre os fragmentos**
      - Cada palavra totalmente correspondida conta individualmente; quanto mais correspondências completas o documento tiver, mais alto ele estará na lista
      - Exemplo: `Dark assustador castelo` tem 2 palavras completas correspondentes a `dark assustador tle`
  3. **Os fragmentos estão no final da lista**
      - Cada fragmento correspondido conta individualmente; quanto mais fragmentos o documento tiver, mais alto ele estará na lista
      - Exemplo: `Dark assustador castelo` tem 2 correspondências de fragmentos de `sca tle`- **Você pode incluir `Outros nomes` na pesquisa prefixando `@` na string de pesquisa**
  - Exemplo: `@Vampire lair` (se o seu documento `Dark assustador castle` tiver `Vampire lair` em Outros nomes, a busca irá encontrá-lo desta forma)

---

## Filtragem

Além da funcionalidade de pesquisa avançada, Fantasia Archive também oferece filtragem instantânea por meio de vários atributos para restringir ainda mais os resultados da pesquisa.

- **NOTA: Todos os valores de filtro a seguir (incluindo a filtragem de pesquisa completa na próxima seção) suportam a correspondência de qualquer parte do texto de pesquisa com qualquer parte do termo de pesquisa**
  - Exemplo: `>nada` corresponderá a `Continente > América do Norte > Canadá > Toronto`

### A filtragem funciona das seguintes formas e segue estas regras:

- **Qualquer um dos seguintes termos de filtro NÃO entrará em conflito com a pesquisa normal de palavras; portanto, você pode usá-los juntos **
- **Você pode usar apenas uma instância de cada um dos seguintes tipos de filtro por vez; no entanto, diferentes tipos de filtros podem estar ativos juntos**
- **O filtro não diferencia maiúsculas de minúsculas, o que significa que você pode digitar tudo em MAIÚSCULAS ou minúsculas, não importa**
- **Se o seu termo de filtro contiver espaços em branco, substitua-os pelo símbolo `-`**
  - Exemplo: você deseja procurar por uma tag chamada `Player Characters`, para corresponder totalmente a esta tag, você precisará digitar `#player-characters`
- **O filtro de caminho hierárquico remove automaticamente todos os símbolos `>` do caminho; isso resulta na sua omissão da string de filtro**
  - Exemplo: você deseja procurar um caminho hierárquico contendo o seguinte `> USA > Virginia > Richmond`, para corresponder totalmente a este caminho hierárquico, você precisará digitar `>usa-virginia-richmond`
- **Os seguintes termos de filtro podem ser usados**
  - `$` - Símbolo para pesquisa de tipo de documento
  - `#` - Símbolo para pesquisa de tags
  - `>` - Símbolo para pesquisa de caminho hierárquico
  - `^` - Símbolo para pesquisa de chave condicional (tipos e valores específicos abaixo)- `^c` - Exibe apenas documentos com `É uma categoria` marcado
    - `^d` - Exibe apenas documentos com `Is Dead/Gone/Destroyed` marcado
    - `^f` - Exibe apenas documentos com `Finalizado` marcado
    - `^m` - Exibe apenas documentos com a opção `É um documento secundário` marcada, que normalmente são invisíveis e filtrados

## Filtragem de pesquisa completa

Esse recurso destina-se principalmente àqueles que precisam de uma pesquisa em grande escala que possa rastrear qualquer campo em qualquer documento para corresponder a valores em quase qualquer lugar dos dados. A filtragem de pesquisa completa permite restringir os resultados pesquisando todo o banco de dados de documentos e identificando o que você precisa.

### Algumas palavras de cautela

**A pesquisa completa é uma ferramenta muito poderosa, mas exigente – quanto maior o seu projeto, mais exigente ele se torna. Se você tiver, por exemplo, mais de 2.000 documentos e a pesquisa tiver que rastrear todos eles, a pesquisa completa poderá levar alguns segundos para atualizar seus resultados. Tenha isto em mente: pode envolver muitos dados.**

### A filtragem funciona das seguintes maneiras e segue estas regras

- **A pesquisa completa pode ser usada em combinação com quaisquer outros filtros e/ou termos de pesquisa normais**
- **É possível ter apenas uma única instância da pesquisa completa presente na pesquisa de uma só vez**
- **O filtro não diferencia maiúsculas de minúsculas, o que significa que você pode digitar tudo em MAIÚSCULAS ou minúsculas, não importa**
- **No caso de listas e multi-relacionamentos, todos os valores inseridos são convertidos em uma longa linha de texto para fins de pesquisa**
  - Exemplo com um campo chamado `Moedas locais`:
    - Valores originais: `Dólar Canadense` `Dólar Americano` `Euro` `Klingon Darsek`
    - Valores convertidos: `dólar-canadense-dólar-americano-euro-klingon-darsek`
- **Os seguintes termos de filtro devem ser usados dentro da string de pesquisa**
  - `%` - Símbolo para o início da pesquisa completa
  - `:` - Símbolo para o separador entre o nome do campo e o valor do campo
- **É possível usar pesquisa precisa**
  - Tanto o nome do campo quanto seu valor podem ser agrupados dentro de delimitadores individuais
  - Exemplo para ambos precisos: `%"local-currencies":"some-currency"`
  - Exemplo para nome de campo preciso: `%"local-currencies":some-currency`- Exemplo para valor de campo preciso: `%local-currencies:"some-currency"`

- **Se o seu termo de filtro contiver espaços em branco, substitua-os pelo símbolo `-`**
  - Exemplo: Você deseja pesquisar um campo chamado `Moedas Locais` que contém `Dólares Canadenses` como valor; para corresponder totalmente a esse campo e valor, digite `%local-currencies:canadian-dollars`
- **É possível fazer uma pesquisa de texto completo, verificando todos os campos para o texto desejado fazendo o seguinte: `%:canadian-dollars`**
- **Uma lista de campos/tipos de campo com os quais a pesquisa completa não funciona:**
  - O campo do tipo `Break` (estes são os grandes títulos presentes em todo o documento)
  - O tipo de campo `Tags` (este é coberto por um filtro de tags mais sofisticado)
  - O tipo de campo `Switch` (este não contém nenhum valor de texto para filtrar e é parcialmente coberto pela opção de pesquisa switch)
  - O campo `Nome` (este é a principal preocupação da pesquisa e a pesquisa normal é muito mais avançada para pesquisar através deste)
  - O campo `Pertence a` (este é coberto por uma pesquisa de caminho hierárquico muito mais avançada)