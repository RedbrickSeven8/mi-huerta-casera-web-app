import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckSquare, Square, Plus, ArrowRight, Trash2, LayoutList, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GardenTask, CropItem, PageRoute } from '../types/huerta';

interface CalendarPageProps {
  tasks: GardenTask[];
  crops: CropItem[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<GardenTask, 'id' | 'completed'>) => void;
  onDeleteTask: (taskId: string) => void;
  onNavigate: (route: PageRoute) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  tasks,
  crops,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onNavigate
}) => {
  const [selectedCropId, setSelectedCropId] = useState<string>(crops[0]?.id || '');
  const [taskType, setTaskType] = useState<GardenTask['type']>('Riego');
  const [dueDate, setDueDate] = useState<string>('Mañana · 08:30');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Calendar Grid state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const found = crops.find((c) => c.id === selectedCropId);
    const cropName = found ? found.name : 'Bancal General';
    onAddTask({
      cropId: selectedCropId || 'general',
      cropName,
      type: taskType,
      dueDate: dueDate.trim() || 'Próxima semana'
    });
    setDueDate('En 3 días · 09:00');
  };

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  // Helper for calendar view
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Adjust for Monday start (0=Monday, 6=Sunday)
  const startOffset = (firstDayOfMonth + 6) % 7;

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DFD7] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A231E]">
            Calendario de Riego y Tareas Hortícolas
          </h1>
          <p className="text-sm text-[#4A554E] mt-1">
            Organiza las labores semanales de riego, poda, abonado y control ecológico de tu huerta.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-[#F2EFE9] p-1 rounded-xl border border-[#E2DFD7]">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-[#2D5A27] shadow-xs'
                  : 'text-[#5A655E] hover:text-[#1A231E]'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-[#2D5A27] shadow-xs'
                  : 'text-[#5A655E] hover:text-[#1A231E]'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Vista Calendario</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F2EFE9] text-[#1A231E] text-xs sm:text-sm font-medium hover:bg-[#E2DFD7] cursor-pointer"
          >
            <span>Volver al Panel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main View Area (List or Calendar Grid) */}
        <div className="lg:col-span-7 space-y-4">
          {viewMode === 'list' ? (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-[#1A231E] flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#2D5A27]" />
                <span>Tareas programadas ({tasks.length})</span>
              </h2>

              {tasks.length === 0 ? (
                <div className="p-8 text-center bg-white border border-[#E2DFD7] rounded-2xl text-xs text-[#5A655E]">
                  No hay tareas registradas. Añade una nueva tarea desde el formulario.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border transition-colors flex items-center justify-between ${
                        task.completed
                          ? 'bg-[#F2EFE9]/60 border-[#E2DFD7] text-[#8A968E]'
                          : 'bg-[#FFFFFF] border-[#E2DFD7] hover:border-[#2D5A27]'
                      }`}
                    >
                      <div
                        onClick={() => onToggleTask(task.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onToggleTask(task.id)}
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        {task.completed ? (
                          <CheckSquare className="w-5 h-5 text-[#2D5A27] shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-[#5A655E] shrink-0" />
                        )}
                        <div>
                          <p className={`text-sm font-semibold ${task.completed ? 'line-through' : 'text-[#1A231E]'}`}>
                            {task.type} · {task.cropName}
                          </p>
                          <p className="text-xs text-[#5A655E]">Programado: {task.dueDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            task.completed
                              ? 'bg-[#E2DFD7] text-[#5A655E]'
                              : 'bg-[#2D5A27]/10 text-[#2D5A27]'
                          }`}
                        >
                          {task.completed ? 'Completada' : 'Pendiente'}
                        </span>

                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          title="Eliminar tarea"
                          aria-label={`Eliminar tarea ${task.type}`}
                          className="p-1.5 text-[#8A968E] hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors cursor-pointer ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Calendar View */
            <div className="bg-white border border-[#E2DFD7] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2DFD7] pb-3">
                <h2 className="text-base font-bold text-[#1A231E] capitalize">
                  {monthName}
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg border border-[#E2DFD7] text-[#5A655E] hover:bg-[#F2EFE9] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg border border-[#E2DFD7] text-[#5A655E] hover:bg-[#F2EFE9] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#5A655E]">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mié</span>
                <span>Jue</span>
                <span>Vie</span>
                <span>Sáb</span>
                <span>Dom</span>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: startOffset }).map((_, idx) => (
                  <div key={`offset-${idx}`} className="h-20 bg-[#FAF9F6]/50 rounded-lg border border-transparent" />
                ))}

                {daysArray.map((day) => {
                  const today = new Date();
                  const isToday =
                    day === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear();

                  return (
                    <div
                      key={day}
                      className={`h-20 p-1.5 rounded-lg border flex flex-col justify-between overflow-hidden text-xs ${
                        isToday
                          ? 'border-[#2D5A27] bg-[#2D5A27]/5 font-bold'
                          : 'border-[#E2DFD7] bg-white'
                      }`}
                    >
                      <span className={`text-[11px] ${isToday ? 'text-[#2D5A27]' : 'text-[#1A231E]'}`}>
                        {day}
                      </span>

                      {/* Display summary badge of tasks */}
                      <div className="space-y-1 overflow-y-auto">
                        {tasks.slice(0, 2).map((t, idx) => (
                          <div
                            key={t.id + idx}
                            className="text-[9px] truncate bg-[#2D5A27]/10 text-[#2D5A27] px-1 py-0.5 rounded"
                            title={`${t.type} · ${t.cropName}`}
                          >
                            {t.type}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 text-xs text-[#5A655E] border-t border-[#F2EFE9] flex items-center justify-between">
                <span>Tareas activas en la agenda: <strong>{tasks.length}</strong></span>
                <span className="text-[11px]">Haz clic en la vista de lista para marcar/eliminar</span>
              </div>
            </div>
          )}
        </div>

        {/* Add Task Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleCreateTask}
            className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-base font-bold text-[#1A231E]">Programar Nueva Tarea</h2>
            <p className="text-xs text-[#5A655E]">
              Asigna recordatorios operativos a cualquiera de tus cultivos registrados.
            </p>

            <div>
              <label htmlFor="crop-select" className="block text-xs font-semibold text-[#1A231E] mb-1">
                Cultivo asociado
              </label>
              <select
                id="crop-select"
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
                className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E]"
              >
                {crops.length === 0 ? (
                  <option value="general">Bancal General</option>
                ) : (
                  crops.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.name} ({crop.bed})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label htmlFor="task-type" className="block text-xs font-semibold text-[#1A231E] mb-1">
                Tipo de labor hortícola
              </label>
              <select
                id="task-type"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as GardenTask['type'])}
                className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E]"
              >
                <option value="Riego">Riego</option>
                <option value="Abonado">Abonado orgánico</option>
                <option value="Poda">Poda / Entutorado</option>
                <option value="Control preventivo">Control preventivo de plagas</option>
                <option value="Cosecha">Cosecha</option>
              </select>
            </div>

            <div>
              <label htmlFor="due-date" className="block text-xs font-semibold text-[#1A231E] mb-1">
                Fecha / Franja horaria
              </label>
              <input
                id="due-date"
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="Ej. Jueves · 08:00"
                className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-sm font-semibold hover:bg-[#23471E] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir al Calendario</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
