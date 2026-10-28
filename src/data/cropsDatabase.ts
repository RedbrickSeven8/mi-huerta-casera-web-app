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
      notes: 'Suelo: Sustrato suelto, aireado y rico en materia orgánica (humus de lombriz al 20% y fibra de coco para retener humedad sin compactar). Riego: Mantén el suelo uniformemente fresco sin encharcar el cuello de la raíz. Cuidados: Excelente asociación con cebollas, zanahorias y rábanos; evita el sol abrasador del mediodía para prevenir hojas amargas.'
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
        notes: 'Suelo: Requiere sustrato fértil con buen drenaje, pH entre 6.0 y 6.8 y aporte continuo de nitrógeno orgánico. Riego: Riegos matinales ligeros y constantes. Cuidados: Forma cogollos rizados crujientes; cosecha cortando las hojas basales exteriores para extender la producción varias semanas.'
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
        notes: 'Suelo: Tierra mullida y esponjosa enriquecida con compost maduro. Riego: Humedad estable; un acolchado de paja fina previene salpicaduras en las hojas tiernas. Cuidados: Gran resistencia al espigado; cosechar hoja a hoja según necesidad culinaria.'
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
        notes: 'Suelo: Tolera sustratos más densos siempre que tengan buen drenaje y nutrientes balanceados. Riego: Profundo cada 2 días en horas frescas. Cuidados: De porte erguido y nervadura crujiente; atar las hojas suavemente 5 días antes de cosechar blanquea y suaviza el cogollo central.'
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
      notes: 'Suelo: Profundo, rico en compost y con aporte de calcio y fósforo para evitar podredumbre apical. Riego: Siempre al pie de la planta en la base del tallo; jamás mojar hojas ni flores para prevenir hongos como el mildiu y tizón. Cuidados: Entutorar desde temprano y podar los chupones axilares para concentrar la energía en frutos grandes.'
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
        notes: 'Suelo: Sustrato nutritivo mezclado con humus de lombriz y ceniza vegetal rica en potasio. Riego: Regular y profundo sin encharcamientos; reducir el agua en maduración para concentrar azúcares. Cuidados: Fruto ovalado y carnoso; tutorado firme con cañas o hilo y deshoje inferior progresivo para maximizar ventilación.'
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
        notes: 'Suelo: Requiere macetas de mínimo 15-20 litros con sustrato liviano y perlita. Riego: Constante cada 2 días; cambios bruscos de humedad pueden rajar la piel del fruto. Cuidados: Altísima productividad en racimos; asociación benéfica inmediata con albahaca para repeler plagas y potenciar sabor.'
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
        notes: 'Suelo: Requiere tierra profunda y fértil con buen contenido de materia orgánica madura. Riego: Riego en goteo o localizado en la base. Cuidados: Frutos redondeados de pulpa firme y excelente conservación poscosecha; acolchado en la base para aislar frutos bajos de la humedad del suelo.'
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
      notes: 'Suelo: Clave fundamental: sustrato arenoso, sumamente suelto y libre de piedras o terrones duros; de lo contrario las raíces se bifurcan y deforman. Profundidad mínima de 25-30 cm. Riego: Suave y regular en forma de lluvia fina; no dejar que la capa superior se reseque durante la germinación. Cuidados: Aclareo temprano dejando 5 cm entre plantas.'
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
        notes: 'Suelo: Tierra suelta con arena de río lavada y compost bien descompuesto; evitar estiércoles frescos que provocan ramificación de la raíz. Riego: Riego cada 3 días manteniendo humedad homogénea. Cuidados: Raíces cilíndricas dulces de punta redondeada; aporcar ligeramente para cubrir el hombro de la raíz y evitar que tome color verdoso por el sol.'
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
        notes: 'Suelo: Ideal para bancales o jardineras caseras con menor profundidad, gracias a su forma cónica corta y ancha. Riego: Regular, evitando tanto la sequía prolongada como el encharcamiento que pudre el ápice. Cuidados: Excelente germinación; cosechar cuando la raíz alcance 3-4 cm de grosor superior.'
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
      notes: 'Suelo: Sustrato cálido, liviano, rico en humus y con drenaje impecable para evitar hongos en el cuello radicular. Riego: Moderado y constante; no tolera saturación de agua. Cuidados: Despuntar la primera flor en la cruz del tallo estimula la ramificación lateral y una mayor floración posterior.'
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
        notes: 'Suelo: Muy demandante de materia orgánica madura, fósforo y magnesio. Riego: Cada 2 días en la base; el déficit hídrico causa caída de flores. Cuidados: Frutos gruesos de pared carnosa; colocar tutores de apoyo porque el peso de los pimientos puede quebrar las ramas tiernas.'
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
        notes: 'Suelo: Sustrato bien aireado con mezcla de tierra negra, compost y perlita. Riego: Riegos regulares dejando secar levemente la superficie entre aplicaciones. Cuidados: Gran rusticidad y resistencia natural contra plagas; cosechar en verde o cuando madure al rojo brillante para mayor dulzor aromático.'
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
      notes: 'Suelo: Sustrato rico en nitrógeno orgánico, fresco y húmedo pero con drenaje ágil. Riego: Frecuente y suave para conservar la ternura de las hojas. Cuidados: Ubicar en áreas del huerto que reciban sol de mañana o semisombra fresca; cosechar las hojas exteriores de forma continua.'
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
        notes: 'Suelo: Tierra mullida con compost bien digerido. Riego: Diario en cantidades moderadas evitando encharcamientos. Cuidados: Hojas gigantes muy tiernas; excelente para cultivo denso en jardineras o mesas de cultivo.'
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
      notes: 'Suelo: Sustrato fértil, poroso y bien oxigenado con compost o humus. Riego: Regular en la base sin tocar las hojas para evitar manchas negras; no dejar que la planta se marchite. Cuidados: Podar las puntas superiores regularmente (poda apical) para promover un arbusto denso y lleno de brotes nuevos.'
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
        notes: 'Suelo: Mezcla equilibrada de sustrato universal con perlita y humus. Riego: Cada 2 días en horas de la mañana. Cuidados: Cortar espigas florales apenas aparezcan para evitar que las hojas se vuelvan leñosas y amargas; asociar junto a tomates para repeler mosca blanca y pulgones.'
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
        notes: 'Suelo: Tierra ligera con buen drenaje. Riego: Riegos moderados cada 2 días. Cuidados: Requiere buena radiación solar para fijar su intenso color púrpura y aroma especiado; excelente en macetas de alféizar o terrazas.'
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
