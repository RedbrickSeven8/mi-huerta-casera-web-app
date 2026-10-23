import React from 'react';
import { CheckCircle2, LayoutDashboard, PlusCircle } from 'lucide-react';
import type { PageRoute } from '../types/huerta';

interface ThankYouPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
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
            El seguimiento agronómico, control de labores y bitácora fenológica ya están activos en tu panel de huerta.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-sm font-semibold hover:bg-[#23471E] transition-all transform active:scale-95 cursor-pointer shadow-xs"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Ir al Panel de Mi Huerta</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('registro')}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#F2EFE9] text-[#1A231E] text-sm font-medium hover:bg-[#E2DFD7] transition-all transform active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Añadir otro cultivo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
