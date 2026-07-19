export type T_projectHierarchyTreePlacementCountSegmentKind = 'category' | 'document'

export interface I_projectHierarchyTreePlacementCountSegment {
  kind: T_projectHierarchyTreePlacementCountSegmentKind
  value: number
}

export interface I_projectHierarchyTreePlacementCountDisplay {
  segments: I_projectHierarchyTreePlacementCountSegment[]
  showDivider: boolean
  shows: boolean
}
