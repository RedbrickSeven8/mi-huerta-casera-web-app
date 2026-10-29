import { useState, useEffect, useRef } from 'react';
import type { CropItem, CropStage, CropLogEntry, GardenTask, PageRoute, GardenLocation } from './types/huerta';
import {
  loadCrops,
  saveCrops,
  loadTasks,
  saveTasks,
  saveBothToCloud,
  generateTasksForCrop,
  recalculateTasksForCrop,
  loadLocations,
  deleteLocation,
  syncAllWithSupabase,
  subscribeToSupabaseGarden,
  persistNewCrop,
  persistCropUpdate,
  persistCropDelete,
  persistNewCropLog,
  persistDeleteCropLog,
  persistNewTask,
  persistTaskStatus,
  persistDeleteTask,
  fetchRemoteGardenData
} from './services/huertaStorage';
import { isSupabaseConfigured } from './services/supabaseClient';
import { updatePageTitle } from './services/seoManager';
import { getDaysToHarvestForCrop } from './data/cropsDatabase';
import { getUser, type UserProfile } from './services/authService';
import { Header } from './components/Header';
import { Breadcrumbs } from './components/Breadcrumbs';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { CalendarPage } from './pages/CalendarPage';
import { RegisterPage } from './pages/RegisterPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { AdminDonationsPage } from './pages/AdminDonationsPage';
import { fetchUserDonorStatus } from './services/donationService';
import { PrivacyPolicyPage, TermsConditionsPage, CookiePolicyPage } from './pages/LegalPages';
import { NotFoundPage } from './pages/NotFoundPage';

const STAGE_ORDER: CropStage[] = ['Semilla', 'Plántula', 'Crecimiento', 'Floración', 'Cosecha'];

const VALID_ROUTES: PageRoute[] = [
  'inicio',
  'dashboard',
  'calendario',
  'registro',
  'agradecimiento',
  'auditoria',
  'privacidad',
  'terminos',
  'cookies',
  'admin-donaciones',
  '404'
];

