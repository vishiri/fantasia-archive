export function shouldScrollContainerAfterItemCountIncrease (
  nextCount: number,
  previousCount: number | undefined
): boolean {
  return previousCount !== undefined && nextCount > previousCount
}
