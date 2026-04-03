import { useState } from 'react'
import {
  User, Briefcase, FileText, DollarSign, GraduationCap,
  CheckCircle, Clock, Download, ExternalLink, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useRole } from '../../hooks/useRole'

// ─── Datos demo del manager (Eliseo Tapia) ────────────────────────────────────

const DEMO_PERSONAL = {
  nombre: 'Eliseo',
  apellido: 'Tapia',
  email: 'e.tapia@latinsecurities.ar',
  cuil: '20-32145678-9',
  fecha_nacimiento: '1988-06-14',
  domicilio: 'Av. Corrientes 2140, CABA',
  telefono: '+54 11 5555-7890',
}

const DEMO_LABORAL = {
  puesto: 'Jefe de Banca Privada',
  area: 'Banca Privada',
  fecha_ingreso: '2019-04-01',
  modalidad: 'Full-time presencial',
  sede: 'Casa Central — Maipú 267, CABA',
  legajo_id: '1042',
  estado: 'activo' as const,
}

const DEMO_DOCUMENTOS = [
  { id: 'd1', tipo: 'Contrato de trabajo', fecha: '2019-04-01', estado: 'firmado' as const, url: '#' },
  { id: 'd2', tipo: 'Adenda salarial — Ago 2023', fecha: '2023-08-01', estado: 'firmado' as const, url: '#' },
  { id: 'd3', tipo: 'Adenda salarial — Ene 2025', fecha: '2025-01-15', estado: 'firmado' as const, url: '#' },
  { id: 'd4', tipo: 'Acuerdo de confidencialidad', fecha: '2019-04-01', estado: 'firmado' as const, url: '#' },
  { id: 'd5', tipo: 'Política de uso de datos', fecha: '2024-03-10', estado: 'pendiente_firma' as const, url: '#' },
]

const DEMO_RECIBOS = [
  { id: 'r1', periodo: 'Marzo 2026', monto: '$ 4.250.000', fecha: '2026-03-25', url: '#' },
  { id: 'r2', periodo: 'Febrero 2026', monto: '$ 4.250.000', fecha: '2026-02-25', url: '#' },
  { id: 'r3', periodo: 'Enero 2026', monto: '$ 4.250.000', fecha: '2026-01-25', url: '#' },
  { id: 'r4', periodo: 'Diciembre 2025', monto: '$ 3.800.000', fecha: '2025-12-26', url: '#' },
  { id: 'r5', periodo: 'Noviembre 2025', monto: '$ 3.800.000', fecha: '2025-11-25', url: '#' },
]

const DEMO_FORMACION = [
  { id: 'f1', titulo: 'CFA Level I', institución: 'CFA Institute', año: '2022', estado: 'aprobado' as const },
  { id: 'f2', titulo: 'Gestión de Patrimonio Privado', institución: 'IAE Business School', año: '2021', estado: 'aprobado' as const },
  { id: 'f3', titulo: 'Compliance & Lavado de Activos', institución: 'CNV — Comisión Nacional de Valores', año: '2023', estado: 'aprobado' as const },
  { id: 'f4', titulo: 'Liderazgo de Equipos de Alto Rendimiento', institución: 'Latin Securities — Interno', año: '2024', estado: 'aprobado' as const },
]

// ─── Componente ───────────────────────────────────────────────────────────────

