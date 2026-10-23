import React from 'react';
import { Sprout, Shield, FileText, Cookie } from 'lucide-react';
import type { PageRoute } from '../types/huerta';

interface FooterProps {
  onNavigate: (route: PageRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#F2EFE9] border-t border-[#E2DFD7] mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-md bg-[#2D5A27] flex items-center justify-center text-[#FAF9F6]">
                <Sprout className="w-4 h-4" />
              </span>
              <span className="font-semibold text-[#1A231E]">Mi Huerta Casera</span>
            </div>
            <p className="text-xs text-[#5A655E]">
              Seguimiento de huerta casera.
            </p>
            <p className="text-xs font-medium text-[#1A231E]">
              Responsable: <span className="text-[#2D5A27]">las paginas de dani</span>
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A231E] mb-2">
              Secciones
            </h3>
            <ul className="space-y-1.5 text-xs text-[#4A554E]">
              <li>
                <button type="button" onClick={() => onNavigate('inicio')} className="hover:text-[#2D5A27] cursor-pointer">
                  Inicio
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('dashboard')} className="hover:text-[#2D5A27] cursor-pointer">
                  Mi Huerta
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('calendario')} className="hover:text-[#2D5A27] cursor-pointer">
                  Calendario
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('registro')} className="hover:text-[#2D5A27] cursor-pointer">
                  Nuevo Cultivo
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A231E] mb-2">
              Legal
            </h3>
            <ul className="space-y-1.5 text-xs text-[#4A554E]">
              <li>
                <button type="button" onClick={() => onNavigate('privacidad')} className="inline-flex items-center gap-1.5 hover:text-[#2D5A27] cursor-pointer">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Privacidad</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('terminos')} className="inline-flex items-center gap-1.5 hover:text-[#2D5A27] cursor-pointer">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Términos</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('cookies')} className="inline-flex items-center gap-1.5 hover:text-[#2D5A27] cursor-pointer">
                  <Cookie className="w-3.5 h-3.5" />
                  <span>Cookies</span>
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A231E] mb-2">
              Auditoría
            </h3>
            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E2DFD7] space-y-1.5 text-xs text-[#5A655E]">
              <p>Consentimientos registrados.</p>
              <button
                type="button"
                onClick={() => onNavigate('auditoria')}
                className="text-[#2D5A27] font-semibold hover:underline block"
              >
                Ver auditoría →
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E2DFD7] flex flex-col sm:flex-row items-center justify-between text-xs text-[#5A655E] gap-4">
          <p>© 2025 Mi Huerta Casera · Responsable: las paginas de dani.</p>
          <div className="flex gap-4">
            <button type="button" onClick={() => onNavigate('privacidad')} className="hover:text-[#1A231E] cursor-pointer">Privacidad</button>
            <button type="button" onClick={() => onNavigate('terminos')} className="hover:text-[#1A231E] cursor-pointer">Términos</button>
            <button type="button" onClick={() => onNavigate('cookies')} className="hover:text-[#1A231E] cursor-pointer">Cookies</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
