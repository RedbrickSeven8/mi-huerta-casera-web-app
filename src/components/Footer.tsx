import React from 'react';
import { Sprout, Shield, FileText, Cookie, Activity } from 'lucide-react';
import type { PageRoute } from '../types/huerta';

interface FooterProps {
  onNavigate: (route: PageRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#F2EFE9] border-t border-[#E2DFD7] mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-md bg-[#2D5A27] flex items-center justify-center text-[#FAF9F6]">
                <Sprout className="w-4 h-4" />
              </span>
              <span className="font-semibold text-[#1A231E]">Mi Huerta Casera</span>
            </div>
            <p className="text-xs text-[#5A655E] leading-relaxed">
              Aplicación Web / SaaS minimalista diseñada para gestionar y hacerle seguimiento a tu huerta casera con precisión.
            </p>
            <p className="text-xs font-medium text-[#1A231E]">
              Responsable legal: <span className="text-[#2D5A27]">las paginas de dani</span>
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A231E] mb-3">
              Aplicación Web
            </h3>
            <ul className="space-y-2 text-xs text-[#4A554E]">
              <li>
                <button type="button" onClick={() => onNavigate('inicio')} className="hover:text-[#2D5A27] transition-colors">
                  Inicio y Resumen
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('dashboard')} className="hover:text-[#2D5A27] transition-colors">
                  Panel de Cultivos (Dashboard)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('calendario')} className="hover:text-[#2D5A27] transition-colors">
                  Calendario de Riego y Tareas
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('registro')} className="hover:text-[#2D5A27] transition-colors">
                  Añadir Nuevo Cultivo
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A231E] mb-3">
              Legalidad y Privacidad
            </h3>
            <ul className="space-y-2 text-xs text-[#4A554E]">
              <li>
                <button type="button" onClick={() => onNavigate('privacidad')} className="inline-flex items-center gap-1.5 hover:text-[#2D5A27] transition-colors">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Política de Privacidad</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('terminos')} className="inline-flex items-center gap-1.5 hover:text-[#2D5A27] transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Términos y Condiciones</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('cookies')} className="inline-flex items-center gap-1.5 hover:text-[#2D5A27] transition-colors">
                  <Cookie className="w-3.5 h-3.5" />
                  <span>Política de Cookies</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('auditoria')} className="inline-flex items-center gap-1.5 hover:text-[#2D5A27] transition-colors">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Registro Técnico de Auditoría</span>
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A231E] mb-3">
              Estado del Sistema
            </h3>
            <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E2DFD7] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#2D5A27] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#2D5A27]" />
                <span>Sincronización Local Activa</span>
              </div>
              <p className="text-[#5A655E]">
                Dominio oficial: mi-huerta-casera-stitch.surge.sh
              </p>
              <button
                type="button"
                onClick={() => onNavigate('404')}
                className="text-[11px] underline text-[#5A655E] hover:text-[#1A231E]"
              >
                Verificar vista de página 404
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E2DFD7] flex flex-col sm:flex-row items-center justify-between text-xs text-[#5A655E] gap-4">
          <p>© {new Date().getFullYear()} Mi Huerta Casera · Titular y responsable: las paginas de dani.</p>
          <div className="flex gap-4">
            <button type="button" onClick={() => onNavigate('privacidad')} className="hover:text-[#1A231E]">Privacidad</button>
            <button type="button" onClick={() => onNavigate('terminos')} className="hover:text-[#1A231E]">Términos</button>
            <button type="button" onClick={() => onNavigate('cookies')} className="hover:text-[#1A231E]">Cookies</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
