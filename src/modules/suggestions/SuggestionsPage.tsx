import { useState } from 'react'
import { Plus, X, ArrowRight, RefreshCw, Send } from 'lucide-react'
import { useDemoData } from '../../demo/demoData'
import { useRole } from '../../hooks/useRole'
import type { Suggestion } from '../../types'

type Categoria = Suggestion['categoria']
type Estado = Suggestion['estado']

const CATEGORIA_COLORS: Record<Categoria, string> = {
  procesos:    'bg-blue-500/15 text-blue-400 border-blue-500/25',
  cultura:     'bg-violet-500/15 text-violet-400 border-violet-500/25',
  herramientas:'bg-amber-500/15 text-amber-400 border-amber-500/25',
  beneficios:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  otro:        'bg-slate-500/15 text-slate-400 border-slate-500/25',
}

const CATEGORIA_LABELS: Record<Categoria, string> = {
  procesos: 'Procesos', cultura: 'Cultura', herramientas: 'Herramientas',
  beneficios: 'Beneficios', otro: 'Otro',
}

const ESTADO_COLORS: Record<Estado, string> = {
  nueva:        'bg-brand-500/15 text-brand-500 border-brand-500/25',
  en_revision:  'bg-amber-500/15 text-amber-400 border-amber-500/25',
  implementada: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  descartada:   'bg-slate-500/15 text-slate-400 border-slate-500/25',
}

