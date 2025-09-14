import { renderHook, act } from '@testing-library/react'
import { useForm } from '@/hooks/useForm'

interface TestFormData {
  email: string
  password: string
  rememberMe: boolean
}

describe('useForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useForm<TestFormData>({
        initialValues: {
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        },
        onSubmit: mockOnSubmit,
      })
    )

    expect(result.current.values).toEqual({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false,
    })
  })

  it('should handle input changes correctly', () => {
    const { result } = renderHook(() =>
      useForm<TestFormData>({
        initialValues: {
          email: '',
          password: '',
          rememberMe: false,
        },
        onSubmit: mockOnSubmit,
      })
    )

    // Test text input change
    act(() => {
      const mockEvent = {
        target: { value: 'new@example.com', type: 'email' }
      } as React.ChangeEvent<HTMLInputElement>
      result.current.handleChange('email')(mockEvent)
    })

    expect(result.current.values.email).toBe('new@example.com')

    // Test checkbox change
    act(() => {
      const mockEvent = {
        target: { checked: true, type: 'checkbox' }
      } as React.ChangeEvent<HTMLInputElement>
      result.current.handleChange('rememberMe')(mockEvent)
    })

    expect(result.current.values.rememberMe).toBe(true)
  })

  it('should handle form submission', async () => {
    const { result } = renderHook(() =>
      useForm<TestFormData>({
        initialValues: {
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        },
        onSubmit: mockOnSubmit,
      })
    )

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false,
    })
  })

  it('should reset form to initial values', () => {
    const { result } = renderHook(() =>
      useForm<TestFormData>({
        initialValues: {
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        },
        onSubmit: mockOnSubmit,
      })
    )

    // Change values
    act(() => {
      const mockEvent = {
        target: { value: 'changed@example.com', type: 'email' }
      } as React.ChangeEvent<HTMLInputElement>
      result.current.handleChange('email')(mockEvent)
    })

    expect(result.current.values.email).toBe('changed@example.com')

    // Reset
    act(() => {
      result.current.reset()
    })

    expect(result.current.values).toEqual({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false,
    })
  })
})
