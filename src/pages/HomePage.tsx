import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout,
  Calendar,
  LayoutDashboard,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Droplets,
  Sun,
  AlertTriangle,
  Lightbulb,
  Check
} from 'lucide-react';
import type { CropItem, GardenTask, PageRoute } from '../types/huerta';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import type { UserProfile } from '../services/authService';

interface HomePageProps {
  crops: CropItem[];
  tasks: GardenTask[];
  onNavigate: (route: PageRoute) => void;
  user: UserProfile | null;
  onAuthChange: (user: UserProfile | null) => void;
}

// Simulador interactivo para la landing
interface PlantProblem {
  id: string;
  symptom: string;
  cause: string;
  solution: string;
  difficulty: 'Fácil' | 'Media';
  icon: string;
}

const PLANT_PROBLEMS: PlantProblem[] = [
  {
    id: 'p1',
    symptom: 'Hojas amarillentas y tierra encharcada',
    cause: 'Exceso de riego y asfixia radicular (el 78% de los principiantes riega de más pensando que la planta tiene sed).',
    solution: 'Espacia los riegos. Entierra el dedo 3 cm: si sale húmedo, no riegues. Mi Huerta Casera te avisará el día exacto.',
    difficulty: 'Fácil',
    icon: 'droplet'
  },
  {
    id: 'p2',
    symptom: 'Tallos muy largos, débiles y pálidos (ahilamiento)',
    cause: 'Falta de radiación solar directa. La planta estira desesperadamente su tallo buscando luz.',
    solution: 'Ubícala en un lugar con al menos 5-6 horas de sol directo o luz filtrada potente. Ajusta la ubicación en tu perfil.',
    difficulty: 'Fácil',
    icon: 'sun'
  },
  {
    id: 'p3',
    symptom: 'Puntas secas o bordes de hojas quemados',
    cause: 'Baja humedad ambiental o shock por regar a pleno mediodía bajo sol abrasador.',
    solution: 'Riega a primera hora de la mañana (07:00-09:00) o al atardecer. Nunca mojes hojas en horas centrales de calor.',
    difficulty: 'Fácil',
    icon: 'thermometer'
  },
  {
    id: 'p4',
    symptom: 'La planta no crece ni da flores tras semanas',
    cause: 'Sustrato pobre y compactado o falta de nutrientes esenciales (fósforo y potasio).',
    solution: 'Añade una capa de humus de lombriz o compost orgánico. Activa el recordatorio de abonado en tu calendario.',
    difficulty: 'Media',
    icon: 'sprout'
  }
];

