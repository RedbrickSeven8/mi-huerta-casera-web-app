import React, { useState, useMemo } from 'react';
import {
  Droplets,
  Sun,
  Sprout,
  Plus,
  Trash2,
  CheckCircle,
  Lock,
  LogIn,
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

  // Extract unique beds/locations from crops
  const availableBeds = useMemo(() => {
    const beds = Array.from(new Set(crops.map((c) => c.bed).filter(Boolean)));
    return ['Todas', ...beds];
  }, [crops]);

  // Total count per bed/location (calculated over all crops)
  const bedCounts = useMemo(() => {
    const counts: Record<string, number> = { Todas: crops.length };
    crops.forEach((c) => {
      counts[c.bed] = (counts[c.bed] || 0) + 1;
    });
    return counts;
  }, [crops]);

  // Crops filtered by location/bed
  const cropsByBed = useMemo(() => {
    if (selectedBed === 'Todas') return crops;
    return crops.filter((c) => c.bed === selectedBed);
  }, [crops, selectedBed]);

  // Stage counts (reflecting the currently selected bed scope)
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

  // Final filtered crops applying both Bed and Stage filters
  const filteredCrops = useMemo(() => {
    if (selectedStage === 'Todos') return cropsByBed;
    return cropsByBed.filter((c) => c.stage === selectedStage);
  }, [cropsByBed, selectedStage]);

  // Metrics for the summary panel (reflecting the selected bed scope!)
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
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in">
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

  const handleWater = (crop: CropItem) => {
    onWaterCrop(crop.id);
    setFeedbackMessage(`Riego registrado en ${crop.name}. Registro añadido a la bitácora.`);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DFD7] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A231E]">
            Panel de Seguimiento de Mi Huerta
          </h1>
          <p className="text-sm text-[#4A554E] mt-1">
            Monitorea el estado fenológico, bitácora de labores y humedad recomendada por especie. Sincronizado para {user.name}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('calendario')}
            className="px-4 py-2.5 rounded-xl bg-[#F2EFE9] text-[#1A231E] text-xs sm:text-sm font-medium hover:bg-[#E2DFD7] transition-all transform active:scale-95 cursor-pointer"
          >
            Ver Calendario de Tareas
          </button>
          <button
            type="button"
            onClick={() => onNavigate('registro')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-xs sm:text-sm font-semibold hover:bg-[#23471E] transition-all transform active:scale-95 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cultivo</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-[#2D5A27]/10 border border-[#2D5A27]/30 text-[#2D5A27] text-sm font-medium flex items-center gap-2.5 animate-slide-down">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* FILTER 1: UBICACIÓN / BANCAL (Placed right above the summary panel) */}
      <div className="space-y-2 bg-[#FAF9F6] p-4 rounded-2xl border border-[#E2DFD7]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1A231E]">
          <MapPin className="w-4 h-4 text-[#2D5A27]" />
          <span>Filtrar por Ubicación / Bancal (actualiza el panel inferior):</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {availableBeds.map((bedName) => {
            const count = bedCounts[bedName] || 0;
            const isSelected = selectedBed === bedName;
            return (
              <button
                key={bedName}
                type="button"
                onClick={() => setSelectedBed(bedName)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all transform active:scale-95 cursor-pointer ${
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
              </button>
            );
          })}
        </div>
      </div>

      {/* SUMMARY PANEL (Dynamically updates when Ubicación / Bancal filter changes) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E2DFD7] shadow-xs transition-transform hover:-translate-y-0.5">
          <span className="text-xs text-[#5A655E] flex items-center justify-between">
            <span>Total Cultivos</span>
            <Layers className="w-3.5 h-3.5 text-[#2D5A27]" />
          </span>
          <p className="text-2xl font-bold text-[#1A231E] mt-1">{panelMetrics.total}</p>
          <span className="text-[11px] text-[#5A655E]">
            {selectedBed === 'Todas' ? 'En toda la huerta' : selectedBed}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E2DFD7] shadow-xs transition-transform hover:-translate-y-0.5">
          <span className="text-xs text-[#5A655E] flex items-center justify-between">
            <span>En Cosecha Activa</span>
            <Sprout className="w-3.5 h-3.5 text-[#2D5A27]" />
          </span>
          <p className="text-2xl font-bold text-[#2D5A27] mt-1">{panelMetrics.inHarvest}</p>
          <span className="text-[11px] text-[#5A655E]">Listos para recolectar</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E2DFD7] shadow-xs transition-transform hover:-translate-y-0.5">
          <span className="text-xs text-[#5A655E] flex items-center justify-between">
            <span>Próxima Cosecha</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          </span>
          <p className="text-2xl font-bold text-[#1A231E] mt-1">
            {panelMetrics.total > 0 ? `${panelMetrics.nextHarvestDays} días` : '—'}
          </p>
          <span className="text-[11px] text-[#5A655E]">Plazo más cercano</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E2DFD7] shadow-xs transition-transform hover:-translate-y-0.5">
          <span className="text-xs text-[#5A655E] flex items-center justify-between">
            <span>Humedad Recomendada</span>
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
          </span>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {panelMetrics.total > 0 ? `${panelMetrics.avgMoisture}%` : '—'}
          </p>
          <span className="text-[11px] text-[#5A655E]">Promedio diana de especie</span>
        </div>
      </div>

      {/* FILTER 2: ETAPA FENOLÓGICA (With counts of crops in each stage) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2DFD7] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#1A231E] mr-1">Etapa:</span>
          {['Todos', ...STAGES].map((stageName) => {
            const count = stageCounts[stageName] || 0;
            const isSelected = selectedStage === stageName;
            return (
              <button
                key={stageName}
                type="button"
                onClick={() => setSelectedStage(stageName)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all transform active:scale-95 cursor-pointer ${
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
              </button>
            );
          })}
        </div>
        <span className="text-xs text-[#5A655E]">
          Mostrando {filteredCrops.length} de {crops.length} cultivo(s)
        </span>
      </div>

      {/* CROPS LIST / GRID */}
      {filteredCrops.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-[#D5E0D3] bg-white space-y-3">
          <Sprout className="w-10 h-10 mx-auto text-[#8A968E]" />
          <h3 className="font-semibold text-base text-[#1A231E]">
            No hay cultivos en este filtro
          </h3>
          <p className="text-xs text-[#5A655E] max-w-sm mx-auto">
            No se encontraron cultivos para la ubicación "{selectedBed}" y etapa "{selectedStage}".
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedBed('Todas');
              setSelectedStage('Todos');
            }}
            className="px-4 py-2 rounded-xl bg-[#F2EFE9] text-xs font-semibold text-[#1A231E] hover:bg-[#E2DFD7] cursor-pointer"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <article
              key={crop.id}
              className="bg-white rounded-2xl border border-[#E2DFD7] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={crop.imageUrl}
                    alt={crop.imageAlt}
                    className="w-14 h-14 rounded-xl object-cover bg-[#F2EFE9] border border-[#E2DFD7] shrink-0"
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
                  title="Eliminar cultivo"
                  aria-label={`Eliminar cultivo ${crop.name}`}
                  className="p-2 text-[#8A968E] hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Agronomic Indicators: recommended moisture & sun */}
              <div className="grid grid-cols-3 gap-3 bg-[#FAF9F6] p-3.5 rounded-xl border border-[#E2DFD7] text-xs">
                <div>
                  <span className="text-[#5A655E] flex items-center gap-1 text-[11px]">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" /> Humedad rec.
                  </span>
                  <span className="font-bold text-sm text-blue-800 mt-0.5 block">
                    {crop.recommendedMoisturePercent || 70}%
                  </span>
                </div>
                <div>
                  <span className="text-[#5A655E] flex items-center gap-1 text-[11px]">
                    <Sun className="w-3.5 h-3.5 text-amber-600" /> Luz directa
                  </span>
                  <span className="font-bold text-sm text-[#1A231E] mt-0.5 block">
                    {crop.sunHours} h/día
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

              {/* Details & Riego aparte */}
              <div className="space-y-1.5 text-xs text-[#4A554E]">
                <div className="flex justify-between items-center py-0.5 border-b border-[#F2EFE9]">
                  <span className="text-[#5A655E]">Último riego registrado:</span>
                  <strong className="text-[#1A231E] bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E2DFD7]">
                    {crop.lastWatered}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Frecuencia recomendada:</span>
                  <strong className="text-[#1A231E]">Cada {crop.waterFrequencyDays} día(s)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tiempo para cosecha:</span>
                  <strong className="text-[#2D5A27] font-semibold">{crop.daysToHarvest} días</strong>
                </div>
                {crop.notes && (
                  <p className="pt-2 text-[11px] text-[#5A655E] border-t border-[#F2EFE9] line-clamp-2">
                    Nota técnica: {crop.notes}
                  </p>
                )}
              </div>

              {/* Bitácora Preview / Access Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setActiveLogCrop(crop)}
                  className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#D5E0D3] hover:border-[#2D5A27] text-xs font-medium text-[#1A231E] transition-colors cursor-pointer group"
                >
                  <span className="inline-flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#2D5A27]" />
                    <span>Bitácora del cultivo ({crop.log?.length || 0} registros)</span>
                  </span>
                  <span className="text-[#2D5A27] text-xs group-hover:translate-x-0.5 transition-transform">
                    Abrir →
                  </span>
                </button>
              </div>

              {/* Action buttons: Riego aparte and Avanzar Etapa */}
              <div className="pt-1 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleWater(crop)}
                  title="Registrar riego en la bitácora sin modificar la humedad diana de la planta"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-xs font-semibold hover:bg-[#23471E] transition-all transform active:scale-95 cursor-pointer shadow-xs"
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span>Registrar Riego</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAdvanceStage(crop.id)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#F2EFE9] text-[#1A231E] text-xs font-medium hover:bg-[#E2DFD7] transition-all transform active:scale-95 cursor-pointer"
                >
                  Avanzar Etapa
                </button>
              </div>
            </article>
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
    </div>
  );
};
