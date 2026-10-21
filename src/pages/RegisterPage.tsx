import React, { useState } from 'react';
import { Sprout, ShieldCheck, AlertCircle } from 'lucide-react';
import type { CropItem, CropStage, PageRoute } from '../types/huerta';
import { recordConsentEvent } from '../services/auditLogger';

interface RegisterPageProps {
  onAddCrop: (crop: CropItem) => void;
  onNavigate: (route: PageRoute) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onAddCrop, onNavigate }) => {
  const [gardenerEmail, setGardenerEmail] = useState('');
  const [cropName, setCropName] = useState('');
  const [variety, setVariety] = useState('');
  const [bed, setBed] = useState('Bancal Principal #1');
  const [stage, setStage] = useState<CropStage>('Plántula');
  const [daysToHarvest, setDaysToHarvest] = useState(30);
  const [waterFrequencyDays, setWaterFrequencyDays] = useState(2);
  const [sunHours, setSunHours] = useState(6);
  const [notes, setNotes] = useState('');

  // Independent legal checkboxes
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      name: cropName.trim() || 'Pimiento Padrón',
      variety: variety.trim() || 'Capsicum annuum',
      bed: bed.trim() || 'Bancal #1',
      plantedDate: new Date().toISOString().split('T')[0],
      daysToHarvest: Number(daysToHarvest) || 30,
      stage,
      moisturePercent: 75,
      sunHours: Number(sunHours) || 6,
      waterFrequencyDays: Number(waterFrequencyDays) || 2,
      lastWatered: 'Hoy, recién plantado',
      notes: notes.trim() || 'Cultivo registrado con seguimiento de riego activo.',
      imageUrl: '/hero-garden.svg',
      imageAlt: `Ilustración del cultivo ${cropName.trim() || 'Hortícola'} en ${bed}`
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
          Introduce los parámetros agronómicos de tu planta. Los consentimientos quedan registrados en el registro técnico de auditoría.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="crop-name" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Nombre del cultivo *
            </label>
            <input
              id="crop-name"
              type="text"
              required
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              placeholder="Ej. Espinaca Gigante de Invierno"
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E]"
            />
          </div>

          <div>
            <label htmlFor="crop-variety" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Variedad botánica / cultivar
            </label>
            <input
              id="crop-variety"
              type="text"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              placeholder="Ej. Spinacia oleracea"
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E]"
            />
          </div>

          <div>
            <label htmlFor="crop-bed" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Ubicación / Bancal / Maceta *
            </label>
            <input
              id="crop-bed"
              type="text"
              required
              value={bed}
              onChange={(e) => setBed(e.target.value)}
              placeholder="Ej. Mesa de Cultivo Terraza #1"
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E]"
            />
          </div>

          <div>
            <label htmlFor="crop-stage" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Etapa fenológica actual
            </label>
            <select
              id="crop-stage"
              value={stage}
              onChange={(e) => setStage(e.target.value as CropStage)}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E]"
            >
              <option value="Semilla">Semilla / Germinación</option>
              <option value="Plántula">Plántula / Trasplante</option>
              <option value="Crecimiento">Crecimiento vegetativo</option>
              <option value="Floración">Floración / Fructificación</option>
              <option value="Cosecha">Listo para cosecha</option>
            </select>
          </div>

          <div>
            <label htmlFor="crop-days" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Días estimados hasta cosecha
            </label>
            <input
              id="crop-days"
              type="number"
              min={1}
              max={365}
              value={daysToHarvest}
              onChange={(e) => setDaysToHarvest(Number(e.target.value))}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E]"
            />
          </div>

          <div>
            <label htmlFor="crop-water" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Frecuencia de riego (días)
            </label>
            <input
              id="crop-water"
              type="number"
              min={1}
              max={30}
              value={waterFrequencyDays}
              onChange={(e) => setWaterFrequencyDays(Number(e.target.value))}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E]"
            />
          </div>

          <div>
            <label htmlFor="crop-sun" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Horas de sol directo al día
            </label>
            <input
              id="crop-sun"
              type="number"
              step="0.5"
              min={1}
              max={16}
              value={sunHours}
              onChange={(e) => setSunHours(Number(e.target.value))}
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
        </div>

        <div>
          <label htmlFor="crop-notes" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
            Observaciones de sustrato y asociación
          </label>
          <textarea
            id="crop-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Sustrato con 30% humus de lombriz. Asociado con caléndulas."
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
