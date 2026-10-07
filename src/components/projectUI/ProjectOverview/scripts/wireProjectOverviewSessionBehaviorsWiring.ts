import type {
  I_wireProjectOverviewSessionBehaviorsInput,
  I_wireProjectOverviewSessionBehaviorsResult
} from 'app/types/I_faProjectOverview'

import {
  createProjectOverviewEmptyCtaHandlers,
  createProjectOverviewLastOpenedActionHandlers
} from '../functions/createProjectOverviewActionHandlers'
import { createProjectOverviewDataLoader } from './createProjectOverviewDataLoaderWiring'
import {
  createProjectOverviewDisplayState,
  createProjectOverviewLastOpenedChromeResolver
} from './createProjectOverviewDisplayStateWiring'

function readProjectOverviewContentEpoch (
  deps: I_wireProjectOverviewSessionBehaviorsInput['deps']
): number | undefined {
  const activeProject = deps.S_FaActiveProject() as {
    readProjectContentEpoch?: () => number
  }
  return activeProject.readProjectContentEpoch?.()
}

/**
 * Wires display computeds, CTA/last-opened handlers, and chart data loader.
 */
export function wireProjectOverviewSessionBehaviors (
  input: I_wireProjectOverviewSessionBehaviorsInput
): I_wireProjectOverviewSessionBehaviorsResult {
  const display = createProjectOverviewDisplayState({
    appSettingsDialogPreview: input.appSettingsDialogPreview,
    computed: input.deps.computed,
    hasDocumentTemplates: input.hasDocumentTemplates,
    resolveHideFantasiaMascot: input.deps.resolveHideFantasiaMascot,
    resolveTabWorldIndicatorColor: input.deps.resolveTabWorldIndicatorColor,
    settings: input.settings,
    totalDocumentCount: input.totalDocumentCount,
    worlds: input.worlds
  })

  const { onEmptyCtaClick } = createProjectOverviewEmptyCtaHandlers({
    FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB:
      input.deps.FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB,
    FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB:
      input.deps.FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB,
    emptyCtaMode: display.emptyCtaMode,
    runFaAction: input.deps.runFaAction
  })

  const {
    onLastOpenedContextAddUnder,
    onLastOpenedContextCopyBackgroundColor,
    onLastOpenedContextCopyDocument,
    onLastOpenedContextCopyName,
    onLastOpenedContextCopyTextColor,
    onLastOpenedContextDelete,
    onLastOpenedContextEdit,
    onLastOpenedContextOpen,
    onLastOpenedRowAuxClick,
    onLastOpenedRowClick
  } = createProjectOverviewLastOpenedActionHandlers({
    runFaAction: input.deps.runFaAction
  })

  const { clearChartSettleTimer, loadOverviewData, refreshLastOpenedAfterMru } =
    createProjectOverviewDataLoader({
      chartLoading: input.chartLoading,
      chartOptions: input.chartOptions,
      chartSeries: input.chartSeries,
      graphCardWidthPx: input.graphCardWidthPx,
      hasDocumentTemplates: input.hasDocumentTemplates,
      lastOpenedItems: input.lastOpenedItems,
      listDocumentDistribution: input.deps.listDocumentDistribution,
      listDocumentLastOpened: input.deps.listDocumentLastOpened,
      preferredLanguageCode: () => input.settings.value?.languageCode ?? 'en-US',
      readProjectContentEpoch: () => readProjectOverviewContentEpoch(input.deps),
      resolveChartHeightPx: () => display.chartHeightPx.value,
      resolveDocumentCountSeparator: () => String(
        input.deps.t('projectUI.projectOverview.documentDistributionWorldLegendSeparator')
      ),
      resolveDocumentsLabelSuffix: () => String(
        input.deps.t('projectUI.projectOverview.documentDistributionWorldLegendDocumentsSuffix')
      ),
      totalDocumentCount: input.totalDocumentCount
    })

  const { resolveLastOpenedItemChromeStyle } = createProjectOverviewLastOpenedChromeResolver({
    buildFaColorGlyphCssCustomProperties: input.deps.buildFaColorGlyphCssCustomProperties,
    resolveDocumentAppearanceChromeStyle: input.deps.resolveDocumentAppearanceChromeStyle
  })

  const {
    chartHeightPx,
    emptyCtaMode,
    graphCardHeightPx,
    resolveLastOpenedWorldIndicatorColor,
    showContentRow,
    showEmptyCta,
    showMascotInTipCard,
    showTipCard,
    showWorldIndicators
  } = display

  return {
    clearChartSettleTimer,
    chartHeightPx,
    emptyCtaMode,
    graphCardHeightPx,
    loadOverviewData,
    refreshLastOpenedAfterMru,
    onEmptyCtaClick,
    onLastOpenedContextAddUnder,
    onLastOpenedContextCopyBackgroundColor,
    onLastOpenedContextCopyDocument,
    onLastOpenedContextCopyName,
    onLastOpenedContextCopyTextColor,
    onLastOpenedContextDelete,
    onLastOpenedContextEdit,
    onLastOpenedContextOpen,
    onLastOpenedRowAuxClick,
    onLastOpenedRowClick,
    resolveLastOpenedItemChromeStyle,
    resolveLastOpenedWorldIndicatorColor,
    showContentRow,
    showEmptyCta,
    showMascotInTipCard,
    showTipCard,
    showWorldIndicators
  }
}
