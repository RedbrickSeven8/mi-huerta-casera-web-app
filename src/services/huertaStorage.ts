import { calculateDynamicWaterFrequency, inferCropCategory } from '../data/cropsDatabase';
import type { CropItem, GardenTask, GardenLocation, CropLogEntry } from '../types/huerta';
import { INITIAL_CROPS, INITIAL_TASKS } from '../data/initialCrops';
import { getUser } from './authService';
import { isSupabaseConfigured } from './supabaseClient';
import {
  fetchSupabaseLocations,
  fetchSupabaseCrops,
  fetchSupabaseTasks,
  insertSupabaseLocation,
  deleteSupabaseLocation,
  insertSupabaseCrop,
  updateSupabaseCrop,
  deleteSupabaseCrop,
  insertSupabaseCropLog,
  deleteSupabaseCropLog,
  insertSupabaseTask,
  updateSupabaseTaskStatus,
  deleteSupabaseTask,
  subscribeToGardenRealtime,
  syncUserProfile,
  type RealtimeChangeCallback
} from './supabaseGardenService';
import { pushGardenDataToCloud, fetchRemoteGardenData, markLocalMutation } from './cloudSyncService';

const CROPS_KEY_PREFIX = 'mi_huerta_casera_crops_v3_';
const TASKS_KEY_PREFIX = 'mi_huerta_casera_tasks_v3_';
const UPDATED_AT_PREFIX = 'mi_huerta_casera_updated_at_';
const LOCATIONS_KEY_PREFIX = 'mi_huerta_casera_locations_v3_';

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

// ---------------------------------------------------------------------
// 1. CROPS STORAGE & SYNC
// ---------------------------------------------------------------------
export function loadCrops(): CropItem[] {
  try {
    const user = getUser();
    const key = getStorageKey(CROPS_KEY_PREFIX);
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Solo el modo demo carga datos de ejemplo; usuarios registrados y nuevos empiezan desde cero
      if (user?.provider === 'demo') {
        localStorage.setItem(key, JSON.stringify(INITIAL_CROPS));
        return INITIAL_CROPS;
      }
      localStorage.setItem(key, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw) as CropItem[];
    return parsed.map((c) => ({
      ...c,
      category: c.category || inferCropCategory(c.name)
    }));
  } catch {
    return [];
  }
}

export function saveCrops(crops: CropItem[]): void {
  try {
    markLocalMutation();
    const key = getStorageKey(CROPS_KEY_PREFIX);
    localStorage.setItem(key, JSON.stringify(crops));
    setLocalUpdatedAt();

    // Fallback sync with GitHub cloud data if configured
    const currentTasks = loadTasks();
    pushGardenDataToCloud(crops, currentTasks);
  } catch {
    // ignore
  }
}

// Operaciones atómicas Supabase para Cultivos
export async function persistNewCrop(crop: CropItem, locationId?: string | null): Promise<void> {
  const user = getUser();
  if (user && isSupabaseConfigured) {
    await insertSupabaseCrop(user.id, crop, locationId);
  }
}

export async function persistCropUpdate(
  cropId: string,
  updates: Partial<{
    stage: CropItem['stage'];
    lastWatered: string;
    daysToHarvest: number;
    notes: string;
    location_id: string | null;
  }>
): Promise<void> {
  const user = getUser();
  if (user && isSupabaseConfigured) {
    await updateSupabaseCrop(cropId, updates);
  }
}

export async function persistCropDelete(cropId: string): Promise<void> {
  const user = getUser();
  if (user && isSupabaseConfigured) {
    await deleteSupabaseCrop(cropId);
  }
}

// Operaciones atómicas Supabase para Bitácora (crop_logs)
export async function persistNewCropLog(cropId: string, logEntry: CropLogEntry): Promise<void> {
  const user = getUser();
  if (user && isSupabaseConfigured) {
    await insertSupabaseCropLog(user.id, cropId, logEntry);
  }
}

export async function persistDeleteCropLog(logId: string): Promise<void> {
  const user = getUser();
  if (user && isSupabaseConfigured) {
    await deleteSupabaseCropLog(logId);
  }
}

