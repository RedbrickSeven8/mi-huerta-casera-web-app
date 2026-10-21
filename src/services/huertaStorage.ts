import type { CropItem, GardenTask } from '../types/huerta';
import { INITIAL_CROPS, INITIAL_TASKS } from '../data/initialCrops';

const CROPS_KEY = 'mi_huerta_casera_crops_v1';
const TASKS_KEY = 'mi_huerta_casera_tasks_v1';

export function loadCrops(): CropItem[] {
  try {
    const raw = localStorage.getItem(CROPS_KEY);
    if (!raw) {
      localStorage.setItem(CROPS_KEY, JSON.stringify(INITIAL_CROPS));
      return INITIAL_CROPS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CROPS;
  }
}

export function saveCrops(crops: CropItem[]): void {
  try {
    localStorage.setItem(CROPS_KEY, JSON.stringify(crops));
  } catch {
    // ignore
  }
}

export function loadTasks(): GardenTask[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) {
      localStorage.setItem(TASKS_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: GardenTask[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // ignore
  }
}
