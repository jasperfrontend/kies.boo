export const keyboardShortcuts = [
  {
    category: 'Bookmarks',
    shortcuts: [
      {
        key: 'Alt + A',
        description: 'Add new bookmark',
        action: 'addBookmark'
      },
      {
        key: 'Alt + I',
        description: 'Delete selected bookmarks',
        action: 'deleteSelected'
      },
      {
        key: 'Alt + U',
        description: 'Undo last delete action',
        action: 'undoDelete'
      },
      {
        key: 'Alt + O',
        description: 'Refresh bookmarks table',
        action: 'refreshBookmarks'
      }
    ]
  },
  {
    category: 'Navigation',
    shortcuts: [
      {
        key: 'Tab',
        description: 'Navigate through table rows',
        action: 'navigate'
      },
      {
        key: 'Shift + Tab',
        description: 'Navigate backwards through table rows',
        action: 'navigateBack'
      },
      {
        key: 'Space',
        description: 'Select/deselect focused row',
        action: 'toggleSelection'
      },
      {
        key: '↑ / ↓',
        description: 'Navigate table rows with arrow keys',
        action: 'arrowNavigation'
      }
    ]
  },
  {
    category: 'General',
    shortcuts: [
      {
        key: 'Ctrl + /',
        description: 'Show this keyboard shortcuts dialog',
        action: 'showShortcuts'
      },
      {
        key: 'Esc',
        description: 'Close dialogs and modals',
        action: 'closeDialog'
      },
      {
        key: 'Enter',
        description: 'Submit forms',
        action: 'submitForm'
      }
    ]
  }
];

export default keyboardShortcuts;