export default {
  title: 'परियोजना सेटिंग्स',
  closeButton: 'बिना सहेजे बंद करें',
  saveButton: 'सेटिंग्स सहेजें',
  saveWithoutClosingButton: 'बिना बंद किए सहेजें',
  saveErrors: {
    tooltipIntro: 'सहेजा नहीं जा सका। निम्नलिखित त्रुटियाँ मिलीं:',
    bulletWorldNameRequired: '"{worldLabel}" के लिए विश्व का नाम आवश्यक है।',
    bulletDuplicatePalette: '"{worldLabel}" की पैलेट में डुप्लिकेट रंग मिले।',
    bulletDocumentTemplateNameRequired: '"{templateLabel}" के लिए दस्तावेज़ टेम्प्लेट का नाम आवश्यक है।',
    bulletWorldTemplateGroupNameRequired: '"{worldLabel}" के लिए टेम्प्लेट समूह का नाम आवश्यक है।',
    bulletWorldTemplateDuplicateDocumentTemplate: '"{worldLabel}" में डुप्लिकेट दस्तावेज़ टेम्प्लेट "{templateLabel}".'
  },
  singularPluralMissing: {
    bothIntro: 'वर्तमान भाषा के लिए अनुवाद अनुपलब्ध हैं:',
    singularBullet: 'एकवचन रूप अनुपलब्ध है',
    pluralBullet: 'बहुवचन रूप अनुपलब्ध है',
    usingFallback: 'फ़ॉलबैक उपयोग किया गया: {fallbackLanguageName}'
  },
  categories: {
    generalSettings: {
      title: 'सामान्य सेटिंग्स'
    },
    worldsSettings: {
      title: 'विश्व'
    },
    documentTemplatesSettings: {
      title: 'दस्तावेज़ टेम्प्लेट'
    }
  },
  fields: {
    projectName: {
      title: 'परियोजना का नाम',
      label: 'परियोजना का नाम',
      errorRequired: 'परियोजना का नाम आवश्यक है।'
    },
    worldName: {
      title: 'विश्व का नाम',
      label: 'विश्व का नाम',
      errorRequired: 'विश्व का नाम आवश्यक है।'
    },
    worldColor: {
      title: 'रंग',
      label: 'विश्व का रंग',
      tooltip: 'यह रंग निर्धारित करता है कि आपका विश्व परियोजना के विभिन्न स्थानों—आइकन, पाठ और समान UI—में कैसा दिखता है।',
      helpAriaLabel: 'विश्व रंग के लिए सहायता'
    },
    worldColorPalette: {
      label: 'विश्व रंग पैलेट',
      tooltipIntro: 'रंग पैलेट आपको पहले से रंग परिभाषित करने देती है जिन्हें बाद में पूरे प्रोजेक्ट में बार-बार मैन्युअल चयन किए बिना उपयोग किया जाएगा। जरूरत पड़ने पर यह दस्तावेज़ों के बीच स्थिरता सुनिश्चित करता है।',
      tooltipRightClickIntro: 'व्यक्तिगत रंगों पर राइट-क्लिक करने पर अतिरिक्त क्रियाएँ उपलब्ध हैं:',
      tooltipRightClickDeletion: 'हटाना',
      tooltipRightClickDuplication: 'प्रतिलिपि',
      addButton: 'रंग जोड़ें',
      helpAriaLabel: 'विश्व रंग पैलेट के लिए सहायता',
      swatchAriaLabel: 'रंग स्वैच {hex} संपादित करें',
      contextMenu: {
        duplicateColor: 'रंग की प्रतिलिपि बनाएँ',
        deleteColor: 'रंग हटाएँ'
      }
    },
    worldTemplateLayout: {
      layoutTitle: 'विश्व की पदानुक्रमित वृक्ष',
      availableTemplatesTitle: 'उपलब्ध दस्तावेज़ टेम्प्लेट',
      availableTemplatesFilterAriaLabel: 'उपलब्ध दस्तावेज़ टेम्प्लेट फ़िल्टर करें',
      availableTemplatesFilterClearAriaLabel: 'उपलब्ध दस्तावेज़ टेम्प्लेट फ़िल्टर साफ़ करें',
      availableTemplatesFilterPlaceholder: 'खोजें...',
      emptyFilteredAvailableTemplates: 'आपकी खोज से कोई दस्तावेज़ टेम्प्लेट मेल नहीं खाता।',
      addGroupButton: 'समूह जोड़ें',
      defaultNewGroupName: 'नया समूह',
      editGroupTooltip: 'समूह का नाम बदलें',
      editTemplateTooltip: 'टेम्प्लेट का उपनाम समायोजित करें',
      emptyAvailableTemplates: 'सभी दस्तावेज़ टेम्प्लेट इस विश्व को सौंपे गए हैं।',
      groupNameErrorRequired: 'समूह का नाम आवश्यक है।',
      groupRenameInputLabel: 'समूह का नाम',
      placementNicknameHoverOriginalNameLabel: 'मूल नाम',
      placementNicknameHoverNicknameLabel: 'उपनाम',
      removeGroupTooltip: 'समूह हटाएँ',
      removeTemplateTooltip: 'दस्तावेज़ टेम्प्लेट हटाएँ',
      templateCanonicalNameLabel: 'दस्तावेज़ टेम्प्लेट का नाम',
      templateCanonicalNameTooltip: 'पूरे दस्तावेज़ टेम्प्लेट का सही ढंग से नाम बदलने के लिए, कृपया इस संपादन संवाद के "दस्तावेज़ टेम्प्लेट" अनुभाग में जाएँ और वहाँ समायोजित करें।',
      templateNicknameLabel: 'इस विश्व के भीतर उपनाम',
      templateNicknameTooltip: 'उपनाम सेट करने से आप किसी विशेष विश्व के भीतर दस्तावेज़ टेम्प्लेट का त्वरित नाम बदल सकते हैं बिना पूरे प्रोजेक्ट में उसके वास्तविक नाम को बदले।',
      missingGroupDisplayNameTreeTooltip:
        'वर्तमान में चयनित भाषा के कुछ अनुवाद इस समूह नाम में अनुपस्थित हैं।',
      missingPlacementNicknameTreeTooltip:
        'वर्तमान में चयनित भाषा के कुछ अनुवाद इस प्लेसमेंट उपनाम में अनुपस्थित हैं।',
      missingDocumentTemplateTitleTreeTooltip:
        'वर्तमान में चयनित भाषा के कुछ अनुवाद इस दस्तावेज़ टेम्प्लेट शीर्षक में अनुपस्थित हैं।',
      contextMenu: {
        renameGroup: 'समूह का नाम बदलें',
        deleteGroup: 'समूह हटाएँ'
      },
      renameDialog: {
        title: 'समूह का नाम बदलें',
        confirmButton: 'नाम बदलें'
      }
    },
    documentTemplateName: {
      title: 'दस्तावेज़ टेम्प्लेट का नाम',
      label: 'दस्तावेज़ टेम्प्लेट का नाम',
      errorRequired: 'कम से कम एक दस्तावेज़ टेम्प्लेट शीर्षक अनुवाद आवश्यक है।'
    },
    documentTemplateWorldAppendix: {
      title: 'विश्व परिशिष्ट',
      label: 'विश्व परिशिष्ट',
      tooltip: 'विश्व परिशिष्ट आपके दस्तावेज़ टेम्प्लेट का एक संक्षिप्त, अद्वितीय विवरण है जब इसे व्यक्तिगत विश्वों के साथ जोड़ा जाता है। यह भ्रम रोकता है जब कई दस्तावेज़ टेम्प्लेट विभिन्न विश्वों में एक ही नाम साझा करते हैं। परिशिष्ट आपको उन्हें तुरंत अलग करने में मदद करता है। यह फ़ील्ड केवल विश्व टैब पर दिखाई देता है जब टेम्प्लेट को विश्वों से जोड़ा जाता है, कहीं और नहीं।',
      helpAriaLabel: 'विश्व परिशिष्ट के लिए सहायता'
    },
    documentTemplateIcon: {
      title: 'आइकन',
      label: 'आइकन'
    }
  },
  panels: {
    worlds: {
      title: 'परियोजना के विश्व',
      addWorldButton: 'विश्व जोड़ें',
      defaultNewWorldName: 'नया विश्व',
      deleteWorldButton: 'विश्व हटाएँ',
      emptyFilteredWorlds: 'आपकी खोज से कोई विश्व मेल नहीं खाता।',
      filterAriaLabel: 'विश्व फ़िल्टर करें',
      filterClearAriaLabel: 'विश्व फ़िल्टर साफ़ करें',
      filterPlaceholder: 'खोजें...',
      missingTranslationsTabTooltip: 'वर्तमान में चयनित भाषा के कुछ अनुवाद इस विश्व में अनुपलब्ध हैं।',
      deleteConfirm: {
        confirmDeleteButton: 'हटाने की पुष्टि करें',
        message: 'क्या आप वाकई इस विश्व को हटाना चाहते हैं? इससे जुड़े दस्तावेज़ और सेटिंग्स बाद में पुनर्प्राप्त नहीं की जा सकतीं। वे हमेशा के लिए खो जाएँगे।'
      },
      removeDisabledHasDocuments: 'हटाने से पहले इस विश्व से दस्तावेज़ हटाएँ।',
      removeDisabledLastWorld: 'किसी परियोजना में हमेशा कम से कम एक विश्व होना चाहिए। इसे हटाने के लिए पहले दूसरा विश्व बनाएँ।'
    },
    documentTemplates: {
      title: 'दस्तावेज़ टेम्प्लेट',
      addFirstTemplateButton: 'अपना पहला टेम्प्लेट जोड़ें',
      addTemplateButton: 'दस्तावेज़ टेम्प्लेट जोड़ें',
      defaultNewTemplateName: 'नया दस्तावेज़ टेम्प्लेट',
      deleteTemplateButton: 'टेम्प्लेट हटाएँ',
      emptyFilteredTemplates: 'आपकी खोज से कोई दस्तावेज़ टेम्प्लेट मेल नहीं खाता।',
      filterAriaLabel: 'दस्तावेज़ टेम्प्लेट फ़िल्टर करें',
      filterClearAriaLabel: 'दस्तावेज़ टेम्प्लेट फ़िल्टर साफ़ करें',
      filterPlaceholder: 'खोजें...',
      missingTranslationsTabTooltip: 'वर्तमान में चयनित भाषा के कुछ अनुवाद इस दस्तावेज़ टेम्प्लेट में अनुपलब्ध हैं।',
      deleteConfirm: {
        confirmDeleteButton: 'हटाने की पुष्टि करें',
        message: 'क्या आप वाकई इस दस्तावेज़ टेम्प्लेट को हटाना चाहते हैं? किसी अन्य टेम्प्लेट में इस टेम्प्लेट से जुड़े सभी फ़ील्ड काम करना बंद कर देंगे। साथ ही, सभी जुड़े दस्तावेज़ अपना डेटा दिखाना बंद कर देंगे यदि कोई इस टेम्प्लेट का उपयोग करके भरा गया था। इस हटाने के अनपेक्षित दुष्प्रभाव हो सकते हैं।'
      },
      removeDisabledHasDocuments: 'हटाने से पहले इस टेम्प्लेट का उपयोग करने वाले दस्तावेज़ हटाएँ।'
    }
  }
}
