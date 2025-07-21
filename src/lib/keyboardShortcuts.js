// src/lib/keyboardShortcuts.js
export const keyboardShortcuts = [
  {
    category: 'Global Actions',
    shortcuts: [
      {
        key: 'Ctrl + I',
        description: 'Insert new bookmark',
        action: 'addBookmark',
      },
      {
        key: 'Ctrl + A',
        description: 'Select all bookmarks in table',
        action: 'selectAll',
      },
      {
        key: 'Ctrl + Del',
        description: 'Delete selected bookmarks',
        action: 'deleteSelected',
      },
      {
        key: 'Ctrl + S',
        description: 'Save current form/action',
        action: 'saveAction',
      },
      {
        key: 'F',
        description: 'Focus search bar',
        action: 'focusSearch',
      },
    ],
  },
  {
    category: 'Navigation',
    shortcuts: [
      {
        key: 'G then B',
        description: 'Go to Bookmarks page',
        action: 'goToBookmarks',
      },
      {
        key: 'G then T',
        description: 'Go to Tags page',
        action: 'goToTags',
      },
      {
        key: 'G then P',
        description: 'Go to Saved Paths page',
        action: 'goToPaths',
      },
      {
        key: 'G then U',
        description: 'Go to Profile',
        action: 'openProfile',
      },
      {
        key: 'G then S',
        description: 'Go to Settings',
        action: 'openSettings',
      },
    ],
  },
  {
    category: 'Table Navigation',
    shortcuts: [
      {
        key: 'Tab',
        description: 'Navigate through table rows',
        action: 'navigate',
      },
      {
        key: 'Shift + Tab',
        description: 'Navigate backwards through table rows',
        action: 'navigateBack',
      },
      {
        key: 'Space',
        description: 'Select/deselect focused row',
        action: 'toggleSelection',
      },
      {
        key: '↑ / ↓',
        description: 'Navigate table rows with arrow keys',
        action: 'arrowNavigation',
      },
      {
        key: '←',
        description: 'Remove highlight from table row',
        action: 'clearFocus',
      },
      {
        key: 'E',
        description: 'Edit the highlighted bookmark',
        action: 'editFocused',
      },
      {
        key: 'D',
        description: 'View details of the highlighted bookmark',
        action: 'viewDetailsFocused',
      },
      {
        key: 'L',
        description: 'Open the highlighted link in a new tab',
        action: 'viewDetailsFocused',
      },
    ],
  },
  {
    category: 'Pagination',
    shortcuts: [
      {
        key: '1-9',
        description: 'Jump to page number (type digits within 1.5 seconds)',
        action: 'goToPage',
      },
      {
        key: '5 4',
        description: 'Go to page 54 (type "5" then "4" quickly)',
        action: 'goToPageMultiDigit',
      },
      {
        key: 'Esc',
        description: 'Cancel page number input',
        action: 'cancelPageInput',
      },
    ],
  },
  {
    category: 'Mobile Gestures',
    shortcuts: [
      {
        key: 'Swipe ←',
        description: 'Go to previous page (mobile)',
        action: 'swipePrevPage',
      },
      {
        key: 'Swipe →',
        description: 'Go to next page (mobile)',
        action: 'swipeNextPage',
      },
      {
        key: 'Tap Card',
        description: 'Open bookmark in new tab (mobile)',
        action: 'openBookmark',
      },
      {
        key: 'Tap Checkbox',
        description: 'Select bookmark for bulk actions (mobile)',
        action: 'selectBookmark',
      },
      {
        key: 'FAB Menu',
        description: 'Access all main actions (mobile)',
        action: 'openFAB',
      },
    ],
  },
  {
    category: 'Help',
    shortcuts: [
      {
        key: 'Ctrl + /',
        description: 'Show this keyboard shortcuts dialog',
        action: 'showShortcuts',
      },
      {
        key: 'Esc',
        description: 'Close dialogs and modals',
        action: 'closeDialog',
      },
    ],
  },
]

export default keyboardShortcuts
