import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Coffee,
  X,
  ExternalLink,
  Award,
  Sparkles,
  Sprout,
  CheckCircle2
} from 'lucide-react';
import { DonationBadgeModal } from './DonationBadgeModal';
import type { UserProfile } from '../services/authService';

export type TriggerReason =
  | 'add_crop'
  | 'add_task'
  | 'add_log'
  | 'water_milestone'
  | 'stage_milestone';

interface DonationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: TriggerReason;
  user: UserProfile | null;
}

export const DonationPromptModal: React.FC<DonationPromptModalProps> = ({
  isOpen,
  onClose,
  reason = 'add_crop',
  user
}) => {
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  if (!isOpen) return null;

  const getReasonCopy = () => {
    switch (reason) {
      case 'add_crop':
        return {
          badge: '¡Nuevo cultivo sembrado!',
          title: 'Tu huerta sigue creciendo',
          description:
            'Cada cultivo que registras ayuda a demostrar el impacto del autocultivo casero. Mi Huerta Casera es un proyecto 100% libre y gratuito desarrollado con dedicación.'
        };
      case 'add_task':
        return {
          badge: '¡Labor programada con éxito!',
          title: 'Organización para una cosecha abundante',
          description:
            'Planificar tus tareas a tiempo marca la diferencia entre una planta marchita y una canasta llena. Apoya el mantenimiento de estos servidores con un café.'
        };
      case 'add_log':
        return {
          badge: '¡Registro guardado en la bitácora!',
          title: 'El seguimiento constante da frutos',
          description:
            'Llevar el historial fenológico permite aprender y mejorar cada temporada. Ayúdanos a mantener la plataforma abierta y disponible sin costos ni anuncios.'
        };
      case 'water_milestone':
        return {
          badge: '¡Meta de riego alcanzada (9 riegos)!',
          title: '¡Tus plantas te lo agradecen!',
          description:
            'Has completado 9 riegos en tu huerta. La constancia es el secreto de todo buen hortelano. ¿Nos invitas un café para mantener el hosting y la base de datos viva?'
        };
      case 'stage_milestone':
        return {
          badge: '¡Hito fenológico (9 cambios de etapa)!',
          title: '¡Crecimiento imparable en tu huerta!',
          description:
            'Has avanzado 9 etapas fenológicas en tus cultivos. Ver florecer y madurar las plantas es mágico. Tu aporte voluntario nos permite seguir mejorando la app para toda la comunidad.'
        };
      default:
        return {
          badge: '¡Gran labor en la huerta!',
          title: 'Mantengamos esta huerta viva para todos',
          description:
            'Tu donación cubre directamente la infraestructura y servicios de base de datos para mantener la app gratuita y libre para todos.'
        };
    }
  };

  const copy = getReasonCopy();

  return createPortal(
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative bg-white rounded-3xl border border-[#E2DFD7] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 my-auto overflow-hidden"
          >
            {/* Fondo decorativo sutil */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-400/10 via-[#2D5A27]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Header con botón de cierre */}
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
          loading="lazy"
          decoding="async"
                    src="/daniel-profile.jpg"
                    alt="Daniel - Creador de Mi Huerta Casera"
                    className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-amber-400/40"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs border border-white">
                    <Coffee className="w-3 h-3" />
                  </span>
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 text-[11px] font-bold">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>{copy.badge}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#1A231E] leading-snug mt-1">
                    {copy.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal"
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido / Copy */}
            <div className="space-y-3 relative z-10 text-xs sm:text-sm text-[#4A554E] leading-relaxed">
              <p>{copy.description}</p>
              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E2DFD7] flex items-center gap-3 text-xs text-[#1A231E]">
                <div className="w-8 h-8 rounded-xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center shrink-0">
                  <Sprout className="w-4 h-4" />
                </div>
                <div className="leading-snug">
                  <span className="font-bold text-[#1A231E]">Proyecto independiente:</span>{' '}
                  <span className="text-[#5A655E]">
                    Sin publicidad invasiva ni muros de pago. Sostenido por aportes voluntarios de la comunidad.
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones de donación */}
            <div className="space-y-2.5 pt-1 relative z-10">
              <a
                href="https://link.mercadopago.com.co/mihuertacasera"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-[#2D5A27] text-white text-xs sm:text-sm font-bold hover:bg-[#23471F] transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                <Coffee className="w-4 h-4 text-amber-300" />
                <span>Apoyar en Mercado Pago</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>

              <button
                type="button"
                onClick={() => setShowBadgeModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-600" />
                <span>Ya doné / Solicitar mi insignia de Donante</span>
              </button>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#5A655E] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Aportes seguros por Mercado Pago</span>
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-[#5A655E] hover:text-[#1A231E] font-medium underline underline-offset-2 cursor-pointer"
                >
                  Continuar cultivando
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      <DonationBadgeModal
        isOpen={showBadgeModal}
        onClose={() => {
          setShowBadgeModal(false);
          onClose();
        }}
        user={user}
      />
    </>
  ,
  document.body
  );
};
