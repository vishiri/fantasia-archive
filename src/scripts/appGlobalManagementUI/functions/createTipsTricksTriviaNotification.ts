export function createTipsTricksTriviaNotification (deps: {
  createNotify: (opts: {
    actions: Array<{ color: string; icon: string }>
    avatar?: string
    caption: string
    color: string
    icon?: string
    message: string
    timeout: number
  }) => void
  determineCurrentImage: (
    imageList: { [key: string]: string },
    isRandom: boolean,
    fantasiaImage: string
  ) => string
  fantasiaImageList: { [key: string]: string }
  mdListArrayConverter: (markdown: string) => string[]
  randomIndex: (length: number) => number
  t: (key: string) => string
  tipsTricksTriviaMarkdown: () => string
}): {
    tipsTricksTriviaNotification: (hideMascot: boolean) => void
  } {
  const tipsTricksTriviaNotification = (hideMascot: boolean): void => {
    const messageList = deps.mdListArrayConverter(deps.tipsTricksTriviaMarkdown())

    const randomMessage = messageList[deps.randomIndex(messageList.length)]

    const avatar = hideMascot
      ? undefined
      : deps.determineCurrentImage(deps.fantasiaImageList, true, '')
    const icon = hideMascot ? 'mdi-help' : undefined

    deps.createNotify({
      actions: [{
        color: 'dark',
        icon: 'mdi-close'
      }],
      avatar,
      caption: randomMessage,
      color: 'info',
      icon,
      message: deps.t('globalFunctionality.unsortedAppTexts.didYouKnow'),
      timeout: 15000
    })
  }

  return {
    tipsTricksTriviaNotification
  }
}
