import { useState } from 'react'
import { Plus, X, Save, DollarSign, BarChart2, Bell, CheckCircle, Clock } from 'lucide-react'
import { useDemoData } from '../../demo/demoData'
import { useRole } from '../../hooks/useRole'
import type { Comunicacion, ComunicacionTipo } from '../../types'

const TIPO_ICONS: Record<ComunicacionTipo, React.ReactNode> = {
  pago:      <DollarSign size={16} className="text-emerald-400" />,
  evaluacion: <BarChart2 size={16} className="text-violet-400" />,
  general:   <Bell size={16} className="text-slate-400" />,
}

const TIPO_COLORS: Record<ComunicacionTipo, string> = {
  pago:      'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  evaluacion: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  general:   'bg-slate-500/15 text-slate-400 border-slate-500/25',
}

const TIPO_LABELS: Record<ComunicacionTipo, string> = {
  pago:      'Pago',
  evaluacion: 'Evaluación',
  general:   'General',
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function ComunicacionesPage() {
  const demo = useDemoData()
  const { isAdmin, isEmployee } = useRole()

  const [filterTipo, setFilterTipo] = useState<ComunicacionTipo | 'todos'>('todos')
  const [showForm, setShowForm] = useState(false)

  // New communication form state
  const [newTipo, setNewTipo] = useState<ComunicacionTipo>('general')
  const [newTitulo, setNewTitulo] = useState('')
  const [newCuerpo, setNewCuerpo] = useState('')
  const [newFecha, setNewFecha] = useState('')
  const [newDestinatarios, setNewDestinatarios] = useState<Comunicacion['destinatarios']>('todos')
  const [formError, setFormError] = useState<string | null>(null)

  // Local comms list (we can add to it for demo)
  const [localComms, setLocalComms] = useState<Comunicacion[]>([])

  if (!demo) return null

  const allComms = [...demo.comunicaciones, ...localComms]
    .sort((a, b) => b.fecha_programada.localeCompare(a.fecha_programada))
    .filter((c) => filterTipo === 'todos' || c.tipo === filterTipo)
    .filter((c) => isEmployee ? c.enviada : true)

  function resetForm() {
    setNewTipo('general')
    setNewTitulo('')
    setNewCuerpo('')
    setNewFecha('')
    setNewDestinatarios('todos')
    setFormError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitulo.trim() || !newCuerpo.trim() || !newFecha) {
      setFormError('Completá todos los campos.')
      return
    }
    const newComm: Comunicacion = {
      id: `com-local-${Date.now()}`,
      tipo: newTipo,
      titulo: newTitulo,
      cuerpo: newCuerpo,
      fecha_programada: newFecha,
      destinatarios: newDestinatarios,
      enviada: false,
    }
    setLocalComms((prev) => [...prev, newComm])
    resetForm()
    setShowForm(false)
  }

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Comunicaciones</h1>
          <p className="text-slate-400 text-sm mt-1">{isEmployee ? 'Comunicaciones de RRHH y tu jefe de área' : 'Notificaciones programadas y enviadas al equipo'}</p>
        </div>
        {isAdmin && !showForm && (
          <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14} />
            Nueva comunicación
          </button>
        )}
      </div>

      {/* New communication form (admin only) */}
      {showForm && (
        <div className="card mb-6 border-brand-500/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Nueva comunicación</h2>
            <button onClick={() => { setShowForm(false); resetForm() }} className="text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Tipo</label>
                <select className="input" value={newTipo} onChange={(e) => setNewTipo(e.target.value as ComunicacionTipo)}>
                  {(Object.keys(TIPO_LABELS) as ComunicacionTipo[]).map((k) => (
                    <option key={k} value={k}>{TIPO_LABELS[k]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Destinatarios</label>
                <select className="input" value={newDestinatarios} onChange={(e) => setNewDestinatarios(e.target.value as Comunicacion['destinatarios'])}>
                  <option value="todos">Todos</option>
                  <option value="managers">Solo Managers</option>
                  <option value="empleados">Solo Empleados</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Título</label>
              <input
                className="input"
                placeholder="Asunto de la comunicación"
                value={newTitulo}
                onChange={(e) => setNewTitulo(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Cuerpo del mensaje</label>
              <textarea
                className="input resize-none h-20"
                placeholder="Escribí el contenido de la comunicación..."
                value={newCuerpo}
                onChange={(e) => setNewCuerpo(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Fecha programada</label>
              <input
                type="date"
                className="input"
                value={newFecha}
                onChange={(e) => setNewFecha(e.target.value)}
              />
            </div>
            {formError && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{formError}</p>
            )}
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex items-center gap-2 text-sm">
                <Save size={13} />
                Guardar comunicación
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="btn-ghost text-sm">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {(['todos', 'pago', 'evaluacion', 'general'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterTipo(t)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              filterTipo === t
                ? 'bg-brand-500/15 text-brand-500 border-brand-500/25'
                : 'bg-surface-3 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {t === 'todos' ? 'Todos' : TIPO_LABELS[t]}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {allComms.length === 0 && (
          <p className="text-slate-500 text-sm">No hay comunicaciones para mostrar.</p>
        )}
        {allComms.map((c) => (
          <div key={c.id} className="card">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center shrink-0 mt-0.5">
                {TIPO_ICONS[c.tipo]}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TIPO_COLORS[c.tipo]}`}>
                    {TIPO_LABELS[c.tipo]}
                  </span>
                  {c.enviada ? (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium bg-emerald-500/15 text-emerald-400 border-emerald-500/25">
                      <CheckCircle size={10} />
                      Enviada
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium bg-amber-500/15 text-amber-400 border-amber-500/25">
                      <Clock size={10} />
                      Programada · {formatDate(c.fecha_programada)}
                    </span>
                  )}
                  <span className="text-xs text-slate-500">
                    {c.destinatarios === 'todos' ? 'Para todos' : c.destinatarios === 'managers' ? 'Managers' : 'Empleados'}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{c.titulo}</h3>
                <p className="text-sm text-slate-400 line-clamp-2">{c.cuerpo}</p>
                {c.enviada && (
                  <p className="text-xs text-slate-500 mt-1">{formatDate(c.fecha_programada)}</p>
                )}
              </div>
              {/* Admin actions */}
              {isAdmin && !c.enviada && (
                <button
                  onClick={() => {}}
                  className="text-xs text-brand-500 hover:text-brand-400 font-medium whitespace-nowrap shrink-0"
                >
                  Marcar enviada
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
