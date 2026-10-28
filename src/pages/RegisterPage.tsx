import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Plus,
  MapPin,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';
import type { CropItem, CropStage, PageRoute, GardenLocation, LocationType } from '../types/huerta';
import { recordConsentEvent } from '../services/auditLogger';
import { hasAcceptedLegalConsents, setAcceptedLegalConsents } from '../services/consentService';
import { CROPS_DATABASE, type CropCategory, type CropVarietyInfo, getCropImage } from '../data/cropsDatabase';
import { loadLocations, addLocation } from '../services/huertaStorage';

interface RegisterPageProps {
  onAddCrop: (crop: CropItem) => void;
  onNavigate: (route: PageRoute) => void;
}

const STAGES: CropStage[] = ['Semilla', 'Plántula', 'Crecimiento', 'Floración', 'Cosecha'];

const LOCATION_TYPES: LocationType[] = [
  'Bancal elevado',
  'Mesa de cultivo',
  'Jardinera',
  'Maceta',
  'Suelo directo',
  'Invernadero',
  'Hidroponía / Otro'
];

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const RegisterPage: React.FC<RegisterPageProps> = ({ onAddCrop, onNavigate }) => {
  const [alreadyAcceptedConsents, setAlreadyAcceptedConsents] = useState<boolean>(() => hasAcceptedLegalConsents());

  // Locations list from storage
  const [locations, setLocations] = useState<GardenLocation[]>(() => loadLocations());
  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationType, setNewLocationType] = useState<LocationType>('Bancal elevado');
  const [newLocationSun, setNewLocationSun] = useState<'Pleno sol' | 'Semisombra' | 'Sombra'>('Pleno sol');
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);

  const [selectedCropName, setSelectedCropName] = useState<string>(CROPS_DATABASE[0].cropName);
  const [selectedVarietyName, setSelectedVarietyName] = useState<string>(CROPS_DATABASE[0].varieties[0].varietyName);

  const [plantedDate, setPlantedDate] = useState<string>(getTodayString());
  const [stage, setStage] = useState<CropStage>('Plántula');
  
  // Selected location (bed)
  const [bed, setBed] = useState<string>(() => {
    const locs = loadLocations();
    return locs[0]?.name || CROPS_DATABASE[0].varieties[0].recommendedBed;
  });

  const [daysToHarvest, setDaysToHarvest] = useState<number>(CROPS_DATABASE[0].varieties[0].stageDaysToHarvest['Plántula']);
  const [recommendedMoisture, setRecommendedMoisture] = useState<number>(CROPS_DATABASE[0].varieties[0].recommendedMoisturePercent);
  const [waterFrequencyDays, setWaterFrequencyDays] = useState<number>(CROPS_DATABASE[0].varieties[0].waterFrequencyDays);
  const [sunHours, setSunHours] = useState<number>(CROPS_DATABASE[0].varieties[0].sunHours);
  const [notes, setNotes] = useState<string>(CROPS_DATABASE[0].varieties[0].notes);

  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentCategory: CropCategory | undefined = CROPS_DATABASE.find(
    (c) => c.cropName === selectedCropName
  );

  const currentVariety: CropVarietyInfo | undefined = currentCategory?.varieties.find(
    (v) => v.varietyName === selectedVarietyName
  );

  const handleCropNameChange = (newCropName: string) => {
    setSelectedCropName(newCropName);
    const category = CROPS_DATABASE.find((c) => c.cropName === newCropName);
    if (category && category.varieties.length > 0) {
      const firstVar = category.varieties[0];
      setSelectedVarietyName(firstVar.varietyName);
      updateFieldsFromVariety(firstVar, stage);
    }
  };

  const handleVarietyNameChange = (newVarietyName: string) => {
    setSelectedVarietyName(newVarietyName);
    const varietyObj = currentCategory?.varieties.find((v) => v.varietyName === newVarietyName);
    if (varietyObj) {
      updateFieldsFromVariety(varietyObj, stage);
    }
  };

  const handleStageChange = (newStage: CropStage) => {
    setStage(newStage);
    if (currentVariety) {
      setDaysToHarvest(currentVariety.stageDaysToHarvest[newStage]);
    }
  };

  const updateFieldsFromVariety = (varietyObj: CropVarietyInfo, currentStage: CropStage) => {
    setDaysToHarvest(varietyObj.stageDaysToHarvest[currentStage]);
    setRecommendedMoisture(varietyObj.recommendedMoisturePercent);
    setWaterFrequencyDays(varietyObj.waterFrequencyDays);
    setSunHours(varietyObj.sunHours);
    setNotes(varietyObj.notes);
    
    // Si la ubicación recomendada está entre las ubicaciones existentes o no hay una seleccionada, proponerla
    if (varietyObj.recommendedBed && locations.some((l) => l.name === varietyObj.recommendedBed)) {
      setBed(varietyObj.recommendedBed);
    }
  };

  const handleCreateLocationInline = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newLocationName.trim();
    if (!trimmed) return;

    const created = addLocation({
      name: trimmed,
      type: newLocationType,
      sunExposure: newLocationSun
    });

    const updatedLocations = loadLocations();
    setLocations(updatedLocations);
    setBed(created.name);
    setNewLocationName('');
    setIsCreatingLocation(false);
    setLocationSuccessMsg(`Ubicación "${created.name}" creada y seleccionada.`);
    setTimeout(() => setLocationSuccessMsg(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!alreadyAcceptedConsents) {
      if (!acceptedPrivacy || !acceptedTerms) {
        setErrorMessage(
          'Acepta la Política de Privacidad y los Términos y Condiciones para registrar el cultivo.'
        );
        return;
      }

      recordConsentEvent({
        consentType: 'Política de Privacidad',
        status: 'Aceptado',
        acceptanceMethod: 'Casilla de verificación (Checkbox individual)',
        formOrigin: 'Formulario de Creación de Cultivo'
      });

      recordConsentEvent({
        consentType: 'Términos y Condiciones',
        status: 'Aceptado',
        acceptanceMethod: 'Casilla de verificación (Checkbox individual)',
        formOrigin: 'Formulario de Creación de Cultivo'
      });

      setAcceptedLegalConsents(true);
      setAlreadyAcceptedConsents(true);
    }

    const img = getCropImage(selectedCropName);

    const newCrop: CropItem = {
      id: 'crop-' + Date.now(),
      name: currentVariety ? `${selectedCropName} (${currentVariety.varietyName})` : selectedCropName,
      variety: currentVariety ? currentVariety.botanicalName : 'Cultivo registrado',
      bed: bed.trim() || 'Bancal Principal',
      plantedDate: plantedDate || getTodayString(),
      daysToHarvest: Number(daysToHarvest) || 30,
      stage,
      recommendedMoisturePercent: Number(recommendedMoisture) || 70,
      sunHours: Number(sunHours) || 6,
      waterFrequencyDays: Number(waterFrequencyDays) || 2,
      lastWatered: 'Sin riego',
      notes: notes.trim(),
      imageUrl: img.imageUrl,
      imageAlt: `${selectedCropName} en ${bed.trim() || 'huerta'}`,
      log: [
        {
          id: 'log-' + Date.now(),
          type: 'Siembra',
          title: 'Siembra registrada',
          date: plantedDate || getTodayString(),
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          notes: `Ubicación: ${bed.trim() || 'Bancal Principal'}. Etapa inicial: ${stage}.`
        }
      ]
    };

    onAddCrop(newCrop);
    onNavigate('agradecimiento');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto px-4 py-8 sm:py-12"
    >
      <div className="mb-6 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Nuevo Cultivo</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A231E]">
          Crear Cultivo
        </h1>
        <p className="text-xs sm:text-sm text-[#4A554E]">
          Selecciona tu especie, variedad y asigna la ubicación o crea un bancal nuevo al instante.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {locationSuccessMsg && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#2D5A27] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{locationSuccessMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Especie y Variedad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="crop-name" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Especie hortícola *
            </label>
            <select
              id="crop-name"
              value={selectedCropName}
              onChange={(e) => handleCropNameChange(e.target.value)}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] cursor-pointer"
            >
              {CROPS_DATABASE.map((crop) => (
                <option key={crop.cropName} value={crop.cropName}>
                  {crop.cropName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="variety-name" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Variedad *
            </label>
            <select
              id="variety-name"
              value={selectedVarietyName}
              onChange={(e) => handleVarietyNameChange(e.target.value)}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] cursor-pointer"
            >
              {currentCategory?.varieties.map((v) => (
                <option key={v.varietyName} value={v.varietyName}>
                  {v.varietyName}
                </option>
              ))}
            </select>
            {currentVariety && (
              <span className="text-[11px] text-[#5A655E] italic mt-1 block">
                {currentVariety.botanicalName}
              </span>
            )}
          </div>
        </div>

        {/* Sección de Ubicación / Bancal con Creación en el mismo lugar */}
        <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2DFD7] space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="crop-bed" className="text-xs font-semibold text-[#1A231E] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#2D5A27]" />
              <span>Ubicación o Bancal *</span>
            </label>
            <button
              type="button"
              onClick={() => setIsCreatingLocation((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#2D5A27]/10 text-[#2D5A27] hover:bg-[#2D5A27] hover:text-white transition-colors cursor-pointer"
            >
              {isCreatingLocation ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>Cancelar</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear nueva ubicación</span>
                </>
              )}
            </button>
          </div>

          {/* Selector de ubicaciones pre-creadas */}
          <div>
            <select
              id="crop-bed"
              value={bed}
              onChange={(e) => setBed(e.target.value)}
              className="w-full rounded-xl border border-[#D5E0D3] bg-white px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] cursor-pointer"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name} {loc.type ? `(${loc.type})` : ''} {loc.sunExposure ? `• ${loc.sunExposure}` : ''}
                </option>
              ))}
              {/* Opción si el valor actual no está en la lista */}
              {!locations.some((l) => l.name === bed) && bed && (
                <option value={bed}>{bed} (Personalizada)</option>
              )}
            </select>
            <p className="text-[11px] text-[#5A655E] mt-1.5">
              Selecciona una ubicación creada con anterioridad o crea una nueva aquí mismo sin salir del formulario.
            </p>
          </div>

          {/* Formulario rápido inline para crear ubicación/bancal */}
          <AnimatePresence>
            {isCreatingLocation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="pt-3 border-t border-[#E2DFD7] space-y-3 overflow-hidden"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A231E]">
                  <Layers className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>Crear nueva ubicación o bancal</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-medium text-[#4A554E] mb-1">
                      Nombre / Identificador *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Bancal Aromáticas #1"
                      value={newLocationName}
                      onChange={(e) => setNewLocationName(e.target.value)}
                      className="w-full rounded-lg border border-[#D5E0D3] bg-white px-3 py-1.5 text-xs text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#4A554E] mb-1">
                      Tipo de contenedor
                    </label>
                    <select
                      value={newLocationType}
                      onChange={(e) => setNewLocationType(e.target.value as LocationType)}
                      className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] cursor-pointer"
                    >
                      {LOCATION_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#4A554E] mb-1">
                      Exposición solar
                    </label>
                    <select
                      value={newLocationSun}
                      onChange={(e) => setNewLocationSun(e.target.value as 'Pleno sol' | 'Semisombra' | 'Sombra')}
                      className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] cursor-pointer"
                    >
                      <option value="Pleno sol">Pleno sol (+6h)</option>
                      <option value="Semisombra">Semisombra (3-5h)</option>
                      <option value="Sombra">Sombra (&lt;3h)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingLocation(false)}
                    className="px-3 py-1.5 rounded-lg border border-[#D5E0D3] bg-white text-xs text-[#4A554E] hover:bg-[#F2EFE9] cursor-pointer"
                  >
                    Descartar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateLocationInline}
                    disabled={!newLocationName.trim()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2D5A27] text-white text-xs font-semibold hover:bg-[#23471E] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Guardar y asignar</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fecha y Etapa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="planted-date" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Fecha de siembra *
            </label>
            <input
              id="planted-date"
              type="date"
              value={plantedDate}
              onChange={(e) => setPlantedDate(e.target.value)}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
            />
          </div>

          <div>
            <label htmlFor="crop-stage" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Etapa inicial *
            </label>
            <select
              id="crop-stage"
              value={stage}
              onChange={(e) => handleStageChange(e.target.value as CropStage)}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] cursor-pointer"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Métricas agronómicas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF9F6] p-4 rounded-xl border border-[#E2DFD7]">
          <div>
            <label className="block text-[11px] font-medium text-[#4A554E] mb-1">
              Días a cosecha
            </label>
            <input
              type="number"
              min={0}
              value={daysToHarvest}
              onChange={(e) => setDaysToHarvest(Number(e.target.value))}
              className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#4A554E] mb-1">
              Humedad (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={recommendedMoisture}
              onChange={(e) => setRecommendedMoisture(Number(e.target.value))}
              className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#4A554E] mb-1">
              Riego (días)
            </label>
            <input
              type="number"
              min={1}
              value={waterFrequencyDays}
              onChange={(e) => setWaterFrequencyDays(Number(e.target.value))}
              className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#4A554E] mb-1">
              Sol (horas/d)
            </label>
            <input
              type="number"
              min={0}
              max={24}
              value={sunHours}
              onChange={(e) => setSunHours(Number(e.target.value))}
              className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="crop-notes" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
            Notas
          </label>
          <textarea
            id="crop-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
          />
        </div>

        {alreadyAcceptedConsents ? (
          <div className="p-3.5 rounded-xl bg-[#2D5A27]/5 border border-[#2D5A27]/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0" />
              <span className="text-xs text-[#2D5A27] font-medium">Consentimientos legales aceptados.</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('auditoria')}
              className="text-xs text-[#2D5A27] underline hover:text-[#1A231E] shrink-0"
            >
              Auditoría
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2DFD7] space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A231E]">
              <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
              <span>Consentimientos (Responsable: las paginas de dani)</span>
            </div>

            <label htmlFor="accept-privacy" className="flex items-start gap-2 text-xs text-[#4A554E] cursor-pointer">
              <input
                id="accept-privacy"
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => {
                  setAcceptedPrivacy(e.target.checked);
                  setErrorMessage(null);
                }}
                className="mt-0.5 rounded border-[#8A968E] text-[#2D5A27]"
              />
              <span>
                Acepto la{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('privacidad')}
                  className="underline font-semibold text-[#2D5A27]"
                >
                  Política de Privacidad
                </button>
                . *
              </span>
            </label>

            <label htmlFor="accept-terms" className="flex items-start gap-2 text-xs text-[#4A554E] cursor-pointer">
              <input
                id="accept-terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  setErrorMessage(null);
                }}
                className="mt-0.5 rounded border-[#8A968E] text-[#2D5A27]"
              />
              <span>
                Acepto los{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('terminos')}
                  className="underline font-semibold text-[#2D5A27]"
                >
                  Términos y Condiciones
                </button>
                . *
              </span>
            </label>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('auditoria')}
            className="text-xs underline text-[#5A655E] hover:text-[#1A231E]"
          >
            Auditoría →
          </button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-sm font-semibold hover:bg-[#23471E] transition-colors cursor-pointer shadow-sm"
          >
            Guardar Cultivo
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};
