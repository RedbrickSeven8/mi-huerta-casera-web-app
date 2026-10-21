import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckSquare, Square, Plus, ArrowRight } from 'lucide-react';
import type { GardenTask, CropItem, PageRoute } from '../types/huerta';

interface CalendarPageProps {
  tasks: GardenTask[];
  crops: CropItem[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<GardenTask, 'id' | 'completed'>) => void;
  onNavigate: (route: PageRoute) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  tasks,
  crops,
  onToggleTask,
  onAddTask,
  onNavigate
}) => {
  const [selectedCropId, setSelectedCropId] = useState<string>(crops[0]?.id || '');
  const [taskType, setTaskType] = useState<GardenTask['type']>('Riego');
  const [dueDate, setDueDate] = useState<string>('Mañana · 08:30');

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
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F2EFE9] text-[#1A231E] text-xs sm:text-sm font-medium hover:bg-[#E2DFD7]"
        >
          <span>Volver al Panel de Cultivos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Task List */}
        <div className="lg:col-span-7 space-y-3">
          <h2 className="text-base font-bold text-[#1A231E] flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#2D5A27]" />
            <span>Tareas programadas ({tasks.length})</span>
          </h2>

          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onToggleTask(task.id)}
                className={`p-4 rounded-xl border transition-colors flex items-center justify-between cursor-pointer ${
                  task.completed
                    ? 'bg-[#F2EFE9]/60 border-[#E2DFD7] text-[#8A968E]'
                    : 'bg-[#FFFFFF] border-[#E2DFD7] hover:border-[#2D5A27]'
                }`}
              >
                <div className="flex items-center gap-3">
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
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    task.completed
                      ? 'bg-[#E2DFD7] text-[#5A655E]'
                      : 'bg-[#2D5A27]/10 text-[#2D5A27]'
                  }`}
                >
                  {task.completed ? 'Completada' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
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
                {crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name} ({crop.bed})
                  </option>
                ))}
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
