import { render, screen } from '@testing-library/react'
import { RoutePending } from './route-pending'

describe('RoutePending', () => {
  it('announces loading politely', () => {
    render(<RoutePending />)
    // role=status is a polite live region, so it waits for the screen reader to finish.
    expect(screen.getByRole('status')).toHaveTextContent('Loading…')
  })
})
