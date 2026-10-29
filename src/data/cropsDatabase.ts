import type { CropStage, PlantCategory } from '../types/huerta';

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
  category?: PlantCategory;
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
    "cropName": "Tomate",
    "climateOverview": "Clima templado a cálido (18-28°C). Requiere alta radiación solar directa, tutorado y riego regular en la base sin mojar el follaje.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Solanum lycopersicum L.",
      "stageDaysToHarvest": {
        "Semilla": 105,
        "Plántula": 75,
        "Crecimiento": 45,
        "Floración": 25,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 70,
      "recommendedBed": "",
      "climateAdaptation": "Templado a cálido",
      "notes": "Requiere suelo rico en materia orgánica, buen drenaje y exposición a pleno sol. Entutorar a medida que crezca."
    },
    "varieties": [
      {
        "varietyName": "Chonto",
        "botanicalName": "Solanum lycopersicum var. chonto",
        "stageDaysToHarvest": {
          "Semilla": 110,
          "Plántula": 80,
          "Crecimiento": 50,
          "Floración": 28,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 72,
        "recommendedBed": "",
        "climateAdaptation": "Templado (18-24°C)",
        "notes": "El clásico tomate de guiso colombiano. Fruto ovalado y pulposo, de crecimiento indeterminado. Requiere poda de chupones y tutorado firme."
      },
      {
        "varietyName": "Cherry",
        "botanicalName": "Solanum lycopersicum var. cerasiforme",
        "stageDaysToHarvest": {
          "Semilla": 85,
          "Plántula": 60,
          "Crecimiento": 35,
          "Floración": 18,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 68,
        "recommendedBed": "",
        "climateAdaptation": "Cálido y templado",
        "notes": "Ideal para macetas y huertos urbanos. Racimos abundantes de frutos dulces pequeños. Cosecha escalonada y muy productiva."
      },
      {
        "varietyName": "Milano",
        "botanicalName": "Solanum lycopersicum var. milano",
        "stageDaysToHarvest": {
          "Semilla": 120,
          "Plántula": 85,
          "Crecimiento": 55,
          "Floración": 30,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 8.0,
        "recommendedMoisturePercent": 72,
        "recommendedBed": "",
        "climateAdaptation": "Templado",
        "notes": "Tomate de ensalada grande, carnoso y jugoso. Precisa abono rico en potasio y calcio para evitar podredumbre apical."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Cilantro",
    "climateOverview": "Clima frío moderado a templado (14-22°C). Crecimiento rápido; prefiere semisombra en zonas cálidas para evitar floración prematura.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Coriandrum sativum L.",
      "stageDaysToHarvest": {
        "Semilla": 50,
        "Plántula": 35,
        "Crecimiento": 20,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 5.5,
      "recommendedMoisturePercent": 68,
      "recommendedBed": "",
      "climateAdaptation": "Frío a templado",
      "notes": "Suelo suelto y fresco. Riego constante y ligero. Cosechar hojas exteriores o la mata completa antes de florecer."
    },
    "varieties": [
      {
        "varietyName": "Patichoque",
        "botanicalName": "Coriandrum sativum 'Patichoque'",
        "stageDaysToHarvest": {
          "Semilla": 45,
          "Plántula": 30,
          "Crecimiento": 18,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 5.0,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "",
        "climateAdaptation": "Clima frío y sabana",
        "notes": "Tallo grueso y follaje tupido de aroma penetrante muy apreciado en Colombia. Alta tolerancia al frío y crecimiento vigoroso."
      },
      {
        "varietyName": "Criollo",
        "botanicalName": "Coriandrum sativum var. microcarpum",
        "stageDaysToHarvest": {
          "Semilla": 50,
          "Plántula": 35,
          "Crecimiento": 20,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 5.5,
        "recommendedMoisturePercent": 68,
        "recommendedBed": "",
        "climateAdaptation": "Templado y frío",
        "notes": "Variedad tradicional colombiana de semilla pequeña e intenso sabor. Riegos frecuentes para mantener el follaje tierno y verde."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Lechuga",
    "climateOverview": "Clima frío y templado (12-20°C). Riego regular para evitar sabor amargo. En climas cálidos situar en semisombra fresca.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Lactuca sativa L.",
      "stageDaysToHarvest": {
        "Semilla": 65,
        "Plántula": 45,
        "Crecimiento": 25,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 5.5,
      "recommendedMoisturePercent": 75,
      "recommendedBed": "",
      "climateAdaptation": "Frío a templado",
      "notes": "Sustrato mullido y drenante. Mantener humedad estable sin encharcar para favorecer hojas tiernas y crujientes."
    },
    "varieties": [
      {
        "varietyName": "Batavia",
        "botanicalName": "Lactuca sativa var. capitata 'Batavia'",
        "stageDaysToHarvest": {
          "Semilla": 65,
          "Plántula": 45,
          "Crecimiento": 25,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 5.5,
        "recommendedMoisturePercent": 75,
        "recommendedBed": "",
        "climateAdaptation": "Frío y templado",
        "notes": "Cogollo semiabierto, hojas onduladas muy crujientes. Excelente adaptación a huertos urbanos y mesas de cultivo."
      },
      {
        "varietyName": "Crespa verde",
        "botanicalName": "Lactuca sativa var. crispa 'Verde'",
        "stageDaysToHarvest": {
          "Semilla": 55,
          "Plántula": 38,
          "Crecimiento": 20,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 5.0,
        "recommendedMoisturePercent": 72,
        "recommendedBed": "",
        "climateAdaptation": "Templado y frío",
        "notes": "Hojas rizadas de corte continuo (puedes cosechar hoja por hoja). Rápida producción y textura ligera."
      },
      {
        "varietyName": "Crespa morada",
        "botanicalName": "Lactuca sativa var. crispa 'Lollo Rossa'",
        "stageDaysToHarvest": {
          "Semilla": 58,
          "Plántula": 40,
          "Crecimiento": 22,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 72,
        "recommendedBed": "",
        "climateAdaptation": "Templado con buena luz",
        "notes": "Hojas con tonalidades rojizas y moradas ricas en antocianinas. Requiere sol suave para fijar su intenso color pigmentado."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Cebolla de rama / junca",
    "climateOverview": "Clima frío y templado (13-22°C). Muy rústica y perenne. Se multiplica fácilmente por hijuelos o semilla.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Allium fistulosum L.",
      "stageDaysToHarvest": {
        "Semilla": 110,
        "Plántula": 75,
        "Crecimiento": 40,
        "Floración": 20,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 6.0,
      "recommendedMoisturePercent": 65,
      "recommendedBed": "",
      "climateAdaptation": "Frío a templado",
      "notes": "Aporcar periódicamente con tierra para blanquear los tallos inferiores. Cosechar descalzando tallos laterales."
    },
    "varieties": [
      {
        "varietyName": "Criolla",
        "botanicalName": "Allium fistulosum 'Criolla'",
        "stageDaysToHarvest": {
          "Semilla": 105,
          "Plántula": 70,
          "Crecimiento": 38,
          "Floración": 18,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "",
        "climateAdaptation": "Clima medio y frío",
        "notes": "Tallos verdes tiernos con base blanca aromática. Indispensable en la cocina colombiana para hogao y caldos."
      },
      {
        "varietyName": "Pastusa",
        "botanicalName": "Allium fistulosum 'Pastusa'",
        "stageDaysToHarvest": {
          "Semilla": 120,
          "Plántula": 80,
          "Crecimiento": 45,
          "Floración": 20,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "",
        "climateAdaptation": "Clima frío de altura (Nariño/Boyacá)",
        "notes": "Tallo grueso, macizo y vigoroso. Alta resistencia a bajas temperaturas y heladas de sabana."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Cebolla cabezona",
    "climateOverview": "Clima templado a frío (14-24°C). Precisa sustratos sueltos no pedregosos y reducción de riego al madurar el bulbo.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Allium cepa L.",
      "stageDaysToHarvest": {
        "Semilla": 140,
        "Plántula": 100,
        "Crecimiento": 60,
        "Floración": 30,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 62,
      "recommendedBed": "",
      "climateAdaptation": "Templado",
      "notes": "Requiere pleno sol y suelo sin encharcamientos. Suspender riegos 10 días antes de cosechar para curar el bulbo."
    },
    "varieties": [
      {
        "varietyName": "Roja ocañera",
        "botanicalName": "Allium cepa var. aggregatum 'Ocañera'",
        "stageDaysToHarvest": {
          "Semilla": 130,
          "Plántula": 90,
          "Crecimiento": 55,
          "Floración": 25,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "",
        "climateAdaptation": "Templado y seco (Norte de Santander)",
        "notes": "Bulbos medianos a pequeños de color púrpura rojizo intenso y sabor dulce característico. Denominación tradicional en Colombia."
      },
      {
        "varietyName": "Amarilla",
        "botanicalName": "Allium cepa 'Yellow Sweet Spanish'",
        "stageDaysToHarvest": {
          "Semilla": 140,
          "Plántula": 100,
          "Crecimiento": 60,
          "Floración": 30,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 62,
        "recommendedBed": "",
        "climateAdaptation": "Templado",
        "notes": "Bulbo esférico de cáscara cobriza dorada y pulpa compacta. Gran capacidad de conservación poscosecha."
      },
      {
        "varietyName": "Blanca",
        "botanicalName": "Allium cepa 'White Lisbon / White Sweet'",
        "stageDaysToHarvest": {
          "Semilla": 135,
          "Plántula": 95,
          "Crecimiento": 58,
          "Floración": 28,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 62,
        "recommendedBed": "",
        "climateAdaptation": "Templado y frío",
        "notes": "Bulbo blanco brillante de sabor suave y crujiente. Muy buscada para ensaladas frescas y ceviches."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Zanahoria",
    "climateOverview": "Clima frío y templado (12-20°C). Indispensable sustrato profundo, arenoso y sin piedras para que la raíz crezca recta.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Daucus carota L.",
      "stageDaysToHarvest": {
        "Semilla": 95,
        "Plántula": 70,
        "Crecimiento": 40,
        "Floración": 20,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 6.5,
      "recommendedMoisturePercent": 68,
      "recommendedBed": "",
      "climateAdaptation": "Frío a templado",
      "notes": "Sembrar en siembra directa; no tolera trasplante. Ralear cuando las plántulas tengan 5 cm de altura."
    },
    "varieties": [
      {
        "varietyName": "Chantenay",
        "botanicalName": "Daucus carota 'Chantenay Red Cored'",
        "stageDaysToHarvest": {
          "Semilla": 90,
          "Plántula": 65,
          "Crecimiento": 38,
          "Floración": 18,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 68,
        "recommendedBed": "",
        "climateAdaptation": "Frío y templado",
        "notes": "Raíz cónica y gruesa con punta redondeada. Tolera mejor los suelos ligeramente pesados o bancales de profundidad media."
      },
      {
        "varietyName": "Nantes",
        "botanicalName": "Daucus carota 'Nantesa'",
        "stageDaysToHarvest": {
          "Semilla": 95,
          "Plántula": 70,
          "Crecimiento": 40,
          "Floración": 20,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "",
        "climateAdaptation": "Frío",
        "notes": "Raíz cilíndrica lisa, de corazón fino y sabor muy dulce. Requiere suelo suelto y arenoso con buen mantillo."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Rábano",
    "climateOverview": "Clima frío a templado (14-22°C). Crecimiento ultrarrápido (3-4 semanas). Ideal para iniciar en huertos caseros.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Raphanus sativus L.",
      "stageDaysToHarvest": {
        "Semilla": 32,
        "Plántula": 22,
        "Crecimiento": 12,
        "Floración": 5,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 5.5,
      "recommendedMoisturePercent": 72,
      "recommendedBed": "",
      "climateAdaptation": "Frío a templado",
      "notes": "Mantener humedad constante; la falta de agua los vuelve excesivamente picantes o huecos por dentro."
    },
    "varieties": [
      {
        "varietyName": "Rojo redondo",
        "botanicalName": "Raphanus sativus 'Crimson Giant / Red Round'",
        "stageDaysToHarvest": {
          "Semilla": 30,
          "Plántula": 20,
          "Crecimiento": 10,
          "Floración": 5,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 5.5,
        "recommendedMoisturePercent": 72,
        "recommendedBed": "",
        "climateAdaptation": "Frío y templado",
        "notes": "Tubérculo globular de piel escarlata y carne blanca crujiente. Cosecha a los 25-30 días tras la siembra."
      },
      {
        "varietyName": "Champion",
        "botanicalName": "Raphanus sativus 'Champion'",
        "stageDaysToHarvest": {
          "Semilla": 32,
          "Plántula": 22,
          "Crecimiento": 12,
          "Floración": 5,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "",
        "climateAdaptation": "Frío y templado",
        "notes": "Mantiene su textura firme sin ponerse fofo incluso cuando alcanza mayor tamaño. Resistente a temperaturas bajas."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Acelga",
    "climateOverview": "Amplia adaptación climática (10-24°C). Rústica y productiva; resiste tanto frío como calor moderado.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Beta vulgaris subsp. vulgaris",
      "stageDaysToHarvest": {
        "Semilla": 65,
        "Plántula": 45,
        "Crecimiento": 25,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 6.0,
      "recommendedMoisturePercent": 72,
      "recommendedBed": "",
      "climateAdaptation": "Frío a templado",
      "notes": "Cosechar hojas exteriores desprendiéndolas por la base; la planta continuará produciendo durante meses."
    },
    "varieties": [
      {
        "varietyName": "Verde de penca blanca",
        "botanicalName": "Beta vulgaris 'Verde a Penca Ancha Blanca'",
        "stageDaysToHarvest": {
          "Semilla": 65,
          "Plántula": 45,
          "Crecimiento": 25,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 72,
        "recommendedBed": "",
        "climateAdaptation": "Frío y templado",
        "notes": "Hojas amplias verde oscuro con pencas gruesas, carnosas y tiernas. Excelente valor nutricional en sopas y salteados."
      },
      {
        "varietyName": "Fordhook Giant",
        "botanicalName": "Beta vulgaris 'Fordhook Giant'",
        "stageDaysToHarvest": {
          "Semilla": 68,
          "Plántula": 48,
          "Crecimiento": 26,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 72,
        "recommendedBed": "",
        "climateAdaptation": "Frío y templado",
        "notes": "Variedad gigante de hojas abullonadas y pencas muy anchas de color marfil. Gran rendimiento por planta."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Espinaca",
    "climateOverview": "Clima frío a templado frío (10-18°C). Prefiere sombra parcial si la temperatura sube para no espigar.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Spinacia oleracea L.",
      "stageDaysToHarvest": {
        "Semilla": 52,
        "Plántula": 36,
        "Crecimiento": 20,
        "Floración": 8,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 5.0,
      "recommendedMoisturePercent": 74,
      "recommendedBed": "",
      "climateAdaptation": "Frío",
      "notes": "Suelo húmedo y rico en nitrógeno. Cosecha continua de hojas grandes y tiernas."
    },
    "varieties": [
      {
        "varietyName": "Viroflay",
        "botanicalName": "Spinacia oleracea 'Monstrueux de Viroflay'",
        "stageDaysToHarvest": {
          "Semilla": 50,
          "Plántula": 35,
          "Crecimiento": 18,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 5.0,
        "recommendedMoisturePercent": 74,
        "recommendedBed": "",
        "climateAdaptation": "Frío y sabana",
        "notes": "Hojas lisas muy anchas y tiernas de crecimiento vigoroso. Sabor suave y excelente rendimiento en climas frescos."
      },
      {
        "varietyName": "Criolla",
        "botanicalName": "Spinacia oleracea 'Criolla'",
        "stageDaysToHarvest": {
          "Semilla": 52,
          "Plántula": 36,
          "Crecimiento": 20,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 5.5,
        "recommendedMoisturePercent": 72,
        "recommendedBed": "",
        "climateAdaptation": "Frío y templado",
        "notes": "Espinaca adaptada a pisos térmicos andinos. Follaje verde intenso resistente a cambios leves de temperatura."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Fríjol",
    "climateOverview": "Clima templado a frío moderado (16-24°C). Fija nitrógeno al suelo. Las variedades volubles requieren tutores altos.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Phaseolus vulgaris L.",
      "stageDaysToHarvest": {
        "Semilla": 100,
        "Plántula": 75,
        "Crecimiento": 48,
        "Floración": 25,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 65,
      "recommendedBed": "",
      "climateAdaptation": "Templado",
      "notes": "Sembrar en siembra directa. Proporcionar espalderas o varas de bambú de 1.8 a 2 m para guiar las guías."
    },
    "varieties": [
      {
        "varietyName": "Cargamanto (blanco y rojo)",
        "botanicalName": "Phaseolus vulgaris 'Cargamanto'",
        "stageDaysToHarvest": {
          "Semilla": 120,
          "Plántula": 90,
          "Crecimiento": 58,
          "Floración": 30,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "",
        "climateAdaptation": "Templado y frío andino (Antioquia/Eje Cafetero)",
        "notes": "El grano insignia colombiano. Planta trepadora vigorosa que produce vainas grandes con granos cremosos de alto calibre."
      },
      {
        "varietyName": "Bola roja",
        "botanicalName": "Phaseolus vulgaris 'Bola Roja'",
        "stageDaysToHarvest": {
          "Semilla": 110,
          "Plántula": 80,
          "Crecimiento": 50,
          "Floración": 25,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "",
        "climateAdaptation": "Frío y templado (Cundinamarca/Boyacá)",
        "notes": "Grano redondeado y rojo brillante. Excelente adaptación a valles interandinos y platos tradicionales."
      },
      {
        "varietyName": "Calima",
        "botanicalName": "Phaseolus vulgaris 'Calima'",
        "stageDaysToHarvest": {
          "Semilla": 80,
          "Plántula": 60,
          "Crecimiento": 38,
          "Floración": 18,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 62,
        "recommendedBed": "",
        "climateAdaptation": "Cálido y templado",
        "notes": "Variedad de porte arbustivo (determinado) que no requiere tutorado alto. Ciclo más corto y grano moteado."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Habichuela",
    "climateOverview": "Clima templado a cálido (18-26°C). Cosechar las vainas tiernas antes de que se marque el grano interior.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Phaseolus vulgaris var. vulgaris",
      "stageDaysToHarvest": {
        "Semilla": 68,
        "Plántula": 48,
        "Crecimiento": 28,
        "Floración": 14,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 6.5,
      "recommendedMoisturePercent": 68,
      "recommendedBed": "",
      "climateAdaptation": "Templado a cálido",
      "notes": "Requiere tutorado en espaldera y riego constante para vainas rectas, carnosas y sin hebra."
    },
    "varieties": [
      {
        "varietyName": "Blue Lake",
        "botanicalName": "Phaseolus vulgaris 'Blue Lake Trepadora'",
        "stageDaysToHarvest": {
          "Semilla": 65,
          "Plántula": 45,
          "Crecimiento": 26,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "",
        "climateAdaptation": "Templado y cálido",
        "notes": "Vainas cilíndricas verde intenso, tiernas y sin hebras. Muy productiva durante varias semanas de cosecha escalonada."
      },
      {
        "varietyName": "Tijereta",
        "botanicalName": "Phaseolus vulgaris 'Tijereta'",
        "stageDaysToHarvest": {
          "Semilla": 70,
          "Plántula": 50,
          "Crecimiento": 30,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 68,
        "recommendedBed": "",
        "climateAdaptation": "Templado",
        "notes": "Variedad trepadora tradicional colombiana de vaina larga y recta, muy tierna para ensaladas cocidas y guisos."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Arveja",
    "climateOverview": "Clima frío andino (12-18°C). Prefiere temperaturas frescas; no tolera calores intensos ni sequías.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Pisum sativum L.",
      "stageDaysToHarvest": {
        "Semilla": 90,
        "Plántula": 65,
        "Crecimiento": 40,
        "Floración": 20,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 6.0,
      "recommendedMoisturePercent": 68,
      "recommendedBed": "",
      "climateAdaptation": "Frío",
      "notes": "Tutorar con malla o ramas secas para que los zarcillos trepen y las vainas no toquen el suelo."
    },
    "varieties": [
      {
        "varietyName": "Santa Isabel",
        "botanicalName": "Pisum sativum 'Santa Isabel'",
        "stageDaysToHarvest": {
          "Semilla": 95,
          "Plántula": 70,
          "Crecimiento": 42,
          "Floración": 22,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 68,
        "recommendedBed": "",
        "climateAdaptation": "Frío (Altiplano cundiboyacense)",
        "notes": "Vaina grande con 7-9 granos dulces. La variedad más cultivada en las zonas altas colombianas."
      },
      {
        "varietyName": "San Isidro",
        "botanicalName": "Pisum sativum 'San Isidro'",
        "stageDaysToHarvest": {
          "Semilla": 88,
          "Plántula": 62,
          "Crecimiento": 38,
          "Floración": 18,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 68,
        "recommendedBed": "",
        "climateAdaptation": "Frío y templado frío",
        "notes": "Vainas tiernas de maduración uniforme. Alta rusticidad frente a bajas temperaturas y rocíos matutinos."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Pimentón y ají",
    "climateOverview": "Clima cálido a templado cálido (20-30°C). Exigente en calor y sol directo. Riego regular sin saturar raíces.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Capsicum annuum / chinense L.",
      "stageDaysToHarvest": {
        "Semilla": 110,
        "Plántula": 80,
        "Crecimiento": 50,
        "Floración": 28,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 7.5,
      "recommendedMoisturePercent": 68,
      "recommendedBed": "",
      "climateAdaptation": "Cálido y templado",
      "notes": "Sembrar en semillero resguardado. Trasplantar con buen compost y proteger de vientos fuertes."
    },
    "varieties": [
      {
        "varietyName": "Pimentón Chino",
        "botanicalName": "Capsicum annuum 'Chino / California Wonder'",
        "stageDaysToHarvest": {
          "Semilla": 115,
          "Plántula": 85,
          "Crecimiento": 52,
          "Floración": 28,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "",
        "climateAdaptation": "Cálido y templado",
        "notes": "Fruto cuadrado de cuatro lóbulos, paredes gruesas y carnosas. Pasa de verde a rojo brillante al madurar."
      },
      {
        "varietyName": "Ají dulce criollo",
        "botanicalName": "Capsicum chinense 'Ají Dulce'",
        "stageDaysToHarvest": {
          "Semilla": 105,
          "Plántula": 75,
          "Crecimiento": 45,
          "Floración": 24,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 68,
        "recommendedBed": "",
        "climateAdaptation": "Cálido y templado",
        "notes": "Fruto aromático de forma acampanada con intenso aroma a ají pero sin picor. Fundamental para sofritos y guisos colombianos."
      },
      {
        "varietyName": "Ají cayena",
        "botanicalName": "Capsicum annuum var. acuminatum 'Cayenne'",
        "stageDaysToHarvest": {
          "Semilla": 100,
          "Plántula": 70,
          "Crecimiento": 42,
          "Floración": 22,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 8.0,
        "recommendedMoisturePercent": 64,
        "recommendedBed": "",
        "climateAdaptation": "Cálido y templado",
        "notes": "Frutos alargados, delgados y picantes. Excelente para secar, moler o preparar salsas picantes caseras."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Pepino cohombro",
    "climateOverview": "Clima templado a cálido (20-28°C). Planta rastrera o trepadora con alto requerimiento hídrico durante floración y cuaje.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Cucumis sativus L.",
      "stageDaysToHarvest": {
        "Semilla": 65,
        "Plántula": 45,
        "Crecimiento": 26,
        "Floración": 12,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 75,
      "recommendedBed": "",
      "climateAdaptation": "Templado a cálido",
      "notes": "El entutorado mantiene los frutos limpios, rectos y previene plagas de suelo. Regar con regularidad para evitar amargor."
    },
    "varieties": [
      {
        "varietyName": "Poinsett",
        "botanicalName": "Cucumis sativus 'Poinsett 76'",
        "stageDaysToHarvest": {
          "Semilla": 65,
          "Plántula": 45,
          "Crecimiento": 26,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 75,
        "recommendedBed": "",
        "climateAdaptation": "Cálido y templado",
        "notes": "Frutos cilíndricos verde oscuro con excelente tolerancia al mildiu y oídio. Pulpa crujiente y refrescante."
      },
      {
        "varietyName": "Ashley",
        "botanicalName": "Cucumis sativus 'Ashley'",
        "stageDaysToHarvest": {
          "Semilla": 62,
          "Plántula": 42,
          "Crecimiento": 24,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 75,
        "recommendedBed": "",
        "climateAdaptation": "Cálido húmedo y templado",
        "notes": "Especialmente resistente a hongos foliares en temporadas lluviosas. Frutos medianos de piel fina."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Calabacín / Zucchini",
    "climateOverview": "Clima templado y cálido (18-26°C). Planta de porte abierto y gran vigor; requiere espacio amplio y sol abundante.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Cucurbita pepo L.",
      "stageDaysToHarvest": {
        "Semilla": 55,
        "Plántula": 38,
        "Crecimiento": 20,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 72,
      "recommendedBed": "",
      "climateAdaptation": "Templado a cálido",
      "notes": "Cosechar cuando los frutos alcancen 15-20 cm de longitud para estimular la floración continua."
    },
    "varieties": [
      {
        "varietyName": "Black Beauty (verde)",
        "botanicalName": "Cucurbita pepo 'Black Beauty'",
        "stageDaysToHarvest": {
          "Semilla": 52,
          "Plántula": 35,
          "Crecimiento": 18,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 72,
        "recommendedBed": "",
        "climateAdaptation": "Templado y cálido",
        "notes": "Fruto cilíndrico alargado verde oscuro brillante. Muy prolífico y de carne tierna y sabrosa."
      },
      {
        "varietyName": "Zucchini amarillo",
        "botanicalName": "Cucurbita pepo 'Golden Zucchini'",
        "stageDaysToHarvest": {
          "Semilla": 55,
          "Plántula": 38,
          "Crecimiento": 20,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "",
        "climateAdaptation": "Templado con buena radiación",
        "notes": "Piel amarilla dorada y sabor suave ligeramente dulce. Atractivo contraste visual en el huerto y en la mesa."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Remolacha",
    "climateOverview": "Clima frío y templado (13-20°C). Raíz dulce que aprovecha suelos ricos en potasio y materia orgánica descompuesta.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Beta vulgaris subsp. vulgaris conditiva",
      "stageDaysToHarvest": {
        "Semilla": 70,
        "Plántula": 50,
        "Crecimiento": 28,
        "Floración": 14,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 6.0,
      "recommendedMoisturePercent": 70,
      "recommendedBed": "",
      "climateAdaptation": "Frío a templado",
      "notes": "Tanto la raíz como las hojas jóvenes son comestibles. Ralear temprano para permitir el engrosamiento del bulbo."
    },
    "varieties": [
      {
        "varietyName": "Early Wonder",
        "botanicalName": "Beta vulgaris 'Early Wonder Tall Top'",
        "stageDaysToHarvest": {
          "Semilla": 65,
          "Plántula": 45,
          "Crecimiento": 25,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "",
        "climateAdaptation": "Frío y templado",
        "notes": "Maduración precoz con raíces globosas semi-aplanadas y follaje vigoroso de hojas tiernas."
      },
      {
        "varietyName": "Detroit Dark Red",
        "botanicalName": "Beta vulgaris 'Detroit Dark Red'",
        "stageDaysToHarvest": {
          "Semilla": 72,
          "Plántula": 52,
          "Crecimiento": 30,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "",
        "climateAdaptation": "Frío andino",
        "notes": "Forma esférica perfecta, color rojo rubí intenso y pulpa dulce sin anillos marcados. Ideal para conservación."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Papa criolla",
    "climateOverview": "Clima frío de montaña (14-18°C, 2.000 a 2.800 msnm). Tubérculo andino ancestral de ciclo corto y rápida cocción.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Solanum tuberosum Grupo Phureja",
      "stageDaysToHarvest": {
        "Semilla": 115,
        "Plántula": 85,
        "Crecimiento": 50,
        "Floración": 25,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 6.5,
      "recommendedMoisturePercent": 65,
      "recommendedBed": "",
      "climateAdaptation": "Frío de altura",
      "notes": "Aporcar con tierra suelta 2 veces durante el crecimiento para proteger los tubérculos de la luz y estimular nuevos estolones."
    },
    "varieties": [
      {
        "varietyName": "Yema de huevo",
        "botanicalName": "Solanum phureja Juz. & Buk. 'Yema de Huevo'",
        "stageDaysToHarvest": {
          "Semilla": 110,
          "Plántula": 80,
          "Crecimiento": 48,
          "Floración": 22,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "",
        "climateAdaptation": "Frío (Cundinamarca, Boyacá, Nariño)",
        "notes": "Tubérculo pequeño redondeado con piel y pulpa amarillo dorado intenso. Sabor mantecoso único del ajiaco colombiano."
      },
      {
        "varietyName": "Criolla Colombia",
        "botanicalName": "Solanum phureja 'Criolla Colombia'",
        "stageDaysToHarvest": {
          "Semilla": 115,
          "Plántula": 85,
          "Crecimiento": 50,
          "Floración": 25,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "",
        "climateAdaptation": "Frío andino",
        "notes": "Variedad mejorada de alto rendimiento y uniformidad de tubérculos. Buena resistencia al tizón tardío."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Fresa",
    "climateOverview": "Clima frío moderado a templado (12-22°C). Planta perenne de estolones; prefiere acolchado orgánico o plástico para evitar hongos en el fruto.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Fragaria × ananassa (Duchesne) Duchesne",
      "stageDaysToHarvest": {
        "Semilla": 100,
        "Plántula": 65,
        "Crecimiento": 35,
        "Floración": 18,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 6.5,
      "recommendedMoisturePercent": 70,
      "recommendedBed": "",
      "climateAdaptation": "Frío a templado",
      "notes": "Riego por goteo o a nivel de sustrato evitando mojar corona y frutos. Retirar estolones sobrantes para mayor tamaño de fruta."
    },
    "varieties": [
      {
        "varietyName": "Albión",
        "botanicalName": "Fragaria × ananassa 'Albion'",
        "stageDaysToHarvest": {
          "Semilla": 95,
          "Plántula": 60,
          "Crecimiento": 32,
          "Floración": 16,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "",
        "climateAdaptation": "Frío y templado de altura",
        "notes": "Variedad de día neutro de fruto cónico grande, rojo brillante y muy dulce. Excelente resistencia y firmeza."
      },
      {
        "varietyName": "Monterrey",
        "botanicalName": "Fragaria × ananassa 'Monterey'",
        "stageDaysToHarvest": {
          "Semilla": 95,
          "Plántula": 62,
          "Crecimiento": 34,
          "Floración": 18,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "",
        "climateAdaptation": "Frío moderado",
        "notes": "Fruto grande con aroma sobresaliente y sabor dulce equilibrado. Planta vigorosa con floración continua."
      },
      {
        "varietyName": "Ventana",
        "botanicalName": "Fragaria × ananassa 'Ventana'",
        "stageDaysToHarvest": {
          "Semilla": 90,
          "Plántula": 58,
          "Crecimiento": 30,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 72,
        "recommendedBed": "",
        "climateAdaptation": "Templado y frío",
        "notes": "Producción precoz al inicio de temporada. Fruto simétrico de color rojo medio y pulpa jugosa."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Albahaca",
    "climateOverview": "Clima templado a cálido (18-28°C). Sensible a heladas y fríos intensos. Fomenta el crecimiento y aroma con despunte de flores.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Ocimum basilicum L.",
      "stageDaysToHarvest": {
        "Semilla": 55,
        "Plántula": 38,
        "Crecimiento": 20,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 6.5,
      "recommendedMoisturePercent": 68,
      "recommendedBed": "",
      "climateAdaptation": "Templado a cálido",
      "notes": "Sustrato suelto y aireado. Cortar las espigas florales al asomar para conservar hojas tiernas y sabrosas."
    },
    "varieties": [
      {
        "varietyName": "Genovesa",
        "botanicalName": "Ocimum basilicum 'Genovese'",
        "stageDaysToHarvest": {
          "Semilla": 50,
          "Plántula": 35,
          "Crecimiento": 18,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 68,
        "recommendedBed": "",
        "climateAdaptation": "Templado a cálido",
        "notes": "La albahaca clásica de pesto y salsas. Hojas grandes abombadas verde brillante con aroma dulce y penetrante."
      },
      {
        "varietyName": "Morada",
        "botanicalName": "Ocimum basilicum var. purpurascens 'Dark Opal'",
        "stageDaysToHarvest": {
          "Semilla": 55,
          "Plántula": 38,
          "Crecimiento": 20,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 66,
        "recommendedBed": "",
        "climateAdaptation": "Templado con buena radiación",
        "notes": "Follaje púrpura oscuro con matices aromáticos anisados. Excelente valor ornamental y culinario."
      },
      {
        "varietyName": "Limón",
        "botanicalName": "Ocimum × africanum 'Lemon Basil'",
        "stageDaysToHarvest": {
          "Semilla": 52,
          "Plántula": 36,
          "Crecimiento": 18,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 68,
        "recommendedBed": "",
        "climateAdaptation": "Templado y cálido",
        "notes": "Hojas verde claro con fresco aroma y sabor cítrico a limón. Ideal para infusiones, pescados y ensaladas."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Perejil",
    "climateOverview": "Clima frío a templado (12-22°C). Germinación lenta (15-20 días); una vez establecido es muy duradero y resistente.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Petroselinum crispum (Mill.) Fuss",
      "stageDaysToHarvest": {
        "Semilla": 75,
        "Plántula": 50,
        "Crecimiento": 28,
        "Floración": 14,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 5.5,
      "recommendedMoisturePercent": 70,
      "recommendedBed": "",
      "climateAdaptation": "Frío a templado",
      "notes": "Remojar la semilla 24h antes de sembrar para acelerar la germinación. Cosechar los tallos exteriores."
    },
    "varieties": [
      {
        "varietyName": "Crespo",
        "botanicalName": "Petroselinum crispum var. crispum",
        "stageDaysToHarvest": {
          "Semilla": 75,
          "Plántula": 50,
          "Crecimiento": 28,
          "Floración": 14,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 5.5,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "",
        "climateAdaptation": "Frío y templado",
        "notes": "Hojas densamente rizadas muy decorativas y de sabor suave. Ideal para adorno culinario y ensaladas."
      },
      {
        "varietyName": "Liso",
        "botanicalName": "Petroselinum crispum var. neapolitanum 'Italiano'",
        "stageDaysToHarvest": {
          "Semilla": 70,
          "Plántula": 48,
          "Crecimiento": 25,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "",
        "climateAdaptation": "Frío y templado",
        "notes": "Hojas planas verde oscuro de aroma más robusto e intenso. El preferido para guisos y caldos aromáticos."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Hierbabuena",
    "climateOverview": "Clima templado a frío moderado (14-22°C). Crecimiento rastrero por estolones. Se aconseja sembrar en maceta para controlar su expansión.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Mentha spicata L.",
      "stageDaysToHarvest": {
        "Semilla": 60,
        "Plántula": 35,
        "Crecimiento": 18,
        "Floración": 8,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 5.5,
      "recommendedMoisturePercent": 74,
      "recommendedBed": "",
      "climateAdaptation": "Templado y frío",
      "notes": "Prefiere sustrato húmedo con semisombra o sol suave. Podar periódicamente para estimular brotes tiernos."
    },
    "varieties": [
      {
        "varietyName": "Criolla",
        "botanicalName": "Mentha spicata 'Criolla colombiana'",
        "stageDaysToHarvest": {
          "Semilla": 55,
          "Plántula": 30,
          "Crecimiento": 15,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 5.5,
        "recommendedMoisturePercent": 75,
        "recommendedBed": "",
        "climateAdaptation": "Templado y frío",
        "notes": "Aroma fresco y dulce tradicional de las huertas familiares colombianas. Esencial en infusiones, limonadas y aromáticas."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Menta",
    "climateOverview": "Clima templado a frío (12-20°C). Exigente en humedad ambiental y del suelo; prefiere semisombra luminosa.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Mentha × piperita L.",
      "stageDaysToHarvest": {
        "Semilla": 60,
        "Plántula": 35,
        "Crecimiento": 18,
        "Floración": 8,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 5.0,
      "recommendedMoisturePercent": 75,
      "recommendedBed": "",
      "climateAdaptation": "Frío y templado",
      "notes": "Suelo húmedo y rico en humus. Excelente en macetas individuales para que sus raíces no invadan otros cultivos."
    },
    "varieties": [
      {
        "varietyName": "Piperita",
        "botanicalName": "Mentha × piperita L.",
        "stageDaysToHarvest": {
          "Semilla": 58,
          "Plántula": 32,
          "Crecimiento": 16,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 5.0,
        "recommendedMoisturePercent": 75,
        "recommendedBed": "",
        "climateAdaptation": "Frío y templado",
        "notes": "Hojas con alto contenido de mentol, tallos ligeramente violáceos y frescor balsámico penetrante."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Orégano",
    "climateOverview": "Clima templado a cálido (16-26°C). Muy resistente a sequía relativa; prefiere suelos secos y bien drenados a pleno sol.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Origanum vulgare / Plectranthus amboinicus",
      "stageDaysToHarvest": {
        "Semilla": 80,
        "Plántula": 50,
        "Crecimiento": 25,
        "Floración": 12,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 60,
      "recommendedBed": "",
      "climateAdaptation": "Templado y cálido",
      "notes": "Evitar el exceso de humedad en raíces. El sol directo concentra sus aceites esenciales aromáticos."
    },
    "varieties": [
      {
        "varietyName": "Común",
        "botanicalName": "Origanum vulgare L.",
        "stageDaysToHarvest": {
          "Semilla": 75,
          "Plántula": 45,
          "Crecimiento": 22,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 58,
        "recommendedBed": "",
        "climateAdaptation": "Templado",
        "notes": "Hojas pequeñas redondeadas muy fragantes. Perfecto para secar y usar en pastas, salsas y pizzas."
      },
      {
        "varietyName": "Oreganón",
        "botanicalName": "Plectranthus amboinicus (Lour.) Spreng.",
        "stageDaysToHarvest": {
          "Semilla": 60,
          "Plántula": 35,
          "Crecimiento": 18,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 62,
        "recommendedBed": "",
        "climateAdaptation": "Cálido y templado",
        "notes": "Orégano de hoja ancha, gruesa y aterciopelada muy común en Colombia. Aroma potente, ideal para sopas y marinados."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Tomillo",
    "climateOverview": "Clima templado a frío moderado (14-24°C). Planta subarbustiva de montaña mediterránea adaptada a suelos secos y pedregosos.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Thymus vulgaris L.",
      "stageDaysToHarvest": {
        "Semilla": 85,
        "Plántula": 55,
        "Crecimiento": 28,
        "Floración": 14,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 7.5,
      "recommendedMoisturePercent": 55,
      "recommendedBed": "",
      "climateAdaptation": "Templado",
      "notes": "Suelo muy drenante y arenoso. Riego escaso; soporta periodos secos y requiere exposición a pleno sol."
    },
    "varieties": [
      {
        "varietyName": "Común",
        "botanicalName": "Thymus vulgaris L.",
        "stageDaysToHarvest": {
          "Semilla": 80,
          "Plántula": 50,
          "Crecimiento": 25,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 55,
        "recommendedBed": "",
        "climateAdaptation": "Templado y seco",
        "notes": "Hojas diminutas grisáceas con potente contenido de timol. Cosechar ramitas en flor para máxima concentración de aroma."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Romero",
    "climateOverview": "Clima templado a cálido seco (15-26°C). Arbusto perenne muy longevo; no soporta encharcamientos ni exceso de agua.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Salvia rosmarinus Spenn.",
      "stageDaysToHarvest": {
        "Semilla": 100,
        "Plántula": 60,
        "Crecimiento": 30,
        "Floración": 15,
        "Cosecha": 0
      },
      "waterFrequencyDays": 4,
      "sunHours": 8.0,
      "recommendedMoisturePercent": 50,
      "recommendedBed": "",
      "climateAdaptation": "Templado a cálido",
      "notes": "Sustrato arenoso o rocoso con excelente drenaje. Regar solo cuando la tierra esté completamente seca."
    },
    "varieties": [
      {
        "varietyName": "Común",
        "botanicalName": "Salvia rosmarinus Spenn.",
        "stageDaysToHarvest": {
          "Semilla": 95,
          "Plántula": 55,
          "Crecimiento": 28,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 8.0,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "",
        "climateAdaptation": "Templado y cálido",
        "notes": "Hojas aciculares verde oscuro con envés blanquecino y aroma alcanforado y resinoso. Esquejes arraigan con facilidad."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Limonaria / Limoncillo",
    "climateOverview": "Clima cálido a templado (18-28°C). Gramínea perenne en macolla de rápido desarrollo con aroma cítrico penetrante.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Cymbopogon citratus (DC.) Stapf",
      "stageDaysToHarvest": {
        "Semilla": 90,
        "Plántula": 50,
        "Crecimiento": 25,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 68,
      "recommendedBed": "",
      "climateAdaptation": "Cálido y templado",
      "notes": "Macolla vigorosa; cosechar cortando los tallos exteriores a ras del suelo para infusiones y cocina aromática."
    },
    "varieties": [
      {
        "varietyName": "Común",
        "botanicalName": "Cymbopogon citratus (DC.) Stapf",
        "stageDaysToHarvest": {
          "Semilla": 85,
          "Plántula": 45,
          "Crecimiento": 22,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 68,
        "recommendedBed": "",
        "climateAdaptation": "Cálido y templado",
        "notes": "Hojas acintadas largas y bulbos tiernos con alto porcentaje de citral. Popular en agua de panela y cocina fusión."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Caléndula",
    "climateOverview": "Clima templado a frío (12-22°C). Flor benéfica indispensable en el huerto: atrae polinizadores y repele nematodos y plagas.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Calendula officinalis L.",
      "stageDaysToHarvest": {
        "Semilla": 60,
        "Plántula": 40,
        "Crecimiento": 22,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 6.5,
      "recommendedMoisturePercent": 65,
      "recommendedBed": "",
      "climateAdaptation": "Frío y templado",
      "notes": "Cosechar las flores abiertas para prolongar la floración. Pétalos comestibles y con reconocidas propiedades calmantes y medicinales."
    },
    "varieties": [
      {
        "varietyName": "Officinalis",
        "botanicalName": "Calendula officinalis L.",
        "stageDaysToHarvest": {
          "Semilla": 58,
          "Plántula": 38,
          "Crecimiento": 20,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "",
        "climateAdaptation": "Frío y templado",
        "notes": "Capítulos florales de color naranja y amarillo brillante. Excelente compañera de bancal para tomates, lechugas y aromáticas."
      }
    ],
    "category": "Exterior"
  },
  {
    "cropName": "Pothos / Potus",
    "category": "Interior",
    "climateOverview": "Planta de interior purificadora muy resistente (15-28°C). Prefiere luz indirecta moderada o baja y riegos espaciados cuando el sustrato seque.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Epipremnum aureum",
      "stageDaysToHarvest": {
        "Semilla": 180,
        "Plántula": 90,
        "Crecimiento": 45,
        "Floración": 30,
        "Cosecha": 15
      },
      "waterFrequencyDays": 5,
      "sunHours": 3.0,
      "recommendedMoisturePercent": 50,
      "recommendedBed": "",
      "notes": "Ideal para estanterías y macetas colgantes de interior. Riego moderado cuando la superficie del sustrato esté seca.",
      "climateAdaptation": "Interior templado, tolerante a iluminación tenue y sombra."
    },
    "varieties": [
      {
        "varietyName": "Pothos Dorado",
        "botanicalName": "Epipremnum aureum 'Golden'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 90,
          "Crecimiento": 45,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 5,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "",
        "notes": "Hojas jaspeadas en tonos amarillo y verde vivo. Muy resistente y decorativa.",
        "climateAdaptation": "Interior bien iluminado o con luz indirecta tamizada."
      },
      {
        "varietyName": "Pothos Marble Queen",
        "botanicalName": "Epipremnum aureum 'Marble Queen'",
        "stageDaysToHarvest": {
          "Semilla": 190,
          "Plántula": 95,
          "Crecimiento": 50,
          "Floración": 35,
          "Cosecha": 20
        },
        "waterFrequencyDays": 5,
        "sunHours": 4.0,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "",
        "notes": "Jaspeado blanco crema abundante. Demanda algo más de luz indirecta para conservar el contraste.",
        "climateAdaptation": "Interior con abundante luz indirecta."
      }
    ]
  },
  {
    "cropName": "Monstera Deliciosa",
    "category": "Interior",
    "climateOverview": "Planta tropical de interior por excelencia (18-30°C). Destaca por sus hojas grandes fenestradas. Exige luz indirecta brillante y humedad media-alta.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Monstera deliciosa Liebm.",
      "stageDaysToHarvest": {
        "Semilla": 240,
        "Plántula": 120,
        "Crecimiento": 60,
        "Floración": 40,
        "Cosecha": 20
      },
      "waterFrequencyDays": 6,
      "sunHours": 3.5,
      "recommendedMoisturePercent": 55,
      "recommendedBed": "",
      "notes": "Limpiar el polvo de las hojas periódicamente con un paño húmedo. Evitar sol directo para no quemar las hojas.",
      "climateAdaptation": "Salones e interiores cálidos con luz indirecta constante."
    },
    "varieties": [
      {
        "varietyName": "Monstera Deliciosa Clásica",
        "botanicalName": "Monstera deliciosa var. deliciosa",
        "stageDaysToHarvest": {
          "Semilla": 240,
          "Plántula": 120,
          "Crecimiento": 60,
          "Floración": 40,
          "Cosecha": 20
        },
        "waterFrequencyDays": 6,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 55,
        "recommendedBed": "",
        "notes": "Costilla de Adán clásica con grandes hojas acanaladas. Tutorar con fibra de coco.",
        "climateAdaptation": "Espacios interiores luminosos sin sol directo."
      }
    ]
  },
  {
    "cropName": "Sansevieria / Lengua de Suegra",
    "category": "Interior",
    "climateOverview": "Una de las plantas de interior más longevas y resistentes (12-32°C). Excelente purificadora de aire nocturno con mínimo requerimiento hídrico.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Dracaena trifasciata (Prain) Mabb.",
      "stageDaysToHarvest": {
        "Semilla": 200,
        "Plántula": 100,
        "Crecimiento": 50,
        "Floración": 30,
        "Cosecha": 15
      },
      "waterFrequencyDays": 10,
      "sunHours": 2.5,
      "recommendedMoisturePercent": 40,
      "recommendedBed": "",
      "notes": "Riego muy espaciado: regar únicamente cuando el sustrato esté completamente seco. Gran tolerancia al olvido.",
      "climateAdaptation": "Se adapta a sombras densas o interiores con poca luz natural."
    },
    "varieties": [
      {
        "varietyName": "Sansevieria Laurentii",
        "botanicalName": "Dracaena trifasciata 'Laurentii'",
        "stageDaysToHarvest": {
          "Semilla": 200,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 10,
        "sunHours": 3.0,
        "recommendedMoisturePercent": 40,
        "recommendedBed": "",
        "notes": "Bordes dorados distintivos a lo largo de hojas erectas y rígidas.",
        "climateAdaptation": "Espacios interiores residenciales o de oficina."
      },
      {
        "varietyName": "Sansevieria Moonshine",
        "botanicalName": "Dracaena trifasciata 'Moonshine'",
        "stageDaysToHarvest": {
          "Semilla": 200,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 10,
        "sunHours": 3.0,
        "recommendedMoisturePercent": 40,
        "recommendedBed": "",
        "notes": "Tonalidad verde plateado claro muy moderna y decorativa.",
        "climateAdaptation": "Interiores luminosos o semi-sombreados."
      }
    ]
  },
  {
    "cropName": "Espatifilo / Cuna de Moisés",
    "category": "Interior",
    "climateOverview": "Elegante planta de interior con brácteas blancas (16-26°C). Filtra toxinas del aire e indica sed bajando sutilmente sus hojas.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Spathiphyllum wallisii",
      "stageDaysToHarvest": {
        "Semilla": 160,
        "Plántula": 80,
        "Crecimiento": 40,
        "Floración": 20,
        "Cosecha": 10
      },
      "waterFrequencyDays": 4,
      "sunHours": 2.5,
      "recommendedMoisturePercent": 65,
      "recommendedBed": "",
      "notes": "Prefiere sustrato húmedo sin encharcamiento y sombra o luz tamizada. Pulverizar follaje en días secos.",
      "climateAdaptation": "Interior fresco y sombreado, dormitorios y salas de estar."
    },
    "varieties": [
      {
        "varietyName": "Espatifilo Flor Blanca",
        "botanicalName": "Spathiphyllum wallisii 'Sweet Chico'",
        "stageDaysToHarvest": {
          "Semilla": 160,
          "Plántula": 80,
          "Crecimiento": 40,
          "Floración": 20,
          "Cosecha": 10
        },
        "waterFrequencyDays": 4,
        "sunHours": 2.5,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "",
        "notes": "Floración blanca continua con hojas lustrosas verde oscuro.",
        "climateAdaptation": "Sombra luminosa o luz difusa en interior."
      }
    ]
  },
  {
    "cropName": "Calathea / Maranta",
    "category": "Interior",
    "climateOverview": "Planta de oración fascinante de interior (18-27°C). Cierra sus hojas en la noche y muestra envés purpúreo. Requiere alta humedad ambiental.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Goeppertia insignis / Calathea",
      "stageDaysToHarvest": {
        "Semilla": 170,
        "Plántula": 85,
        "Crecimiento": 45,
        "Floración": 25,
        "Cosecha": 10
      },
      "waterFrequencyDays": 4,
      "sunHours": 3.0,
      "recommendedMoisturePercent": 70,
      "recommendedBed": "",
      "notes": "Regar con agua reposada o filtrada para evitar puntas marrones. Luz indirecta suave.",
      "climateAdaptation": "Interiores protegidos de corrientes frías y sol directo."
    },
    "varieties": [
      {
        "varietyName": "Calathea Orbifolia",
        "botanicalName": "Goeppertia orbifolia",
        "stageDaysToHarvest": {
          "Semilla": 170,
          "Plántula": 85,
          "Crecimiento": 45,
          "Floración": 25,
          "Cosecha": 10
        },
        "waterFrequencyDays": 4,
        "sunHours": 3.0,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "",
        "notes": "Enormes hojas redondeadas con rayas verde plateado y verde oliva.",
        "climateAdaptation": "Interior húmedo y cálido."
      }
    ]
  },
  {
    "cropName": "Suculenta Echeveria",
    "category": "Interior",
    "climateOverview": "Planta crasa compacta en forma de roseta (15-28°C). Ideal para repisas de ventanas soleadas interiores, escritorios y pequeños maceteros.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Echeveria elegans Rose",
      "stageDaysToHarvest": {
        "Semilla": 150,
        "Plántula": 75,
        "Crecimiento": 40,
        "Floración": 25,
        "Cosecha": 10
      },
      "waterFrequencyDays": 8,
      "sunHours": 4.5,
      "recommendedMoisturePercent": 35,
      "recommendedBed": "",
      "notes": "Riego por inmersión o en la base evitando que quede agua estancada en el corazón de la roseta.",
      "climateAdaptation": "Ventrana interior soleada y bien ventilada."
    },
    "varieties": [
      {
        "varietyName": "Echeveria Elegans (Rosa de Alabastro)",
        "botanicalName": "Echeveria elegans",
        "stageDaysToHarvest": {
          "Semilla": 150,
          "Plántula": 75,
          "Crecimiento": 40,
          "Floración": 25,
          "Cosecha": 10
        },
        "waterFrequencyDays": 8,
        "sunHours": 4.5,
        "recommendedMoisturePercent": 35,
        "recommendedBed": "",
        "notes": "Hojas carnosas de tono verde azulado pálido con pruina protectora.",
        "climateAdaptation": "Interior con luz solar directa matutina junto a ventanal."
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

/**
 * Determina si un cultivo pertenece a interior o exterior a partir de la base botánica
 */
export function inferCropCategory(cropName: string): PlantCategory {
  const match = CROPS_DATABASE.find(
    (c) => c.cropName.toLowerCase() === cropName.toLowerCase()
  );
  if (match && match.category) {
    return match.category;
  }
  const lower = cropName.toLowerCase();
  if (
    lower.includes('pothos') ||
    lower.includes('potus') ||
    lower.includes('monstera') ||
    lower.includes('costilla') ||
    lower.includes('sansevieria') ||
    lower.includes('lengua de suegra') ||
    lower.includes('espatifilo') ||
    lower.includes('cuna de moisés') ||
    lower.includes('calathea') ||
    lower.includes('maranta') ||
    lower.includes('suculenta') ||
    lower.includes('echeveria') ||
    lower.includes('interior')
  ) {
    return 'Interior';
  }
  return 'Exterior';
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
  if (lower.includes('pothos') || lower.includes('potus')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Pothos / Potus de interior' };
  }
  if (lower.includes('monstera') || lower.includes('costilla')) {
    return { imageUrl: '/crops/acelga.svg', imageAlt: 'Monstera Deliciosa de interior' };
  }
  if (lower.includes('sansevieria') || lower.includes('lengua de suegra')) {
    return { imageUrl: '/crops/cebolla.svg', imageAlt: 'Sansevieria de interior' };
  }
  if (lower.includes('espatifilo') || lower.includes('moisés') || lower.includes('moises')) {
    return { imageUrl: '/crops/calendula.svg', imageAlt: 'Espatifilo de interior' };
  }
  if (lower.includes('calathea') || lower.includes('maranta')) {
    return { imageUrl: '/crops/lechuga.svg', imageAlt: 'Calathea de interior' };
  }
  if (lower.includes('suculenta') || lower.includes('echeveria')) {
    return { imageUrl: '/crops/rabano.svg', imageAlt: 'Suculenta Echeveria de interior' };
  }
  if (lower.includes('tomate')) {
    return { imageUrl: '/crops/tomate.svg', imageAlt: 'Tomate Chonto / Cherry / Milano' };
  }
  if (lower.includes('cilantro')) {
    return { imageUrl: '/crops/cilantro.svg', imageAlt: 'Cilantro Patichoque / Criollo' };
  }
  if (lower.includes('lechuga')) {
    return { imageUrl: '/crops/lechuga.svg', imageAlt: 'Lechuga Batavia / Crespa' };
  }
  if (lower.includes('cebolla')) {
    return { imageUrl: '/crops/cebolla.svg', imageAlt: 'Cebolla de rama / cabezona' };
  }
  if (lower.includes('zanahoria')) {
    return { imageUrl: '/crops/zanahoria.svg', imageAlt: 'Zanahoria Chantenay / Nantes' };
  }
  if (lower.includes('rábano') || lower.includes('rabano')) {
    return { imageUrl: '/crops/rabano.svg', imageAlt: 'Rábano Rojo / Champion' };
  }
  if (lower.includes('acelga')) {
    return { imageUrl: '/crops/acelga.svg', imageAlt: 'Acelga Verde / Fordhook Giant' };
  }
  if (lower.includes('espinaca')) {
    return { imageUrl: '/crops/espinaca.svg', imageAlt: 'Espinaca Viroflay / Criolla' };
  }
  if (lower.includes('fríjol') || lower.includes('frijol')) {
    return { imageUrl: '/crops/frijol.svg', imageAlt: 'Fríjol Cargamanto / Bola roja / Calima' };
  }
  if (lower.includes('habichuela')) {
    return { imageUrl: '/crops/habichuela.svg', imageAlt: 'Habichuela Blue Lake / Tijereta' };
  }
  if (lower.includes('arveja')) {
    return { imageUrl: '/crops/arveja.svg', imageAlt: 'Arveja Santa Isabel / San Isidro' };
  }
  if (lower.includes('pimentón') || lower.includes('pimenton') || lower.includes('ají') || lower.includes('aji')) {
    return { imageUrl: '/crops/pimiento.svg', imageAlt: 'Pimentón Chino / Ají dulce / Ají cayena' };
  }
  if (lower.includes('pepino')) {
    return { imageUrl: '/crops/pepino.svg', imageAlt: 'Pepino cohombro Poinsett / Ashley' };
  }
  if (lower.includes('calabacín') || lower.includes('calabacin') || lower.includes('zucchini')) {
    return { imageUrl: '/crops/calabacin.svg', imageAlt: 'Calabacín Black Beauty / Zucchini amarillo' };
  }
  if (lower.includes('remolacha')) {
    return { imageUrl: '/crops/remolacha.svg', imageAlt: 'Remolacha Early Wonder / Detroit Dark Red' };
  }
  if (lower.includes('papa')) {
    return { imageUrl: '/crops/papa.svg', imageAlt: 'Papa criolla Yema de huevo / Criolla Colombia' };
  }
  if (lower.includes('fresa')) {
    return { imageUrl: '/crops/fresa.svg', imageAlt: 'Fresa Albión / Monterrey / Ventana' };
  }
  if (lower.includes('albahaca')) {
    return { imageUrl: '/crops/albahaca.svg', imageAlt: 'Albahaca Genovesa / Morada / Limón' };
  }
  if (lower.includes('perejil')) {
    return { imageUrl: '/crops/cilantro.svg', imageAlt: 'Perejil Crespo / Liso' };
  }
  if (lower.includes('hierbabuena') || lower.includes('menta') || lower.includes('orégano') || lower.includes('oregano') || lower.includes('tomillo') || lower.includes('romero') || lower.includes('limonaria') || lower.includes('limoncillo')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Hierba Aromática' };
  }
  if (lower.includes('caléndula') || lower.includes('calendula')) {
    return { imageUrl: '/crops/calendula.svg', imageAlt: 'Caléndula Officinalis' };
  }
  return { imageUrl: '/crops/lechuga.svg', imageAlt: cropName };
}
