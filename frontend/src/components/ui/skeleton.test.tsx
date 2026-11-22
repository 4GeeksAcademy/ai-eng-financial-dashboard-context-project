import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Skeleton } from './skeleton'

describe('Skeleton', () => {
  it('limits its pulse animation to users without reduced-motion preference', () => {
    const markup = renderToStaticMarkup(<Skeleton />)

    expect(markup).toContain('motion-safe:animate-pulse')
    expect(markup).not.toContain(' animate-pulse')
  })
})