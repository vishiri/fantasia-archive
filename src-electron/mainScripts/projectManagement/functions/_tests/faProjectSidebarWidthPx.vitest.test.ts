import { expect, test } from 'vitest'

import {
  FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX,
  FA_PROJECT_SIDEBAR_MIN_WIDTH_PX
} from 'app/types/I_faProjectSidebarDomain'
import {
  formatFaProjectSidebarWidthPxForKv,
  resolveFaProjectSidebarWidthPxFromKvText
} from '../faProjectSidebarWidthPx'

function parseTrimmedNumber (raw: string | undefined): number | undefined {
  if (raw === undefined) {
    return undefined
  }
  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    return undefined
  }
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) {
    return undefined
  }
  return parsed
}

test('resolveFaProjectSidebarWidthPxFromKvText returns default for missing kv', () => {
  expect(resolveFaProjectSidebarWidthPxFromKvText(undefined, parseTrimmedNumber)).toBe(
    FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX
  )
})

test('formatFaProjectSidebarWidthPxForKv ceils and enforces minimum', () => {
  expect(formatFaProjectSidebarWidthPxForKv(400.1)).toBe('401')
  expect(formatFaProjectSidebarWidthPxForKv(100)).toBe(String(FA_PROJECT_SIDEBAR_MIN_WIDTH_PX))
})
