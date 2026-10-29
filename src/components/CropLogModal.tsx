import { getUser } from '../services/authService';
import { UserAvatar } from './UserAvatar';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Droplets,
  Sprout,
  Scissors,
  Sparkles,
  ShieldAlert,
  CalendarCheck,
  Plus,
  BookOpen,
  ArrowRight,
  Trash2
} from 'lucide-react';
import type { CropItem, CropLogEntry, LogEntryType } from '../types/huerta';
import { inferCropCategory } from '../data/cropsDatabase';
import { Trees, Home } from 'lucide-react';

interface CropLogModalProps {
  crop: CropItem;
  onClose: () => void;
  onAddLogEntry: (cropId: string, entry: Omit<CropLogEntry, 'id'>) => void;
  onDeleteLogEntry: (cropId: string, logId: string) => void;
}

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentTimeString = () => {
  const d = new Date();
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const getLogIcon = (type: LogEntryType) => {
  switch (type) {
    case 'Riego':
      return <Droplets className="w-4 h-4 text-blue-600" />;
    case 'Abonado':
      return <Sparkles className="w-4 h-4 text-amber-600" />;
    case 'Poda':
      return <Scissors className="w-4 h-4 text-emerald-700" />;
    case 'Cosecha':
      return <CalendarCheck className="w-4 h-4 text-emerald-600" />;
    case 'Control preventivo':
      return <ShieldAlert className="w-4 h-4 text-purple-600" />;
    case 'Siembra':
      return <Sprout className="w-4 h-4 text-green-700" />;
    case 'Cambio de etapa':
      return <ArrowRight className="w-4 h-4 text-indigo-600" />;
    default:
      return <BookOpen className="w-4 h-4 text-gray-600" />;
  }
};

const getLogBadgeStyle = (type: LogEntryType) => {
  switch (type) {
    case 'Riego':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Abonado':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Poda':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Cosecha':
      return 'bg-lime-50 text-lime-800 border-lime-200';
    case 'Control preventivo':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Siembra':
      return 'bg-green-50 text-green-800 border-green-200';
    case 'Cambio de etapa':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export const CropLogModal: React.FC<CropLogModalProps> = ({
  crop,
  onClose,
  onAddLogEntry,
  onDeleteLogEntry
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [entryType, setEntryType] = useState<LogEntryType>('Riego');
  const [title, setTitle] = useState('');
  const [entryDate, setEntryDate] = useState(getTodayString());
  const [entryNotes, setEntryNotes] = useState('');

  const logs = crop.log || [];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddLogEntry(crop.id, {
      type: entryType,
      title: title.trim(),
      date: entryDate || getTodayString(),
      time: getCurrentTimeString(),
      notes: entryNotes.trim() || undefined
    });

    setTitle('');
    setEntryNotes('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A231E]/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-[#E2DFD7] space-y-5 my-8 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E2DFD7] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1A231E]">Bitácora: {crop.name}</h2>
                {(() => {
                  const cat = crop.category || inferCropCategory(crop.name);
                  if (cat === 'Plantas de interior') {
                    return (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200">
                        <Home className="w-3 h-3" /> Plantas de interior
                      </span>
                    );
                  }
                  if (cat === 'Plantas de exterior') {
                    return (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200">
                        <Trees className="w-3 h-3" /> Plantas de exterior
                      </span>
                    );
                  }
                  if (cat === 'Otros complementarios y transversales (cactus, aromáticas, etc.)') {
                    return (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200">
                        <Sparkles className="w-3 h-3" /> Complementarios y transversales
                      </span>
                    );
                  }
                  return (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Sprout className="w-3 h-3" /> Plantas de Huerta
                    </span>
                  );
                })()}
                <span className="text-[11px] font-medium bg-[#2D5A27]/10 text-[#2D5A27] px-2 py-0.5 rounded-full">
                  {crop.bed}
                </span>
              </div>
              <p className="text-xs text-[#5A655E] mt-0.5">
                {crop.variety}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-[#1A231E]">
            {logs.length} registros
          </span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D5A27] text-white text-xs font-medium hover:bg-[#23471E] transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancelar' : 'Nuevo'}</span>
          </motion.button>
        </div>

        {/* Formulario */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleFormSubmit}
              className="p-4 rounded-xl bg-[#FAF9F6] border border-[#D5E0D3] space-y-3 shrink-0 overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-44">
                  <label className="block text-[11px] font-semibold text-[#1A231E] mb-1">
                    Labor
                  </label>
                  <select
                    value={entryType}
                    onChange={(e) => setEntryType(e.target.value as LogEntryType)}
                    className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E]"
                  >
                    <option value="Riego">Riego</option>
                    <option value="Abonado">Abonado</option>
                    <option value="Poda">Poda</option>
                    <option value="Cosecha">Cosecha</option>
                    <option value="Control preventivo">Control preventivo</option>
                    <option value="Cambio de etapa">Cambio de etapa</option>
                    <option value="Observación">Observación</option>
                  </select>
                </div>

                <div className="w-full sm:w-36 shrink-0">
                  <label className="block text-[11px] font-semibold text-[#1A231E] mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2 py-1.5 text-xs text-[#1A231E]"
                    required
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <label className="block text-[11px] font-semibold text-[#1A231E] mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    placeholder="Acción realizada"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1A231E] mb-1">
                  Nota
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles"
                  value={entryNotes}
                  onChange={(e) => setEntryNotes(e.target.value)}
                  className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#D5E0D3] text-xs text-[#5A655E] hover:bg-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#2D5A27] text-white text-xs font-semibold hover:bg-[#23471E]"
                >
                  Guardar
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-10 text-[#5A655E] space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-[#8A968E]" />
              <p className="text-xs">Sin registros.</p>
            </div>
          ) : (
            logs.map((entry) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="p-3.5 rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] flex items-start gap-3 hover:border-[#D5E0D3] transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${getLogBadgeStyle(
                    entry.type
                  )}`}
                >
                  {getLogIcon(entry.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1A231E]">
                        {entry.title}
                      </span>
                      {(() => {
                        const currentUser = getUser();
                        if (currentUser) {
                          return (
                            <div className="inline-flex items-center gap-1.5 bg-[#FAF9F6] border border-[#E2DFD7] px-1.5 py-0.5 rounded-full">
                              <UserAvatar
                                name={currentUser.name}
                                picture={currentUser.picture}
                                isDonor={currentUser.isDonor}
                                size="xs"
                              />
                              <span className="text-[10px] text-[#5A655E] hidden sm:inline">
                                {currentUser.name}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#5A655E]">
                        {entry.date} {entry.time ? `· ${entry.time}` : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteLogEntry(crop.id, entry.id)}
                        title="Eliminar"
                        aria-label={`Eliminar ${entry.title}`}
                        className="p-1 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${getLogBadgeStyle(
                        entry.type
                      )}`}
                    >
                      {entry.type}
                    </span>
                    {entry.taskId && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Desde Calendario
                      </span>
                    )}
                  </div>

                  {entry.notes && (
                    <p className="text-xs text-[#4A554E] mt-2 bg-white/70 p-2 rounded-lg border border-[#E2DFD7]/60">
                      {entry.notes}
                    </p>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E2DFD7] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#F2EFE9] text-xs font-semibold text-[#1A231E] hover:bg-[#E2DFD7] cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
