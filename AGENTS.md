# AGENTS.md

## Project Overview

**kies.boo** is a modern bookmark management application built with Vue 3 (Composition API), Vuetify 3.9.0, and Supabase. It provides a feature-rich interface for organizing, searching, and managing bookmarks with tags, advanced filtering, and keyboard-first navigation.

## Tech Stack

- **Frontend Framework**: Vue 3 with Composition API
- **UI Library**: Vuetify 3.9.0 (Material Design)
- **State Management**: Pinia
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Discord, GitHub OAuth)
- **Build Tool**: Vite
- **Router**: Vue Router with file-based routing

## Key Features

1. **Bookmark Management**
   - Add, edit, delete bookmarks
   - Automatic metadata harvesting (title, description, favicon, colors)
   - Bulk operations with undo functionality
   - Import/export bookmarks from browsers

2. **Organization**
   - Tag-based categorization
   - Saved searches ("Paths")
   - Domain collapsing for cleaner views
   - Multiple view modes (table/card)

3. **Navigation**
   - Keyboard-first design with extensive shortcuts
   - Command palette (/-prefixed commands)
   - Numeric pagination (type numbers to jump to pages)
   - Mobile-optimized with FAB menu and swipe gestures

4. **Personalization**
   - Custom backgrounds (images, gradients, colors)
   - Theme switching (light/dark/system)
   - User preferences (items per page, double-click behavior)
   - Bookmarklet generation for quick saves

## Database Schema

### Core Tables

```sql
-- bookmarks
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- title (text)
- url (text)
- favicon (text)
- metadata (jsonb) -- includes colors, description, etc.
- created_at (timestamptz)

-- tags
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- title (text, unique per user)
- created_at (timestamptz)

-- bookmark_tags (junction table)
- bookmark_id (uuid, references bookmarks)
- tag_id (uuid, references tags)
- PRIMARY KEY (bookmark_id, tag_id)

-- saved_searches
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- url (text) -- the path like /tag/design or /search/vue
- created_at (timestamptz)

-- user_preferences
- user_id (uuid, primary key, references auth.users)
- preferences (jsonb) -- stores all preferences as JSON

-- user_commands
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- command_key (text)
- command_prefix (text, default '/')
- action_type (text) -- navigation, view_mode, etc.
- action_target (jsonb)
- description (text)
- is_active (boolean)
- is_system_default (boolean)

-- user_api_keys
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- key_hash (text)
- key_preview (text) -- last 4 characters
- created_at (timestamptz)
- expires_at (timestamptz)
- is_active (boolean)
```

### RLS Policies
All tables have Row Level Security enabled with policies ensuring users can only access their own data.

## Code Architecture

### Directory Structure

```
src/
├── components/          # Reusable Vue components
├── composables/         # Vue composables for shared logic
├── layouts/            # Page layouts (default, contentpage)
├── lib/                # Utility libraries and services
├── pages/              # File-based routing pages
├── plugins/            # Vue plugins (Vuetify, etc.)
├── stores/             # Pinia stores
└── styles/             # Global styles
```

### Key Composables

- `useBookmarkData`: Manages bookmark loading, pagination, and filtering
- `useBookmarkDelete`: Handles deletion with undo functionality
- `useUserPreferences`: Manages user settings with Supabase sync
- `useTableSelection`: Table row selection logic
- `useKeyboardShortcuts`: Global keyboard shortcut handling
- `useNumericPagination`: Number-based page navigation

### Important Services

- `supabaseClient`: Configured Supabase client instance
- `apiBookmarkService`: External API for bookmark operations
- `commandPaletteService`: Command palette functionality
- `backgroundPreferencesService`: Background customization
- `unsplashService`: Unsplash API integration for backgrounds

## Styling Guidelines

- **DO NOT USE TAILWIND CSS** - This project uses Vuetify exclusively
- Use Vuetify's utility classes and components
- Custom styles use SASS/SCSS when needed
- Follow Material Design principles via Vuetify
- Dark theme is primary with custom `supabaseDarkTheme`

## State Management with Pinia

The main store (`src/stores/app.js`) manages:
- Global search state
- Selected items for bulk operations
- Dialog visibility states
- Bookmark refresh triggers
- Saved searches cache

Use Pinia for any cross-component state that needs reactivity.

## Component Patterns

### Dialogs
```vue
<v-dialog v-model="dialogState" max-width="500">
  <v-card>
    <!-- Dialog content -->
  </v-card>
</v-dialog>
```

### Data Tables
Use `v-data-table-server` for server-side pagination:
```vue
<v-data-table-server
  v-model:options="serverOptions"
  :headers="headers"
  :items="items"
  :items-length="totalItems"
  @update:options="loadData"
/>
```

### Form Inputs
Always use Vuetify form components:
```vue
<v-text-field
  v-model="value"
  label="Label"
  variant="outlined"
  prepend-icon="mdi-icon"
/>
```

## API Integration

### Supabase Operations
```javascript
// Always check authentication
const { data: { session } } = await supabase.auth.getSession()
if (!session?.user) return

// Use proper error handling
const { data, error } = await supabase
  .from('bookmarks')
  .select('*')
  .eq('user_id', session.user.id)

if (error) {
  console.error('Error:', error)
  // Show user-friendly error
}
```

### External APIs
- Bookmark harvesting API at `VITE_HARVEST_API_URL`
- Unsplash API for background images
- Always use environment variables for API keys

## Mobile Considerations

- Uses responsive design with Vuetify breakpoints
- Mobile has card view only (no table view)
- FAB menu for primary actions on mobile
- Touch gestures for pagination (swipe left/right)
- Bottom sheets for mobile-optimized dialogs

## Authentication Flow

1. User lands on login page (OAuth only - Discord/GitHub)
2. Supabase handles OAuth flow
3. User redirected back with session
4. App components check auth state via `supabase.auth.getSession()`
5. All API calls include user context

## Environment Variables

Required `.env` variables:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_KEY=
VITE_HARVEST_API_URL=
VITE_UNSPLASH_ACCESS_KEY=
```

## Testing Approach

When testing changes:
1. Check desktop and mobile views
2. Test keyboard shortcuts
3. Verify Supabase RLS policies work
4. Test with multiple browsers
5. Check dark/light theme compatibility

## Common Pitfalls to Avoid

1. **Never use Tailwind classes** - Only Vuetify
2. Don't access `localStorage` in SSR context
3. Always check user authentication before Supabase operations
4. Handle loading states for better UX
5. Use Vuetify's built-in responsiveness helpers
6. Remember to clean up event listeners in `onUnmounted`

## Code Style

- Use Composition API `<script setup>` syntax
- Prefer reactive refs over reactive objects
- Use computed properties for derived state
- Keep components focused and composables reusable
- Always handle errors gracefully with user feedback
- Use Vuetify components over custom implementations