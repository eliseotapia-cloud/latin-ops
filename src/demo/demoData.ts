import { createContext, useContext } from 'react'
import type {
  Employee, Area, AreaCostSummary, Evaluation, Salary, SelfEvaluation,
  Wellbeing, Suggestion, Leave, Comunicacion, OnboardingItem, OnboardingAsignacion,
} from '../types'
import { calcResult } from '../types'

export const DEMO_AREA_ID = 'ba0ca001-0000-4000-8000-000000000001'

const ANIO = new Date().getFullYear()

type DemoEmployee = Employee & { areas: { id: string; nombre: string } }

// ─── Empleados por área ────────────────────────────────────────────────────

const BP: DemoEmployee[] = [
  { id: 'demo-emp-001', nombre: 'Pablo',     apellido: 'Rodríguez', email_corporativo: 'p.rodriguez@latinsecurities.ar', area_id: DEMO_AREA_ID, puesto: 'Relationship Manager Sr.', fecha_ingreso: '2021-03-15', fecha_nacimiento: '1995-03-15', estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2021-03-15T00:00:00Z', areas: { id: DEMO_AREA_ID, nombre: 'Banca Privada' } },
  { id: 'demo-emp-002', nombre: 'Valentina', apellido: 'Gómez',     email_corporativo: 'v.gomez@latinsecurities.ar',     area_id: DEMO_AREA_ID, puesto: 'Analista de Inversiones',    fecha_ingreso: '2022-07-01', fecha_nacimiento: '1994-07-22', estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2022-07-01T00:00:00Z', areas: { id: DEMO_AREA_ID, nombre: 'Banca Privada' } },
  { id: 'demo-emp-003', nombre: 'Matías',    apellido: 'Ferreyra',  email_corporativo: 'm.ferreyra@latinsecurities.ar',  area_id: DEMO_AREA_ID, puesto: 'Relationship Manager',     fecha_ingreso: '2022-11-14', fecha_nacimiento: '1990-11-14', estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2022-11-14T00:00:00Z', areas: { id: DEMO_AREA_ID, nombre: 'Banca Privada' } },
  { id: 'demo-emp-004', nombre: 'Carolina',  apellido: 'Herrera',   email_corporativo: 'c.herrera@latinsecurities.ar',   area_id: DEMO_AREA_ID, puesto: 'Ejecutiva de Cuentas',     fecha_ingreso: '2023-02-20', fecha_nacimiento: '1993-02-20', estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2023-02-20T00:00:00Z', areas: { id: DEMO_AREA_ID, nombre: 'Banca Privada' } },
  { id: 'demo-emp-005', nombre: 'Nicolás',   apellido: 'Paz',       email_corporativo: 'n.paz@latinsecurities.ar',       area_id: DEMO_AREA_ID, puesto: 'Analista Jr.',             fecha_ingreso: '2024-01-08', fecha_nacimiento: '1999-03-27', estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2024-01-08T00:00:00Z', areas: { id: DEMO_AREA_ID, nombre: 'Banca Privada' } },
  { id: 'demo-emp-006', nombre: 'Lucía',     apellido: 'Morales',   email_corporativo: 'l.morales@latinsecurities.ar',   area_id: DEMO_AREA_ID, puesto: 'Coordinadora de Operaciones', fecha_ingreso: '2023-08-03', fecha_nacimiento: '1992-08-03', estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2023-08-03T00:00:00Z', areas: { id: DEMO_AREA_ID, nombre: 'Banca Privada' } },
]

const TRADING: DemoEmployee[] = [
  { id: 'demo-emp-101', nombre: 'Santiago', apellido: 'Albornoz', email_corporativo: 's.albornoz@latinsecurities.ar', area_id: 'a2', puesto: 'Trader Sr.',            fecha_ingreso: '2020-05-10', fecha_nacimiento: '1988-05-10', estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2020-05-10T00:00:00Z', areas: { id: 'a2', nombre: 'Trading' } },
  { id: 'demo-emp-102', nombre: 'Florencia', apellido: 'Ríos',    email_corporativo: 'f.rios@latinsecurities.ar',     area_id: 'a2', puesto: 'Trader Jr.',            fecha_ingreso: '2023-04-01', fecha_nacimiento: '1997-03-21', estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2023-04-01T00:00:00Z', areas: { id: 'a2', nombre: 'Trading' } },
  { id: 'demo-emp-103', nombre: 'Martín',    apellido: 'Vega',     email_corporativo: 'm.vega@latinsecurities.ar',     area_id: 'a2', puesto: 'Analista de Mercados', fecha_ingreso: '2022-09-12', fecha_nacimiento: '1991-09-12', estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2022-09-12T00:00:00Z', areas: { id: 'a2', nombre: 'Trading' } },
]

const WM: DemoEmployee[] = [
  { id: 'demo-emp-201', nombre: 'Jorge',   apellido: 'Petersen', email_corporativo: 'j.petersen@latinsecurities.ar', area_id: 'a1', puesto: 'Wealth Manager',      fecha_ingreso: '2019-11-04', fecha_nacimiento: '1983-03-08', estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2019-11-04T00:00:00Z', areas: { id: 'a1', nombre: 'Wealth Management' } },
  { id: 'demo-emp-202', nombre: 'Cecilia', apellido: 'Díaz',     email_corporativo: 'c.diaz@latinsecurities.ar',     area_id: 'a1', puesto: 'Analista Patrimonial', fecha_ingreso: '2022-03-15', fecha_nacimiento: '1990-11-15', estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2022-03-15T00:00:00Z', areas: { id: 'a1', nombre: 'Wealth Management' } },
  { id: 'demo-emp-203', nombre: 'Ignacio', apellido: 'López',    email_corporativo: 'i.lopez@latinsecurities.ar',    area_id: 'a1', puesto: 'Client Advisor',       fecha_ingreso: '2023-06-20', fecha_nacimiento: '1994-06-20', estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2023-06-20T00:00:00Z', areas: { id: 'a1', nombre: 'Wealth Management' } },
]

const MIDDLE: DemoEmployee[] = [
  { id: 'demo-emp-301', nombre: 'Roberto', apellido: 'Sánchez', email_corporativo: 'r.sanchez@latinsecurities.ar', area_id: 'a4', puesto: 'Analista Operativo',       fecha_ingreso: '2021-08-16', fecha_nacimiento: '1987-08-16', estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2021-08-16T00:00:00Z', areas: { id: 'a4', nombre: 'Middle Office' } },
  { id: 'demo-emp-302', nombre: 'María',   apellido: 'Acosta',  email_corporativo: 'm.acosta@latinsecurities.ar',  area_id: 'a4', puesto: 'Coordinadora Back Office', fecha_ingreso: '2022-01-10', fecha_nacimiento: '1989-01-10', estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2022-01-10T00:00:00Z', areas: { id: 'a4', nombre: 'Middle Office' } },
]

const COMPLIANCE: DemoEmployee[] = [
  { id: 'demo-emp-401', nombre: 'Andrea', apellido: 'Molina',   email_corporativo: 'a.molina@latinsecurities.ar',  area_id: 'a5', puesto: 'Compliance Officer',   fecha_ingreso: '2020-09-01', fecha_nacimiento: '1986-09-01', estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2020-09-01T00:00:00Z', areas: { id: 'a5', nombre: 'Compliance' } },
  { id: 'demo-emp-402', nombre: 'Diego',  apellido: 'Castillo', email_corporativo: 'd.castillo@latinsecurities.ar', area_id: 'a5', puesto: 'Analista Regulatorio', fecha_ingreso: '2023-10-02', fecha_nacimiento: '1994-10-02', estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2023-10-02T00:00:00Z', areas: { id: 'a5', nombre: 'Compliance' } },
]

// ─── Jefes de área (evaluables por el admin) ──────────────────────────────

const JEFES: DemoEmployee[] = [
  { id: 'demo-jefe-001', nombre: 'Eliseo',  apellido: 'Tapia',    email_corporativo: 'e.tapia@latinsecurities.ar',    area_id: DEMO_AREA_ID, puesto: 'Jefe de Banca Privada',     fecha_ingreso: '2019-04-01', fecha_nacimiento: '1988-06-14', es_jefe_area: true, estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2019-04-01T00:00:00Z', areas: { id: DEMO_AREA_ID, nombre: 'Banca Privada' } },
  { id: 'demo-jefe-002', nombre: 'Carlos',  apellido: 'Mendoza',  email_corporativo: 'c.mendoza@latinsecurities.ar',  area_id: 'a2',         puesto: 'Jefe de Trading',            fecha_ingreso: '2018-08-15', fecha_nacimiento: '1984-11-22', es_jefe_area: true, estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2018-08-15T00:00:00Z', areas: { id: 'a2', nombre: 'Trading' } },
  { id: 'demo-jefe-003', nombre: 'Sofía',   apellido: 'Larrea',   email_corporativo: 's.larrea@latinsecurities.ar',   area_id: 'a1',         puesto: 'Jefa de Wealth Management',  fecha_ingreso: '2017-03-01', fecha_nacimiento: '1982-04-05', es_jefe_area: true, estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2017-03-01T00:00:00Z', areas: { id: 'a1', nombre: 'Wealth Management' } },
  { id: 'demo-jefe-004', nombre: 'Gabriel', apellido: 'Romero',   email_corporativo: 'g.romero@latinsecurities.ar',   area_id: 'a4',         puesto: 'Jefe de Middle Office',      fecha_ingreso: '2020-02-10', fecha_nacimiento: '1986-03-18', es_jefe_area: true, estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2020-02-10T00:00:00Z', areas: { id: 'a4', nombre: 'Middle Office' } },
  { id: 'demo-jefe-005', nombre: 'Natalia', apellido: 'Suárez',   email_corporativo: 'n.suarez@latinsecurities.ar',   area_id: 'a5',         puesto: 'Jefa de Compliance',         fecha_ingreso: '2018-11-20', fecha_nacimiento: '1985-07-30', es_jefe_area: true, estado: 'activo', legajo_externo_id: null, legajo_sincronizado: false, created_at: '2018-11-20T00:00:00Z', areas: { id: 'a5', nombre: 'Compliance' } },
]

const sort = (arr: DemoEmployee[]) => [...arr].sort((a, b) => a.apellido.localeCompare(b.apellido))

export const DEMO_EMPLOYEES: DemoEmployee[] = sort(BP)
export const DEMO_ALL_EMPLOYEES: DemoEmployee[] = sort([...BP, ...TRADING, ...WM, ...MIDDLE, ...COMPLIANCE])
export const DEMO_JEFES: DemoEmployee[] = sort(JEFES)

// ─── Áreas para el filtro del admin ────────────────────────────────────────

export const DEMO_AREAS: Area[] = [
  { id: 'a1',          nombre: 'Wealth Management', descripcion: null, created_at: '' },
  { id: 'a2',          nombre: 'Trading',           descripcion: null, created_at: '' },
  { id: DEMO_AREA_ID,  nombre: 'Banca Privada',     descripcion: null, created_at: '' },
  { id: 'a4',          nombre: 'Middle Office',     descripcion: null, created_at: '' },
  { id: 'a5',          nombre: 'Compliance',        descripcion: null, created_at: '' },
]

// ─── Evaluaciones del trimestre (text-based) ───────────────────────────────

export const DEMO_EVALUATIONS = new Map<string, Evaluation>([
  ['demo-emp-001', {
    id: 'demo-eval-demo-emp-001',
    empleado_id: 'demo-emp-001',
    evaluador_id: 'demo-user-000',
    trimestre: 1,
    anio: ANIO,
    productividad: 'supera',
    calidad: 'supera',
    compromiso: 'cumple',
    autonomia: 'cumple',
    trabajo_equipo: 'supera',
    justificaciones: {
      productividad: 'Superó target de AUM en 15%, cerró 3 nuevas cuentas HNW en Q1',
      calidad: 'Reportes y análisis sin errores, alta precisión en portfolios',
      trabajo_equipo: 'Coordinación efectiva con trading y mentoring informal de Nicolás Paz',
    },
    comentarios: null,
    resultado: calcResult(['supera', 'supera', 'cumple', 'cumple', 'supera']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }],
  ['demo-emp-002', {
    id: 'demo-eval-demo-emp-002',
    empleado_id: 'demo-emp-002',
    evaluador_id: 'demo-user-000',
    trimestre: 1,
    anio: ANIO,
    productividad: 'cumple',
    calidad: 'supera',
    compromiso: 'cumple',
    autonomia: 'supera',
    trabajo_equipo: 'cumple',
    justificaciones: {
      calidad: 'Análisis de inversiones de alta calidad, reconocida por clientes',
      autonomia: 'Gestión autónoma de carteras mid-size sin supervisión',
    },
    comentarios: null,
    resultado: calcResult(['cumple', 'supera', 'cumple', 'supera', 'cumple']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }],
  ['demo-emp-004', {
    id: 'demo-eval-demo-emp-004',
    empleado_id: 'demo-emp-004',
    evaluador_id: 'demo-user-000',
    trimestre: 1,
    anio: ANIO,
    productividad: 'cumple',
    calidad: 'cumple',
    compromiso: 'supera',
    autonomia: 'cumple',
    trabajo_equipo: 'cumple',
    justificaciones: {
      compromiso: 'Disponibilidad constante, tomó responsabilidades adicionales durante ausencia de Matías',
    },
    comentarios: null,
    resultado: calcResult(['cumple', 'cumple', 'supera', 'cumple', 'cumple']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }],
  ['demo-emp-006', {
    id: 'demo-eval-demo-emp-006',
    empleado_id: 'demo-emp-006',
    evaluador_id: 'demo-user-000',
    trimestre: 1,
    anio: ANIO,
    productividad: 'cumple',
    calidad: 'cumple',
    compromiso: 'cumple',
    autonomia: 'cumple',
    trabajo_equipo: 'cumple',
    justificaciones: {},
    comentarios: null,
    resultado: calcResult(['cumple', 'cumple', 'cumple', 'cumple', 'cumple']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }],
  ['demo-emp-101', {
    id: 'demo-eval-demo-emp-101',
    empleado_id: 'demo-emp-101',
    evaluador_id: 'demo-user-000',
    trimestre: 1,
    anio: ANIO,
    productividad: 'supera',
    calidad: 'supera',
    compromiso: 'supera',
    autonomia: 'supera',
    trabajo_equipo: 'cumple',
    justificaciones: {
      productividad: 'Record de P&L en Q1, +22% sobre benchmark',
      calidad: 'Cero errores operativos en 180 operaciones',
      compromiso: 'Disponible en situaciones críticas de mercado fuera de horario',
      autonomia: 'Toma decisiones de hasta USD 500K sin escalar',
    },
    comentarios: null,
    resultado: calcResult(['supera', 'supera', 'supera', 'supera', 'cumple']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }],
  ['demo-emp-401', {
    id: 'demo-eval-demo-emp-401',
    empleado_id: 'demo-emp-401',
    evaluador_id: 'demo-user-000',
    trimestre: 1,
    anio: ANIO,
    productividad: 'supera',
    calidad: 'cumple',
    compromiso: 'supera',
    autonomia: 'supera',
    trabajo_equipo: 'cumple',
    justificaciones: {
      productividad: 'Implementó nuevo proceso de control que redujo observaciones regulatorias en 40%',
      compromiso: 'Lideró auditoría regulatoria con resultado positivo',
      autonomia: 'Resolvió contingencias regulatorias sin escalar a gerencia',
    },
    comentarios: null,
    resultado: calcResult(['supera', 'cumple', 'supera', 'supera', 'cumple']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }],
])

// ─── Datos para AdminDashboard ─────────────────────────────────────────────

export const DEMO_ADMIN = {
  stats: { empleados: 16, masaSalarial: 38_900_000, scorePromedio: 3.7 },
  areas: [
    { area_id: DEMO_AREA_ID, area_nombre: 'Banca Privada',     cantidad_empleados: 6, masa_salarial: 12_400_000, score_promedio: 4.3 },
    { area_id: 'a1',         area_nombre: 'Wealth Management', cantidad_empleados: 3, masa_salarial: 9_900_000,  score_promedio: 3.9 },
    { area_id: 'a2',         area_nombre: 'Trading',           cantidad_empleados: 3, masa_salarial: 8_500_000,  score_promedio: 4.1 },
    { area_id: 'a5',         area_nombre: 'Compliance',        cantidad_empleados: 2, masa_salarial: 4_100_000,  score_promedio: 4.3 },
    { area_id: 'a4',         area_nombre: 'Middle Office',     cantidad_empleados: 2, masa_salarial: 4_000_000,  score_promedio: 3.7 },
  ] as AreaCostSummary[],
  topPerformers: [
    { resultado: 'top_performer' as const, empleados: { nombre: 'Santiago', apellido: 'Albornoz',  puesto: 'Trader Sr.',               areas: { nombre: 'Trading' } } },
    { resultado: 'top_performer' as const, empleados: { nombre: 'Pablo',    apellido: 'Rodríguez', puesto: 'Relationship Manager Sr.', areas: { nombre: 'Banca Privada' } } },
    { resultado: 'top_performer' as const, empleados: { nombre: 'Andrea',   apellido: 'Molina',    puesto: 'Compliance Officer',       areas: { nombre: 'Compliance' } } },
    { resultado: 'high_performer' as const, empleados: { nombre: 'Valentina',apellido: 'Gómez',    puesto: 'Analista de Inversiones',  areas: { nombre: 'Banca Privada' } } },
    { resultado: 'high_performer' as const, empleados: { nombre: 'Carolina', apellido: 'Herrera',  puesto: 'Ejecutiva de Cuentas',     areas: { nombre: 'Banca Privada' } } },
  ],
}

// ─── Sueldos vigentes (todos los empleados) ────────────────────────────────

export const DEMO_CURRENT_SALARIES: Salary[] = [
  // Banca Privada — 12.4M
  { id: 'cur-001', empleado_id: 'demo-emp-001', monto_bruto: 2_800_000, moneda: 'ARS', fecha_desde: '2026-02-01', fecha_hasta: null, motivo_cambio: 'Promoción a Relationship Manager Sr.', created_at: '2026-02-01T00:00:00Z' },
  { id: 'cur-002', empleado_id: 'demo-emp-002', monto_bruto: 2_400_000, moneda: 'ARS', fecha_desde: '2026-01-01', fecha_hasta: null, motivo_cambio: 'Ajuste anual',                          created_at: '2026-01-01T00:00:00Z' },
  { id: 'cur-003', empleado_id: 'demo-emp-003', monto_bruto: 2_100_000, moneda: 'ARS', fecha_desde: '2026-01-01', fecha_hasta: null, motivo_cambio: 'Ajuste anual',                          created_at: '2026-01-01T00:00:00Z' },
  { id: 'cur-004', empleado_id: 'demo-emp-004', monto_bruto: 2_000_000, moneda: 'ARS', fecha_desde: '2026-01-01', fecha_hasta: null, motivo_cambio: 'Ajuste anual',                          created_at: '2026-01-01T00:00:00Z' },
  { id: 'cur-005', empleado_id: 'demo-emp-005', monto_bruto: 1_600_000, moneda: 'ARS', fecha_desde: '2025-10-01', fecha_hasta: null, motivo_cambio: null,                                    created_at: '2025-10-01T00:00:00Z' },
  { id: 'cur-006', empleado_id: 'demo-emp-006', monto_bruto: 1_500_000, moneda: 'ARS', fecha_desde: '2025-10-01', fecha_hasta: null, motivo_cambio: null,                                    created_at: '2025-10-01T00:00:00Z' },
  // Trading — 8.5M
  { id: 'cur-101', empleado_id: 'demo-emp-101', monto_bruto: 3_500_000, moneda: 'ARS', fecha_desde: '2026-01-01', fecha_hasta: null, motivo_cambio: 'Ajuste anual',                          created_at: '2026-01-01T00:00:00Z' },
  { id: 'cur-102', empleado_id: 'demo-emp-102', monto_bruto: 2_500_000, moneda: 'ARS', fecha_desde: '2026-01-01', fecha_hasta: null, motivo_cambio: 'Ajuste anual',                          created_at: '2026-01-01T00:00:00Z' },
  { id: 'cur-103', empleado_id: 'demo-emp-103', monto_bruto: 2_500_000, moneda: 'ARS', fecha_desde: '2026-01-01', fecha_hasta: null, motivo_cambio: 'Ajuste anual',                          created_at: '2026-01-01T00:00:00Z' },
  // Wealth Management — 9.9M
  { id: 'cur-201', empleado_id: 'demo-emp-201', monto_bruto: 4_200_000, moneda: 'ARS', fecha_desde: '2026-01-01', fecha_hasta: null, motivo_cambio: 'Ajuste anual',                          created_at: '2026-01-01T00:00:00Z' },
  { id: 'cur-202', empleado_id: 'demo-emp-202', monto_bruto: 3_000_000, moneda: 'ARS', fecha_desde: '2026-01-01', fecha_hasta: null, motivo_cambio: 'Ajuste anual',                          created_at: '2026-01-01T00:00:00Z' },
  { id: 'cur-203', empleado_id: 'demo-emp-203', monto_bruto: 2_700_000, moneda: 'ARS', fecha_desde: '2025-09-01', fecha_hasta: null, motivo_cambio: null,                                    created_at: '2025-09-01T00:00:00Z' },
  // Middle Office — 4.0M
  { id: 'cur-301', empleado_id: 'demo-emp-301', monto_bruto: 2_100_000, moneda: 'ARS', fecha_desde: '2026-01-01', fecha_hasta: null, motivo_cambio: 'Ajuste anual',                          created_at: '2026-01-01T00:00:00Z' },
  { id: 'cur-302', empleado_id: 'demo-emp-302', monto_bruto: 1_900_000, moneda: 'ARS', fecha_desde: '2026-01-01', fecha_hasta: null, motivo_cambio: 'Ajuste anual',                          created_at: '2026-01-01T00:00:00Z' },
  // Compliance — 4.1M
  { id: 'cur-401', empleado_id: 'demo-emp-401', monto_bruto: 2_200_000, moneda: 'ARS', fecha_desde: '2026-01-01', fecha_hasta: null, motivo_cambio: 'Ajuste anual',                          created_at: '2026-01-01T00:00:00Z' },
  { id: 'cur-402', empleado_id: 'demo-emp-402', monto_bruto: 1_900_000, moneda: 'ARS', fecha_desde: '2025-12-01', fecha_hasta: null, motivo_cambio: null,                                    created_at: '2025-12-01T00:00:00Z' },
]

// ─── Salary history para Pablo ─────────────────────────────────────────────

export const DEMO_PABLO_SALARY_HISTORY: Salary[] = [
  { id: 'sal-p01', empleado_id: 'demo-emp-001', monto_bruto: 1_800_000, moneda: 'ARS', fecha_desde: '2025-07-01', fecha_hasta: '2025-07-31', motivo_cambio: null, created_at: '2025-07-01T00:00:00Z' },
  { id: 'sal-p02', empleado_id: 'demo-emp-001', monto_bruto: 2_000_000, moneda: 'ARS', fecha_desde: '2025-08-01', fecha_hasta: '2025-08-31', motivo_cambio: 'Ajuste por inflación', created_at: '2025-08-01T00:00:00Z' },
  { id: 'sal-p03', empleado_id: 'demo-emp-001', monto_bruto: 2_200_000, moneda: 'ARS', fecha_desde: '2025-09-01', fecha_hasta: '2025-09-30', motivo_cambio: 'Ajuste por inflación', created_at: '2025-09-01T00:00:00Z' },
  { id: 'sal-001', empleado_id: 'demo-emp-001', monto_bruto: 2_400_000, moneda: 'ARS', fecha_desde: '2025-10-01', fecha_hasta: '2025-10-31', motivo_cambio: 'Ajuste por inflación', created_at: '2025-10-01T00:00:00Z' },
  { id: 'sal-002', empleado_id: 'demo-emp-001', monto_bruto: 2_400_000, moneda: 'ARS', fecha_desde: '2025-11-01', fecha_hasta: '2025-11-30', motivo_cambio: null, created_at: '2025-11-01T00:00:00Z' },
  { id: 'sal-003', empleado_id: 'demo-emp-001', monto_bruto: 2_400_000, moneda: 'ARS', fecha_desde: '2025-12-01', fecha_hasta: '2025-12-31', motivo_cambio: null, created_at: '2025-12-01T00:00:00Z' },
  { id: 'sal-004', empleado_id: 'demo-emp-001', monto_bruto: 2_600_000, moneda: 'ARS', fecha_desde: '2026-01-01', fecha_hasta: '2026-01-31', motivo_cambio: 'Ajuste por mérito', created_at: '2026-01-01T00:00:00Z' },
  { id: 'sal-005', empleado_id: 'demo-emp-001', monto_bruto: 2_800_000, moneda: 'ARS', fecha_desde: '2026-02-01', fecha_hasta: '2026-02-28', motivo_cambio: 'Promoción a Relationship Manager Sr.', created_at: '2026-02-01T00:00:00Z' },
  { id: 'sal-006', empleado_id: 'demo-emp-001', monto_bruto: 2_800_000, moneda: 'ARS', fecha_desde: '2026-03-01', fecha_hasta: null, motivo_cambio: 'Promoción a Relationship Manager Sr.', created_at: '2026-03-01T00:00:00Z' },
]

// ─── Self-evaluation para Pablo (Q1 2026) ─────────────────────────────────

export const DEMO_PABLO_SELF_EVAL: SelfEvaluation = {
  id: 'self-eval-001',
  empleado_id: 'demo-emp-001',
  trimestre: 1,
  anio: ANIO,
  productividad: 'supera',
  calidad: 'supera',
  compromiso: 'supera',
  autonomia: 'supera',
  trabajo_equipo: 'supera',
  resultado: calcResult(['supera', 'supera', 'supera', 'supera', 'supera']),
  logros: 'Cerré 3 nuevas cuentas de clientes de alto patrimonio. Superé el objetivo de AUM del trimestre en un 15%.',
  obstaculos: 'La carga de reportes internos me quita tiempo de calidad con clientes.',
  necesidades: 'Mayor autonomía para tomar decisiones de cartera sin necesitar aprobación en cada movimiento.',
  motivacion: 4,
  motivacion_comentario: 'Buen trimestre de producción pero con mucha presión por el cierre. Necesito más autonomía para manejar los tiempos.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// ─── Wellbeing para Pablo ──────────────────────────────────────────────────

export const DEMO_PABLO_WELLBEING: Wellbeing = {
  id: 'wellbeing-001',
  empleado_id: 'demo-emp-001',
  periodo_mes: 3,
  periodo_anio: ANIO,
  enps: 8,
  energia: 4,
  motivacion: 4,
  carga_laboral: 3,
  comentario: 'Marzo intenso con cierre de trimestre. Me siento bien en el equipo pero siento que necesito más autonomía.',
  created_at: new Date().toISOString(),
}

// ─── Sugerencias ───────────────────────────────────────────────────────────

export const DEMO_SUGGESTIONS: Suggestion[] = [
  { id: 'sug-001', autor_nombre: 'Valentina Gómez', area_nombre: 'Banca Privada', categoria: 'sin_costo', titulo: 'Reunión semanal de 15 min entre áreas', descripcion: 'Una llamada corta semanal entre Banca Privada y Middle Office mejoraría la coordinación sin necesidad de inversión adicional.', es_anonima: false, estado: 'implementada', created_at: '2026-03-10T00:00:00Z' },
  { id: 'sug-002', autor_nombre: 'Roberto Sánchez', area_nombre: 'Middle Office', categoria: 'procesos', titulo: 'Simplificar aprobación de operaciones', descripcion: 'El proceso actual requiere 4 firmas para operaciones menores a USD 10.000. Propongo reducir a 2 para agilizar el flujo.', es_anonima: false, estado: 'en_revision', created_at: '2026-03-20T00:00:00Z' },
  { id: 'sug-003', autor_nombre: 'Pablo Rodríguez', area_nombre: 'Banca Privada', categoria: 'sin_costo', titulo: 'Compartir casos de éxito entre el equipo', descripcion: 'Dedicar 10 minutos en el team meeting mensual para que cada uno comparta un aprendizaje o logro del período. Fortalece la cultura sin ningún costo.', es_anonima: false, estado: 'nueva', created_at: '2026-03-25T00:00:00Z' },
]

// ─── Licencias ─────────────────────────────────────────────────────────────

export const DEMO_LEAVES: Leave[] = [
  {
    id: 'leave-001',
    empleado_id: 'demo-emp-005',
    empleado_nombre: 'Nicolás Paz',
    tipo: 'vacaciones',
    fecha_inicio: '2026-03-23',
    fecha_fin: '2026-03-27',
    dias: 5,
    estado: 'aprobada',
    observacion: null,
  },
  {
    id: 'leave-002',
    empleado_id: 'demo-emp-004',
    empleado_nombre: 'Carolina Herrera',
    tipo: 'licencia_medica',
    fecha_inicio: '2026-03-30',
    fecha_fin: '2026-04-01',
    dias: 3,
    estado: 'aprobada',
    observacion: null,
  },
  {
    id: 'leave-003',
    empleado_id: 'demo-emp-003',
    empleado_nombre: 'Matías Ferreyra',
    tipo: 'licencia_personal',
    fecha_inicio: '2026-04-07',
    fecha_fin: '2026-04-09',
    dias: 3,
    estado: 'pendiente',
    observacion: null,
  },
]

// ─── Comunicaciones ────────────────────────────────────────────────────────

export const DEMO_COMUNICACIONES: Comunicacion[] = [
  {
    id: 'com-001',
    tipo: 'pago',
    titulo: 'Acreditación sueldos - Marzo 2026',
    cuerpo: 'Los sueldos de marzo se acreditan el miércoles 25/03/2026. Consultas: rrhh@latinsecurities.ar',
    fecha_programada: '2026-03-24',
    destinatarios: 'todos',
    enviada: true,
  },
  {
    id: 'com-002',
    tipo: 'evaluacion',
    titulo: 'Recordatorio: Cierre Evaluación Q1 2026',
    cuerpo: 'En 7 días cierra el período de evaluación trimestral. Jefes: completen las evaluaciones de su equipo. Empleados: completen su autoevaluación antes del 31/03.',
    fecha_programada: '2026-03-24',
    destinatarios: 'todos',
    enviada: true,
  },
  {
    id: 'com-003',
    tipo: 'pago',
    titulo: 'Acreditación sueldos - Junio 2026',
    cuerpo: 'Los sueldos de junio se acreditarán el miércoles 25/06/2026.',
    fecha_programada: '2026-06-23',
    destinatarios: 'todos',
    enviada: false,
  },
  {
    id: 'com-004',
    tipo: 'evaluacion',
    titulo: 'Recordatorio: Cierre Evaluación Q2 2026',
    cuerpo: 'En 7 días cierra el período de evaluación del 2do Trimestre 2026. Completen sus evaluaciones antes del 30/06.',
    fecha_programada: '2026-06-23',
    destinatarios: 'todos',
    enviada: false,
  },
]

// ─── Onboarding ───────────────────────────────────────────────────────────

export const DEMO_ONBOARDING_ITEMS: OnboardingItem[] = [
  { id: 'ob-item-001', titulo: 'Presentación institucional Latin Securities', descripcion: 'Conocé la historia, misión, visión y valores de Latin Securities.', tipo: 'presentacion', url: 'https://docs.google.com/presentation/d/example', orden: 1 },
  { id: 'ob-item-002', titulo: 'Código de Ética y Conducta', descripcion: 'Lectura obligatoria del código de ética corporativo.', tipo: 'documento', url: 'https://drive.google.com/file/d/etica-example', orden: 2 },
  { id: 'ob-item-003', titulo: 'Políticas de Compliance', descripcion: 'Revisá las políticas de compliance y prevención de lavado de activos.', tipo: 'documento', url: 'https://drive.google.com/file/d/compliance-example', orden: 3 },
  { id: 'ob-item-004', titulo: 'Video: Cultura y equipo Latin', descripcion: 'Video introductorio sobre la cultura del equipo y formas de trabajo.', tipo: 'video', url: 'https://vimeo.com/example', orden: 4 },
  { id: 'ob-item-005', titulo: 'Formulario de datos personales', descripcion: 'Completá tus datos personales, contacto de emergencia y datos bancarios.', tipo: 'formulario', url: 'https://forms.google.com/example', orden: 5 },
  { id: 'ob-item-006', titulo: 'Configurar accesos y herramientas', descripcion: 'Configurá tu email corporativo, acceso a sistemas y herramientas de trabajo.', tipo: 'tarea', url: null, orden: 6 },
]

export const DEMO_ONBOARDING_ASIGNACIONES: OnboardingAsignacion[] = [
  {
    id: 'ob-asig-001',
    empleado_id: 'demo-emp-005',
    empleado_nombre: 'Nicolás Paz',
    empleado_area: 'Banca Privada',
    fecha_ingreso: '2024-01-08',
    fecha_asignacion: '2024-01-08',
    items: DEMO_ONBOARDING_ITEMS.map((item) => ({
      item_id: item.id,
      titulo: item.titulo,
      descripcion: item.descripcion,
      tipo: item.tipo,
      url: item.url,
      orden: item.orden,
      estado: 'completado' as const,
      fecha_completado: '2024-01-15',
    })),
  },
  {
    id: 'ob-asig-002',
    empleado_id: 'demo-emp-001',
    empleado_nombre: 'Pablo Rodríguez',
    empleado_area: 'Banca Privada',
    fecha_ingreso: '2021-03-15',
    fecha_asignacion: '2026-04-10',
    items: DEMO_ONBOARDING_ITEMS.map((item, i) => ({
      item_id: item.id,
      titulo: item.titulo,
      descripcion: item.descripcion,
      tipo: item.tipo,
      url: item.url,
      orden: item.orden,
      estado: i < 2 ? 'completado' as const : i === 2 ? 'en_progreso' as const : 'pendiente' as const,
      fecha_completado: i < 2 ? '2026-04-11' : null,
    })),
  },
]

// ─── Contexto ──────────────────────────────────────────────────────────────

export interface DemoContextValue {
  employees: DemoEmployee[]
  allEmployees: DemoEmployee[]
  jefes: DemoEmployee[]
  areas: Area[]
  evaluations: Map<string, Evaluation>
  admin: typeof DEMO_ADMIN
  salaryHistory: Salary[]
  currentSalaries: Salary[]
  selfEval: SelfEvaluation
  wellbeing: Wellbeing
  suggestions: Suggestion[]
  leaves: Leave[]
  comunicaciones: Comunicacion[]
  onboardingItems: OnboardingItem[]
  onboardingAsignaciones: OnboardingAsignacion[]
}

export const DemoContext = createContext<DemoContextValue | null>(null)
export const useDemoData = () => useContext(DemoContext)
