export type T_foundationTypographyHeadingTag =
  | 'div'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'

export interface I_foundationTypographyHeading {
  className: string
  label: string
  sample: string
  tag: T_foundationTypographyHeadingTag
}

export interface I_foundationTypographyWeight {
  className: string
  label: string
}

export interface I_foundationTypographyHelper {
  className: string
  demoPhrase: string
  description: string
}
