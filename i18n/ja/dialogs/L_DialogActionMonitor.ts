export default {
  title: 'アクションモニター',
  closeButton: '近い',
  emptyState: 'このセッション中にアクションはまだ記録されていません。',
  columns: {
    action: 'アクション',
    startTime: '開始時間',
    finishTime: '終了時間',
    payload: 'ペイロード',
    type: 'タイプ',
    status: '状態',
  },
  actionKind: {
    async: '非同期',
    sync: '同期',
  },
  status: {
    queued: 'キューに入れられました',
    running: 'ランニング',
    success: '成功',
    failed: '失敗した',
  },
  rowClickHint: 'アクション行を左クリックして詳細をクリップボードにコピーします。',
  payloadPresentAria: 'このアクションにはペイロードがあります。',
  payloadEmptyAria: 'このアクションにはペイロードがありません。',
  copy: {
    success: 'アクション行がクリップボードにコピーされました',
    successCaption: 'アクティビティがコピーされました - {actionId}',
    failed: 'アクション行をクリップボードにコピーできませんでした。',
  }
}
