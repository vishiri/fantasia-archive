import { Notify } from 'quasar'

import { i18n } from 'app/i18n/externalFileLoader'

import {
  determineCurrentImage,
  fantasiaImageList
} from './functions/fantasiaMascotImageManagement'
import { mdListArrayConverter } from '../_utilities/functions/mdListArrayConverter'

import { createTipsTricksTriviaNotification } from './functions/createTipsTricksTriviaNotification'

const tipsTricksTriviaNotificationApi = createTipsTricksTriviaNotification({
  createNotify: (opts) => Notify.create(opts),
  determineCurrentImage,
  fantasiaImageList,
  mdListArrayConverter,
  randomIndex: (length) => length * Math.random() << 0,
  t: (key) => i18n.global.t(key),
  tipsTricksTriviaMarkdown: () => i18n.global.t('documents.tipsTricksTrivia')
})

export const tipsTricksTriviaNotification =
  tipsTricksTriviaNotificationApi.tipsTricksTriviaNotification
