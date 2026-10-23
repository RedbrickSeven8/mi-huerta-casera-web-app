import type { CropStage } from '../types/huerta';

export interface CropVarietyInfo {
  varietyName: string;
  botanicalName: string;
  stageDaysToHarvest: Record<CropStage, number>; // Days to harvest depending on current stage
  waterFrequencyDays: number;
  sunHours: number;
  recommendedMoisturePercent: number;
  recommendedBed: string;
  notes: string;
}

export interface CropCategory {
  cropName: string;
  varieties: CropVarietyInfo[];
}

export const CROPS_DATABASE: CropCategory[] = [
  {
    cropName: 'Lechuga',
    varieties: [
      {
        varietyName: 'Lechuga Escarola',
        botanicalName: 'Cichorium endivia',
        stageDaysToHarvest: {
          Semilla: 65,
          Plántula: 45,
          Crecimiento: 25,
          Floración: 10,
          Cosecha: 0
        },
        waterFrequencyDays: 1,
        sunHours: 5,
        recommendedMoisturePercent: 80,
        recommendedBed: 'Mesa de Cultivo Norte #1',
        notes: 'Sustrato ligero, rico en compost y con alto retención de humedad. Excelente asociación con cebollas y rábanos.'
      },
      {
        varietyName: 'Lechuga Hoja de Roble',
        botanicalName: 'Lactuca sativa var. crispa',
        stageDaysToHarvest: {
          Semilla: 55,
          Plántula: 35,
          Crecimiento: 18,
          Floración: 8,
          Cosecha: 0
        },
        waterFrequencyDays: 1,
        sunHours: 5,
        recommendedMoisturePercent: 80,
        recommendedBed: 'Mesa de Cultivo Norte #2',
        notes: 'Sustrato fresco con acolchado de paja ecológica. Ideal para cosechar hoja a hoja.'
      },
      {
        varietyName: 'Lechuga Romana',
        botanicalName: 'Lactuca sativa var. longifolia',
        stageDaysToHarvest: {
          Semilla: 70,
          Plántula: 50,
          Crecimiento: 30,
          Floración: 12,
          Cosecha: 0
        },
        waterFrequencyDays: 2,
        sunHours: 6,
        recommendedMoisturePercent: 78,
        recommendedBed: 'Bancal Central #2',
        notes: 'Sustrato bien drenado enriquecido con humus de lombriz. Agradece riegos constantes sin encharcar.'
      }
    ]
  },
  {
    cropName: 'Tomate',
    varieties: [
      {
        varietyName: 'Tomate Cherry',
        botanicalName: 'Solanum lycopersicum var. cerasiforme',
        stageDaysToHarvest: {
          Semilla: 85,
          Plántula: 60,
          Crecimiento: 40,
          Floración: 18,
          Cosecha: 0
        },
        waterFrequencyDays: 2,
        sunHours: 8,
        recommendedMoisturePercent: 72,
        recommendedBed: 'Bancal Sur #1',
        notes: 'Sustrato suelto y nutritivo con potasio y calcio. Tutorado indispensable y excelente asociación con albahaca.'
      },
      {
        varietyName: 'Tomate Muchamiel',
        botanicalName: 'Solanum lycopersicum',
        stageDaysToHarvest: {
          Semilla: 95,
          Plántula: 70,
          Crecimiento: 50,
          Floración: 25,
          Cosecha: 0
        },
        waterFrequencyDays: 2,
        sunHours: 8,
        recommendedMoisturePercent: 70,
        recommendedBed: 'Bancal Sur #2',
        notes: 'Exige sustrato profundo enriquecido con compost maduro y potasio para frutos carnosos.'
      },
      {
        varietyName: 'Tomate Raf',
        botanicalName: 'Solanum lycopersicum (Marmande)',
        stageDaysToHarvest: {
          Semilla: 90,
          Plántula: 65,
          Crecimiento: 45,
          Floración: 20,
          Cosecha: 0
        },
        waterFrequencyDays: 2,
        sunHours: 7,
        recommendedMoisturePercent: 68,
        recommendedBed: 'Bancal Sur #1',
        notes: 'Sustrato fértil con buen drenaje. Moderar el riego en floración para concentrar azúcares en el fruto.'
      }
    ]
  },
  {
    cropName: 'Zanahoria',
    varieties: [
      {
        varietyName: 'Zanahoria Nantesa',
        botanicalName: 'Daucus carota subsp. sativus',
        stageDaysToHarvest: {
          Semilla: 75,
          Plántula: 55,
          Crecimiento: 35,
          Floración: 15,
          Cosecha: 0
        },
        waterFrequencyDays: 3,
        sunHours: 6,
        recommendedMoisturePercent: 65,
        recommendedBed: 'Jardinera Profunda #3',
        notes: 'Sustrato muy arenoso y suelto, sin piedras para evitar deformación de la raíz. Buen maridaje con romero y guisantes.'
      },
      {
        varietyName: 'Zanahoria Morada (Morá de Cuevas)',
        botanicalName: 'Daucus carota',
        stageDaysToHarvest: {
          Semilla: 85,
          Plántula: 65,
          Crecimiento: 40,
          Floración: 20,
          Cosecha: 0
        },
        waterFrequencyDays: 3,
        sunHours: 6,
        recommendedMoisturePercent: 65,
        recommendedBed: 'Jardinera Profunda #3',
        notes: 'Requiere profundidad de sustrato libre de piedras. Riego regular y constante.'
      }
    ]
  },
  {
    cropName: 'Pimiento',
    varieties: [
      {
        varietyName: 'Pimiento del Padrón',
        botanicalName: 'Capsicum annuum var. annuum',
        stageDaysToHarvest: {
          Semilla: 80,
          Plántula: 55,
          Crecimiento: 35,
          Floración: 15,
          Cosecha: 0
        },
        waterFrequencyDays: 2,
        sunHours: 7,
        recommendedMoisturePercent: 70,
        recommendedBed: 'Bancal Principal #1',
        notes: 'Sustrato cálido con compost maduro y humus. Cosechar en verde cuando alcancen 4-5 cm.'
      },
      {
        varietyName: 'Pimiento Italiano',
        botanicalName: 'Capsicum annuum',
        stageDaysToHarvest: {
          Semilla: 90,
          Plántula: 65,
          Crecimiento: 40,
          Floración: 20,
          Cosecha: 0
        },
        waterFrequencyDays: 2,
        sunHours: 7,
        recommendedMoisturePercent: 70,
        recommendedBed: 'Bancal Principal #2',
        notes: 'Sustrato esponjoso. Proteger de vientos fuertes y entutorar si se cargan de frutos.'
      }
    ]
  },
  {
    cropName: 'Espinaca',
    varieties: [
      {
        varietyName: 'Espinaca Viroflay',
        botanicalName: 'Spinacia oleracea',
        stageDaysToHarvest: {
          Semilla: 50,
          Plántula: 30,
          Crecimiento: 15,
          Floración: 5,
          Cosecha: 0
        },
        waterFrequencyDays: 1,
        sunHours: 4,
        recommendedMoisturePercent: 82,
        recommendedBed: 'Mesa de Cultivo Sombra',
        notes: 'Sustrato rico en nitrógeno orgánico. Tolera semisombra y prefiere clima fresco.'
      }
    ]
  },
  {
    cropName: 'Albahaca',
    varieties: [
      {
        varietyName: 'Albahaca Genovesa',
        botanicalName: 'Ocimum basilicum',
        stageDaysToHarvest: {
          Semilla: 50,
          Plántula: 35,
          Crecimiento: 15,
          Floración: 5,
          Cosecha: 0
        },
        waterFrequencyDays: 2,
        sunHours: 6,
        recommendedMoisturePercent: 68,
        recommendedBed: 'Bancal Sur #1 (Asociación)',
        notes: 'Poda apical frecuente para evitar floración prematura y promover ramificación abundante.'
      }
    ]
  }
];

