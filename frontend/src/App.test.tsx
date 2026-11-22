import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const hookState = vi.hoisted(() => ({
  values: [] as unknown[],
  index: 0,
  effect: undefined as (() => void) | undefined,
}))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()

  return {
    ...actual,
    useState: <T,>(initial: T): [T, (next: T | ((previous: T) => T)) => void] => {
      const index = hookState.index++
      if (index >= hookState.values.length) hookState.values[index] = initial

      return [
        hookState.values[index] as T,
        (next) => {
          const previous = hookState.values[index] as T
          hookState.values[index] = typeof next === 'function'
            ? (next as (previous: T) => T)(previous)
            : next
        },
      ]
    },
    useEffect: (effect: () => void) => {
      hookState.effect = effect
    },
  }
})

import App from './App'

function renderApp() {
  hookState.index = 0
  return renderToStaticMarkup(App())
}

async function finishLoading() {
  renderApp()
  hookState.effect?.()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('App loading and error announcements', () => {
  beforeEach(() => {
    hookState.values = []
    hookState.index = 0
    hookState.effect = undefined
    vi.unstubAllGlobals()
  })

  it('announces loading with a visually hidden status message', () => {
    vi.stubGlobal('fetch', vi.fn())

    const markup = renderApp()

    expect(markup).toContain('<p role="status" class="sr-only">Loading financial information.</p>')
    expect(markup).not.toContain('role="alert"')
  })

  it('removes the loading status after a successful fetch', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    }))

    await finishLoading()
    const markup = renderApp()

    expect(markup).not.toContain('Loading financial information.')
    expect(markup).toContain('role="status"')
    expect(markup).toContain('Loading financial chart.')
    expect(markup).not.toContain('role="alert"')
  })

  it('announces a fetch error and displays its English message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    await finishLoading()
    const markup = renderApp()

    expect(markup).toContain('role="alert"')
    expect(markup).toContain('Unable to load financial information. Please check the backend API.')
    expect(markup).not.toContain('Loading financial information.')
  })

  it('announces an unsuccessful API response as an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))

    await finishLoading()
    const markup = renderApp()

    expect(markup).toContain('role="alert"')
    expect(markup).toContain('Unable to load financial information. Please check the backend API.')
    expect(markup).not.toContain('Loading financial information.')
  })
})

describe('App heading hierarchy', () => {
  beforeEach(() => {
    hookState.values = []
    hookState.index = 0
    hookState.effect = undefined
    vi.unstubAllGlobals()
  })

  it('renders Financial Overview as the level-one page heading', () => {
    vi.stubGlobal('fetch', vi.fn())

    const markup = renderApp()

    expect(markup).toContain('<h1 class="text-xl font-semibold text-foreground tracking-tight">Financial Overview</h1>')
  })
})
