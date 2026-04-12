import { useState } from 'react'
import {
  CheckCircle, Clock, AlertCircle, ExternalLink, ChevronRight,
  FileText, Video, ClipboardList, Presentation, ListTodo, PartyPopper,
} from 'lucide-react'
import { useDemoData } from '../../demo/demoData'
import { useRole } from '../../hooks/useRole'
import type { OnboardingItemTipo, OnboardingItemProgreso, OnboardingEstado } from '../../types'

const TIPO_ICONS: Record<OnboardingItemTipo, React.ReactNode> = {
  documento:     <FileText size={16} />,
  video:         <Video size={16} />,
  formulario:    <ClipboardList size={16} />,
  presentacion:  <Presentation size={16} />,
  tarea:         <ListTodo size={16} />,
}

const TIPO_LABELS: Record<OnboardingItemTipo, string> = {
  documento: 'Documento',
  video: 'Video',
  formulario: 'Formulario',
  presentacion: 'Presentación',
  tarea: 'Tarea',
}

const ESTADO_CONFIG: Record<OnboardingEstado, { label: string; color: string; icon: React.ReactNode }> = {
  pendiente:   { label: 'Pendiente',   color: 'bg-slate-500/15 text-slate-400 border-slate-500/25', icon: <AlertCircle size={12} /> },
  en_progreso: { label: 'En progreso', color: 'bg-amber-500/15 text-amber-400 border-amber-500/25', icon: <Clock size={12} /> },
  completado:  { label: 'Completado',  color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', icon: <CheckCircle size={12} /> },
}

export function OnboardingEmpleadoPage() {
  const demo = useDemoData()
  const { empleadoId } = useRole()

  // Find onboarding for this employee
  const [localItems, setLocalItems] = useState<OnboardingItemProgreso[] | null>(null)

  if (!demo) return null

  const asignacion = demo.onboardingAsignaciones.find((a) => a.empleado_id === empleadoId)

  if (!asignacion) {
    return (
      <div className="p-6 max-w-3xl">
        <h1 className="text-xl font-semibold text-white mb-2">Mi Onboarding</h1>
        <div className="card text-center py-12">
          <CheckCircle size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm">No tenés un onboarding asignado.</p>
          <p className="text-slate-500 text-xs mt-1">Si sos nuevo en la compañía, tu jefe o RRHH te asignará los materiales pronto.</p>
        </div>
      </div>
    )
  }

  const items = localItems ?? asignacion.items
  const completados = items.filter((i) => i.estado === 'completado').length
  const total = items.length
  const pct = Math.round((completados / total) * 100)
  const allDone = pct === 100

  function markComplete(itemId: string) {
    const current = localItems ?? asignacion.items
    setLocalItems(
      current.map((i) =>
        i.item_id === itemId
          ? { ...i, estado: 'completado' as const, fecha_completado: new Date().toISOString().split('T')[0] }
          : i
      )
    )
  }

  function markInProgress(itemId: string) {
    const current = localItems ?? asignacion.items
    setLocalItems(
      current.map((i) =>
        i.item_id === itemId && i.estado === 'pendiente'
          ? { ...i, estado: 'en_progreso' as const }
          : i
      )
    )
  }

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Mi Onboarding</h1>
        <p className="text-slate-400 text-sm mt-1">Completá estos pasos para tu incorporación a Latin Securities</p>
      </div>

      {/* Progress card */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-white">Tu progreso</p>
            <p className="text-xs text-slate-500 mt-0.5">{completados} de {total} items completados</p>
          </div>
          <span className={`text-2xl font-bold ${allDone ? 'text-emerald-400' : 'text-brand-500'}`}>{pct}%</span>
        </div>
        <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-emerald-500' : 'bg-brand-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {allDone && (
          <div className="mt-4 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
            <PartyPopper size={18} className="text-emerald-400" />
            <p className="text-sm text-emerald-400 font-medium">Completaste todo tu onboarding. Bienvenido al equipo!</p>
          </div>
        )}
      </div>

      {/* Items list */}
      <div className="flex flex-col gap-2">
        {items.sort((a, b) => a.orden - b.orden).map((item) => {
          const estado = ESTADO_CONFIG[item.estado]
          const isCompleted = item.estado === 'completado'

          return (
            <div key={item.item_id} className={`card transition-all ${isCompleted ? 'opacity-70' : ''}`}>
              <div className="flex items-start gap-3">
                {/* Step number + icon */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  isCompleted ? 'bg-emerald-500/15' : 'bg-surface-3'
                }`}>
                  {isCompleted ? (
                    <CheckCircle size={16} className="text-emerald-400" />
                  ) : (
                    <span className="text-slate-400">{TIPO_ICONS[item.tipo]}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-sm font-medium ${isCompleted ? 'text-slate-500 line-through' : 'text-white'}`}>
                      {item.orden}. {item.titulo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{item.descripcion}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium inline-flex items-center gap-1 ${estado.color}`}>
                      {estado.icon}
                      {estado.label}
                    </span>
                    <span className="text-xs text-slate-600">{TIPO_LABELS[item.tipo]}</span>
                    {item.fecha_completado && (
                      <span className="text-xs text-slate-600">
                        Completado el {new Date(item.fecha_completado + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => { if (item.estado === 'pendiente') markInProgress(item.item_id) }}
                      className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400 font-medium"
                    >
                      <ExternalLink size={12} />
                      Abrir
                    </a>
                  )}
                  {!isCompleted && (
                    <button
                      onClick={() => markComplete(item.item_id)}
                      className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400 font-medium bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg px-2.5 py-1 transition-colors"
                    >
                      <CheckCircle size={12} />
                      Completar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
