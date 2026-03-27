import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useRole } from '../../hooks/useRole'
import type { Employee, Area } from '../../types'

export function TeamPage() {
  const { isAdmin, areaId } = useRole()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [search, setSearch] = useState('')
  const [filterArea, setFilterArea] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('activo')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    let query = supabase
      .from('empleados')
      .select('*, areas(id, nombre)')
      .order('apellido')

    if (!isAdmin) query = query.eq('area_id', areaId!)

    const { data } = await query
    setEmployees((data as any) ?? [])

    if (isAdmin) {
      const { data: areasData } = await supabase.from('areas').select('*').order('nombre')
      setAreas(areasData ?? [])
    }
    setLoading(false)
  }

  const filtered = employees.filter((e) => {
    const matchSearch = `${e.nombre} ${e.apellido} ${e.puesto}`.toLowerCase().includes(search.toLowerCase())
    const matchArea = filterArea === 'all' || e.area_id === filterArea
    const matchStatus = filterStatus === 'all' || e.estado === filterStatus
    return matchSearch && matchArea && matchStatus
  })

  const basePath = isAdmin ? '/equipo' : '/mi-equipo'

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">{isAdmin ? 'Equipo' : 'Mi Equipo'}</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} empleados</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link to="/equipo/importar" className="btn-ghost flex items-center gap-2 border border-white/10">
              <Upload size={16} />
              Importar CSV
            </Link>
          )}
          <Link to={`${basePath}/nuevo`} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Nuevo empleado
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-8"
            placeholder="Buscar por nombre o puesto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isAdmin && (
          <select
            className="input w-auto"
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
          >
            <option value="all">Todas las áreas</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        )}

        <select
          className="input w-auto"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="baja">Baja</option>
          <option value="licencia">Licencia</option>
        </select>
      </div>

      {/* Tabla */}
      {loading ? (
        <Loader />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Empleado</th>
                <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Puesto</th>
                {isAdmin && <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Área</th>}
                <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Ingreso</th>
                <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Estado</th>
                <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Legajo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3">
                    <Link to={`${basePath}/${emp.id}`} className="flex items-center gap-2.5 group">
                      <Avatar name={`${emp.nombre} ${emp.apellido}`} />
                      <div>
                        <p className="text-sm text-white group-hover:text-brand-500 transition-colors">
                          {emp.nombre} {emp.apellido}
                        </p>
                        <p className="text-xs text-slate-500">{emp.email_corporativo}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-300">{emp.puesto}</td>
                  {isAdmin && <td className="px-5 py-3 text-sm text-slate-300">{(emp as any).areas?.nombre}</td>}
                  <td className="px-5 py-3 text-sm text-slate-400">
                    {new Date(emp.fecha_ingreso).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={emp.estado} /></td>
                  <td className="px-5 py-3">
                    {emp.legajo_sincronizado ? (
                      <span className="text-xs text-emerald-400">✓ Vinculado</span>
                    ) : (
                      <span className="text-xs text-slate-500">Sin vincular</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500 text-sm">
                    No se encontraron empleados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map((n) => n[0]).join('')
  return (
    <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0">
      <span className="text-xs font-medium text-brand-500">{initials.toUpperCase()}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { activo: 'badge-active', baja: 'badge-inactive', licencia: 'badge-leave' }
  const labels: Record<string, string> = { activo: 'Activo', baja: 'Baja', licencia: 'Licencia' }
  return <span className={map[status] ?? ''}>{labels[status] ?? status}</span>
}

function Loader() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
