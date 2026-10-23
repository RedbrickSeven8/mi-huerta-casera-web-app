import { useState, useEffect } from 'react';
import type { CropItem, CropStage, CropLogEntry, GardenTask, PageRoute } from './types/huerta';
import { loadCrops, saveCrops, loadTasks, saveTasks, saveBothToCloud, fetchRemoteGardenData } from './services/huertaStorage';
import { updatePageTitle } from './services/seoManager';
import { getDaysToHarvestForCrop, calculateAutomaticStage } from './data/cropsDatabase';
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

function getSynchronizedInitialCrops(): CropItem[] {
  const initial = loadCrops();
  const today = getTodayString();
  const nowTime = getCurrentTimeString();
  let hasChanged = false;

  const synchronized = initial.map((c) => {
    if (!c.plantedDate) return c;
    const { stage: autoStage, daysToHarvest: autoDays } = calculateAutomaticStage(
      c.name,
      c.variety,
      c.plantedDate
    );
    if (autoStage !== c.stage) {
      hasChanged = true;
      const autoLogEntry: CropLogEntry = {
        id: 'log-auto-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        type: 'Cambio de etapa',
        title: `Transición automática a: ${autoStage}`,
        date: today,
        time: nowTime,
        notes: `Cambio de etapa automatizado por calendario astronómico y agronómico (desde etapa ${c.stage}). Días restantes: ${autoDays}.`
      };
      const currentLogs = c.log || [];
      return {
        ...c,
        stage: autoStage,
        daysToHarvest: autoDays,
        log: [autoLogEntry, ...currentLogs]
      };
    }
    return c;
  });

  if (hasChanged) {
    saveCrops(synchronized);
  }
  return synchronized;
}

