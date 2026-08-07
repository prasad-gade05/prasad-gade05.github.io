import { act, fireEvent, render, renderHook, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { projects } from '../../data/portfolioData'
import ContentTabs from './ContentTabs'
import {
  AchievementsPane,
  CertificationsPane,
  EducationPane,
  ExperiencePane,
  VolunteeringPane,
} from './contentTabs/CareerPanes'
import ContentTabPanes from './contentTabs/ContentTabPanes'
import { tabs, themes, splitGroups } from './contentTabs/config'
import { BlogsTabPane, HobbiesPane } from './contentTabs/PersonalPanes'
import { AboutPane, SkillsPane } from './contentTabs/ProfilePanes'
import ProjectsPane from './contentTabs/ProjectsPane'
import TabsHeader from './contentTabs/TabsHeader'
import { tabPaneMotionProps } from './contentTabs/motion'
import { useProjectGrid } from './contentTabs/useProjectGrid'
import { useThemePicker } from './contentTabs/useThemePicker'

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

vi.mock('./BlogsPane', () => ({
  default: () => (
    <div>
      <button type="button" data-shortcut-target="true">
        Blogs Shortcut Target A
      </button>
      <button type="button" data-shortcut-target="true">
        Blogs Shortcut Target B
      </button>
      <div>Blogs Pane Mock</div>
    </div>
  ),
}))

describe('hero content tabs', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('keeps the tab config and motion props stable', () => {
    expect(themes).toHaveLength(4)
    expect(tabs.some((tab) => tab.id === 'blogs')).toBe(true)
    expect(splitGroups['about-skills']).toEqual(['about', 'skills'])
    expect(tabPaneMotionProps.transition).toMatchObject({ duration: 0.15 })
  })

  it('calculates project grid layout and updates on resize', () => {
    window.innerWidth = 1280
    const { result } = renderHook(() => useProjectGrid(7))

    expect(result.current.adaptiveGridStyle).toEqual({
      gridTemplateColumns: 'repeat(4, 1fr)',
    })
    expect(result.current.lastRowStartIdx).toBe(4)
    expect(result.current.lastRowOffset).toBe(1)

    act(() => {
      window.innerWidth = 320
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.adaptiveGridStyle).toEqual({
      gridTemplateColumns: 'repeat(1, 1fr)',
    })
  })

  it('handles theme picker state, storage, outside clicks, and transitions', async () => {
    localStorage.setItem('portfolio-theme', 'light')
    const animateSpy = vi.fn()
    const startViewTransition = vi.fn((callback) => {
      callback()
      return { ready: Promise.resolve() }
    })
    document.startViewTransition = startViewTransition
    document.documentElement.animate = animateSpy

    const { result } = renderHook(() => useThemePicker())

    expect(result.current.theme).toBe('light')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')

    result.current.toggleBtnRef.current = {
      getBoundingClientRect: () => ({ bottom: 24, right: 100 }),
    }

    act(() => {
      result.current.toggleThemePicker()
    })

    expect(result.current.showThemePicker).toBe(true)
    expect(result.current.pickerPos).toEqual({ top: 30, right: window.innerWidth - 100 })

    result.current.themePickerRef.current = {
      contains: () => false,
    }

    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    })

    expect(result.current.showThemePicker).toBe(false)

    act(() => {
      result.current.switchTheme('dark', { clientX: 25, clientY: 35 })
    })

    await Promise.resolve()

    expect(startViewTransition).toHaveBeenCalledTimes(1)
    expect(result.current.theme).toBe('dark')
    expect(animateSpy).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.switchTheme('dark', { clientX: 25, clientY: 35 })
    })

    expect(result.current.showThemePicker).toBe(false)

    act(() => {
      result.current.cycleTheme()
    })

    await Promise.resolve()

    expect(result.current.theme).toBe('light')
  })

  it('renders the tabs header and theme options', () => {
    const onTabClick = vi.fn()
    const switchTheme = vi.fn()

    render(
      <TabsHeader
        activeTabs={['projects']}
        onTabClick={onTabClick}
        pickerPos={{ top: 10, right: 20 }}
        showThemePicker
        switchTheme={switchTheme}
        theme="dark"
        themePickerRef={{ current: null }}
        toggleBtnRef={{ current: null }}
        toggleThemePicker={vi.fn()}
        tabs={tabs.slice(0, 2)}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /projects/i }))
    expect(onTabClick).toHaveBeenCalledWith(tabs[0])

    fireEvent.click(screen.getByRole('button', { name: 'Light' }))
    expect(switchTheme).toHaveBeenCalled()
  })

  it('renders the split profile and career panes', () => {
    const { container } = render(
      <>
        <AboutPane isSplit />
        <SkillsPane isSplit />
        <ExperiencePane isSplit />
        <EducationPane isSplit />
        <AchievementsPane isSplit />
        <CertificationsPane isSplit />
        <VolunteeringPane isSplit />
      </>,
    )

    expect(screen.getByText('About Me')).toBeInTheDocument()
    expect(screen.getByText('Core Skills')).toBeInTheDocument()
    expect(screen.getByText('Experience')).toBeInTheDocument()
    expect(screen.getByText('Education')).toBeInTheDocument()
    expect(screen.getByText('Achievements')).toBeInTheDocument()
    expect(screen.getByText('Certifications')).toBeInTheDocument()
    expect(screen.getByText('Volunteering')).toBeInTheDocument()
    expect(container.querySelectorAll('.split')).not.toHaveLength(0)
  })

  it('renders hobbies and blogs panes and fires callbacks', async () => {
    const onOpenMinecraft = vi.fn()
    const onOpenMovies = vi.fn()
    const onStartDoodle = vi.fn()

    render(
      <>
        <HobbiesPane
          isSplit={false}
          onOpenMinecraft={onOpenMinecraft}
          onOpenMovies={onOpenMovies}
          onStartDoodle={onStartDoodle}
        />
        <BlogsTabPane />
      </>,
    )

    fireEvent.click(screen.getByText('Minecraft'))
    fireEvent.click(screen.getByText('Paper Playground'))
    fireEvent.click(screen.getByRole('button', { name: /see all movies & shows/i }))

    expect(onOpenMinecraft).toHaveBeenCalledTimes(1)
    expect(onStartDoodle).toHaveBeenCalledTimes(1)
    expect(onOpenMovies).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('Blogs Pane Mock')).toBeInTheDocument()
  })

  it('renders projects and tab panes for split mode', async () => {
    render(
      <>
        <ProjectsPane />
        <ContentTabPanes
          activeTabs={['projects', 'hobbies', 'blogs']}
          onOpenMinecraft={vi.fn()}
          onOpenMovies={vi.fn()}
          onStartDoodle={vi.fn()}
        />
      </>,
    )

    expect(screen.getAllByText(projects[0].title)[0]).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /view all on github/i }).length).toBeGreaterThan(0)

    await waitFor(() => {
      expect(screen.getByText('Blogs Pane Mock')).toBeInTheDocument()
    })
  })

  it('flips a project card like a coin when dragged and settles it back to rest', () => {
    const rafQueue = []
    vi.stubGlobal('requestAnimationFrame', (cb) => {
      rafQueue.push(cb)
      return rafQueue.length
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())

    render(<ProjectsPane />)
    const card = screen.getAllByRole('group', { name: /project card/i })[0]

    fireEvent.pointerDown(card, { pointerId: 1, button: 0, clientX: 120, clientY: 120 })
    expect(card.classList.contains('is-flipping')).toBe(false)

    fireEvent.pointerMove(card, { pointerId: 1, clientX: 120, clientY: 60 })
    expect(card.classList.contains('is-flipping')).toBe(true)
    expect(card.style.transform).toContain('rotateX(-216deg)')
    expect(card.style.transform).toContain('rotateY(0deg)')

    fireEvent.pointerUp(card, { pointerId: 1 })

    let frames = 0
    while (rafQueue.length && frames < 600) {
      rafQueue.shift()()
      frames += 1
    }

    expect(card.style.transform).toBe('')
    expect(card.classList.contains('is-flipping')).toBe(false)
    vi.unstubAllGlobals()
  })

  it('keeps project links clickable when pressed without dragging', () => {
    render(<ProjectsPane />)
    const card = screen.getAllByRole('group', { name: /project card/i })[0]
    const link = within(card).getAllByRole('link')[0]

    fireEvent.pointerDown(link, { pointerId: 1, button: 0, clientX: 120, clientY: 120 })
    expect(card.classList.contains('is-flipping')).toBe(false)
    expect(card.style.transform).toBe('')

    fireEvent.pointerUp(link, { pointerId: 1 })
    expect(card.classList.contains('is-flipping')).toBe(false)
    expect(card.style.transform).toBe('')
  })

  it('keeps hover tilt on project cards when they are not being dragged', () => {
    render(<ProjectsPane />)
    const card = screen.getAllByRole('group', { name: /project card/i })[0]

    Object.defineProperty(card, 'getBoundingClientRect', {
      value: () => ({ left: 0, top: 0, width: 200, height: 200 }),
      configurable: true,
    })

    fireEvent.pointerMove(card, { clientX: 150, clientY: 50 })
    expect(card.style.transform).toContain('perspective(600px)')

    fireEvent.pointerLeave(card)
    expect(card.style.transform).toBe('')
  })

  it('opens the blogs tab from the url param and closes the movies modal on escape', async () => {
    const onBlogsActiveChange = vi.fn()

    window.history.replaceState({}, '', '/?tab=blogs')

    render(
      <ContentTabs
        onOpenMinecraft={vi.fn()}
        onStartDoodle={vi.fn()}
        onBlogsActiveChange={onBlogsActiveChange}
      />,
    )

    expect(await screen.findByText('Blogs Pane Mock')).toBeInTheDocument()
    expect(onBlogsActiveChange).toHaveBeenCalledWith(true)

    fireEvent.click(screen.getByRole('button', { name: /hobbies/i }))
    fireEvent.click(screen.getByRole('button', { name: /see all movies & shows/i }))

    expect(
      await screen.findByRole('heading', { name: /binge watching collection/i }, { timeout: 5000 }),
    ).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByText('Binge Watching Collection')).not.toBeInTheDocument()
    })
  })

  it('registers a shortcut api for tab switching and theme cycling', async () => {
    const onShortcutApiReady = vi.fn()

    render(
      <ContentTabs
        onOpenMinecraft={vi.fn()}
        onStartDoodle={vi.fn()}
        onBlogsActiveChange={vi.fn()}
        onShortcutApiReady={onShortcutApiReady}
      />,
    )

    const latestApi = onShortcutApiReady.mock.calls.at(-1)?.[0]

    expect(latestApi).toMatchObject({
      focusShortcutBoundary: expect.any(Function),
      isBlocked: false,
      moveShortcutFocus: expect.any(Function),
      selectTabByIndex: expect.any(Function),
      cycleTheme: expect.any(Function),
    })

    act(() => {
      latestApi.selectTabByIndex(9, { focusTarget: true })
    })

    expect(await screen.findByText('Blogs Pane Mock')).toBeInTheDocument()

    await waitFor(() => {
      expect(document.activeElement).toHaveTextContent('Blogs Shortcut Target A')
    })

    act(() => {
      latestApi.moveShortcutFocus(1)
    })

    expect(document.activeElement).toHaveTextContent('Blogs Shortcut Target B')

    act(() => {
      latestApi.focusShortcutBoundary('start')
    })

    expect(document.activeElement).toHaveTextContent('Blogs Shortcut Target A')
  })
})
