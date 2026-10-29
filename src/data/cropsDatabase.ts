import type { CropStage } from '../types/huerta';

export interface CropVarietyInfo {
  varietyName: string;
  botanicalName: string;
  stageDaysToHarvest: Record<CropStage, number>; // Días a cosecha según etapa actual
  waterFrequencyDays: number;
  sunHours: number;
  recommendedMoisturePercent: number;
  recommendedBed: string;
  notes: string;
  climateAdaptation?: string;
}

export interface CropCategory {
  cropName: string;
  climateOverview: string;
  generalInfo: CropVarietyInfo;
  varieties: CropVarietyInfo[];
}

export interface SeasonInfo {
  seasonName: string;
  periodDescription: string;
  isRainySeason: boolean;
  waterAdjustmentFactor: number;
  notes: string;
}

/**
 * Obtiene la temporada climática y régimen de lluvias estacional.
 */
export function getCurrentSeason(date: Date = new Date()): SeasonInfo {
  const month = date.getMonth() + 1; // 1 a 12

  if (month >= 3 && month <= 5) {
    return {
      seasonName: 'Temporada de Lluvias (Primavera / Primer semestre)',
      periodDescription: 'Marzo a Mayo',
      isRainySeason: true,
      waterAdjustmentFactor: 1.5,
      notes: 'Mayor humedad ambiental y nubosidad. Espaciar los riegos manuales para evitar asfixia radicular y proliferación de hongos.'
    };
  } else if (month >= 6 && month <= 8) {
    return {
      seasonName: 'Temporada Seca / Verano (Mayor radiación)',
      periodDescription: 'Junio a Agosto',
      isRainySeason: false,
      waterAdjustmentFactor: 0.8,
      notes: 'Días despejados y fuerte insolación. Aumentar frecuencia de riego temprano en la mañana y verificar la humedad del sustrato.'
    };
  } else if (month >= 9 && month <= 11) {
    return {
      seasonName: 'Temporada Húmeda / Otoño (Segundo semestre)',
      periodDescription: 'Septiembre a Noviembre',
      isRainySeason: true,
      waterAdjustmentFactor: 1.5,
      notes: 'Precipitaciones y rocío constante. Asegurar buen drenaje del sustrato y retirar hojas inferiores secas.'
    };
  } else {
    return {
      seasonName: 'Temporada Seca y Vientos (Diciembre a Febrero)',
      periodDescription: 'Diciembre a Febrero',
      isRainySeason: false,
      waterAdjustmentFactor: 0.8,
      notes: 'Vientos secos y alta tasa de evaporación. Mantener cobertura o acolchado orgánico para conservar humedad en la raíz.'
    };
  }
}

/**
 * Calcula dinámicamente la frecuencia de riego:
 * - Base agronómica de la especie / variedad
 * - Horas de exposición solar del cultivo
 * - Temporada climática ambiental
 */
