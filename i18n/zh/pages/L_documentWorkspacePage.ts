export default {
  backgroundColorFieldDescription:
    'This field allows for custom-coloring your document to any available HEX or RGB color. The selected color will show as a background both in the hierarchical tree on the left and in the top tabs.',
  backgroundColorFieldLabel: '文档背景颜色',
  belongsUnderFieldDescription:
    'This field is used to build up custom hierarchical tree structure in the main list of items in the left side of the app. You can use this for an infinite amount of sub-levels to the hierarchical structure. An example would be multiple sub-groups (provinces) of Roman Empire belonging under the main political group called "Roman Empire".',
  belongsUnderFieldLabel: 'Belongs under',
  belongsUnderOneWayRelationshipTooltip:
    'This is a one-way relationship. Editing this value WILL NOT have any effect on the connected document/s. Left-clicking the linked document in non-edit mode will open it in new tab and focuses on it. Middle-clicking the linked document in non-edit mode will open it in new tab and not focus on it.',
  orderNumberFieldDescription:
    'Optional display-only order number shown as a badge to the left of this document in the hierarchy tree. Pad numbers with leading zeros when you want consistent badge width (for example 01, 02, 10). This does not change how siblings are sorted in the tree.',
  orderNumberFieldLabel: 'Order number',
  isCategoryDescription: '此设置可为当前文档启用类别模式。处于类别模式的文档会隐藏大部分字段，并且不会出现在除“隶属于”以外的其他关系搜索中。',
  isCategoryTitle: '是类别',
  isDeadDescription:
    'This setting allows for setting the current document to dead/gone/destroyed mode. A document with dead/gone/destroyed mode toggled on will have a crossed-over text modifier applied to it — showing that it is no longer a part of the current timeline.',
  isDeadTitle: 'Is Dead/Gone/Destroyed',
  isFinishedDescription:
    'This setting allows for setting the current document to finished document mode. A document with finished document mode toggled on will not show any un-filled fields in view mode and will function as if "Hide empty fields" was turned on in the settings.',
  isFinishedTitle: 'Is finished',
  isMinorDescription:
    'This setting allows for setting the current document to minor document mode. A document with minor document mode toggled on will not show in any other relationship searches. The idea behind this setting is to allow for creation of documents that will not clutter the search, but could be theoretically relevant in some very specific cases to the story (eg: distant relatives of a character).',
  isMinorTitle: 'Is a minor document',
  nameFieldLabel: 'Document name',
  textColorFieldDescription:
    'This field allows for custom-coloring your document to any available HEX or RGB color. The selected color will show on the icon and name of the document both in the hierarchical tree on the left and in the top tabs.',
  textColorFieldLabel: '文档文字颜色'
}
