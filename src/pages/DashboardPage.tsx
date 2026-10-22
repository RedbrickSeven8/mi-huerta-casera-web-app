import React, { useState } from 'react';
import { Droplets, Sun, Sprout, Plus, Trash2, CheckCircle, Lock, LogIn } from 'lucide-react';
import type { CropItem, CropStage, PageRoute } from '../types/huerta';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import type { UserProfile } from '../services/authService';

interface DashboardPageProps {
  crops: CropItem[];
  onWaterCrop: (cropId: string) => void;
  onAdvanceStage: (cropId: string) => void;
  onDeleteCrop: (cropId: string) => void;
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
  onNavigate,
  user,
  onAuthChange
}) => {
  const [selectedStage, setSelectedStage] = useState<string>('Todos');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A231E]">
            Acceso Restringido a Mi Huerta
          </h1>
          <p className="text-sm text-[#4A554E] max-w-md mx-auto leading-relaxed">
            Para ver tu panel de huerta personal y mantener sincronizados tus cultivos entre todos tus dispositivos, por favor inicia sesión.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-[#E2DFD7] shadow-xs max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#2D5A27]">
            <LogIn className="w-4 h-4" />
            <span>Elige un método de inicio de sesión</span>
          </div>
          <div className="flex justify-center pt-2">
            <GoogleAuthButton onAuthChange={onAuthChange} />
          </div>
          <p className="text-[11px] text-[#5A655E]">
            Tus datos se guardan y sincronizan de forma segura en tu cuenta.
          </p>
        </div>
      </div>
    );
  }

  const filteredCrops = selectedStage === 'Todos'
    ? crops
    : crops.filter((c) => c.stage === selectedStage);

  const handleWater = (crop: CropItem) => {
    onWaterCrop(crop.id);
    setFeedbackMessage(`Riego registrado en ${crop.name}. Humedad actualizada.`);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DFD7] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A231E]">
            Panel de Seguimiento de Mi Huerta
          </h1>
          <p className="text-sm text-[#4A554E] mt-1">
            Monitorea el estado fenológico, humedad del sustrato y riego de tus cultivos activos. Sincronizado para {user.name}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('calendario')}
            className="px-4 py-2.5 rounded-xl bg-[#F2EFE9] text-[#1A231E] text-xs sm:text-sm font-medium hover:bg-[#E2DFD7] cursor-pointer"
          >
            Ver Calendario de Riego
          </button>
          <button
            type="button"
            onClick={() => onNavigate('registro')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-xs sm:text-sm font-semibold hover:bg-[#23471E] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cultivo</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3.5 rounded-xl bg-[#2D5A27]/10 border border-[#2D5A27]/30 text-[#1A231E] text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#2D5A27] shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-xl p-4">
          <span className="text-xs text-[#5A655E]">Total Cultivos</span>
          <p className="text-2xl font-bold text-[#1A231E] mt-1">{crops.length}</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-xl p-4">
          <span className="text-xs text-[#5A655E]">Humedad Promedio</span>
          <p className="text-2xl font-bold text-[#2D5A27] mt-1">
            {crops.length > 0
              ? Math.round(crops.reduce((acc, c) => acc + c.moisturePercent, 0) / crops.length)
              : 0}%
          </p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-xl p-4">
          <span className="text-xs text-[#5A655E]">Próxima Cosecha</span>
          <p className="text-2xl font-bold text-[#1A231E] mt-1">
            {crops.length > 0 ? Math.min(...crops.map((c) => c.daysToHarvest)) : 0} días
          </p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-xl p-4">
          <span className="text-xs text-[#5A655E]">Exposición Solar Media</span>
          <p className="text-2xl font-bold text-[#1A231E] mt-1">
            {crops.length > 0
              ? (crops.reduce((acc, c) => acc + c.sunHours, 0) / crops.length).toFixed(1)
              : 0} h/día
          </p>
        </div>
      </div>

      {/* Filter by Stage */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E2DFD7] pb-4">
        <span className="text-xs font-semibold text-[#5A655E] mr-2">Filtrar por etapa:</span>
        <button
          type="button"
          onClick={() => setSelectedStage('Todos')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            selectedStage === 'Todos'
              ? 'bg-[#2D5A27] text-[#FAF9F6]'
              : 'bg-[#F2EFE9] text-[#4A554E] hover:bg-[#E2DFD7]'
          }`}
        >
          Todos
        </button>
        {STAGES.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setSelectedStage(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
              selectedStage === st
                ? 'bg-[#2D5A27] text-[#FAF9F6]'
                : 'bg-[#F2EFE9] text-[#4A554E] hover:bg-[#E2DFD7]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Crop Cards */}
      {filteredCrops.length === 0 ? (
        <div className="p-12 text-center bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl space-y-3">
          <Sprout className="w-10 h-10 text-[#8A968E] mx-auto" />
          <p className="text-sm font-semibold text-[#1A231E]">
            No hay cultivos registrados en esta etapa.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('registro')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#2D5A27] underline"
          >
            Registrar un cultivo ahora →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <article
              key={crop.id}
              className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={crop.imageUrl}
                    alt={crop.imageAlt}
                    className="w-14 h-14 rounded-xl object-cover border border-[#E2DFD7] bg-[#F2EFE9]"
                    width={56}
                    height={56}
                  />
                  <div>
                    <span className="text-xs font-medium text-[#2D5A27] bg-[#2D5A27]/10 px-2.5 py-0.5 rounded-full">
                      {crop.bed}
                    </span>
                    <h2 className="text-lg font-bold text-[#1A231E] mt-1">{crop.name}</h2>
                    <p className="text-xs italic text-[#5A655E]">{crop.variety}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteCrop(crop.id)}
                  title="Eliminar cultivo"
                  aria-label={`Eliminar cultivo ${crop.name}`}
                  className="p-2 text-[#8A968E] hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-[#FAF9F6] p-3.5 rounded-xl border border-[#E2DFD7] text-xs">
                <div>
                  <span className="text-[#5A655E] flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-[#2D5A27]" /> Humedad
                  </span>
                  <span className="font-bold text-sm text-[#1A231E] mt-0.5 block">
                    {crop.moisturePercent}%
                  </span>
                </div>
                <div>
                  <span className="text-[#5A655E] flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-600" /> Luz directa
                  </span>
                  <span className="font-bold text-sm text-[#1A231E] mt-0.5 block">
                    {crop.sunHours} h/día
                  </span>
                </div>
                <div>
                  <span className="text-[#5A655E] flex items-center gap-1">
                    <Sprout className="w-3.5 h-3.5 text-[#2D5A27]" /> Etapa
                  </span>
                  <span className="font-bold text-sm text-[#2D5A27] mt-0.5 block">
                    {crop.stage}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#4A554E]">
                <div className="flex justify-between">
                  <span>Último riego registrado:</span>
                  <strong className="text-[#1A231E]">{crop.lastWatered}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Frecuencia recomendada:</span>
                  <strong className="text-[#1A231E]">Cada {crop.waterFrequencyDays} día(s)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tiempo estimado para cosecha:</span>
                  <strong className="text-[#2D5A27]">{crop.daysToHarvest} días</strong>
                </div>
                <p className="pt-2 text-[#5A655E] border-t border-[#F2EFE9]">
                  Nota técnica: {crop.notes}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleWater(crop)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-xs font-semibold hover:bg-[#23471E] transition-colors cursor-pointer"
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span>Registrar Riego (+Humedad)</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAdvanceStage(crop.id)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#F2EFE9] text-[#1A231E] text-xs font-medium hover:bg-[#E2DFD7] transition-colors cursor-pointer"
                >
                  Avanzar Etapa
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
