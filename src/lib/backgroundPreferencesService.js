// src/lib/backgroundPreferencesService.js
import supabase from '@/lib/supabaseClient'

class BackgroundPreferencesService {
  constructor() {
    this.defaultBackground = null
  }

  /**
   * Get user's background preferences
   * @returns {Promise<Object|null>} User preferences or null
   */
  async getUserPreferences() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        return null
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', session.user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user preferences:', error)
        return null
      }

      return data?.preferences?.background || null
    } catch (error) {
      console.error('Error getting user preferences:', error)
      return null
    }
  }

  /**
   * Save user's background preference
   * @param {Object} backgroundData - Background preference object
   * @returns {Promise<boolean>} Success status
   */
  async saveBackgroundPreference(backgroundData) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('User must be authenticated')
      }

      // First, try to get existing preferences
      const { data: existingData, error: fetchError } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', session.user.id)
        .single()

      const currentPreferences = existingData?.preferences || {}
      const updatedPreferences = {
        ...currentPreferences,
        background: backgroundData
      }

      let result
      if (fetchError && fetchError.code === 'PGRST116') {
        // No existing preferences, create new record
        result = await supabase
          .from('user_preferences')
          .insert({
            user_id: session.user.id,
            preferences: updatedPreferences
          })
      } else {
        // Update existing record
        result = await supabase
          .from('user_preferences')
          .update({ preferences: updatedPreferences })
          .eq('user_id', session.user.id)
      }

      if (result.error) {
        console.error('Error saving background preference:', result.error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error saving background preference:', error)
      return false
    }
  }

  /**
   * Apply background to the document
   * @param {Object} backgroundData - Background preference object
   */
  applyBackground(backgroundData) {
    const body = document.body
    const app = document.getElementById('inspire') || body

    // Remove any existing background classes/styles
    this.clearBackground()

    if (!backgroundData) {
      return
    }

    switch (backgroundData.type) {
      case 'gradient':
        app.style.background = this.getGradientCss(backgroundData.value)
        app.style.backgroundAttachment = 'fixed'
        break
      
      case 'solid':
        app.style.background = backgroundData.value
        break
      
      case 'image':
        app.style.background = `url(${backgroundData.value}) center center no-repeat`
        app.style.backgroundSize = 'cover'
        app.style.backgroundAttachment = 'fixed'
        break
    }
  }

  /**
   * Clear all background styles
   */
  clearBackground() {
    const body = document.body
    const app = document.getElementById('inspire') || body
    
    app.style.background = ''
    app.style.backgroundImage = ''
    app.style.backgroundSize = ''
    app.style.backgroundAttachment = ''
    app.style.backgroundPosition = ''
    app.style.backgroundRepeat = ''
  }

  /**
   * Get CSS for a gradient
   * @param {string} gradientKey - Gradient identifier
   * @returns {string} CSS gradient string
   */
  getGradientCss(gradientKey) {
    const gradients = {
      'gradient-1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'gradient-2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'gradient-3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'gradient-4': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'gradient-5': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'gradient-6': 'linear-gradient(135deg, #ff8a80 0%, #ea80fc 100%)',
      'gradient-7': 'linear-gradient(135deg, #8fd3f4 0%, #84fab0 100%)',
      'gradient-8': 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
      'gradient-9': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      'gradient-10': 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)'
    }

    return gradients[gradientKey] || gradients['gradient-1']
  }

  /**
   * Get available gradient options
   * @returns {Array} Array of gradient options
   */
  getGradientOptions() {
    return [
      { key: 'gradient-1', label: 'Purple Blue', css: this.getGradientCss('gradient-1') },
      { key: 'gradient-2', label: 'Pink Red', css: this.getGradientCss('gradient-2') },
      { key: 'gradient-3', label: 'Blue Cyan', css: this.getGradientCss('gradient-3') },
      { key: 'gradient-4', label: 'Mint Pink', css: this.getGradientCss('gradient-4') },
      { key: 'gradient-5', label: 'Orange Peach', css: this.getGradientCss('gradient-5') },
      { key: 'gradient-6', label: 'Red Purple', css: this.getGradientCss('gradient-6') },
      { key: 'gradient-7', label: 'Blue Green', css: this.getGradientCss('gradient-7') },
      { key: 'gradient-8', label: 'Purple Pink', css: this.getGradientCss('gradient-8') },
      { key: 'gradient-9', label: 'Blue Ocean', css: this.getGradientCss('gradient-9') },
      { key: 'gradient-10', label: 'Pink Orange', css: this.getGradientCss('gradient-10') }
    ]
  }

  /**
   * Get available solid color options
   * @returns {Array} Array of solid color options
   */
  getSolidColorOptions() {
    return [
      { key: '#1976d2', label: 'Blue', color: '#1976d2' },
      { key: '#388e3c', label: 'Green', color: '#388e3c' },
      { key: '#f57c00', label: 'Orange', color: '#f57c00' },
      { key: '#d32f2f', label: 'Red', color: '#d32f2f' },
      { key: '#7b1fa2', label: 'Purple', color: '#7b1fa2' },
      { key: '#303f9f', label: 'Indigo', color: '#303f9f' },
      { key: '#0097a7', label: 'Cyan', color: '#0097a7' },
      { key: '#689f38', label: 'Light Green', color: '#689f38' },
      { key: '#f9a825', label: 'Amber', color: '#f9a825' },
      { key: '#5d4037', label: 'Brown', color: '#5d4037' }
    ]
  }
}

export default new BackgroundPreferencesService()