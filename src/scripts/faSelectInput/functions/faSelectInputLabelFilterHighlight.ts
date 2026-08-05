import type { T_faSelectInputLabelHighlightSegment } from 'app/types/I_faSelectInput'

/**
 * Split a label into plain / match segments for filter highlighting.
 * Highlights each whole whitespace-delimited word that contains any needle
 * word (case-insensitive). Empty needle returns one plain segment.
 */
export function splitFaSelectInputLabelForFilterHighlight (
  label: string,
  needle: string
): T_faSelectInputLabelHighlightSegment[] {
  const trimmedNeedle = needle.trim()
  if (trimmedNeedle.length === 0 || label.length === 0) {
    return [{
      isMatch: false,
      text: label
    }]
  }

  const needleWords = trimmedNeedle
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => {
      return word.length > 0
    })
  const parts = label.split(/(\s+)/)
  const segments: T_faSelectInputLabelHighlightSegment[] = []

  for (const part of parts) {
    if (part.length === 0) {
      continue
    }
    if (/^\s+$/.test(part)) {
      segments.push({
        isMatch: false,
        text: part
      })
      continue
    }
    const lowerPart = part.toLowerCase()
    const isMatch = needleWords.some((needleWord) => {
      return lowerPart.includes(needleWord)
    })
    segments.push({
      isMatch,
      text: part
    })
  }

  return segments
}
