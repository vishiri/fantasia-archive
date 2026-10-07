/**
 * Stacked column plot options: rounded tops only + category totals above bars.
 */
export function buildProjectOverviewApexBarPlotOptions (input: {
  columnWidth: string
  totals: number[]
}): Record<string, unknown> {
  const totals = input.totals
  const formatProjectOverviewBarTotal = (
    _value: unknown,
    opts: { dataPointIndex: number }
  ): string => {
    const total = totals[opts.dataPointIndex] ?? 0
    if (total > 0) {
      return String(total)
    }
    return ''
  }

  const dropShadow = {
    blur: 1,
    color: '#000',
    enabled: true,
    left: 1,
    opacity: 0.65,
    top: 1
  }
  const totalStyle = {
    color: '#DCDCDC',
    fontFamily: 'Roboto, -apple-system, Helvetica Neue, Helvetica, Arial, sans-serif;',
    fontSize: '14px',
    fontWeight: 600
  }
  const total = {
    dropShadow,
    enabled: true,
    formatter: formatProjectOverviewBarTotal,
    offsetY: -4,
    style: totalStyle
  }
  const dataLabels = {
    total
  }
  const columnWidth = input.columnWidth
  const bar = {
    borderRadius: 4,
    borderRadiusApplication: 'end',
    borderRadiusWhenStacked: 'last',
    columnWidth,
    dataLabels,
    horizontal: false
  }
  return {
    bar
  }
}
