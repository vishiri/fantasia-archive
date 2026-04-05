export interface I_storybookEntry {
  id: string
  title: string
  name: string
  type: string
  tags?: string[]
}

export interface I_storybookIndex {
  entries: Record<string, I_storybookEntry>
}
