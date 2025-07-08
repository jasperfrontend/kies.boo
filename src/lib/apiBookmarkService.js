// src/lib/apiBookmarkService.js
import supabase from '@/lib/supabaseClient'

class ApiBookmarkService {
  constructor() {
    this.apiEndpoint = 'https://jasper.monster/harvest/addbookmark.php' // Your PHP endpoint
  }

  /**
   * Add a bookmark via the external API
   * @param {Object} bookmarkData - The bookmark data
   * @param {string} bookmarkData.title - Bookmark title (optional - will be harvested if empty)
   * @param {string} bookmarkData.url - Bookmark URL
   * @param {Array|string} bookmarkData.tags - Tags (array or comma-separated string)
   * @param {string} bookmarkData.description - Optional description (will be harvested if empty)
   * @returns {Promise<Object>} API response with harvested metadata
   */
  async addBookmark(bookmarkData) {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('User must be authenticated')
      }

      // Prepare the data
      const payload = {
        title: bookmarkData.title,
        url: bookmarkData.url,
        tags: bookmarkData.tags || [],
        user_id: session.user.id,
        description: bookmarkData.description || null
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
        throw new Error(result.error || 'Failed to add bookmark')
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
    const bookmarkletCode = `
javascript:(function(){
  const title = document.title;
  const url = window.location.href;
  const apiUrl = '${this.apiEndpoint}';
  
  const data = {
    title: title,
    url: url,
    tags: ['bookmarklet'],
    user_id: 'USER_ID_HERE'
  };
  
  fetch(apiUrl, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      alert('Bookmark added successfully!');
    } else {
      alert('Error: ' + result.error);
    }
  })
  .catch(error => {
    alert('Error adding bookmark: ' + error.message);
  });
})();
    `.trim().replace(/\s+/g, ' ')

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
}

export default new ApiBookmarkService()