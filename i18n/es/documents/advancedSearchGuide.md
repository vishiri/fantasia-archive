# Guía de búsqueda avanzada

---

## Introducción

Fantasia Archive viene con un motor de búsqueda bastante avanzado en la mayoría de los campos de búsqueda que puede buscar en todos los tipos de documentos o en tipos específicos, por ejemplo, los campos de relación múltiples y únicos en cada página del documento y la ventana emergente de búsqueda rápida.

---

## Búsqueda inteligente, coincidencia y clasificación

La búsqueda en sí funciona de la siguiente manera: puede ingresar cualquier cantidad de palabras y el software las procesará individualmente siempre que estén separadas por espacios en blanco.

### La búsqueda sigue estas reglas

- **La búsqueda no distingue entre mayúsculas y minúsculas, lo que significa que puedes escribir todo en MAYÚSCULAS o minúsculas (o de cualquier otra manera), no importará**
- **Las palabras pueden estar en cualquier orden**
  - Ejemplo: "Castillo oscuro y aterrador" se encontrará incluso si escribe "castillo oscuro y aterrador"
- **Incluso partes de palabras pueden producir una coincidencia exitosa**
  - Ejemplo: `Castillo oscuro y aterrador` se encontrará incluso si escribe `sca tle ark`
- **Los documentos se ordenan por prioridad según las siguientes reglas:**
  1. **La coincidencia directa tiene prioridad sobre todo lo demás**
      - Ejemplo: "Castillo oscuro y aterrador" coincide directamente con una búsqueda que contiene "castillo oscuro y aterrador"
  2. **La concordancia completa de palabras tiene prioridad sobre los fragmentos**
      - Cada palabra totalmente coincidente cuenta individualmente; cuantas más coincidencias completas tenga el documento, más arriba estará en la lista
      - Ejemplo: `Dark Scary Castle` tiene 2 coincidencias de palabras completas de `Dark Scary tle`
  3. **Los fragmentos están al final de la lista**
      - Cada fragmento emparejado cuenta individualmente; cuantos más fragmentos tenga el documento, más arriba estará en la lista
      - Ejemplo: `Dark Scary Castle` tiene 2 coincidencias de fragmentos de `sca tle`- **Puedes incluir `Otros nombres` en la búsqueda anteponiendo `@` a la cadena de búsqueda**
  - Ejemplo: `@Vampire lair` (si su documento `Dark Scary Castle` tenía `Vampire Lair` en Otros nombres, la búsqueda lo encontrará de esta manera)

---

## Filtrado

Además de la funcionalidad de búsqueda avanzada, Fantasia Archive también ofrece filtrado instantáneo a través de múltiples atributos para limitar aún más los resultados de búsqueda.

- **NOTA: Todos los siguientes valores de filtro (incluido el filtrado de búsqueda completa en la siguiente sección) admiten la coincidencia de cualquier parte del texto de búsqueda con cualquier parte del término de búsqueda**
  - Ejemplo: `>nada` coincidirá con `Continente > Norteamérica > Canadá > Toronto`

### El filtrado funciona de las siguientes maneras y sigue estas reglas:

- **Cualquiera de los siguientes términos de filtro NO entrará en conflicto con la búsqueda de palabras normal; por lo tanto puedes usarlos juntos**
- **Puedes utilizar sólo una instancia de cada uno de los siguientes tipos de filtro a la vez; sin embargo, es posible que diferentes tipos de filtros estén activos juntos**
- **El filtro no distingue entre mayúsculas y minúsculas, lo que significa que puedes escribir todo en MAYÚSCULAS o minúsculas, no importará**
- **Si su término de filtro contenía espacios en blanco, reemplácelos con el símbolo `-`**
  - Ejemplo: desea buscar una etiqueta llamada "Personajes del jugador". Para que coincida completamente con esta etiqueta, deberá escribir "#personajes-jugador".
- **El filtro de ruta jerárquica elimina automáticamente todos los símbolos `>` de la ruta; esto resulta en su omisión de la cadena de filtro**
  - Ejemplo: desea buscar una ruta jerárquica que contenga lo siguiente "EE.UU. > Virginia > Richmond". Para que coincida completamente con esta ruta jerárquica, deberá escribir ">usa-virginia-richmond".
