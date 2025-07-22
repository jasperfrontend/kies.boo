export const ITEMS_PER_PAGE_OPTIONS = [15, 30, 45, 60, -1]

export const BOOKMARK_TABLE_HEADERS = [
  {
    title: '',
    key: 'select',
    sortable: false,
    width: '50px',
  },
  {
    title: '',
    key: 'favicon',
    sortable: false,
    width: '50px',
  },
  {
    title: 'Title',
    key: 'title',
    sortable: true,
    width: '400px',
  },
  {
    title: 'URL',
    key: 'url',
    sortable: true,
    width: '400px',
  },
  {
    title: 'Tags',
    key: 'tags',
    sortable: false,
    width: '400px',
  },
  // {
  //   title: 'Created',
  //   key: 'created_at',
  //   sortable: true,
  // },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    width: '75px',
  },
]
