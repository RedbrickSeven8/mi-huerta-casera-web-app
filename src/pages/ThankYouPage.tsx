import React from 'react';
import { CheckCircle2, LayoutDashboard, ShieldCheck, PlusCircle } from 'lucide-react';
import type { PageRoute } from '../types/huerta';
import { getAuditLogs } from '../services/auditLogger';

interface ThankYouPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({ onNavigate }) => {
  const recentLogs = getAuditLogs().slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl p-8 text-center space-y-6 shadow-2xs">
        <div className="w-14 h-14 rounded-2xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2D5A27]">
            Confirmación de Operación
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A231E]">
            ¡Gracias! Tu cultivo ha sido incorporado a Mi Huerta Casera
          </h1>
          <p className="text-sm text-[#4A554E] max-w-xl mx-auto">
            El seguimiento de humedad, exposición solar y cuenta regresiva de cosecha ya está activo en tu panel principal. Asimismo, hemos sellado el registro técnico de tus consentimientos.
          </p>
        </div>

        {recentLogs.length > 0 && (
          <div className="text-left bg-[#FAF9F6] border border-[#E2DFD7] rounded-xl p-4 space-y-2 text-xs">
            <p className="font-semibold text-[#1A231E] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
              <span>Comprobante de Auditoría de Consentimiento:</span>
            </p>
            {recentLogs.map((log) => (
              <div key={log.id} className="border-t border-[#E2DFD7] pt-2 text-[#4A554E]">
                <span className="font-mono font-semibold text-[#1A231E]">{log.id}</span> · {log.consentType} ({log.status}) — Fecha: {log.date} {log.time} — Método: {log.acceptanceMethod}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-sm font-semibold hover:bg-[#23471E]"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Ir al Panel de Mi Huerta</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('registro')}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#F2EFE9] text-[#1A231E] text-sm font-medium hover:bg-[#E2DFD7]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Añadir otro cultivo</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('auditoria')}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[#D5E0D3] text-[#1A231E] text-sm font-medium hover:bg-[#FAF9F6]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Ver Auditoría Completa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
