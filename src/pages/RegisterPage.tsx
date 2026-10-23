import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { CropItem, CropStage, PageRoute } from '../types/huerta';
import { recordConsentEvent } from '../services/auditLogger';
import { hasAcceptedLegalConsents, setAcceptedLegalConsents } from '../services/consentService';
import { CROPS_DATABASE, type CropCategory, type CropVarietyInfo } from '../data/cropsDatabase';

interface RegisterPageProps {
  onAddCrop: (crop: CropItem) => void;
  onNavigate: (route: PageRoute) => void;
}

const STAGES: CropStage[] = ['Semilla', 'Plántula', 'Crecimiento', 'Floración', 'Cosecha'];

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const RegisterPage: React.FC<RegisterPageProps> = ({ onAddCrop, onNavigate }) => {
  // Check if legal consents have already been accepted once
  const [alreadyAcceptedConsents, setAlreadyAcceptedConsents] = useState<boolean>(() => hasAcceptedLegalConsents());

  // Crop selection
  const [selectedCropName, setSelectedCropName] = useState<string>(CROPS_DATABASE[0].cropName);
  const [selectedVarietyName, setSelectedVarietyName] = useState<string>(CROPS_DATABASE[0].varieties[0].varietyName);

  // Agronomic parameters
  const [plantedDate, setPlantedDate] = useState<string>(getTodayString());
  const [stage, setStage] = useState<CropStage>('Plántula');
  const [bed, setBed] = useState<string>(CROPS_DATABASE[0].varieties[0].recommendedBed);
  const [daysToHarvest, setDaysToHarvest] = useState<number>(CROPS_DATABASE[0].varieties[0].stageDaysToHarvest['Plántula']);
  const [recommendedMoisture, setRecommendedMoisture] = useState<number>(CROPS_DATABASE[0].varieties[0].recommendedMoisturePercent);
  const [waterFrequencyDays, setWaterFrequencyDays] = useState<number>(CROPS_DATABASE[0].varieties[0].waterFrequencyDays);
  const [sunHours, setSunHours] = useState<number>(CROPS_DATABASE[0].varieties[0].sunHours);
  const [notes, setNotes] = useState<string>(CROPS_DATABASE[0].varieties[0].notes);

  // Independent legal checkboxes (only needed if not already accepted)
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
    setRecommendedMoisture(varietyObj.recommendedMoisturePercent);
    setWaterFrequencyDays(varietyObj.waterFrequencyDays);
    setSunHours(varietyObj.sunHours);
    setNotes(varietyObj.notes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If consents were not previously accepted, validate both independent checkboxes
    if (!alreadyAcceptedConsents) {
      if (!acceptedPrivacy || !acceptedTerms) {
        setErrorMessage(
          'Debes marcar de forma independiente tanto la Política de Privacidad como los Términos y Condiciones antes de continuar.'
        );
        return;
      }

      // Record Technical Audit Log for Privacy Policy Consent
      recordConsentEvent({
        consentType: 'Política de Privacidad',
        status: 'Aceptado',
        acceptanceMethod: 'Marcado explícito de casilla independiente (checkbox #accept-privacy) + alta de cultivo',
        formOrigin: 'Formulario de Alta de Cultivo (/registro)',
        userIdentifier: 'Usuario de Huertamanía'
      });

      // Record Technical Audit Log for Terms and Conditions
      recordConsentEvent({
        consentType: 'Términos y Condiciones',
        status: 'Aceptado',
        acceptanceMethod: 'Marcado explícito de casilla independiente (checkbox #accept-terms) + alta de cultivo',
        formOrigin: 'Formulario de Alta de Cultivo (/registro)',
        userIdentifier: 'Usuario de Huertamanía'
      });

      // Save consent flag so Daniel doesn't have to accept again in future crops
      setAcceptedLegalConsents(true);
      setAlreadyAcceptedConsents(true);
    }

    const newCropId = 'crop-' + Date.now();
    const newCrop: CropItem = {
      id: newCropId,
      name: selectedCropName,
      variety: selectedVarietyName,
      bed: bed.trim() || 'Bancal Huerto 1',
      plantedDate: plantedDate || getTodayString(),
      daysToHarvest: Number(daysToHarvest) || 30,
      stage,
      recommendedMoisturePercent: Number(recommendedMoisture) || 70,
      sunHours: Number(sunHours) || 6,
      waterFrequencyDays: Number(waterFrequencyDays) || 2,
      lastWatered: 'Sin registros de riego',
      notes: notes.trim(),
      imageUrl: '/hero-garden.svg',
      imageAlt: `Fotografía de cultivo de ${selectedCropName} variedad ${selectedVarietyName}`,
      log: [
        {
          id: 'log-' + Date.now(),
          type: 'Siembra',
          title: `Siembra / Alta en huerta: ${selectedCropName} (${selectedVarietyName})`,
          date: plantedDate || getTodayString(),
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          notes: `Ubicación: ${bed}. Etapa inicial: ${stage}. Humedad recomendada: ${recommendedMoisture}%.`
        }
      ]
    };

    onAddCrop(newCrop);
    onNavigate('agradecimiento');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="border-b border-[#E2DFD7] pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A231E]">
          Añadir Nuevo Cultivo a la Huerta
        </h1>
        <p className="text-sm text-[#4A554E] mt-1">
          Configuración agronómica de variedad, etapa fenológica, ubicación y parámetros recomendados.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-[#E2DFD7] shadow-xs">
        {/* Selector de Cultivo y Variedad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="crop-name" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Tipo de Especie de Huerta *
            </label>
            <select
              id="crop-name"
              value={selectedCropName}
              onChange={(e) => handleCropNameChange(e.target.value)}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
            >
              {CROPS_DATABASE.map((cat) => (
                <option key={cat.cropName} value={cat.cropName}>
                  {cat.cropName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="crop-variety" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Variedad Botánica Específica *
            </label>
            <select
              id="crop-variety"
              value={selectedVarietyName}
              onChange={(e) => handleVarietyNameChange(e.target.value)}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
            >
              {currentCategory?.varieties.map((v) => (
                <option key={v.varietyName} value={v.varietyName}>
                  {v.varietyName} ({v.botanicalName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fecha de plantación y Etapa fenológica */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div className="w-full">
            <label htmlFor="planted-date" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Fecha de plantación o siembra *
            </label>
            <div className="relative w-full">
              <input
                id="planted-date"
                type="date"
                value={plantedDate}
                onChange={(e) => setPlantedDate(e.target.value)}
                required
                className="w-full block rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] box-border"
              />
            </div>
          </div>

          <div>
            <label htmlFor="crop-stage" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Etapa fenológica inicial *
            </label>
            <select
              id="crop-stage"
              value={stage}
              onChange={(e) => handleStageChange(e.target.value as CropStage)}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ubicación / Bancal */}
        <div>
          <label htmlFor="crop-bed" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
            Ubicación / Bancal de destino *
          </label>
          <input
            id="crop-bed"
            type="text"
            value={bed}
            onChange={(e) => setBed(e.target.value)}
            required
            placeholder="Ej: Bancal Sur #1, Mesa Norte, Jardinera Profunda"
            className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
          />
        </div>

        {/* Parámetros técnicos agronómicos autorellenados */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#FAF9F6] p-4 rounded-xl border border-[#E2DFD7]">
          <div>
            <label htmlFor="crop-harvest-days" className="block text-[11px] font-semibold text-[#5A655E] mb-1">
              Días estim. cosecha
            </label>
            <input
              id="crop-harvest-days"
              type="number"
              min={0}
              value={daysToHarvest}
              onChange={(e) => setDaysToHarvest(Number(e.target.value))}
              className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E]"
            />
          </div>

          <div>
            <label htmlFor="crop-moisture" className="block text-[11px] font-semibold text-[#5A655E] mb-1">
              Humedad rec. (%)
            </label>
            <input
              id="crop-moisture"
              type="number"
              min={20}
              max={95}
              value={recommendedMoisture}
              onChange={(e) => setRecommendedMoisture(Number(e.target.value))}
              className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E]"
            />
          </div>

          <div>
            <label htmlFor="crop-water-freq" className="block text-[11px] font-semibold text-[#5A655E] mb-1">
              Frecuencia riego (días)
            </label>
            <input
              id="crop-water-freq"
              type="number"
              min={1}
              value={waterFrequencyDays}
              onChange={(e) => setWaterFrequencyDays(Number(e.target.value))}
              className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E]"
            />
          </div>

          <div>
            <label htmlFor="crop-sun-hours" className="block text-[11px] font-semibold text-[#5A655E] mb-1">
              Sol directo (h/día)
            </label>
            <input
              id="crop-sun-hours"
              type="number"
              min={1}
              step={0.5}
              value={sunHours}
              onChange={(e) => setSunHours(Number(e.target.value))}
              className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E]"
            />
          </div>
        </div>

        {/* Observaciones agronómicas */}
        <div>
          <label htmlFor="crop-notes" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
            Observaciones de sustrato y asociación recomendadas
          </label>
          <textarea
            id="crop-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
          />
        </div>

        {/* Independent Legal Checkboxes or Already Accepted Notice */}
        {alreadyAcceptedConsents ? (
          <div className="p-4 rounded-xl bg-[#2D5A27]/5 border border-[#2D5A27]/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#2D5A27] shrink-0" />
              <div className="text-xs text-[#2D5A27]">
                <span className="font-semibold block">Consentimientos Legales Aceptados Previamente</span>
                <span className="text-[#4A554E]">
                  Ya has validado la Política de Privacidad y Términos y Condiciones. No se requiere volver a marcarlos.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('auditoria')}
              className="text-xs text-[#2D5A27] underline font-medium hover:text-[#1A231E] shrink-0"
            >
              Ver auditoría
            </button>
          </div>
        ) : (
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
        )}

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
            className="px-6 py-3 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-sm font-semibold hover:bg-[#23471E] transition-all transform active:scale-95 cursor-pointer shadow-sm"
          >
            Guardar Cultivo en la Huerta
          </button>
        </div>
      </form>
    </div>
  );
};
