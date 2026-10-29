import { calculateDynamicWaterFrequency } from '../data/cropsDatabase';
import type { CropItem, GardenTask, GardenLocation } from '../types/huerta';
import { INITIAL_CROPS, INITIAL_TASKS } from '../data/initialCrops';
import { getUser } from './authService';
import { pushGardenDataToCloud, fetchRemoteGardenData, markLocalMutation } from './cloudSyncService';

const CROPS_KEY_PREFIX = 'mi_huerta_casera_crops_v3_';
const TASKS_KEY_PREFIX = 'mi_huerta_casera_tasks_v3_';
const UPDATED_AT_PREFIX = 'mi_huerta_casera_updated_at_';

export function getStorageKey(prefix: string): string {
  const user = getUser();
  const userId = user ? (user.email || user.id) : 'guest';
  return `${prefix}${userId}`;
}

export function setLocalUpdatedAt(isoTime: string = new Date().toISOString()): void {
  try {
    const key = getStorageKey(UPDATED_AT_PREFIX);
    localStorage.setItem(key, isoTime);
  } catch {}
}

export function loadCrops(): CropItem[] {
  try {
    const key = getStorageKey(CROPS_KEY_PREFIX);
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(INITIAL_CROPS));
      return INITIAL_CROPS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CROPS;
  }
}

export function saveCrops(crops: CropItem[]): void {
  try {
    markLocalMutation();
    const key = getStorageKey(CROPS_KEY_PREFIX);
    localStorage.setItem(key, JSON.stringify(crops));
    setLocalUpdatedAt();

    // Auto sync with cloud
    const currentTasks = loadTasks();
    pushGardenDataToCloud(crops, currentTasks);
  } catch {
    // ignore
  }
}

