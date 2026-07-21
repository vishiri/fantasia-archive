export default {
  backgroundColorFieldDescription:
    'This field allows for custom-coloring your document to any available HEX or RGB color. The selected color will show as a background both in the hierarchical tree on the left and in the top tabs.',
  backgroundColorFieldLabel: 'Document background color',
  belongsUnderFieldDescription:
    'This field is used to build up custom hierarchical tree structure in the main list of items in the left side of the app. You can use this for an infinite amount of sub-levels to the hierarchical structure. An example would be multiple sub-groups (provinces) of Roman Empire belonging under the main political group called "Roman Empire".',
  belongsUnderFieldLabel: 'Belongs under',
  belongsUnderOneWayRelationshipTooltip:
    'This is a one-way relationship. Editing this value WILL NOT have any effect on the connected document/s. Left-clicking the linked document in non-edit mode will open it in new tab and focuses on it. Middle-clicking the linked document in non-edit mode will open it in new tab and not focus on it.',
  orderNumberFieldDescription:
    'Optional display-only custom order number shown as a badge to the left of this document in the hierarchy tree. This feature can be used to manually sort documents via the order numbers or for a visual guideline for the user (for example years in a calendar).',
  orderNumberFieldLabel: 'Custom order',
  extraHtmlClassesFieldDescription:
    'This field exists for advanced usage by power-users who wish to style their document with globally defined CSS classes. Settings are found inside Project → Custom Project CSS.',
  extraHtmlClassesFieldLabel: 'Extra HTML classes',
  isCategoryDescription:
    'This setting allows for setting the current document to category mode. A document with category mode toggled on will have most of its fields hidden and will not show in any other relationship searches except for "Belongs under".',
  isCategoryTitle: 'Is a category',
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
  textColorFieldLabel: 'Document text color'
}
