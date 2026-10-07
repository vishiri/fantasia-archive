import type {
  I_faProjectMediaMassEditRow,
  I_faProjectMediaUpsertItem
} from 'app/types/I_faProjectMediaDomain'

export function mapFaProjectMediaMassEditRowToUpsertItem (
  row: I_faProjectMediaMassEditRow,
  untitledDisplayName: string
): I_faProjectMediaUpsertItem {
  const trimmed = row.displayName.trim()
  const displayName = trimmed.length > 0 ? trimmed : untitledDisplayName
  const {
    externalEmbed,
    externalLink,
    externalType,
    id,
    internalLink,
    internalType,
    type
  } = row
  return {
    displayName,
    externalEmbed,
    externalLink,
    externalType,
    id,
    internalLink,
    internalType,
    type
  }
}

export function mapFaProjectMediaMassEditRowsToUpsertItems (
  rows: I_faProjectMediaMassEditRow[],
  untitledDisplayName: string
): I_faProjectMediaUpsertItem[] {
  return rows.map((row) => {
    return mapFaProjectMediaMassEditRowToUpsertItem(row, untitledDisplayName)
  })
}
