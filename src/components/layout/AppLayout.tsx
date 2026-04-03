import { useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Bell, Lightbulb } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { useRole } from '../../hooks/useRole'
import { useDemoData } from '../../demo/demoData'

const STORAGE_KEY = 'latin_comms_seen'

function FloatingActions() {
  const { isManager } = useRole()
  const demo = useDemoData()
  const location = useLocation()

  const sentCount = demo ? demo.comunicaciones.filter((c) => c.enviada).length : 0
  const seenCount = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0')
  const unreadCount = Math.max(0, sentCount - seenCount)

  // Mark as read when on /comunicaciones
  useEffect(() => {
    if (location.pathname === '/comunicaciones' && unreadCount > 0) {
      localStorage.setItem(STORAGE_KEY, String(sentCount))
      // Force re-render via a no-op (badge reads fresh from localStorage on next render)
    }
  }, [location.pathname])

  if (!isManager) return null

  const isOnComms = location.pathname === '/comunicaciones'
  const badgeCount = isOnComms ? 0 : unreadCount
  const isOnSugs = location.pathname === '/sugerencias'

  return (
    <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-40">
      {/* Comunicaciones */}
      <Link
        to="/comunicaciones"
        title="Comunicaciones"
        className={`relative w-11 h-11 rounded-xl flex items-center justify-center shadow-lg border transition-colors ${
          isOnComms
            ? 'bg-brand-500 border-brand-400 text-white'
            : 'bg-surface-2 border-white/10 text-slate-400 hover:text-white hover:border-white/25'
        }`}
      >
        <Bell size={18} />
        {badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {badgeCount}
          </span>
        )}
      </Link>

      {/* Sugerencias */}
      <Link
        to="/sugerencias"
        title="Sugerencias"
        className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg border transition-colors ${
          isOnSugs
            ? 'bg-amber-500 border-amber-400 text-white'
            : 'bg-surface-2 border-white/10 text-slate-400 hover:text-white hover:border-white/25'
        }`}
      >
        <Lightbulb size={18} />
      </Link>
    </div>
  )
}

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <FloatingActions />
    </div>
  )
}
