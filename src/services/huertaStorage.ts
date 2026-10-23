import type { CropItem, GardenTask } from '../types/huerta';
import { INITIAL_CROPS, INITIAL_TASKS } from '../data/initialCrops';
import { getUser } from './authService';
import { pushGardenDataToCloud, fetchRemoteGardenData } from './cloudSyncService';

const CROPS_KEY_PREFIX = 'mi_huerta_casera_crops_v3_';
const TASKS_KEY_PREFIX = 'mi_huerta_casera_tasks_v3_';

export function getStorageKey(prefix: string): string {
  const user = getUser();
  const userId = user ? (user.email || user.id) : 'guest';
  return `${prefix}${userId}`;
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
    const key = getStorageKey(CROPS_KEY_PREFIX);
    localStorage.setItem(key, JSON.stringify(crops));
    
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
    const key = getStorageKey(TASKS_KEY_PREFIX);
    localStorage.setItem(key, JSON.stringify(tasks));

    // Auto sync with cloud
    const currentCrops = loadCrops();
    pushGardenDataToCloud(currentCrops, tasks);
  } catch {
    // ignore
  }
}

export function saveBothToCloud(crops: CropItem[], tasks: GardenTask[]): void {
  try {
    const cKey = getStorageKey(CROPS_KEY_PREFIX);
    const tKey = getStorageKey(TASKS_KEY_PREFIX);
    localStorage.setItem(cKey, JSON.stringify(crops));
    localStorage.setItem(tKey, JSON.stringify(tasks));
    pushGardenDataToCloud(crops, tasks);
  } catch {
    // ignore
  }
}

export { fetchRemoteGardenData };
