import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Edit2 } from 'lucide-react'
import { useDemoData } from '../../demo/demoData'

function enpsColor(v: number) {
  if (v >= 9) return 'text-emerald-400'
  if (v >= 7) return 'text-sky-400'
  return 'text-amber-400'
}

function enpsLabel(v: number) {
  if (v >= 9) return 'Promotor'
  if (v >= 7) return 'Pasivo'
  return 'Detractor'
}

function enpsDesc(v: number) {
  if (v >= 9) return 'Sos embajador de Latin. Tu experiencia es excelente.'
  if (v >= 7) return 'Estás satisfecho con Latin pero aún hay espacio para mejorar tu experiencia.'
  return 'Hay aspectos importantes que afectan tu experiencia en Latin.'
}

function metricBar(value: number, max = 5) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-sky-400 rounded-full transition-all"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-white w-8 text-right">{value}/{max}</span>
    </div>
  )
}

export function WellbeingPage() {
  const navigate = useNavigate()
  const demo = useDemoData()
  const [showForm, setShowForm] = useState(false)
  const [enps, setEnps] = useState<number | null>(null)
  const [energia, setEnergia] = useState(0)
  const [motivacion, setMotivacion] = useState(0)
  const [cargaLaboral, setCargaLaboral] = useState(0)
  const [comentario, setComentario] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!demo) return null

  const wb = demo.wellbeing

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (enps === null || energia === 0 || motivacion === 0 || cargaLaboral === 0) {
      setError('Completá todos los campos.')
      return
    }
    navigate('/mi-bienestar')
  }

  if (!showForm && wb) {
    return (
      <div className="p-6 max-w-2xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-white">Mi Bienestar</h1>
            <p className="text-slate-400 text-sm mt-1">Pulso del mes</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-ghost flex items-center gap-2 text-xs">
            <Edit2 size={13} />
            Actualizar
          </button>
        </div>

        {/* eNPS */}
        <div className="card mb-4">
          <p className="text-xs text-slate-400 mb-1">Tu eNPS</p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-4xl font-bold ${enpsColor(wb.enps)}`}>{wb.enps}</span>
            <span className="text-slate-500 text-lg">/10</span>
            <span className={`text-sm font-medium ml-2 ${enpsColor(wb.enps)}`}>{enpsLabel(wb.enps)}</span>
          </div>
          <p className="text-sm text-slate-400">{enpsDesc(wb.enps)}</p>
        </div>

        {/* Metrics */}
        <div className="card mb-4 flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm text-white">Energía</p>
            </div>
            {metricBar(wb.energia)}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm text-white">Motivación</p>
            </div>
            {metricBar(wb.motivacion)}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm text-white">Carga laboral</p>
              {wb.carga_laboral <= 3 && (
                <span className="text-xs text-amber-400 font-medium">Alta carga</span>
              )}
            </div>
            {metricBar(wb.carga_laboral)}
          </div>
        </div>

        {/* Comentario */}
        {wb.comentario && (
          <div className="card border-l-2 border-sky-500/40 bg-sky-500/5">
            <p className="text-sm text-slate-300 italic">"{wb.comentario}"</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        {wb && (
          <button onClick={() => { setShowForm(false); setError(null) }} className="text-slate-400 hover:text-white text-sm transition-colors">
            ← Volver
          </button>
        )}
        <div>
          <h1 className="text-xl font-semibold text-white">Mi Bienestar</h1>
          <p className="text-slate-400 text-sm mt-1">¿Cómo estás este mes?</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* eNPS */}
        <div className="card">
          <p className="text-sm font-medium text-white mb-1">¿Recomendarías trabajar en Latin? (0-10)</p>
          <p className="text-xs text-slate-500 mb-3">0 = Para nada, 10 = Totalmente</p>
          <div className="flex gap-1.5 flex-wrap">
            {[0,1,2,3,4,5,6,7,8,9,10].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setEnps(n)}
                className={`w-9 h-9 rounded-lg text-sm font-medium border transition-all ${
                  enps === n
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'bg-surface-3 border-white/10 text-slate-400 hover:border-brand-500/50 hover:text-white'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="card flex flex-col gap-5">
          {[
            { label: 'Energía', leftLabel: 'Agotado', rightLabel: 'Con energía', val: energia, set: setEnergia },
            { label: 'Motivación', leftLabel: 'Desmotivado', rightLabel: 'Muy motivado', val: motivacion, set: setMotivacion },
            { label: 'Carga laboral', leftLabel: 'Muy alta', rightLabel: 'Equilibrada', val: cargaLaboral, set: setCargaLaboral },
          ].map(({ label, leftLabel, rightLabel, val, set }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white">{label}</p>
                <span className="text-xs text-slate-500">{leftLabel} → {rightLabel}</span>
              </div>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set(n)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      val === n
                        ? 'bg-brand-500 border-brand-500 text-white'
                        : 'bg-surface-3 border-white/10 text-slate-400 hover:border-brand-500/50 hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <label className="text-xs font-medium text-slate-400 block mb-2">Comentario (opcional)</label>
          <textarea
            className="input resize-none h-24"
            placeholder="¿Querés agregar algo más?"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save size={14} />
            Guardar
          </button>
          {wb && (
            <button type="button" onClick={() => { setShowForm(false); setError(null) }} className="btn-ghost">
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
