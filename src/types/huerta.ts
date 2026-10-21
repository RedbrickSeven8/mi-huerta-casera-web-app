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

export interface CropItem {
  id: string;
  name: string;
  variety: string;
  bed: string;
  plantedDate: string;
  daysToHarvest: number;
  stage: CropStage;
  moisturePercent: number;
  sunHours: number;
  waterFrequencyDays: number;
  lastWatered: string;
  notes: string;
  imageUrl: string;
  imageAlt: string;
}

export interface GardenTask {
  id: string;
  cropId: string;
  cropName: string;
  type: 'Riego' | 'Abonado' | 'Poda' | 'Cosecha' | 'Control preventivo';
  dueDate: string;
  completed: boolean;
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
