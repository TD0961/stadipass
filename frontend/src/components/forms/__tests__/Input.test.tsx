import { render, screen } from '@testing-library/react'
import { Input } from '../Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Test Label" />)
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
  })

  it('renders with error message', () => {
    render(<Input error="Test error" />)
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('renders with helper text', () => {
    render(<Input helperText="Test helper" />)
    expect(screen.getByText('Test helper')).toBeInTheDocument()
  })

  it('renders with left icon', () => {
    render(<Input leftIcon={<span data-testid="left-icon">Icon</span>} />)
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('renders with right icon', () => {
    render(<Input rightIcon={<span data-testid="right-icon">Icon</span>} />)
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('applies error styling when error is present', () => {
    render(<Input error="Test error" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('input-error')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
