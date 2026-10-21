import type { CropItem, GardenTask } from '../types/huerta';

export const INITIAL_CROPS: CropItem[] = [
  {
    id: 'crop-1',
    name: 'Tomate Cherry',
    variety: 'Solanum lycopersicum var. cerasiforme',
    bed: 'Bancal Sur #1',
    plantedDate: '2025-02-01',
    daysToHarvest: 18,
    stage: 'Floración',
    moisturePercent: 74,
    sunHours: 7.5,
    waterFrequencyDays: 2,
    lastWatered: 'Hoy, 08:30',
    notes: 'Tutorado revisado. Racimos florales sanos sin pulgón.',
    imageUrl: '/hero-garden.svg',
    imageAlt: 'Ilustración de cultivo de Tomate Cherry en Bancal Sur'
  },
  {
    id: 'crop-2',
    name: 'Albahaca Genovesa',
    variety: 'Ocimum basilicum',
    bed: 'Bancal Sur #1 (Asociación)',
    plantedDate: '2025-02-10',
    daysToHarvest: 7,
    stage: 'Cosecha',
    moisturePercent: 68,
    sunHours: 6.0,
    waterFrequencyDays: 2,
    lastWatered: 'Ayer, 19:00',
    notes: 'Poda apical realizada para estimular ramificación lateral.',
    imageUrl: '/hero-garden.svg',
    imageAlt: 'Ilustración de planta de Albahaca Genovesa asociada al tomate'
  },
  {
    id: 'crop-3',
    name: 'Lechuga Hoja de Roble',
    variety: 'Lactuca sativa',
    bed: 'Mesa de Cultivo Norte #2',
    plantedDate: '2025-02-15',
    daysToHarvest: 12,
    stage: 'Crecimiento',
    moisturePercent: 80,
    sunHours: 5.0,
    waterFrequencyDays: 1,
    lastWatered: 'Hoy, 07:45',
    notes: 'Sustrato fresco con acolchado de paja ecológica.',
    imageUrl: '/hero-garden.svg',
    imageAlt: 'Ilustración de cultivo de Lechuga Hoja de Roble en mesa de cultivo'
  },
  {
    id: 'crop-4',
    name: 'Zanahoria Nantesa',
    variety: 'Daucus carota',
    bed: 'Jardinera Profunda #3',
    plantedDate: '2025-01-20',
    daysToHarvest: 26,
    stage: 'Crecimiento',
    moisturePercent: 64,
    sunHours: 6.5,
    waterFrequencyDays: 3,
    lastWatered: 'Hace 2 días',
    notes: 'Aclareo completado a 8 cm entre raíces.',
    imageUrl: '/hero-garden.svg',
    imageAlt: 'Ilustración de cultivo de Zanahoria Nantesa en jardinera profunda'
  }
];

export const INITIAL_TASKS: GardenTask[] = [
  {
    id: 'task-1',
    cropId: 'crop-2',
    cropName: 'Albahaca Genovesa',
    type: 'Riego',
    dueDate: 'Hoy · 19:30',
    completed: false
  },
  {
    id: 'task-2',
    cropId: 'crop-1',
    cropName: 'Tomate Cherry',
    type: 'Abonado',
    dueDate: 'Mañana · 09:00',
    completed: false
  },
  {
    id: 'task-3',
    cropId: 'crop-4',
    cropName: 'Zanahoria Nantesa',
    type: 'Riego',
    dueDate: 'Mañana · 18:30',
    completed: false
  },
  {
    id: 'task-4',
    cropId: 'crop-3',
    cropName: 'Lechuga Hoja de Roble',
    type: 'Control preventivo',
    dueDate: 'En 2 días',
    completed: true
  }
];
