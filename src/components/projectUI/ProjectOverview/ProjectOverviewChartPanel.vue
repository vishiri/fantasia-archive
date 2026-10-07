<template>
  <div
    class="projectOverview__graphParent bg-dark"
    :class="{
      'projectOverview__graphParent--emptyCta': showEmptyCta,
      'projectOverview__graphParent--fullsize': fullsize
    }"
    data-test-locator="projectOverview-graphParent"
  >
    <div
      class="projectOverview__graphScroll hasScrollbar"
      data-test-locator="projectOverview-graphScroll"
    >
      <q-card
        class="projectOverview__graphCard text-white"
        :class="{
          'projectOverview__graphCard--emptyCta': showEmptyCta,
          'projectOverview__graphCard--fullsize': fullsize
        }"
        :style="graphCardStyle"
      >
        <q-card-section
          v-if="totalDocumentCount > 0"
          class="projectOverview__graphTitleSection"
        >
          <h5
            class="projectOverview__documentDistributionTitle"
            data-test-locator="projectOverview-docCountLabel"
          >
            <span>
              {{ $t('projectUI.projectOverview.documentDistributionTitlePrefix') }}<span
                class="text-bold text-primary-bright"
              >{{ totalDocumentCount }}</span>{{ $t('projectUI.projectOverview.documentDistributionTitleSuffix') }}
            </span>
            <FaHelpTooltipIcon
              v-if="worldLegendItems.length > 0"
              class="projectOverview__worldLegendHelpIcon q-ml-sm"
              data-test-locator="projectOverview-worldLegendHelpIcon"
              :data-test-tooltip-text="worldLegendFlatText"
              :aria-label="$t('projectUI.projectOverview.documentDistributionWorldsHelpAriaLabel')"
            >
              <q-tooltip content-class="projectOverview__worldLegendTooltip">
                <div
                  v-for="item in worldLegendItems"
                  :key="item.name"
                  class="projectOverview__worldLegendRow"
                  data-test-locator="projectOverview-worldLegendRow"
                >
                  <span
                    class="projectOverview__worldLegendSwatch"
                    :style="{ backgroundColor: item.color }"
                    aria-hidden="true"
                  />
                  <span class="projectOverview__worldLegendLine">
                    {{ item.name }}{{ $t('projectUI.projectOverview.documentDistributionWorldLegendSeparator') }}<span
                      class="projectOverview__worldLegendCount text-bold"
                      data-test-locator="projectOverview-worldLegendCount"
                    >{{ item.documentCount }}</span>{{ $t('projectUI.projectOverview.documentDistributionWorldLegendDocumentsSuffix') }}
                  </span>
                </div>
              </q-tooltip>
            </FaHelpTooltipIcon>
          </h5>
        </q-card-section>

        <q-card-section
          v-if="showEmptyCta"
          class="projectOverview__emptyCtaSection column flex-center"
          data-test-locator="projectOverview-emptyCta"
        >
          <div class="projectOverview__emptyPromptInner column items-center">
            <div class="projectOverview__emptyPromptWelcomeWrap full-width">
              <h6
                class="projectOverview__emptyPromptWelcome q-my-xs text-center text-white"
                data-test-locator="projectOverview-emptyCtaWelcome"
              >
                {{ $t('projectUI.projectOverview.emptyCtaWelcome') }}
              </h6>
            </div>
            <div class="projectOverview__emptyPromptButtonWrap full-width text-center">
              <q-btn
                class="projectOverview__emptyPromptButton q-px-xl q-py-xs"
                color="primary-bright"
                data-test-locator="projectOverview-emptyCtaButton"
                :label="emptyCtaMode === 'createDocument'
                  ? $t('projectUI.projectOverview.emptyCtaCreateDocument')
                  : emptyCtaMode === 'assignTemplate'
                    ? $t('projectUI.projectOverview.emptyCtaAssignTemplate')
                    : $t('projectUI.projectOverview.emptyCtaCreateDocumentTemplate')"
                outline
                size="lg"
                unelevated
                @click="onEmptyCtaClick"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section
          v-else
          class="projectOverview__apexHost q-pt-sm"
        >
          <q-inner-loading
            :showing="chartLoading"
            color="primary-bright"
          />
          <apexchart
            v-if="!chartLoading"
            :key="chartHeightPx"
            :height="chartHeightPx"
            :options="apexChartOptions"
            :series="chartSeries"
            type="bar"
            width="100%"
          />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import type { I_faProjectOverviewChartSeries } from 'app/types/I_faProjectOverviewChart'
import type { T_faProjectOverviewEmptyCtaMode } from 'app/types/I_faProjectOverview'

import FaHelpTooltipIcon from 'app/src/components/elements/FaHelpTooltipIcon/FaHelpTooltipIcon.vue'

defineOptions({
  name: 'ProjectOverviewChartPanel'
})

const props = defineProps<{
  chartHeightPx: number
  chartLoading: boolean
  chartOptions: Record<string, unknown>
  chartSeries: I_faProjectOverviewChartSeries[]
  emptyCtaMode: T_faProjectOverviewEmptyCtaMode
  fullsize: boolean
  graphCardWidthPx: number
  onEmptyCtaClick: () => void
  showEmptyCta: boolean
  totalDocumentCount: number
}>()

const graphCardStyle = computed(() => {
  if (props.showEmptyCta) {
    return {}
  }
  const width = `${props.graphCardWidthPx}px`
  return {
    width
  }
})

const apexChartOptions = computed(() => {
  const chartOptions = props.chartOptions
  const previousChart = (
    chartOptions.chart !== undefined &&
    typeof chartOptions.chart === 'object' &&
    chartOptions.chart !== null
  )
    ? chartOptions.chart as Record<string, unknown>
    : {}
  const height = props.chartHeightPx
  const chart = {
    ...previousChart,
    height
  }
  return {
    ...chartOptions,
    chart
  }
})

const worldLegendItems = computed(() => {
  return props.chartSeries.map((series) => {
    let documentCount = 0
    for (const value of series.data) {
      documentCount += value
    }

    const name = series.name
    const color = series.color

    return {
      color,
      documentCount,
      name
    }
  })
})

const worldLegendFlatText = computed(() => {
  return worldLegendItems.value
    .map((item) => `${item.name} - ${item.documentCount} documents`)
    .join(', ')
})
</script>
