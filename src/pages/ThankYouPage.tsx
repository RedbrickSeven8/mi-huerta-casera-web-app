import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, LayoutDashboard, PlusCircle } from 'lucide-react';
import type { PageRoute } from '../types/huerta';

interface ThankYouPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({ onNavigate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 py-12"
    >
      <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl p-8 text-center space-y-6 shadow-2xs">
        <div className="w-14 h-14 rounded-2xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A231E]">
            Cultivo guardado
          </h1>
          <p className="text-sm text-[#4A554E] max-w-xl mx-auto">
            El cultivo está activo en tu huerta.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-sm font-semibold hover:bg-[#23471E] transition-colors cursor-pointer shadow-xs"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Ver Huerta</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => onNavigate('registro')}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#F2EFE9] text-[#1A231E] text-sm font-medium hover:bg-[#E2DFD7] transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Añadir otro</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
