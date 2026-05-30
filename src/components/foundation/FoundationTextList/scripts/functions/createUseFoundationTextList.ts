import type {
  I_foundationTypographyHeading,
  I_foundationTypographyHelper,
  I_foundationTypographyWeight
} from 'app/types/I_foundationCatalogues'

export function createUseFoundationTextList (deps: {
  headingRows: I_foundationTypographyHeading[]
  helperRows: I_foundationTypographyHelper[]
  weightRows: I_foundationTypographyWeight[]
}): () => {
    headingRows: I_foundationTypographyHeading[]
    helperRows: I_foundationTypographyHelper[]
    weightRows: I_foundationTypographyWeight[]
  } {
  return function useFoundationTextList () {
    const headingRows = deps.headingRows
    const weightRows = deps.weightRows
    const helperRows = deps.helperRows

    return {
      headingRows,
      helperRows,
      weightRows
    }
  }
}
