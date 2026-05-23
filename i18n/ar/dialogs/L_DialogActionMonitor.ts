export default {
  title: 'مراقب العمل',
  closeButton: 'يغلق',
  emptyState: 'لم يتم تسجيل أي إجراءات حتى الآن خلال هذه الجلسة.',
  columns: {
    action: 'فعل',
    startTime: 'وقت البدء',
    finishTime: 'وقت الانتهاء',
    payload: 'الحمولة',
    type: 'يكتب',
    status: 'حالة',
  },
  actionKind: {
    async: 'غير متزامن',
    sync: 'مزامنة',
  },
  status: {
    queued: 'في قائمة الانتظار',
    running: 'جري',
    success: 'نجاح',
    failed: 'فشل',
  },
  rowClickHint: 'انقر بزر الماوس الأيسر على صف الإجراء لنسخ التفاصيل إلى الحافظة.',
  payloadPresentAria: 'هذا الإجراء لديه حمولة.',
  payloadEmptyAria: 'لا توجد حمولة لهذا الإجراء.',
  copy: {
    success: 'تم نسخ صف الإجراء إلى الحافظة',
    successCaption: 'تم نسخ النشاط - {actionId}',
    failed: 'تعذر نسخ صف الإجراء إلى الحافظة.',
  }
}
