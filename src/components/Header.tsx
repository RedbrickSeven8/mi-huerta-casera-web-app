import React from 'react';
import { Sprout, LayoutDashboard, Calendar, Lock } from 'lucide-react';
import type { PageRoute } from '../types/huerta';
import { GoogleAuthButton } from './GoogleAuthButton';
import type { UserProfile } from '../services/authService';

interface HeaderProps {
  currentRoute: PageRoute;
  onNavigate: (route: PageRoute) => void;
  user: UserProfile | null;
  onAuthChange: (user: UserProfile | null) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate, user, onAuthChange }) => {
  const navItems: { route: PageRoute; label: string; icon: React.ReactNode; requiresAuth?: boolean }[] = [
    { route: 'inicio', label: 'Inicio', icon: <Sprout className="w-4 h-4" /> },
    { route: 'dashboard', label: 'Mi Huerta', icon: <LayoutDashboard className="w-4 h-4" />, requiresAuth: true },
    { route: 'calendario', label: 'Calendario', icon: <Calendar className="w-4 h-4" />, requiresAuth: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur border-b border-[#E2DFD7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('inicio')}
          className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
        >
          <span className="w-9 h-9 rounded-lg bg-[#2D5A27] flex items-center justify-center text-[#FAF9F6] transition-transform group-hover:scale-105">
            <Sprout className="w-5 h-5" />
          </span>
          <div className="hidden sm:block">
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
            const isLocked = item.requiresAuth && !user;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => onNavigate(item.route)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                  active
                    ? 'bg-[#2D5A27]/10 text-[#2D5A27]'
                    : 'text-[#4A554E] hover:text-[#1A231E] hover:bg-[#F2EFE9]'
                }`}
              >
                {item.icon}
                {item.label}
                {isLocked && <Lock className="w-3 h-3 text-amber-600 ml-0.5" />}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <GoogleAuthButton onAuthChange={onAuthChange} />
        </div>
      </div>

      {/* Mobile navigation bar */}
      <nav aria-label="Navegación móvil" className="md:hidden border-t border-[#E2DFD7] bg-[#FAF9F6] px-2 py-1.5 flex justify-around">
        {navItems.map((item) => {
          const active = currentRoute === item.route;
          const isLocked = item.requiresAuth && !user;
          return (
            <button
              key={item.route}
              type="button"
              onClick={() => onNavigate(item.route)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                active ? 'bg-[#2D5A27]/15 text-[#2D5A27]' : 'text-[#4A554E]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {isLocked && <Lock className="w-3 h-3 text-amber-600" />}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
