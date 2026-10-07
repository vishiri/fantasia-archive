/**
 * FA 1.0-style diagonal category labels for the overview stacked bar chart.
 */
export function buildProjectOverviewApexXaxis (input: {
  categories: string[]
  labelsMaxHeightPx: number
}): Record<string, unknown> {
  const categories = input.categories
  const axisBorder = {
    show: true
  }
  const axisTicks = {
    show: false
  }
  const gradient = {
    colorFrom: 'transparent',
    colorTo: 'transparent',
    opacityFrom: 0,
    opacityTo: 0,
    stops: [0, 100]
  }
  const fill = {
    gradient,
    type: 'gradient'
  }
  const crosshairs = {
    fill,
    show: false
  }
  const labelStyle = {
    colors: '#dcdcdc',
    cssClass: 'projectOverview__graphCategoryLabel',
    fontFamily: 'Roboto, -apple-system, Helvetica Neue, Helvetica, Arial, sans-serif;',
    fontSize: '15px',
    fontWeight: 500
  }
  const labels = {
    hideOverlappingLabels: false,
    maxHeight: input.labelsMaxHeightPx,
    rotate: -45,
    rotateAlways: true,
    style: labelStyle
  }
  const position = 'bottom'
  const tooltip = {
    enabled: false
  }
  return {
    axisBorder,
    axisTicks,
    categories,
    crosshairs,
    labels,
    position,
    tooltip
  }
}

/**
 * Hidden y-axis shell for the overview stacked bar chart.
 */
export function buildProjectOverviewApexYaxis (): Record<string, unknown> {
  const axisBorder = {
    show: false
  }
  const axisTicks = {
    show: false
  }
  const labelStyle = {
    colors: '#dcdcdc',
    fontFamily: 'Roboto, -apple-system, Helvetica Neue, Helvetica, Arial, sans-serif;',
    fontSize: '14px',
    fontWeight: 600
  }
  const labels = {
    style: labelStyle
  }
  const show = false
  const tooltip = {
    enabled: false
  }
  return {
    axisBorder,
    axisTicks,
    labels,
    show,
    tooltip
  }
}
