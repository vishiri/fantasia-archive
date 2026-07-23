export function createTipsTricksTriviaNotification (deps: {
  pickRandomTipsTricksTriviaCaption: (args: {
    mdListArrayConverter: (markdown: string) => string[]
    randomIndex: (length: number) => number
    tipsTricksTriviaMarkdown: string
  }) => string
  createNotify: (opts: {
    actions: Array<{ color: string; icon: string }>
    avatar?: string
    caption: string
    color: string
    message: string
    timeout: number
  }) => void
  determineCurrentImage: (
    imageList: { [key: string]: string },
    isRandom: boolean,
    fantasiaImage: string
  ) => string | undefined
  fantasiaImageList: { [key: string]: string }
  mdListArrayConverter: (markdown: string) => string[]
  randomIndex: (length: number) => number
  t: (key: string) => string
  tipsTricksTriviaMarkdown: () => string
}): {
    tipsTricksTriviaNotification: (hideMascot: boolean) => void
  } {
  const tipsTricksTriviaNotification = (hideMascot: boolean): void => {
    const randomMessage = deps.pickRandomTipsTricksTriviaCaption({
      mdListArrayConverter: deps.mdListArrayConverter,
      randomIndex: deps.randomIndex,
      tipsTricksTriviaMarkdown: deps.tipsTricksTriviaMarkdown()
    })

    const avatar = hideMascot
      ? undefined
      : deps.determineCurrentImage(deps.fantasiaImageList, true, '')

    deps.createNotify({
      actions: [{
        color: 'dark',
        icon: 'mdi-close'
      }],
      ...(avatar !== undefined ? { avatar } : {}),
      caption: randomMessage,
      color: 'info',
      message: deps.t('globalFunctionality.unsortedAppTexts.didYouKnow'),
      timeout: 15000
    })
  }

  return {
    tipsTricksTriviaNotification
  }
}
