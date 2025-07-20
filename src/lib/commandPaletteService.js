// src/lib/commandPaletteService.js
import supabase from '@/lib/supabaseClient'
import { useViewModeStore } from '@/stores/viewMode'

class CommandPaletteService {
  constructor () {
    this.commands = new Map()
    this.userCommands = new Map()
    this.defaultPrefix = '/'
    this.userPrefix = '/'
    this.isInitialized = false
  }

  /**
   * Initialize the command palette with system defaults and user commands
   */
  async initialize () {
    if (this.isInitialized) {
      return
    }

    try {
      // Load user's custom prefix
      await this.loadUserPrefix()

      // Load system default commands
      await this.loadSystemDefaults()

      // Load user custom commands
      await this.loadUserCommands()

      this.isInitialized = true
      console.log('Command Palette initialized with', this.commands.size, 'commands')
    } catch (error) {
      console.error('Failed to initialize command palette:', error)
    }
  }

  /**
   * Check if a search query is a command
   */
  isCommand (searchQuery) {
    if (!searchQuery || typeof searchQuery !== 'string') {
      return false
    }
    return searchQuery.startsWith(this.userPrefix)
  }

  /**
   * Execute a command from search query
   */
  async executeCommand (searchQuery, router) {
    if (!this.isCommand(searchQuery)) {
      return false
    }

    const commandPart = searchQuery.slice(this.userPrefix.length).trim()
    const [commandKey, ...args] = commandPart.split(' ')

    if (!commandKey) {
      return false
    }

    const command = this.commands.get(commandKey)
    if (!command) {
      console.warn(`Unknown command: ${commandKey}`)
      return false
    }

    try {
      await this.executeCommandAction(command, args, router)
      return true
    } catch (error) {
      console.error(`Error executing command ${commandKey}:`, error)
      return false
    }
  }

  /**
   * Execute the actual command action
   */
  async executeCommandAction (command, args, router) {
    const actionTarget = typeof command.action_target === 'string'
      ? JSON.parse(command.action_target)
      : command.action_target

    switch (command.action_type) {
      case 'navigation': {
        if (actionTarget.route) {
          router.push(actionTarget.route)
        }
        break
      }

      case 'view_mode': {
        if (actionTarget.mode) {
          this.handleViewModeChange(actionTarget.mode)
        }
        break
      }

      case 'global_action': {
        // Future: Handle global actions like opening dialogs
        console.log('Global action:', actionTarget.action)
        break
      }

      case 'bookmark_action': {
        // Future: Handle bookmark-specific actions
        console.log('Bookmark action:', actionTarget.action, 'with args:', args)
        break
      }

      default: {
        console.warn('Unknown action type:', command.action_type)
      }
    }
  }

  /**
   * Handle view mode changes (desktop only)
   */
  handleViewModeChange (mode) {
    // Check if we're on mobile (simple check)
    const isMobile = window.innerWidth < 960

    if (isMobile) {
      console.log('View mode commands are not available on mobile')
      return
    }

    // Dispatch a custom event that BookmarkTable can listen for
    document.dispatchEvent(new CustomEvent('change-view-mode', {
      detail: { mode },
    }))

    // Update view mode store for persistence
    const store = useViewModeStore()
    store.setMode(mode)
  }

  /**
   * Load system default commands
   */
  async loadSystemDefaults () {
    const systemCommands = [
      // Navigation commands
      {
        command_key: 'gb',
        action_type: 'navigation',
        action_target: { route: '/' },
        description: 'Go to Bookmarks page',
      },
      {
        command_key: 'gt',
        action_type: 'navigation',
        action_target: { route: '/tags' },
        description: 'Go to Tags page',
      },
      {
        command_key: 'gp',
        action_type: 'navigation',
        action_target: { route: '/paths' },
        description: 'Go to Paths page',
      },
      {
        command_key: 'gu',
        action_type: 'navigation',
        action_target: { route: '/profile' },
        description: 'Go to Profile page',
      },
      // View mode commands
      {
        command_key: 'table',
        action_type: 'view_mode',
        action_target: { mode: 'table' },
        description: 'Switch to table view (desktop only)',
      },
      {
        command_key: 'cards',
        action_type: 'view_mode',
        action_target: { mode: 'card' },
        description: 'Switch to cards view',
      },
    ]

    // Ensure system defaults exist in database
    await this.ensureSystemDefaults(systemCommands)

    // Add to local commands map
    for (const cmd of systemCommands) {
      this.commands.set(cmd.command_key, cmd)
    }
  }

