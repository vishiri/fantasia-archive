export default {
  title: '行动监视器',
  closeButton: '关闭',
  emptyState: '在此会话期间尚未记录任何操作。',
  columns: {
    action: '行动',
    startTime: '开始时间',
    finishTime: '完成时间',
    payload: '有效载荷',
    type: '类型',
    status: '地位',
  },
  actionKind: {
    async: '异步',
    sync: '同步',
  },
  status: {
    queued: '排队',
    running: '跑步',
    success: '成功',
    failed: '失败的',
  },
  rowClickHint: '左键单击操作行可将详细信息复制到剪贴板。',
  payloadPresentAria: '此操作有一个有效负载。',
  payloadEmptyAria: '此操作没有有效负载。',
  copy: {
    success: '操作行已复制到剪贴板',
    successCaption: '已复制活动 - {actionId}',
    failed: '无法将操作行复制到剪贴板。',
  }
}
