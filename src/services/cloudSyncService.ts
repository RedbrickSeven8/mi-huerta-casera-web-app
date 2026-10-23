import type { CropItem, GardenTask } from '../types/huerta';
import { getUser } from './authService';

const GITHUB_REPO = 'RedbrickSeven8/mi-huerta-casera-web-app';
const FILE_PATH = 'data/cloud_sync.json';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_SYNC_TOKEN || '';

export interface UserCloudData {
  crops: CropItem[];
  tasks: GardenTask[];
  updated_at: string;
}

interface CloudSyncPayload {
  users: Record<string, UserCloudData>;
}

export const isCloudSyncConfigured = Boolean(GITHUB_TOKEN);

// Timestamp tracker to avoid replacing fresher local data with older cloud data
let lastLocalMutationTime = 0;
let isPushing = false;
let pendingCrops: CropItem[] | null = null;
let pendingTasks: GardenTask[] | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function markLocalMutation(): void {
  lastLocalMutationTime = Date.now();
}

export function isLocalMutatingRecently(): boolean {
  return (Date.now() - lastLocalMutationTime < 4500) || isPushing;
}

/**
 * Fetch remote garden data for the currently logged in user
 */
export async function fetchRemoteGardenData(): Promise<{
  crops: CropItem[] | null;
  tasks: GardenTask[] | null;
  updated_at?: string;
}> {
  const user = getUser();
  if (!user || !isCloudSyncConfigured) {
    return { crops: null, tasks: null };
  }

  // Guard against overwriting local changes while user is active or push in-flight
  if (isLocalMutatingRecently()) {
    return { crops: null, tasks: null };
  }

  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=main&t=${Date.now()}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      return { crops: null, tasks: null };
    }

    const data = await res.json();
    const rawContent = atob(data.content.replace(/\s/g, ''));
    const parsed: CloudSyncPayload = JSON.parse(decodeURIComponent(escape(rawContent)));

    const userKey = user.email || user.id;
    const userData = parsed.users ? parsed.users[userKey] : null;

    if (userData) {
      // Re-verify that user didn't perform an action while fetch was in flight
      if (isLocalMutatingRecently()) {
        return { crops: null, tasks: null };
      }

      return {
        crops: userData.crops || null,
        tasks: userData.tasks || null,
        updated_at: userData.updated_at
      };
    }

    return { crops: null, tasks: null };
  } catch (err) {
    console.warn('Error al consultar nube:', err);
    return { crops: null, tasks: null };
  }
}

async function executePush(): Promise<void> {
  if (isPushing) {
    return;
  }

  const user = getUser();
  if (!user || !isCloudSyncConfigured || !pendingCrops || !pendingTasks) {
    return;
  }

  isPushing = true;
  const cropsToSend = pendingCrops;
  const tasksToSend = pendingTasks;
  const userKey = user.email || user.id;

  // Retry up to 3 times in case of SHA concurrency conflict
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=main&t=${Date.now()}`;

      const getRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json'
        },
        cache: 'no-store'
      });

      let sha = '';
      let payload: CloudSyncPayload = { users: {} };

      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
        try {
          const decoded = atob(fileData.content.replace(/\s/g, ''));
          payload = JSON.parse(decodeURIComponent(escape(decoded)));
        } catch {
          payload = { users: {} };
        }
      }

      if (!payload.users) {
        payload.users = {};
      }

      payload.users[userKey] = {
        crops: cropsToSend,
        tasks: tasksToSend,
        updated_at: new Date().toISOString()
      };

      const jsonStr = JSON.stringify(payload, null, 2);
      const b64Content = btoa(unescape(encodeURIComponent(jsonStr)));

      const putRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `sync: update garden for ${userKey}`,
          content: b64Content,
          sha: sha || undefined
        })
      });

      if (putRes.ok) {
        break;
      } else if (putRes.status === 409) {
        await new Promise((r) => setTimeout(r, 250));
        continue;
      } else {
        console.warn('Error en respuesta de sincronización nube:', putRes.status);
        break;
      }
    } catch (err) {
      console.warn('Error al enviar sincronización a la nube:', err);
      break;
    }
  }

  isPushing = false;

  // If another update occurred while pushing was running
  if (pendingCrops !== cropsToSend || pendingTasks !== tasksToSend) {
    executePush();
  }
}

/**
 * Queue debounced sync with the cloud database for crops & tasks
 */
export function pushGardenDataToCloud(crops: CropItem[], tasks: GardenTask[]): void {
  const user = getUser();
  if (!user || !isCloudSyncConfigured) return;

  markLocalMutation();
  pendingCrops = crops;
  pendingTasks = tasks;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Debounce for 350ms to consolidate multi-step updates
  debounceTimer = setTimeout(() => {
    executePush();
  }, 350);
}
