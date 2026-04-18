import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

describe('Learning OS app', () => {
  it('renders the home page with subject cards', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('学习入口')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '语文' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '数学' })).toBeInTheDocument()
  })

  it('renders a subject page for chinese', () => {
    render(
      <MemoryRouter initialEntries={['/learn/chinese']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 2, name: '语文' })).toBeInTheDocument()
    expect(screen.getByText('食物历史')).toBeInTheDocument()
    expect(screen.getByText('进入学习单元')).toBeInTheDocument()
  })

  it('renders a learning page for noodle', async () => {
    render(
      <MemoryRouter initialEntries={['/learn/chinese/food-history/noodle']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('面条的历史')).toBeInTheDocument()
    expect(screen.getByText('🎯 学习目标')).toBeInTheDocument()
    expect(screen.getByText('第1天：学习')).toBeInTheDocument()
  })
})
