export default {
  title: 'Fantasia Archive Settings',
  loadError: 'Could not load settings.',
  saveButton: 'Save Settings',
  closeButton: 'Close Without Saving',
  settingsSearchPlaceholder: 'Search the settings...',
  settingsSearchClearAriaLabel: 'Clear settings search',
  searchNoResultsTitle: 'No search match',
  searchNoResultsDescription:
    'Fantasia sadly didn\'t find any settings you were looking for. Perhaps try a different search term?',
  appOptionsCategories: {
    accessibility: {
      title: 'Accessibility',
      tags: 'a11y, readability, visibility, assistive',
      accessibility: {
        subtitle: 'Accessibility',
        tags: 'a11y, readability, visibility, assistive'
      }
    },
    developerSettings: {
      title: 'Developer Settings',
      tags: 'developer, debug, diagnostics, internal',
      documentBody: {
        subtitle: 'Developer Settings',
        tags: 'document id, debug metadata, internal fields, activity monitor, payload'
      }
    },
    documentViewEdit: {
      title: 'Page: Document View/Edit',
      tags: 'document page, view mode, edit mode, reader',
      documentBody: {
        subtitle: 'Document Body',
        tags: 'content area, fields, reading, editor area'
      }
    },
    hierarchicalTree: {
      title: 'Hierarchical Tree',
      tags: 'sidebar, outline, navigator, project tree',
      iconSettings: {
        subtitle: 'Icon Settings',
        tags: 'action icons, tree buttons, row icons'
      },
      informationDisplaySettings: {
        subtitle: 'Information Display Settings',
        tags: 'counts, numbers, order index, metadata display'
      },
      tagSettings: {
        subtitle: 'Tag Settings',
        tags: 'labels, tag display, tag grouping'
      },
      treeBehavior: {
        subtitle: 'Tree Behavior',
        tags: 'expand, collapse, expand all, interaction'
      },
    },
    popupsFloatingWindows: {
      title: 'Popups & Floating Windows',
      tags: 'dialogs, overlays, modals, windows',
      floatingWindows: {
        subtitle: 'Floating Windows',
        tags: 'detach, secondary window, multi window'
      },
      quickSearchDialog: {
        subtitle: 'Quick-Search/Quick-Add Dialog',
        tags: 'quick search, quick add, keyboard search, finder, popup close'
      }
    },
    visualAccessibility: {
      title: 'Visuals & App-Wide Functionality',
      tags: 'appearance, interface, global, ui, look and feel',
      applicationExtras: {
        subtitle: 'Application Extras',
        tags: 'mascot, plush, fantasia, extras'
      },
      appControlBar: {
        subtitle: 'App Control Bar',
        tags: 'toolbar, top bar, header, document chrome'
      },
      tabBehavior: {
        subtitle: 'Tab Behavior',
        tags: 'switch tabs, tab strip, hover behavior'
      },
      visualsAppwideFunctionality: {
        subtitle: 'Visuals & App-Wide Functionality',
        tags: 'theme, chrome, layout, general options'
      }
    },
    projectOverview: {
      title: 'Page: Project Overview',
      tags: 'project home, dashboard, overview, workspace home',
      projectOverviewBehavior: {
        subtitle: 'Project Overview Behavior',
        tags: 'tips, tricks, did you know, overview card, auto open, last document'
      }
    },
    welcomeScreen: {
      title: 'Page: Welcome Screen',
      tags: 'splash, start screen, welcome, first launch, home',
      welcomeScreenBehavior: {
        subtitle: 'Welcome Screen Behavior',
        tags: 'startup tips, social links, onboarding, splash'
      }
    }
  },
  appOptions: {
    aggressiveRelationshipFilter: {
      title: 'TODO - Aggressive Relationships Selection',
      description: 'Turns on the aggressive autosuggest mode for all relationship searches across the app in document edit mode. Without this turned on, after filtering, the first item in the list does not get automatically selected. Turning this on adds this functionality—allowing for much more convenient selection of existing documents while sacrificing a bit of convenience when creating new ones on the fly.',
      tags: 'autosuggest, autocomplete, first match, filter list, pick existing, relationship search'
    },
    allowQuickPopupSameKeyClose: {
      title: 'Close Quick Popups with Same Key',
      description: 'Allows closing the quick-search and quick-add popups with the same key combination that was used to open them.',
      tags: 'toggle shortcut, same hotkey, quick add, dismiss popup'
    },
    allowWiderScrollbars: {
      title: 'TODO - Wider Scrollbars',
      description: 'This setting makes FA\'s scrollbars wider and therefore allows manual click-scrolling directly on them for devices that do not support standard scrolling (for example mice without a scroll wheel).',
      tags: 'scrollbar width, click scroll, mouse without wheel, trackball, touch'
    },
    autoOpenLastDocument: {
      title: 'Auto-Open Last Document',
      description: 'When opening a project, automatically open the last active document tab instead of showing the Project overview first.',
      tags: 'auto open, last document, project open, restore tab, skip overview, workspace home, resume session'
    },
    disableCategoryCount: {
      title: 'Hide Category Count',
      description: 'Hide category numbers in the hierarchical tree',
      tags: 'simplified count, single number, less clutter'
    },
    compactTags: {
      title: 'Compact Tags',
      description: 'Determines whether tags are shown as individual categories or as one category with each tag as a subcategory.',
      tags: 'tag grouping, single tag folder, nested tags, tag hierarchy'
    },
    appTheme: {
      title: 'App Theme',
      description: 'Choose a visual theme for the app to use.',
      tags: 'dark, light, theme, theming, color, colors',
      values: {
        lightThemeFlat: 'Flat Theme, Light',
        darkThemeFlat: 'Flat Theme, Dark',
        lightThemeFantasy: 'Fantasy Theme, Light',
        darkThemeFantasy: 'Fantasy Theme, Dark'
      }
    },
    disableCloseAfterSelectQuickSearch: {
      title: 'Prevent Close After Selection on Quick-Search Popup',
      description: 'Normally the quick-search closes after an item is selected from it and that document becomes the active tab. Turning this feature on keeps the popup open, leaves the search filter as-is (nothing selected into the field), and only appends each chosen document in the background so you can open multiple results without leaving search.',
      tags: 'keep open, multiple results, batch open, quick search stays open, background tab'
    },
    disableAppControlBar: {
      title: 'Disable App Control Bar',
      description: 'If you want to maximize your working space on the document, you can disable the top button bar with this setting. The necessary control buttons will be moved to the top of the main document body, while the rest of the functionality will be accessible via keybinds or through the app menu on the top left.',
      tags: 'toolbar hide, maximize space, full width, document header'
    },
    disableAppControlBarContentButtons: {
      title: 'Disable App Control Bar Content Buttons',
      description: 'Toggles the project contents (document search, document creation, etc.) on the app control bar on or off.',
      tags: 'quick search, quick add, document create, content tools, control bar buttons'
    },
    disableAppControlBarFunctionButtons: {
      title: 'Disable App Control Bar Function Buttons',
      description: 'Toggles the app functional buttons (noteboards, hierarchical tree toggling, etc.) on the app control bar on or off.',
      tags: 'noteboard, tree toggle, sidebar hide, function tools, control bar buttons'
    },
    disableAppControlBarGuides: {
      title: 'Disable App Control Bar Guides',
      description: 'Toggles the newbie-friendly guides on the app control bar on or off.',
      tags: 'beginner hints, tutorial banners, coach marks, control bar help'
    },
    disableDocumentCounts: {
      title: 'Hide Document Count',
      description: 'Hide document numbers in the hierarchical tree',
      tags: 'totals off, no counts, statistics hide'
    },
    disableDocumentToolTips: {
      title: 'TODO - Disable Document Tooltips',
      description: 'If you dislike the document-view tooltips, you can turn them off globally here.',
      tags: 'hover text, field help, popover, document view hints'
    },
    disableSpellCheck: {
      title: 'Disable Spellcheck',
      description: 'Disables spell-, grammar-, and word-checking in document edit mode.',
      tags: 'spelling, grammar, proofing, red underline, writing, dictionary'
    },
    disableStartUpdateCheckMessage: {
      title: 'Disable Start Update Check Message',
      description: 'Disables the app version check message at the start of the app. You will still be able to trigger it manually from the menu should you want to check for updates.',
      tags: 'update, version check, startup, github releases, notify, toast, check for updates'
    },
    doubleDashDocCount: {
      title: 'Pronounced Count Divider',
      description: 'This setting adds another \\| character between the category and document count in the hierarchical tree.',
      tags: 'pipe, delimiter, separator, count format, tree counts'
    },
    extraTreePadding: {
      title: 'Add Extra Tree Padding',
      description: 'Toggling this on adds extra padding on the left to the tree. This can be useful for example when using tags with long order numbers.',
      tags: 'padding, indent, left margin, order numbers, tags, hierarchical tree'
    },
    forceSublevelCollapseInTree: {
      title: 'Force Sublevel Collapse in the Tree',
      description: 'Forces sublevels of the closed node in the hierarchical tree to close as well when a parent node is closed. Normally, they remember the pre-close state and will reopen as they were when closed.',
      tags: 'force collapse, close children, parent node, nested tree, remember expand'
    },
    hideAdvSearchCheatsheetButton: {
      title: 'TODO - Hide Relationships Help Button',
      description: 'Hides the advanced search cheatsheet help button in relationship type fields.',
      tags: 'relationship field, cheatsheet, help icon, link picker, advanced search'
    },
    hideDeadCrossThrough: {
      title: 'Hide Strike-Through',
      description: 'This setting hides the strike-through effect on dead, gone, or destroyed documents in order to increase visibility.',
      tags: 'strikethrough, deceased, destroyed, gone, document status, crossed out'
    },
    hideDocumentTitles: {
      title: 'TODO - Hide Document Titles',
      description: 'Hides the large section titles in the document view. Please note that this may result in relatively wild layout shifts, which might make the document look unruly in some cases.',
      tags: 'section headings, field groups, document structure labels'
    },
    hideEmptyFields: {
      title: 'TODO - Hide Empty Fields',
      description: 'Hides fields without any value filled in, in view (non-edit) mode. Please note that this may result in relatively wild layout shifts, which might make the document look unruly in some cases.',
      tags: 'blank fields, read-only view, compact document, layout shift'
    },
    hideHierarchyTree: {
      title: 'Hide Hierarchical Tree',
      description: 'Controls whether the hierarchical tree is shown.',
      tags: 'sidebar off, navigator hidden, tree panel, outline hide'
    },
    hidePlushes: {
      title: 'Hide Fantasia Mascot',
      description: 'Hides the amazingly adorable and awesome Fantasia, the tiny arcane dragon. How could you! :(',
      tags: 'dragon, mascot, plush, character, decoration, easter egg'
    },
    hideTooltipsProject: {
      title: 'Hide Tips on Project Overview',
      description: 'Hides the project overview tips & tricks info card.',
      tags: 'project home, dashboard card, overview hints'
    },
    hideTooltipsStart: {
      title: 'Hide Tips Popup on Start Screen',
      description: 'Hides the start screen tips & tricks popup.',
      tags: 'first launch, onboarding, splash, startup tips, tricks'
    },
    hideTreeIconAddUnder: {
      title: 'Hide "Add under" Icon',
      description: 'This option hides the "Add new document under this" icon.',
      tags: 'add child, new under, plus under, create below'
    },
    hideTreeIconEdit: {
      title: 'Hide "Edit" Icon',
      description: 'This option hides the row Edit icon.',
      tags: 'pencil icon, edit row, quick edit tree'
    },
    hideTreeIconView: {
      title: 'Hide "Open" Icon',
      description: 'This option hides the row Open icon.',
      tags: 'open icon, go to document, row open button'
    },
    hideTreeLines: {
      title: 'Hide Tree Lines',
      description: 'Hides the structural help-lines in the hierarchy tree.',
      tags: 'lines, helplines, structure, tree, hierarchical, hierarchical tree'
    },
    hideTreeOrderNumbers: {
      title: 'Hide Order Numbers',
      description: 'Hides the custom order numbers to the left of the names.',
      tags: 'sequence index, manual order, rank prefix, left gutter'
    },
    hideRecentProjectTooltip: {
      title: 'Hide "Browse latest projects" Tooltip',
      description: 'Hides the tooltip on the browse-latest-projects caret beside Resume Latest Project on the welcome screen.',
      tags: 'project, load, loading, latest, recent, intro, start, welcome, tooltip, pop-up, tooltips, pop up'
    },
    hideTabCloseButton: {
      title: 'Hide Tab Close Button',
      description: 'Determines whether the tab close buttons in the opened document list will be shown or not. Please note that this will make the tabs closeable only via middle click or right click and then clicking on the menu.',
      tags: 'tab close, close button, X button, hide close, middle click, context menu, tab strip'
    },
    hideWelcomeScreenSocials: {
      title: 'Hide Welcome Screen Social Links',
      description: 'Hides all the social links on the Welcome screen.',
      tags: 'discord, twitter, community links, social media, welcome'
    },
    skipWelcomeScreen: {
      title: 'Skip Welcome Screen',
      description: 'Skips the welcome screen and attempts to load the latest project directly when launching the app.',
      tags: 'project, load, loading, latest, recent, intro, start, welcome'
    },
    invertCategoryPosition: {
      title: 'Invert Category Position',
      description: 'Switches the positions of the category and document numbers.',
      tags: 'swap numbers, count order, category vs document count'
    },
    limitEditorHeight: {
      title: 'TODO - Limit Text Editor Height',
      description: 'Determines whether the text editor has limited height when not in full-screen mode.',
      tags: 'textarea height, long text, expand editor, scroll editor'
    },
    logFullActivityPayload: {
      title: 'Log Full Activity Payload',
      description:
        'If this is enabled, the activity will log full payloads in all situations (normally it log only in non-error and non-warning situations). This can useful when doing deep debugging that needs precise logging of results.',
      tags: 'debug, troubleshooting, dev tools, payload, activity, logging'
    },
    noProjectName: {
      title: 'Hide Project Name in Tree',
      description: 'Normally, the project name is shown in the hierarchical tree on multi-world projects. When enabled, this hides the project name title above the hierarchy tree even on multi-world projects.',
      tags: 'root label, project title tree, header hide, multi-world projects'
    },
    noTags: {
      title: 'Hide Tags in Tree',
      description: 'Determines whether tags are shown in the hierarchical tree at all.',
      tags: 'labels off, tag strip, tree labels, hide labels'
    },
    preventAutoScroll: {
      title: 'TODO - Prevent Auto-Scrolling',
      description: 'Determines whether documents recall their scroll positions and auto-scroll when switching between them.',
      tags: 'scroll position, remember scroll, jump to top, tab switch'
    },
    preventFilledAppNoteBoardPopup: {
      title: 'Prevent Filled App Noteboard from Showing',
      description: 'When enabled, the app noteboard will not open automatically at app start when it still contains notes from previous FA sessions.',
      tags: 'app noteboard, sticky notes, startup, auto open, reminders'
    },
    preventFilledProjectNoteBoardPopup: {
      title: 'Prevent Filled Project Noteboard from Showing',
      description: 'When enabled, the project noteboard will not open automatically when a project loads if it still contains notes from previous project sessions.',
      tags: 'project noteboard, sticky notes, project open, auto open, reminders'
    },
    preventPreviewsDocuments: {
      title: 'TODO - Prevent Document Previews',
      description: 'Controls whether quick-previews on hover are shown in the document view and in relationship fields.',
      tags: 'hover card, peek, relationship popup, inline preview'
    },
    preventPreviewsPopups: {
      title: 'TODO - Prevent Document Previews in Dialogs',
      description: 'Controls whether quick-previews on hover are shown when selecting documents in dialogs (for example the existing-document picker).',
      tags: 'existing document dialog, picker hover, document chooser, modal preview'
    },
    preventPreviewsTabs: {
      title: 'TODO - Prevent Document Previews on Tabs',
      description: 'Controls whether quick-previews on hover are shown on document tabs in the tab bar.',
      tags: 'tab hover, tab strip preview, title bar peek'
    },
    preventPreviewsTree: {
      title: 'TODO - Prevent Document Previews on Hover',
      description: 'Controls whether quick-previews on hover are shown in the hierarchical tree. When hover previews stay enabled, they can have a major impact on app performance.',
      tags: 'tree hover, lag, slow, fps, performance, sidebar preview',
      note: 'Can have a major impact on app performance!'
    },
    showDocumentID: {
      title: 'TODO - Show Document IDs',
      description: 'If this is enabled, the document body will also show the internal document ID value.',
      tags: 'debug, internal id, identifier, dev tools, troubleshooting'
    },
    showTabBarScrollButtons: {
      title: 'Show Tab Bar Scroll Buttons',
      description: 'Determines whether the top tab list scroll buttons should show. Please note that without them, the user is able to scroll on the bar only using the mousewheel.',
      tags: 'tab scroll, scroll arrows, chevron, overflow, mousewheel, tab strip'
    },
    tagsAtTop: {
      title: 'Top Tags in Tree',
      description: 'Shows tags at the top of the hierarchical tree.',
      tags: 'tag order, tags first, above categories'
    },
    textShadow: {
      title: 'TODO - Text Shadow',
      description: 'This setting toggles text shadows in the hierarchical tree, relationship search popups, and tabs, allowing for a more prominent look for text against the background.',
      tags: 'contrast, legibility, shadow, outline, readability, text clarity'
    }
  }
}
