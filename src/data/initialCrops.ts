import type { CropItem, GardenTask } from '../types/huerta';

const getTodayFormatted = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_CROPS: CropItem[] = [
  {
    id: 'crop-7',
    name: 'Lavanda Francesa',
    variety: 'Lavandula angustifolia',
    category: 'Plantas de exterior',
    bed: 'Jardinera Balcón Exterior',
    plantedDate: getTodayFormatted(-30),
    daysToHarvest: 14,
    stage: 'Floración',
    recommendedMoisturePercent: 45,
    sunHours: 7.5,
    waterFrequencyDays: 4,
    lastWatered: 'Ayer, 09:15',
    notes: 'Planta de exterior a pleno sol. Excelente atrayente de polinizadores.',
    imageUrl: '/crops/hierbas.svg',
    imageAlt: 'Lavanda Francesa de exterior',
    log: [
      {
        id: 'log-701',
        type: 'Siembra',
        title: 'Plantación en jardinera exterior',
        date: getTodayFormatted(-30),
        time: '10:00',
        notes: 'Sustrato muy drenante con grava en fondo.'
      },
      {
        id: 'log-702',
        type: 'Riego',
        title: 'Riego ligero',
        date: getTodayFormatted(-1),
        time: '09:15',
        notes: 'Revisión de floración y fragancia.'
      }
    ]
  },

  {
    id: 'crop-1',
    name: 'Tomate Cherry',
    variety: 'Solanum lycopersicum var. cerasiforme',
    category: 'Plantas de Huerta',
    bed: 'Bancal Sur #1',
    plantedDate: getTodayFormatted(-20),
    daysToHarvest: 18,
    stage: 'Floración',
    recommendedMoisturePercent: 72,
    sunHours: 7.5,
    waterFrequencyDays: 2,
    lastWatered: 'Hoy, 08:30',
    notes: 'Tutorado colocado.',
    imageUrl: '/crops/tomate.svg',
    imageAlt: 'Tomate Cherry',
    log: [
      {
        id: 'log-101',
        type: 'Siembra',
        title: 'Siembra en bancal',
        date: getTodayFormatted(-20),
        time: '09:00',
        notes: 'Sustrato con compost.'
      },
      {
        id: 'log-102',
        type: 'Abonado',
        title: 'Abonado',
        date: getTodayFormatted(-12),
        time: '18:30'
      },
      {
        id: 'log-103',
        type: 'Poda',
        title: 'Poda de brotes',
        date: getTodayFormatted(-5),
        time: '11:15'
      },
      {
        id: 'log-104',
        type: 'Riego',
        title: 'Riego',
        date: getTodayFormatted(0),
        time: '08:30'
      }
    ]
  },
  {
    id: 'crop-2',
    name: 'Albahaca Genovesa',
    variety: 'Ocimum basilicum',
    category: 'Otros complementarios y transversales (cactus, aromáticas, etc.)',
    bed: 'Bancal Sur #1',
    plantedDate: getTodayFormatted(-15),
    daysToHarvest: 7,
    stage: 'Cosecha',
    recommendedMoisturePercent: 68,
    sunHours: 6.0,
    waterFrequencyDays: 2,
    lastWatered: 'Ayer, 19:00',
    notes: 'Poda realizada.',
    imageUrl: '/crops/albahaca.svg',
    imageAlt: 'Albahaca Genovesa',
    log: [
      {
        id: 'log-201',
        type: 'Siembra',
        title: 'Siembra',
        date: getTodayFormatted(-15),
        time: '10:00'
      },
      {
        id: 'log-202',
        type: 'Poda',
        title: 'Poda apical',
        date: getTodayFormatted(-7),
        time: '17:00'
      },
      {
        id: 'log-203',
        type: 'Riego',
        title: 'Riego',
        date: getTodayFormatted(-1),
        time: '19:00'
      }
    ]
  },
  {
    id: 'crop-3',
    name: 'Lechuga Hoja de Roble',
    variety: 'Lactuca sativa',
    category: 'Plantas de Huerta',
    bed: 'Mesa de Cultivo Norte #2',
    plantedDate: getTodayFormatted(-10),
    daysToHarvest: 12,
    stage: 'Crecimiento',
    recommendedMoisturePercent: 80,
    sunHours: 5.0,
    waterFrequencyDays: 1,
    lastWatered: 'Hoy, 07:45',
    notes: 'Sustrato húmedo.',
    imageUrl: '/crops/lechuga.svg',
    imageAlt: 'Lechuga Hoja de Roble',
    log: [
      {
        id: 'log-301',
        type: 'Siembra',
        title: 'Siembra',
        date: getTodayFormatted(-10),
        time: '08:00'
      },
      {
        id: 'log-302',
        type: 'Control preventivo',
        title: 'Control preventivo',
        date: getTodayFormatted(-3),
        time: '12:00'
      },
      {
        id: 'log-303',
        type: 'Riego',
        title: 'Riego',
        date: getTodayFormatted(0),
        time: '07:45'
      }
    ]
  },
  {
    id: 'crop-4',
    name: 'Zanahoria Nantesa',
    variety: 'Daucus carota',
    category: 'Plantas de Huerta',
    bed: 'Jardinera Profunda #3',
    plantedDate: getTodayFormatted(-25),
    daysToHarvest: 26,
    stage: 'Crecimiento',
    recommendedMoisturePercent: 65,
    sunHours: 6.5,
    waterFrequencyDays: 3,
    lastWatered: 'Hace 2 días',
    notes: 'Aclareo hecho.',
    imageUrl: '/crops/zanahoria.svg',
    imageAlt: 'Zanahoria Nantesa',
    log: [
      {
        id: 'log-401',
        type: 'Siembra',
        title: 'Siembra',
        date: getTodayFormatted(-25),
        time: '16:00'
      },
      {
        id: 'log-402',
        type: 'Poda',
        title: 'Aclareo',
        date: getTodayFormatted(-14),
        time: '10:30'
      },
      {
        id: 'log-403',
        type: 'Riego',
        title: 'Riego',
        date: getTodayFormatted(-2),
        time: '09:00'
      }
    ]
  }
,
  {
    id: 'crop-5',
    name: 'Pothos Dorado',
    variety: 'Epipremnum aureum',
    category: 'Plantas de interior',
    bed: 'Maceta Salón Interior',
    plantedDate: getTodayFormatted(-40),
    daysToHarvest: 15,
    stage: 'Crecimiento',
    recommendedMoisturePercent: 50,
    sunHours: 3.5,
    waterFrequencyDays: 5,
    lastWatered: 'Ayer, 18:00',
    notes: 'Planta de interior en estantería con luz indirecta.',
    imageUrl: '/crops/hierbas.svg',
    imageAlt: 'Pothos Dorado de interior',
    log: [
      {
        id: 'log-501',
        type: 'Siembra',
        title: 'Ubicación en maceta de interior',
        date: getTodayFormatted(-40),
        time: '11:00',
        notes: 'Sustrato aireado con perlita en salón luminoso.'
      },
      {
        id: 'log-502',
        type: 'Riego',
        title: 'Riego moderado',
        date: getTodayFormatted(-1),
        time: '18:00',
        notes: 'Comprobación de humedad superficial seca.'
      }
    ]
  },
  {
    id: 'crop-6',
    name: 'Monstera Deliciosa',
    variety: 'Monstera deliciosa',
    category: 'Plantas de interior',
    bed: 'Maceta Salón Luminoso',
    plantedDate: getTodayFormatted(-35),
    daysToHarvest: 20,
    stage: 'Crecimiento',
    recommendedMoisturePercent: 55,
    sunHours: 3.5,
    waterFrequencyDays: 6,
    lastWatered: 'Hace 2 días',
    notes: 'Planta de interior en rincón amplio con luz filtrada.',
    imageUrl: '/crops/acelga.svg',
    imageAlt: 'Monstera Deliciosa de interior',
    log: [
      {
        id: 'log-601',
        type: 'Siembra',
        title: 'Ubicación en maceta de interior',
        date: getTodayFormatted(-35),
        time: '10:30',
        notes: 'Sustrato aireado con corteza y perlita con tutor de fibra.'
      },
      {
        id: 'log-602',
        type: 'Riego',
        title: 'Riego suave',
        date: getTodayFormatted(-2),
        time: '19:15',
        notes: 'Limpieza de hojas con paño húmedo.'
      }
    ]
  }
];

export const INITIAL_TASKS: GardenTask[] = [
  {
    id: 'task-1',
    cropId: 'crop-2',
    cropName: 'Albahaca Genovesa',
    type: 'Riego',
    dueDate: getTodayFormatted(0),
    completed: false
  },
  {
    id: 'task-2',
    cropId: 'crop-1',
    cropName: 'Tomate Cherry',
    type: 'Abonado',
    dueDate: getTodayFormatted(1),
    completed: false
  },
  {
    id: 'task-3',
    cropId: 'crop-4',
    cropName: 'Zanahoria Nantesa',
    type: 'Riego',
    dueDate: getTodayFormatted(2),
    completed: false
  },
  {
    id: 'task-4',
    cropId: 'crop-3',
    cropName: 'Lechuga Hoja de Roble',
    type: 'Control preventivo',
    dueDate: getTodayFormatted(3),
    completed: true,
    completedAt: getTodayFormatted(-1)
  }
];
