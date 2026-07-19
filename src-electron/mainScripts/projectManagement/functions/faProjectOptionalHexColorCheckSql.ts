/**
 * Optional #RRGGBB CHECK body (no CHECK keyword).
 * allowNull true for nullable document appearance columns; false for worlds.color.
 */
export function buildFaProjectOptionalHexColorCheckSql (
  columnName: string,
  allowNull: boolean
): string {
  const hexPart =
    `(length(${columnName}) = 7 AND substr(${columnName}, 1, 1) = '#')`
  if (allowNull) {
    return `(${columnName} IS NULL OR ${columnName} = '' OR ${hexPart})`
  }
  return `(${columnName} = '' OR ${hexPart})`
}
