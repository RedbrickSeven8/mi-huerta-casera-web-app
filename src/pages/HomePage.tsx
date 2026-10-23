import React from 'react';
import { ArrowRight, Droplets, Sun, CalendarCheck, Sprout, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { CropItem, PageRoute } from '../types/huerta';

interface HomePageProps {
  crops: CropItem[];
  onNavigate: (route: PageRoute) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ crops, onNavigate }) => {
  return (
    <div className="space-y-16 animate-fade-in">
      {/* First Viewport Hero Section with Primary CTA above the fold */}
      <section className="pt-6 pb-10 md:py-14 border-b border-[#E2DFD7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-xs font-semibold">
              <Sprout className="w-3.5 h-3.5" />
              <span>Aplicación Web / SaaS · Gestión Hortícola</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1A231E] leading-[1.12]">
              Gestiona y hazle seguimiento a tu huerta casera sin complicaciones.
            </h1>

            <p className="text-base sm:text-lg text-[#4A554E] max-w-xl leading-relaxed">
              Controla ciclos de siembra, humedad de sustrato, frecuencia de riego y fechas estimadas de cosecha desde un único panel minimalista.
            </p>

            {/* Primary CTA in the first viewport */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#2D5A27] text-[#FAF9F6] font-semibold text-sm sm:text-base hover:bg-[#23471E] transition-colors shadow-sm cursor-pointer"
              >
                <span>Abrir Panel de Mi Huerta</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('registro')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#F2EFE9] text-[#1A231E] font-medium text-sm sm:text-base hover:bg-[#E2DFD7] transition-colors cursor-pointer"
              >
                <span>Añadir Cultivo</span>
              </button>
            </div>

            <div className="pt-2 grid grid-cols-3 gap-4 border-t border-[#E2DFD7] text-xs text-[#4A554E]">
              <div>
                <span className="block font-bold text-base text-[#1A231E]">{crops.length} activos</span>
                <span>Cultivos en seguimiento</span>
              </div>
              <div>
                <span className="block font-bold text-base text-[#2D5A27]">72% media</span>
                <span>Humedad óptima en bancal</span>
              </div>
              <div>
                <span className="block font-bold text-base text-[#1A231E]">100% trazable</span>
                <span>Bitácora de riego y cosecha</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl p-4 shadow-xs">
              <img
                src="/hero-garden.svg"
                alt="Vista previa del panel interactivo de Mi Huerta Casera con estado de humedad y cosecha"
                className="w-full h-auto rounded-xl"
                width={640}
                height={480}
              />
              <div className="mt-3 flex items-center justify-between text-xs text-[#5A655E] px-1">
                <span>Estado en vivo de bancales y mesas de cultivo</span>
                <button
                  type="button"
                  onClick={() => onNavigate('calendario')}
                  className="text-[#2D5A27] font-semibold hover:underline"
                >
                  Ver agenda de riego →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SaaS Core Capabilities */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1A231E]">
              Arquitectura pensada para el autocultivo diario
            </h2>
            <p className="text-sm text-[#4A554E] mt-1">
              Módulos de seguimiento con responsabilidad única para cada etapa fenológica de tus plantas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="text-sm font-semibold text-[#2D5A27] hover:underline self-start md:self-auto"
          >
            Explorar todos los cultivos activos →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A231E]">Control de Riego y Humedad</h3>
            <p className="text-sm text-[#4A554E] leading-relaxed">
              Registra cada riego en un clic, actualiza el nivel de humedad del sustrato y evita estrés hídrico o pudrición radicular.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="text-xs font-semibold text-[#2D5A27] hover:underline pt-1 inline-block"
            >
              Ir al monitor de humedad →
            </button>
          </article>

          <article className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A231E]">Calendario de Tareas y Cosecha</h3>
            <p className="text-sm text-[#4A554E] leading-relaxed">
              Planifica abonados orgánicos, podas de mantenimiento, trasplantes y recibe la cuenta regresiva hasta la recolección.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('calendario')}
              className="text-xs font-semibold text-[#2D5A27] hover:underline pt-1 inline-block"
            >
              Consultar calendario semanal →
            </button>
          </article>

          <article className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A231E]">Exposición Solar y Bancales</h3>
            <p className="text-sm text-[#4A554E] leading-relaxed">
              Organiza tus cultivos por mesas, jardineras o bancales según las horas de luz directa y asociaciones favorables.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('registro')}
              className="text-xs font-semibold text-[#2D5A27] hover:underline pt-1 inline-block"
            >
              Configurar nuevo bancal →
            </button>
          </article>
        </div>
      </section>

      {/* Active Crops Snapshot */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1A231E]">Cultivos destacados en tu huerta</h2>
            <p className="text-xs text-[#5A655E]">Vista rápida de las variedades monitorizadas actualmente</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#F2EFE9] text-[#1A231E] hover:bg-[#E2DFD7]"
          >
            Gestionar todos ({crops.length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {crops.slice(0, 4).map((crop) => (
            <div
              key={crop.id}
              className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-xl p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#5A655E] mb-1">
                  <span>{crop.bed}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] font-medium">
                    {crop.stage}
                  </span>
                </div>
                <h3 className="font-semibold text-[#1A231E]">{crop.name}</h3>
                <p className="text-xs italic text-[#5A655E]">{crop.variety}</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#F2EFE9] text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5A655E]">Humedad rec.:</span>
                  <span className="font-semibold text-[#2D5A27]">{crop.recommendedMoisturePercent || 70}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A655E]">Cosecha estimada:</span>
                  <span className="font-medium text-[#1A231E]">{crop.daysToHarvest} días</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Compliance & Transparency Callout */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-[#F2EFE9] border border-[#E2DFD7] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D5A27]">
              <ShieldCheck className="w-4 h-4" />
              <span>Transparencia y Auditoría Técnica · las paginas de dani</span>
            </div>
            <h2 className="text-lg font-bold text-[#1A231E]">
              Privacidad por diseño y registro verificable de consentimientos
            </h2>
            <p className="text-xs sm:text-sm text-[#4A554E]">
              Cada alta de cultivo o suscripción de alertas cuenta con casillas independientes de aceptación legal y registro técnico de fecha, hora y método de aceptación.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('auditoria')}
              className="px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#D5E0D3] text-xs font-semibold text-[#1A231E] hover:bg-[#FAF9F6]"
            >
              Ver Registro de Auditoría
            </button>
            <button
              type="button"
              onClick={() => onNavigate('registro')}
              className="px-4 py-2.5 rounded-xl bg-[#2D5A27] text-xs font-semibold text-[#FAF9F6] hover:bg-[#23471E] inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Comenzar Ahora</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
