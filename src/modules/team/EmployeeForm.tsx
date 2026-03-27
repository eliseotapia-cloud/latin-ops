import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useRole } from '../../hooks/useRole'
import type { Area } from '../../types'

export function EmployeeForm() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { isAdmin, areaId } = useRole()
  const isEditing = Boolean(id)

  const [areas, setAreas] = useState<Area[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email_corporativo: '',
    area_id: areaId ?? '',
    puesto: '',
    fecha_ingreso: '',
    estado: 'activo',
    legajo_externo_id: '',
  })

  const basePath = isAdmin ? '/equipo' : '/mi-equipo'

  useEffect(() => {
    if (isAdmin) {
      supabase.from('areas').select('*').order('nombre').then(({ data }) => setAreas(data ?? []))
    }
    if (isEditing && id) {
      supabase.from('empleados').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          setForm({
            nombre: data.nombre,
            apellido: data.apellido,
            email_corporativo: data.email_corporativo,
            area_id: data.area_id,
            puesto: data.puesto,
            fecha_ingreso: data.fecha_ingreso,
            estado: data.estado,
            legajo_externo_id: data.legajo_externo_id ?? '',
          })
        }
      })
    }
  }, [id])

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const payload = {
      ...form,
      legajo_externo_id: form.legajo_externo_id || null,
      area_id: isAdmin ? form.area_id : areaId,
    }

    const { error: err } = isEditing
      ? await supabase.from('empleados').update(payload).eq('id', id!)
      : await supabase.from('empleados').insert(payload)

    if (err) {
      setError('Error al guardar. Verificá los datos.')
    } else {
      navigate(basePath)
    }
    setSaving(false)
  }

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => navigate(basePath)} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={16} />
        Volver
      </button>

      <h1 className="text-xl font-semibold text-white mb-6">
        {isEditing ? 'Editar empleado' : 'Nuevo empleado'}
      </h1>

      <form onSubmit={handleSubmit} className="card flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Nombre *</label>
            <input className="input" required value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Apellido *</label>
            <input className="input" required value={form.apellido} onChange={(e) => set('apellido', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1.5">Email corporativo *</label>
          <input className="input" type="email" required value={form.email_corporativo} onChange={(e) => set('email_corporativo', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Puesto *</label>
            <input className="input" required value={form.puesto} onChange={(e) => set('puesto', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Fecha de ingreso *</label>
            <input className="input" type="date" required value={form.fecha_ingreso} onChange={(e) => set('fecha_ingreso', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {isAdmin && (
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Área *</label>
              <select className="input" required value={form.area_id} onChange={(e) => set('area_id', e.target.value)}>
                <option value="">Seleccionar área</option>
                {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Estado</label>
            <select className="input" value={form.estado} onChange={(e) => set('estado', e.target.value)}>
              <option value="activo">Activo</option>
              <option value="baja">Baja</option>
              <option value="licencia">Licencia</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1.5">ID Legajo externo (Mi Legajo)</label>
          <input className="input" placeholder="Ej: 4821" value={form.legajo_externo_id} onChange={(e) => set('legajo_externo_id', e.target.value)} />
          <p className="text-xs text-slate-500 mt-1">Podés vincularlo después desde Mi Legajo.</p>
        </div>

        {error && (
          <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            <Save size={14} />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" onClick={() => navigate(basePath)} className="btn-ghost">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
