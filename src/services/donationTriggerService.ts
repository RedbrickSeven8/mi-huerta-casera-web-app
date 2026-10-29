const WATER_COUNT_KEY = 'huerta_casera_water_count';
const STAGE_COUNT_KEY = 'huerta_casera_stage_count';

export const WATER_THRESHOLD = 9;
export const STAGE_THRESHOLD = 9;

export function incrementWaterCount(): { count: number; shouldPrompt: boolean } {
  try {
    const raw = localStorage.getItem(WATER_COUNT_KEY);
    const prev = raw ? parseInt(raw, 10) || 0 : 0;
    const next = prev + 1;
    localStorage.setItem(WATER_COUNT_KEY, String(next));
    const shouldPrompt = next % WATER_THRESHOLD === 0;
    return { count: next, shouldPrompt };
  } catch {
    return { count: 1, shouldPrompt: false };
  }
}

export function incrementStageCount(): { count: number; shouldPrompt: boolean } {
  try {
    const raw = localStorage.getItem(STAGE_COUNT_KEY);
    const prev = raw ? parseInt(raw, 10) || 0 : 0;
    const next = prev + 1;
    localStorage.setItem(STAGE_COUNT_KEY, String(next));
    const shouldPrompt = next % STAGE_THRESHOLD === 0;
    return { count: next, shouldPrompt };
  } catch {
    return { count: 1, shouldPrompt: false };
  }
}

export function getWaterCount(): number {
  try {
    const raw = localStorage.getItem(WATER_COUNT_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function getStageCount(): number {
  try {
    const raw = localStorage.getItem(STAGE_COUNT_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}
