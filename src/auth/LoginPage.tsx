import { Navigate } from 'react-router-dom'

// Login deshabilitado temporalmente — auth mockeado
export function LoginPage() {
  return <Navigate to="/" replace />
}