export function App() {
  const [currentRoute, setCurrentRoute] = useState<PageRoute>(resolveInitialRoute);
  const [user, setUser] = useState<UserProfile | null>(() => getUser());
  const [crops, setCrops] = useState<CropItem[]>(() => getSynchronizedInitialCrops());
  const [tasks, setTasks] = useState<GardenTask[]>(() => loadTasks());

  useEffect(() => {
    updatePageTitle(currentRoute);
  }, [currentRoute]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(resolveInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);

    // Real-time synchronization loop between devices (iPad, celular, desktop)
    const checkRemoteSync = () => {
      const currentUser = getUser();
      if (!currentUser) return;

      fetchRemoteGardenData().then(({ crops: remoteCrops, tasks: remoteTasks }) => {
        if (remoteCrops && remoteCrops.length > 0) {
          const userKey = 'mi_huerta_casera_crops_v3_' + (currentUser.email || currentUser.id);
          const currentLocalStr = localStorage.getItem(userKey);
          const remoteStr = JSON.stringify(remoteCrops);
          if (currentLocalStr !== remoteStr) {
            setCrops(remoteCrops);
            localStorage.setItem(userKey, remoteStr);
          }
        }
        if (remoteTasks && remoteTasks.length > 0) {
          const taskKey = 'mi_huerta_casera_tasks_v3_' + (currentUser.email || currentUser.id);
          const currentTasksStr = localStorage.getItem(taskKey);
          const remoteTasksStr = JSON.stringify(remoteTasks);
          if (currentTasksStr !== remoteTasksStr) {
            setTasks(remoteTasks);
            localStorage.setItem(taskKey, remoteTasksStr);
          }
        }
      });
    };

    // Execute immediately on mount
    checkRemoteSync();

    // Check on tab focus / visibility change (e.g. switching back to browser on iPad or phone)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkRemoteSync();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkRemoteSync);

    // Real-time polling every 3.5 seconds
    const pollInterval = setInterval(checkRemoteSync, 3500);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkRemoteSync);
      clearInterval(pollInterval);
    };
  }, []);

  // When auth state changes, re-load local or remote user crops & tasks
  const handleAuthChange = (newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser) {
      // Reload user data
      const localCrops = loadCrops();
      const localTasks = loadTasks();
      setCrops(localCrops);
      setTasks(localTasks);

      // Attempt remote sync
      fetchRemoteGardenData().then(({ crops: remoteCrops, tasks: remoteTasks }) => {
        if (remoteCrops && remoteCrops.length > 0) {
          setCrops(remoteCrops);
          // save locally without re-triggering remote overwrite of fresher cloud data
          const userKey = 'mi_huerta_casera_crops_v3_' + (newUser.email || newUser.id);
          localStorage.setItem(userKey, JSON.stringify(remoteCrops));
        } else {
          // If remote is empty, push local data to seed the cloud
          saveCrops(localCrops);
        }

        if (remoteTasks && remoteTasks.length > 0) {
          setTasks(remoteTasks);
          const taskKey = 'mi_huerta_casera_tasks_v3_' + (newUser.email || newUser.id);
          localStorage.setItem(taskKey, JSON.stringify(remoteTasks));
        } else {
          saveTasks(localTasks);
        }
      });
    } else {
      setCrops(loadCrops());
      setTasks(loadTasks());
    }
  };

  const handleNavigate = (route: PageRoute) => {
    setCurrentRoute(route);
    const urlPath = route === 'inicio' ? '/' : `/${route}`;
    window.history.pushState({}, '', urlPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Water crop: Keep recommended moisture constant, update lastWatered, and append a log entry
  const handleWaterCrop = (cropId: string) => {
    const nowTime = getCurrentTimeString();
    const today = getTodayString();
    const updated = crops.map((c) => {
      if (c.id !== cropId) return c;
      const logEntry: CropLogEntry = {
        id: 'log-' + Date.now(),
        type: 'Riego',
        title: 'Riego registrado en el cultivo',
        date: today,
        time: nowTime,
        notes: `Riego manual efectuado. Humedad recomendada de la especie (${c.recommendedMoisturePercent}%).`
      };
      const existingLogs = c.log || [];
      return {
        ...c,
        lastWatered: `Hoy, ${nowTime}`,
        log: [logEntry, ...existingLogs]
      };
    });
    setCrops(updated);
    saveCrops(updated);
  };

  // Advance stage: log the event in bitácora
  const handleAdvanceStage = (cropId: string) => {
    const nowTime = getCurrentTimeString();
    const today = getTodayString();
    const updated = crops.map((c) => {
      if (c.id !== cropId) return c;
      const idx = STAGE_ORDER.indexOf(c.stage);
      const nextStage = STAGE_ORDER[(idx + 1) % STAGE_ORDER.length];
      const recalculatedDays = getDaysToHarvestForCrop(c.name, c.variety, nextStage);
      const logEntry: CropLogEntry = {
        id: 'log-' + Date.now(),
        type: 'Cambio de etapa',
        title: `Evolución fenológica a etapa: ${nextStage}`,
        date: today,
        time: nowTime,
        notes: `Transición de ${c.stage} a ${nextStage}. Días estimados para cosecha recalculados a ${recalculatedDays} días.`
      };
      const existingLogs = c.log || [];
      return {
        ...c,
        stage: nextStage,
        daysToHarvest: recalculatedDays,
        log: [logEntry, ...existingLogs]
      };
    });
    setCrops(updated);
    saveCrops(updated);
  };

  const handleDeleteCrop = (cropId: string) => {
    const updated = crops.filter((c) => c.id !== cropId);
    setCrops(updated);
    saveCrops(updated);
  };

  const handleAddCrop = (newCrop: CropItem) => {
    const updated = [newCrop, ...crops];
    setCrops(updated);
    saveCrops(updated);
  };

  // Add manual log entry to a specific crop
  const handleAddLogEntry = (cropId: string, entryData: Omit<CropLogEntry, 'id'>) => {
    const newEntry: CropLogEntry = {
      ...entryData,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5)
    };
    const updated = crops.map((c) => {
      if (c.id !== cropId) return c;
      const existingLogs = c.log || [];
      return {
        ...c,
        log: [newEntry, ...existingLogs]
      };
    });
    setCrops(updated);
    saveCrops(updated);
  };

  // Delete log entry from a crop
  const handleDeleteLogEntry = (cropId: string, logId: string) => {
    const updated = crops.map((c) => {
      if (c.id !== cropId) return c;
      const filteredLog = (c.log || []).filter((l) => l.id !== logId);
      return {
        ...c,
        log: filteredLog
      };
    });
    setCrops(updated);
    saveCrops(updated);
  };

  // Toggle task: when marked as completed, record into the crop's bitácora!
  const handleToggleTask = (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const willBeCompleted = !targetTask.completed;
    const today = getTodayString();
    const nowTime = getCurrentTimeString();

    // Update tasks
    const updatedTasks = tasks.map((t) => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        completed: willBeCompleted,
        completedAt: willBeCompleted ? today : undefined
      };
    });
    setTasks(updatedTasks);

    // If marked as completed, also log into crop bitácora
    let updatedCrops = crops;
    if (willBeCompleted) {
      updatedCrops = crops.map((c) => {
        if (c.id === targetTask.cropId || (targetTask.cropId === 'general' && c.name === targetTask.cropName)) {
          const logEntry: CropLogEntry = {
            id: 'log-task-' + Date.now(),
            type: targetTask.type,
            title: `Labor: ${targetTask.type}`,
            date: today,
            time: nowTime,
            notes: `Completada desde calendario.`,
            taskId: targetTask.id
          };
          const existingLogs = c.log || [];
          return {
            ...c,
            lastWatered: targetTask.type === 'Riego' ? `Hoy, ${nowTime}` : c.lastWatered,
            log: [logEntry, ...existingLogs]
          };
        }
        return c;
      });
      setCrops(updatedCrops);
    }

    // Persist and sync both atomically to avoid race conditions
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
    saveTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
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
        {currentRoute === 'inicio' && <HomePage crops={crops} onNavigate={handleNavigate} />}
        {currentRoute === 'dashboard' && (
          <DashboardPage
            crops={crops}
            onWaterCrop={handleWaterCrop}
            onAdvanceStage={handleAdvanceStage}
            onDeleteCrop={handleDeleteCrop}
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