export function getDaysToHarvestForCrop(cropName: string, varietyName: string, stage: CropStage): number {
  const category = CROPS_DATABASE.find(
    (c) => c.cropName.toLowerCase() === cropName.toLowerCase()
  );
  if (category) {
    const variety = category.varieties.find(
      (v) => v.varietyName.toLowerCase() === varietyName.toLowerCase()
    ) || category.varieties[0];
    if (variety && variety.stageDaysToHarvest && variety.stageDaysToHarvest[stage] !== undefined) {
      return variety.stageDaysToHarvest[stage];
    }
  }

  // Fallback defaults per stage if custom crop
  const defaults: Record<CropStage, number> = {
    Semilla: 65,
    Plántula: 45,
    Crecimiento: 25,
    Floración: 15,
    Cosecha: 0
  };
  return defaults[stage];
}

export function calculateAutomaticStage(
  cropName: string,
  varietyName: string,
  plantedDateStr: string
): { stage: CropStage; daysToHarvest: number } {
  // Parse planted date
  const plantedParts = plantedDateStr.split('-').map(Number);
  const planted = new Date(plantedParts[0], (plantedParts[1] || 1) - 1, plantedParts[2] || 1);
  const now = new Date();
  // Strip time for exact day difference
  const todayUtc = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const plantedUtc = new Date(planted.getFullYear(), planted.getMonth(), planted.getDate());
  const diffTime = todayUtc.getTime() - plantedUtc.getTime();
  const daysPassed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  const category = CROPS_DATABASE.find(
    (c) => c.cropName.toLowerCase() === cropName.toLowerCase()
  );
  const variety = category?.varieties.find(
    (v) => v.varietyName.toLowerCase() === varietyName.toLowerCase()
  ) || category?.varieties[0];

  const totalSeedDays = variety?.stageDaysToHarvest.Semilla ?? 65;
  const daysPlántula = variety?.stageDaysToHarvest.Plántula ?? 45;
  const daysCrecimiento = variety?.stageDaysToHarvest.Crecimiento ?? 25;
  const daysFloracion = variety?.stageDaysToHarvest.Floración ?? 10;

  // Cumulative intervals from planting date:
  // Semilla: 0 to (totalSeedDays - daysPlántula)
  // Plántula: up to (totalSeedDays - daysCrecimiento)
  // Crecimiento: up to (totalSeedDays - daysFloracion)
  // Floración: up to totalSeedDays
  // Cosecha: >= totalSeedDays
  const thresholdSemilla = Math.max(1, totalSeedDays - daysPlántula);
  const thresholdPlántula = Math.max(thresholdSemilla + 1, totalSeedDays - daysCrecimiento);
  const thresholdCrecimiento = Math.max(thresholdPlántula + 1, totalSeedDays - daysFloracion);
  const thresholdFloracion = Math.max(thresholdCrecimiento + 1, totalSeedDays);

  let stage: CropStage = 'Semilla';
  let daysToHarvest = Math.max(0, totalSeedDays - daysPassed);

  if (daysPassed >= thresholdFloracion) {
    stage = 'Cosecha';
    daysToHarvest = 0;
  } else if (daysPassed >= thresholdCrecimiento) {
    stage = 'Floración';
  } else if (daysPassed >= thresholdPlántula) {
    stage = 'Crecimiento';
  } else if (daysPassed >= thresholdSemilla) {
    stage = 'Plántula';
  } else {
    stage = 'Semilla';
  }

  return { stage, daysToHarvest };
}

export function getCropImage(cropName: string): { imageUrl: string; imageAlt: string } {
  const lower = cropName.toLowerCase();
  if (lower.includes('tomate')) {
    return { imageUrl: '/crops/tomate.svg', imageAlt: 'Tomate' };
  }
  if (lower.includes('albahaca')) {
    return { imageUrl: '/crops/albahaca.svg', imageAlt: 'Albahaca' };
  }
  if (lower.includes('lechuga')) {
    return { imageUrl: '/crops/lechuga.svg', imageAlt: 'Lechuga' };
  }
  if (lower.includes('zanahoria')) {
    return { imageUrl: '/crops/zanahoria.svg', imageAlt: 'Zanahoria' };
  }
  if (lower.includes('pimiento')) {
    return { imageUrl: '/crops/pimiento.svg', imageAlt: 'Pimiento' };
  }
  if (lower.includes('espinaca')) {
    return { imageUrl: '/crops/espinaca.svg', imageAlt: 'Espinaca' };
  }
  return { imageUrl: '/crops/lechuga.svg', imageAlt: cropName };
}
