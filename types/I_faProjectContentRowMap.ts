/** SQLite column layout for the worlds table (v5+ color, v6+ sort_order, v4+ color_pallete). */
export interface I_faSqlWorldRow {
  id: string
  display_name: string
  color: string
  color_pallete: string
  sort_order: number
  created_at_ms: number
  updated_at_ms: number
}

/** SQLite column layout for media and document_templates tables. */
export interface I_faSqlNamedEntityRow {
  id: string
  display_name: string
  created_at_ms: number
  updated_at_ms: number
}

/** SQLite column layout for the document_templates table (v5+). */
export interface I_faSqlDocumentTemplateRow {
  id: string
  display_name: string
  sort_order: number
  world_appendix: string
  icon: string
  created_at_ms: number
  updated_at_ms: number
}

/** SQLite column layout for the project documents table. */
export interface I_faSqlProjectDocumentRow {
  id: string
  world_id: string
  template_id: string | null
  display_name: string
  created_at_ms: number
  updated_at_ms: number
}

/** SQLite column layout for world_template_groups. */
export interface I_faSqlWorldTemplateGroupRow {
  id: string
  world_id: string
  display_name: string
  root_sort_order: number
  created_at_ms: number
  updated_at_ms: number
}

/** SQLite join row for world_template_placements + document_templates. */
export interface I_faSqlWorldTemplatePlacementJoinRow {
  id: string
  world_id: string
  document_template_id: string
  group_id: string | null
  root_sort_order: number | null
  group_sort_order: number | null
  created_at_ms: number
  updated_at_ms: number
  display_name: string
  world_appendix: string
  icon: string
}