- **Se pueden utilizar los siguientes términos de filtro**
  - `$` - Símbolo para búsqueda de tipo de documento
  - `#` - Símbolo para búsqueda de etiquetas
  - `>` - Símbolo para búsqueda de ruta jerárquica
  - `^`: símbolo para búsqueda de cambio condicional (tipos y valores específicos a continuación)- `^c`: muestra solo documentos con `Es una categoría` marcada
    - `^d`: muestra solo documentos con la opción `Está muerto/desaparecido/destruido` marcada
    - `^f`: muestra solo los documentos con "Está terminado" marcado
    - `^m`: muestra solo los documentos con la opción "Es un documento menor" marcado, que normalmente son invisibles y están filtrados.

## Filtrado de búsqueda completa

Esta característica está destinada principalmente a aquellos que necesitan una búsqueda a gran escala que pueda rastrear cualquier campo en cualquier documento para hacer coincidir valores en casi cualquier parte de los datos. El filtrado de búsqueda completa le permite limitar los resultados buscando en toda la base de datos de documentos y señalando lo que necesita.

### Algunas palabras de precaución

**La búsqueda completa es una herramienta muy poderosa pero exigente: cuanto más crece su proyecto, más exigente se vuelve. Si tiene, por ejemplo, más de 2000 documentos y la búsqueda debe recorrerlos todos, la búsqueda completa puede tardar unos segundos en actualizar los resultados. Tenga esto en cuenta: puede implicar una gran cantidad de datos.**

### El filtrado funciona de las siguientes maneras y sigue estas reglas

- **La búsqueda completa se puede utilizar en combinación con otros filtros y/o términos de búsqueda normales**
- **Es posible tener solo una instancia de la búsqueda completa presente en la búsqueda a la vez**
- **El filtro no distingue entre mayúsculas y minúsculas, lo que significa que puedes escribir todo en MAYÚSCULAS o minúsculas, no importará**
- **En el caso de listas y relaciones múltiples, todos los valores ingresados se convierten en una línea de texto larga para realizar la búsqueda**
  - Ejemplo con un campo llamado `Monedas locales`:
    - Valores originales: `Dólar canadiense` `Dólar americano` `Euro` `Klingon Darsek`
    - Valores convertidos: `dólar-canadiense-dólar-americano-euro-klingon-darsek`
- **Los siguientes términos de filtro deben usarse dentro de la cadena de búsqueda**
  - `%` - Símbolo del inicio de la búsqueda completa
  - `:` - Símbolo para el separador entre el nombre del campo y el valor del campo
- **Es posible utilizar búsquedas precisas**
  - Tanto el nombre del campo como su valor se pueden incluir dentro de delimitadores individuales.
  - Ejemplo para ambos precisos: `%"local-currencies":"some-currency"`
  - Ejemplo de nombre de campo preciso: `%"local-currencies":some-currency`- Ejemplo de valor de campo preciso: `%local-currencies:"some-currency"`

- **Si su término de filtro contenía espacios en blanco, reemplácelos con el símbolo `-`**
  - Ejemplo: desea buscar un campo llamado "Monedas locales" que contenga "Dólares canadienses" como valor; para que coincida completamente con ese campo y valor, escriba `%local-currencies:canadian-dollars`
- **Es posible realizar una búsqueda de texto completo, verificando todos los campos para encontrar el texto deseado haciendo lo siguiente: `%:canadian-dollars`**
- **Una lista de campos/tipos de campos con los que la búsqueda completa no funciona:**
  - El tipo de campo `Break` (estos son los títulos grandes presentes en todo el documento)
  - El tipo de campo `Etiquetas` (este está cubierto con un filtro de etiquetas más sofisticado)
  - El tipo de campo `Cambiar` (este no contiene ningún valor de texto para filtrar y está parcialmente cubierto por la opción de búsqueda de cambio)
  - El campo `Nombre` (este es el principal objetivo de la búsqueda y la búsqueda normal es mucho más avanzada para buscar a través de este)
  - El campo "Pertenece a" (este está cubierto por una búsqueda de ruta jerárquica mucho más avanzada)