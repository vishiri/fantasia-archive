/**
 * Converts a Markdown dash-list into plain strings.
 * Every '- ' marker is removed, including the first line. Grave accents become double quotes.
 * @param mdString The Markdown list string to convert.
 */
export function mdListArrayConverter (mdString: string): string[] {
  const tipArray: string[] = []
  for (const line of mdString.split(/\r?\n/)) {
    if (!line.startsWith('- ')) {
      continue
    }
    const text = line.slice(2).replaceAll('`', '"')
    tipArray.push(text)
  }
  return tipArray
}
