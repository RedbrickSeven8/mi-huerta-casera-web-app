import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { CropItem, CropLogEntry, GardenTask, GardenLocation, PlantCategory } from '../types/huerta';

export interface SupabaseProfile {
  id: string;
  email: string;
  created_at?: string;
}

export interface SupabaseLocation {
  id: string;
  user_id: string;
  name: string;
  type: string;
  sun_exposure: string;
  created_at?: string;
}

export interface SupabaseCrop {
  id: string;
  user_id: string;
  location_id: string | null;
  name: string;
  variety: string;
  category?: string;
  stage: string;
  planted_date: string;
  days_to_harvest: number;
  recommended_moisture_percent?: number;
  sun_hours?: number;
  water_frequency_days?: number;
  last_watered?: string;
  notes?: string;
  image_url?: string;
  image_alt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseCropLog {
  id: string;
  user_id: string;
  crop_id: string;
  type: string;
  title: string;
  notes?: string;
  entry_date: string;
  entry_time?: string;
  task_id?: string | null;
  created_at?: string;
}

export interface SupabaseTask {
  id: string;
  user_id: string;
  crop_id: string | null;
  crop_name: string;
  type: string;
  due_date: string;
  completed: boolean;
  completed_at?: string | null;
  created_at?: string;
}

// ----------------------------------------------------
// 1. PROFILES
// ----------------------------------------------------
export async function syncUserProfile(userId: string, email: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    await supabase.from('profiles').upsert({
      id: userId,
      email
    }, { onConflict: 'id' });
  } catch (err) {
    console.warn('Error al sincronizar perfil en Supabase:', err);
  }
}

// ----------------------------------------------------
// 2. LOCATIONS (Bancales y macetas)
// ----------------------------------------------------
export async function fetchSupabaseLocations(userId: string): Promise<GardenLocation[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error || !data) {
    console.warn('Error al consultar locations en Supabase:', error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type as GardenLocation['type'],
    sunExposure: row.sun_exposure as GardenLocation['sunExposure'],
    createdAt: row.created_at || new Date().toISOString()
  }));
}

export async function insertSupabaseLocation(userId: string, loc: GardenLocation): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  const { error } = await supabase.from('locations').insert({
    id: loc.id,
    user_id: userId,
    name: loc.name,
    type: loc.type || 'Bancal elevado',
    sun_exposure: loc.sunExposure || 'Pleno sol'
  });
  return !error;
}

export async function updateSupabaseLocation(locId: string, updates: Partial<GardenLocation>): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.type !== undefined) payload.type = updates.type;
  if (updates.sunExposure !== undefined) payload.sun_exposure = updates.sunExposure;

  const { error } = await supabase
    .from('locations')
    .update(payload)
    .eq('id', locId);
  return !error;
}

export async function deleteSupabaseLocation(locId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  const { error } = await supabase.from('locations').delete().eq('id', locId);
  return !error;
}

// ----------------------------------------------------
// 3. CROPS & BITÁCORA (crops & crop_logs)
// ----------------------------------------------------
export async function fetchSupabaseCrops(userId: string, locations: GardenLocation[]): Promise<CropItem[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  
  // 1. Obtener cultivos
  const { data: cropsData, error: cropsError } = await supabase
    .from('crops')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (cropsError || !cropsData) {
    console.warn('Error al consultar crops en Supabase:', cropsError);
    return [];
  }

  // 2. Obtener bitácora
  const { data: logsData } = await supabase
    .from('crop_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const logsByCropId: Record<string, CropLogEntry[]> = {};
  if (logsData) {
    logsData.forEach((row) => {
      if (!logsByCropId[row.crop_id]) {
        logsByCropId[row.crop_id] = [];
      }
      logsByCropId[row.crop_id].push({
        id: row.id,
        type: row.type as CropLogEntry['type'],
        title: row.title,
        date: row.entry_date,
        time: row.entry_time || undefined,
        notes: row.notes || undefined,
        taskId: row.task_id || undefined
      });
    });
  }

  const locationMap = new Map<string, string>();
  locations.forEach((loc) => locationMap.set(loc.id, loc.name));

  return cropsData.map((row) => {
    // Si location_id está mapeado, usar el nombre del bancal correspondiente
    let bedName = row.location_id ? (locationMap.get(row.location_id) || row.location_id) : 'Huerta';
    return {
      id: row.id,
      name: row.name,
      variety: row.variety || '',
      category: (row.category as PlantCategory) || (['pothos', 'monstera', 'sansevieria', 'espatifilo', 'calathea', 'suculenta', 'interior'].some(k => row.name.toLowerCase().includes(k)) ? 'Interior' : 'Exterior'),
      bed: bedName,
      stage: row.stage as CropItem['stage'],
      plantedDate: row.planted_date,
      daysToHarvest: row.days_to_harvest,
      recommendedMoisturePercent: row.recommended_moisture_percent ?? 70,
      sunHours: Number(row.sun_hours ?? 6),
      waterFrequencyDays: row.water_frequency_days ?? 2,
      lastWatered: row.last_watered || 'Pendiente',
      notes: row.notes || '',
      imageUrl: row.image_url || '/crops/tomate.svg',
      imageAlt: row.image_alt || row.name,
      log: logsByCropId[row.id] || []
    };
  });
}

export async function insertSupabaseCrop(userId: string, crop: CropItem, locationId?: string | null): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  const { error } = await supabase.from('crops').insert({
    id: crop.id,
    user_id: userId,
    location_id: locationId || null,
    name: crop.name,
    variety: crop.variety || '',
    stage: crop.stage,
    planted_date: crop.plantedDate,
    days_to_harvest: crop.daysToHarvest,
    recommended_moisture_percent: crop.recommendedMoisturePercent,
    sun_hours: crop.sunHours,
    water_frequency_days: crop.waterFrequencyDays,
    last_watered: crop.lastWatered,
    notes: crop.notes || '',
    image_url: crop.imageUrl,
    image_alt: crop.imageAlt
  });

  if (error) {
    console.warn('Error al insertar crop en Supabase:', error);
    return false;
  }

  // Insertar registros de bitácora inicial si existen
  if (crop.log && crop.log.length > 0) {
    const logsPayload = crop.log.map((l) => ({
      id: l.id,
      user_id: userId,
      crop_id: crop.id,
      type: l.type,
      title: l.title,
      notes: l.notes || '',
      entry_date: l.date,
      entry_time: l.time || '',
      task_id: l.taskId || null
    }));
    await supabase.from('crop_logs').insert(logsPayload);
  }

  return true;
}

