import { useEffect, useState } from 'react'
import { Link2, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useRole } from '../../hooks/useRole'
import type { Employee } from '../../types'

export function MiLegajoPage() {
  const { areaId } = useRole()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [legajoInput, setLegajoInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (areaId) loadData()
  }, [areaId])

  async function loadData() {
    setLoading(true)
    const { data } = await supabase
      .from('empleados')
      .select('*')
      .eq('area_id', areaId!)
      .eq('estado', 'activo')
      .order('apellido')
    setEmployees(data ?? [])
    setLoading(false)
  }

  async function saveLink(empId: string) {
    if (!legajoInput.trim()) return
    setSaving(true)

    // En producción: llamar a Mi Legajo API para validar el ID
    // const valid = await validateLegajoId(legajoInput)

    const { error } = await supabase
      .from('empleados')
      .update({ legajo_externo_id: legajoInput.trim(), legajo_sincronizado: true })
      .eq('id', empId)

    if (!error) {
      setEmployees((prev) =>
        prev.map((e) => e.id === empId ? { ...e, legajo_externo_id: legajoInput, legajo_sincronizado: true } : e)
      )
      setEditingId(null)
      setLegajoInput('')
    }
    setSaving(false)
  }

  const linked = employees.filter((e) => e.legajo_sincronizado)
  const unlinked = employees.filter((e) => !e.legajo_sincronizado)

  if (loading) return <Loader />

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Mi Legajo</h1>
        <p className="text-slate-400 text-sm mt-1">
          Vinculá a cada miembro de tu equipo con su legajo externo.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <span className="text-xs text-slate-400">Vinculados</span>
          </div>
          <p className="text-2xl font-semibold text-white">{linked.length}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-400" />
            <span className="text-xs text-slate-400">Sin vincular</span>
          </div>
          <p className="text-2xl font-semibold text-white">{unlinked.length}</p>
        </div>
      </div>

      {/* Sin vincular */}
      {unlinked.length > 0 && (
        <div className="card mb-4">
          <h2 className="text-sm font-semibold text-amber-400 mb-4">Sin vincular</h2>
          <div className="flex flex-col divide-y divide-white/5">
            {unlinked.map((emp) => (
              <div key={emp.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{emp.nombre} {emp.apellido}</p>
                    <p className="text-xs text-slate-500">{emp.puesto}</p>
                  </div>
                  {editingId !== emp.id && (
                    <button
                      onClick={() => { setEditingId(emp.id); setLegajoInput('') }}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
                    >
                      <Link2 size={13} />
                      Vincular
                    </button>
                  )}
                </div>
                {editingId === emp.id && (
                  <div className="flex gap-2 mt-3">
                    <input
                      className="input"
                      placeholder="ID de legajo (ej: 4821)"
                      value={legajoInput}
                      onChange={(e) => setLegajoInput(e.target.value)}
                      autoFocus
                    />
                    <button onClick={() => saveLink(emp.id)} className="btn-primary px-4" disabled={saving}>
                      {saving ? '...' : 'Guardar'}
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-ghost">Cancelar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vinculados */}
      {linked.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-emerald-400 mb-4">Vinculados</h2>
          <div className="flex flex-col divide-y divide-white/5">
            {linked.map((emp) => (
              <div key={emp.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-white">{emp.nombre} {emp.apellido}</p>
                  <p className="text-xs text-slate-500">{emp.puesto}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle size={12} />
                    Legajo #{emp.legajo_externo_id}
                  </span>
                  <button
                    onClick={() => { setEditingId(emp.id); setLegajoInput(emp.legajo_externo_id ?? '') }}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {employees.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-slate-500 text-sm">No hay empleados en tu equipo aún.</p>
        </div>
      )}
    </div>
  )
}

function Loader() {
  return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
