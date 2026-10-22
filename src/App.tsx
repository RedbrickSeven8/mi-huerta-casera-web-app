import { useState, useEffect } from 'react';
import type { CropItem, CropStage, GardenTask, PageRoute } from './types/huerta';
import { loadCrops, saveCrops, loadTasks, saveTasks, fetchRemoteGardenData } from './services/huertaStorage';
import { updatePageTitle } from './services/seoManager';
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

export function App() {
  const [currentRoute, setCurrentRoute] = useState<PageRoute>(resolveInitialRoute);
  const [user, setUser] = useState<UserProfile | null>(() => getUser());
  const [crops, setCrops] = useState<CropItem[]>(() => loadCrops());
  const [tasks, setTasks] = useState<GardenTask[]>(() => loadTasks());

  useEffect(() => {
    updatePageTitle(currentRoute);
  }, [currentRoute]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(resolveInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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

      // Attempt remote sync from Supabase
      fetchRemoteGardenData().then(({ crops: remoteCrops, tasks: remoteTasks }) => {
        if (remoteCrops && remoteCrops.length > 0) {
          setCrops(remoteCrops);
          saveCrops(remoteCrops);
        }
        if (remoteTasks && remoteTasks.length > 0) {
          setTasks(remoteTasks);
          saveTasks(remoteTasks);
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

  const handleWaterCrop = (cropId: string) => {
    const updated = crops.map((c) => {
      if (c.id !== cropId) return c;
      const nextMoisture = Math.min(95, c.moisturePercent + 12);
      return {
        ...c,
        moisturePercent: nextMoisture,
        lastWatered: 'Hace unos instantes'
      };
    });
    setCrops(updated);
    saveCrops(updated);
  };

  const handleAdvanceStage = (cropId: string) => {
    const updated = crops.map((c) => {
      if (c.id !== cropId) return c;
      const idx = STAGE_ORDER.indexOf(c.stage);
      const nextStage = STAGE_ORDER[(idx + 1) % STAGE_ORDER.length];
      return {
        ...c,
        stage: nextStage,
        daysToHarvest: nextStage === 'Cosecha' ? 0 : Math.max(3, c.daysToHarvest - 5)
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

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    setTasks(updated);
    saveTasks(updated);
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
