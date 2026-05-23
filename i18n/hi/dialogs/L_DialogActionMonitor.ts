export default {
  title: 'एक्शन मॉनिटर',
  closeButton: 'बंद करना',
  emptyState: 'इस सत्र के दौरान अभी तक कोई कार्रवाई दर्ज नहीं की गई है.',
  columns: {
    action: 'कार्रवाई',
    startTime: 'समय शुरू',
    finishTime: 'ख़त्म होने का समय',
    payload: 'पेलोड',
    type: 'प्रकार',
    status: 'स्थिति',
  },
  actionKind: {
    async: 'Async',
    sync: 'साथ-साथ करना',
  },
  status: {
    queued: 'कतारबद्ध',
    running: 'दौड़ना',
    success: 'सफलता',
    failed: 'असफल',
  },
  rowClickHint: 'विवरण को क्लिपबोर्ड पर कॉपी करने के लिए क्रिया पंक्ति पर बायाँ-क्लिक करें।',
  payloadPresentAria: 'इस क्रिया में एक पेलोड है.',
  payloadEmptyAria: 'इस कार्रवाई के लिए कोई पेलोड नहीं.',
  copy: {
    success: 'क्रिया पंक्ति को क्लिपबोर्ड पर कॉपी किया गया',
    successCaption: 'गतिविधि कॉपी की गई - {actionId}',
    failed: 'क्रिया पंक्ति को क्लिपबोर्ड पर कॉपी नहीं किया जा सका.',
  }
}
