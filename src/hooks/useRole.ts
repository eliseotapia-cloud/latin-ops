import { useAuthStore } from '../store/authStore'

export function useRole() {
  const user = useAuthStore((s) => s.user)

  return {
    role: user?.rol ?? null,
    isAdmin: user?.rol === 'super_admin',
    isManager: user?.rol === 'area_manager',
    isEmployee: user?.rol === 'empleado',
    areaId: user?.area_id ?? null,
    empleadoId: user?.empleado_id ?? null,
    user,
  }
}
