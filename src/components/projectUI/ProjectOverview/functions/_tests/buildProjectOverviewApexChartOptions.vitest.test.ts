import { expect, test } from 'vitest'

import type { I_faProjectOverviewStackedChartModel } from 'app/types/I_faProjectOverviewChart'

import {
  FA_PROJECT_OVERVIEW_CHART_HEIGHT_FLAT_THEME_OFFSET_PX,
  FA_PROJECT_OVERVIEW_CHART_HEIGHT_PX,
  FA_PROJECT_OVERVIEW_CHART_HEIGHT_TIPS_HIDDEN_PX,
  FA_PROJECT_OVERVIEW_CHART_XAXIS_LABELS_MAX_HEIGHT_PX,
  resolveProjectOverviewChartHeightPx,
  resolveProjectOverviewChartSvgHeightPx
} from '../buildProjectOverviewApexChartOptions'
import { buildProjectOverviewApexChartOptions } from '../../scripts/buildProjectOverviewApexChartOptionsWiring'
import { buildProjectOverviewApexChartTooltipHtml } from '../buildProjectOverviewApexChartTooltipHtml'
import { createProjectOverviewApexTooltipCustom } from '../createProjectOverviewApexTooltipCustom'
import {
  FA_PROJECT_OVERVIEW_CHART_COLUMN_MAX_WIDTH_PX,
  resolveProjectOverviewApexColumnWidth
} from '../resolveProjectOverviewApexColumnWidth'

test('Test that project overview chart totals treat a missing series point as zero', () => {
  const options = buildProjectOverviewApexChartOptions({
    chartModel: {
      categories: ['Artifacts', 'Beasts'],
      series: [
        {
          color: '#112233',
          data: [2],
          name: 'Alpha'
        }
      ],
      totalDocumentCount: 2
    },
    columnWidth: '40%',
    tooltipCustom: () => ''
  })
  expect(options).toBeTypeOf('object')
})

const chartModel: I_faProjectOverviewStackedChartModel = {
  categories: ['Artifacts', 'Beasts'],
  series: [
    {
      color: '#112233',
      data: [2, 0],
      name: 'Alpha'
    },
    {
      color: '#445566',
      data: [0, 3],
      name: 'Beta'
    }
  ],
  totalDocumentCount: 5
}

const documentCountSeparator = ' - '
const documentsLabelSuffix = ' documents'
const twoCategoryColumnWidth = resolveProjectOverviewApexColumnWidth(chartModel.categories.length)
const tooltipCustom = createProjectOverviewApexTooltipCustom({
  buildTooltipHtml: buildProjectOverviewApexChartTooltipHtml,
  documentCountSeparator,
  documentsLabelSuffix
})

/**
 * buildProjectOverviewApexChartOptions
 * Builds stacked bar options and formats category totals including zeros.
 */
test('Test that buildProjectOverviewApexChartOptions formats totals and zero categories', () => {
  const options = buildProjectOverviewApexChartOptions({
    chartModel,
    columnWidth: twoCategoryColumnWidth,
    tooltipCustom
  })
  expect(options.colors).toEqual(['#112233', '#445566'])
  expect((options.legend as { show: boolean }).show).toBe(false)
  expect(
    (options.xaxis as { categories: string[] }).categories
  ).toEqual(['Artifacts', 'Beasts'])
  expect((options.xaxis as { labels: { rotate: number } }).labels.rotate).toBe(-45)
  expect((options.xaxis as { labels: { rotateAlways: boolean } }).labels.rotateAlways).toBe(true)
  expect((options.xaxis as { labels: { maxHeight?: number } }).labels.maxHeight).toBe(
    FA_PROJECT_OVERVIEW_CHART_XAXIS_LABELS_MAX_HEIGHT_PX
  )
  expect((options.chart as { height: number }).height).toBe(FA_PROJECT_OVERVIEW_CHART_HEIGHT_PX)
  expect(resolveProjectOverviewChartHeightPx({
    hideTooltipsProject: false,
    themeSkin: 'fantasy'
  })).toBe(FA_PROJECT_OVERVIEW_CHART_HEIGHT_PX)
  expect(resolveProjectOverviewChartHeightPx({
    hideTooltipsProject: true,
    themeSkin: 'fantasy'
  })).toBe(
    FA_PROJECT_OVERVIEW_CHART_HEIGHT_TIPS_HIDDEN_PX
  )
  expect(resolveProjectOverviewChartHeightPx({
    hideTooltipsProject: true,
    themeSkin: 'flat'
  })).toBe(
    FA_PROJECT_OVERVIEW_CHART_HEIGHT_TIPS_HIDDEN_PX -
    FA_PROJECT_OVERVIEW_CHART_HEIGHT_FLAT_THEME_OFFSET_PX
  )
  expect(resolveProjectOverviewChartSvgHeightPx(FA_PROJECT_OVERVIEW_CHART_HEIGHT_PX)).toBe(447)
  expect(
    resolveProjectOverviewChartSvgHeightPx(FA_PROJECT_OVERVIEW_CHART_HEIGHT_TIPS_HIDDEN_PX)
  ).toBe(668)
  expect(
    (options.xaxis as { labels: { style: { cssClass: string } } }).labels.style.cssClass
  ).toBe('projectOverview__graphCategoryLabel')

  const bar = (
    options.plotOptions as {
      bar: {
        borderRadius: number
        borderRadiusApplication: string
        borderRadiusWhenStacked: string
        columnWidth: string
        dataLabels: {
          total: {
            formatter: (_value: unknown, opts: { dataPointIndex: number }) => string
          }
        }
      }
    }
  ).bar

  expect(bar.borderRadius).toBe(4)
  expect(bar.borderRadiusApplication).toBe('end')
  expect(bar.borderRadiusWhenStacked).toBe('last')
  expect(bar.columnWidth).toBe(String(FA_PROJECT_OVERVIEW_CHART_COLUMN_MAX_WIDTH_PX))
  expect(bar.dataLabels.total.formatter(null, { dataPointIndex: 0 })).toBe('2')
  expect(bar.dataLabels.total.formatter(null, { dataPointIndex: 1 })).toBe('3')
  expect(bar.dataLabels.total.formatter(null, { dataPointIndex: 99 })).toBe('')
})

