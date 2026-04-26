import type { I_foundationCustomSwatch } from 'app/types/I_foundationCatalogues'

/**
 * Mirrors the QUASAR COLORS - GENERAL block in src/css/app.palette.scss.
 * Keep hex values in sync when editing that block; $info uses the resolved color.adjust output.
 */
export const FOUNDATION_CUSTOM_SWATCHES: I_foundationCustomSwatch[] = [
  {
    sassVar: '$accent',
    hex: '#f5f5f5'
  },
  {
    sassVar: '$dark',
    hex: '#1b333e'
  },
  {
    sassVar: '$dark-lighter',
    hex: '#234655'
  },
  {
    sassVar: '$dark-page',
    hex: '#303742'
  },
  {
    sassVar: '$grey',
    hex: '#d4d0c9'
  },
  {
    hex: '#f7eed9',
    note: 'SCSS: color.adjust(#d7ac47, $lightness: 35%)',
    sassVar: '$info'
  },
  {
    sassVar: '$negative',
    hex: '#c10015'
  },
  {
    sassVar: '$positive',
    hex: '#35a14e'
  },
  {
    sassVar: '$primary',
    hex: '#d7ac47'
  },
  {
    sassVar: '$primary-bright',
    hex: '#ffd673'
  },
  {
    sassVar: '$secondary',
    hex: '#f75746'
  },
  {
    sassVar: '$warning',
    hex: '#f2c037'
  },
  {
    sassVar: '$white',
    hex: '#ffffff'
  }
]
