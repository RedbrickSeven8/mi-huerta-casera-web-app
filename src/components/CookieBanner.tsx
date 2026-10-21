import { useState, useEffect } from 'react';
import { Cookie, Check, X } from 'lucide-react';
import { recordConsentEvent } from '../services/auditLogger';
import type { PageRoute } from '../types/huerta';

interface CookieBannerProps {
  onNavigate: (route: PageRoute) => void;
}

const COOKIE_DECISION_KEY = 'mi_huerta_casera_cookie_consent_v1';

export const CookieBanner: React.FC<CookieBannerProps> = ({ onNavigate }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_DECISION_KEY);
    if (!saved) {
      setVisible(true);
    }
  }, []);

  const handleDecision = (accepted: boolean) => {
    const status = accepted ? 'Aceptado' : 'Rechazado';
    localStorage.setItem(
      COOKIE_DECISION_KEY,
      JSON.stringify({ status, timestamp: new Date().toISOString() })
    );
    recordConsentEvent({
      consentType: 'Política de Cookies (Técnicas/Opcionales)',
      status,
      acceptanceMethod: accepted
        ? 'Clic explícito en botón "Aceptar cookies opcionales" del banner previo'
        : 'Clic explícito en botón "Solo técnicas esenciales" del banner previo',
      formOrigin: 'Banner de Consentimiento Previo de Cookies',
      userIdentifier: 'Visitante Web'
    });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Aviso de consentimiento de cookies"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-[#FFFFFF] border border-[#D5E0D3] rounded-2xl shadow-lg p-5"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-[#2D5A27]/10 text-[#2D5A27] shrink-0">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="text-xs text-[#4A554E] space-y-2">
          <p className="font-semibold text-sm text-[#1A231E]">
            Control previo de Cookies y Almacenamiento Local
          </p>
          <p>
            Responsable: <strong>las paginas de dani</strong>. Utilizamos almacenamiento técnico local estrictamente necesario para guardar tus cultivos y auditoría legal. No ejecutamos cookies analíticas ni de terceros sin tu consentimiento previo. Consulta nuestra{' '}
            <button
              type="button"
              onClick={() => onNavigate('cookies')}
              className="underline text-[#2D5A27] font-medium hover:text-[#1A231E]"
            >
              Política de Cookies
            </button>.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDecision(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2D5A27] text-[#FAF9F6] font-medium hover:bg-[#23471E] transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aceptar todas</span>
            </button>
            <button
              type="button"
              onClick={() => handleDecision(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F2EFE9] text-[#1A231E] font-medium hover:bg-[#E2DFD7] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Solo técnicas esenciales</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
