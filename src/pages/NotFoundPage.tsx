import React from 'react';
import { Sprout, Home, LayoutDashboard } from 'lucide-react';
import type { PageRoute } from '../types/huerta';

interface NotFoundPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center mx-auto">
        <Sprout className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <span className="text-xs font-mono uppercase tracking-widest text-[#2D5A27] font-semibold">
          Error 404 · Bancal sin sembrar
        </span>
        <h1 className="text-3xl font-bold text-[#1A231E]">
          No hemos encontrado la página que buscas
        </h1>
        <p className="text-sm text-[#4A554E]">
          La ruta solicitada no existe en Mi Huerta Casera. Puedes regresar al inicio o abrir directamente tu panel de seguimiento de cultivos.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onNavigate('inicio')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-sm font-semibold hover:bg-[#23471E]"
        >
          <Home className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F2EFE9] text-[#1A231E] text-sm font-medium hover:bg-[#E2DFD7]"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Ir a Mi Huerta</span>
        </button>
      </div>
    </div>
  );
};