const ESTADO_LABELS: Record<Estado, string> = {
  nueva: 'Nueva', en_revision: 'En revisión', implementada: 'Implementada', descartada: 'Descartada',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function SuggestionsPage() {
  const demo = useDemoData()
  const { isAdmin } = useRole()

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [formStep, setFormStep] = useState<1 | 2>(1)
  const [reformulateHint, setReformulateHint] = useState(false)

  const [titulo, setTitulo] = useState('')
  const [categoria, setCategoria] = useState<Categoria>('procesos')
  const [descripcion, setDescripcion] = useState('')
  const [esAnonima, setEsAnonima] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [filterEstado, setFilterEstado] = useState<Estado | 'todas'>('todas')
  const [filterCategoria, setFilterCategoria] = useState<Categoria | 'todas'>('todas')

  if (!demo) return null

  const suggestions = demo.suggestions.filter((s) => {
    if (filterEstado !== 'todas' && s.estado !== filterEstado) return false
    if (filterCategoria !== 'todas' && s.categoria !== filterCategoria) return false
    return true
  })

  function resetForm() {
    setTitulo('')
    setDescripcion('')
    setCategoria('procesos')
    setEsAnonima(false)
    setError(null)
    setFormStep(1)
    setReformulateHint(false)
  }

  function handleClose() {
    resetForm()
    setShowForm(false)
  }

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim() || !descripcion.trim()) {
      setError('Completá título y descripción.')
      return
    }
    setError(null)
    setFormStep(2)
  }

  function handleReformulate() {
    setFormStep(1)
    setReformulateHint(true)
  }

  function handleSendAnyway() {
    // In demo: just close the form
    resetForm()
    setShowForm(false)
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Sugerencias</h1>
          <p className="text-slate-400 text-sm mt-1">
            {isAdmin ? 'Todas las sugerencias del equipo' : 'Compartí ideas para mejorar Latin'}
          </p>
        </div>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14} />
            Nueva sugerencia
          </button>
        )}
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="card mb-6 border-brand-500/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                {formStep === 1 ? 'Nueva sugerencia' : 'Revisá tu sugerencia antes de enviar'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Paso {formStep} de 2</p>
            </div>
            <button onClick={handleClose} className="text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Step 1: Fill suggestion */}
          {formStep === 1 && (
            <form onSubmit={handleStep1Submit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Título</label>
                <input
                  className="input"
                  placeholder="Resumen de la sugerencia"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Categoría</label>
                <select className="input" value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria)}>
                  {(Object.keys(CATEGORIA_LABELS) as Categoria[]).map((k) => (
                    <option key={k} value={k}>{CATEGORIA_LABELS[k]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Descripción</label>
                {reformulateHint && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-2">
                    <p className="text-xs text-amber-400">
                      💡 Intentá reformular tu idea para que no requiera presupuesto adicional. Por ejemplo, en vez de "Comprar equipo X", pensá en "Optimizar el proceso de..."
                    </p>
                  </div>
                )}
                <textarea
                  className="input resize-none h-24"
                  placeholder="Describí tu sugerencia en detalle..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={esAnonima}
                  onChange={(e) => setEsAnonima(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-slate-300">Enviar anónimamente</span>
              </label>
              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
              )}
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex items-center gap-2 text-sm">
                  <ArrowRight size={13} />
                  Siguiente
                </button>
                <button type="button" onClick={handleClose} className="btn-ghost text-sm">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Review + re-prompt */}
          {formStep === 2 && (
            <div className="flex flex-col gap-4">
              {/* Preview card */}
              <div className="bg-surface-3 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORIA_COLORS[categoria]}`}>
                    {CATEGORIA_LABELS[categoria]}
                  </span>
                  {esAnonima && (
                    <span className="text-xs px-2 py-0.5 rounded-full border bg-slate-500/15 text-slate-400 border-slate-500/25">
                      Anónimo
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{titulo}</h3>
                <p className="text-sm text-slate-400">{descripcion}</p>
              </div>

              {/* Re-prompt question */}
              <div className="bg-amber-500/8 border border-amber-500/25 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-300 mb-1">
                  Antes de enviar: ¿Podría esta idea implementarse sin implicancias presupuestarias para la empresa?
                </p>
                <p className="text-xs text-amber-400/80">
                  Las ideas que no requieren inversión tienen más chances de ser implementadas rápidamente. Si tu idea implica comprar algo, contratar, o un gasto adicional, considerá reformularla.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReformulate}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/15 transition-colors"
                >
                  <RefreshCw size={14} />
                  Reformular sin costo
                </button>
                <button
                  type="button"
                  onClick={handleSendAnyway}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  Enviar igual
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters (admin only) */}
      {isAdmin && (
        <div className="flex gap-3 mb-4">
          <select
            className="input text-sm py-1.5 w-auto"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value as Estado | 'todas')}
          >
            <option value="todas">Todos los estados</option>
            {(Object.keys(ESTADO_LABELS) as Estado[]).map((k) => (
              <option key={k} value={k}>{ESTADO_LABELS[k]}</option>
            ))}
          </select>
          <select
            className="input text-sm py-1.5 w-auto"
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value as Categoria | 'todas')}
          >
            <option value="todas">Todas las categorías</option>
            {(Object.keys(CATEGORIA_LABELS) as Categoria[]).map((k) => (
              <option key={k} value={k}>{CATEGORIA_LABELS[k]}</option>
            ))}
          </select>
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-3">
        {suggestions.length === 0 && (
          <p className="text-slate-500 text-sm">No hay sugerencias para mostrar.</p>
        )}
        {suggestions.map((s) => (
          <div key={s.id} className="card">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORIA_COLORS[s.categoria]}`}>
                  {CATEGORIA_LABELS[s.categoria]}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ESTADO_COLORS[s.estado]}`}>
                  {ESTADO_LABELS[s.estado]}
                </span>
              </div>
              {isAdmin && (
                <select
                  className="input text-xs py-1 w-auto"
                  value={s.estado}
                  onChange={() => {}}
                >
                  {(Object.keys(ESTADO_LABELS) as Estado[]).map((k) => (
                    <option key={k} value={k}>{ESTADO_LABELS[k]}</option>
                  ))}
                </select>
              )}
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">{s.titulo}</h3>
            <p className="text-sm text-slate-400 line-clamp-2 mb-3">{s.descripcion}</p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {s.es_anonima ? 'Anónimo' : `${s.autor_nombre}${s.area_nombre ? ` · ${s.area_nombre}` : ''}`}
              </span>
              <span>{formatDate(s.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
