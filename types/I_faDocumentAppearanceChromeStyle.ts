import type { CSSProperties } from 'vue'

/** Inline chrome style for document text/background colors on tabs and tree rows. */
export type I_faDocumentAppearanceChromeStyle = Pick<
  CSSProperties,
  'backgroundColor' | 'color'
>
