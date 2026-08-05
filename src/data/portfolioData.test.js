import { describe, expect, it } from 'vitest'

import * as aggregate from './portfolioData'
import { experience, education, achievements, certifications, volunteering } from './portfolioCareer'
import { hobbies, movies, webShows, profileData, codeCardData } from './portfolioPersonal'
import { projectIcons, projects } from './portfolioProjects'
import { skillIcons, skills } from './portfolioSkills'
import { socialLinks } from './portfolioSocial'

describe('portfolio data modules', () => {
  it('re-exports the split data surface through portfolioData', () => {
    expect(aggregate.socialLinks).toBe(socialLinks)
    expect(aggregate.skillIcons).toBe(skillIcons)
    expect(aggregate.skills).toBe(skills)
    expect(aggregate.experience).toBe(experience)
    expect(aggregate.education).toBe(education)
    expect(aggregate.achievements).toBe(achievements)
    expect(aggregate.certifications).toBe(certifications)
    expect(aggregate.volunteering).toBe(volunteering)
    expect(aggregate.projectIcons).toBe(projectIcons)
    expect(aggregate.projects).toBe(projects)
    expect(aggregate.hobbies).toBe(hobbies)
    expect(aggregate.movies).toBe(movies)
    expect(aggregate.webShows).toBe(webShows)
    expect(aggregate.profileData).toBe(profileData)
    expect(aggregate.codeCardData).toBe(codeCardData)
  })

  it('keeps representative content for each domain', () => {
    expect(socialLinks[0]).toMatchObject({
      href: expect.stringContaining('github.com'),
      label: 'GitHub',
    })

    expect(skills.Languages).toContain('Python')
    expect(skillIcons.Python).toBeTypeOf('function')

    expect(experience).toMatchObject({
      title: expect.any(String),
      company: expect.any(String),
      points: expect.any(Array),
      tags: expect.any(Array),
    })
    expect(education.length).toBeGreaterThan(0)
    expect(achievements.some((item) => Array.isArray(item.links))).toBe(true)
    expect(certifications.every((item) => item.link)).toBe(true)
    expect(volunteering.some((item) => Array.isArray(item.certificateLinks))).toBe(true)

    expect(projectIcons['IPL Analytics Platform']).toBeTruthy()
    expect(projects[0]).toMatchObject({
      title: expect.any(String),
      tech: expect.any(Array),
    })

    expect(hobbies.book.title).toBeTruthy()
    expect(movies[0]).toMatchObject({ title: expect.any(String) })
    expect(webShows[0]).toMatchObject({ title: expect.any(String) })
    expect(profileData.typingRoles.length).toBeGreaterThan(0)
    expect(codeCardData.cells.length).toBeGreaterThan(0)
  })
})
