-- 1. Tabla profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Tabla locations (Bancales y macetas)
CREATE TABLE IF NOT EXISTS public.locations (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Bancal elevado',
  sun_exposure TEXT NOT NULL DEFAULT 'Pleno sol',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Tabla crops (Cultivos)
CREATE TABLE IF NOT EXISTS public.crops (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id TEXT REFERENCES public.locations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  variety TEXT NOT NULL DEFAULT '',
  stage TEXT NOT NULL DEFAULT 'Plántula',
  planted_date DATE NOT NULL DEFAULT CURRENT_DATE,
  days_to_harvest INTEGER NOT NULL DEFAULT 30,
  recommended_moisture_percent INTEGER DEFAULT 70,
  sun_hours NUMERIC DEFAULT 6.0,
  water_frequency_days INTEGER DEFAULT 2,
  last_watered TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  image_alt TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Tabla crop_logs (Bitácora individual)
CREATE TABLE IF NOT EXISTS public.crop_logs (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id TEXT NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT DEFAULT '',
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_time TEXT DEFAULT '',
  task_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Tabla tasks (Calendario reactivo)
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id TEXT REFERENCES public.crops(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL,
  due_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas RLS: locations
CREATE POLICY "Users can manage own locations"
  ON public.locations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS: crops
CREATE POLICY "Users can manage own crops"
  ON public.crops FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS: crop_logs
CREATE POLICY "Users can manage own crop logs"
  ON public.crop_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS: tasks
CREATE POLICY "Users can manage own tasks"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índices optimizados para consultas y relaciones
CREATE INDEX IF NOT EXISTS idx_locations_user_id ON public.locations(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON public.crops(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_location_id ON public.crops(location_id);
CREATE INDEX IF NOT EXISTS idx_crop_logs_user_id ON public.crop_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_logs_crop_id ON public.crop_logs(crop_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_crop_id ON public.tasks(crop_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- Publicación CDC en tiempo real para replicación de cambios vía WebSockets
ALTER PUBLICATION supabase_realtime ADD TABLE public.locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crops;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crop_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
