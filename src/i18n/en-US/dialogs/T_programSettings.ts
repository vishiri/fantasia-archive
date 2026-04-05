export default {
  title: 'Fantasia Archive Settings',
  saveButton: 'Save settings',
  closeButton: 'Close without saving',
  appOptionsCategories: {
    developerSettings: {
      title: 'Developer settings',
      tags: 'developer, debug, diagnostics, internal',
      documentBody: {
        subtitle: 'Document body',
        tags: 'document id, debug metadata, internal fields'
      }
    },
    documentViewEdit: {
      title: 'Document view/edit',
      tags: 'document page, view mode, edit mode, reader',
      documentBody: {
        subtitle: 'Document body',
        tags: 'content area, fields, reading, editor area'
      },
      documentControlBar: {
        subtitle: 'Document control bar',
        tags: 'toolbar, top bar, header, document chrome'
      }
    },
    hierarchicalTree: {
      title: 'Hierarchical tree',
      tags: 'sidebar, outline, navigator, project tree',
      iconSettings: {
        subtitle: 'Icon settings',
        tags: 'action icons, tree buttons, row icons'
      },
      informationDisplaySettings: {
        subtitle: 'Information display settings',
        tags: 'counts, numbers, order index, metadata display'
      },
      tagSettings: {
        subtitle: 'Tag settings',
        tags: 'labels, tag display, tag grouping'
      },
      treeBehavior: {
        subtitle: 'Tree behavior',
        tags: 'expand, collapse, expand all, interaction'
      },
      treeSettings: {
        subtitle: 'Tree settings',
        tags: 'tree panel, sidebar visibility, tree layout'
      }
    },
    openedDocumentsTabs: {
      title: 'Opened documents tabs',
      tags: 'tab bar, open files, multitasking',
      tabBehavior: {
        subtitle: 'Tab behavior',
        tags: 'switch tabs, tab strip, hover behavior'
      }
    },
    popupsFloatingWindows: {
      title: 'Popups & Floating Windows',
      tags: 'dialogs, overlays, modals, windows',
      floatingWindows: {
        subtitle: 'Floating windows',
        tags: 'detach, secondary window, multi window'
      },
      quickSearchDialog: {
        subtitle: 'Quick-Search dialog',
        tags: 'quick search, keyboard search, finder'
      },
      universalDialogSettings: {
        subtitle: 'Universal dialog settings',
        tags: 'all dialogs, global popup behavior'
      }
    },
    visualAccessibility: {
      title: 'Visuals, App-wide functionality & Accessibility',
      tags: 'appearance, interface, global, ui, look and feel',
      accessibility: {
        subtitle: 'Accessibility',
        tags: 'a11y, readability, visibility, assistive'
      },
      applicationExtras: {
        subtitle: 'Application extras',
        tags: 'welcome screen, startup, tips, social, mascot'
      },
      visualsAppwideFunctionality: {
        subtitle: 'Visuals & App-wide functionality',
        tags: 'theme, chrome, layout, general options'
      }
    }
  },
  appOptions: {
    agressiveRelationshipFilter: {
      title: 'Aggressive relationships selection',
      description: 'Turns on the aggressive autosuggest mode for all relationship searches across the app in document edit mode. Without this turned on, after filtering, the first item in the list does not get automatically selected. Turning this on adds this functionality—allowing for much more convenient selection of existing documents while sacrificing a bit of convenience when creating new ones on the fly.',
      tags: 'autosuggest, autocomplete, first match, filter list, pick existing, relationship search'
    },
    allowQuickPopupSameKeyClose: {
      title: 'Close quick popups with same key',
      description: 'Allows closing the quick-search and quick-add popups with the same key combination that was used to open them.',
      tags: 'toggle shortcut, same hotkey, quick add, dismiss popup'
    },
    allowWiderScrollbars: {
      title: 'Accessibility - Wider scrollbars',
      description: 'This setting makes FA\'s scrollbars wider and therefore allows manual click-scrolling directly on them for devices that do not support standard scrolling (for example mice without a scroll wheel).',
      tags: 'scrollbar width, click scroll, mouse without wheel, trackball, touch'
    },
    compactDocumentCount: {
      title: 'Hide category count',
      description: 'Shows the document count without the secondary per-category number.',
      tags: 'simplified count, single number, less clutter'
    },
    compactTags: {
      title: 'Compact tags',
      description: 'Determines whether tags are shown as individual categories or as one category with each tag as a subcategory.',
      tags: 'tag grouping, single tag folder, nested tags, tag hierarchy'
    },
    darkMode: {
      title: 'Dark mode',
      description: 'Switch between light and dark mode for the app.',
      tags: 'dark, light, theme, theming, color, colors'
    },
    disableCloseAftertSelectQuickSearch: {
      title: 'Stop closing after selection',
      description: 'Normally the quick-search closes after an item is selected from it. Turning this feature on prevents that behavior, allowing you to open multiple search results one after the other.',
      tags: 'keep open, multiple results, batch open, quick search stays open'
    },
    disableDocumentControlBar: {
      title: 'Disable document control bar',
      description: 'If you want to maximize your working space on the document, you can disable the top button bar with this setting. The necessary control buttons will be moved to the top of the main document body, while the rest of the functionality will be accessible via keybinds or through the app menu on the top left.',
      tags: 'toolbar hide, maximize space, full width, document header'
    },
    disableDocumentControlBarGuides: {
      title: 'Disable document guides',
      description: 'Toggles the newbie-friendly guides on the document control bar on or off.',
      tags: 'beginner hints, tutorial banners, coach marks, control bar help'
    },
    disableDocumentCounts: {
      title: 'Hide document count entirely',
      description: 'Hides all document count information in the hierarchical tree.',
      tags: 'totals off, no counts, statistics hide'
    },
    disableDocumentToolTips: {
      title: 'Disable document tooltips',
      description: 'If you dislike the document-view tooltips, you can turn them off globally here.',
      tags: 'hover text, field help, popover, document view hints'
    },
    disableQuickSearchCategoryPrecheck: {
      title: 'Don\'t precheck category filter',
      description: 'Normally, categories are included in the quick-search. Enabling this option reverses that behavior.',
      tags: 'category filter, search scope, include categories, default filter'
    },
    disableSpellCheck: {
      title: 'Disable spellcheck',
      description: 'Disables spell-, grammar-, and word-checking in document edit mode.',
      tags: 'spelling, grammar, proofing, red underline, writing, dictionary',
      note: 'Please note that this option needs a FULL app restart to consistently take effect!'
    },
    doNotcollaseTreeOptions: {
      title: 'Prevent sublevel collapse in the tree',
      description: 'Prevents subcategories in the hierarchical tree from closing when a parent category is closed.',
      tags: 'remember expanded, nested open, accordion, collapse children'
    },
    doubleDashDocCount: {
      title: 'Accessibility - Pronounced count divider',
      description: 'This setting adds another | character between the category and document count in the hierarchical tree.',
      tags: 'pipe, delimiter, separator, count format, tree counts'
    },
    hideAdvSearchCheatsheetButton: {
      title: 'Hide relationships help button',
      description: 'Hides the advanced search cheatsheet help button in relationship type fields.',
      tags: 'relationship field, cheatsheet, help icon, link picker, advanced search'
    },
    hideDeadCrossThrough: {
      title: 'Accessibility - Hide strike-through',
      description: 'This setting hides the strike-through effect on dead, gone, or destroyed documents in order to increase visibility.',
      tags: 'strikethrough, deceased, destroyed, gone, document status, crossed out'
    },
    hideDocumentTitles: {
      title: 'Hide document titles',
      description: 'Hides the large section titles in the document view. Please note that this may result in relatively wild layout shifts, which might make the document look unruly in some cases.',
      tags: 'section headings, field groups, document structure labels'
    },
    hideEmptyFields: {
      title: 'Hide empty fields',
      description: 'Hides fields without any value filled in, in view (non-edit) mode. Please note that this may result in relatively wild layout shifts, which might make the document look unruly in some cases.',
      tags: 'blank fields, read-only view, compact document, layout shift'
    },
    hideHierarchyTree: {
      title: 'Hide hierarchical tree',
      description: 'Controls whether the hierarchical tree is shown.',
      tags: 'sidebar off, navigator hidden, tree panel, outline hide'
    },
    hidePlushes: {
      title: 'Hide Fantasia mascot',
      description: 'Hides the amazingly adorable and awesome Fantasia, the tiny arcane dragon. How could you! :(',
      tags: 'dragon, mascot, plush, character, decoration, easter egg'
    },
    hideTooltipsProject: {
      title: 'Hide tips on project overview',
      description: 'Hides the project overview tips & tricks info card.',
      tags: 'project home, dashboard card, overview hints'
    },
    hideTooltipsStart: {
      title: 'Hide tips popup on start screen',
      description: 'Hides the start screen tips & tricks popup.',
      tags: 'first launch, onboarding, splash, startup tips, tricks'
    },
    hideTreeExtraIcons: {
      title: 'Hide extra icons',
      description: 'Hides icons that are normally shown for convenience but do not add functionality—for example the "Open document" icon next to a document with no child nodes, which can just as well be opened with a normal left-click instead of the icon.',
      tags: 'redundant icons, clutter, minimal tree, optional actions'
    },
    hideTreeIconAddUnder: {
      title: 'Hide "Add under" icon',
      description: 'This option hides the "Add a new document belonging under XY" icon.',
      tags: 'add child, new under, plus under, create below'
    },
    hideTreeIconEdit: {
      title: 'Hide "Edit" icon',
      description: 'This option hides the "Edit XY" icon.',
      tags: 'pencil icon, edit row, quick edit tree'
    },
    hideTreeIconView: {
      title: 'Hide "Open" icon',
      description: 'This option hides the "Open XY" icon.',
      tags: 'open icon, go to document, row open button'
    },
    hideTreeOrderNumbers: {
      title: 'Hide order numbers',
      description: 'Hides the custom order numbers to the left of the names.',
      tags: 'sequence index, manual order, rank prefix, left gutter'
    },
    hideWelcomeScreenSocials: {
      title: 'Hide Welcome screen social links',
      description: 'Hides all the social links on the Welcome screen.',
      tags: 'discord, twitter, community links, social media, welcome'
    },
    invertCategoryPosition: {
      title: 'Invert category position',
      description: 'Switches the positions of the category and document numbers.',
      tags: 'swap numbers, count order, category vs document count'
    },
    invertTreeSorting: {
      title: 'Invert tree custom order sorting',
      description: 'Sorts documents in the hierarchical tree in the opposite direction from the default: from highest to lowest.',
      tags: 'reverse order, custom order, sort direction, ascending descending'
    },
    limitEditorHeight: {
      title: 'Limit text editor height',
      description: 'Determines whether the text editor has limited height when not in full-screen mode.',
      tags: 'textarea height, long text, expand editor, scroll editor'
    },
    noProjectName: {
      title: 'Hide project name in tree',
      description: 'Determines whether the project name is shown in the hierarchical tree at all.',
      tags: 'root label, project title tree, header hide'
    },
    noTags: {
      title: 'Hide tags in tree',
      description: 'Determines whether tags are shown in the hierarchical tree at all.',
      tags: 'labels off, tag strip, tree labels, hide labels'
    },
    preventAutoScroll: {
      title: 'Prevent auto-scrolling',
      description: 'Determines whether documents recall their scroll positions and auto-scroll when switching between them.',
      tags: 'scroll position, remember scroll, jump to top, tab switch'
    },
    preventFilledNoteBoardPopup: {
      title: 'Prevent filled note board showing',
      description: 'When enabled, the note board will not open automatically at app start when it still contains notes from previous FA sessions.',
      tags: 'sticky notes, note board, startup, auto open, reminders'
    },
    preventPreviewsDocuments: {
      title: 'Prevent document previews',
      description: 'Controls whether quick-previews on hover are shown in the document view and in relationship fields.',
      tags: 'hover card, peek, relationship popup, inline preview'
    },
    preventPreviewsPopups: {
      title: 'Prevent document previews in dialogs',
      description: 'Controls whether quick-previews on hover are shown when selecting documents in dialogs (for example the existing-document picker).',
      tags: 'existing document dialog, picker hover, document chooser, modal preview'
    },
    preventPreviewsTabs: {
      title: 'Prevent document previews on tabs',
      description: 'Controls whether quick-previews on hover are shown on document tabs in the tab bar.',
      tags: 'tab hover, tab strip preview, title bar peek'
    },
    preventPreviewsTree: {
      title: 'Performance — heavy\nPrevent document previews',
      description: 'Controls whether quick-previews on hover are shown in the hierarchical tree. Turning this setting off (so previews stay enabled) can have a major impact on app performance.',
      tags: 'tree hover, lag, slow, fps, performance, sidebar preview'
    },
    showDocumentID: {
      title: 'DEVELOPMENT - Show document IDs',
      description: 'If this is enabled, the document body will also show the internal document ID value.',
      tags: 'debug, internal id, identifier, dev tools, troubleshooting'
    },
    tagsAtTop: {
      title: 'Top tags in tree',
      description: 'Shows tags at the top of the hierarchical tree.',
      tags: 'tag order, tags first, above categories'
    },
    textShadow: {
      title: 'Accessibility - Text shadow',
      description: 'This setting toggles text shadows in the hierarchical tree, relationship search popups, and tabs, allowing for a more standout look for text against the background.',
      tags: 'contrast, legibility, shadow, outline, readability, text clarity'
    }
  }
}
