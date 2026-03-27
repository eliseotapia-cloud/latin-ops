-- ============================================================
-- LATIN Ops — Schema SQL para Supabase
-- Ejecutar en orden en el SQL Editor de Supabase
-- ============================================================

-- 1. ÁREAS
CREATE TABLE areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  created_at timestamptz DEFAULT now()
);

-- 2. USUARIOS DEL SISTEMA
-- Nota: el id debe coincidir con auth.users.id de Supabase Auth
CREATE TABLE usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  nombre text NOT NULL,
  rol text NOT NULL CHECK (rol IN ('super_admin', 'area_manager')),
  area_id uuid REFERENCES areas(id),
  created_at timestamptz DEFAULT now()
);

-- 3. EMPLEADOS
CREATE TABLE empleados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  apellido text NOT NULL,
  email_corporativo text NOT NULL,
  area_id uuid NOT NULL REFERENCES areas(id),
  puesto text NOT NULL,
  fecha_ingreso date NOT NULL,
  estado text NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'baja', 'licencia')),
  legajo_externo_id text,
  legajo_sincronizado boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. SUELDOS
CREATE TABLE sueldos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empleado_id uuid NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  monto_bruto numeric(12,2) NOT NULL,
  moneda text NOT NULL DEFAULT 'ARS',
  fecha_desde date NOT NULL,
  fecha_hasta date,  -- NULL = vigente
  motivo_cambio text,
  creado_por uuid REFERENCES usuarios(id),
  created_at timestamptz DEFAULT now()
);

-- 5. EVALUACIONES
CREATE TABLE evaluaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empleado_id uuid NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  evaluador_id uuid NOT NULL REFERENCES usuarios(id),
  periodo_mes integer NOT NULL CHECK (periodo_mes BETWEEN 1 AND 12),
  periodo_anio integer NOT NULL,
  productividad integer NOT NULL CHECK (productividad BETWEEN 1 AND 5),
  calidad integer NOT NULL CHECK (calidad BETWEEN 1 AND 5),
  compromiso integer NOT NULL CHECK (compromiso BETWEEN 1 AND 5),
  autonomia integer NOT NULL CHECK (autonomia BETWEEN 1 AND 5),
  trabajo_equipo integer NOT NULL CHECK (trabajo_equipo BETWEEN 1 AND 5),
  score_general numeric(3,2) NOT NULL,
  comentarios text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (empleado_id, periodo_mes, periodo_anio)
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_empleados_area ON empleados(area_id);
CREATE INDEX idx_empleados_estado ON empleados(estado);
CREATE INDEX idx_sueldos_empleado ON sueldos(empleado_id, fecha_hasta);
CREATE INDEX idx_evaluaciones_empleado ON evaluaciones(empleado_id, periodo_anio, periodo_mes);
CREATE INDEX idx_evaluaciones_periodo ON evaluaciones(periodo_anio, periodo_mes);

-- ============================================================
-- TRIGGER: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER empleados_updated_at
  BEFORE UPDATE ON empleados
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER evaluaciones_updated_at
  BEFORE UPDATE ON evaluaciones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE sueldos ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;

-- Función helper: obtener rol del usuario autenticado
CREATE OR REPLACE FUNCTION get_my_rol()
RETURNS text AS $$
  SELECT rol FROM usuarios WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Función helper: obtener area_id del usuario autenticado
CREATE OR REPLACE FUNCTION get_my_area()
RETURNS uuid AS $$
  SELECT area_id FROM usuarios WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- AREAS: todos los autenticados pueden leer
CREATE POLICY "areas_read" ON areas
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- USUARIOS: cada uno ve su propio perfil; admin ve todos
CREATE POLICY "usuarios_read" ON usuarios
  FOR SELECT USING (
    id = auth.uid() OR get_my_rol() = 'super_admin'
  );

-- EMPLEADOS: admin ve todos; manager solo su área
CREATE POLICY "empleados_read" ON empleados
  FOR SELECT USING (
    get_my_rol() = 'super_admin'
    OR (get_my_rol() = 'area_manager' AND area_id = get_my_area())
  );

CREATE POLICY "empleados_insert" ON empleados
  FOR INSERT WITH CHECK (
    get_my_rol() = 'super_admin'
    OR (get_my_rol() = 'area_manager' AND area_id = get_my_area())
  );

CREATE POLICY "empleados_update" ON empleados
  FOR UPDATE USING (
    get_my_rol() = 'super_admin'
    OR (get_my_rol() = 'area_manager' AND area_id = get_my_area())
  );

-- SUELDOS: admin ve todos; manager solo su área (SIN totales agregados en el cliente)
CREATE POLICY "sueldos_read" ON sueldos
  FOR SELECT USING (
    get_my_rol() = 'super_admin'
    OR (
      get_my_rol() = 'area_manager'
      AND EXISTS (
        SELECT 1 FROM empleados e
        WHERE e.id = sueldos.empleado_id
        AND e.area_id = get_my_area()
      )
    )
  );

CREATE POLICY "sueldos_insert" ON sueldos
  FOR INSERT WITH CHECK (get_my_rol() = 'super_admin');

CREATE POLICY "sueldos_update" ON sueldos
  FOR UPDATE USING (get_my_rol() = 'super_admin');

-- EVALUACIONES: admin ve todas; manager solo su área
CREATE POLICY "evaluaciones_read" ON evaluaciones
  FOR SELECT USING (
    get_my_rol() = 'super_admin'
    OR (
      get_my_rol() = 'area_manager'
      AND EXISTS (
        SELECT 1 FROM empleados e
        WHERE e.id = evaluaciones.empleado_id
        AND e.area_id = get_my_area()
      )
    )
  );

CREATE POLICY "evaluaciones_insert" ON evaluaciones
  FOR INSERT WITH CHECK (
    get_my_rol() = 'super_admin'
    OR (
      get_my_rol() = 'area_manager'
      AND evaluador_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM empleados e
        WHERE e.id = evaluaciones.empleado_id
        AND e.area_id = get_my_area()
      )
    )
  );

CREATE POLICY "evaluaciones_update" ON evaluaciones
  FOR UPDATE USING (
    get_my_rol() = 'super_admin'
    OR (evaluador_id = auth.uid() AND get_my_rol() = 'area_manager')
  );

-- ============================================================
-- DATOS INICIALES DE EJEMPLO
-- ============================================================

-- Insertar áreas base
INSERT INTO areas (nombre) VALUES
  ('Tecnología'),
  ('Comercial'),
  ('Operaciones'),
  ('Finanzas'),
  ('Marketing');

-- Nota: Para crear usuarios, primero creá el usuario en Supabase Auth
-- (Dashboard > Authentication > Users > Invite user)
-- Luego insertá su perfil acá con el UUID generado:
--
-- INSERT INTO usuarios (id, email, nombre, rol, area_id) VALUES
--   ('uuid-del-auth', 'admin@latin.com', 'Nombre Admin', 'super_admin', NULL);
