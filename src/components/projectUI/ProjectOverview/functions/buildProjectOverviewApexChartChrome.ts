import type { T_faProjectOverviewApexTooltipCustom } from 'app/types/I_faProjectOverviewChart'

function buildProjectOverviewApexChartShell (chartHeightPx: number): Record<string, unknown> {
  const animations = {
    enabled: false
  }
  const toolbar = {
    show: false
  }
  const zoom = {
    enabled: false
  }
  return {
    animations,
    background: 'transparent',
    fontFamily: 'inherit',
    height: chartHeightPx,
    stacked: true,
    toolbar,
    type: 'bar',
    zoom
  }
}

function buildProjectOverviewApexGrid (topReservedPx: number): Record<string, unknown> {
  const padding = {
    bottom: 0,
    left: 0,
    right: 0,
    top: topReservedPx
  }
  const show = false
  return {
    padding,
    show
  }
}

function buildProjectOverviewApexStates (): Record<string, unknown> {
  const activeFilter = {
    type: 'none'
  }
  const hoverFilter = {
    // Apex only offers lighten/darken (white/black). Primary fill is CSS :hover.
    type: 'none'
  }
  const active = {
    filter: activeFilter
  }
  const hover = {
    filter: hoverFilter
  }
  return {
    active,
    hover
  }
}

function buildProjectOverviewApexTooltip (
  tooltipCustom: T_faProjectOverviewApexTooltipCustom
): Record<string, unknown> {
  const onDatasetHover = {
    highlightDataSeries: false
  }
  return {
    arrow: false,
    cssClass: 'projectOverview__apexTooltip',
    custom: tooltipCustom,
    enabled: true,
    intersect: true,
    onDatasetHover,
    shared: false,
    theme: 'light'
  }
}

/**
 * Shared Apex option chrome (chart type, grid, states, tooltip shell).
 */
export function buildProjectOverviewApexChartChrome (input: {
  chartHeightPx: number
  colors: string[]
  plotOptions: Record<string, unknown>
  tooltipCustom: T_faProjectOverviewApexTooltipCustom
  topReservedPx: number
  xaxis: Record<string, unknown>
  yaxis: Record<string, unknown>
}): Record<string, unknown> {
  const chart = buildProjectOverviewApexChartShell(input.chartHeightPx)
  const colors = input.colors
  const dataLabels = {
    enabled: false
  }
  const grid = buildProjectOverviewApexGrid(input.topReservedPx)
  const legend = {
    show: false
  }
  const plotOptions = input.plotOptions
  const states = buildProjectOverviewApexStates()
  const stroke = {
    show: false,
    width: 0
  }
  const tooltip = buildProjectOverviewApexTooltip(input.tooltipCustom)
  const xaxis = input.xaxis
  const yaxis = input.yaxis
  return {
    chart,
    colors,
    dataLabels,
    grid,
    legend,
    plotOptions,
    states,
    stroke,
    tooltip,
    xaxis,
    yaxis
  }
}
