/**
 * Converts a Markdown list string into an array of non-markdown strings.
 * @param mdString The Markdown list string to convert.
 */
export function mdListArrayConvertor (mdString: string) {
  // Remove all lines that do not start with "- "
  mdString = mdString.replaceAll(/^(?!- ).*$/gm, '')

  // Remove all empty lines and leading/trailing whitespace
  mdString = mdString.replaceAll(/^\s*[\r\n]/gm, '')

  // Remove leading "- "
  mdString = mdString.replaceAll('\n- ', '\n')

  // Cleaned up ` characters and replace them with "
  mdString = mdString.replaceAll('`', '"')

  // Split the list by leading newline characters and remove the last empty line (if present)
  const tipArray = mdString.split('\n')
  if (tipArray[tipArray.length - 1] === '') { tipArray.pop() }

  return tipArray
}
