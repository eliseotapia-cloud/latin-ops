import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

// AUTH MOCKEADO — reemplazar por Supabase Auth cuando se implemente login real
const MOCK_USER = {
  id: '8dbae71c-28e2-44bf-808a-fe78a48bef6c',
  email: 'eliseo.tapia@latinsecurities.ar',
  nombre: 'Eliseo Tapia',
  rol: 'super_admin' as const,
  area_id: null,
  area_nombre: undefined,
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    setUser(MOCK_USER)
    setLoading(false)
  }, [])

  return <>{children}</>
}
