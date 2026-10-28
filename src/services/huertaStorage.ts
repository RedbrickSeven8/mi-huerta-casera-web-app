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
      localStorage.setItem(key, JSON.stringify(DEFAULT_LOCATIONS));
      return DEFAULT_LOCATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_LOCATIONS;
  } catch {
    return DEFAULT_LOCATIONS;
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
