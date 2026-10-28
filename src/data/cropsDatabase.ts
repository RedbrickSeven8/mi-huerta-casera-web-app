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
  thermalFloor?: string; // Piso térmico en Colombia (Cálido, Templado, Frío)
}

export interface CropCategory {
  cropName: string;
  thermalFloorsColombia: string; // Resumen de adaptación climática en Colombia
  generalInfo: CropVarietyInfo;
  varieties: CropVarietyInfo[];
}

export interface ColombiaSeasonInfo {
  seasonName: string; // Temporada de Lluvias / Temporada Seca
  periodDescription: string;
  isRainySeason: boolean;
  waterAdjustmentFactor: number; // Multiplicador de espaciado o frecuencia de riego
  notes: string;
}

/**
 * Obtiene la temporada climática en Colombia según el régimen bimodal andino e intertropical.
 * - Marzo a Mayo: Temporada de lluvias (primer semestre)
 * - Junio a Agosto: Temporada seca / verano (alta radiación solar)
 * - Septiembre a Noviembre: Temporada de lluvias (segundo semestre)
 * - Diciembre a Febrero: Temporada seca / vientos (alta evapotranspiración)
 */
export function getColombiaSeason(date: Date = new Date()): ColombiaSeasonInfo {
  const month = date.getMonth() + 1; // 1 to 12

  if (month >= 3 && month <= 5) {
    return {
      seasonName: 'Temporada de Lluvias (Primer semestre)',
      periodDescription: 'Marzo a Mayo',
      isRainySeason: true,
      waterAdjustmentFactor: 1.5, // Mayor humedad ambiental; espaciar riego manual
      notes: 'Alta humedad y nubosidad. Reducir riegos artificiales para evitar hongos radiculares y asfixia en sustrato.'
    };
  } else if (month >= 6 && month <= 8) {
    return {
      seasonName: 'Temporada Seca / Veranillo (Alta radiación)',
      periodDescription: 'Junio a Agosto',
      isRainySeason: false,
      waterAdjustmentFactor: 0.8, // Mayor radiación; requerimiento de riego más frecuente
      notes: 'Días despejados y fuerte insolación. Aumentar frecuencia de riego a primeras horas de la mañana.'
    };
  } else if (month >= 9 && month <= 11) {
    return {
      seasonName: 'Temporada de Lluvias (Segundo semestre)',
      periodDescription: 'Septiembre a Noviembre',
      isRainySeason: true,
      waterAdjustmentFactor: 1.5,
      notes: 'Precipitaciones frecuentes. Proteger bancales descubiertos y controlar drenaje para evitar encharcamiento.'
    };
  } else {
    return {
      seasonName: 'Temporada Seca y Vientos (Diciembre a Febrero)',
      periodDescription: 'Diciembre a Febrero',
      isRainySeason: false,
      waterAdjustmentFactor: 0.8,
      notes: 'Brisa seca y alta evapotranspiración. Proteger plántulas jóvenes y mantener acolchado orgánico.'
    };
  }
}

/**
 * Calcula dinámicamente la frecuencia de riego ajustada en Colombia:
 * - Base botánica de la especie / variedad
 * - Horas de exposición solar del contenedor / cultivo
 * - Temporada climática colombiana (lluvias vs seca)
 */
export function calculateDynamicWaterFrequency(
  baseFrequencyDays: number,
  sunHours: number,
  date: Date = new Date()
): { adjustedDays: number; season: ColombiaSeasonInfo; reason: string } {
  const season = getColombiaSeason(date);
  let adjusted = baseFrequencyDays;

  // Ajuste por horas de sol directo:
  // Si tiene sol fuerte (>= 7h), el sustrato se seca más rápido (-0.5 a -1 día)
  // Si está en semisombra (< 5h), la humedad se retiene más (+0.5 a +1 día)
  if (sunHours >= 7.5) {
    adjusted -= 0.6;
  } else if (sunHours <= 4.5) {
    adjusted += 0.8;
  }

  // Ajuste por régimen de lluvias en Colombia
  if (season.isRainySeason) {
    adjusted *= season.waterAdjustmentFactor; // Ej. 2 días * 1.5 = 3 días
  } else {
    adjusted *= season.waterAdjustmentFactor; // Ej. 2 días * 0.8 = 1.6 días
  }

  // Redondear a número entero de días (mínimo 1 día, máximo 6 días)
  const finalDays = Math.max(1, Math.min(6, Math.round(adjusted)));

  let reason = '';
  if (season.isRainySeason) {
    reason = `Ajustado a ${finalDays} día(s) por temporada de lluvias en Colombia y ${sunHours}h de sol.`;
  } else {
    reason = `Ajustado a ${finalDays} día(s) por temporada seca en Colombia y ${sunHours}h de sol directo.`;
  }

  return {
    adjustedDays: finalDays,
    season,
    reason
  };
}

