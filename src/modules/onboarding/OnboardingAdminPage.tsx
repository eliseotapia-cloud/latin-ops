import { useState } from 'react'
import {
  Plus, X, Save, Send, UserPlus, CheckCircle, Clock, AlertCircle,
  FileText, Video, ClipboardList, Presentation, ListTodo, GripVertical, Trash2,
} from 'lucide-react'
import { useDemoData } from '../../demo/demoData'
import type { OnboardingItem, OnboardingItemTipo, OnboardingAsignacion, OnboardingItemProgreso } from '../../types'

const TIPO_ICONS: Record<OnboardingItemTipo, React.ReactNode> = {
  documento:     <FileText size={14} />,
  video:         <Video size={14} />,
  formulario:    <ClipboardList size={14} />,
  presentacion:  <Presentation size={14} />,
  tarea:         <ListTodo size={14} />,
}

const TIPO_LABELS: Record<OnboardingItemTipo, string> = {
  documento: 'Documento',
  video: 'Video',
  formulario: 'Formulario',
  presentacion: 'Presentación',
  tarea: 'Tarea',
}

const TIPO_COLORS: Record<OnboardingItemTipo, string> = {
  documento:    'bg-blue-500/15 text-blue-400 border-blue-500/25',
  video:        'bg-violet-500/15 text-violet-400 border-violet-500/25',
  formulario:   'bg-amber-500/15 text-amber-400 border-amber-500/25',
  presentacion: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  tarea:        'bg-slate-500/15 text-slate-400 border-slate-500/25',
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function progressPercent(items: OnboardingItemProgreso[]): number {
  if (items.length === 0) return 0
  return Math.round((items.filter((i) => i.estado === 'completado').length / items.length) * 100)
}

export function OnboardingAdminPage() {
  const demo = useDemoData()

  const [tab, setTab] = useState<'asignaciones' | 'plantilla'>('asignaciones')
  const [showAsignar, setShowAsignar] = useState(false)
  const [selectedEmpleado, setSelectedEmpleado] = useState('')

  // Plantilla items (editable locally for demo)
  const [items, setItems] = useState<OnboardingItem[]>(demo?.onboardingItems ?? [])
  const [showNewItem, setShowNewItem] = useState(false)
  const [newTitulo, setNewTitulo] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newTipo, setNewTipo] = useState<OnboardingItemTipo>('documento')
  const [newUrl, setNewUrl] = useState('')

  // Asignaciones (local state for demo)
  const [asignaciones, setAsignaciones] = useState<OnboardingAsignacion[]>(demo?.onboardingAsignaciones ?? [])

  if (!demo) return null

  // Empleados que aún no tienen onboarding asignado
  const empleadosSinOnboarding = demo.allEmployees.filter(
    (e) => !asignaciones.some((a) => a.empleado_id === e.id)
  )

  function handleAddItem() {
    if (!newTitulo.trim() || !newDesc.trim()) return
    const newItem: OnboardingItem = {
      id: `ob-item-${Date.now()}`,
      titulo: newTitulo,
      descripcion: newDesc,
      tipo: newTipo,
      url: newUrl.trim() || null,
      orden: items.length + 1,
    }
    setItems((prev) => [...prev, newItem])
    setNewTitulo('')
    setNewDesc('')
    setNewTipo('documento')
    setNewUrl('')
    setShowNewItem(false)
  }

  function handleRemoveItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id).map((i, idx) => ({ ...i, orden: idx + 1 })))
  }

  function handleAsignar() {
    if (!selectedEmpleado) return
    const emp = demo.allEmployees.find((e) => e.id === selectedEmpleado)
    if (!emp) return

    const newAsig: OnboardingAsignacion = {
      id: `ob-asig-${Date.now()}`,
      empleado_id: emp.id,
      empleado_nombre: `${emp.nombre} ${emp.apellido}`,
      empleado_area: emp.areas?.nombre ?? 'Sin área',
      fecha_ingreso: emp.fecha_ingreso,
      fecha_asignacion: new Date().toISOString().split('T')[0],
      items: items.map((item) => ({
        item_id: item.id,
        titulo: item.titulo,
        descripcion: item.descripcion,
        tipo: item.tipo,
        url: item.url,
        orden: item.orden,
        estado: 'pendiente' as const,
        fecha_completado: null,
      })),
    }
    setAsignaciones((prev) => [...prev, newAsig])
    setSelectedEmpleado('')
    setShowAsignar(false)
  }

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Onboarding</h1>
          <p className="text-slate-400 text-sm mt-1">Gestioná el proceso de incorporación de nuevos empleados</p>
        </div>
        {tab === 'asignaciones' && (
          <button onClick={() => { setShowAsignar(true); setSelectedEmpleado('') }} className="btn-primary flex items-center gap-2 text-sm">
            <Send size={14} />
            Asignar onboarding
          </button>
        )}
        {tab === 'plantilla' && (
          <button onClick={() => setShowNewItem(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14} />
            Agregar item
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('asignaciones')}
          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
            tab === 'asignaciones'
              ? 'bg-brand-500/15 text-brand-500 border-brand-500/25'
              : 'bg-surface-3 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          Asignaciones ({asignaciones.length})
        </button>
        <button
          onClick={() => setTab('plantilla')}
          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
            tab === 'plantilla'
              ? 'bg-brand-500/15 text-brand-500 border-brand-500/25'
              : 'bg-surface-3 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          Plantilla ({items.length} items)
        </button>
      </div>

      {/* Asignar modal */}
      {showAsignar && (
        <div className="card mb-6 border-brand-500/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <UserPlus size={15} />
              Asignar onboarding a empleado
            </h2>
            <button onClick={() => setShowAsignar(false)} className="text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          {empleadosSinOnboarding.length === 0 ? (
            <p className="text-slate-400 text-sm">Todos los empleados ya tienen onboarding asignado.</p>
          ) : (
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-400 block mb-1">Empleado</label>
                <select className="input" value={selectedEmpleado} onChange={(e) => setSelectedEmpleado(e.target.value)}>
                  <option value="">Seleccionar empleado...</option>
                  {empleadosSinOnboarding.map((e) => (
                    <option key={e.id} value={e.id}>{e.nombre} {e.apellido} — {e.areas?.nombre}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleAsignar} disabled={!selectedEmpleado} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-40">
                <Send size={13} />
                Enviar onboarding
              </button>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-3">Se asignará la plantilla actual de {items.length} items al empleado seleccionado.</p>
        </div>
      )}

      {/* Tab: Asignaciones */}
      {tab === 'asignaciones' && (
        <div className="flex flex-col gap-3">
          {asignaciones.length === 0 && (
            <div className="card text-center py-10">
              <UserPlus size={32} className="mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm">No hay onboardings asignados aún.</p>
              <p className="text-slate-500 text-xs mt-1">Usá el botón "Asignar onboarding" para empezar.</p>
            </div>
          )}
          {asignaciones.map((asig) => {
            const pct = progressPercent(asig.items)
            const completados = asig.items.filter((i) => i.estado === 'completado').length
            const total = asig.items.length
            const isComplete = pct === 100

            return (
              <div key={asig.id} className="card">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isComplete ? 'bg-emerald-500/15' : 'bg-brand-500/15'}`}>
                    {isComplete ? <CheckCircle size={18} className="text-emerald-400" /> : <Clock size={18} className="text-brand-400" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-white">{asig.empleado_nombre}</span>
                      <span className="text-xs text-slate-500">{asig.empleado_area}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Ingreso: {formatDate(asig.fecha_ingreso)}</span>
                      <span>Asignado: {formatDate(asig.fecha_asignacion)}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="text-right shrink-0">
                    <span className={`text-sm font-semibold ${isComplete ? 'text-emerald-400' : 'text-white'}`}>{pct}%</span>
                    <p className="text-xs text-slate-500">{completados}/{total} items</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-brand-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Items detail */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {asig.items.map((item) => (
                    <span
                      key={item.item_id}
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                        item.estado === 'completado'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                          : item.estado === 'en_progreso'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                          : 'bg-slate-500/15 text-slate-400 border-slate-500/25'
                      }`}
                      title={item.titulo}
                    >
                      {item.estado === 'completado' ? <CheckCircle size={10} className="inline mr-1" /> :
                       item.estado === 'en_progreso' ? <Clock size={10} className="inline mr-1" /> :
                       <AlertCircle size={10} className="inline mr-1" />}
                      {item.titulo.length > 30 ? item.titulo.slice(0, 30) + '…' : item.titulo}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tab: Plantilla */}
      {tab === 'plantilla' && (
        <div className="flex flex-col gap-3">
          {/* New item form */}
          {showNewItem && (
            <div className="card border-brand-500/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Nuevo item de onboarding</h2>
                <button onClick={() => setShowNewItem(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Título</label>
                    <input className="input" placeholder="Nombre del item" value={newTitulo} onChange={(e) => setNewTitulo(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Tipo</label>
                    <select className="input" value={newTipo} onChange={(e) => setNewTipo(e.target.value as OnboardingItemTipo)}>
                      {(Object.keys(TIPO_LABELS) as OnboardingItemTipo[]).map((t) => (
                        <option key={t} value={t}>{TIPO_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Descripción</label>
                  <textarea className="input resize-none h-16" placeholder="Descripción del item..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">URL (opcional)</label>
                  <input className="input" placeholder="https://..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleAddItem} className="btn-primary flex items-center gap-2 text-sm">
                    <Save size={13} />
                    Agregar
                  </button>
                  <button onClick={() => setShowNewItem(false)} className="btn-ghost text-sm">Cancelar</button>
                </div>
              </div>
            </div>
          )}

          {items.length === 0 && (
            <div className="card text-center py-10">
              <ListTodo size={32} className="mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm">No hay items en la plantilla.</p>
              <p className="text-slate-500 text-xs mt-1">Agregá los materiales que deben completar los empleados nuevos.</p>
            </div>
          )}

          {items.map((item) => (
            <div key={item.id} className="card flex items-center gap-3">
              <GripVertical size={14} className="text-slate-600 shrink-0" />
              <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center shrink-0">
                <span className={TIPO_COLORS[item.tipo].split(' ')[1]}>{TIPO_ICONS[item.tipo]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-white">{item.titulo}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TIPO_COLORS[item.tipo]}`}>
                    {TIPO_LABELS[item.tipo]}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{item.descripcion}</p>
              </div>
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 hover:text-brand-400 font-medium shrink-0">
                  Ver enlace
                </a>
              )}
              <button onClick={() => handleRemoveItem(item.id)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
