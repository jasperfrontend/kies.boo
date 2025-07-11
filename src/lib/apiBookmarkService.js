// src/lib/apiBookmarkService.js
import supabase from '@/lib/supabaseClient'

class ApiBookmarkService {
  constructor() {
    this.apiEndpoint = 'https://jasper.monster/harvest/addbookmark.php' // Your PHP endpoint
  }

  /**
   * Add a bookmark via the external API
   * @param {Object} bookmarkData - The bookmark data
   * @param {string|null} bookmarkData.title - Bookmark title (null for auto-harvest)
   * @param {string} bookmarkData.url - Bookmark URL
   * @param {Array|string} bookmarkData.tags - Tags (array or comma-separated string)
   * @param {string|null} bookmarkData.description - Description (null for auto-harvest)
   * @returns {Promise<Object>} API response with harvested metadata
   */
  async addBookmark(bookmarkData) {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('User must be authenticated')
      }

      // Normalize tags - ensure they're an array of strings
      let tags = []
      if (bookmarkData.tags) {
        if (Array.isArray(bookmarkData.tags)) {
          tags = bookmarkData.tags.filter(tag => tag && tag.trim())
        } else if (typeof bookmarkData.tags === 'string') {
          tags = bookmarkData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        }
      }

      // Prepare the data for the new normalized schema
      const payload = {
        title: bookmarkData.title || null, // null triggers harvesting
        url: bookmarkData.url,
        tags: tags, // Always send as array
        user_id: session.user.id,
        description: bookmarkData.description || null // null triggers harvesting
      }

      // Make the API call
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Failed to add bookmark`)
      }

      return result
    } catch (error) {
      console.error('API Bookmark Service Error:', error)
      throw error
    }
  }

  /**
   * Generate a browser extension compatible URL for adding bookmarks
   * This creates a bookmarklet or can be used in browser extensions
   * @returns {string} The bookmarklet URL
   */
  generateBookmarkletUrl() {
    const bookmarkletCode = `javascript:(function(){var title=document.title.trim();var url=window.location.href;var description=document.querySelector('meta[name="description"]')?document.querySelector('meta[name="description"]').content:'';var keywords=[];var metaKeywords=document.querySelector('meta[name="keywords"]');if(metaKeywords){keywords.push(...metaKeywords.content.split(',').map(k=>k.trim()).slice(0,3));}var apiUrl='${this.apiEndpoint}';var data={title:title||null,url:url,tags:['bookmarklet'],description:description||null,user_id:'USER_ID_HERE'};var suggestedTags='';if(keywords.length>0){suggestedTags=prompt('Suggested tags from page (comma-separated):\\nYou can edit these or leave empty to skip:',keywords.join(', '));if(suggestedTags!==null&&suggestedTags.trim()){var suggested=suggestedTags.split(',').map(t=>t.trim()).filter(Boolean);data.tags.push(...suggested);}}var customTags=prompt('Add your own custom tags (comma-separated):\\n\\nCurrent tags: '+data.tags.join(', '),'');if(customTags!==null){if(customTags.trim()){var custom=customTags.split(',').map(t=>t.trim()).filter(Boolean);data.tags.push(...custom);}data.tags=[...new Set(data.tags)];fetch(apiUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(response=>response.json()).then(result=>{if(result.success){alert('✓ Bookmark saved successfully!\\n\\nTitle: '+(result.harvested?result.harvested.title:(result.data?result.data.title:title))+'\\nTags: '+data.tags.join(', ')+(result.harvested&&result.harvested.description?'\\nDescription: '+result.harvested.description.substring(0,80)+'...':''));}else{alert('✗ Error: '+(result.error||'Failed to add bookmark'));}}).catch(error=>{alert('✗ Error adding bookmark: '+error.message);});}})();`

    return bookmarkletCode
  }

  /**
   * Test the API endpoint
   * @returns {Promise<boolean>} Whether the API is working
   */
  async testConnection() {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'GET'
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.status === 'API is working!'
      }
      return false
    } catch (error) {
      console.error('API connection test failed:', error)
      return false
    }
  }

  /**
   * Get example API usage for browser extensions
   * @returns {Object} Example usage patterns
   */
  getExampleUsage() {
    return {
      basic: {
        title: "Example Page",
        url: "https://example.com",
        tags: ["example", "demo"],
        user_id: "user-uuid-here"
      },
      withHarvesting: {
        url: "https://example.com", // Only URL required, title/description will be harvested
        tags: ["auto-tagged"],
        user_id: "user-uuid-here"
      },
      tagsAsString: {
        title: "Example with string tags",
        url: "https://example.com",
        tags: "tag1,tag2,tag3", // Can also be comma-separated string
        user_id: "user-uuid-here"
      }
    }
  }
}

export default new ApiBookmarkService()