import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import SmashOverlay from './SmashOverlay'

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, style }) => (
    <div data-testid="smash-canvas" style={style}>
      {children}
    </div>
  ),
}))

vi.mock('./SmashScene', () => ({
  default: ({ scene, weapon, resetKey, onProgress }) => (
    <div>
      <span>{`items:${scene?.items?.length ?? 0}`}</span>
      <span>{`weapon:${weapon}`}</span>
      <span>{`reset:${resetKey}`}</span>
      <button type="button" onClick={() => onProgress({ integrity: 70, hits: 1, shots: 3, left: 9, total: 10 })}>
        Report progress
      </button>
      <button type="button" onClick={() => onProgress({ integrity: 0, hits: 12, shots: 20, left: 0, total: 10 })}>
        Report demolished
      </button>
    </div>
  ),
}))

describe('SmashOverlay', () => {
  it('shows only gun, balls, and rebuild icon buttons plus exit handling', async () => {
    document.documentElement.setAttribute('data-theme', 'light')
    const onExit = vi.fn()
    render(<SmashOverlay scene={{ backdrop: 'bg.png', items: [{}, {}] }} onExit={onExit} />)

    expect(screen.getByTestId('smash-overlay')).toBeInTheDocument()
    expect(screen.getByTestId('smash-canvas')).toBeInTheDocument()
    expect(screen.getByTestId('smash-canvas')).toHaveStyle({ background: '#0a0a0a' })
    expect(screen.getByText('items:2')).toBeInTheDocument()
    expect(screen.getByText('weapon:gun')).toBeInTheDocument()

    // Exactly three panel buttons — icon-only, no text clutter
    const panel = screen.getByRole('group', { name: 'Smash controls' })
    const buttons = panel.querySelectorAll('button')
    expect(buttons).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'Gun' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Balls' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rebuild' })).toBeInTheDocument()
    expect(screen.queryByTestId('smash-demolished')).not.toBeInTheDocument()

    // Switch to balls
    fireEvent.click(screen.getByRole('button', { name: 'Balls' }))
    expect(screen.getByText('weapon:ball')).toBeInTheDocument()

    // Demolished banner still reports scene progress
    fireEvent.click(screen.getByRole('button', { name: 'Report demolished' }))
    expect(screen.getByTestId('smash-demolished')).toBeInTheDocument()

    // Rebuild bumps the scene key (scene reports fresh progress itself)
    fireEvent.click(screen.getByRole('button', { name: 'Rebuild' }))
    expect(screen.getByText('reset:1')).toBeInTheDocument()

    // Background follows the site theme, like the paper playground
    document.documentElement.setAttribute('data-theme', 'dark')
    await waitFor(() => {
      expect(screen.getByTestId('smash-canvas')).toHaveStyle({ background: '#d4d4d4' })
    })

    fireEvent.click(screen.getByRole('button', { name: '✕' }))
    expect(onExit).toHaveBeenCalledTimes(1)
  })
})
