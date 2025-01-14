import { render, screen } from '@testing-library/react'
import { within } from '@testing-library/dom'
import { RouterContext } from 'next/dist/shared/lib/router-context'
import Router from 'next/router'
import { composeStory } from '@storybook/react'

import Meta, { Default } from './Publications.stories.js'
import projectAnnotations from '../../../.storybook/preview.js'

function RouterMock({ children }) {
  const mockRouter = {
    locale: 'en',
    push: () => {},
    prefetch: () => new Promise((resolve, reject) => {}),
    query: {
      owner: 'test-owner',
      project: 'test-project'
    }
  }

  Router.router = mockRouter

  return (
    <RouterContext.Provider value={mockRouter}>
      {children}
    </RouterContext.Provider>
  )
}

describe('Component > PublicationsContainer', function () {
  const DefaultStory = composeStory(Default, Meta, projectAnnotations)

  beforeEach(function () {
    render(
      <RouterMock>
        <DefaultStory />
      </RouterMock>
    )
  })

  it('should have a sidebar with available filters', function () {
    const categoryFilters = DefaultStory.args.publicationsData.map(
      category => category.title
    )
    const sideBar = document.querySelector('aside')
    const listedFilters = within(sideBar).getAllByRole('link')
    expect(listedFilters.length).to.equal(categoryFilters.length + 1) // +1 to account for Show All
    expect(listedFilters[1].textContent).to.equal(categoryFilters[0])
  })

  it('should have sidebar nav with accessible label', function () {
    const sideBar = screen.getByLabelText('Filter by category')
    expect(sideBar).to.be.ok()
  })

  it('should render all publications in data', function () {
    const publications = screen.getAllByTestId('publication-test-element')
    expect(publications.length).to.equal(20) // number of publications in mock.json
  })
})