  /**
   * Ensure system default commands exist in the database
   */
  async ensureSystemDefaults (systemCommands) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        return
      }

      const userId = session.user.id

      // Use upsert instead of insert to handle duplicates gracefully
      const commandsToUpsert = systemCommands.map(cmd => ({
        user_id: userId,
        command_key: cmd.command_key,
        command_prefix: this.userPrefix,
        action_type: cmd.action_type,
        action_target: JSON.stringify(cmd.action_target),
        description: cmd.description,
        is_active: true,
        is_system_default: true,
      }))

      const { error: upsertError } = await supabase
        .from('user_commands')
        .upsert(commandsToUpsert, {
          onConflict: 'user_id,command_prefix,command_key',
          ignoreDuplicates: false, // Update existing records
        })

      if (upsertError) {
        console.error('Error upserting system commands:', upsertError)
      } else {
        console.log(`Ensured ${commandsToUpsert.length} system commands exist`)
      }
    } catch (error) {
      console.error('Error ensuring system defaults:', error)
    }
  }

  /**
   * Load user's custom commands from database
   */
  async loadUserCommands () {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        return
      }

      const { data: userCommands, error } = await supabase
        .from('user_commands')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('command_key')

      if (error) {
        console.error('Error loading user commands:', error)
        return
      }

      // Add user commands to local map (overwrites system defaults if same key)
      if (userCommands) {
        for (const cmd of userCommands) {
          this.commands.set(cmd.command_key, cmd)
          if (!cmd.is_system_default) {
            this.userCommands.set(cmd.command_key, cmd)
          }
        }
      }

      console.log(`Loaded ${userCommands?.length || 0} user commands`)
    } catch (error) {
      console.error('Error loading user commands:', error)
    }
  }

  /**
   * Load user's custom command prefix
   */
  async loadUserPrefix () {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        return
      }

      // For now, we'll use the default '/'. In the future, this could come from user preferences
      this.userPrefix = this.defaultPrefix
    } catch (error) {
      console.error('Error loading user prefix:', error)
      this.userPrefix = this.defaultPrefix
    }
  }

  /**
   * Get all available commands for help/autocomplete
   */
  getAllCommands () {
    return Array.from(this.commands.values()).map(cmd => ({
      key: cmd.command_key,
      description: cmd.description,
      isCustom: !cmd.is_system_default,
    }))
  }

  /**
   * Get command suggestions based on partial input
   */
  getCommandSuggestions (partialCommand) {
    if (!partialCommand) {
      return this.getAllCommands()
    }

    return this.getAllCommands().filter(cmd =>
      cmd.key.toLowerCase().startsWith(partialCommand.toLowerCase())
      || cmd.description.toLowerCase().includes(partialCommand.toLowerCase()),
    )
  }

  /**
   * Add a new user command
   */
  async addUserCommand (commandKey, actionType, actionTarget, description) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const newCommand = {
        user_id: session.user.id,
        command_key: commandKey,
        command_prefix: this.userPrefix,
        action_type: actionType,
        action_target: JSON.stringify(actionTarget),
        description,
        is_active: true,
        is_system_default: false,
      }

      const { data, error } = await supabase
        .from('user_commands')
        .insert(newCommand)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Add to local maps
      this.commands.set(commandKey, data)
      this.userCommands.set(commandKey, data)

      return data
    } catch (error) {
      console.error('Error adding user command:', error)
      throw error
    }
  }

  /**
   * Remove a user command
   */
  async removeUserCommand (commandKey) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('user_commands')
        .delete()
        .eq('user_id', session.user.id)
        .eq('command_key', commandKey)
        .eq('is_system_default', false) // Only allow deletion of user commands

      if (error) {
        throw error
      }

      // Remove from local maps
      this.commands.delete(commandKey)
      this.userCommands.delete(commandKey)

      return true
    } catch (error) {
      console.error('Error removing user command:', error)
      throw error
    }
  }

  /**
   * Reset to fresh state (useful for auth changes)
   */
  reset () {
    this.commands.clear()
    this.userCommands.clear()
    this.isInitialized = false
    this.userPrefix = this.defaultPrefix
  }
}

export default new CommandPaletteService()
