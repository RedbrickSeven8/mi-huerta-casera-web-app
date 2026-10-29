import type { PageRoute } from '../types/huerta';

const PAGE_TITLES: Record<PageRoute, string> = {
  inicio: 'Mi Huerta Casera | Gestionar y hacer seguimiento a mi huerta casera',
  dashboard: 'Panel de Cultivos y Seguimiento | Mi Huerta Casera',
  calendario: 'Calendario de Riego y Tareas | Mi Huerta Casera',
  registro: 'Configurar Huerta y Alta de Cultivo | Mi Huerta Casera',
  agradecimiento: 'Registro Completado · Gracias | Mi Huerta Casera',
  auditoria: 'Registro Técnico de Auditoría de Consentimientos | Mi Huerta Casera',
  privacidad: 'Política de Privacidad | Mi Huerta Casera · las paginas de dani',
  terminos: 'Términos y Condiciones de Uso | Mi Huerta Casera · las paginas de dani',
  cookies: 'Política de Cookies y Evaluación de Consentimiento | Mi Huerta Casera',
  'admin-donaciones': 'Validación de Donaciones y Comprobantes | Mi Huerta Casera',
  '404': 'Página No Encontrada (Error 404) | Mi Huerta Casera'
};

export function updatePageTitle(route: PageRoute): void {
  document.title = PAGE_TITLES[route] || PAGE_TITLES.inicio;
}
