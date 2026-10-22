import React, { useState } from 'react';
import { Sprout, ShieldCheck, AlertCircle, Calendar } from 'lucide-react';
import type { CropItem, CropStage, PageRoute } from '../types/huerta';
import { recordConsentEvent } from '../services/auditLogger';
import { CROPS_DATABASE, type CropCategory, type CropVarietyInfo } from '../data/cropsDatabase';

interface RegisterPageProps {
  onAddCrop: (crop: CropItem) => void;
  onNavigate: (route: PageRoute) => void;
}

const STAGES: CropStage[] = ['Semilla', 'Plántula', 'Crecimiento', 'Floración', 'Cosecha'];

const getTodayString = () => new Date().toISOString().split('T')[0];

export const RegisterPage: React.FC<RegisterPageProps> = ({ onAddCrop, onNavigate }) => {
  const [gardenerEmail, setGardenerEmail] = useState('');
  
  // Crop selection
  const [selectedCropName, setSelectedCropName] = useState<string>(CROPS_DATABASE[0].cropName);
  const [selectedVarietyName, setSelectedVarietyName] = useState<string>(CROPS_DATABASE[0].varieties[0].varietyName);

  // Agronomic parameters
  const [plantedDate, setPlantedDate] = useState<string>(getTodayString());
  const [stage, setStage] = useState<CropStage>('Plántula');
  const [bed, setBed] = useState<string>(CROPS_DATABASE[0].varieties[0].recommendedBed);
  const [daysToHarvest, setDaysToHarvest] = useState<number>(CROPS_DATABASE[0].varieties[0].stageDaysToHarvest['Plántula']);
  const [waterFrequencyDays, setWaterFrequencyDays] = useState<number>(CROPS_DATABASE[0].varieties[0].waterFrequencyDays);
  const [sunHours, setSunHours] = useState<number>(CROPS_DATABASE[0].varieties[0].sunHours);
  const [notes, setNotes] = useState<string>(CROPS_DATABASE[0].varieties[0].notes);

  // Independent legal checkboxes
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Current active category object
  const currentCategory: CropCategory | undefined = CROPS_DATABASE.find(
    (c) => c.cropName === selectedCropName
  );

  // Current active variety object
  const currentVariety: CropVarietyInfo | undefined = currentCategory?.varieties.find(
    (v) => v.varietyName === selectedVarietyName
  );

  // When crop name changes, update variety list to first available variety and autofill
  const handleCropNameChange = (newCropName: string) => {
    setSelectedCropName(newCropName);
    const category = CROPS_DATABASE.find((c) => c.cropName === newCropName);
    if (category && category.varieties.length > 0) {
      const firstVar = category.varieties[0];
      setSelectedVarietyName(firstVar.varietyName);
      updateFieldsFromVariety(firstVar, stage);
    }
  };

  // When variety name changes, autofill
  const handleVarietyNameChange = (newVarietyName: string) => {
    setSelectedVarietyName(newVarietyName);
    const varietyObj = currentCategory?.varieties.find((v) => v.varietyName === newVarietyName);
    if (varietyObj) {
      updateFieldsFromVariety(varietyObj, stage);
    }
  };

  // When stage changes, update days to harvest based on current variety
  const handleStageChange = (newStage: CropStage) => {
    setStage(newStage);
    if (currentVariety) {
      setDaysToHarvest(currentVariety.stageDaysToHarvest[newStage]);
    }
  };

  // Helper to pre-fill fields according to selected variety and stage
  const updateFieldsFromVariety = (varietyObj: CropVarietyInfo, currentStage: CropStage) => {
    setBed(varietyObj.recommendedBed);
    setDaysToHarvest(varietyObj.stageDaysToHarvest[currentStage]);
    setWaterFrequencyDays(varietyObj.waterFrequencyDays);
    setSunHours(varietyObj.sunHours);
    setNotes(varietyObj.notes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedPrivacy || !acceptedTerms) {
      setErrorMessage(
        'Debes marcar de forma independiente tanto la Política de Privacidad como los Términos y Condiciones antes de continuar.'
      );
      return;
    }

    const userIdentifier = gardenerEmail.trim() || 'Horticultor Local';

    // Record Technical Audit Log for Privacy Policy Consent
    recordConsentEvent({
      consentType: 'Política de Privacidad',
      status: 'Aceptado',
      acceptanceMethod: 'Marcado explícito de casilla independiente (checkbox #accept-privacy) + envío de formulario de alta',
      formOrigin: 'Formulario de Alta de Cultivo y Alertas (/registro)',
      userIdentifier
    });

    // Record Technical Audit Log for Terms & Conditions Consent
    recordConsentEvent({
      consentType: 'Términos y Condiciones',
      status: 'Aceptado',
      acceptanceMethod: 'Marcado explícito de casilla independiente (checkbox #accept-terms) + envío de formulario de alta',
      formOrigin: 'Formulario de Alta de Cultivo y Alertas (/registro)',
      userIdentifier
    });

    const newCrop: CropItem = {
      id: 'crop-' + Date.now(),
      name: selectedCropName,
      variety: selectedVarietyName + (currentVariety ? ` (${currentVariety.botanicalName})` : ''),
      bed: bed.trim() || 'Bancal Principal',
      plantedDate: plantedDate || getTodayString(),
      daysToHarvest: Number(daysToHarvest) || 0,
      stage,
      moisturePercent: 75,
      sunHours: Number(sunHours) || 6,
      waterFrequencyDays: Number(waterFrequencyDays) || 2,
      lastWatered: 'Recién registrado',
      notes: notes.trim() || 'Sin observaciones.',
      imageUrl: '/hero-garden.svg',
      imageAlt: `Ilustración del cultivo ${selectedCropName} (${selectedVarietyName}) en ${bed}`
    };

    onAddCrop(newCrop);
    onNavigate('agradecimiento');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="border-b border-[#E2DFD7] pb-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D5A27] mb-2">
          <Sprout className="w-4 h-4" />
          <span>Alta en Mi Huerta Casera</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A231E]">
          Registrar Nuevo Cultivo y Configurar Seguimiento
        </h1>
        <p className="text-sm text-[#4A554E] mt-1">
          Selecciona tu cultivo de la base de datos para autorellenar los parámetros agronómicos recomendados.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl p-6 space-y-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Nombre de cultivo (Dropdown) */}
          <div>
            <label htmlFor="crop-name" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Nombre del cultivo *
            </label>
            <select
              id="crop-name"
              value={selectedCropName}
              onChange={(e) => handleCropNameChange(e.target.value)}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] font-medium"
              required
            >
              {CROPS_DATABASE.map((cat) => (
                <option key={cat.cropName} value={cat.cropName}>
                  {cat.cropName}
                </option>
              ))}
            </select>
          </div>

          {/* Variedad botánica (Dropdown) */}
          <div>
            <label htmlFor="crop-variety" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Variedad botánica / cultivar *
            </label>
            <select
              id="crop-variety"
              value={selectedVarietyName}
              onChange={(e) => handleVarietyNameChange(e.target.value)}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] font-medium"
              required
            >
              {currentCategory?.varieties.map((v) => (
                <option key={v.varietyName} value={v.varietyName}>
                  {v.varietyName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Fecha en que se plantó */}
          <div>
            <label htmlFor="planted-date" className="block text-xs font-semibold text-[#1A231E] mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>Fecha de plantación *</span>
            </label>
            <input
              id="planted-date"
              type="date"
              value={plantedDate}
              onChange={(e) => setPlantedDate(e.target.value)}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E]"
              required
            />
          </div>

          {/* Etapa actual */}
          <div>
            <label htmlFor="crop-stage" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Etapa de desarrollo actual
            </label>
            <select
              id="crop-stage"
              value={stage}
              onChange={(e) => handleStageChange(e.target.value as CropStage)}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E]"
            >
              {STAGES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Días estimados hasta la cosecha (Autorellenado según etapa) */}
          <div>
            <label htmlFor="days-harvest" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Días estimados a cosecha (Etapa: {stage})
            </label>
            <input
              id="days-harvest"
              type="number"
              min={0}
              max={365}
              value={daysToHarvest}
              onChange={(e) => setDaysToHarvest(Number(e.target.value))}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] font-bold text-[#2D5A27]"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Ubicación / Bancal */}
          <div>
            <label htmlFor="crop-bed" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Ubicación / Bancal recomendado
            </label>
            <input
              id="crop-bed"
              type="text"
              value={bed}
              onChange={(e) => setBed(e.target.value)}
              placeholder="Ej. Bancal Sur #1"
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E]"
              required
            />
          </div>

          {/* Frecuencia de riego (Autorellenada) */}
          <div>
            <label htmlFor="water-freq" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Frecuencia de riego (días)
            </label>
            <input
              id="water-freq"
              type="number"
              min={1}
              max={30}
              value={waterFrequencyDays}
              onChange={(e) => setWaterFrequencyDays(Number(e.target.value))}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E]"
              required
            />
          </div>

          {/* Horas de sol requeridas */}
          <div>
            <label htmlFor="sun-hours" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Horas de sol directa (h/día)
            </label>
            <input
              id="sun-hours"
              type="number"
              min={1}
              max={16}
              value={sunHours}
              onChange={(e) => setSunHours(Number(e.target.value))}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E]"
              required
            />
          </div>
        </div>

        {/* Observaciones de sustrato y asociación (Autorellenadas) */}
        <div>
          <label htmlFor="crop-notes" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
            Observaciones de sustrato y asociación recomendadas
          </label>
          <textarea
            id="crop-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E]"
          />
        </div>

        <div>
          <label htmlFor="gardener-email" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
            Correo o alias para avisos (opcional)
          </label>
          <input
            id="gardener-email"
            type="email"
            value={gardenerEmail}
            onChange={(e) => setGardenerEmail(e.target.value)}
            placeholder="daniel@mihuerta.es"
            className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E]"
          />
        </div>

        {/* Independent Legal Checkboxes */}
        <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2DFD7] space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A231E]">
            <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
            <span>Consentimientos Legales Independientes (Responsable: las paginas de dani)</span>
          </div>

          <label htmlFor="accept-privacy" className="flex items-start gap-2.5 text-xs text-[#4A554E] cursor-pointer">
            <input
              id="accept-privacy"
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(e) => {
                setAcceptedPrivacy(e.target.checked);
                setErrorMessage(null);
              }}
              className="mt-0.5 rounded border-[#8A968E] text-[#2D5A27] focus:ring-[#2D5A27]"
            />
            <span>
              He leído y acepto la{' '}
              <button
                type="button"
                onClick={() => onNavigate('privacidad')}
                className="underline font-semibold text-[#2D5A27] hover:text-[#1A231E]"
              >
                Política de Privacidad
              </button>{' '}
              sobre el tratamiento de datos de gestión de huerta por parte de <strong>las paginas de dani</strong>. *
            </span>
          </label>

          <label htmlFor="accept-terms" className="flex items-start gap-2.5 text-xs text-[#4A554E] cursor-pointer">
            <input
              id="accept-terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                setErrorMessage(null);
              }}
              className="mt-0.5 rounded border-[#8A968E] text-[#2D5A27] focus:ring-[#2D5A27]"
            />
            <span>
              He leído y acepto los{' '}
              <button
                type="button"
                onClick={() => onNavigate('terminos')}
                className="underline font-semibold text-[#2D5A27] hover:text-[#1A231E]"
              >
                Términos y Condiciones
              </button>{' '}
              de uso de la aplicación web Mi Huerta Casera. *
            </span>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('auditoria')}
            className="text-xs underline text-[#5A655E] hover:text-[#1A231E]"
          >
            Inspeccionar registro técnico de auditoría →
          </button>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-sm font-semibold hover:bg-[#23471E] transition-colors cursor-pointer"
          >
            Guardar Cultivo y Registrar Consentimiento
          </button>
        </div>
      </form>
    </div>
  );
};
