import { Notify } from 'quasar'
import { i18n } from 'app/src/i18n/externalFileLoader'
import { fantasiaImageList, determineCurrentImage } from 'app/src/scripts/appInfo/fantasiaMascotImageManager'
import { mdListArrayConvertor } from '../_utilities/mdListArrayConvertor'

/**
  * This function displays a notification with a random tip, trick, or trivia message from the tips, tricks, and trivia document.
  * @param hideMascot - A boolean value that determines whether to hide the Fantasia mascot image or not.
  */
export const tipsTricksTriviaNotification = (hideMascot: boolean) => {
  const messageList = mdListArrayConvertor(i18n.global.t('documents.tipsTricksTrivia'))

  const randomMessage = messageList[messageList.length * Math.random() << 0]

  Notify.create({
    timeout: 15000,
    icon: (hideMascot) ? 'mdi-help' : undefined,
    color: 'info',
    message: i18n.global.t('QuasarNotify.didYouKnow'),
    avatar: (!hideMascot) ? determineCurrentImage(fantasiaImageList, true, '') : undefined,
    caption: randomMessage,
    actions: [{ icon: 'mdi-close', color: 'white' }]
  })
}