export function MiLegajoPage() {
  const { user } = useRole()
  const [openSection, setOpenSection] = useState<string | null>('laboral')

  const toggleSection = (id: string) =>
    setOpenSection((prev) => (prev === id ? null : id))

  const initials = `${DEMO_PERSONAL.nombre[0]}${DEMO_PERSONAL.apellido[0]}`

  const pendientes = DEMO_DOCUMENTOS.filter((d) => d.estado === 'pendiente_firma').length

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Mi Legajo</h1>
        <p className="text-slate-400 text-sm mt-1">
          Tu expediente laboral digital — vinculado con Tu Legajo #{DEMO_LABORAL.legajo_id}
        </p>
      </div>

      {/* Profile card */}
      <div className="card flex items-center gap-5 mb-5">
        <div className="w-14 h-14 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-brand-500">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-base">
            {DEMO_PERSONAL.nombre} {DEMO_PERSONAL.apellido}
          </p>
          <p className="text-slate-400 text-sm">{DEMO_LABORAL.puesto} · {DEMO_LABORAL.area}</p>
          <p className="text-slate-500 text-xs mt-0.5">{DEMO_PERSONAL.email}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="badge-active">Activo</span>
          <span className="text-xs text-slate-500">Legajo #{DEMO_LABORAL.legajo_id}</span>
        </div>
      </div>

      {/* Alerta firma pendiente */}
      {pendientes > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-5 flex items-center gap-3">
          <Clock size={16} className="text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">
            Tenés {pendientes} documento{pendientes > 1 ? 's' : ''} pendiente{pendientes > 1 ? 's' : ''} de firma
          </p>
          <button
            onClick={() => setOpenSection('documentos')}
            className="ml-auto text-xs text-amber-400 hover:text-amber-300 font-medium whitespace-nowrap"
          >
            Ver documentos →
          </button>
        </div>
      )}

      {/* Secciones acordeón */}
      <div className="flex flex-col gap-3">

        {/* Datos laborales */}
        <Section
          id="laboral"
          icon={<Briefcase size={16} className="text-brand-500" />}
          title="Datos laborales"
          open={openSection === 'laboral'}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <Field label="Puesto" value={DEMO_LABORAL.puesto} />
            <Field label="Área" value={DEMO_LABORAL.area} />
            <Field label="Fecha de ingreso" value={new Date(DEMO_LABORAL.fecha_ingreso).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })} />
            <Field label="Modalidad" value={DEMO_LABORAL.modalidad} />
            <Field label="Sede" value={DEMO_LABORAL.sede} className="col-span-2" />
          </div>
        </Section>

        {/* Datos personales */}
        <Section
          id="personal"
          icon={<User size={16} className="text-slate-400" />}
          title="Datos personales"
          open={openSection === 'personal'}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <Field label="CUIL" value={DEMO_PERSONAL.cuil} />
            <Field label="Fecha de nacimiento" value={new Date(DEMO_PERSONAL.fecha_nacimiento).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })} />
            <Field label="Teléfono" value={DEMO_PERSONAL.telefono} />
            <Field label="Domicilio" value={DEMO_PERSONAL.domicilio} />
          </div>
        </Section>

        {/* Documentos */}
        <Section
          id="documentos"
          icon={<FileText size={16} className="text-slate-400" />}
          title="Documentos laborales"
          badge={pendientes > 0 ? `${pendientes} pendiente${pendientes > 1 ? 's' : ''}` : undefined}
          open={openSection === 'documentos'}
          onToggle={toggleSection}
        >
          <div className="flex flex-col divide-y divide-white/5 -mx-5">
            {DEMO_DOCUMENTOS.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{doc.tipo}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(doc.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {doc.estado === 'firmado' ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle size={12} />
                    Firmado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                    <Clock size={12} />
                    Pendiente de firma
                  </span>
                )}
                <a
                  href={doc.url}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                  title="Ver documento"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        </Section>

        {/* Recibos de sueldo */}
        <Section
          id="recibos"
          icon={<DollarSign size={16} className="text-emerald-400" />}
          title="Recibos de sueldo"
          open={openSection === 'recibos'}
          onToggle={toggleSection}
        >
          <div className="flex flex-col divide-y divide-white/5 -mx-5">
            {DEMO_RECIBOS.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{r.periodo}</p>
                  <p className="text-xs text-slate-500">Acreditado el {new Date(r.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className="text-sm font-semibold text-slate-300">{r.monto}</span>
                <a
                  href={r.url}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                  title="Descargar recibo"
                >
                  <Download size={14} />
                </a>
              </div>
            ))}
          </div>
        </Section>

        {/* Formación */}
        <Section
          id="formacion"
          icon={<GraduationCap size={16} className="text-violet-400" />}
          title="Formación y certificaciones"
          open={openSection === 'formacion'}
          onToggle={toggleSection}
        >
          <div className="flex flex-col gap-3">
            {DEMO_FORMACION.map((f) => (
              <div key={f.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
                  <GraduationCap size={14} className="text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{f.titulo}</p>
                  <p className="text-xs text-slate-500">{f.institución} · {f.año}</p>
                </div>
                <CheckCircle size={14} className="text-emerald-400 shrink-0" />
              </div>
            ))}
          </div>
        </Section>

      </div>

      {/* Footer: link a Tu Legajo */}
      <div className="mt-6 flex items-center justify-between card">
        <div>
          <p className="text-sm text-white font-medium">Tu Legajo</p>
          <p className="text-xs text-slate-500 mt-0.5">Plataforma externa de gestión de legajos</p>
        </div>
        <a
          href="#"
          className="btn-ghost flex items-center gap-2 text-sm"
        >
          <ExternalLink size={14} />
          Abrir Tu Legajo
        </a>
      </div>
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Section({
  id, icon, title, badge, open, onToggle, children,
}: {
  id: string
  icon: React.ReactNode
  title: string
  badge?: string
  open: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="card p-0 overflow-hidden">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/3 transition-colors"
      >
        {icon}
        <span className="flex-1 text-sm font-medium text-white">{title}</span>
        {badge && (
          <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full mr-2">
            {badge}
          </span>
        )}
        {open ? (
          <ChevronUp size={15} className="text-slate-500" />
        ) : (
          <ChevronDown size={15} className="text-slate-500" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-white/5">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm text-white">{value}</p>
    </div>
  )
}