export const HomePage: React.FC<HomePageProps> = ({
  crops,
  tasks,
  onNavigate,
  user,
  onAuthChange
}) => {
  const [activeSymptomIndex, setActiveSymptomIndex] = useState<number>(0);

  // Cálculos si el usuario ha iniciado sesión
  const pendingTasks = tasks.filter((t) => !t.completed);
  const todaysTasks = pendingTasks.filter((t) => {
    const d = new Date(); const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return t.dueDate === today;
  });
  const cropsInHarvest = crops.filter((c) => c.stage === 'Cosecha');
  const closestHarvestDays = crops.length > 0 ? Math.min(...crops.map((c) => c.daysToHarvest)) : 0;

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* ============================================================ */}
      {/* VISTA PARA USUARIO AUTENTICADO: ACCESOS DIRECTOS Y RESUMEN   */}
      {/* ============================================================ */}
      {user ? (
        <section className="pt-6 sm:pt-10 max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-8"
          >
            {/* Cabecera de bienvenida personalizada */}
            <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sesión activa · {user.provider === 'demo' ? 'Modo Demo' : 'Google Cloud Sync'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1A231E]">
                  ¡Hola de nuevo, {user.name}! 🌿
                </h1>
                <p className="text-sm text-[#4A554E] max-w-xl">
                  Aquí tienes el estado de tu huerta hoy y los accesos rápidos a tus labores y cultivos.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2D5A27] text-white font-semibold text-sm hover:bg-[#23471E] transition-colors shadow-sm cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Ver Mi Huerta ({crops.length})</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => onNavigate('calendario')}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#F2EFE9] text-[#1A231E] font-medium text-sm hover:bg-[#E2DFD7] transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Calendario ({pendingTasks.length})</span>
                </motion.button>
              </div>
            </div>

            {/* Tarjetas Bento de Accesos Directos con Información Clave */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Tarjeta 1: Mi Huerta y Estado General */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => onNavigate('dashboard')}
                className="bg-[#FFFFFF] border border-[#E2DFD7] hover:border-[#2D5A27]/50 rounded-2xl p-6 shadow-xs cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1A231E] group-hover:text-[#2D5A27] transition-colors flex items-center justify-between">
                      <span>Acceso a Mi Huerta</span>
                      <ArrowRight className="w-4 h-4 text-[#5A655E] group-hover:translate-x-1 group-hover:text-[#2D5A27] transition-all" />
                    </h2>
                    <p className="text-xs text-[#5A655E] mt-1">
                      Gestiona bancales, etapas agronómicas, humedad recomendada y bitácoras.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F2EFE9] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#5A655E]">Total de cultivos activos:</span>
                    <span className="font-bold text-[#1A231E] bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E2DFD7]">
                      {crops.length} especies
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#5A655E]">Listos para cosechar:</span>
                    <span className="font-semibold text-emerald-700">
                      {cropsInHarvest.length > 0 ? `${cropsInHarvest.length} cultivo(s)` : 'En crecimiento'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#5A655E]">Próxima cosecha estimada:</span>
                    <span className="font-semibold text-[#2D5A27]">{closestHarvestDays} días</span>
                  </div>
                </div>
              </motion.div>

              {/* Tarjeta 2: Calendario y Labores de Hoy */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => onNavigate('calendario')}
                className="bg-[#FFFFFF] border border-[#E2DFD7] hover:border-[#2D5A27]/50 rounded-2xl p-6 shadow-xs cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1A231E] group-hover:text-[#2D5A27] transition-colors flex items-center justify-between">
                      <span>Acceso a Calendario</span>
                      <ArrowRight className="w-4 h-4 text-[#5A655E] group-hover:translate-x-1 group-hover:text-[#2D5A27] transition-all" />
                    </h2>
                    <p className="text-xs text-[#5A655E] mt-1">
                      Cronograma visual mensual y lista de tareas automáticas de mantenimiento.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F2EFE9] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#5A655E]">Tareas para hoy:</span>
                    <span className={`font-bold px-2 py-0.5 rounded border ${todaysTasks.length > 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                      {todaysTasks.length > 0 ? `${todaysTasks.length} pendientes` : 'Al día ✓'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#5A655E]">Total pendientes:</span>
                    <span className="font-semibold text-[#1A231E]">{pendingTasks.length} labores</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#5A655E]">Próxima labor:</span>
                    <span className="font-semibold text-blue-700 truncate max-w-[140px]">
                      {pendingTasks[0] ? `${pendingTasks[0].type} (${pendingTasks[0].cropName})` : 'Sin tareas'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Tarjeta 3: Registro de Nuevo Cultivo y Guía */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => onNavigate('registro')}
                className="bg-[#FFFFFF] border border-[#E2DFD7] hover:border-[#2D5A27]/50 rounded-2xl p-6 shadow-xs cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1A231E] group-hover:text-[#2D5A27] transition-colors flex items-center justify-between">
                      <span>Sembrar Nuevo Cultivo</span>
                      <ArrowRight className="w-4 h-4 text-[#5A655E] group-hover:translate-x-1 group-hover:text-[#2D5A27] transition-all" />
                    </h2>
                    <p className="text-xs text-[#5A655E] mt-1">
                      Añade una nueva variedad y vincula un bancal existente o crea uno nuevo al instante.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F2EFE9] space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#5A655E]">Base botánica:</span>
                    <span className="font-semibold text-[#1A231E]">Tomates, Lechugas, Aromáticas...</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5A655E]">Creación de bancales:</span>
                    <span className="font-semibold text-[#2D5A27]">En un solo paso</span>
                  </div>
                  <div className="text-[11px] text-[#5A655E] italic">
                    Configuración agronómica asistida paso a paso.
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Vista previa rápida de tus cultivos activos */}
            <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1A231E]">Tus cultivos en marcha</h3>
                  <p className="text-xs text-[#5A655E]">Monitoreo de humedad recomendada y tiempo a cosecha</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF9F6] border border-[#D5E0D3] text-[#2D5A27] hover:bg-[#F2EFE9] cursor-pointer"
                >
                  Abrir panel completo →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {crops.slice(0, 4).map((crop) => (
                  <div
                    key={crop.id}
                    onClick={() => onNavigate('dashboard')}
                    className="p-4 rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] hover:bg-white hover:border-[#2D5A27]/40 transition-colors cursor-pointer space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={crop.imageUrl}
                        alt={crop.imageAlt}
                        className="w-10 h-10 rounded-lg object-contain bg-white border border-[#E2DFD7] p-1 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1A231E] truncate">{crop.name}</p>
                        <p className="text-[10px] text-[#5A655E] truncate">{crop.bed}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-[10px] font-medium">
                          {crop.stage}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[#E2DFD7]/60 flex justify-between text-[11px] text-[#5A655E]">
                      <span>Riego: {crop.waterFrequencyDays}d</span>
                      <span className="font-semibold text-[#2D5A27]">{crop.daysToHarvest}d a cosecha</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      ) : (
        /* ============================================================ */
        /* VISTA PARA USUARIOS NO AUTENTICADOS: LANDING DE CONVERSIÓN  */
        /* (DIRIGIDA A QUIENES QUIEREN CUIDAR SUS PLANTAS Y CULTIVOS)   */
        /* ============================================================ */
        <>
          {/* Hero Section: Enfoque para quienes creen no tener mano con las plantas */}
          <section className="pt-8 pb-12 sm:pt-14 sm:pb-20 border-b border-[#E2DFD7] bg-gradient-to-b from-[#FAF9F6] to-[#F5F2EA]/40">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="lg:col-span-7 space-y-6"
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D5A27]/10 border border-[#2D5A27]/20 text-[#2D5A27] text-xs font-semibold">
                    <HeartHandshake className="w-4 h-4" />
                    <span>¿Crees no tener «buena mano» para las plantas?</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1A231E] leading-[1.12]">
                    Tener mano verde no es un don.{' '}
                    <span className="text-[#2D5A27] block sm:inline">Es tener la información correcta a tiempo.</span>
                  </h1>

                  <p className="text-base sm:text-lg text-[#4A554E] max-w-xl leading-relaxed">
                    A casi todos se nos ha muerto una albahaca en la ventana o un tomate por exceso de agua. 
                    <strong className="text-[#1A231E] font-semibold"> Mi Huerta Casera</strong> te guía día a día con alertas exactas de riego, horas de sol y cuidados para que tus plantas prosperen sin frustración.
                  </p>

                  {/* CTA Principal en el primer Viewport */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex items-center">
                      <GoogleAuthButton onAuthChange={onAuthChange} />
                    </div>
                    <span className="text-xs text-[#5A655E] self-center">o prueba con acceso demo inmediato</span>
                  </div>

                  <div className="pt-4 grid grid-cols-3 gap-4 border-t border-[#E2DFD7] text-xs text-[#4A554E]">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                      <span>Cero conjeturas en el riego</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                      <span>Guía paso a paso por etapas</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                      <span>Gratuito y sin tarjeta</span>
                    </div>
                  </div>
                </motion.div>

                {/* Gráfico / Ilustración interactiva Hero */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="lg:col-span-5"
                >
                  <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#F2EFE9]">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400"></span>
                        <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                        <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#2D5A27] bg-[#2D5A27]/10 px-2.5 py-0.5 rounded-full">
                        Asistente Inteligente
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E2DFD7] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <Droplets className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-bold text-[#1A231E]">Albahaca en maceta</p>
                          <p className="text-[#5A655E]">Humedad óptima: 68% · Riego cada 2 días</p>
                        </div>
                        <span className="text-[10px] font-bold text-[#2D5A27] bg-white border border-[#2D5A27]/30 px-2 py-1 rounded-lg">
                          ¡Toca hoy!
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E2DFD7] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                          <Sun className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-bold text-[#1A231E]">Tomate Cherry</p>
                          <p className="text-[#5A655E]">Floración activa · Requiere 7.5h sol</p>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 bg-white border border-amber-300 px-2 py-1 rounded-lg">
                          18d a cosecha
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#2D5A27]/5 border border-[#2D5A27]/20 text-xs space-y-1.5">
                        <p className="font-bold text-[#2D5A27] flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-[#2D5A27]" />
                          <span>Consejo del experto:</span>
                        </p>
                        <p className="text-[#4A554E] leading-relaxed text-[11px]">
                          «No riegues por rutina fija de calendario: comprueba la tierra con el dedo y usa las recomendaciones de tu huerta.»
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 text-center">
                      <p className="text-[11px] text-[#5A655E]">
                        Inicia sesión arriba para cargar o crear tus propios cultivos.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Sección 2: El mito de "no tener mano para las plantas" */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A27]">
                Desmontando mitos
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-[#1A231E]">
                ¿Por qué se nos mueren las plantas en casa?
              </h2>
              <p className="text-xs sm:text-sm text-[#4A554E]">
                No es mala suerte ni falta de talento. Son 3 errores universales que resolvemos con método.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-[#E2DFD7] rounded-2xl p-6 space-y-4 hover:border-[#2D5A27]/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h3 className="text-base font-bold text-[#1A231E]">
                  «Amor mortal»: El exceso de agua
                </h3>
                <p className="text-xs text-[#4A554E] leading-relaxed">
                  Creer que si las hojas caen o amarillean necesitan más agua. El encharcamiento pudre las raíces silenciosamente bajo tierra.
                </p>
                <div className="text-[11px] font-semibold text-[#2D5A27] bg-[#2D5A27]/5 p-2.5 rounded-lg border border-[#2D5A27]/10">
                  Solución: Te indicamos los días exactos y la humedad requerida por especie.
                </div>
              </div>

              <div className="bg-white border border-[#E2DFD7] rounded-2xl p-6 space-y-4 hover:border-[#2D5A27]/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h3 className="text-base font-bold text-[#1A231E]">
                  Ubicación incorrecta (falta de luz)
                </h3>
                <p className="text-xs text-[#4A554E] leading-relaxed">
                  Poner plantas de huerto de frutos (como tomates o pimientos) en rincones oscuros donde no reciben las 6-8 horas mínimas de sol.
                </p>
                <div className="text-[11px] font-semibold text-[#2D5A27] bg-[#2D5A27]/5 p-2.5 rounded-lg border border-[#2D5A27]/10">
                  Solución: Elige el bancal o maceta adecuado con nuestro selector de exposición.
                </div>
              </div>

              <div className="bg-white border border-[#E2DFD7] rounded-2xl p-6 space-y-4 hover:border-[#2D5A27]/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h3 className="text-base font-bold text-[#1A231E]">
                  Desconocer las etapas botánicas
                </h3>
                <p className="text-xs text-[#4A554E] leading-relaxed">
                  Una plántula recién nacida no necesita los mismos cuidados que una tomatera en plena floración o maduración de fruto.
                </p>
                <div className="text-[11px] font-semibold text-[#2D5A27] bg-[#2D5A27]/5 p-2.5 rounded-lg border border-[#2D5A27]/10">
                  Solución: Seguimiento secuencial de Semilla → Plántula → Crecimiento → Floración → Cosecha.
                </div>
              </div>
            </div>
          </section>

          {/* Herramienta Interactiva: Diagnóstico rápido de síntomas comunes */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="bg-white border border-[#E2DFD7] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#F2EFE9] pb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D5A27] mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Herramienta Interactiva</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1A231E]">
                    Simulador: ¿Qué le ocurre a mi cultivo ahora mismo?
                  </h2>
                  <p className="text-xs text-[#5A655E]">
                    Toca un síntoma frecuente para ver la causa real y cómo recuperarlo.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#5A655E]">¿Te suena familiar?</span>
                  <span className="text-xs font-bold text-[#2D5A27] bg-[#2D5A27]/10 px-2.5 py-1 rounded-full">
                    Aprende en 30 seg
                  </span>
                </div>
              </div>

              {/* Botones de síntomas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {PLANT_PROBLEMS.map((prob, index) => {
                  const isSelected = activeSymptomIndex === index;
                  return (
                    <button
                      key={prob.id}
                      type="button"
                      onClick={() => setActiveSymptomIndex(index)}
                      className={`p-4 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'border-[#2D5A27] bg-[#2D5A27]/5 shadow-xs ring-1 ring-[#2D5A27]'
                          : 'border-[#E2DFD7] bg-[#FAF9F6] hover:bg-white'
                      }`}
                    >
                      <span className="text-xs font-semibold text-[#1A231E] leading-snug">
                        {prob.symptom}
                      </span>
                      <span className={`text-[10px] font-bold self-start px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-[#2D5A27] text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {isSelected ? 'Analizando...' : 'Ver causa'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Resultado interactivo del síntoma */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSymptomIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#FAF9F6] border border-[#D5E0D3] rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
                >
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-red-700 uppercase tracking-wide flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Diagnóstico botánico</span>
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-[#1A231E]">
                      {PLANT_PROBLEMS[activeSymptomIndex].symptom}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A554E] leading-relaxed">
                      {PLANT_PROBLEMS[activeSymptomIndex].cause}
                    </p>
                  </div>

                  <div className="bg-white border border-[#E2DFD7] rounded-xl p-5 space-y-3">
                    <span className="text-[11px] font-bold text-[#2D5A27] uppercase tracking-wide flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>Acción recomendada</span>
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-[#1A231E] leading-relaxed">
                      {PLANT_PROBLEMS[activeSymptomIndex].solution}
                    </p>
                    <div className="pt-2 flex items-center justify-between text-xs text-[#5A655E]">
                      <span>Dificultad de solución: <strong>{PLANT_PROBLEMS[activeSymptomIndex].difficulty}</strong></span>
                      <span className="text-[#2D5A27] font-semibold">Prevenible al 100%</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* Cómo te ayuda la app paso a paso */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A27]">
                Flujo simplificado
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-[#1A231E]">
                Cuidar tu huerta nunca fue tan intuitivo
              </h2>
              <p className="text-xs sm:text-sm text-[#4A554E]">
                Diseñado para eliminar fricciones y evitar que llenes decenas de formularios complicados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2DFD7] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-base font-bold text-[#1A231E]">Elige o crea tu bancal</h3>
                <p className="text-xs text-[#5A655E] leading-relaxed">
                  Configura tus espacios (mesas de cultivo, jardineras, macetas en balcón). Si se te ocurre uno nuevo mientras registras tu planta, lo creas en el mismo lugar sin salir.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2DFD7] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-base font-bold text-[#1A231E]">Selecciona la variedad</h3>
                <p className="text-xs text-[#5A655E] leading-relaxed">
                  Tomate Cherry, Lechuga Hoja de Roble, Albahaca Genovesa, Zanahorias... La app precarga automáticamente los días a cosecha, horas de sol y humedad ideal.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2DFD7] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-base font-bold text-[#1A231E]">Recibe tu plan diario</h3>
                <p className="text-xs text-[#5A655E] leading-relaxed">
                  El calendario te muestra exactamente cuándo regar, podar brotes axilares, abonar o cosechar. Tú solo disfrutas de ver tus plantas crecer.
                </p>
              </div>
            </div>
          </section>

          {/* Llamado a la acción inferior */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="bg-[#2D5A27] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6">
              <div className="max-w-xl mx-auto space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                  <Sprout className="w-4 h-4 text-emerald-300" />
                  <span>Comienza hoy mismo</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
                  Descubre lo satisfactorio que es cosechar tu propia comida
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                  Inicia sesión de forma segura con tu cuenta de Google o accede mediante la demo instantánea.
                </p>
              </div>

              <div className="flex justify-center pt-2">
                <div className="bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur inline-block">
                  <GoogleAuthButton onAuthChange={onAuthChange} />
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Sección Legal de Transparencia y Consentimientos */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-[#F2EFE9] border border-[#E2DFD7] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D5A27]">
              <ShieldCheck className="w-4 h-4" />
              <span>Responsable: las paginas de dani</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#1A231E]">
              Privacidad de datos y registro de consentimientos
            </h2>
            <p className="text-xs text-[#4A554E]">
              Cumplimiento con RGPD/LOPD. Auditoría técnica registrada de aceptaciones independientes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('auditoria')}
              className="px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#D5E0D3] text-xs font-semibold text-[#1A231E] hover:bg-[#FAF9F6] cursor-pointer"
            >
              Auditoría
            </button>
            <button
              type="button"
              onClick={() => onNavigate('privacidad')}
              className="px-4 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#D5E0D3] text-xs font-semibold text-[#1A231E] hover:bg-white cursor-pointer"
            >
              Privacidad
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