export function loadTasks(): GardenTask[] {
  try {
    const key = getStorageKey(TASKS_KEY_PREFIX);
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: GardenTask[]): void {
  try {
    markLocalMutation();
    const key = getStorageKey(TASKS_KEY_PREFIX);
    localStorage.setItem(key, JSON.stringify(tasks));
    setLocalUpdatedAt();

    // Auto sync with cloud
    const currentCrops = loadCrops();
    pushGardenDataToCloud(currentCrops, tasks);
  } catch {
    // ignore
  }
}

export function saveBothToCloud(crops: CropItem[], tasks: GardenTask[]): void {
  try {
    markLocalMutation();
    const cKey = getStorageKey(CROPS_KEY_PREFIX);
    const tKey = getStorageKey(TASKS_KEY_PREFIX);
    localStorage.setItem(cKey, JSON.stringify(crops));
    localStorage.setItem(tKey, JSON.stringify(tasks));
    setLocalUpdatedAt();
    pushGardenDataToCloud(crops, tasks);
  } catch {
    // ignore
  }
}

export { fetchRemoteGardenData };


const LOCATIONS_KEY_PREFIX = 'mi_huerta_casera_locations_v3_';

export const DEFAULT_LOCATIONS: GardenLocation[] = [
  { id: 'loc-1', name: 'Bancal Sur #1', type: 'Bancal elevado', sunExposure: 'Pleno sol', createdAt: '2025-01-01' },
  { id: 'loc-2', name: 'Bancal Sur #2', type: 'Bancal elevado', sunExposure: 'Pleno sol', createdAt: '2025-01-01' },
  { id: 'loc-3', name: 'Bancal Central #2', type: 'Bancal elevado', sunExposure: 'Pleno sol', createdAt: '2025-01-01' },
  { id: 'loc-4', name: 'Mesa de Cultivo Norte #1', type: 'Mesa de cultivo', sunExposure: 'Semisombra', createdAt: '2025-01-01' },
  { id: 'loc-5', name: 'Mesa de Cultivo Norte #2', type: 'Mesa de cultivo', sunExposure: 'Semisombra', createdAt: '2025-01-01' },
  { id: 'loc-6', name: 'Jardinera Profunda #3', type: 'Jardinera', sunExposure: 'Pleno sol', createdAt: '2025-01-01' },
  { id: 'loc-7', name: 'Maceta Terraza', type: 'Maceta', sunExposure: 'Semisombra', createdAt: '2025-01-01' }
];

export function loadLocations(): GardenLocation[] {
  try {
    const key = getStorageKey(LOCATIONS_KEY_PREFIX);
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocations(locations: GardenLocation[]): void {
  try {
    const key = getStorageKey(LOCATIONS_KEY_PREFIX);
    localStorage.setItem(key, JSON.stringify(locations));
    setLocalUpdatedAt();
  } catch {
    // ignore
  }
}

export function addLocation(location: Omit<GardenLocation, 'id' | 'createdAt'>): GardenLocation {
  const current = loadLocations();
  const newLoc: GardenLocation = {
    ...location,
    id: 'loc-' + Date.now(),
    createdAt: new Date().toISOString()
  };
  const updated = [...current, newLoc];
  saveLocations(updated);
  return newLoc;
}


export function generateTasksForCrop(crop: CropItem): GardenTask[] {
  const tasks: GardenTask[] = [];
  const plantedParts = crop.plantedDate.split('-').map(Number);
  const baseDate = new Date(plantedParts[0], (plantedParts[1] || 1) - 1, plantedParts[2] || 1);
  const totalDays = Math.max(1, crop.daysToHarvest);

  const formatDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const addDays = (startDate: Date, days: number): string => {
    const d = new Date(startDate.getTime());
    d.setDate(d.getDate() + days);
    return formatDate(d);
  };

  // 1. Tareas de Riego periódicas ajustadas dinámicamente según horas de sol y régimen estacional
  const dynamicWater = calculateDynamicWaterFrequency(crop.waterFrequencyDays || 2, crop.sunHours || 6, baseDate);
  const freq = Math.max(1, dynamicWater.adjustedDays);
  for (let offset = 0; offset <= totalDays; offset += freq) {
    const taskDate = addDays(baseDate, offset);
    tasks.push({
      id: `task-riego-${crop.id}-${offset}`,
      cropId: crop.id,
      cropName: crop.name,
      type: 'Riego',
      dueDate: taskDate,
      completed: offset === 0 // El riego inicial el día de siembra se marca o queda inmediato
    });
  }

  // 2. Tarea de Abonado orgánico / nutrición (cada 14-20 días)
  const abonadoInterval = 18;
  for (let offset = abonadoInterval; offset < totalDays; offset += abonadoInterval) {
    const taskDate = addDays(baseDate, offset);
    tasks.push({
      id: `task-abonado-${crop.id}-${offset}`,
      cropId: crop.id,
      cropName: crop.name,
      type: 'Abonado',
      dueDate: taskDate,
      completed: false
    });
  }

  // 3. Tarea de Control preventivo de plagas (a los 10 días y a mitad de ciclo)
  if (totalDays >= 12) {
    tasks.push({
      id: `task-prev-${crop.id}-10`,
      cropId: crop.id,
      cropName: crop.name,
      type: 'Control preventivo',
      dueDate: addDays(baseDate, Math.min(10, Math.floor(totalDays * 0.25))),
      completed: false
    });
  }
  if (totalDays >= 28) {
    tasks.push({
      id: `task-prev-${crop.id}-mid`,
      cropId: crop.id,
      cropName: crop.name,
      type: 'Control preventivo',
      dueDate: addDays(baseDate, Math.floor(totalDays * 0.55)),
      completed: false
    });
  }

  // 4. Poda / aclareo (aprox al tercio o dos tercios del ciclo según la especie)
  if (totalDays >= 20) {
    tasks.push({
      id: `task-poda-${crop.id}-1`,
      cropId: crop.id,
      cropName: crop.name,
      type: 'Poda',
      dueDate: addDays(baseDate, Math.floor(totalDays * 0.4)),
      completed: false
    });
  }

  // 5. Cosecha final el día estimado de cosecha
  tasks.push({
    id: `task-cosecha-${crop.id}-end`,
    cropId: crop.id,
    cropName: crop.name,
    type: 'Cosecha',
    dueDate: addDays(baseDate, totalDays),
    completed: false
  });

  return tasks;
}


export function deleteLocation(locationName: string): { remainingLocations: GardenLocation[] } {
  const current = loadLocations();
  const remaining = current.filter((loc) => loc.name.toLowerCase() !== locationName.toLowerCase());
  saveLocations(remaining);
  return { remainingLocations: remaining };
}

/**
 * Recalcula y actualiza de manera reactiva las tareas del calendario para un cultivo
 * cuando cambia su etapa fenologica o se registran riegos.
 * - Mantiene el historial de tareas completadas.
 * - Remueve tareas pendientes desactualizadas de ese cultivo.
 * - Genera las nuevas tareas adaptadas a la etapa y al registro de riego real.
 */
export function recalculateTasksForCrop(
  crop: CropItem,
  existingTasks: GardenTask[]
): GardenTask[] {
  const now = new Date();

  const formatDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  };

  const addDays = (startDate: Date, days: number): string => {
    const d = new Date(startDate.getTime());
    d.setDate(d.getDate() + days);
    return formatDate(d);
  };

  // 1. Conservar tareas completadas y tareas de otros cultivos
  const tasksToKeep = existingTasks.filter(
    (t) => (t.cropId !== crop.id && t.cropName !== crop.name) || t.completed
  );

  // 2. Extraer ultima fecha de riego real registrada
  const irrigationLogs = (crop.log || [])
    .filter((l) => l.type === 'Riego' && l.date)
    .sort((a, b) => b.date.localeCompare(a.date));

  let lastWaterDate = now;
  if (irrigationLogs.length > 0 && irrigationLogs[0].date) {
    const parts = irrigationLogs[0].date.split('-').map(Number);
    lastWaterDate = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
  }

  // 3. Frecuencia dinamica de riego adaptada a sol y temporada
  const dynamicWater = calculateDynamicWaterFrequency(
    crop.waterFrequencyDays || 2,
    crop.sunHours || 6,
    now
  );
  let freq = Math.max(1, dynamicWater.adjustedDays);

  // Modulacion segun etapa fenologica
  if (crop.stage === 'Floración') {
    freq = Math.max(1, freq - 1); // Mayor demanda hidrica
  } else if (crop.stage === 'Semilla') {
    freq = 1; // Riego superficial suave diario
  } else if (crop.stage === 'Cosecha') {
    freq = Math.min(6, freq + 1); // Disminucion de riego previo a cosecha
  }

  const remainingDays = Math.max(1, crop.daysToHarvest || 7);
  const newTasks: GardenTask[] = [];

  // Calcular fecha para el proximo riego a partir del ultimo riego real registrado
  let nextWaterDate = new Date(lastWaterDate.getTime());
  nextWaterDate.setDate(nextWaterDate.getDate() + freq);

  const todayDateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (nextWaterDate < todayDateObj) {
    // Si la fecha cae antes de hoy, programar a partir de hoy o manana segun el dia
    nextWaterDate = new Date(todayDateObj.getTime());
    nextWaterDate.setDate(nextWaterDate.getDate() + 1);
  }

  const maxProjectionDays = Math.min(remainingDays, 40);
  for (let offset = 0; offset <= maxProjectionDays; offset += freq) {
    const d = new Date(nextWaterDate.getTime());
    d.setDate(d.getDate() + offset);
    const dateStr = formatDate(d);

    const alreadyCompleted = tasksToKeep.some(
      (t) => (t.cropId === crop.id || t.cropName === crop.name) && t.type === 'Riego' && t.dueDate === dateStr && t.completed
    );

    if (!alreadyCompleted) {
      newTasks.push({
        id: 'task-riego-' + crop.id + '-' + dateStr + '-' + (Date.now() + offset),
        cropId: crop.id,
        cropName: crop.name,
        type: 'Riego',
        dueDate: dateStr,
        completed: false
      });
    }
  }

  // Tareas contextuales segun la etapa fenologica actual del cultivo
  if (crop.stage === 'Plántula') {
    newTasks.push({
      id: 'task-prev-' + crop.id + '-plantula-' + Date.now(),
      cropId: crop.id,
      cropName: crop.name,
      type: 'Control preventivo',
      dueDate: addDays(todayDateObj, 4),
      completed: false
    });
  } else if (crop.stage === 'Crecimiento') {
    newTasks.push({
      id: 'task-abonado-' + crop.id + '-crec-' + Date.now(),
      cropId: crop.id,
      cropName: crop.name,
      type: 'Abonado',
      dueDate: addDays(todayDateObj, 3),
      completed: false
    });
    if (crop.name.toLowerCase().includes('tomate') || crop.name.toLowerCase().includes('albahaca')) {
      newTasks.push({
        id: 'task-poda-' + crop.id + '-tutor-' + Date.now(),
        cropId: crop.id,
        cropName: crop.name,
        type: 'Poda',
        dueDate: addDays(todayDateObj, 7),
        completed: false
      });
    }
  } else if (crop.stage === 'Floración') {
    newTasks.push({
      id: 'task-abonado-' + crop.id + '-flor-' + Date.now(),
      cropId: crop.id,
      cropName: crop.name,
      type: 'Abonado',
      dueDate: addDays(todayDateObj, 2),
      completed: false
    });
  } else if (crop.stage === 'Cosecha') {
    newTasks.push({
      id: 'task-cosecha-' + crop.id + '-cosecha-' + Date.now(),
      cropId: crop.id,
      cropName: crop.name,
      type: 'Cosecha',
      dueDate: addDays(todayDateObj, Math.min(2, remainingDays)),
      completed: false
    });
  }

  return [...tasksToKeep, ...newTasks];
}

