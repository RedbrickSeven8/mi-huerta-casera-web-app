import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Home } from 'lucide-react';
import type { PageRoute } from '../types/huerta';

interface BreadcrumbsProps {
  currentRoute: PageRoute;
  onNavigate: (route: PageRoute) => void;
}

const ROUTE_LABELS: Record<PageRoute, { label: string; parent?: PageRoute }> = {
  inicio: { label: 'Inicio' },
  dashboard: { label: 'Panel de Mi Huerta', parent: 'inicio' },
  calendario: { label: 'Calendario de Riego y Tareas', parent: 'dashboard' },
  registro: { label: 'Configurar Huerta y Nuevo Cultivo', parent: 'dashboard' },
  agradecimiento: { label: 'Confirmación y Agradecimiento', parent: 'registro' },
  privacidad: { label: 'Política de Privacidad', parent: 'inicio' },
  terminos: { label: 'Términos y Condiciones', parent: 'inicio' },
  cookies: { label: 'Política de Cookies', parent: 'inicio' },
  'admin-donaciones': { label: 'Validación de Donaciones', parent: 'inicio' },
  auditoria: { label: 'Administración', parent: 'inicio' },
  '404': { label: 'Error 404 · Página no encontrada', parent: 'inicio' },
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentRoute, onNavigate }) => {
  const currentInfo = ROUTE_LABELS[currentRoute] || ROUTE_LABELS.inicio;

  return (
    <nav
      aria-label="Breadcrumb"
      className="bg-[#F2EFE9]/70 border-b border-[#E2DFD7] py-2.5 px-4 sm:px-6"
    >
      <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="max-w-6xl mx-auto flex items-center flex-wrap gap-1.5 text-xs text-[#5A655E]">
        <button
          type="button"
          onClick={() => onNavigate('inicio')}
          className="inline-flex items-center gap-1 hover:text-[#2D5A27] transition-colors font-medium"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Inicio</span>
        </button>

        {currentInfo.parent && currentInfo.parent !== 'inicio' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[#8A968E]" />
            <button
              type="button"
              onClick={() => onNavigate(currentInfo.parent!)}
              className="hover:text-[#2D5A27] transition-colors font-medium"
            >
              {ROUTE_LABELS[currentInfo.parent].label}
            </button>
          </>
        )}

        {currentRoute !== 'inicio' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[#8A968E]" />
            <span className="text-[#1A231E] font-semibold" aria-current="page">
              {currentInfo.label}
            </span>
          </>
        )}
      </motion.div>
    </nav>
  );
};
