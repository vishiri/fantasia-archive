import { i18n } from 'app/i18n/externalFileLoader'
import { pickRandomTipsTricksTriviaCaption } from 'app/src/scripts/appGlobalManagementUI/functions/pickRandomTipsTricksTriviaCaption'
import { mdListArrayConverter } from 'app/src/scripts/_utilities/functions/mdListArrayConverter'

export function pickProjectOverviewRandomTipCaption (): string {
  return pickRandomTipsTricksTriviaCaption({
    mdListArrayConverter,
    randomIndex: (length) => length * Math.random() << 0,
    tipsTricksTriviaMarkdown: i18n.global.t('documents.tipsTricksTrivia')
  })
}
