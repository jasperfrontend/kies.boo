// src/lib/unsplashService.js
class UnsplashService {
  constructor () {
    this.accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
    this.baseUrl = 'https://api.unsplash.com'
    this.utmParams = 'utm_source=kies.boo&utm_medium=referral'
  }

  /**
   * Search for photos on Unsplash
   * @param {string} query - Search term
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Photos per page (default: 20)
   * @returns {Promise<Object>} Search results
   */
  async searchPhotos (query, page = 1, perPage = 20) {
    if (!this.accessKey) {
      throw new Error('Unsplash access key not configured')
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${this.accessKey}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`)
      }

      const data = await response.json()

      // Transform the results to include attribution links
      return {
        ...data,
        results: data.results.map(photo => ({
          ...photo,
          attributionHtml: this.generateAttributionHtml(photo),
          attributionText: this.generateAttributionText(photo),
          downloadUrl: `${photo.links.download_location}?${this.utmParams}`,
        })),
      }
    } catch (error) {
      console.error('Error searching Unsplash:', error)
      throw error
    }
  }

  /**
   * Generate HTML attribution for a photo
   * @param {Object} photo - Unsplash photo object
   * @returns {string} HTML attribution string
   */
  generateAttributionHtml (photo) {
    const photographerUrl = `${photo.user.links.html}?${this.utmParams}`
    const unsplashUrl = `https://unsplash.com/?${this.utmParams}`

    return `Photo by <a href="${photographerUrl}" target="_blank" rel="noopener">${photo.user.name}</a> on <a href="${unsplashUrl}" target="_blank" rel="noopener">Unsplash</a>`
  }

  /**
   * Generate text attribution for a photo
   * @param {Object} photo - Unsplash photo object
   * @returns {string} Text attribution string
   */
  generateAttributionText (photo) {
    return `Photo by ${photo.user.name} on Unsplash`
  }

  /**
   * Get curated photos for initial display
   * @param {number} page - Page number
   * @param {number} perPage - Photos per page
   * @returns {Promise<Array>} Array of curated photos
   */
  async getCuratedPhotos (page = 1, perPage = 20) {
    if (!this.accessKey) {
      throw new Error('Unsplash access key not configured')
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/photos?page=${page}&per_page=${perPage}&order_by=popular&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${this.accessKey}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`)
      }

      const photos = await response.json()

      return photos.map(photo => ({
        ...photo,
        attributionHtml: this.generateAttributionHtml(photo),
        attributionText: this.generateAttributionText(photo),
        downloadUrl: `${photo.links.download_location}?${this.utmParams}`,
      }))
    } catch (error) {
      console.error('Error getting curated photos:', error)
      throw error
    }
  }

  /**
   * Trigger a download event for Unsplash analytics
   * @param {string} downloadUrl - The download_location URL from the photo object
   */
  async triggerDownload (downloadUrl) {
    try {
      await fetch(downloadUrl, {
        headers: {
          Authorization: `Client-ID ${this.accessKey}`,
        },
      })
    } catch (error) {
      console.error('Error triggering download:', error)
      // Don't throw - this is just for analytics
    }
  }
}

export default new UnsplashService()
