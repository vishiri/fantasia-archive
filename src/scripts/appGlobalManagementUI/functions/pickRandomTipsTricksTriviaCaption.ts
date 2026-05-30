/**
 * Picks one bullet from the Tips, Tricks & Trivia markdown list.
 */
export function pickRandomTipsTricksTriviaCaption (deps: {
  mdListArrayConverter: (markdown: string) => string[]
  randomIndex: (length: number) => number
  tipsTricksTriviaMarkdown: string
}): string {
  const messageList = deps.mdListArrayConverter(deps.tipsTricksTriviaMarkdown)

  if (messageList.length === 0) {
    return ''
  }

  return messageList[deps.randomIndex(messageList.length)] ?? ''
}