function resolveInitialRoute(): PageRoute {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!path) return 'inicio';
  if (VALID_ROUTES.includes(path as PageRoute)) {
    return path as PageRoute;
  }
  return '404';
}

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentTimeString = () => {
  const d = new Date();
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

export function App() {
  const [currentRoute, setCurrentRoute] = useState<PageRoute>(resolveInitialRoute);
  const [user, setUser] = useState<UserProfile | null>(() => getUser());
  const [crops, setCrops] = useState<CropItem[]>(() => loadCrops());
  const [tasks, setTasks] = useState<GardenTask[]>(() => loadTasks());
  const [locations, setLocations] = useState<GardenLocation[]>(() => loadLocations());

  const unsubscribeRealtimeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    updatePageTitle(currentRoute);
  }, [currentRoute]);

  useEffect(() => {
    if (user) {
      fetchUserDonorStatus(user.id, user.email);
    }
  }, [user]);

  // Manejador del canal de tiempo real de Supabase (WebSockets CDC)
  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      if (unsubscribeRealtimeRef.current) {
        unsubscribeRealtimeRef.current();
        unsubscribeRealtimeRef.current = null;
      }
      return;
    }

    const unsubscribe = subscribeToSupabaseGarden(user.id, () => {
      // Sincronización reactiva instantánea al recibir CDC
      syncAllWithSupabase(user.id, user.email).then((remote) => {
        if (remote.locations) setLocations(remote.locations);
        if (remote.crops) setCrops(remote.crops);
        if (remote.tasks) setTasks(remote.tasks);
      });
    });

    unsubscribeRealtimeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRealtimeRef.current) {
        unsubscribeRealtimeRef.current();
        unsubscribeRealtimeRef.current = null;
      }
    };
  }, [user]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(resolveInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);

    // Si Supabase no está configurado, fallback al sync secundario
    const checkRemoteSync = () => {
      const currentUser = getUser();
      if (!currentUser || isSupabaseConfigured) return;

      fetchRemoteGardenData().then(({ crops: remoteCrops, tasks: remoteTasks, updated_at: remoteUpdatedAt }) => {
        if (!remoteCrops && !remoteTasks) return;

        const userKey = currentUser.email || currentUser.id;
        const localUpdatedAt = localStorage.getItem('mi_huerta_casera_updated_at_' + userKey);

        if (remoteUpdatedAt && localUpdatedAt && new Date(localUpdatedAt) >= new Date(remoteUpdatedAt)) {
          return;
        }

        if (remoteCrops && remoteCrops.length > 0) {
          const userKeyStorage = 'mi_huerta_casera_crops_v3_' + userKey;
          const currentLocalStr = localStorage.getItem(userKeyStorage);
          const remoteStr = JSON.stringify(remoteCrops);
          if (currentLocalStr !== remoteStr) {
            setCrops(remoteCrops);
            localStorage.setItem(userKeyStorage, remoteStr);
          }
        }
        if (remoteTasks && remoteTasks.length > 0) {
          const taskKeyStorage = 'mi_huerta_casera_tasks_v3_' + userKey;
          const currentTasksStr = localStorage.getItem(taskKeyStorage);
          const remoteTasksStr = JSON.stringify(remoteTasks);
          if (currentTasksStr !== remoteTasksStr) {
            setTasks(remoteTasks);
            localStorage.setItem(taskKeyStorage, remoteTasksStr);
          }
        }

        if (remoteUpdatedAt) {
          localStorage.setItem('mi_huerta_casera_updated_at_' + userKey, remoteUpdatedAt);
        }
      });
    };

    if (!isSupabaseConfigured) {
      checkRemoteSync();
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          checkRemoteSync();
        }
      };
      window.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', checkRemoteSync);
      const pollInterval = setInterval(checkRemoteSync, 3500);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', checkRemoteSync);
        clearInterval(pollInterval);
      };
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Al cambiar estado de autenticación, hidratar datos desde Supabase o localStorage
  const handleAuthChange = (newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser) {
      if (isSupabaseConfigured) {
        syncAllWithSupabase(newUser.id, newUser.email).then((remote) => {
          if (remote.crops && remote.crops.length > 0) {
            setCrops(remote.crops);
          } else {
            const current = loadCrops();
            setCrops(current);
            current.forEach((crop) => persistNewCrop(crop));
          }

          if (remote.tasks && remote.tasks.length > 0) {
            setTasks(remote.tasks);
          } else {
            const currentT = loadTasks();
            setTasks(currentT);
            currentT.forEach((task) => persistNewTask(task));
          }

          if (remote.locations && remote.locations.length > 0) {
            setLocations(remote.locations);
          } else {
            setLocations(loadLocations());
          }
        });
      } else {
        const localCrops = loadCrops();
        const localTasks = loadTasks();
        setCrops(localCrops);
        setTasks(localTasks);
      }
    } else {
      setCrops(loadCrops());
      setTasks(loadTasks());
      setLocations(loadLocations());
    }
  };

  const handleNavigate = (route: PageRoute) => {
    setCurrentRoute(route);
    const targetUrl = route === 'inicio' ? '/' : `/${route}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWaterCrop = (cropId: string) => {
    const today = getTodayString();
    const nowTime = getCurrentTimeString();
    let updatedTargetCrop: CropItem | null = null;

    const updated = crops.map((crop) => {
      if (crop.id === cropId) {
        const newLogEntry: CropLogEntry = {
          id: 'log-' + Date.now(),
          type: 'Riego',
          title: 'Riego registrado',
          date: today,
          time: nowTime,
          notes: 'Riego manual registrado desde el panel.'
        };
        const existingLogs = crop.log || [];
        const nextCrop = {
          ...crop,
          lastWatered: `Hoy, ${nowTime}`,
          log: [newLogEntry, ...existingLogs]
        };
        updatedTargetCrop = nextCrop;

        // Persistir de forma atómica en Supabase
        persistCropUpdate(cropId, { lastWatered: nextCrop.lastWatered });
        persistNewCropLog(cropId, newLogEntry);

        return nextCrop;
      }
      return crop;
    });

    setCrops(updated);

    // Marcar como completada cualquier tarea de riego pendiente para hoy
    let updatedTasks = tasks.map((t) => {
      if (t.cropId === cropId && t.type === 'Riego' && !t.completed) {
        persistTaskStatus(t.id, true, new Date().toISOString());
        return { ...t, completed: true, completedAt: new Date().toISOString() };
      }
      return t;
    });

    if (updatedTargetCrop) {
      updatedTasks = recalculateTasksForCrop(updatedTargetCrop, updatedTasks);
    }

    setTasks(updatedTasks);
    saveBothToCloud(updated, updatedTasks);
  };

  const handleAdvanceStage = (cropId: string) => {
    const today = getTodayString();
    const nowTime = getCurrentTimeString();
    let updatedCropTarget: CropItem | null = null;

    const updated = crops.map((crop) => {
      if (crop.id === cropId) {
        const currentIndex = STAGE_ORDER.indexOf(crop.stage);
        const nextIndex = (currentIndex + 1) % STAGE_ORDER.length;
        const nextStage = STAGE_ORDER[nextIndex];

        const days = getDaysToHarvestForCrop(crop.name, crop.variety, nextStage);
        const newLogEntry: CropLogEntry = {
          id: 'log-stage-' + Date.now(),
          type: 'Cambio de etapa',
          title: `Cambio a ${nextStage}`,
          date: today,
          time: nowTime,
          notes: `Etapa fenológica avanzada a ${nextStage}. Días estimados a cosecha recalculados a ${days} d.`
        };
        const existingLogs = crop.log || [];
        const nextCrop = {
          ...crop,
          stage: nextStage,
          daysToHarvest: days,
          log: [newLogEntry, ...existingLogs]
        };
        updatedCropTarget = nextCrop;

        // Persistir de forma atómica en Supabase
        persistCropUpdate(cropId, { stage: nextStage, daysToHarvest: days });
        persistNewCropLog(cropId, newLogEntry);

        return nextCrop;
      }
      return crop;
    });

    setCrops(updated);

    let updatedTasks = tasks;
    if (updatedCropTarget) {
      updatedTasks = recalculateTasksForCrop(updatedCropTarget, tasks);
      setTasks(updatedTasks);
    }

    saveBothToCloud(updated, updatedTasks);
  };

  const handleDeleteCrop = (cropId: string) => {
    const targetCrop = crops.find((c) => c.id === cropId);
    const updatedCrops = crops.filter((c) => c.id !== cropId);
    const updatedTasks = tasks.filter(
      (t) => t.cropId !== cropId && (!targetCrop || t.cropName !== targetCrop.name)
    );

    setCrops(updatedCrops);
    setTasks(updatedTasks);

    // Persistir eliminación atómica en Supabase
    persistCropDelete(cropId);
    saveBothToCloud(updatedCrops, updatedTasks);
  };

  const handleDeleteLocation = (locationName: string) => {
    const { remainingLocations } = deleteLocation(locationName);
    setLocations(remainingLocations);

    const cropsInLocation = crops.filter((c) => c.bed.toLowerCase() === locationName.toLowerCase());
    const cropIdsToRemove = new Set(cropsInLocation.map((c) => c.id));
    const cropNamesToRemove = new Set(cropsInLocation.map((c) => c.name));

    const remainingCrops = crops.filter((c) => !cropIdsToRemove.has(c.id));
    const remainingTasks = tasks.filter((t) => !cropIdsToRemove.has(t.cropId) && !cropNamesToRemove.has(t.cropName));

    cropsInLocation.forEach((crop) => persistCropDelete(crop.id));

    setCrops(remainingCrops);
    setTasks(remainingTasks);
    saveBothToCloud(remainingCrops, remainingTasks);
  };

  const handleAddCrop = (newCrop: CropItem) => {
    const updatedCrops = [newCrop, ...crops];
    const newTasks = generateTasksForCrop(newCrop);
    const updatedTasks = [...newTasks, ...tasks];

    setCrops(updatedCrops);
    setTasks(updatedTasks);

    // Persistir de forma atómica en Supabase
    persistNewCrop(newCrop);
    newTasks.forEach((t) => persistNewTask(t));

    saveBothToCloud(updatedCrops, updatedTasks);
  };

  const handleAddLogEntry = (cropId: string, entry: Omit<CropLogEntry, 'id'>) => {
    const newEntry: CropLogEntry = {
      ...entry,
      id: 'log-' + Date.now()
    };

    let targetCropUpdated: CropItem | null = null;
    const updated = crops.map((crop) => {
      if (crop.id === cropId) {
        const existingLogs = crop.log || [];
        const nextCrop = {
          ...crop,
          lastWatered: newEntry.type === 'Riego' ? `Hoy, ${newEntry.time || '12:00'}` : crop.lastWatered,
          log: [newEntry, ...existingLogs]
        };
        targetCropUpdated = nextCrop;
        return nextCrop;
      }
      return crop;
    });

    setCrops(updated);

    // Persistir de forma atómica en Supabase
    persistNewCropLog(cropId, newEntry);
    if (newEntry.type === 'Riego' && targetCropUpdated) {
      persistCropUpdate(cropId, { lastWatered: (targetCropUpdated as CropItem).lastWatered });
    }

    let updatedTasks = tasks;
    if (targetCropUpdated && newEntry.type === 'Riego') {
      updatedTasks = recalculateTasksForCrop(targetCropUpdated, tasks);
      setTasks(updatedTasks);
    }

    saveBothToCloud(updated, updatedTasks);
  };

  const handleDeleteLogEntry = (cropId: string, logId: string) => {
    const updated = crops.map((crop) => {
      if (crop.id === cropId) {
        const existingLogs = crop.log || [];
        return {
          ...crop,
          log: existingLogs.filter((l) => l.id !== logId)
        };
      }
      return crop;
    });

    setCrops(updated);
    persistDeleteCropLog(logId);
    saveCrops(updated);
  };

  const handleToggleTask = (taskId: string) => {
    const today = getTodayString();
    const nowTime = getCurrentTimeString();

    let targetTask: GardenTask | null = null;
    let willBeCompleted = false;

    let updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        targetTask = task;
        willBeCompleted = !task.completed;
        const completedAt = willBeCompleted ? new Date().toISOString() : undefined;
        persistTaskStatus(taskId, willBeCompleted, completedAt);
        return {
          ...task,
          completed: willBeCompleted,
          completedAt
        };
      }
      return task;
    });

    if (!targetTask) return;

    setTasks(updatedTasks);

    let updatedCrops = crops;
    let targetCropUpdated: CropItem | null = null;
    if (willBeCompleted) {
      updatedCrops = crops.map((c) => {
        if (c.id === (targetTask as GardenTask).cropId || ((targetTask as GardenTask).cropId === 'general' && c.name === (targetTask as GardenTask).cropName)) {
          const logEntry: CropLogEntry = {
            id: 'log-task-' + Date.now(),
            type: (targetTask as GardenTask).type,
            title: `Labor: ${(targetTask as GardenTask).type}`,
            date: today,
            time: nowTime,
            notes: `Completada desde calendario.`,
            taskId: (targetTask as GardenTask).id
          };
          const existingLogs = c.log || [];
          const updatedCrop = {
            ...c,
            lastWatered: (targetTask as GardenTask).type === 'Riego' ? `Hoy, ${nowTime}` : c.lastWatered,
            log: [logEntry, ...existingLogs]
          };
          targetCropUpdated = updatedCrop;

          // Persistir en Supabase
          persistNewCropLog(c.id, logEntry);
          if ((targetTask as GardenTask).type === 'Riego') {
            persistCropUpdate(c.id, { lastWatered: updatedCrop.lastWatered });
          }

          return updatedCrop;
        }
        return c;
      });
      setCrops(updatedCrops);

      if (targetCropUpdated && (targetTask as GardenTask).type === 'Riego') {
        updatedTasks = recalculateTasksForCrop(targetCropUpdated, updatedTasks);
        setTasks(updatedTasks);
      }
    }

    saveBothToCloud(updatedCrops, updatedTasks);
  };

  const handleAddTask = (taskData: Omit<GardenTask, 'id' | 'completed'>) => {
    const newTask: GardenTask = {
      ...taskData,
      id: 'task-' + Date.now(),
      completed: false
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    persistNewTask(newTask);
    saveTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    persistDeleteTask(taskId);
    saveTasks(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1A231E]">
      <Header
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        user={user}
        onAuthChange={handleAuthChange}
      />
      <Breadcrumbs currentRoute={currentRoute} onNavigate={handleNavigate} />

      <main className="flex-1">
        {currentRoute === 'inicio' && <HomePage crops={crops} tasks={tasks} onNavigate={handleNavigate} user={user} onAuthChange={handleAuthChange} />}
        {currentRoute === 'dashboard' && (
          <DashboardPage
            crops={crops}
            locations={locations}
            onWaterCrop={handleWaterCrop}
            onAdvanceStage={handleAdvanceStage}
            onDeleteCrop={handleDeleteCrop}
            onDeleteLocation={handleDeleteLocation}
            onAddLogEntry={handleAddLogEntry}
            onDeleteLogEntry={handleDeleteLogEntry}
            onNavigate={handleNavigate}
            user={user}
            onAuthChange={handleAuthChange}
          />
        )}
        {currentRoute === 'calendario' && (
          <CalendarPage
            tasks={tasks}
            crops={crops}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onNavigate={handleNavigate}
            user={user}
            onAuthChange={handleAuthChange}
          />
        )}
        {currentRoute === 'registro' && (
          <RegisterPage onAddCrop={handleAddCrop} onNavigate={handleNavigate} />
        )}
        {currentRoute === 'agradecimiento' && <ThankYouPage onNavigate={handleNavigate} />}
        {currentRoute === 'auditoria' && <AuditLogPage onNavigate={handleNavigate} />}
        {currentRoute === 'admin-donaciones' && <AdminDonationsPage onNavigate={handleNavigate} user={user} />}
        {currentRoute === 'privacidad' && <PrivacyPolicyPage onNavigate={handleNavigate} />}
        {currentRoute === 'terminos' && <TermsConditionsPage onNavigate={handleNavigate} />}
        {currentRoute === 'cookies' && <CookiePolicyPage onNavigate={handleNavigate} />}
        {currentRoute === '404' && <NotFoundPage onNavigate={handleNavigate} />}
      </main>

      <Footer onNavigate={handleNavigate} />
      <CookieBanner onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
