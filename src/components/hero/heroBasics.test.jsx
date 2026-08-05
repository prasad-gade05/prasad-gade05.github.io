import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { codeCardData, socialLinks } from '../../data/portfolioData'
import BlogsPane from './BlogsPane'
import CodeCard from './CodeCard'
import CurrentTime from './CurrentTime'
import HelpModal from './HelpModal'
import MoviesModal from './MoviesModal'
import SocialLinks from './SocialLinks'

vi.mock('framer-motion', async () => {
  const React = await vi.importActual('react')

  const makeComponent = (tag) =>
    React.forwardRef(({ children, ...props }, ref) =>
      React.createElement(tag, { ref, ...props }, children),
    )

  return {
    AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
    motion: new Proxy(
      {},
      {
        get: (_, tag) => makeComponent(tag),
      },
    ),
  }
})

describe('hero basics', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the help modal content and closes correctly', async () => {
    const onClose = vi.fn()
    const { container } = render(<HelpModal onClose={onClose} />)

    expect(screen.getByText('How do I get started here?')).toBeInTheDocument()
    expect(screen.getByText('Why blogs?')).toBeInTheDocument()
    expect(screen.getByText('Every blog post here is 100% human written.')).toBeInTheDocument()

    const modalContent = container.querySelector('.help-modal-content')
    const scrollBy = vi.fn()
    Object.defineProperty(modalContent, 'clientHeight', {
      configurable: true,
      value: 300,
    })
    Object.defineProperty(modalContent, 'scrollBy', {
      configurable: true,
      value: scrollBy,
    })

    fireEvent.keyDown(document, { key: ' ', code: 'Space' })
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 240, behavior: 'smooth' })

    fireEvent.keyDown(document, { key: ' ', code: 'Space', shiftKey: true })
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -240, behavior: 'smooth' })

    fireEvent.click(screen.getByText('How do I get started here?'))
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button'))
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByText('Thanks for visiting! Feel free to explore.').closest('.help-modal-overlay'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('renders social links and tilt interactions', () => {
    render(<SocialLinks />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(socialLinks.length)
    expect(links[0]).toHaveAttribute('href', socialLinks[0].href)

    Object.defineProperty(links[0], 'getBoundingClientRect', {
      value: () => ({ left: 0, top: 0, width: 100, height: 100 }),
    })

    fireEvent.mouseMove(links[0], { clientX: 75, clientY: 25 })
    expect(links[0].style.transform).toContain('perspective(600px)')

    fireEvent.mouseLeave(links[0])
    expect(links[0].style.transform).toBe('')
  })

  it('shows the current time and updates after one tick', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T15:30:00Z'))
    render(<CurrentTime />)

    expect(screen.getByText('January 1')).toBeInTheDocument()
    const initialTime = screen.getByText(/pm/i).textContent

    act(() => {
      vi.setSystemTime(new Date('2026-01-01T15:31:00Z'))
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText(/pm/i).textContent).not.toBe(initialTime)
    vi.useRealTimers()
  })

  it('renders the code card and opens the resume callback when provided', () => {
    const onOpenResume = vi.fn()
    const onOpenHelp = vi.fn()

    render(<CodeCard onOpenResume={onOpenResume} onOpenHelp={onOpenHelp} />)

    expect(screen.getByText(codeCardData.filename)).toBeInTheDocument()
    expect(screen.getByText('Resume')).toBeInTheDocument()
    expect(screen.getAllByText('ComputerEngineer').length).toBeGreaterThan(0)
    expect(screen.getByText('In [1]:')).toBeInTheDocument()
    expect(screen.getByText('Out[2]:')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: /resume/i }))
    expect(onOpenResume).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    expect(onOpenHelp).toHaveBeenCalledTimes(1)
  })

  it('handles the movies modal tabs and close behavior', () => {
    const onClose = vi.fn()

    const { container } = render(
      <MoviesModal
        isOpen
        onClose={onClose}
        movies={[{ title: 'Movie One', year: '2024', genre: 'Drama, Action' }]}
        shows={[{ title: 'Show One', seasons: 2, genre: 'Drama, Thriller' }]}
      />,
    )

    expect(screen.getByText('Binge Watching Collection')).toBeInTheDocument()
    expect(screen.getByText('Movie One')).toBeInTheDocument()

    const modalContent = container.querySelector('.movies-modal-content')
    const scrollBy = vi.fn()
    Object.defineProperty(modalContent, 'clientHeight', {
      configurable: true,
      value: 320,
    })
    Object.defineProperty(modalContent, 'scrollBy', {
      configurable: true,
      value: scrollBy,
    })

    fireEvent.keyDown(document, { key: ' ', code: 'Space' })
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 256, behavior: 'smooth' })

    fireEvent.keyDown(document, { key: ' ', code: 'Space', shiftKey: true })
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -256, behavior: 'smooth' })

    const moviesTabButton = screen.getByRole('button', { name: /movies/i })
    moviesTabButton.focus()
    expect(moviesTabButton).toHaveFocus()

    fireEvent.keyDown(moviesTabButton, { key: 'ArrowRight' })
    expect(screen.getByText('Show One')).toBeInTheDocument()
    expect(screen.getByText('2 Seasons')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(screen.getByText('Movie One')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(screen.getByText('Show One')).toBeInTheDocument()

    fireEvent.click(container.querySelector('.movies-modal-close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('renders and filters blogs, changes sort order, and copies share links', async () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState')

    render(<BlogsPane />)

    expect(screen.getByText(/100% human-written/i)).toBeInTheDocument()
    expect(screen.getByText('The Philosophy Behind My Site')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Personal' }))
    expect(screen.queryByText('Agent Readiness on Websites...')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /sort blogs/i }))
    expect(screen.getByText('Newest First')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Oldest First' }))

    const articles = screen.getAllByRole('article')
    expect(within(articles[0]).getByText('Introduction: My Blogging Journey')).toBeInTheDocument()

    const shareButtons = screen.getAllByLabelText('Copy blog link')
    expect(shareButtons[0]).toHaveAttribute('data-shortcut-target', 'true')
    fireEvent.click(shareButtons[0])
    await act(async () => {
      await Promise.resolve()
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('/blogs/'),
    )
    expect(shareButtons[0]).toHaveAttribute('title', 'Link copied!')

    fireEvent.mouseDown(document.body)
    await waitFor(() => {
      expect(screen.queryByText('Newest First')).not.toBeInTheDocument()
    })

    expect(articles[0]).toHaveAttribute('data-shortcut-target', 'true')

    fireEvent.keyDown(articles[0], { key: ' ' })
    expect(replaceStateSpy).toHaveBeenCalledWith({}, '', '/?tab=blogs')
  })
})
