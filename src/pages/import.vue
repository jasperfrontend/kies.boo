<template>
  <div>
    <v-card class="pa-6" outlined>
      <v-card-title class="text-h4 mb-4">
        Import Bookmarks
      </v-card-title>
      
      <v-card-text class="mb-6">
        <p>Upload an HTML bookmark file exported from your browser to import your bookmarks.
        Supported formats include Chrome, Edge, Firefox and Safari bookmark exports.</p>
      </v-card-text>

      <v-form @submit.prevent="handleFileUpload">
        <v-file-input
          v-model="selectedFile"
          label="Select bookmark HTML file"
          accept=".html"
          prepend-icon="mdi-file-upload"
          variant="outlined"
          :rules="fileRules"
          :loading="uploading"
          :disabled="uploading"
          @change="onFileChange"
          show-size
          clearable
        />

        <v-alert
          v-if="error"
          type="error"
          class="mt-4"
          closable
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>

        <v-alert
          v-if="success"
          type="success"
          class="mt-4"
          closable
          @click:close="success = ''"
        >
          {{ success }}
        </v-alert>

        <div v-if="parsedBookmarks.length > 0" class="mt-6">
          <v-card variant="outlined">
            <v-card-title>
              Preview: {{ parsedBookmarks.length }} bookmarks found
            </v-card-title>
            <v-card-text>
              <v-list density="compact" max-height="300" style="overflow-y: auto;">
                <v-list-item
                  v-for="(bookmark, index) in parsedBookmarks.slice(0, 10)"
                  :key="index"
                  :title="bookmark.title"
                  :subtitle="bookmark.url"
                >
                  <template v-slot:prepend>
                    <v-avatar size="24" rounded="0">
                      <img
                        :src="bookmark.favicon_url"
                        alt="favicon"
                        @error="e => e.target.src = '/favicon.png'"
                      />
                    </v-avatar>
                  </template>
                  
                  <template v-slot:append v-if="bookmark.tags.length > 0">
                    <v-chip
                      v-for="tag in bookmark.tags.slice(0, 2)"
                      :key="tag"
                      size="x-small"
                      variant="outlined"
                      class="ml-1"
                    >
                      {{ tag }}
                    </v-chip>
                    <span v-if="bookmark.tags.length > 2" class="text-caption ml-1">
                      +{{ bookmark.tags.length - 2 }}
                    </span>
                  </template>
                </v-list-item>
                
                <v-list-item v-if="parsedBookmarks.length > 10">
                  <v-list-item-title class="text-center text-caption">
                    ... and {{ parsedBookmarks.length - 10 }} more
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </div>
        <p v-if="!success">Learn how to <RouterLink to="/how-export" class="text-primary-lighten-3">export your bookmarks</RouterLink> from your browser into kies.boo or click the field above to upload your bookmarks.</p>
        <v-card-actions class="px-0 pt-6">
          <v-spacer />
          
          <v-btn
            color="primary"
            type="submit"
            :loading="uploading"
            :disabled="!selectedFile || uploading"
            variant="outlined"
            prepend-icon="mdi-upload"
          >
            {{ parsedBookmarks.length > 0 ? 'Import Bookmarks' : 'Parse File' }}
          </v-btn>
          
          <v-btn
            to="/"
            variant="text"
            :disabled="uploading"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import supabase from '@/lib/supabaseClient'
import { BookmarkParser } from '@/lib/bookmarkParser'
import { RouterLink } from 'vue-router'

const selectedFile = ref(null)
const uploading = ref(false)
const error = ref('')
const success = ref('')
const parsedBookmarks = ref([])

const fileRules = [
  v => !!v || 'File is required',
  v => !v || v.type === 'text/html' || 'File must be an HTML file',
  v => !v || v.size < 10000000 || 'File size should be less than 10MB'
]

function onFileChange(event) {
  error.value = ''
  success.value = ''
  parsedBookmarks.value = []
}

async function handleFileUpload() {
  if (!selectedFile.value) {
    error.value = 'Please select a file'
    return
  }

  uploading.value = true
  error.value = ''
  success.value = ''

  try {
    // Read the file content
    const fileContent = await readFileAsText(selectedFile.value)
    
    // Parse the bookmarks
    const bookmarks = BookmarkParser.parseBookmarksFile(fileContent)
    
    if (bookmarks.length === 0) {
      error.value = 'No bookmarks found in the uploaded file. Please check the file format.'
      return
    }

    parsedBookmarks.value = bookmarks

    // If we already have parsed bookmarks, this is the import step
    if (parsedBookmarks.value.length > 0) {
      await importBookmarks(bookmarks)
    }

  } catch (err) {
    console.error('Error processing file:', err)
    error.value = 'Failed to process the bookmark file. Please check the file format.'
  } finally {
    uploading.value = false
  }
}

