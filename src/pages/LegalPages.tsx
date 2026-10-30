import React from 'react';
import { Shield, FileText, Cookie, ArrowLeft } from 'lucide-react';
import type { PageRoute } from '../types/huerta';

interface LegalPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const PrivacyPolicyPage: React.FC<LegalPageProps> = ({ onNavigate }) => (
  <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
    <button
      type="button"
      onClick={() => onNavigate('inicio')}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D5A27] hover:underline"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      <span>Volver al inicio</span>
    </button>

    <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl p-6 sm:p-8 space-y-5 text-sm text-[#4A554E] leading-relaxed">
      <div className="flex items-center gap-2.5 text-[#2D5A27]">
        <Shield className="w-6 h-6" />
        <h1 className="text-2xl font-bold text-[#1A231E]">Política de Privacidad</h1>
      </div>

      <p>
        <strong>1. Responsable del Tratamiento:</strong> El responsable de esta aplicación web y del tratamiento de los datos recabados a través de <em>Mi Huerta Casera</em> (dominio <code>https://mi-huerta-casera.surge.sh</code>) es <strong>las paginas de dani</strong>.
      </p>

      <p>
        <strong>2. Finalidad del Tratamiento:</strong> Gestionar y hacer seguimiento a los cultivos registrados en la aplicación web, planificar alertas de riego y mantener el registro técnico de auditoría del consentimiento otorgado por el usuario conforme al RGPD y la LOPDGDD.
      </p>

      <p>
        <strong>3. Base Jurídica:</strong> El consentimiento expreso e inequívoco del usuario, otorgado mediante casillas independientes no premarcadas antes del envío de cualquier formulario, registrado técnicamente con fecha, hora y método de aceptación de acuerdo con los estándares de trazabilidad del responsable.
      </p>

      <p>
        <strong>4. Conservación y Almacenamiento:</strong> Los datos de cultivos y tareas se almacenan prioritariamente en el entorno local del navegador del usuario (<code>localStorage</code>) sin cesión a terceros ni transferencias internacionales.
      </p>

      <p>
        <strong>5. Derechos del Usuario:</strong> Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación y portabilidad en cualquier momento eliminando los registros directamente desde el panel de control o solicitándolo al responsable <strong>las paginas de dani</strong>.
      </p>
    </div>
  </article>
);

export const TermsConditionsPage: React.FC<LegalPageProps> = ({ onNavigate }) => (
  <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
    <button
      type="button"
      onClick={() => onNavigate('inicio')}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D5A27] hover:underline"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      <span>Volver al inicio</span>
    </button>

    <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl p-6 sm:p-8 space-y-5 text-sm text-[#4A554E] leading-relaxed">
      <div className="flex items-center gap-2.5 text-[#2D5A27]">
        <FileText className="w-6 h-6" />
        <h1 className="text-2xl font-bold text-[#1A231E]">Términos y Condiciones de Uso</h1>
      </div>

      <p>
        <strong>1. Titularidad del Servicio:</strong> La plataforma SaaS <em>Mi Huerta Casera</em> es gestionada y mantenida por <strong>las paginas de dani</strong> con el propósito de facilitar la gestión y seguimiento de huertas caseras y urbanas.
      </p>

      <p>
        <strong>2. Condiciones de Acceso y Uso:</strong> El acceso a las herramientas de monitoreo de humedad, calendario de riego y registro de cultivos requiere la aceptación independiente de estos Términos y Condiciones y de la <button type="button" onClick={() => onNavigate('privacidad')} className="underline text-[#2D5A27] font-medium">Política de Privacidad</button>.
      </p>

      <p>
        <strong>3. Alcance de las Recomendaciones Agronómicas:</strong> Las frecuencias de riego, horas de exposición solar y días hasta cosecha ofrecidos por la aplicación constituyen estimaciones orientativas que el usuario debe adaptar al microclima de su hogar o terraza.
      </p>

      <p>
        <strong>4. Propiedad Intelectual y Disponibilidad:</strong> El código, diseño minimalista y arquitectura de contenidos son titularidad de <strong>las paginas de dani</strong>.
      </p>
    </div>
  </article>
);

export const CookiePolicyPage: React.FC<LegalPageProps> = ({ onNavigate }) => (
  <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
    <button
      type="button"
      onClick={() => onNavigate('inicio')}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D5A27] hover:underline"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      <span>Volver al inicio</span>
    </button>

    <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl p-6 sm:p-8 space-y-5 text-sm text-[#4A554E] leading-relaxed">
      <div className="flex items-center gap-2.5 text-[#2D5A27]">
        <Cookie className="w-6 h-6" />
        <h1 className="text-2xl font-bold text-[#1A231E]">
          Política de Cookies y Evaluación de Consentimiento Previo
        </h1>
      </div>

      <p>
        <strong>1. Responsable:</strong> <strong>las paginas de dani</strong>.
      </p>

      <p>
        <strong>2. Evaluación de Necesidad de Consentimiento Previo (Art. 22.2 LSSI-CE y Directrices AEPD):</strong> Se ha realizado una auditoría técnica sobre los mecanismos de almacenamiento de <em>Mi Huerta Casera</em>:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Almacenamiento técnico estrictamente necesario (Exento de ejecución bloqueante, informado desde el inicio):</strong> Claves locales <code>mi_huerta_casera_crops_v1</code>, <code>mi_huerta_casera_tasks_v1</code> y <code>mi_huerta_casera_consent_audit_v1</code> utilizadas exclusivamente para recordar tus plantas y conservar la prueba legal de tus consentimientos.
        </li>
        <li>
          <strong>Cookies analíticas, publicitarias o de rastreo de terceros (Requieren consentimiento previo antes de su ejecución):</strong> Esta aplicación web bloquea por defecto cualquier script no esencial. Ninguna cookie opcional se ejecuta sin acción afirmativa previa en el banner de consentimiento.
        </li>
      </ul>

      <p>
        <strong>3. Registro de tu Preferencia:</strong> Toda decisión tomada en el banner de cookies queda documentada internamente para trazabilidad del consentimiento.
      </p>
    </div>
  </article>
);
