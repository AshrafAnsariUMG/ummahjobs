'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface Props {
  employerUserId: string
}

export default function MessageEmployerButton({ employerUserId }: Props) {
  const { isAuthenticated, role } = useAuth()
  const router = useRouter()

  function handleClick() {
    if (isAuthenticated && role === 'candidate') {
      router.push(`/candidate/messages?compose=${employerUserId}`)
    } else {
      router.push('/login')
    }
  }

  return (
    <button
      onClick={handleClick}
      className="mt-3 block w-full text-center px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-gray-50"
      style={{ color: '#033BB0', borderColor: '#033BB0' }}
    >
      Message Employer
    </button>
  )
}
