import { useEffect, useState } from 'react'
import { Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { AreaCostSummary } from '../../types'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

export function AdminDashboard() {
  const [stats, setStats] = useState({ empleados: 0, masaSalarial: 0, scorePromedio: 0 })
  const [areas, setAreas] = useState<AreaCostSummary[]>([])
  const [topPerformers, setTopPerformers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const monthName = MONTHS[now.getMonth()]
  const year = now.getFullYear()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      // Empleados activos
      const { count: empCount } = await supabase
        .from('empleados')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'activo')

      // Masa salarial (sueldos vigentes)
      const { data: salaries } = await supabase
        .from('sueldos')
        .select('monto_bruto, empleado_id')
        .is('fecha_hasta', null)

      const masaSalarial = salaries?.reduce((s, r) => s + r.monto_bruto, 0) ?? 0

      // Score promedio del mes
      const { data: evals } = await supabase
        .from('evaluaciones')
        .select('score_general')
        .eq('periodo_mes', now.getMonth() + 1)
        .eq('periodo_anio', year)

      const scores = evals?.map((e) => e.score_general) ?? []
      const scorePromedio = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

      setStats({ empleados: empCount ?? 0, masaSalarial, scorePromedio })

      // Costos por área
      const { data: areasData } = await supabase
        .from('areas')
        .select(`
          id, nombre,
          empleados(id, estado, sueldos(monto_bruto, fecha_hasta))
        `)

      if (areasData) {
        const summary: AreaCostSummary[] = areasData.map((a: any) => {
          const activos = a.empleados.filter((e: any) => e.estado === 'activo')
          const masa = activos.reduce((sum: number, e: any) => {
            const vigente = e.sueldos?.find((s: any) => !s.fecha_hasta)
            return sum + (vigente?.monto_bruto ?? 0)
          }, 0)
          return {
            area_id: a.id,
            area_nombre: a.nombre,
            cantidad_empleados: activos.length,
            masa_salarial: masa,
            score_promedio: null,
          }
        }).sort((a, b) => b.masa_salarial - a.masa_salarial)
        setAreas(summary)
      }

      // Top performers del mes
      const { data: topData } = await supabase
        .from('evaluaciones')
        .select('score_general, empleados(nombre, apellido, puesto, areas(nombre))')
        .eq('periodo_mes', now.getMonth() + 1)
        .eq('periodo_anio', year)
        .order('score_general', { ascending: false })
        .limit(5)

      setTopPerformers(topData ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const maxMasa = Math.max(...areas.map((a) => a.masa_salarial), 1)

  if (loading) return <PageLoader />

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">{monthName} {year} — Vista ejecutiva</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<Users size={18} className="text-brand-500" />}
          label="Empleados activos"
          value={stats.empleados.toString()}
        />
        <StatCard
          icon={<DollarSign size={18} className="text-emerald-400" />}
          label="Masa salarial bruta"
          value={formatCurrency(stats.masaSalarial)}
          sub="Sueldos vigentes"
        />
        <StatCard
          icon={<TrendingUp size={18} className="text-violet-400" />}
          label="Performance promedio"
          value={stats.scorePromedio ? `${stats.scorePromedio.toFixed(1)} / 5` : '—'}
          sub={`${MONTHS[now.getMonth()]} ${year}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Costos por área */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Costos por área</h2>
            <span className="text-xs text-slate-500">Masa salarial vigente</span>
          </div>
          {areas.length === 0 ? (
            <EmptyState text="Sin datos de áreas" />
          ) : (
            <div className="flex flex-col gap-3">
              {areas.map((a) => (
                <div key={a.area_id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{a.area_nombre}</span>
                    <span className="text-sm text-slate-300">{formatCurrency(a.masa_salarial)}</span>
                  </div>
                  <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${(a.masa_salarial / maxMasa) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{a.cantidad_empleados} empleados</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top performers */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Top Performance</h2>
            <span className="text-xs text-slate-500">{MONTHS[now.getMonth()]} {year}</span>
          </div>
          {topPerformers.length === 0 ? (
            <EmptyState text="Sin evaluaciones este mes" />
          ) : (
            <div className="flex flex-col gap-3">
              {topPerformers.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {t.empleados?.nombre} {t.empleados?.apellido}
                    </p>
                    <p className="text-xs text-slate-500">{t.empleados?.areas?.nombre}</p>
                  </div>
                  <ScoreBadge score={t.score_general} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 4.5 ? 'text-emerald-400' : score >= 3.5 ? 'text-amber-400' : 'text-red-400'
  return <span className={`text-sm font-semibold ${color}`}>{score.toFixed(1)}</span>
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
      <AlertCircle size={16} />
      {text}
    </div>
  )
}

function PageLoader() {
  return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
