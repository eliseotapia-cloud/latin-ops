import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, BarChart2, Eye, EyeOff } from 'lucide-react'
import { useRole } from '../../hooks/useRole'
import { useDemoData } from '../../demo/demoData'

export function EmployeeDashboard() {
  const { user } = useRole()
  const demo = useDemoData()
  const [showSalary, setShowSalary] = useState(false)

  if (!demo) return null

  const nombre = user?.nombre?.split(' ')[0] ?? 'Bienvenido'
  const area = user?.area_nombre ?? ''

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Buen día, {nombre}.</h1>
        <p className="text-slate-400 text-sm mt-1">{area}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Sueldo actual</span>
            <button onClick={() => setShowSalary((v) => !v)} className="text-slate-600 hover:text-slate-400 transition-colors">
              {showSalary ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          </div>
          <p className="text-xl font-semibold text-emerald-400">
            {showSalary ? 'ARS 2.800.000' : <span className="text-slate-600 tracking-widest text-base">••••••••</span>}
          </p>
        </div>
        <div className="stat-card">
          <span className="text-xs text-slate-400">Motivación</span>
          <p className="text-xl font-semibold text-sky-400 mt-1">
            {demo.wellbeing?.motivacion ?? '—'} <span className="text-slate-500 text-sm font-normal">/ 5</span>
          </p>
        </div>
      </div>

      {/* Quick links */}
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Mis módulos</h2>
      <div className="grid grid-cols-2 gap-4">
        <Link to="/mi-sueldo" className="card hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group">
          <DollarSign size={20} className="text-emerald-400 mb-3" />
          <p className="text-sm font-medium text-white">Sueldo</p>
          <p className="text-xs text-slate-500 mt-1">Evolución salarial</p>
        </Link>
        <Link to="/mi-evaluacion" className="card hover:border-brand-500/30 hover:bg-brand-500/5 transition-all group">
          <BarChart2 size={20} className="text-brand-500 mb-3" />
          <p className="text-sm font-medium text-white">Mi Evaluación</p>
          <p className="text-xs text-slate-500 mt-1">Mi autoevaluación de desempeño</p>
        </Link>
      </div>
    </div>
  )
}
