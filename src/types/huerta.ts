export type PageRoute =
  | 'inicio'
  | 'dashboard'
  | 'calendario'
  | 'registro'
  | 'agradecimiento'
  | 'auditoria'
  | 'privacidad'
  | 'terminos'
  | 'cookies'
  | '404';

export type CropStage = 'Semilla' | 'Plántula' | 'Crecimiento' | 'Floración' | 'Cosecha';

export type LogEntryType =
  | 'Riego'
  | 'Abonado'
  | 'Poda'
  | 'Cosecha'
  | 'Control preventivo'
  | 'Cambio de etapa'
  | 'Siembra'
  | 'Observación';

export interface CropLogEntry {
  id: string;
  type: LogEntryType;
  title: string;
  date: string;       // YYYY-MM-DD
  time?: string;      // HH:mm
  notes?: string;
  taskId?: string;    // If originated from completing a task
}

export interface CropItem {
  id: string;
  name: string;
  variety: string;
  bed: string;
  plantedDate: string;
  daysToHarvest: number;
  stage: CropStage;
  recommendedMoisturePercent: number; // Humedad recomendada según la especie
  sunHours: number;
  waterFrequencyDays: number;
  lastWatered: string;
  notes: string;
  imageUrl: string;
  imageAlt: string;
  log?: CropLogEntry[]; // Bitácora con registros visuales e historial
}

export interface GardenTask {
  id: string;
  cropId: string;
  cropName: string;
  type: 'Riego' | 'Abonado' | 'Poda' | 'Cosecha' | 'Control preventivo';
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface ConsentAuditRecord {
  id: string;
  date: string;
  time: string;
  isoTimestamp: string;
  consentType: 'Política de Privacidad' | 'Términos y Condiciones' | 'Política de Cookies (Técnicas/Opcionales)';
  status: 'Aceptado' | 'Rechazado';
  acceptanceMethod: string;
  formOrigin: string;
  userIdentifier?: string;
}


export type LocationType = 'Bancal elevado' | 'Mesa de cultivo' | 'Jardinera' | 'Maceta' | 'Suelo directo' | 'Invernadero' | 'Hidroponía / Otro';

export interface GardenLocation {
  id: string;
  name: string;
  type?: LocationType;
  description?: string;
  sunExposure?: 'Pleno sol' | 'Semisombra' | 'Sombra';
  createdAt: string;
}
