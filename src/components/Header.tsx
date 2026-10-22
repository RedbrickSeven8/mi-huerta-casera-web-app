import React from 'react';
import { Sprout, LayoutDashboard, Calendar, PlusCircle, ShieldCheck } from 'lucide-react';
import type { PageRoute } from '../types/huerta';
import { GoogleAuthButton } from './GoogleAuthButton';

interface HeaderProps {
  currentRoute: PageRoute;
  onNavigate: (route: PageRoute) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate }) => {
  const navItems: { route: PageRoute; label: string; icon: React.ReactNode }[] = [
    { route: 'inicio', label: 'Inicio', icon: <Sprout className="w-4 h-4" /> },
    { route: 'dashboard', label: 'Mi Huerta', icon: <LayoutDashboard className="w-4 h-4" /> },
    { route: 'calendario', label: 'Calendario', icon: <Calendar className="w-4 h-4" /> },
    { route: 'auditoria', label: 'Auditoría Legal', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur border-b border-[#E2DFD7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('inicio')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <span className="w-9 h-9 rounded-lg bg-[#2D5A27] flex items-center justify-center text-[#FAF9F6] transition-transform group-hover:scale-105">
            <Sprout className="w-5 h-5" />
          </span>
          <div>
            <span className="block text-base font-semibold tracking-tight text-[#1A231E]">
              Mi Huerta Casera
            </span>
            <span className="block text-[11px] text-[#5A655E] leading-none">
              SaaS de Seguimiento Hortícola
            </span>
          </div>
        </button>

        <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = currentRoute === item.route;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => onNavigate(item.route)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  active
                    ? 'bg-[#2D5A27]/10 text-[#2D5A27]'
                    : 'text-[#4A554E] hover:text-[#1A231E] hover:bg-[#F2EFE9]'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <GoogleAuthButton />
          <button
            type="button"
            onClick={() => onNavigate('registro')}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-[#2D5A27] text-[#FAF9F6] hover:bg-[#23471E] transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Cultivo</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <nav aria-label="Navegación móvil" className="md:hidden border-t border-[#E2DFD7] bg-[#FAF9F6] px-2 py-1.5 flex justify-around">
        {navItems.map((item) => {
          const active = currentRoute === item.route;
          return (
            <button
              key={item.route}
              type="button"
              onClick={() => onNavigate(item.route)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 ${
                active ? 'bg-[#2D5A27]/15 text-[#2D5A27]' : 'text-[#4A554E]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
