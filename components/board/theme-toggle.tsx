'use client'

import { useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'quadro-tema'
const listeners = new Set<() => void>()

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {}
  listeners.forEach((l) => l())
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, getTheme, () => null)

  return (
    <div className="theme" role="group" aria-label="Tema de cores">
      <button type="button" aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>
        Matutino
      </button>
      <button type="button" aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>
        Noturno
      </button>
    </div>
  )
}