async function importBookmarks(bookmarks) {
  try {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      error.value = 'You must be logged in to import bookmarks'
      return
    }

    const userId = session.user.id

    // First, get all existing URLs for this user to check for duplicates
    const { data: existingBookmarks, error: fetchError } = await supabase
      .from('bookmarks')
      .select('url')
      .eq('user_id', userId)

    if (fetchError) {
      console.error('Error fetching existing bookmarks:', fetchError)
      error.value = 'Failed to check for existing bookmarks'
      return
    }

    // Create a Set of existing URLs for fast lookup
    const existingUrls = new Set(existingBookmarks.map(b => b.url))
    
    // Remove duplicates within the import file itself (keep first occurrence)
    const uniqueBookmarks = []
    const seenUrls = new Set()
    
    for (const bookmark of bookmarks) {
      if (!seenUrls.has(bookmark.url)) {
        seenUrls.add(bookmark.url)
        uniqueBookmarks.push(bookmark)
      }
    }

    // Filter out bookmarks that already exist in the database
    const newBookmarks = uniqueBookmarks.filter(bookmark => !existingUrls.has(bookmark.url))
    const duplicateCount = bookmarks.length - newBookmarks.length
    const fileDuplicateCount = bookmarks.length - uniqueBookmarks.length
    const dbDuplicateCount = uniqueBookmarks.length - newBookmarks.length

    // If no new bookmarks to import
    if (newBookmarks.length === 0) {
      if (duplicateCount > 0) {
        success.value = `No new bookmarks to import. All ${bookmarks.length} bookmark${bookmarks.length === 1 ? '' : 's'} already exist in your collection.`
      } else {
        error.value = 'No bookmarks found to import.'
      }
      return
    }

    // Process bookmarks in batches to avoid overwhelming the database
    const batchSize = 50
    let importedCount = 0
    let errorCount = 0

    for (let i = 0; i < newBookmarks.length; i += batchSize) {
      const batch = newBookmarks.slice(i, i + batchSize)
      
      try {
        // Step 1: Collect all unique tags from this batch
        const allTagTitles = new Set()
        batch.forEach(bookmark => {
          bookmark.tags.forEach(tag => {
            if (tag && tag.trim()) {
              allTagTitles.add(tag.trim().toLowerCase())
            }
          })
        })

        // Step 2: Get existing tags or create new ones
        const tagTitleArray = Array.from(allTagTitles)
        let tagMap = new Map() // Map from tag title to tag ID

        if (tagTitleArray.length > 0) {
          // Check which tags already exist for this user
          const { data: existingTags, error: fetchTagsError } = await supabase
            .from('tags')
            .select('id, title')
            .eq('user_id', userId)
            .in('title', tagTitleArray)

          if (fetchTagsError) {
            console.error('Error fetching existing tags:', fetchTagsError)
            throw fetchTagsError
          }

          // Add existing tags to map
          existingTags.forEach(tag => {
            tagMap.set(tag.title, tag.id)
          })

          // Find tags that don't exist yet
          const existingTagTitles = new Set(existingTags.map(tag => tag.title))
          const newTagTitles = tagTitleArray.filter(title => !existingTagTitles.has(title))

          // Create new tags if needed
          if (newTagTitles.length > 0) {
            const newTagInserts = newTagTitles.map(title => ({ 
              title, 
              user_id: userId 
            }))

            const { data: insertedTags, error: insertTagsError } = await supabase
              .from('tags')
              .insert(newTagInserts)
              .select('id, title')

            if (insertTagsError) {
              console.error('Error inserting new tags:', insertTagsError)
              throw insertTagsError
            }

            // Add new tags to map
            insertedTags.forEach(tag => {
              tagMap.set(tag.title, tag.id)
            })
          }
        }

        // Step 3: Insert bookmarks
        const bookmarksToInsert = batch.map(bookmark => ({
          title: bookmark.title,
          url: bookmark.url,
          favicon: bookmark.favicon_url,
          user_id: userId,
          created_at: bookmark.created_at
        }))

        const { data: insertedBookmarks, error: insertBookmarksError } = await supabase
          .from('bookmarks')
          .insert(bookmarksToInsert)
          .select('id')

        if (insertBookmarksError) {
          console.error('Error inserting bookmarks:', insertBookmarksError)
          throw insertBookmarksError
        }

        // Step 4: Create bookmark-tag relationships
        const bookmarkTagLinks = []
        
        insertedBookmarks.forEach((insertedBookmark, index) => {
          const originalBookmark = batch[index]
          originalBookmark.tags.forEach(tagTitle => {
            if (tagTitle && tagTitle.trim()) {
              const tagId = tagMap.get(tagTitle.trim().toLowerCase())
              if (tagId) {
                bookmarkTagLinks.push({
                  bookmark_id: insertedBookmark.id,
                  tag_id: tagId
                })
              }
            }
          })
        })

        // Insert bookmark-tag relationships if any exist
        if (bookmarkTagLinks.length > 0) {
          const { error: insertLinksError } = await supabase
            .from('bookmark_tags')
            .insert(bookmarkTagLinks)

          if (insertLinksError) {
            console.error('Error inserting bookmark-tag links:', insertLinksError)
            // Don't throw here - bookmarks are already inserted, tags just won't be linked
          }
        }

        importedCount += batch.length

      } catch (batchError) {
        console.error('Error processing batch:', batchError)
        errorCount += batch.length
      }
    }

    // Construct success message with detailed information
    let message = `Successfully imported ${importedCount} new bookmark${importedCount === 1 ? '' : 's'}!`
    
    if (duplicateCount > 0) {
      const parts = []
      if (fileDuplicateCount > 0) {
        parts.push(`${fileDuplicateCount} duplicate${fileDuplicateCount === 1 ? '' : 's'} within the file`)
      }
      if (dbDuplicateCount > 0) {
        parts.push(`${dbDuplicateCount} already existed in your collection`)
      }
      message += ` Skipped ${duplicateCount} bookmark${duplicateCount === 1 ? '' : 's'} (${parts.join(' and ')}).`
    }

    if (errorCount > 0) {
      message += ` ${errorCount} bookmark${errorCount === 1 ? '' : 's'} failed to import due to errors.`
    }

    success.value = message
    
    // Clear the form
    selectedFile.value = null
    parsedBookmarks.value = []

  } catch (err) {
    console.error('Error importing bookmarks:', err)
    error.value = 'Failed to import bookmarks. Please try again.'
  }
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(e)
    reader.readAsText(file)
  })
}
</script>

<style>
p {
  margin-bottom: 1rem;
}
</style>

<route lang="yaml">
meta:
  layout: contentpage
</route>