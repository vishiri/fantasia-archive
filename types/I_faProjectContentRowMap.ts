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
