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
    id: 'crop-1',
    name: 'Tomate Cherry',
    variety: 'Solanum lycopersicum var. cerasiforme',
    bed: 'Bancal Sur #1',
    plantedDate: getTodayFormatted(-20),
    daysToHarvest: 18,
    stage: 'Floración',
    recommendedMoisturePercent: 72,
    sunHours: 7.5,
    waterFrequencyDays: 2,
    lastWatered: 'Hoy, 08:30',
    notes: 'Tutorado revisado. Racimos florales sanos sin pulgón.',
    imageUrl: '/hero-garden.svg',
    imageAlt: 'Ilustración de cultivo de Tomate Cherry en Bancal Sur',
    log: [
      {
        id: 'log-101',
        type: 'Siembra',
        title: 'Trasplante a bancal definitivo',
        date: getTodayFormatted(-20),
        time: '09:00',
        notes: 'Sustrato enriquecido con humus y riego profundo inicial.'
      },
      {
        id: 'log-102',
        type: 'Abonado',
        title: 'Aporte de té de compost y potasio',
        date: getTodayFormatted(-12),
        time: '18:30',
        notes: 'Nutrientes para favorecer la floración.'
      },
      {
        id: 'log-103',
        type: 'Poda',
        title: 'Deschuponado de axilas foliares',
        date: getTodayFormatted(-5),
        time: '11:15',
        notes: 'Retirados brotes axilares para concentrar vigor floral.'
      },
      {
        id: 'log-104',
        type: 'Riego',
        title: 'Riego profundo por goteo',
        date: getTodayFormatted(0),
        time: '08:30',
        notes: 'Riego matutino registrado sin alterar humedad diana recomendada (72%).'
      }
    ]
  },
  {
    id: 'crop-2',
    name: 'Albahaca Genovesa',
    variety: 'Ocimum basilicum',
    bed: 'Bancal Sur #1',
    plantedDate: getTodayFormatted(-15),
    daysToHarvest: 7,
    stage: 'Cosecha',
    recommendedMoisturePercent: 68,
    sunHours: 6.0,
    waterFrequencyDays: 2,
    lastWatered: 'Ayer, 19:00',
    notes: 'Poda apical realizada para estimular ramificación lateral.',
    imageUrl: '/hero-garden.svg',
    imageAlt: 'Ilustración de planta de Albahaca Genovesa asociada al tomate',
    log: [
      {
        id: 'log-201',
        type: 'Siembra',
        title: 'Asociación benéfica junto a Tomate Cherry',
        date: getTodayFormatted(-15),
        time: '10:00',
        notes: 'Repele plagas y mejora aroma del bancal.'
      },
      {
        id: 'log-202',
        type: 'Poda',
        title: 'Despunte apical',
        date: getTodayFormatted(-7),
        time: '17:00',
        notes: 'Se evita floración anticipada para más follaje.'
      },
      {
        id: 'log-203',
        type: 'Riego',
        title: 'Riego a pie de planta',
        date: getTodayFormatted(-1),
        time: '19:00',
        notes: 'Humedad basal mantenida sin mojar follaje.'
      }
    ]
  },
  {
    id: 'crop-3',
    name: 'Lechuga Hoja de Roble',
    variety: 'Lactuca sativa',
    bed: 'Mesa de Cultivo Norte #2',
    plantedDate: getTodayFormatted(-10),
    daysToHarvest: 12,
    stage: 'Crecimiento',
    recommendedMoisturePercent: 80,
    sunHours: 5.0,
    waterFrequencyDays: 1,
    lastWatered: 'Hoy, 07:45',
    notes: 'Sustrato fresco con acolchado de paja ecológica.',
    imageUrl: '/hero-garden.svg',
    imageAlt: 'Ilustración de cultivo de Lechuga Hoja de Roble en mesa de cultivo',
    log: [
      {
        id: 'log-301',
        type: 'Siembra',
        title: 'Siembra escalonada en mesa elevada',
        date: getTodayFormatted(-10),
        time: '08:00',
        notes: 'Distancia de 20 cm entre plántulas.'
      },
      {
        id: 'log-302',
        type: 'Control preventivo',
        title: 'Colocación de barrera anti-babosas',
        date: getTodayFormatted(-3),
        time: '12:00',
        notes: 'Cinta de cobre en las patas de la mesa.'
      },
      {
        id: 'log-303',
        type: 'Riego',
        title: 'Riego matinal suave',
        date: getTodayFormatted(0),
        time: '07:45',
        notes: 'Humedad óptima recomendada de 80% preservada.'
      }
    ]
  },
  {
    id: 'crop-4',
    name: 'Zanahoria Nantesa',
    variety: 'Daucus carota',
    bed: 'Jardinera Profunda #3',
    plantedDate: getTodayFormatted(-25),
    daysToHarvest: 26,
    stage: 'Crecimiento',
    recommendedMoisturePercent: 65,
    sunHours: 6.5,
    waterFrequencyDays: 3,
    lastWatered: 'Hace 2 días',
    notes: 'Aclareo completado a 8 cm entre raíces.',
    imageUrl: '/hero-garden.svg',
    imageAlt: 'Ilustración de cultivo de Zanahoria Nantesa en jardinera profunda',
    log: [
      {
        id: 'log-401',
        type: 'Siembra',
        title: 'Siembra directa en sustrato arenoso',
        date: getTodayFormatted(-25),
        time: '16:00',
        notes: 'Líneas rectas a 1 cm de profundidad.'
      },
      {
        id: 'log-402',
        type: 'Poda',
        title: 'Aclareo de plántulas apiñadas',
        date: getTodayFormatted(-14),
        time: '10:30',
        notes: 'Espaciado a 8 cm para engorde cónico uniforme.'
      },
      {
        id: 'log-403',
        type: 'Riego',
        title: 'Riego regular de penetración',
        date: getTodayFormatted(-2),
        time: '09:00',
        notes: 'Riego sin encharcamiento para evitar grietas.'
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