export function calculateDynamicWaterFrequency(
  baseFrequencyDays: number,
  sunHours: number,
  date: Date = new Date()
): { adjustedDays: number; season: SeasonInfo; reason: string } {
  const season = getCurrentSeason(date);
  let adjusted = baseFrequencyDays;

  // Ajuste por insolación:
  // Radiación intensa (>= 7.5h) acelera la transpiración del suelo.
  // Semisombra (<= 4.5h) conserva la humedad radicular por más tiempo.
  if (sunHours >= 7.5) {
    adjusted -= 0.6;
  } else if (sunHours <= 4.5) {
    adjusted += 0.8;
  }

  // Ajuste según régimen estacional
  adjusted *= season.waterAdjustmentFactor;

  // Redondear a días enteros (mínimo 1 día, máximo 6 días)
  const finalDays = Math.max(1, Math.min(6, Math.round(adjusted)));

  let reason = '';
  if (season.isRainySeason) {
    reason = `Riego ajustado a cada ${finalDays} día(s) por temporada húmeda y ${sunHours}h de radiación solar.`;
  } else {
    reason = `Riego ajustado a cada ${finalDays} día(s) por temporada seca con ${sunHours}h de exposición directa.`;
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
    climateOverview: 'Prefiere climas templados y frescos. En zonas muy cálidas requiere semisombra para no espigar tempranamente.',
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
      climateAdaptation: 'Clima templado a fresco',
      notes: 'Prefiere tierra suelta y fresca que no se compacte. Riega con frecuencia pero sin encharcar, para que las hojas se mantengan crujientes y dulces. Dale sol de la mañana o semisombra; si el sol del mediodía es muy fuerte, las hojas pueden ponerse amargas.'
    },
    varieties: [
      {
        varietyName: 'Lechuga Batavia',
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
        climateAdaptation: 'Clima templado y fresco',
        notes: 'Tierra suave y con buen abono. Mantén la tierra siempre húmeda con riegos suaves por la mañana. Cosecha cortando las hojas de afuera hacia adentro para que la planta siga produciendo durante semanas.'
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
        climateAdaptation: 'Adaptable a templado y semisombra',
        notes: 'Tierra esponjosa y rica en nutrientes. Le gusta la humedad constante y agradece una capa de hojarasca o paja encima de la tierra para no salpicar sus hojas al regar. Puedes ir sacando hojas sueltas para tus ensaladas.'
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
        climateAdaptation: 'Clima templado',
        notes: 'Tierra fértil con buen drenaje para que el agua no se quede estancada. Riega cada dos días en las horas frescas. Si atas suavemente las hojas unos días antes de cosechar, el corazón quedará más tierno y blanquito.'
      }
    ]
  },
  {
    cropName: 'Tomate',
    climateOverview: 'Exige radiación solar directa (+7h diarias), temperaturas diurnas templadas a cálidas y buena aireación.',
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
      climateAdaptation: 'Clima templado y cálido con pleno sol',
      notes: 'Le encanta el sol directo la mayor parte del día. Riega siempre en la tierra, directo a la raíz, sin mojar las hojas ni las flores para que no le salgan manchas. Ponle una estaca o guía para amarrar las ramas y retira los brotes pequeños que salen en las axilas para que dé frutos grandes.'
    },
    varieties: [
      {
        varietyName: 'Tomate Chonto',
        botanicalName: 'Solanum lycopersicum',
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
        climateAdaptation: 'Templado y cálido',
        notes: 'Necesita tierra profunda y bien alimentada con abono casero. Riega con regularidad pero sin hacer barro. Amárralo a un palo firme a medida que crezca y retira las hojas viejas de abajo para que le entre buen aire y luz a los tomates.'
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
        climateAdaptation: 'Muy adaptable a huertos en maceta y balcones',
        notes: 'Ideal para macetas o cajones en balcones y terrazas. Mantén la humedad constante para que la piel del tomate no se parta. Si siembras albahaca cerca, tus tomates crecerán más felices y protegidos.'
      },
      {
        varietyName: 'Tomate Milano / Larga Vida',
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
        climateAdaptation: 'Templado con buena radiación',
        notes: 'Tierra profunda y fértil. Riega despacio en la base de la planta. Cuando los frutos empiecen a crecer, asegúrate de que no toquen el suelo para mantenerlos limpios y sanos.'
      }
    ]
  },
  {
    cropName: 'Zanahoria',
    climateOverview: 'Hortaliza de raíz que prospera en climas templados a frescos con insolación moderada.',
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
      climateAdaptation: 'Clima fresco y templado',
      notes: 'La clave está en que la tierra sea muy suelta, arenosa y sin piedras ni terrones duros, para que la zanahoria pueda crecer hacia abajo derecha y sin deformarse. Riega con una lluvia suave para mantener la tierra húmeda mientras nace.'
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
        climateAdaptation: 'Climas templados y frescos',
        notes: 'Tierra muy ligera y profunda (al menos 25 cm). Riega cada 3 días con cuidado de no desenterrar las plantitas. Si ves que la parte de arriba de la raíz asoma a la superficie, tápala con un poquito de tierra para que no se ponga verde con el sol.'
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
        climateAdaptation: 'Adaptable a contenedores medianos',
        notes: 'Es más cortita y ancha, por lo que va perfecta en jardineras o cajones que no sean tan hondos. Riega regularmente para que la raíz crezca dulce y jugosa sin cuartearse.'
      }
    ]
  },
  {
    cropName: 'Pimiento',
    climateOverview: 'Planta exigente en calor, sol directo continuo y protección contra vientos helados.',
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
      climateAdaptation: 'Clima cálido y templado',
      notes: 'Le gusta mucho el calor y los rincones soleados. La tierra debe quedar húmeda pero nunca empapada. Si le quitas la primera florecita que sale en el centro, la planta se ramificará con más fuerza y dará más pimientos después.'
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
        climateAdaptation: 'Cálido y templado soleado',
        notes: 'Necesita tierra fértil con buen abono. Riega cada dos días en la base sin dejar que la tierra se seque por completo. Como los pimentones se ponen pesados, ponle una vara de apoyo para que el peso no parta la rama.'
      },
      {
        varietyName: 'Ají Dulce',
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
        climateAdaptation: 'Cálido y templado',
        notes: 'Muy fácil de cuidar y resistente. Le gusta el sol y riegos espaciados cuando la superficie de la tierra empiece a secarse. Puedes cosecharlos verdes o esperar a que maduren a rojo para un sabor más dulce y aromático.'
      }
    ]
  },
  {
    cropName: 'Espinaca',
    climateOverview: 'Cultivo de temporada fresca. Se resiente con el calor extremo que induce floración prematura.',
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
      climateAdaptation: 'Clima fresco y frío con luz difusa',
      notes: 'Le gustan los lugares frescos y con sol suave de la mañana o semisombra. La tierra debe estar rica y siempre húmeda. Corta las hojas grandes exteriores con tijera o con la mano para que el centro siga sacando brotes.'
    },
    varieties: [
      {
        varietyName: 'Espinaca Viroflay',
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
        climateAdaptation: 'Clima fresco',
        notes: 'Tierra suave y con buen abono. Riega poquito pero seguido, sin hacer charcos. Crece rápido y tiene hojas anchas muy suaves para ensaladas o cocinar.'
      }
    ]
  },
  {
    cropName: 'Albahaca',
    climateOverview: 'Hierba aromática que adora el calor, la luz brillante y resguardo de heladas o vientos fríos.',
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
      climateAdaptation: 'Templado y cálido',
      notes: 'Le encanta el sol y estar protegida del frío o corrientes de viento. Riega en la base para no manchar las hojas. Corta o pellizca las puntas de arriba con frecuencia para que no florezca tan rápido y se convierta en un arbusto frondoso lleno de hojas aromáticas.'
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
        climateAdaptation: 'Templado y cálido',
        notes: 'Tierra esponjosa en maceta o bancal. Riega cada 2 días por la mañana. Corta las flores apenas comiencen a asomarse para que las hojas sigan tiernas y sabrosas. Si la pones al lado de los tomates, se ayudan mutuamente.'
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
        climateAdaptation: 'Templado con buena luminosidad',
        notes: 'Necesita bastante luz solar para mantener su llamativo color morado y su aroma especiado. Riega con moderación cada dos días cuando notes la tierra apenas seca.'
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
    return { imageUrl: '/crops/pimiento.svg', imageAlt: 'Pimiento / Ají Dulce' };
  }
  if (lower.includes('espinaca')) {
    return { imageUrl: '/crops/espinaca.svg', imageAlt: 'Espinaca Viroflay' };
  }
  return { imageUrl: '/crops/lechuga.svg', imageAlt: cropName };
}
