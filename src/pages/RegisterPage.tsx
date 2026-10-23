import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { CropItem, CropStage, PageRoute } from '../types/huerta';
import { recordConsentEvent } from '../services/auditLogger';
import { hasAcceptedLegalConsents, setAcceptedLegalConsents } from '../services/consentService';
import { CROPS_DATABASE, type CropCategory, type CropVarietyInfo, getCropImage } from '../data/cropsDatabase';

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
  const [alreadyAcceptedConsents, setAlreadyAcceptedConsents] = useState<boolean>(() => hasAcceptedLegalConsents());

  const [selectedCropName, setSelectedCropName] = useState<string>(CROPS_DATABASE[0].cropName);
  const [selectedVarietyName, setSelectedVarietyName] = useState<string>(CROPS_DATABASE[0].varieties[0].varietyName);

  const [plantedDate, setPlantedDate] = useState<string>(getTodayString());
  const [stage, setStage] = useState<CropStage>('Plántula');
  const [bed, setBed] = useState<string>(CROPS_DATABASE[0].varieties[0].recommendedBed);
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
    setBed(varietyObj.recommendedBed);
    setDaysToHarvest(varietyObj.stageDaysToHarvest[currentStage]);
    setRecommendedMoisture(varietyObj.recommendedMoisturePercent);
    setWaterFrequencyDays(varietyObj.waterFrequencyDays);
    setSunHours(varietyObj.sunHours);
    setNotes(varietyObj.notes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!alreadyAcceptedConsents) {
      if (!acceptedPrivacy || !acceptedTerms) {
        setErrorMessage(
          'Acepta la Política de Privacidad y los Términos y Condiciones.'
        );
        return;
      }

      recordConsentEvent({
        consentType: 'Política de Privacidad',
        status: 'Aceptado',
        acceptanceMethod: 'Casilla independiente (#accept-privacy) en alta de cultivo',
        formOrigin: 'Formulario de Alta (/registro)',
        userIdentifier: 'Usuario'
      });

      recordConsentEvent({
        consentType: 'Términos y Condiciones',
        status: 'Aceptado',
        acceptanceMethod: 'Casilla independiente (#accept-terms) en alta de cultivo',
        formOrigin: 'Formulario de Alta (/registro)',
        userIdentifier: 'Usuario'
      });

      setAcceptedLegalConsents(true);
      setAlreadyAcceptedConsents(true);
    }

    const newCropId = 'crop-' + Date.now();
    const { imageUrl, imageAlt } = getCropImage(selectedCropName);
    const newCrop: CropItem = {
      id: newCropId,
      name: selectedCropName,
      variety: selectedVarietyName,
      bed: bed.trim() || 'Bancal 1',
      plantedDate: plantedDate || getTodayString(),
      daysToHarvest: Number(daysToHarvest) || 30,
      stage,
      recommendedMoisturePercent: Number(recommendedMoisture) || 70,
      sunHours: Number(sunHours) || 6,
      waterFrequencyDays: Number(waterFrequencyDays) || 2,
      lastWatered: 'Sin registros',
      notes: notes.trim(),
      imageUrl,
      imageAlt,
      log: [
        {
          id: 'log-' + Date.now(),
          type: 'Siembra',
          title: `Alta: ${selectedCropName}`,
          date: plantedDate || getTodayString(),
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          notes: notes.trim() || undefined
        }
      ]
    };

    onAddCrop(newCrop);
    onNavigate('agradecimiento');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6"
    >
      <div className="border-b border-[#E2DFD7] pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A231E]">
          Nuevo Cultivo
        </h1>
        <p className="text-sm text-[#4A554E] mt-1">
          Parámetros del cultivo.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-[#E2DFD7] shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="crop-name" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Especie *
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
              Variedad *
            </label>
            <select
              id="crop-variety"
              value={selectedVarietyName}
              onChange={(e) => handleVarietyNameChange(e.target.value)}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
            >
              {currentCategory?.varieties.map((v) => (
                <option key={v.varietyName} value={v.varietyName}>
                  {v.varietyName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div className="w-full">
            <label htmlFor="planted-date" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Fecha de siembra *
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
              Etapa inicial *
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

        <div>
          <label htmlFor="crop-bed" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
            Ubicación / Bancal *
          </label>
          <input
            id="crop-bed"
            type="text"
            value={bed}
            onChange={(e) => setBed(e.target.value)}
            required
            placeholder="Bancal 1, Mesa Norte, Jardinera"
            className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#FAF9F6] p-4 rounded-xl border border-[#E2DFD7]">
          <div>
            <label htmlFor="crop-harvest-days" className="block text-[11px] font-semibold text-[#5A655E] mb-1">
              Días cosecha
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
              Humedad (%)
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
              Riego (días)
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
              Sol (h/día)
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
              <span className="text-xs text-[#2D5A27] font-medium">Consentimientos aceptados.</span>
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
