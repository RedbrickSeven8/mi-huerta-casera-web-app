import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sprout, ShieldCheck } from 'lucide-react';
import type { CropItem, PageRoute } from '../types/huerta';

interface HomePageProps {
  crops: CropItem[];
  onNavigate: (route: PageRoute) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ crops, onNavigate }) => {
  return (
    <div className="space-y-16">
      {/* Primer viewport */}
      <section className="pt-6 pb-10 md:py-14 border-b border-[#E2DFD7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="lg:col-span-7 space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-xs font-semibold">
              <Sprout className="w-3.5 h-3.5" />
              <span>Gestión de Huerta</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1A231E] leading-[1.15]">
              Control y seguimiento de tu huerta.
            </h1>

            <p className="text-base sm:text-lg text-[#4A554E] max-w-xl">
              Siembra, riego, etapas y cosecha en un solo lugar.
            </p>

            {/* CTA principal */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#2D5A27] text-[#FAF9F6] font-semibold text-sm sm:text-base hover:bg-[#23471E] transition-colors shadow-sm cursor-pointer"
              >
                <span>Abrir Mi Huerta</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => onNavigate('registro')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#F2EFE9] text-[#1A231E] font-medium text-sm sm:text-base hover:bg-[#E2DFD7] transition-colors cursor-pointer"
              >
                <span>Añadir Cultivo</span>
              </motion.button>
            </div>

            <div className="pt-2 grid grid-cols-3 gap-4 border-t border-[#E2DFD7] text-xs text-[#4A554E]">
              <div>
                <span className="block font-bold text-base text-[#1A231E]">{crops.length}</span>
                <span>Cultivos</span>
              </div>
              <div>
                <span className="block font-bold text-base text-[#2D5A27]">72%</span>
                <span>Humedad media</span>
              </div>
              <div>
                <span className="block font-bold text-base text-[#1A231E]">Bitácora</span>
                <span>Registro activo</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl p-4 shadow-xs">
              <img
                src="/hero-garden.svg"
                alt="Panel de control"
                className="w-full h-auto rounded-xl"
                width={640}
                height={480}
              />
              <div className="mt-3 flex items-center justify-between text-xs text-[#5A655E] px-1">
                <span>Estado de bancales</span>
                <button
                  type="button"
                  onClick={() => onNavigate('calendario')}
                  className="text-[#2D5A27] font-semibold hover:underline"
                >
                  Calendario →
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cultivos destacados */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1A231E]">Cultivos</h2>
            <p className="text-xs text-[#5A655E]">Variedades en seguimiento</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#F2EFE9] text-[#1A231E] hover:bg-[#E2DFD7]"
          >
            Ver todos ({crops.length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {crops.slice(0, 4).map((crop) => (
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              key={crop.id}
              className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-xl p-4 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={crop.imageUrl}
                  alt={crop.imageAlt}
                  className="w-12 h-12 rounded-lg object-contain bg-[#FAF9F6] border border-[#E2DFD7] p-1 shrink-0"
                  width={48}
                  height={48}
                />
                <div className="min-w-0">
                  <div className="flex items-center justify-between text-xs text-[#5A655E] mb-0.5">
                    <span className="truncate">{crop.bed}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-[#1A231E] truncate">{crop.name}</h3>
                  <span className="px-2 py-0.2 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-[10px] font-medium inline-block mt-0.5">
                    {crop.stage}
                  </span>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-[#F2EFE9] text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5A655E]">Humedad:</span>
                  <span className="font-semibold text-blue-700">{crop.recommendedMoisturePercent || 70}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A655E]">Cosecha:</span>
                  <span className="font-medium text-[#1A231E]">{crop.daysToHarvest} días</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Sección Legal */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-[#F2EFE9] border border-[#E2DFD7] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D5A27]">
              <ShieldCheck className="w-4 h-4" />
              <span>Responsable: las paginas de dani</span>
            </div>
            <h2 className="text-lg font-bold text-[#1A231E]">
              Registro de consentimientos y privacidad
            </h2>
            <p className="text-xs text-[#4A554E]">
              Consentimientos independientes auditados con fecha y método de aceptación.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('auditoria')}
              className="px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#D5E0D3] text-xs font-semibold text-[#1A231E] hover:bg-[#FAF9F6]"
            >
              Auditoría
            </button>
            <button
              type="button"
              onClick={() => onNavigate('registro')}
              className="px-4 py-2.5 rounded-xl bg-[#2D5A27] text-xs font-semibold text-[#FAF9F6] hover:bg-[#23471E]"
            >
              Comenzar
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