export const CROPS_DATABASE: CropCategory[] = [
  {
    cropName: 'Lechuga',
    thermalFloorsColombia: 'Clima Frío y Templado (1.800 - 2.800 msnm, Sabana de Bogotá, Antioquia, Nariño, Boyacá)',
    generalInfo: {
      varietyName: 'No estoy seguro (Especie general)',
      botanicalName: 'Lactuca sativa L.',
      stageDaysToHarvest: {
        Semilla: 60,
        Plántula: 40,
        Crecimiento: 20,
        Floración: 10,
        Cosecha: 0
      },
      waterFrequencyDays: 1,
      sunHours: 5,
      recommendedMoisturePercent: 80,
      recommendedBed: 'Mesa de Cultivo Norte #1',
      thermalFloor: 'Frío y Templado',
      notes: 'Hortaliza de hoja tierna ideal para climas andinos. En clima cálido ubicar en semisombra fresca. Riego constante sin encharcar.'
    },
    varieties: [
      {
        varietyName: 'Lechuga Batavia (Común Colombia)',
        botanicalName: 'Lactuca sativa var. capitata',
        stageDaysToHarvest: {
          Semilla: 65,
          Plántula: 45,
          Crecimiento: 25,
          Floración: 10,
          Cosecha: 0
        },
        waterFrequencyDays: 1,
        sunHours: 5.5,
        recommendedMoisturePercent: 80,
        recommendedBed: 'Mesa de Cultivo Norte #1',
        thermalFloor: 'Frío a Templado (1.600 - 2.600 msnm)',
        notes: 'La variedad reina en los mercados colombianos. Excelente cogollo rizado y crujiente. Riego matutino constante.'
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
        thermalFloor: 'Frío y Templado',
        notes: 'Hojas suaves moradas y verdes. Cosecha continua hoja por hoja sin arrancar la planta.'
      },
      {
        varietyName: 'Lechuga Romana (Crespa)',
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
        thermalFloor: 'Frío y Templado',
        notes: 'Sustrato bien drenado con humus de lombriz. Gran tolerancia y porte erguido.'
      }
    ]
  },
  {
    cropName: 'Tomate',
    thermalFloorsColombia: 'Clima Templado y Cálido (800 - 2.200 msnm, Valle del Cauca, Huila, Santander, Boyacá)',
    generalInfo: {
      varietyName: 'No estoy seguro (Especie general)',
      botanicalName: 'Solanum lycopersicum L.',
      stageDaysToHarvest: {
        Semilla: 90,
        Plántula: 65,
        Crecimiento: 45,
        Floración: 20,
        Cosecha: 0
      },
      waterFrequencyDays: 2,
      sunHours: 7.5,
      recommendedMoisturePercent: 70,
      recommendedBed: 'Bancal Sur #1',
      thermalFloor: 'Templado y Cálido',
      notes: 'Exigente en sol directo (+7h). Regar siempre en la base evitando mojar follaje para prevenir gota/tizón común en Colombia.'
    },
    varieties: [
      {
        varietyName: 'Tomate Chonto (Tradicional Colombia)',
        botanicalName: 'Solanum lycopersicum (Chonto)',
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
        thermalFloor: 'Templado (1.200 - 2.000 msnm)',
        notes: 'El tomate más consumido en Colombia para guisos y ensaladas. Frutos ovalados carnosos. Requiere tutorado resistente.'
      },
      {
        varietyName: 'Tomate Cherry',
        botanicalName: 'Solanum lycopersicum var. cerasiforme',
        stageDaysToHarvest: {
          Semilla: 75,
          Plántula: 50,
          Crecimiento: 32,
          Floración: 15,
          Cosecha: 0
        },
        waterFrequencyDays: 2,
        sunHours: 7.5,
        recommendedMoisturePercent: 70,
        recommendedBed: 'Bancal Sur #1',
        thermalFloor: 'Todos los pisos con sol directo',
        notes: 'El más fácil y productivo en macetas y terrazas caseras en Colombia. Cosechas continuas en racimos.'
      },
      {
        varietyName: 'Tomate Larga Vida / Milano',
        botanicalName: 'Solanum lycopersicum',
        stageDaysToHarvest: {
          Semilla: 95,
          Plántula: 70,
          Crecimiento: 50,
          Floración: 22,
          Cosecha: 0
        },
        waterFrequencyDays: 2,
        sunHours: 8,
        recommendedMoisturePercent: 68,
        recommendedBed: 'Bancal Sur #2',
        thermalFloor: 'Templado y Cálido',
        notes: 'Frutos grandes y firmes. Agradece abonados ricos en potasio y protección en picos de lluvia.'
      }
    ]
  },
  {
    cropName: 'Zanahoria',
    thermalFloorsColombia: 'Clima Frío (2.000 - 3.000 msnm, Altiplano Cundiboyacense, Nariño)',
    generalInfo: {
      varietyName: 'No estoy seguro (Especie general)',
      botanicalName: 'Daucus carota L.',
      stageDaysToHarvest: {
        Semilla: 80,
        Plántula: 60,
        Crecimiento: 35,
        Floración: 15,
        Cosecha: 0
      },
      waterFrequencyDays: 3,
      sunHours: 6,
      recommendedMoisturePercent: 65,
      recommendedBed: 'Jardinera Profunda #3',
      thermalFloor: 'Clima Frío',
      notes: 'Raíz comestible. Sustrato suelto y arenoso con profundidad mínima de 25 cm para raíces rectas.'
    },
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
        thermalFloor: 'Frío (Altiplano)',
        notes: 'Cilíndrica y dulce. En temporada de lluvias vigilar drenaje para evitar pudrición de cuello radicular.'
      },
      {
        varietyName: 'Zanahoria Chantenay',
        botanicalName: 'Daucus carota',
        stageDaysToHarvest: {
          Semilla: 70,
          Plántula: 50,
          Crecimiento: 30,
          Floración: 15,
          Cosecha: 0
        },
        waterFrequencyDays: 3,
        sunHours: 6,
        recommendedMoisturePercent: 65,
        recommendedBed: 'Jardinera Profunda #3',
        thermalFloor: 'Frío y Templado',
        notes: 'Raíz cónica más corta y ancha. Muy adecuada para jardineras caseras con profundidad media.'
      }
    ]
  },
  {
    cropName: 'Pimiento',
    thermalFloorsColombia: 'Clima Templado y Cálido (0 - 1.800 msnm, Costa Caribe, Valle, Tolima, Santander)',
    generalInfo: {
      varietyName: 'No estoy seguro (Especie general)',
      botanicalName: 'Capsicum annuum L.',
      stageDaysToHarvest: {
        Semilla: 85,
        Plántula: 60,
        Crecimiento: 38,
        Floración: 18,
        Cosecha: 0
      },
      waterFrequencyDays: 2,
      sunHours: 7,
      recommendedMoisturePercent: 70,
      recommendedBed: 'Bancal Principal #1',
      thermalFloor: 'Cálido y Templado',
      notes: 'Le encanta el calor y sol directo. Regar con regularidad sin anegar las raíces.'
    },
    varieties: [
      {
        varietyName: 'Pimentón Morrón (Cuatro Cascos)',
        botanicalName: 'Capsicum annuum var. grossum',
        stageDaysToHarvest: {
          Semilla: 90,
          Plántula: 65,
          Crecimiento: 42,
          Floración: 20,
          Cosecha: 0
        },
        waterFrequencyDays: 2,
        sunHours: 7.5,
        recommendedMoisturePercent: 70,
        recommendedBed: 'Bancal Principal #1',
        thermalFloor: 'Templado y Cálido',
        notes: 'Pimentón grueso dulce, muy valorado en la gastronomía colombiana. Requiere suelo rico en materia orgánica.'
      },
      {
        varietyName: 'Ají Dulce / Chivano (Tradicional Colombia)',
        botanicalName: 'Capsicum chinense / frutescens',
        stageDaysToHarvest: {
          Semilla: 80,
          Plántula: 55,
          Crecimiento: 35,
          Floración: 15,
          Cosecha: 0
        },
        waterFrequencyDays: 2,
        sunHours: 8,
        recommendedMoisturePercent: 68,
        recommendedBed: 'Bancal Principal #2',
        thermalFloor: 'Cálido y Medio (Costa y Valles)',
        notes: 'Aromático indispensable para sofritos y ahogados tradicionales. Muy resistente a plagas caseras.'
      }
    ]
  },
  {
    cropName: 'Espinaca',
    thermalFloorsColombia: 'Clima Frío (2.000 - 3.200 msnm, Páramo bajo, Cundinamarca, Boyacá)',
    generalInfo: {
      varietyName: 'No estoy seguro (Especie general)',
      botanicalName: 'Spinacia oleracea L.',
      stageDaysToHarvest: {
        Semilla: 50,
        Plántula: 30,
        Crecimiento: 15,
        Floración: 5,
        Cosecha: 0
      },
      waterFrequencyDays: 1,
      sunHours: 4.5,
      recommendedMoisturePercent: 82,
      recommendedBed: 'Mesa de Cultivo Sombra',
      thermalFloor: 'Clima Frío',
      notes: 'No tolera calores intensos (sube a flor rápidamente). Prospera en Bogotá y zonas andinas frescas.'
    },
    varieties: [
      {
        varietyName: 'Espinaca Bogotana / Viroflay',
        botanicalName: 'Spinacia oleracea',
        stageDaysToHarvest: {
          Semilla: 48,
          Plántula: 28,
          Crecimiento: 14,
          Floración: 5,
          Cosecha: 0
        },
        waterFrequencyDays: 1,
        sunHours: 4.5,
        recommendedMoisturePercent: 82,
        recommendedBed: 'Mesa de Cultivo Sombra',
        thermalFloor: 'Frío Andino',
        notes: 'Hojas anchas y carnosas. Agradece riegos suaves diarios y luz difusa.'
      }
    ]
  },
  {
    cropName: 'Albahaca',
    thermalFloorsColombia: 'Clima Templado y Cálido (adaptable en interiores iluminados en clima frío)',
    generalInfo: {
      varietyName: 'No estoy seguro (Especie general)',
      botanicalName: 'Ocimum basilicum L.',
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
      recommendedBed: 'Bancal Sur #1',
      thermalFloor: 'Templado y Cálido',
      notes: 'Aromática tropical. Proteger de heladas nocturnas andinas. Excelente asociación con tomateras.'
    },
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
        thermalFloor: 'Templado',
        notes: 'Poda de flores apicales para alargar vida de las hojas y vigorizar follaje.'
      },
      {
        varietyName: 'Albahaca Morada',
        botanicalName: 'Ocimum basilicum var. purpurascens',
        stageDaysToHarvest: {
          Semilla: 55,
          Plántula: 38,
          Crecimiento: 18,
          Floración: 6,
          Cosecha: 0
        },
        waterFrequencyDays: 2,
        sunHours: 6.5,
        recommendedMoisturePercent: 68,
        recommendedBed: 'Bancal Sur #1',
        thermalFloor: 'Templado y Cálido',
        notes: 'Hojas púrpuras aromáticas de alto valor estético y culinario. Muy llamativa en terrazas.'
      }
    ]
  }
];

