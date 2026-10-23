import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  LayoutList,
  CalendarDays,
  Sparkles,
  Scissors,
  Droplets,
  ShieldAlert,
  CalendarCheck,
  Lock
} from 'lucide-react';
import type { GardenTask, CropItem, PageRoute } from '../types/huerta';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import type { UserProfile } from '../services/authService';

interface CalendarPageProps {
  tasks: GardenTask[];
  crops: CropItem[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<GardenTask, 'id' | 'completed'>) => void;
  onDeleteTask: (taskId: string) => void;
  onNavigate: (route: PageRoute) => void;
  user: UserProfile | null;
  onAuthChange: (user: UserProfile | null) => void;
}

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const CalendarPage: React.FC<CalendarPageProps> = ({
  tasks,
  crops,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onNavigate,
  user,
  onAuthChange
}) => {
  const [selectedCropId, setSelectedCropId] = useState<string>(crops[0]?.id || '');
  const [taskType, setTaskType] = useState<GardenTask['type']>('Riego');
  const [dueDate, setDueDate] = useState<string>(getTodayString());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());

  const [selectedTaskModal, setSelectedTaskModal] = useState<GardenTask | null>(null);
  const [selectedDayModal, setSelectedDayModal] = useState<{
    dateStr: string;
    formattedDate: string;
    dayTasks: GardenTask[];
  } | null>(null);

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A231E]">
            Acceso
          </h1>
          <p className="text-sm text-[#4A554E] max-w-md mx-auto">
            Inicia sesión para ver tu calendario.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-[#E2DFD7] shadow-xs max-w-md mx-auto space-y-4">
          <div className="flex justify-center pt-2">
            <GoogleAuthButton onAuthChange={onAuthChange} />
          </div>
        </div>
      </motion.div>
    );
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const found = crops.find((c) => c.id === selectedCropId);
    const cropName = found ? found.name : 'Bancal General';
    onAddTask({
      cropId: selectedCropId || 'general',
      cropName,
      type: taskType,
      dueDate: dueDate || getTodayString()
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const startOffset = (firstDayOfMonth + 6) % 7;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const formatDayDateString = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const handleDayClick = (day: number) => {
    const dateStr = formatDayDateString(day);
    const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
    const displayDate = new Date(year, month, day).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setSelectedDayModal({
      dateStr,
      formattedDate: displayDate,
      dayTasks
    });
  };

  const getTaskIcon = (type: GardenTask['type']) => {
    switch (type) {
      case 'Riego':
        return <Droplets className="w-3.5 h-3.5 text-blue-600" />;
      case 'Abonado':
        return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
      case 'Poda':
        return <Scissors className="w-3.5 h-3.5 text-emerald-700" />;
      case 'Cosecha':
        return <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Control preventivo':
        return <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DFD7] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A231E]">
            Calendario
          </h1>
          <p className="text-sm text-[#4A554E] mt-1">
            Labores programadas. Al marcarlas como hechas van a la bitácora.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#F2EFE9] p-1 rounded-xl border border-[#E2DFD7]">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white text-[#1A231E] shadow-xs'
                  : 'text-[#5A655E] hover:text-[#1A231E]'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Mes</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#1A231E] shadow-xs'
                  : 'text-[#5A655E] hover:text-[#1A231E]'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-xs font-semibold hover:bg-[#23471E] transition-colors cursor-pointer shadow-xs"
          >
            Mi Huerta
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {viewMode === 'calendar' ? (
            <div className="bg-white rounded-2xl border border-[#E2DFD7] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2DFD7] pb-4">
                <h2 className="text-lg font-bold text-[#1A231E] capitalize flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#2D5A27]" />
                  <span>{monthName}</span>
                </h2>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    aria-label="Anterior"
                    className="p-1.5 rounded-lg border border-[#E2DFD7] hover:bg-[#F2EFE9] text-[#1A231E] transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentMonthDate(new Date())}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg border border-[#E2DFD7] hover:bg-[#F2EFE9] text-[#1A231E] cursor-pointer"
                  >
                    Hoy
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Siguiente"
                    className="p-1.5 rounded-lg border border-[#E2DFD7] hover:bg-[#F2EFE9] text-[#1A231E] transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#5A655E] pb-2">
                <div>Lun</div>
                <div>Mar</div>
                <div>Mié</div>
                <div>Jue</div>
                <div>Vie</div>
                <div>Sáb</div>
                <div>Dom</div>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: startOffset }).map((_, i) => (
                  <div key={'empty-' + i} className="h-20 sm:h-24 rounded-xl bg-[#FAF9F6]/50 border border-transparent" />
                ))}

                {daysArray.map((day) => {
                  const dateStr = formatDayDateString(day);
                  const isToday = dateStr === getTodayString();
                  const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
                  const pendingCount = dayTasks.filter((t) => !t.completed).length;

                  return (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.15 }}
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`h-20 sm:h-24 p-1.5 rounded-xl border flex flex-col justify-between transition-colors cursor-pointer ${
                        isToday
                          ? 'border-[#2D5A27] bg-[#2D5A27]/5 font-bold shadow-xs'
                          : 'border-[#E2DFD7] hover:border-[#2D5A27]/50 hover:bg-[#FAF9F6]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${isToday ? 'text-[#2D5A27] font-bold' : 'text-[#1A231E]'}`}>
                          {day}
                        </span>
                        {pendingCount > 0 && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                        )}
                      </div>

                      <div className="space-y-1 overflow-hidden">
                        {dayTasks.slice(0, 2).map((t) => (
                          <div
                            key={t.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTaskModal(t);
                            }}
                            className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 ${
                              t.completed
                                ? 'bg-gray-100 text-gray-400 line-through'
                                : 'bg-[#2D5A27]/10 text-[#2D5A27]'
                            }`}
                          >
                            <span className="truncate">{t.type}: {t.cropName}</span>
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-[9px] text-[#5A655E] text-center">
                            +{dayTasks.length - 2}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="pt-2 text-xs text-[#5A655E] flex items-center justify-between border-t border-[#E2DFD7]">
                <span>Total: {tasks.length} labores</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-[#1A231E]">
                Tareas ({tasks.length})
              </h2>
              {tasks.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white border border-[#E2DFD7] text-xs text-[#5A655E]">
                  Sin tareas.
                </div>
              ) : (
                tasks.map((task) => (
                  <motion.div
                    layout
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-colors flex items-center justify-between gap-4 ${
                      task.completed
                        ? 'bg-[#FAF9F6] border-[#E2DFD7] opacity-75'
                        : 'bg-white border-[#E2DFD7] shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => onToggleTask(task.id)}
                        className="mt-0.5 text-[#2D5A27] cursor-pointer"
                      >
                        {task.completed ? (
                          <CheckSquare className="w-5 h-5 text-[#2D5A27]" />
                        ) : (
                          <Square className="w-5 h-5 text-[#8A968E]" />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#2D5A27]/10 text-[#2D5A27]">
                            {task.type}
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              task.completed ? 'line-through text-[#5A655E]' : 'text-[#1A231E]'
                            }`}
                          >
                            {task.cropName}
                          </span>
                        </div>
                        <p className="text-xs text-[#5A655E] mt-1">
                          {task.dueDate} {task.completed ? '· Hecha' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleTask(task.id)}
                        className="px-3 py-1.5 rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] text-xs font-medium text-[#1A231E] hover:bg-[#E2DFD7] cursor-pointer"
                      >
                        {task.completed ? 'Deshacer' : 'Hecha'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 text-[#8A968E] hover:text-red-700 rounded-lg hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Formulario */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E2DFD7] shadow-xs space-y-4 w-full overflow-hidden">
          <div className="border-b border-[#E2DFD7] pb-3">
            <h2 className="text-base font-bold text-[#1A231E] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#2D5A27]" />
              <span>Nueva Tarea</span>
            </h2>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-4 w-full">
            <div className="w-full">
              <label htmlFor="task-crop" className="block text-xs font-semibold text-[#1A231E] mb-1">
                Cultivo
              </label>
              <select
                id="task-crop"
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
                className="w-full max-w-full block rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] box-border"
              >
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.bed})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full">
              <label htmlFor="task-type" className="block text-xs font-semibold text-[#1A231E] mb-1">
                Labor
              </label>
              <select
                id="task-type"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as GardenTask['type'])}
                className="w-full max-w-full block rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] box-border"
              >
                <option value="Riego">Riego</option>
                <option value="Abonado">Abonado</option>
                <option value="Poda">Poda</option>
                <option value="Cosecha">Cosecha</option>
                <option value="Control preventivo">Control preventivo</option>
              </select>
            </div>

            <div className="w-full">
              <label htmlFor="task-date" className="block text-xs font-semibold text-[#1A231E] mb-1">
                Fecha
              </label>
              <input
                id="task-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full max-w-full block rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] box-border"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-xs font-semibold hover:bg-[#23471E] transition-colors cursor-pointer shadow-xs"
            >
              Guardar Tarea
            </motion.button>
          </form>
        </div>
      </div>

      {/* Modales */}
      <AnimatePresence>
        {selectedTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A231E]/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2DFD7] space-y-4"
            >
              <div className="flex items-start justify-between border-b border-[#E2DFD7] pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-[#2D5A27]/10">
                    {getTaskIcon(selectedTaskModal.type)}
                  </span>
                  <div>
                    <h3 className="font-bold text-[#1A231E] text-base">{selectedTaskModal.type}</h3>
                    <p className="text-xs text-[#5A655E]">{selectedTaskModal.cropName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTaskModal(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-[#4A554E]">
                <div className="flex justify-between py-1 border-b border-[#FAF9F6]">
                  <span>Fecha:</span>
                  <strong className="text-[#1A231E]">{selectedTaskModal.dueDate}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-[#FAF9F6]">
                  <span>Estado:</span>
                  <strong className={selectedTaskModal.completed ? 'text-emerald-700' : 'text-amber-600'}>
                    {selectedTaskModal.completed ? 'Hecha' : 'Pendiente'}
                  </strong>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#E2DFD7]">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteTask(selectedTaskModal.id);
                    setSelectedTaskModal(null);
                  }}
                  className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                >
                  Eliminar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onToggleTask(selectedTaskModal.id);
                    setSelectedTaskModal({
                      ...selectedTaskModal,
                      completed: !selectedTaskModal.completed
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-[#2D5A27] text-white text-xs font-semibold hover:bg-[#23471E] cursor-pointer"
                >
                  {selectedTaskModal.completed ? 'Marcar Pendiente' : 'Marcar Hecha'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A231E]/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2DFD7] space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-start justify-between border-b border-[#E2DFD7] pb-3">
                <div>
                  <h3 className="font-bold text-lg text-[#1A231E] capitalize">
                    {selectedDayModal.formattedDate}
                  </h3>
                  <p className="text-xs text-[#5A655E]">
                    {selectedDayModal.dayTasks.length} labores
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDayModal(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {selectedDayModal.dayTasks.length === 0 ? (
                  <p className="text-xs text-center text-[#5A655E] py-8">
                    Sin tareas para este día.
                  </p>
                ) : (
                  selectedDayModal.dayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl border border-[#E2DFD7] bg-[#FAF9F6] flex items-center justify-between"
                    >
                      <div
                        onClick={() => {
                          setSelectedDayModal(null);
                          setSelectedTaskModal(task);
                        }}
                        className="cursor-pointer flex-1"
                      >
                        <p
                          className={`text-sm font-semibold flex items-center gap-1.5 ${
                            task.completed ? 'line-through text-gray-400' : 'text-[#1A231E]'
                          }`}
                        >
                          {getTaskIcon(task.type)}
                          <span>{task.type} · {task.cropName}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onToggleTask(task.id);
                            setSelectedDayModal({
                              ...selectedDayModal,
                              dayTasks: selectedDayModal.dayTasks.map((t) =>
                                t.id === task.id ? { ...t, completed: !t.completed } : t
                              )
                            });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                            task.completed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-white border-[#E2DFD7] text-[#1A231E] hover:bg-[#F2EFE9]'
                          }`}
                        >
                          {task.completed ? 'Hecha' : 'Pendiente'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteTask(task.id);
                            setSelectedDayModal({
                              ...selectedDayModal,
                              dayTasks: selectedDayModal.dayTasks.filter((t) => t.id !== task.id)
                            });
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-[#E2DFD7] flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedDayModal(null)}
                  className="px-4 py-2 rounded-xl bg-[#F2EFE9] text-xs font-semibold text-[#1A231E] hover:bg-[#E2DFD7] cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