/**
 * buildProjectOverviewApexChartOptions
 * Uses tips-hidden Apex height when chartHeightPx is passed.
 */
test('Test that buildProjectOverviewApexChartOptions accepts tips-hidden chart height', () => {
  const options = buildProjectOverviewApexChartOptions({
    chartHeightPx: FA_PROJECT_OVERVIEW_CHART_HEIGHT_TIPS_HIDDEN_PX,
    chartModel,
    columnWidth: twoCategoryColumnWidth,
    tooltipCustom
  })
  expect((options.chart as { height: number }).height).toBe(
    FA_PROJECT_OVERVIEW_CHART_HEIGHT_TIPS_HIDDEN_PX
  )
})

/**
 * buildProjectOverviewApexChartOptions
 * Enables a custom segment tooltip with template + world + document count.
 */
test('Test that buildProjectOverviewApexChartOptions builds custom tooltip html', () => {
  const options = buildProjectOverviewApexChartOptions({
    chartModel,
    columnWidth: twoCategoryColumnWidth,
    tooltipCustom
  })
  const tooltip = options.tooltip as {
    arrow: boolean
    cssClass: string
    custom: (input: {
      dataPointIndex: number
      series: number[][]
      seriesIndex: number
      w: {
        config?: {
          colors?: string[]
          xaxis?: {
            categories?: string[]
          }
        }
        globals: {
          labels: string[]
          seriesNames: string[]
        }
      }
    }) => string
    enabled: boolean
    intersect: boolean
    onDatasetHover: {
      highlightDataSeries: boolean
    }
    shared: boolean
  }

  expect(tooltip.enabled).toBe(true)
  expect(tooltip.intersect).toBe(true)
  expect(tooltip.shared).toBe(false)
  expect(tooltip.arrow).toBe(false)
  expect(tooltip.cssClass).toBe('projectOverview__apexTooltip')
  expect(tooltip.onDatasetHover.highlightDataSeries).toBe(false)
  expect((options.states as { hover: { filter: { type: string } } }).hover.filter.type).toBe('none')
  expect((options.states as { active: { filter: { type: string } } }).active.filter.type).toBe('none')
  const html = tooltip.custom({
    dataPointIndex: 0,
    series: [[2, 0], [0, 3]],
    seriesIndex: 0,
    w: {
      config: {
        colors: ['#112233', '#445566'],
        xaxis: {
          categories: ['Artifacts', 'Beasts']
        }
      },
      globals: {
        labels: [],
        seriesNames: ['Alpha', 'Beta']
      }
    }
  })
  expect(html).toContain('Alpha, Artifacts')
  expect(html).toContain('class="projectOverview__graphTooltipSeparator">-</span>')
  expect(html).toContain('class="projectOverview__graphTooltipCountValue">2</span>')
  expect(html).toContain('class="projectOverview__graphTooltipDocumentsSuffix">documents</span>')
  expect(html).toContain('background-color: #112233')
})

/**
 * buildProjectOverviewApexChartOptions
 * Empty series still produces Apex option shells with empty colors.
 */
test('Test that buildProjectOverviewApexChartOptions handles empty series', () => {
  const options = buildProjectOverviewApexChartOptions({
    chartModel: {
      categories: [],
      series: [],
      totalDocumentCount: 0
    },
    columnWidth: resolveProjectOverviewApexColumnWidth(0),
    tooltipCustom
  })
  expect(options.colors).toEqual([])
  expect((options.chart as { type: string }).type).toBe('bar')
})
