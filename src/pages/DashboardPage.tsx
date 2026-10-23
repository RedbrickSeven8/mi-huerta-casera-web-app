import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Droplets,
  Sun,
  Sprout,
  Plus,
  Trash2,
  CheckCircle,
  Lock,
  BookOpen,
  MapPin,
  Layers,
  Sparkles
} from 'lucide-react';
import type { CropItem, CropStage, CropLogEntry, PageRoute } from '../types/huerta';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { CropLogModal } from '../components/CropLogModal';
import type { UserProfile } from '../services/authService';

interface DashboardPageProps {
  crops: CropItem[];
  onWaterCrop: (cropId: string) => void;
  onAdvanceStage: (cropId: string) => void;
  onDeleteCrop: (cropId: string) => void;
  onAddLogEntry: (cropId: string, entry: Omit<CropLogEntry, 'id'>) => void;
  onDeleteLogEntry: (cropId: string, logId: string) => void;
  onNavigate: (route: PageRoute) => void;
  user: UserProfile | null;
  onAuthChange: (user: UserProfile | null) => void;
}

const STAGES: CropStage[] = ['Semilla', 'Plántula', 'Crecimiento', 'Floración', 'Cosecha'];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  crops,
  onWaterCrop,
  onAdvanceStage,
  onDeleteCrop,
  onAddLogEntry,
  onDeleteLogEntry,
  onNavigate,
  user,
  onAuthChange
}) => {
  const [selectedBed, setSelectedBed] = useState<string>('Todas');
  const [selectedStage, setSelectedStage] = useState<string>('Todos');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [activeLogCrop, setActiveLogCrop] = useState<CropItem | null>(null);

  const availableBeds = useMemo(() => {
    const beds = Array.from(new Set(crops.map((c) => c.bed).filter(Boolean)));
    return ['Todas', ...beds];
  }, [crops]);

  const bedCounts = useMemo(() => {
    const counts: Record<string, number> = { Todas: crops.length };
    crops.forEach((c) => {
      counts[c.bed] = (counts[c.bed] || 0) + 1;
    });
    return counts;
  }, [crops]);

  const cropsByBed = useMemo(() => {
    if (selectedBed === 'Todas') return crops;
    return crops.filter((c) => c.bed === selectedBed);
  }, [crops, selectedBed]);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { Todos: cropsByBed.length };
    STAGES.forEach((s) => {
      counts[s] = 0;
    });
    cropsByBed.forEach((c) => {
      counts[c.stage] = (counts[c.stage] || 0) + 1;
    });
    return counts;
  }, [cropsByBed]);

  const filteredCrops = useMemo(() => {
    if (selectedStage === 'Todos') return cropsByBed;
    return cropsByBed.filter((c) => c.stage === selectedStage);
  }, [cropsByBed, selectedStage]);

  const panelMetrics = useMemo(() => {
    const total = cropsByBed.length;
    const inHarvest = cropsByBed.filter((c) => c.stage === 'Cosecha').length;
    const nextHarvestDays = total > 0
      ? Math.min(...cropsByBed.map((c) => c.daysToHarvest))
      : 0;
    const avgMoisture = total > 0
      ? Math.round(cropsByBed.reduce((acc, c) => acc + (c.recommendedMoisturePercent || 70), 0) / total)
      : 0;

    return {
      total,
      inHarvest,
      nextHarvestDays,
      avgMoisture
    };
  }, [cropsByBed]);

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A231E]">
            Acceso
          </h1>
          <p className="text-sm text-[#4A554E] max-w-md mx-auto">
            Inicia sesión para ver tu huerta.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-[#E2DFD7] shadow-xs max-w-md mx-auto space-y-4">
          <div className="flex justify-center pt-2">
            <GoogleAuthButton onAuthChange={onAuthChange} />
          </div>
        </div>
      </motion.div>
    );
  }

  const handleWater = (crop: CropItem) => {
    onWaterCrop(crop.id);
    setFeedbackMessage(`Riego en ${crop.name}.`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DFD7] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A231E]">
            Mi Huerta
          </h1>
          <p className="text-sm text-[#4A554E] mt-1">
            Cultivos de {user.name}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => onNavigate('calendario')}
            className="px-4 py-2.5 rounded-xl bg-[#F2EFE9] text-[#1A231E] text-xs sm:text-sm font-medium hover:bg-[#E2DFD7] transition-colors cursor-pointer"
          >
            Calendario
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => onNavigate('registro')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-xs sm:text-sm font-semibold hover:bg-[#23471E] transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cultivo</span>
          </motion.button>
        </div>
      </div>

      {/* Feedback toast */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3.5 rounded-xl bg-[#2D5A27]/10 border border-[#2D5A27]/30 text-[#2D5A27] text-sm font-medium flex items-center gap-2.5"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtro Ubicación */}
      <div className="space-y-2 bg-[#FAF9F6] p-4 rounded-2xl border border-[#E2DFD7]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1A231E]">
          <MapPin className="w-4 h-4 text-[#2D5A27]" />
          <span>Ubicación / Bancal:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {availableBeds.map((bedName) => {
            const count = bedCounts[bedName] || 0;
            const isSelected = selectedBed === bedName;
            return (
              <motion.button
                key={bedName}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setSelectedBed(bedName)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#2D5A27] text-[#FAF9F6] shadow-xs'
                    : 'bg-white border border-[#E2DFD7] text-[#4A554E] hover:border-[#2D5A27]'
                }`}
              >
                <span>{bedName}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#F2EFE9] text-[#1A231E]'
                  }`}
                >
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-white border border-[#E2DFD7] shadow-xs transition-shadow"
        >
          <span className="text-xs text-[#5A655E] flex items-center justify-between">
            <span>Total Cultivos</span>
            <Layers className="w-3.5 h-3.5 text-[#2D5A27]" />
          </span>
          <p className="text-2xl font-bold text-[#1A231E] mt-1">{panelMetrics.total}</p>
          <span className="text-[11px] text-[#5A655E]">{selectedBed}</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-white border border-[#E2DFD7] shadow-xs transition-shadow"
        >
          <span className="text-xs text-[#5A655E] flex items-center justify-between">
            <span>En Cosecha</span>
            <Sprout className="w-3.5 h-3.5 text-[#2D5A27]" />
          </span>
          <p className="text-2xl font-bold text-[#2D5A27] mt-1">{panelMetrics.inHarvest}</p>
          <span className="text-[11px] text-[#5A655E]">Listos</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-white border border-[#E2DFD7] shadow-xs transition-shadow"
        >
          <span className="text-xs text-[#5A655E] flex items-center justify-between">
            <span>Próxima Cosecha</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          </span>
          <p className="text-2xl font-bold text-[#1A231E] mt-1">
            {panelMetrics.total > 0 ? `${panelMetrics.nextHarvestDays} días` : '—'}
          </p>
          <span className="text-[11px] text-[#5A655E]">Plazo mínimo</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-white border border-[#E2DFD7] shadow-xs transition-shadow"
        >
          <span className="text-xs text-[#5A655E] flex items-center justify-between">
            <span>Humedad</span>
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
          </span>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {panelMetrics.total > 0 ? `${panelMetrics.avgMoisture}%` : '—'}
          </p>
          <span className="text-[11px] text-[#5A655E]">Recomendada</span>
        </motion.div>
      </div>

      {/* Filtro Etapa */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2DFD7] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#1A231E] mr-1">Etapa:</span>
          {['Todos', ...STAGES].map((stageName) => {
            const count = stageCounts[stageName] || 0;
            const isSelected = selectedStage === stageName;
            return (
              <motion.button
                key={stageName}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setSelectedStage(stageName)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#2D5A27] text-[#FAF9F6] shadow-xs'
                    : 'bg-white border border-[#E2DFD7] text-[#4A554E] hover:border-[#2D5A27]'
                }`}
              >
                <span>{stageName}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#F2EFE9] text-[#1A231E]'
                  }`}
                >
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>
        <span className="text-xs text-[#5A655E]">
          {filteredCrops.length} de {crops.length}
        </span>
      </div>

      {/* Lista de Cultivos */}
      {filteredCrops.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-[#D5E0D3] bg-white space-y-3">
          <Sprout className="w-10 h-10 mx-auto text-[#8A968E]" />
          <h3 className="font-semibold text-base text-[#1A231E]">
            Sin cultivos
          </h3>
          <p className="text-xs text-[#5A655E]">
            No hay registros para este filtro.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedBed('Todas');
              setSelectedStage('Todos');
            }}
            className="px-4 py-2 rounded-xl bg-[#F2EFE9] text-xs font-semibold text-[#1A231E] hover:bg-[#E2DFD7] cursor-pointer"
          >
            Restablecer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <motion.article
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              key={crop.id}
              className="bg-white rounded-2xl border border-[#E2DFD7] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={crop.imageUrl}
                    alt={crop.imageAlt}
                    className="w-14 h-14 rounded-xl object-contain bg-[#FAF9F6] border border-[#E2DFD7] shrink-0 p-1"
                    width={56}
                    height={56}
                  />
                  <div>
                    <span className="text-xs font-medium text-[#2D5A27] bg-[#2D5A27]/10 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {crop.bed}
                    </span>
                    <h2 className="text-lg font-bold text-[#1A231E] mt-1">{crop.name}</h2>
                    <p className="text-xs italic text-[#5A655E]">{crop.variety}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteCrop(crop.id)}
                  title="Eliminar"
                  aria-label={`Eliminar ${crop.name}`}
                  className="p-2 text-[#8A968E] hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Indicadores */}
              <div className="grid grid-cols-3 gap-3 bg-[#FAF9F6] p-3.5 rounded-xl border border-[#E2DFD7] text-xs">
                <div>
                  <span className="text-[#5A655E] flex items-center gap-1 text-[11px]">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" /> Humedad
                  </span>
                  <span className="font-bold text-sm text-blue-800 mt-0.5 block">
                    {crop.recommendedMoisturePercent || 70}%
                  </span>
                </div>
                <div>
                  <span className="text-[#5A655E] flex items-center gap-1 text-[11px]">
                    <Sun className="w-3.5 h-3.5 text-amber-600" /> Sol
                  </span>
                  <span className="font-bold text-sm text-[#1A231E] mt-0.5 block">
                    {crop.sunHours} h/d
                  </span>
                </div>
                <div>
                  <span className="text-[#5A655E] flex items-center gap-1 text-[11px]">
                    <Sprout className="w-3.5 h-3.5 text-[#2D5A27]" /> Etapa
                  </span>
                  <span className="font-bold text-sm text-[#2D5A27] mt-0.5 block">
                    {crop.stage}
                  </span>
                </div>
              </div>

              {/* Datos */}
              <div className="space-y-1.5 text-xs text-[#4A554E]">
                <div className="flex justify-between items-center py-0.5 border-b border-[#F2EFE9]">
                  <span className="text-[#5A655E]">Último riego:</span>
                  <strong className="text-[#1A231E] bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E2DFD7]">
                    {crop.lastWatered}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Riego:</span>
                  <strong className="text-[#1A231E]">Cada {crop.waterFrequencyDays} d</strong>
                </div>
                <div className="flex justify-between">
                  <span>Cosecha:</span>
                  <strong className="text-[#2D5A27] font-semibold">{crop.daysToHarvest} días</strong>
                </div>
                {crop.notes && (
                  <p className="pt-2 text-[11px] text-[#5A655E] border-t border-[#F2EFE9] line-clamp-1">
                    {crop.notes}
                  </p>
                )}
              </div>

              {/* Bitácora */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setActiveLogCrop(crop)}
                  className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#D5E0D3] hover:border-[#2D5A27] text-xs font-medium text-[#1A231E] transition-colors cursor-pointer group"
                >
                  <span className="inline-flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#2D5A27]" />
                    <span>Bitácora ({crop.log?.length || 0})</span>
                  </span>
                  <span className="text-[#2D5A27] text-xs group-hover:translate-x-0.5 transition-transform">
                    Abrir →
                  </span>
                </button>
              </div>

              {/* Botones de acción */}
              <div className="pt-1 flex flex-wrap items-center gap-2.5">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleWater(crop)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-xs font-semibold hover:bg-[#23471E] transition-colors cursor-pointer shadow-xs"
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span>Regar</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => onAdvanceStage(crop.id)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#F2EFE9] text-[#1A231E] text-xs font-medium hover:bg-[#E2DFD7] transition-colors cursor-pointer"
                >
                  Avanzar Etapa
                </motion.button>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {/* Bitácora Modal */}
      {activeLogCrop && (
        <CropLogModal
          crop={crops.find((c) => c.id === activeLogCrop.id) || activeLogCrop}
          onClose={() => setActiveLogCrop(null)}
          onAddLogEntry={onAddLogEntry}
          onDeleteLogEntry={onDeleteLogEntry}
        />
      )}
    </motion.div>
  );
};
