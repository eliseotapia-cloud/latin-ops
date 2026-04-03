import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useDemoData } from '../../demo/demoData'

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const formatARS = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

function buildChartData(salaries: { monto_bruto: number; fecha_desde: string }[]) {
  return salaries.map((s) => {
    const d = new Date(s.fecha_desde + 'T00:00:00')
    const mesLabel = `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
    return { mes: mesLabel, monto: s.monto_bruto }
  })
}

function formatPeriodo(fechaDesde: string) {
  const d = new Date(fechaDesde + 'T00:00:00')
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

export function SalaryHistoryPage() {
  const demo = useDemoData()
  const [showAmounts, setShowAmounts] = useState(false)

  if (!demo) return null

  const salaries = demo.salaryHistory
  const chartData = buildChartData(salaries)

  const montos = chartData.map((d) => d.monto)
  const minMonto = Math.min(...montos)
  const maxMonto = Math.max(...montos)
  const range = maxMonto - minMonto
  const yMin = Math.max(0, Math.round(minMonto - range * 0.5))
  const yMax = maxMonto

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Sueldo</h1>
          <p className="text-slate-400 text-sm mt-1">Evolución salarial — últimos {salaries.length} meses</p>
        </div>
        <button
          onClick={() => setShowAmounts((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-3 border border-white/10 text-xs text-slate-400 hover:text-white hover:border-white/25 transition-colors"
        >
          {showAmounts ? <EyeOff size={13} /> : <Eye size={13} />}
          {showAmounts ? 'Ocultar montos' : 'Mostrar montos'}
        </button>
      </div>

      {/* Chart */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-white mb-4">Evolución salarial</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="salGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => showAmounts ? `$${(v / 1_000_000).toFixed(1)}M` : '••••'}
              domain={[yMin, yMax]}
            />
            {showAmounts && (
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0', fontSize: 12 }}
                formatter={(value) => [formatARS(value as number), 'Monto bruto']}
              />
            )}
            <Area
              type="monotone"
              dataKey="monto"
              stroke="#34d399"
              strokeWidth={2}
              fill="url(#salGradient)"
              dot={{ fill: '#34d399', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#34d399' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Historial detallado</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-white/5">
              <th className="pb-2 text-xs text-slate-400 font-medium">Período</th>
              <th className="pb-2 text-xs text-slate-400 font-medium">Monto Bruto</th>
              <th className="pb-2 text-xs text-slate-400 font-medium">Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[...salaries].reverse().map((s) => (
              <tr key={s.id}>
                <td className="py-3 text-white">{formatPeriodo(s.fecha_desde)}</td>
                <td className="py-3 text-emerald-400 font-medium">
                  {showAmounts ? formatARS(s.monto_bruto) : <span className="text-slate-600 tracking-widest">••••••••</span>}
                </td>
                <td className="py-3 text-slate-400">{s.motivo_cambio ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
