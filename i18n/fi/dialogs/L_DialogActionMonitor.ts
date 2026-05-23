export default {
  title: 'Action Monitor',
  closeButton: 'Lähellä',
  emptyState: 'Toimintoja ei ole vielä tallennettu tämän istunnon aikana.',
  columns: {
    action: 'Toiminta',
    startTime: 'Aloitusaika',
    finishTime: 'Loppuaika',
    payload: 'Hyötykuorma',
    type: 'Tyyppi',
    status: 'Status',
  },
  actionKind: {
    async: 'Asynk',
    sync: 'Synkronoi',
  },
  status: {
    queued: 'Jonossa',
    running: 'Juoksemassa',
    success: 'Menestys',
    failed: 'Epäonnistui',
  },
  rowClickHint: 'Napsauta toimintoriviä hiiren vasemmalla painikkeella kopioidaksesi tiedot leikepöydälle.',
  payloadPresentAria: 'Tällä toiminnolla on hyötykuorma.',
  payloadEmptyAria: 'Ei hyötykuormaa tälle toiminnolle.',
  copy: {
    success: 'Toimintarivi kopioitiin leikepöydälle',
    successCaption: 'Toiminto kopioitu - {actionId}',
    failed: 'Toimintoriviä ei voitu kopioida leikepöydälle.',
  }
}