export function getDaysToHarvestForCrop(cropName: string, varietyName: string, stage: CropStage): number {
  const category = CROPS_DATABASE.find(
    (c) => c.cropName.toLowerCase() === cropName.toLowerCase()
  );
  if (category) {
    if (varietyName.includes('No estoy seguro') || !varietyName) {
      return category.generalInfo.stageDaysToHarvest[stage];
    }
    const variety = category.varieties.find(
      (v) => v.varietyName.toLowerCase() === varietyName.toLowerCase()
    ) || category.varieties[0];
    if (variety && variety.stageDaysToHarvest && variety.stageDaysToHarvest[stage] !== undefined) {
      return variety.stageDaysToHarvest[stage];
    }
  }

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
  const plantedParts = plantedDateStr.split('-').map(Number);
  const planted = new Date(plantedParts[0], (plantedParts[1] || 1) - 1, plantedParts[2] || 1);
  const now = new Date();
  const todayUtc = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const plantedUtc = new Date(planted.getFullYear(), planted.getMonth(), planted.getDate());
  const diffTime = todayUtc.getTime() - plantedUtc.getTime();
  const daysPassed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  const category = CROPS_DATABASE.find(
    (c) => c.cropName.toLowerCase() === cropName.toLowerCase()
  );
  const variety = (varietyName.includes('No estoy seguro') || !varietyName)
    ? category?.generalInfo
    : (category?.varieties.find((v) => v.varietyName.toLowerCase() === varietyName.toLowerCase()) || category?.varieties[0]);

  const totalSeedDays = variety?.stageDaysToHarvest.Semilla ?? 65;
  const daysPlántula = variety?.stageDaysToHarvest.Plántula ?? 45;
  const daysCrecimiento = variety?.stageDaysToHarvest.Crecimiento ?? 25;
  const daysFloracion = variety?.stageDaysToHarvest.Floración ?? 10;

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
    return { imageUrl: '/crops/tomate.svg', imageAlt: 'Tomate Chonto / Cherry' };
  }
  if (lower.includes('albahaca')) {
    return { imageUrl: '/crops/albahaca.svg', imageAlt: 'Albahaca Aromática' };
  }
  if (lower.includes('lechuga')) {
    return { imageUrl: '/crops/lechuga.svg', imageAlt: 'Lechuga Batavia' };
  }
  if (lower.includes('zanahoria')) {
    return { imageUrl: '/crops/zanahoria.svg', imageAlt: 'Zanahoria Nantesa' };
  }
  if (lower.includes('pimiento')) {
    return { imageUrl: '/crops/pimiento.svg', imageAlt: 'Pimentón / Ají Dulce' };
  }
  if (lower.includes('espinaca')) {
    return { imageUrl: '/crops/espinaca.svg', imageAlt: 'Espinaca Bogotana' };
  }
  return { imageUrl: '/crops/lechuga.svg', imageAlt: cropName };
}