// ---------------------------------------------------------------------
// 2. TASKS STORAGE & SYNC
// ---------------------------------------------------------------------
export function loadTasks(): GardenTask[] {
  try {
    const user = getUser();
    const key = getStorageKey(TASKS_KEY_PREFIX);
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Solo el modo demo carga tareas de ejemplo iniciales
      if (user?.provider === 'demo') {
        localStorage.setItem(key, JSON.stringify(INITIAL_TASKS));
        return INITIAL_TASKS;
      }
      localStorage.setItem(key, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: GardenTask[]): void {
  try {
    markLocalMutation();
    const key = getStorageKey(TASKS_KEY_PREFIX);
    localStorage.setItem(key, JSON.stringify(tasks));
    setLocalUpdatedAt();

    // Fallback sync with GitHub cloud data if configured
    const currentCrops = loadCrops();
    pushGardenDataToCloud(currentCrops, tasks);
  } catch {
    // ignore
  }
}

// Operaciones atómicas Supabase para Tareas
export async function persistNewTask(task: GardenTask): Promise<void> {
  const user = getUser();
  if (user && isSupabaseConfigured) {
    await insertSupabaseTask(user.id, task);
  }
}

export async function persistTaskStatus(taskId: string, completed: boolean, completedAt?: string): Promise<void> {
  const user = getUser();
  if (user && isSupabaseConfigured) {
    await updateSupabaseTaskStatus(taskId, completed, completedAt);
  }
}

export async function persistDeleteTask(taskId: string): Promise<void> {
  const user = getUser();
  if (user && isSupabaseConfigured) {
    await deleteSupabaseTask(taskId);
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

// ---------------------------------------------------------------------
// 3. LOCATIONS STORAGE & SYNC
// ---------------------------------------------------------------------
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

  // Operación atómica Supabase
  const user = getUser();
  if (user && isSupabaseConfigured) {
    insertSupabaseLocation(user.id, newLoc);
  }

  return newLoc;
}

export function deleteLocation(locationName: string): {
  deletedLocation: GardenLocation | null;
  remainingLocations: GardenLocation[];
} {
  const current = loadLocations();
  const target = current.find((l) => l.name.toLowerCase() === locationName.toLowerCase()) || null;
  const remaining = current.filter((l) => l.name.toLowerCase() !== locationName.toLowerCase());
  saveLocations(remaining);

  // Operación atómica Supabase
  if (target && isSupabaseConfigured) {
    deleteSupabaseLocation(target.id);
  }

  return {
    deletedLocation: target,
    remainingLocations: remaining
  };
}

// ---------------------------------------------------------------------
// 4. SUPABASE FULL DATA SYNC & REALTIME SUBSCRIPTION
// ---------------------------------------------------------------------
export async function syncAllWithSupabase(userId: string, email: string): Promise<{
  locations: GardenLocation[] | null;
  crops: CropItem[] | null;
  tasks: GardenTask[] | null;
}> {
  if (!isSupabaseConfigured) {
    return { locations: null, crops: null, tasks: null };
  }

  // 1. Asegurar registro en profiles
  await syncUserProfile(userId, email);

  // 2. Cargar datos relacionales
  const remoteLocs = await fetchSupabaseLocations(userId);
  const remoteCrops = await fetchSupabaseCrops(userId, remoteLocs);
  const remoteTasks = await fetchSupabaseTasks(userId);

  return {
    locations: remoteLocs.length > 0 ? remoteLocs : null,
    crops: remoteCrops.length > 0 ? remoteCrops : null,
    tasks: remoteTasks.length > 0 ? remoteTasks : null
  };
}

export function subscribeToSupabaseGarden(userId: string, onEvent: RealtimeChangeCallback): () => void {
  return subscribeToGardenRealtime(userId, onEvent);
}

export { fetchRemoteGardenData };

// ---------------------------------------------------------------------
// 5. AGRONOMIC TASK ENGINE
// ---------------------------------------------------------------------
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

  const addDays = (d: Date, days: number): string => {
    const copy = new Date(d.getTime());
    copy.setDate(copy.getDate() + days);
    return formatDate(copy);
  };

  // 1. Tareas de Riego períodicas según frecuencia y demanda
  const waterInterval = Math.max(1, crop.waterFrequencyDays || 2);
  for (let offset = waterInterval; offset <= Math.min(totalDays, 40); offset += waterInterval) {
    tasks.push({
      id: 'task-riego-' + crop.id + '-' + offset + '-' + Date.now(),
      cropId: crop.id,
      cropName: crop.name,
      type: 'Riego',
      dueDate: addDays(baseDate, offset),
      completed: false
    });
  }

  // 2. Abonado orgánico o biofertilizante
  const firstFertilize = Math.min(Math.floor(totalDays * 0.25), 14);
  tasks.push({
    id: 'task-abono-' + crop.id + '-1-' + Date.now(),
    cropId: crop.id,
    cropName: crop.name,
    type: 'Abonado',
    dueDate: addDays(baseDate, firstFertilize),
    completed: false
  });

  if (totalDays > 45) {
    const secondFertilize = Math.floor(totalDays * 0.6);
    tasks.push({
      id: 'task-abono-' + crop.id + '-2-' + Date.now(),
      cropId: crop.id,
      cropName: crop.name,
      type: 'Abonado',
      dueDate: addDays(baseDate, secondFertilize),
      completed: false
    });
  }

  // 3. Control preventivo de plagas o monitoreo
  tasks.push({
    id: 'task-control-' + crop.id + '-1-' + Date.now(),
    cropId: crop.id,
    cropName: crop.name,
    type: 'Control preventivo',
    dueDate: addDays(baseDate, Math.min(10, Math.floor(totalDays * 0.2))),
    completed: false
  });

  // 4. Poda o tutorado si corresponde
  const lowerName = crop.name.toLowerCase();
  if (lowerName.includes('tomate') || lowerName.includes('albahaca') || lowerName.includes('fresa')) {
    tasks.push({
      id: 'task-poda-' + crop.id + '-1-' + Date.now(),
      cropId: crop.id,
      cropName: crop.name,
      type: 'Poda',
      dueDate: addDays(baseDate, Math.floor(totalDays * 0.4)),
      completed: false
    });
  }

  // 5. Cosecha final proyectada
  tasks.push({
    id: 'task-cosecha-' + crop.id + '-' + Date.now(),
    cropId: crop.id,
    cropName: crop.name,
    type: 'Cosecha',
    dueDate: addDays(baseDate, totalDays),
    completed: false
  });

  return tasks;
}

/**
 * Recalcula dinámicamente las tareas pendientes cuando cambia el estado fenológico o el último riego
 */
export function recalculateTasksForCrop(crop: CropItem, existingTasks: GardenTask[]): GardenTask[] {
  const now = new Date();

  const formatDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const addDays = (d: Date, days: number): string => {
    const copy = new Date(d.getTime());
    copy.setDate(copy.getDate() + days);
    return formatDate(copy);
  };

  // 1. Conservar tareas completadas y tareas de otros cultivos
  const tasksToKeep = existingTasks.filter(
    (t) => (t.cropId !== crop.id && t.cropName !== crop.name) || t.completed
  );

  // 2. Extraer última fecha de riego real registrada
  const irrigationLogs = (crop.log || [])
    .filter((l) => l.type === 'Riego' && l.date)
    .sort((a, b) => b.date.localeCompare(a.date));

  let lastWaterDate = now;
  if (irrigationLogs.length > 0 && irrigationLogs[0].date) {
    const parts = irrigationLogs[0].date.split('-').map(Number);
    lastWaterDate = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
  }

  // 3. Frecuencia dinámica de riego adaptada a sol y temporada
  const dynamicWater = calculateDynamicWaterFrequency(
    crop.waterFrequencyDays || 2,
    crop.sunHours || 6,
    now
  );
  let freq = Math.max(1, dynamicWater.adjustedDays);

  // Modulación según etapa fenológica
  if (crop.stage === 'Floración') {
    freq = Math.max(1, freq - 1);
  } else if (crop.stage === 'Semilla') {
    freq = 1;
  } else if (crop.stage === 'Cosecha') {
    freq = Math.min(6, freq + 1);
  }

  const remainingDays = Math.max(1, crop.daysToHarvest || 7);
  const newTasks: GardenTask[] = [];

  // Calcular fecha para el próximo riego
  let nextWaterDate = new Date(lastWaterDate.getTime());
  nextWaterDate.setDate(nextWaterDate.getDate() + freq);

  const todayDateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (nextWaterDate < todayDateObj) {
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

  // Tareas contextuales según etapa fenológica actual
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
