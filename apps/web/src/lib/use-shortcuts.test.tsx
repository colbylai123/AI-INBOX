import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useShortcuts } from './use-shortcuts'

function Harness({ onJ }: { onJ: () => void }) {
  useShortcuts({ j: onJ })
  return <input aria-label="Field" />
}

describe('useShortcuts', () => {
  it('runs on its key', async () => {
    const onJ = vi.fn()
    render(<Harness onJ={onJ} />)
    await userEvent.keyboard('j')
    expect(onJ).toHaveBeenCalledOnce()
  })

  it('stays out of the way while typing or with a modifier held', async () => {
    const onJ = vi.fn()
    const { getByLabelText } = render(<Harness onJ={onJ} />)
    await userEvent.type(getByLabelText('Field'), 'jj')
    await userEvent.keyboard('{Control>}j{/Control}')
    expect(onJ).not.toHaveBeenCalled()
  })
})
