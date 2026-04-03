import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, DollarSign, BarChart2,
  FileText, Settings, LogOut, Briefcase, Link,
  Lightbulb, Bell, CalendarDays, Presentation, Home,
} from 'lucide-react'
import { useRole } from '../../hooks/useRole'
import { useAuthStore } from '../../store/authStore'

export function Sidebar() {
  const { isAdmin, isEmployee, user } = useRole()
  const signOut = useAuthStore((s) => s.signOut)

  const adminLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/equipo', icon: Users, label: 'Equipo' },
    { to: '/sueldos', icon: DollarSign, label: 'Sueldos' },
    { to: '/comunicaciones', icon: Bell, label: 'Comunicaciones' },
    { to: '/performance', icon: BarChart2, label: 'Performance' },
    { to: '/calendario', icon: CalendarDays, label: 'Calendario' },
    { to: '/sugerencias', icon: Lightbulb, label: 'Sugerencias' },
    { to: '/reportes', icon: FileText, label: 'Reportes' },
    { to: '/configuracion', icon: Settings, label: 'Configuración' },
  ]

  const managerLinks = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/mi-equipo', icon: Briefcase, label: 'Mi Equipo' },
    { to: '/calendario', icon: CalendarDays, label: 'Calendario' },
    { to: '/performance', icon: BarChart2, label: 'Performance' },
    { to: '/presentaciones', icon: Presentation, label: 'Presentaciones' },
    { to: '/mi-legajo', icon: Link, label: 'Mi Legajo' },
  ]

  const employeeLinks = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/mi-sueldo', icon: DollarSign, label: 'Sueldo' },
    { to: '/mi-evaluacion', icon: BarChart2, label: 'Mi Evaluación' },
    { to: '/mi-calendario', icon: CalendarDays, label: 'Calendario' },
    { to: '/sugerencias', icon: Lightbulb, label: 'Sugerencias' },
  ]

  const links = isAdmin ? adminLinks : isEmployee ? employeeLinks : managerLinks
  const subtitle = isAdmin ? 'Central Management' : isEmployee ? 'Empleado' : 'Jefe de Área'

  return (
    <aside className="w-56 min-h-screen bg-surface-1 border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">LATIN Ops</p>
            <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-brand-500/15 text-brand-500 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User / Sign out */}
      <div className="p-3 border-t border-white/5">
        <div className="px-3 py-2 mb-1">
          <p className="text-white text-xs font-medium truncate">{user?.nombre}</p>
          <p className="text-slate-500 text-xs truncate">{user?.email}</p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors w-full"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
