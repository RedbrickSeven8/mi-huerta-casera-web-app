import type { CropItem, GardenTask } from '../types/huerta';
import { INITIAL_CROPS, INITIAL_TASKS } from '../data/initialCrops';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getUser } from './authService';

const CROPS_KEY_PREFIX = 'mi_huerta_casera_crops_v2_';
const TASKS_KEY_PREFIX = 'mi_huerta_casera_tasks_v2_';

function getStorageKey(prefix: string): string {
  const user = getUser();
  const userId = user ? user.id : 'guest';
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
    
    // Sync with Supabase if user is logged in
    const user = getUser();
    if (user && isSupabaseConfigured && supabase) {
      supabase
        .from('user_gardens')
        .upsert({
          user_id: user.id,
          user_email: user.email,
          crops: crops,
          updated_at: new Date().toISOString()
        })
        .then(({ error }) => {
          if (error) console.warn('Error al sincronizar cultivos con Supabase:', error.message);
        });
    }
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

    // Sync with Supabase if user is logged in
    const user = getUser();
    if (user && isSupabaseConfigured && supabase) {
      supabase
        .from('user_tasks')
        .upsert({
          user_id: user.id,
          user_email: user.email,
          tasks: tasks,
          updated_at: new Date().toISOString()
        })
        .then(({ error }) => {
          if (error) console.warn('Error al sincronizar tareas con Supabase:', error.message);
        });
    }
  } catch {
    // ignore
  }
}

export async function fetchRemoteGardenData(): Promise<{ crops: CropItem[] | null; tasks: GardenTask[] | null }> {
  const user = getUser();
  if (!user || !isSupabaseConfigured || !supabase) {
    return { crops: null, tasks: null };
  }

  try {
    const [cropsRes, tasksRes] = await Promise.all([
      supabase.from('user_gardens').select('crops').eq('user_id', user.id).single(),
      supabase.from('user_tasks').select('tasks').eq('user_id', user.id).single()
    ]);

    const crops = cropsRes.data?.crops as CropItem[] | undefined;
    const tasks = tasksRes.data?.tasks as GardenTask[] | undefined;

    return {
      crops: crops || null,
      tasks: tasks || null
    };
  } catch {
    return { crops: null, tasks: null };
  }
}
