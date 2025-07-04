# kies.boo

**A neurospicy-first, keyboard-obsessed personal bookmark tool.**  
No fluff. No bloat. Just speed, structure, and the power to flow.

---

## What is kies.boo?

**kies.boo** is a fast, minimalist bookmark manager built for neurodivergent brains and power users who live on the keyboard.

Unlike bloated services like Raindrop or clunky browser bookmark bars, kies.boo is designed around:

- Speed of thought interaction  
- Keyboard-first navigation and commands  
- Neurodivergent-friendly design  
- Supabase-powered backend  
- Built with Vue 3, Vuetify, Vite, and Pinia

---

## Why?

Because most bookmark tools aren't made for people like us.

- Too much UI clutter  
- No way to undo mistakes fast  
- Designed for point-and-click behavior, not command-based thinking  
- No dopamine when you batch-clear 15 old bookmarks in 3 seconds

**kies.boo** fixes that.  
It's a productivity playground for the terminal-minded, ADHD-coded, shortcut-slinging kind.

---

## Keyboard Shortcuts (so far)

| Shortcut        | Action                                |
|----------------|----------------------------------------|
| Tab + Space    | Multi-select bookmarks (row by row)    |
| Alt + i        | Open delete confirmation dialog        |
| Enter          | Confirm deletion (focus auto set)      |
| Alt + u        | Undo deletion (while snackbar is open) |
| Ctrl/Cmd + Z   | Global undo (recent actions)           |

More to come: command palette, pinned items, "jump to tag", bulk edit, fuzzy search.

---

## Features (Work in Progress)

- Bookmark tagging and filtering  
- Favicon auto-fetching  
- Last visited timestamps  
- Undo stack with temporal rollback  
- Local and remote sync (eventually)

---

## Tech Stack

- Vue 3 — Composition API  
- Vuetify 3 — Clean, accessible UI framework  
- Pinia — Lightweight state management  
- Supabase — Auth, storage, real-time data

---

## Setup

```bash
git clone https://github.com/yourname/kies.boo.git
cd kies.boo
npm install
npm run dev
