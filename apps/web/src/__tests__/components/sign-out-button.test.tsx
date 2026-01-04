import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signOut: vi.fn(),
}))

import SignOutButton from '@/components/auth/sign-out-button'
import { signOut } from 'next-auth/react'

describe('SignOutButton', () => {
  it('renders a sign out button', () => {
    render(<SignOutButton />)

    const button = screen.getByRole('button', { name: /sign out/i })
    expect(button).toBeInTheDocument()
  })

  it('calls signOut with correct callback URL when clicked', async () => {
    const user = userEvent.setup()
    render(<SignOutButton />)

    const button = screen.getByRole('button', { name: /sign out/i })
    await user.click(button)

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/auth/login' })
  })
})
