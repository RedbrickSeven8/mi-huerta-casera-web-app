import type { CropItem, GardenTask } from '../types/huerta';
import { getUser } from './authService';

const GITHUB_REPO = 'RedbrickSeven8/mi-huerta-casera-web-app';
const FILE_PATH = 'data/cloud_sync.json';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_SYNC_TOKEN || '';

interface UserCloudData {
  crops: CropItem[];
  tasks: GardenTask[];
  updated_at: string;
}

interface CloudSyncPayload {
  users: Record<string, UserCloudData>;
}

export const isCloudSyncConfigured = Boolean(GITHUB_TOKEN);

/**
 * Fetch remote garden data for the currently logged in user
 */
export async function fetchRemoteGardenData(): Promise<{ crops: CropItem[] | null; tasks: GardenTask[] | null }> {
  const user = getUser();
  if (!user || !isCloudSyncConfigured) {
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
      return {
        crops: userData.crops || null,
        tasks: userData.tasks || null
      };
    }

    return { crops: null, tasks: null };
  } catch (err) {
    console.warn('Error fetching remote data from cloud:', err);
    return { crops: null, tasks: null };
  }
}

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Sync both crops and tasks with the cloud database for the logged-in user
 */
export function pushGardenDataToCloud(crops: CropItem[], tasks: GardenTask[]): void {
  const user = getUser();
  if (!user || !isCloudSyncConfigured) return;

  // Debounce consecutive calls (e.g. rapid edits or toggles)
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(async () => {
    try {
      const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
      
      // 1. Get current SHA and content
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

      const userKey = user.email || user.id;
      payload.users[userKey] = {
        crops,
        tasks,
        updated_at: new Date().toISOString()
      };

      const jsonStr = JSON.stringify(payload, null, 2);
      const b64Content = btoa(unescape(encodeURIComponent(jsonStr)));

      await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `sync: update garden for ${user.email || user.id}`,
          content: b64Content,
          sha: sha || undefined
        })
      });
    } catch (err) {
      console.warn('Error syncing data with cloud:', err);
    }
  }, 400);
}
