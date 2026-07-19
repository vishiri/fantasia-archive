/** SQLite column layout for the worlds table (v5+ color, v6+ sort_order, v4+ color_pallete, v9+ display_name_translations_json). */
export interface I_faSqlWorldRow {
  id: string
  display_name: string
  display_name_translations_json: string
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

/** SQLite column layout for the document_templates table (v5+, v8+ title_translations_json plural, v11+ title_singular_translations_json, v9+ world_appendix_translations_json). */
export interface I_faSqlDocumentTemplateRow {
  id: string
  display_name: string
  title_translations_json: string
  title_singular_translations_json: string
  sort_order: number
  world_appendix: string
  world_appendix_translations_json: string
  icon: string
  created_at_ms: number
  updated_at_ms: number
}

/** SQLite column layout for the project documents table. */
export interface I_faSqlProjectDocumentRow {
  id: string
  world_id: string
  template_id: string | null
  tree_placement_id: string | null
  tree_parent_document_id: string | null
  tree_custom_sort_order: number
  display_name: string
  document_text_color: string | null
  document_background_color: string | null
  is_category: number
  is_finished: number
  is_minor: number
  is_dead: number
  created_at_ms: number
  updated_at_ms: number
}

/** SQLite column layout for world_template_groups (v10+ display_name_translations_json). */
export interface I_faSqlWorldTemplateGroupRow {
  id: string
  world_id: string
  display_name: string
  display_name_translations_json: string
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
  nickname: string
  nickname_translations_json: string
  nickname_singular_translations_json: string
  created_at_ms: number
  updated_at_ms: number
  display_name: string
  world_appendix: string
  icon: string
  title_translations_json: string
  title_singular_translations_json: string
}