export async function updateSupabaseCrop(
  cropId: string,
  updates: Partial<{
    stage: CropItem['stage'];
    lastWatered: string;
    daysToHarvest: number;
    notes: string;
    location_id: string | null;
  }>
): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };
  if (updates.stage !== undefined) payload.stage = updates.stage;
  if (updates.lastWatered !== undefined) payload.last_watered = updates.lastWatered;
  if (updates.daysToHarvest !== undefined) payload.days_to_harvest = updates.daysToHarvest;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  if (updates.location_id !== undefined) payload.location_id = updates.location_id;

  const { error } = await supabase
    .from('crops')
    .update(payload)
    .eq('id', cropId);
  return !error;
}

export async function deleteSupabaseCrop(cropId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  const { error } = await supabase.from('crops').delete().eq('id', cropId);
  return !error;
}

// ----------------------------------------------------
// 4. CROP LOGS ATÓMICOS
// ----------------------------------------------------
export async function insertSupabaseCropLog(userId: string, cropId: string, logEntry: CropLogEntry): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  const { error } = await supabase.from('crop_logs').insert({
    id: logEntry.id,
    user_id: userId,
    crop_id: cropId,
    type: logEntry.type,
    title: logEntry.title,
    notes: logEntry.notes || '',
    entry_date: logEntry.date,
    entry_time: logEntry.time || '',
    task_id: logEntry.taskId || null
  });
  return !error;
}

export async function deleteSupabaseCropLog(logId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  const { error } = await supabase.from('crop_logs').delete().eq('id', logId);
  return !error;
}

// ----------------------------------------------------
// 5. TASKS (Calendario reactivo)
// ----------------------------------------------------
export async function fetchSupabaseTasks(userId: string): Promise<GardenTask[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });

  if (error || !data) {
    console.warn('Error al consultar tasks en Supabase:', error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    cropId: row.crop_id || 'general',
    cropName: row.crop_name,
    type: row.type as GardenTask['type'],
    dueDate: row.due_date,
    completed: row.completed,
    completedAt: row.completed_at || undefined
  }));
}

export async function insertSupabaseTask(userId: string, task: GardenTask): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  const { error } = await supabase.from('tasks').insert({
    id: task.id,
    user_id: userId,
    crop_id: task.cropId === 'general' ? null : task.cropId,
    crop_name: task.cropName,
    type: task.type,
    due_date: task.dueDate,
    completed: task.completed,
    completed_at: task.completedAt || null
  });
  return !error;
}

export async function updateSupabaseTaskStatus(taskId: string, completed: boolean, completedAt?: string | null): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  const { error } = await supabase
    .from('tasks')
    .update({
      completed,
      completed_at: completed ? (completedAt || new Date().toISOString()) : null
    })
    .eq('id', taskId);
  return !error;
}

export async function deleteSupabaseTask(taskId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  return !error;
}

// ----------------------------------------------------
// 6. REALTIME CHANNEL SUBSCRIPTION (CDC / WebSockets)
// ----------------------------------------------------
export type RealtimeChangeCallback = (payload: {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  newRecord: Record<string, unknown>;
  oldRecord: Record<string, unknown>;
}) => void;

export function subscribeToGardenRealtime(userId: string, onChange: RealtimeChangeCallback): () => void {
  if (!supabase || !isSupabaseConfigured) {
    return () => {};
  }

  const channel = supabase
    .channel(`garden-sync-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'crops',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        onChange({
          table: 'crops',
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          newRecord: (payload.new as Record<string, unknown>) || {},
          oldRecord: (payload.old as Record<string, unknown>) || {}
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'locations',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        onChange({
          table: 'locations',
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          newRecord: (payload.new as Record<string, unknown>) || {},
          oldRecord: (payload.old as Record<string, unknown>) || {}
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'crop_logs',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        onChange({
          table: 'crop_logs',
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          newRecord: (payload.new as Record<string, unknown>) || {},
          oldRecord: (payload.old as Record<string, unknown>) || {}
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        onChange({
          table: 'tasks',
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          newRecord: (payload.new as Record<string, unknown>) || {},
          oldRecord: (payload.old as Record<string, unknown>) || {}
        });
      }
    )
    .subscribe();

  return () => {
    if (supabase) {
      supabase.removeChannel(channel);
    }
  };
}
