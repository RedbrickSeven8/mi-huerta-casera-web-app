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
    "cropName": "Monstera",
    "category": "Interior",
    "climateOverview": "Planta tropical de interior por excelencia (18-30°C). Destaca por sus hojas de gran tamaño y perforaciones naturales. Requiere luz indirecta brillante y riego moderado cuando el sustrato seque en la parte superior.",
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
      "recommendedBed": "Maceta Salón",
      "notes": "Limpiar el polvo de las hojas periódicamente con un paño suave húmedo. Evitar radiación solar directa para proteger el follaje.",
      "climateAdaptation": "Interiores luminosos, salones y oficinas cálidas sin sol abrasador."
    },
    "varieties": [
      {
        "varietyName": "Deliciosa (Costilla de Adán)",
        "botanicalName": "Monstera deliciosa",
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
        "recommendedBed": "Maceta Salón",
        "notes": "Hojas de gran porte con cortes profundos y fenestraciones. Emplear tutor de musgo o fibra de coco para guiar el crecimiento trepador.",
        "climateAdaptation": "Luz indirecta moderada o alta."
      },
      {
        "varietyName": "Adansonii (Monkey Mask)",
        "botanicalName": "Monstera adansonii",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 90,
          "Crecimiento": 45,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 5,
        "sunHours": 4.0,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Maceta Colgante",
        "notes": "Hojas lanceoladas compactas con orificios cerrados distintivos. Idónea para estanterías, macetas colgantes o trepadora en tutores pequeños.",
        "climateAdaptation": "Luz filtrada brillante y humedad ambiental media-alta."
      },
      {
        "varietyName": "Deliciosa 'Variegata'",
        "botanicalName": "Monstera deliciosa var. borsigiana albo-variegata",
        "stageDaysToHarvest": {
          "Semilla": 270,
          "Plántula": 140,
          "Crecimiento": 70,
          "Floración": 45,
          "Cosecha": 25
        },
        "waterFrequencyDays": 6,
        "sunHours": 4.5,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Maceta Salón",
        "notes": "Mutación con manchas blancas y crema marmóreas. Exige mayor luminosidad indirecta para conservar los sectores blancos sin manchas marrones.",
        "climateAdaptation": "Luz indirecta muy abundante sin sol directo."
      }
    ]
  },
  {
    "cropName": "Pothos / Miami (Epipremnum aureum)",
    "category": "Interior",
    "climateOverview": "Planta purificadora extremadamente resistente (15-28°C). Prospera con luz difusa moderada y riegos espaciados cuando el sustrato seque.",
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
      "recommendedBed": "Maceta Estantería",
      "notes": "Ideal para repisas, estanterías y macetas colgantes. Riego moderado cuando el sustrato esté seco al tacto.",
      "climateAdaptation": "Se adapta a luz indirecta abundante o sombra parcial en interiores."
    },
    "varieties": [
      {
        "varietyName": "Dorado (Golden Pothos)",
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
        "recommendedBed": "Maceta Colgante",
        "notes": "Hojas acorazonadas verde esmeralda con salpicaduras amarillas doradas vivas.",
        "climateAdaptation": "Interior templado y versátil."
      },
      {
        "varietyName": "Marble Queen",
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
        "recommendedBed": "Maceta Estantería",
        "notes": "Jaspeado blanco crema denso. Demanda buena iluminación indirecta para nutrir las zonas variegadas.",
        "climateAdaptation": "Espacios con luz indirecta abundante."
      },
      {
        "varietyName": "Neon",
        "botanicalName": "Epipremnum aureum 'Neon'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 90,
          "Crecimiento": 45,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 5,
        "sunHours": 4.0,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Maceta Colgante",
        "notes": "Follaje verde lima eléctrico brillante muy llamativo. Mayor luz estimula su tono fluorescente.",
        "climateAdaptation": "Luz indirecta brillante."
      },
      {
        "varietyName": "N'Joy",
        "botanicalName": "Epipremnum aureum 'N-Joy'",
        "stageDaysToHarvest": {
          "Semilla": 200,
          "Plántula": 100,
          "Crecimiento": 55,
          "Floración": 35,
          "Cosecha": 20
        },
        "waterFrequencyDays": 5,
        "sunHours": 4.0,
        "recommendedMoisturePercent": 48,
        "recommendedBed": "Maceta Pequeña",
        "notes": "Hojas compactas con parches blancos puros y verdes nítidamente delimitados. Crecimiento más pausado.",
        "climateAdaptation": "Luz tamizada constante."
      }
    ]
  },
  {
    "cropName": "Sansevieria / Lengua de suegra",
    "category": "Interior",
    "climateOverview": "Planta purificadora sobresaliente y casi indestructible (13-32°C). Libera oxígeno de noche y tolera períodos prolongados sin riego.",
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
      "recommendedBed": "Maceta Suelo",
      "notes": "Regar exclusivamente cuando el sustrato esté completamente seco. Gran resistencia a ambientes secos de interior.",
      "climateAdaptation": "Desde sombra ligera hasta sol matutino suave."
    },
    "varieties": [
      {
        "varietyName": "Laurentii",
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
        "recommendedBed": "Maceta Suelo",
        "notes": "Hojas erectas en forma de espada con vistosos bordes amarillos dorados continuos.",
        "climateAdaptation": "Interiores luminosos o semisombra."
      },
      {
        "varietyName": "Zeylanica",
        "botanicalName": "Dracaena trifasciata 'Zeylanica'",
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
        "recommendedBed": "Maceta Suelo",
        "notes": "Patrón atigrado de franjas verde oscuro y verde plateado sin bordes amarillos.",
        "climateAdaptation": "Muy tolerante a zonas con iluminación moderada."
      },
      {
        "varietyName": "Moonshine",
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
        "recommendedBed": "Maceta Mesa",
        "notes": "Hojas anchas de tono plateado cenizo moderno y elegante. Se oscurecen si la luz es muy baja.",
        "climateAdaptation": "Luz indirecta moderada para conservar su tono plateado."
      },
      {
        "varietyName": "Hahnii (Nido de pájaro)",
        "botanicalName": "Dracaena trifasciata 'Hahnii'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 90,
          "Crecimiento": 45,
          "Floración": 25,
          "Cosecha": 15
        },
        "waterFrequencyDays": 9,
        "sunHours": 2.5,
        "recommendedMoisturePercent": 40,
        "recommendedBed": "Maceta Pequeña / Escritorio",
        "notes": "Formato enano en roseta baja acampanada. Perfecta para mesas, escritorios y repisas angostas.",
        "climateAdaptation": "Cualquier rincón interior con ventilación."
      },
      {
        "varietyName": "Cylindrica",
        "botanicalName": "Dracaena cylindrica",
        "stageDaysToHarvest": {
          "Semilla": 210,
          "Plántula": 105,
          "Crecimiento": 55,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 12,
        "sunHours": 3.0,
        "recommendedMoisturePercent": 35,
        "recommendedBed": "Maceta Escultórica",
        "notes": "Tallos cilíndricos carnosos y puntiagudos con porte arquitectónico. Mínima demanda de riego.",
        "climateAdaptation": "Interiores secos o soleados tamizados."
      }
    ]
  },
  {
    "cropName": "Zamioculca (ZZ Plant)",
    "category": "Interior",
    "climateOverview": "Planta todoterreno de interior (16-30°C) con tubérculos subterráneos que almacenan agua. Excelente resistencia a condiciones de poca luz y olvido de riegos.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Zamioculcas zamiifolia",
      "stageDaysToHarvest": {
        "Semilla": 220,
        "Plántula": 110,
        "Crecimiento": 55,
        "Floración": 35,
        "Cosecha": 15
      },
      "waterFrequencyDays": 12,
      "sunHours": 2.5,
      "recommendedMoisturePercent": 38,
      "recommendedBed": "Maceta Suelo / Pasillo",
      "notes": "Regar únicamente cuando el sustrato esté seco en profundidad. Evitar encharcamientos.",
      "climateAdaptation": "Sobresaliente tolerancia a luz baja, pasillos o rincones de oficina."
    },
    "varieties": [
      {
        "varietyName": "Clásica (verde)",
        "botanicalName": "Zamioculcas zamiifolia",
        "stageDaysToHarvest": {
          "Semilla": 220,
          "Plántula": 110,
          "Crecimiento": 55,
          "Floración": 35,
          "Cosecha": 15
        },
        "waterFrequencyDays": 12,
        "sunHours": 2.5,
        "recommendedMoisturePercent": 38,
        "recommendedBed": "Maceta Salón",
        "notes": "Follaje compuesto verde brillante lustroso como encerado. Sumamente longeva y resistente.",
        "climateAdaptation": "Luz indirecta moderada o baja."
      },
      {
        "varietyName": "Raven (hoja negra)",
        "botanicalName": "Zamioculcas zamiifolia 'Raven'",
        "stageDaysToHarvest": {
          "Semilla": 240,
          "Plántula": 120,
          "Crecimiento": 60,
          "Floración": 40,
          "Cosecha": 20
        },
        "waterFrequencyDays": 12,
        "sunHours": 3.0,
        "recommendedMoisturePercent": 38,
        "recommendedBed": "Maceta Salón",
        "notes": "Los brotes nuevos nacen verde esmeralda y maduran a un púrpura negruzco brillante casi azabache.",
        "climateAdaptation": "Luz indirecta media para una pigmentación oscura uniforme."
      },
      {
        "varietyName": "Zenzi",
        "botanicalName": "Zamioculcas zamiifolia 'Zenzi'",
        "stageDaysToHarvest": {
          "Semilla": 200,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 10,
        "sunHours": 2.5,
        "recommendedMoisturePercent": 38,
        "recommendedBed": "Maceta Escritorio",
        "notes": "Variedad enana compacta con foliolos densamente agrupados a lo largo de tallos gruesos.",
        "climateAdaptation": "Escritorios o mesas auxiliares con iluminación indirecta."
      }
    ]
  },
  {
    "cropName": "Ficus",
    "category": "Interior",
    "climateOverview": "Árboles y arbustos de interior con porte escultórico (16-28°C). Prefieren luz abundante indirecta, riego medido y estabilidad sin corrientes bruscas ni traslados frecuentes.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Ficus spp.",
      "stageDaysToHarvest": {
        "Semilla": 240,
        "Plántula": 120,
        "Crecimiento": 60,
        "Floración": 35,
        "Cosecha": 15
      },
      "waterFrequencyDays": 6,
      "sunHours": 4.5,
      "recommendedMoisturePercent": 50,
      "recommendedBed": "Maceta Suelo Grande",
      "notes": "Evitar moverlo de ubicación una vez adaptado. Regar cuando los primeros 3 cm de sustrato estén secos.",
      "climateAdaptation": "Ambientes interiores amplios con buena luz natural."
    },
    "varieties": [
      {
        "varietyName": "Lyrata (Pandurata / Higuera hoja de violín)",
        "botanicalName": "Ficus lyrata",
        "stageDaysToHarvest": {
          "Semilla": 260,
          "Plántula": 130,
          "Crecimiento": 65,
          "Floración": 40,
          "Cosecha": 20
        },
        "waterFrequencyDays": 6,
        "sunHours": 5.0,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Maceta Salón Suelo",
        "notes": "Hojas enormes coriáceas en forma de violín. Limpiar sus hojas periódicamente y rotar la maceta para desarrollo recto.",
        "climateAdaptation": "Luz brillante filtrada cerca de ventanales."
      },
      {
        "varietyName": "Elastica Burgundy",
        "botanicalName": "Ficus elastica 'Burgundy'",
        "stageDaysToHarvest": {
          "Semilla": 220,
          "Plántula": 110,
          "Crecimiento": 55,
          "Floración": 35,
          "Cosecha": 15
        },
        "waterFrequencyDays": 7,
        "sunHours": 4.5,
        "recommendedMoisturePercent": 48,
        "recommendedBed": "Maceta Salón",
        "notes": "Hojas gruesas carnosas de color burdeos muy oscuro con nervadura central rojiza.",
        "climateAdaptation": "Luz indirecta moderada a alta."
      },
      {
        "varietyName": "Elastica Tineke",
        "botanicalName": "Ficus elastica 'Tineke'",
        "stageDaysToHarvest": {
          "Semilla": 230,
          "Plántula": 115,
          "Crecimiento": 60,
          "Floración": 35,
          "Cosecha": 15
        },
        "waterFrequencyDays": 6,
        "sunHours": 5.0,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Maceta Salón",
        "notes": "Follaje variegado tricolor en verde pastel, crema y toques rosáceos en brotes nuevos.",
        "climateAdaptation": "Luz indirecta abundante sin sol directo abrasador."
      },
      {
        "varietyName": "Elastica Robusta",
        "botanicalName": "Ficus elastica 'Robusta'",
        "stageDaysToHarvest": {
          "Semilla": 220,
          "Plántula": 110,
          "Crecimiento": 55,
          "Floración": 35,
          "Cosecha": 15
        },
        "waterFrequencyDays": 7,
        "sunHours": 4.5,
        "recommendedMoisturePercent": 48,
        "recommendedBed": "Maceta Salón",
        "notes": "Gomero clásico de hojas grandes verde oscuro intenso con vaina rojiza en cada brote.",
        "climateAdaptation": "Interior bien iluminado."
      },
      {
        "varietyName": "Benjamina",
        "botanicalName": "Ficus benjamina",
        "stageDaysToHarvest": {
          "Semilla": 210,
          "Plántula": 105,
          "Crecimiento": 50,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 5,
        "sunHours": 4.5,
        "recommendedMoisturePercent": 55,
        "recommendedBed": "Maceta Salón",
        "notes": "Copa densa y ramas colgantes de hojas menudas. Sensible a cambios bruscos de corriente o frío.",
        "climateAdaptation": "Ambiente luminoso y temperatura estable."
      }
    ]
  },
  {
    "cropName": "Filodendro (Philodendron)",
    "category": "Interior",
    "climateOverview": "Familia de aráceas tropicales de porte colgante o erguido (18-28°C). Resaltan por la diversidad de texturas, variegaciones y siluetas.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Philodendron spp.",
      "stageDaysToHarvest": {
        "Semilla": 190,
        "Plántula": 95,
        "Crecimiento": 50,
        "Floración": 30,
        "Cosecha": 15
      },
      "waterFrequencyDays": 5,
      "sunHours": 3.5,
      "recommendedMoisturePercent": 58,
      "recommendedBed": "Maceta Estantería",
      "notes": "Prefiere sustrato aireado con corteza de pino y perlita. Regar al secar la mitad superior.",
      "climateAdaptation": "Luz indirecta tamizada constante."
    },
    "varieties": [
      {
        "varietyName": "Birkin",
        "botanicalName": "Philodendron 'Birkin'",
        "stageDaysToHarvest": {
          "Semilla": 190,
          "Plántula": 95,
          "Crecimiento": 50,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 5,
        "sunHours": 4.0,
        "recommendedMoisturePercent": 55,
        "recommendedBed": "Maceta Mesa",
        "notes": "Hojas redondeadas oscuras con delicadas líneas blancas en aguja en cada nueva hoja.",
        "climateAdaptation": "Luz indirecta brillante para sostener las líneas blancas."
      },
      {
        "varietyName": "Brasil (Hederaceum)",
        "botanicalName": "Philodendron hederaceum 'Brasil'",
        "stageDaysToHarvest": {
          "Semilla": 170,
          "Plántula": 85,
          "Crecimiento": 45,
          "Floración": 25,
          "Cosecha": 15
        },
        "waterFrequencyDays": 5,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 55,
        "recommendedBed": "Maceta Colgante",
        "notes": "Enredadera trepadora o colgante de rápido crecimiento con franja central verde lima brillante.",
        "climateAdaptation": "Interiores templados con luz indirecta media o alta."
      },
      {
        "varietyName": "Pink Princess",
        "botanicalName": "Philodendron erubescens 'Pink Princess'",
        "stageDaysToHarvest": {
          "Semilla": 210,
          "Plántula": 105,
          "Crecimiento": 55,
          "Floración": 35,
          "Cosecha": 20
        },
        "waterFrequencyDays": 5,
        "sunHours": 4.5,
        "recommendedMoisturePercent": 58,
        "recommendedBed": "Maceta Salón",
        "notes": "Hojas borgoña oscuro con llamativas manchas rosadas chicle. Exige luz indirecta generosa.",
        "climateAdaptation": "Luz indirecta generosa y humedad ambiente cálida."
      },
      {
        "varietyName": "Micans (Terciopelo)",
        "botanicalName": "Philodendron hederaceum var. micans",
        "stageDaysToHarvest": {
          "Semilla": 170,
          "Plántula": 85,
          "Crecimiento": 45,
          "Floración": 25,
          "Cosecha": 15
        },
        "waterFrequencyDays": 5,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 58,
        "recommendedBed": "Maceta Colgante",
        "notes": "Hojas acorazonadas con textura de terciopelo y envés en tonos cobrizos y óxido.",
        "climateAdaptation": "Luz tamizada suave."
      },
      {
        "varietyName": "Xanadu",
        "botanicalName": "Thaumatophyllum xanadu (Philodendron xanadu)",
        "stageDaysToHarvest": {
          "Semilla": 220,
          "Plántula": 110,
          "Crecimiento": 55,
          "Floración": 35,
          "Cosecha": 15
        },
        "waterFrequencyDays": 6,
        "sunHours": 4.0,
        "recommendedMoisturePercent": 55,
        "recommendedBed": "Maceta Suelo",
        "notes": "Planta arbustiva de hojas lobuladas profundamente divididas de color verde lustroso.",
        "climateAdaptation": "Salones e interiores luminosos amplios."
      }
    ]
  },
  {
    "cropName": "Calatea (Calathea / Goeppertia)",
    "category": "Interior",
    "climateOverview": "Plantas tropicales selváticas (18-27°C) con fascinantes patrones geométricos en el follaje y envés púrpura. Exigen humedad ambiental media-alta y agua reposada sin cal.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Goeppertia / Calathea spp.",
      "stageDaysToHarvest": {
        "Semilla": 180,
        "Plántula": 90,
        "Crecimiento": 45,
        "Floración": 25,
        "Cosecha": 10
      },
      "waterFrequencyDays": 4,
      "sunHours": 3.0,
      "recommendedMoisturePercent": 68,
      "recommendedBed": "Maceta Salón",
      "notes": "Regar con agua reposada o filtrada para proteger las puntas. Evitar exposición directa al sol.",
      "climateAdaptation": "Zonas húmedas y cálidas con luz tamizada."
    },
    "varieties": [
      {
        "varietyName": "Orbifolia",
        "botanicalName": "Goeppertia orbifolia",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 90,
          "Crecimiento": 45,
          "Floración": 25,
          "Cosecha": 10
        },
        "waterFrequencyDays": 4,
        "sunHours": 3.0,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "Maceta Salón",
        "notes": "Enormes hojas redondas surcadas por franjas verde plata y verde manzana.",
        "climateAdaptation": "Luz suave indirecta y ambiente húmedo."
      },
      {
        "varietyName": "Medallion",
        "botanicalName": "Goeppertia veitchiana 'Medallion'",
        "stageDaysToHarvest": {
          "Semilla": 170,
          "Plántula": 85,
          "Crecimiento": 45,
          "Floración": 25,
          "Cosecha": 10
        },
        "waterFrequencyDays": 4,
        "sunHours": 3.0,
        "recommendedMoisturePercent": 68,
        "recommendedBed": "Maceta Salón",
        "notes": "Patrón concéntrico ovalado semejante a un medallón pintado al óleo sobre envés borgoña.",
        "climateAdaptation": "Sombra luminosa protegida."
      },
      {
        "varietyName": "Makoyana (Pavorreal)",
        "botanicalName": "Goeppertia makoyana",
        "stageDaysToHarvest": {
          "Semilla": 170,
          "Plántula": 85,
          "Crecimiento": 45,
          "Floración": 25,
          "Cosecha": 10
        },
        "waterFrequencyDays": 4,
        "sunHours": 3.0,
        "recommendedMoisturePercent": 68,
        "recommendedBed": "Maceta Mesa",
        "notes": "Hojas finas y traslúcidas con dibujos de plumas de pavo real verde oscuro sobre fondo pálido.",
        "climateAdaptation": "Interiores cálidos con humedad."
      },
      {
        "varietyName": "Roseopicta",
        "botanicalName": "Goeppertia roseopicta",
        "stageDaysToHarvest": {
          "Semilla": 170,
          "Plántula": 85,
          "Crecimiento": 45,
          "Floración": 25,
          "Cosecha": 10
        },
        "waterFrequencyDays": 4,
        "sunHours": 3.0,
        "recommendedMoisturePercent": 68,
        "recommendedBed": "Maceta Salón",
        "notes": "Hojas elípticas oscuras bordeadas por pinceladas en tonos rosa magenta o crema vivo.",
        "climateAdaptation": "Luz filtrada sin sol."
      }
    ]
  },
  {
    "cropName": "Maranta (Planta de la oración)",
    "category": "Interior",
    "climateOverview": "Planta fascinante de interior (18-26°C) que levanta sus hojas por la noche en gesto de oración. Resalta por sus venaciones coloreadas y crecimiento rastrero o colgante.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Maranta leuconeura",
      "stageDaysToHarvest": {
        "Semilla": 160,
        "Plántula": 80,
        "Crecimiento": 40,
        "Floración": 20,
        "Cosecha": 10
      },
      "waterFrequencyDays": 4,
      "sunHours": 3.0,
      "recommendedMoisturePercent": 65,
      "recommendedBed": "Maceta Mesa / Repisa",
      "notes": "Mantener el sustrato ligeramente húmedo sin anegar. Responde al ritmo circadiano plegándose al anochecer.",
      "climateAdaptation": "Luz indirecta moderada o tamizada."
    },
    "varieties": [
      {
        "varietyName": "Leuconeura erythroneura (Tricolor / Venas rojas)",
        "botanicalName": "Maranta leuconeura var. erythroneura",
        "stageDaysToHarvest": {
          "Semilla": 160,
          "Plántula": 80,
          "Crecimiento": 40,
          "Floración": 20,
          "Cosecha": 10
        },
        "waterFrequencyDays": 4,
        "sunHours": 3.0,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Maceta Repisa",
        "notes": "Vistas nervaduras de color rojo coral en espiga sobre hojas verde oliva con manchas aterciopeladas.",
        "climateAdaptation": "Interior fresco y sombreado con humedad."
      },
      {
        "varietyName": "Leuconeura kerchoveana (Manchas verdes)",
        "botanicalName": "Maranta leuconeura var. kerchoveana",
        "stageDaysToHarvest": {
          "Semilla": 160,
          "Plántula": 80,
          "Crecimiento": 40,
          "Floración": 20,
          "Cosecha": 10
        },
        "waterFrequencyDays": 4,
        "sunHours": 3.0,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Maceta Repisa",
        "notes": "Follaje verde claro decorado con hileras de manchas verde oscuro o chocolate a ambos lados del nervio.",
        "climateAdaptation": "Luz indirecta suave o semisombra."
      }
    ]
  },
  {
    "cropName": "Espatifilo / Cuna de Moisés",
    "category": "Interior",
    "climateOverview": "Planta purificadora con elegantes espatas blancas (16-26°C). Filtra toxinas del aire e inclina sus hojas avisando con claridad cuando necesita riego.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Spathiphyllum spp.",
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
      "recommendedBed": "Maceta Salón",
      "notes": "Sustrato húmedo sin encharcar. Pulverizar las hojas en temporadas secas y mantener alejado de radiación directa.",
      "climateAdaptation": "Interior sombreado o luz difusa, dormitorios y estancias tranquilas."
    },
    "varieties": [
      {
        "varietyName": "Wallisii",
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
        "recommendedBed": "Maceta Salón",
        "notes": "Espatifilo clásico de porte medio, floración blanca recurrente y follaje verde brillante lustroso.",
        "climateAdaptation": "Luz indirecta moderada a baja."
      },
      {
        "varietyName": "Sweet Chico",
        "botanicalName": "Spathiphyllum 'Sweet Chico'",
        "stageDaysToHarvest": {
          "Semilla": 150,
          "Plántula": 75,
          "Crecimiento": 35,
          "Floración": 20,
          "Cosecha": 10
        },
        "waterFrequencyDays": 4,
        "sunHours": 2.5,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Maceta Mesa",
        "notes": "Variedad compacta de floración muy abundante y uniforme con espatas níveas erectas.",
        "climateAdaptation": "Mesas de centro o estantes interiores."
      },
      {
        "varietyName": "Domino (variegado)",
        "botanicalName": "Spathiphyllum 'Domino'",
        "stageDaysToHarvest": {
          "Semilla": 170,
          "Plántula": 85,
          "Crecimiento": 45,
          "Floración": 25,
          "Cosecha": 15
        },
        "waterFrequencyDays": 4,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 62,
        "recommendedBed": "Maceta Salón",
        "notes": "Hojas rugosas salpicadas intensamente de manchas blancas marmóreas. Precisa algo más de luz indirecta.",
        "climateAdaptation": "Luz indirecta abundante sin sol directo."
      }
    ]
  },
  {
    "cropName": "Anturio",
    "category": "Interior",
    "climateOverview": "Planta tropical de interior reconocida por sus brácteas florales cerosas y duraderas (18-28°C) o por sus imponentes hojas venadas aterciopeladas.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Anthurium spp.",
      "stageDaysToHarvest": {
        "Semilla": 200,
        "Plántula": 100,
        "Crecimiento": 50,
        "Floración": 30,
        "Cosecha": 15
      },
      "waterFrequencyDays": 5,
      "sunHours": 4.0,
      "recommendedMoisturePercent": 60,
      "recommendedBed": "Maceta Salón",
      "notes": "Regar cuando la superficie comience a secar, utilizando agua libre de cloro. Buena aireación radicular.",
      "climateAdaptation": "Luz brillante filtrada y buena humedad ambiental."
    },
    "varieties": [
      {
        "varietyName": "Andreanum Rojo",
        "botanicalName": "Anthurium andraeanum 'Red'",
        "stageDaysToHarvest": {
          "Semilla": 200,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 5,
        "sunHours": 4.0,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Maceta Salón",
        "notes": "Espata cerosa en forma de corazón color rojo fuego brillante con espádice amarillo.",
        "climateAdaptation": "Luz indirecta alta."
      },
      {
        "varietyName": "Andreanum Blanco",
        "botanicalName": "Anthurium andraeanum 'White'",
        "stageDaysToHarvest": {
          "Semilla": 200,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 5,
        "sunHours": 4.0,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Maceta Salón",
        "notes": "Elegantes espatas blancas puras muy duraderas que aportan luminosidad a espacios interiores.",
        "climateAdaptation": "Luz tamizada constante."
      },
      {
        "varietyName": "Andreanum Rosado",
        "botanicalName": "Anthurium andraeanum 'Pink'",
        "stageDaysToHarvest": {
          "Semilla": 200,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 5,
        "sunHours": 4.0,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Maceta Salón",
        "notes": "Flores cerosas en suave tono rosa pastel o salmón con floración continuada.",
        "climateAdaptation": "Luz indirecta brillante."
      },
      {
        "varietyName": "Clarinervium",
        "botanicalName": "Anthurium clarinervium",
        "stageDaysToHarvest": {
          "Semilla": 230,
          "Plántula": 115,
          "Crecimiento": 60,
          "Floración": 35,
          "Cosecha": 20
        },
        "waterFrequencyDays": 6,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Maceta Escultórica",
        "notes": "Hojas acorazonadas verde oscuro profundo con textura aterciopelada y nervios blancos relucientes.",
        "climateAdaptation": "Interior cálido, luz filtrada suave y alta humedad."
      }
    ]
  },
  {
    "cropName": "Aglaonema",
    "category": "Interior",
    "climateOverview": "Planta asiática de follaje ornamental altamente resistente y adaptable (16-28°C). Tolera luz baja y aporta llamativos colores plateados y rojizos.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Aglaonema commutatum",
      "stageDaysToHarvest": {
        "Semilla": 180,
        "Plántula": 90,
        "Crecimiento": 45,
        "Floración": 25,
        "Cosecha": 15
      },
      "waterFrequencyDays": 7,
      "sunHours": 3.0,
      "recommendedMoisturePercent": 48,
      "recommendedBed": "Maceta Salón / Oficina",
      "notes": "Riego moderado permitiendo secar el sustrato a la mitad. Excelente resistencia en oficinas e interiores.",
      "climateAdaptation": "Desde poca luz natural hasta luz difusa abundante."
    },
    "varieties": [
      {
        "varietyName": "Silver Bay",
        "botanicalName": "Aglaonema 'Silver Bay'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 90,
          "Crecimiento": 45,
          "Floración": 25,
          "Cosecha": 15
        },
        "waterFrequencyDays": 7,
        "sunHours": 2.5,
        "recommendedMoisturePercent": 48,
        "recommendedBed": "Maceta Salón",
        "notes": "Hojas anchas con un centro gris plateado luminoso enmarcado en verde oliva oscuro.",
        "climateAdaptation": "Tolerante a ambientes con baja luminosidad."
      },
      {
        "varietyName": "Creta (Roja)",
        "botanicalName": "Aglaonema 'Crete'",
        "stageDaysToHarvest": {
          "Semilla": 190,
          "Plántula": 95,
          "Crecimiento": 50,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 6,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Maceta Mesa",
        "notes": "Bordes y nervios de encendido color rojo carmín sobre fondo verde moteado. Requiere algo más de luz indirecta.",
        "climateAdaptation": "Luz indirecta media para mantener el color rojizo."
      },
      {
        "varietyName": "White Joy",
        "botanicalName": "Aglaonema 'White Joy'",
        "stageDaysToHarvest": {
          "Semilla": 200,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 6,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Maceta Mesa",
        "notes": "Hojas casi totalmente blanco nieve con finos márgenes verde bosque.",
        "climateAdaptation": "Luz indirecta brillante constante."
      }
    ]
  },
  {
    "cropName": "Peperomia",
    "category": "Interior",
    "climateOverview": "Plantas compactas semi-suculentas de porte ordenado (16-26°C). Hojas carnosas que retienen agua; ideales para mesas de centro, escritorios y repisas.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Peperomia spp.",
      "stageDaysToHarvest": {
        "Semilla": 150,
        "Plántula": 75,
        "Crecimiento": 40,
        "Floración": 20,
        "Cosecha": 10
      },
      "waterFrequencyDays": 7,
      "sunHours": 3.5,
      "recommendedMoisturePercent": 45,
      "recommendedBed": "Maceta Escritorio",
      "notes": "Regar por abajo o con precaución en la base. Evitar el exceso de humedad en raíces.",
      "climateAdaptation": "Luz indirecta moderada, oficinas y estancias iluminadas."
    },
    "varieties": [
      {
        "varietyName": "Watermelon (Argyreia / Sandía)",
        "botanicalName": "Peperomia argyreia",
        "stageDaysToHarvest": {
          "Semilla": 150,
          "Plántula": 75,
          "Crecimiento": 40,
          "Floración": 20,
          "Cosecha": 10
        },
        "waterFrequencyDays": 6,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Maceta Mesa",
        "notes": "Hojas carnosas que imitan a la perfección la cáscara de una sandía con rayas plateadas y pecíolos rojos.",
        "climateAdaptation": "Luz tamizada abundante."
      },
      {
        "varietyName": "Obtusifolia Verde",
        "botanicalName": "Peperomia obtusifolia",
        "stageDaysToHarvest": {
          "Semilla": 150,
          "Plántula": 75,
          "Crecimiento": 40,
          "Floración": 20,
          "Cosecha": 10
        },
        "waterFrequencyDays": 8,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 42,
        "recommendedBed": "Maceta Repisa",
        "notes": "Hojas ovaladas muy carnosas verde oscuro lustroso. Gran aguante a riegos espaciados.",
        "climateAdaptation": "Luz indirecta o semisombra."
      },
      {
        "varietyName": "Obtusifolia Variegada",
        "botanicalName": "Peperomia obtusifolia 'Variegata'",
        "stageDaysToHarvest": {
          "Semilla": 160,
          "Plántula": 80,
          "Crecimiento": 45,
          "Floración": 20,
          "Cosecha": 10
        },
        "waterFrequencyDays": 7,
        "sunHours": 4.0,
        "recommendedMoisturePercent": 45,
        "recommendedBed": "Maceta Repisa",
        "notes": "Follaje carnoso con orlas crema y amarillo pálido en los bordes.",
        "climateAdaptation": "Luz indirecta media a alta."
      },
      {
        "varietyName": "Caperata Esmeralda",
        "botanicalName": "Peperomia caperata 'Emerald Ripple'",
        "stageDaysToHarvest": {
          "Semilla": 150,
          "Plántula": 75,
          "Crecimiento": 40,
          "Floración": 20,
          "Cosecha": 10
        },
        "waterFrequencyDays": 6,
        "sunHours": 3.0,
        "recommendedMoisturePercent": 48,
        "recommendedBed": "Maceta Escritorio",
        "notes": "Hojas acorazonadas con llamativa textura arrugada en relieve y espigas florales en forma de ratón.",
        "climateAdaptation": "Luz filtrada moderada."
      }
    ]
  },
  {
    "cropName": "Palmas de interior",
    "category": "Interior",
    "climateOverview": "Palmeras tropicales adaptadas a interiores luminosos (17-28°C). Aportan frescura, altura y elegancia natural mientras purifican el aire.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Arecaceae spp.",
      "stageDaysToHarvest": {
        "Semilla": 240,
        "Plántula": 120,
        "Crecimiento": 60,
        "Floración": 30,
        "Cosecha": 15
      },
      "waterFrequencyDays": 5,
      "sunHours": 4.0,
      "recommendedMoisturePercent": 58,
      "recommendedBed": "Maceta Grande Suelo",
      "notes": "Mantener humedad moderada sin que el agua quede estancada en el plato. Pulverizar en días secos.",
      "climateAdaptation": "Salones amplios, recibidores y salas iluminadas."
    },
    "varieties": [
      {
        "varietyName": "Areca (Dypsis lutescens)",
        "botanicalName": "Dypsis lutescens",
        "stageDaysToHarvest": {
          "Semilla": 240,
          "Plántula": 120,
          "Crecimiento": 60,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 4,
        "sunHours": 4.5,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Maceta Salón",
        "notes": "Troncos múltiples en caña amarilla y frondas arqueadas plumosas. Gran poder purificador.",
        "climateAdaptation": "Luz indirecta brillante constante."
      },
      {
        "varietyName": "Chamaedorea elegans (Palma de salón)",
        "botanicalName": "Chamaedorea elegans",
        "stageDaysToHarvest": {
          "Semilla": 200,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 25,
          "Cosecha": 15
        },
        "waterFrequencyDays": 6,
        "sunHours": 3.0,
        "recommendedMoisturePercent": 55,
        "recommendedBed": "Maceta Mediana",
        "notes": "Palmera enana compacta muy resistente a condiciones de poca luz y calefacción.",
        "climateAdaptation": "Excelente para estancias con luz moderada o semisombra."
      },
      {
        "varietyName": "Raphis excelsa (Palma dama)",
        "botanicalName": "Rhapis excelsa",
        "stageDaysToHarvest": {
          "Semilla": 260,
          "Plántula": 130,
          "Crecimiento": 65,
          "Floración": 35,
          "Cosecha": 20
        },
        "waterFrequencyDays": 6,
        "sunHours": 3.0,
        "recommendedMoisturePercent": 52,
        "recommendedBed": "Maceta Suelo",
        "notes": "Frondas palmadas en abanico sobre tallos revestidos de fibra marrón. Sumamente resistente y sofisticada.",
        "climateAdaptation": "Luz indirecta o sombra luminosa."
      }
    ]
  },
  {
    "cropName": "Helechos",
    "category": "Interior",
    "climateOverview": "Plantas ancestrales de frondas exuberantes (16-25°C). Demandan humedad ambiental constante, sustrato aireado y luz difusa sin sol directo.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Polypodiopsida spp.",
      "stageDaysToHarvest": {
        "Semilla": 180,
        "Plántula": 90,
        "Crecimiento": 45,
        "Floración": 20,
        "Cosecha": 10
      },
      "waterFrequencyDays": 3,
      "sunHours": 2.5,
      "recommendedMoisturePercent": 72,
      "recommendedBed": "Maceta Colgante",
      "notes": "Mantener el sustrato siempre húmedo sin encharcar. Pulverizar regularmente con agua blanda.",
      "climateAdaptation": "Baños luminosos, cocinas y rincones frescos húmedos."
    },
    "varieties": [
      {
        "varietyName": "Boston (Nephrolepis exaltata)",
        "botanicalName": "Nephrolepis exaltata 'Bostoniensis'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 90,
          "Crecimiento": 45,
          "Floración": 20,
          "Cosecha": 10
        },
        "waterFrequencyDays": 3,
        "sunHours": 3.0,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "Maceta Colgante",
        "notes": "Frondas largas plumosas arqueadas en cascada verde viva. Excelente purificador.",
        "climateAdaptation": "Luz difusa y buena humedad ambiental."
      },
      {
        "varietyName": "Culantrillo (Adiantum)",
        "botanicalName": "Adiantum capillus-veneris",
        "stageDaysToHarvest": {
          "Semilla": 170,
          "Plántula": 85,
          "Crecimiento": 40,
          "Floración": 20,
          "Cosecha": 10
        },
        "waterFrequencyDays": 3,
        "sunHours": 2.5,
        "recommendedMoisturePercent": 75,
        "recommendedBed": "Maceta Mesa / Baño",
        "notes": "Folíolos triangulares delicadísimos sobre peciolos negros finos como alambre.",
        "climateAdaptation": "Humedad ambiental alta constante y sombra luminosa."
      },
      {
        "varietyName": "Cuerno de alce (Platycerium bifurcatum)",
        "botanicalName": "Platycerium bifurcatum",
        "stageDaysToHarvest": {
          "Semilla": 220,
          "Plántula": 110,
          "Crecimiento": 55,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 5,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Soporte Epífito / Maceta",
        "notes": "Frondas fértiles ramificadas como astas de ciervo cubiertas de vellosidad plateada protectora.",
        "climateAdaptation": "Luz indirecta brillante y buena ventilación."
      }
    ]
  },
  {
    "cropName": "Drácena / Tronco de Brasil",
    "category": "Interior",
    "climateOverview": "Plantas estructurales arbóreas de interior (16-28°C). Muy resistentes al aire seco y capaces de prosperar en espacios de trabajo y salones.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Dracaena spp.",
      "stageDaysToHarvest": {
        "Semilla": 210,
        "Plántula": 105,
        "Crecimiento": 50,
        "Floración": 30,
        "Cosecha": 15
      },
      "waterFrequencyDays": 7,
      "sunHours": 3.5,
      "recommendedMoisturePercent": 48,
      "recommendedBed": "Maceta Suelo",
      "notes": "Dejar secar el sustrato entre riegos. Sensible a excesos de agua en la base del tronco.",
      "climateAdaptation": "Luz indirecta moderada a media."
    },
    "varieties": [
      {
        "varietyName": "Fragrans (Massangeana / Tronco de Brasil)",
        "botanicalName": "Dracaena fragrans 'Massangeana'",
        "stageDaysToHarvest": {
          "Semilla": 210,
          "Plántula": 105,
          "Crecimiento": 50,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 7,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 48,
        "recommendedBed": "Maceta Suelo",
        "notes": "Tronco leñoso con penacho de hojas anchas cruzadas por una ancha banda central amarilla lima.",
        "climateAdaptation": "Interiores templados y luminosos."
      },
      {
        "varietyName": "Marginata",
        "botanicalName": "Dracaena reflexa var. angustifolia (D. marginata)",
        "stageDaysToHarvest": {
          "Semilla": 200,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 25,
          "Cosecha": 15
        },
        "waterFrequencyDays": 8,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 45,
        "recommendedBed": "Maceta Suelo",
        "notes": "Tallos esbeltos coronados por cintas estrechas con bordes rojizos muy definidas.",
        "climateAdaptation": "Luz indirecta o semisombra."
      },
      {
        "varietyName": "Reflexa (Pleomele / Canción de la India)",
        "botanicalName": "Dracaena reflexa 'Song of India'",
        "stageDaysToHarvest": {
          "Semilla": 210,
          "Plántula": 105,
          "Crecimiento": 50,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 7,
        "sunHours": 4.0,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Maceta Salón",
        "notes": "Hojas lanceoladas dispuestas en espiral con márgenes amarillo dorado intenso.",
        "climateAdaptation": "Luz indirecta brillante."
      }
    ]
  },
  {
    "cropName": "Begonia",
    "category": "Interior",
    "climateOverview": "Plantas de hojas policromáticas y asimétricas (17-26°C). Follajes con motas plateadas, espirales y reflejos satinados que decoran cualquier estancia.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Begonia spp.",
      "stageDaysToHarvest": {
        "Semilla": 160,
        "Plántula": 80,
        "Crecimiento": 40,
        "Floración": 25,
        "Cosecha": 10
      },
      "waterFrequencyDays": 4,
      "sunHours": 4.0,
      "recommendedMoisturePercent": 60,
      "recommendedBed": "Maceta Mesa",
      "notes": "Regar por la base evitando mojar el follaje directamente para prevenir hongos foliares.",
      "climateAdaptation": "Luz brillante tamizada sin sol directo."
    },
    "varieties": [
      {
        "varietyName": "Maculata (Polka Dot)",
        "botanicalName": "Begonia maculata",
        "stageDaysToHarvest": {
          "Semilla": 160,
          "Plántula": 80,
          "Crecimiento": 40,
          "Floración": 25,
          "Cosecha": 10
        },
        "waterFrequencyDays": 4,
        "sunHours": 4.0,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Maceta Mesa",
        "notes": "Hojas en forma de ala de ángel verde oliva con lunares plateados en el haz y envés rojo carmín.",
        "climateAdaptation": "Luz indirecta abundante sin sol directo."
      },
      {
        "varietyName": "Rex",
        "botanicalName": "Begonia rex-cultorum",
        "stageDaysToHarvest": {
          "Semilla": 160,
          "Plántula": 80,
          "Crecimiento": 40,
          "Floración": 25,
          "Cosecha": 10
        },
        "waterFrequencyDays": 5,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 62,
        "recommendedBed": "Maceta Mesa",
        "notes": "Follaje espectacular con remolinos en espiral y zonas plateadas, púrpuras y verdes.",
        "climateAdaptation": "Luz tamizada suave y ambiente húmedo."
      },
      {
        "varietyName": "Coccinea (Ala de ángel)",
        "botanicalName": "Begonia coccinea",
        "stageDaysToHarvest": {
          "Semilla": 160,
          "Plántula": 80,
          "Crecimiento": 40,
          "Floración": 25,
          "Cosecha": 10
        },
        "waterFrequencyDays": 5,
        "sunHours": 4.0,
        "recommendedMoisturePercent": 58,
        "recommendedBed": "Maceta Salón",
        "notes": "Porte de caña erguido con racimos colgantes de flores rojas o corales muy vistosas.",
        "climateAdaptation": "Luz difusa brillante."
      }
    ]
  },
  {
    "cropName": "Singonio (Syngonium)",
    "category": "Interior",
    "climateOverview": "Planta tropical de interior versátil con hojas en punta de flecha (16-28°C). Funciona como trepadora en tutor o en macetas colgantes frondosas.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Syngonium podophyllum",
      "stageDaysToHarvest": {
        "Semilla": 170,
        "Plántula": 85,
        "Crecimiento": 45,
        "Floración": 25,
        "Cosecha": 15
      },
      "waterFrequencyDays": 5,
      "sunHours": 3.5,
      "recommendedMoisturePercent": 55,
      "recommendedBed": "Maceta Repisa / Colgante",
      "notes": "Riego moderado cuando el sustrato comience a secar. Crece con rapidez y vigor.",
      "climateAdaptation": "Luz indirecta moderada a brillante."
    },
    "varieties": [
      {
        "varietyName": "Podophyllum verde",
        "botanicalName": "Syngonium podophyllum",
        "stageDaysToHarvest": {
          "Semilla": 170,
          "Plántula": 85,
          "Crecimiento": 45,
          "Floración": 25,
          "Cosecha": 15
        },
        "waterFrequencyDays": 5,
        "sunHours": 3.0,
        "recommendedMoisturePercent": 55,
        "recommendedBed": "Maceta Repisa",
        "notes": "Forma clásica de punta de flecha en verde esmeralda con venaciones claras.",
        "climateAdaptation": "Gran adaptación a luz media o difusa."
      },
      {
        "varietyName": "Pink Allusion",
        "botanicalName": "Syngonium podophyllum 'Pink Allusion'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 90,
          "Crecimiento": 45,
          "Floración": 25,
          "Cosecha": 15
        },
        "waterFrequencyDays": 5,
        "sunHours": 4.0,
        "recommendedMoisturePercent": 55,
        "recommendedBed": "Maceta Mesa",
        "notes": "Hojas compactas con tonalidades rosa pastel y nervaduras rojizas delicadas.",
        "climateAdaptation": "Luz indirecta generosa para vigorizar el tono rosáceo."
      },
      {
        "varietyName": "White Butterfly",
        "botanicalName": "Syngonium podophyllum 'White Butterfly'",
        "stageDaysToHarvest": {
          "Semilla": 170,
          "Plántula": 85,
          "Crecimiento": 45,
          "Floración": 25,
          "Cosecha": 15
        },
        "waterFrequencyDays": 5,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 55,
        "recommendedBed": "Maceta Colgante",
        "notes": "Centro blanco verdoso suave que simula las alas de una mariposa enmarcado en verde hoja.",
        "climateAdaptation": "Luz tamizada constante."
      }
    ]
  },
  {
    "cropName": "Crotón",
    "category": "Interior",
    "climateOverview": "Arbusto tropical con estallido de color en el follaje (18-29°C). Necesita abundante luminosidad indirecta para manifestar sus vivos tonos amarillos, naranjas y rojos.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Codiaeum variegatum",
      "stageDaysToHarvest": {
        "Semilla": 210,
        "Plántula": 105,
        "Crecimiento": 50,
        "Floración": 30,
        "Cosecha": 15
      },
      "waterFrequencyDays": 5,
      "sunHours": 5.0,
      "recommendedMoisturePercent": 58,
      "recommendedBed": "Maceta Salón Soleado",
      "notes": "Requiere buena luz para evitar la caída de hojas basales y conservar sus colores vivos.",
      "climateAdaptation": "Cerca de ventanas con abundante luz filtrada o sol matutino suave."
    },
    "varieties": [
      {
        "varietyName": "Petra",
        "botanicalName": "Codiaeum variegatum 'Petra'",
        "stageDaysToHarvest": {
          "Semilla": 210,
          "Plántula": 105,
          "Crecimiento": 50,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 5,
        "sunHours": 5.0,
        "recommendedMoisturePercent": 58,
        "recommendedBed": "Maceta Salón",
        "notes": "Hojas anchas coriáceas con nervios en tonos amarillo limón, naranja fuego y rojo rubí.",
        "climateAdaptation": "Luz brillante indirecta."
      },
      {
        "varietyName": "Mammy",
        "botanicalName": "Codiaeum variegatum 'Mammy'",
        "stageDaysToHarvest": {
          "Semilla": 210,
          "Plántula": 105,
          "Crecimiento": 50,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 5,
        "sunHours": 5.0,
        "recommendedMoisturePercent": 58,
        "recommendedBed": "Maceta Salón",
        "notes": "Hojas estrechas y rizadas en espiral con llamativos contrastes morados, rojos y amarillos.",
        "climateAdaptation": "Luz indirecta muy alta."
      },
      {
        "varietyName": "Gold Dust",
        "botanicalName": "Codiaeum variegatum 'Gold Dust'",
        "stageDaysToHarvest": {
          "Semilla": 200,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 6,
        "sunHours": 4.5,
        "recommendedMoisturePercent": 55,
        "recommendedBed": "Maceta Salón",
        "notes": "Follaje verde oscuro profusamente salpicado de diminutas manchas amarillas como polvo de oro.",
        "climateAdaptation": "Espacios interiores luminosos."
      }
    ]
  },
  {
    "cropName": "Cinta / Mala madre (Chlorophytum)",
    "category": "Interior",
    "climateOverview": "Planta clásica de interior sumamente agradecida y purificadora (13-27°C). Emite estolones colgantes con hijuelos ('hijos') de gran valor decorativo.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Chlorophytum comosum",
      "stageDaysToHarvest": {
        "Semilla": 150,
        "Plántula": 75,
        "Crecimiento": 35,
        "Floración": 20,
        "Cosecha": 10
      },
      "waterFrequencyDays": 6,
      "sunHours": 3.5,
      "recommendedMoisturePercent": 50,
      "recommendedBed": "Maceta Colgante",
      "notes": "Tolera descuidos de riego gracias a sus raíces carnosas tuberosas. Gran capacidad purificadora del aire.",
      "climateAdaptation": "Desde estancias semisombreadas hasta luz tamizada brillante."
    },
    "varieties": [
      {
        "varietyName": "Comosum variegatum (borde blanco)",
        "botanicalName": "Chlorophytum comosum 'Variegatum'",
        "stageDaysToHarvest": {
          "Semilla": 150,
          "Plántula": 75,
          "Crecimiento": 35,
          "Floración": 20,
          "Cosecha": 10
        },
        "waterFrequencyDays": 6,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Maceta Colgante",
        "notes": "Cintas arqueadas de centro verde esmeralda y rebordes exteriores blanco crema continuos.",
        "climateAdaptation": "Luz indirecta moderada o alta."
      },
      {
        "varietyName": "Vittatum (centro blanco)",
        "botanicalName": "Chlorophytum comosum 'Vittatum'",
        "stageDaysToHarvest": {
          "Semilla": 150,
          "Plántula": 75,
          "Crecimiento": 35,
          "Floración": 20,
          "Cosecha": 10
        },
        "waterFrequencyDays": 6,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Maceta Colgante",
        "notes": "Franja central ancha blanca pura o marfil rodeada por bordes verde oscuro.",
        "climateAdaptation": "Luz difusa y ambientes templados."
      }
    ]
  },
  {
    "cropName": "Cactus y suculentas de interior",
    "category": "Interior",
    "climateOverview": "Plantas crasas y cactáceas ideales para interiores (15-28°C). Almacenan agua en hojas o tallos y demandan muy poco mantenimiento.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Succulentae spp.",
      "stageDaysToHarvest": {
        "Semilla": 180,
        "Plántula": 90,
        "Crecimiento": 45,
        "Floración": 25,
        "Cosecha": 10
      },
      "waterFrequencyDays": 10,
      "sunHours": 4.5,
      "recommendedMoisturePercent": 35,
      "recommendedBed": "Maceta Ventana / Escritorio",
      "notes": "Riego profundo solo cuando el sustrato esté seco por completo. Sustrato arenoso con muy buen drenaje.",
      "climateAdaptation": "Alféizares de ventanas soleadas o interiores ventilados con buena luz natural."
    },
    "varieties": [
      {
        "varietyName": "Crassula ovata (Árbol de Jade)",
        "botanicalName": "Crassula ovata",
        "stageDaysToHarvest": {
          "Semilla": 200,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 30,
          "Cosecha": 15
        },
        "waterFrequencyDays": 10,
        "sunHours": 4.5,
        "recommendedMoisturePercent": 35,
        "recommendedBed": "Maceta Mesa Soleada",
        "notes": "Porte de bonsái arbóreo con hojas carnosas ovaladas verde jade que adquieren bordes rojizos con luz solar.",
        "climateAdaptation": "Luz abundante y sol matutino suave."
      },
      {
        "varietyName": "Haworthia attenuata (Cebra)",
        "botanicalName": "Haworthiopsis attenuata",
        "stageDaysToHarvest": {
          "Semilla": 170,
          "Plántula": 85,
          "Crecimiento": 40,
          "Floración": 20,
          "Cosecha": 10
        },
        "waterFrequencyDays": 9,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 35,
        "recommendedBed": "Maceta Escritorio",
        "notes": "Roseta compacta con tubérculos blancos en relieve que forman franjas de cebra. Tolera sombra mejor que otros cactus.",
        "climateAdaptation": "Luz indirecta brillante o sol tamizado."
      },
      {
        "varietyName": "Schlumbergera (Cactus de Navidad)",
        "botanicalName": "Schlumbergera bridgesii / truncata",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 90,
          "Crecimiento": 45,
          "Floración": 25,
          "Cosecha": 10
        },
        "waterFrequencyDays": 6,
        "sunHours": 3.5,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Maceta Repisa",
        "notes": "Cactus epífito de selva tropical sin espinas con llamativa floración invernal en fucsia, rojo o blanco.",
        "climateAdaptation": "Luz indirecta suave, sin sol directo abrasador."
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
  const indoorKeywords = [
    'monstera', 'pothos', 'potus', 'miami', 'epipremnum', 'sansevieria', 'lengua de suegra',
    'zamioculca', 'zz', 'ficus', 'filodendro', 'philodendron', 'calatea', 'calathea',
    'maranta', 'espatifilo', 'cuna de moisés', 'moises', 'anturio', 'anthurium',
    'aglaonema', 'peperomia', 'palma', 'areca', 'chamaedorea', 'raphis', 'helecho',
    'culantrillo', 'cuerno de alce', 'drácena', 'dracena', 'tronco de brasil',
    'begonia', 'singonio', 'syngonium', 'crotón', 'croton', 'cinta', 'mala madre',
    'chlorophytum', 'cactus', 'suculenta', 'crassula', 'jade', 'haworthia',
    'schlumbergera', 'interior'
  ];
  if (indoorKeywords.some(kw => lower.includes(kw))) {
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

  // Plantas de interior
  if (lower.includes('monstera') || lower.includes('costilla')) {
    return { imageUrl: '/crops/acelga.svg', imageAlt: 'Monstera de interior' };
  }
  if (lower.includes('pothos') || lower.includes('potus') || lower.includes('miami')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Pothos / Miami de interior' };
  }
  if (lower.includes('sansevieria') || lower.includes('lengua de suegra')) {
    return { imageUrl: '/crops/cebolla.svg', imageAlt: 'Sansevieria de interior' };
  }
  if (lower.includes('zamioculca') || lower.includes('zz')) {
    return { imageUrl: '/crops/espinaca.svg', imageAlt: 'Zamioculca ZZ de interior' };
  }
  if (lower.includes('ficus')) {
    return { imageUrl: '/crops/albahaca.svg', imageAlt: 'Ficus de interior' };
  }
  if (lower.includes('filodendro') || lower.includes('philodendron')) {
    return { imageUrl: '/crops/acelga.svg', imageAlt: 'Filodendro de interior' };
  }
  if (lower.includes('calatea') || lower.includes('calathea')) {
    return { imageUrl: '/crops/lechuga.svg', imageAlt: 'Calatea de interior' };
  }
  if (lower.includes('maranta')) {
    return { imageUrl: '/crops/lechuga.svg', imageAlt: 'Maranta de interior' };
  }
  if (lower.includes('espatifilo') || lower.includes('moisés') || lower.includes('moises')) {
    return { imageUrl: '/crops/calendula.svg', imageAlt: 'Espatifilo de interior' };
  }
  if (lower.includes('anturio') || lower.includes('anthurium')) {
    return { imageUrl: '/crops/calendula.svg', imageAlt: 'Anturio de interior' };
  }
  if (lower.includes('aglaonema')) {
    return { imageUrl: '/crops/lechuga.svg', imageAlt: 'Aglaonema de interior' };
  }
  if (lower.includes('peperomia')) {
    return { imageUrl: '/crops/albahaca.svg', imageAlt: 'Peperomia de interior' };
  }
  if (lower.includes('palma') || lower.includes('areca') || lower.includes('chamaedorea') || lower.includes('raphis')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Palma de interior' };
  }
  if (lower.includes('helecho') || lower.includes('culantrillo') || lower.includes('cuerno de alce')) {
    return { imageUrl: '/crops/cilantro.svg', imageAlt: 'Helecho de interior' };
  }
  if (lower.includes('drácena') || lower.includes('dracena') || lower.includes('tronco de brasil') || lower.includes('pleomele')) {
    return { imageUrl: '/crops/cebolla.svg', imageAlt: 'Drácena de interior' };
  }
  if (lower.includes('begonia')) {
    return { imageUrl: '/crops/calendula.svg', imageAlt: 'Begonia de interior' };
  }
  if (lower.includes('singonio') || lower.includes('syngonium')) {
    return { imageUrl: '/crops/espinaca.svg', imageAlt: 'Singonio de interior' };
  }
  if (lower.includes('crotón') || lower.includes('croton')) {
    return { imageUrl: '/crops/pimiento.svg', imageAlt: 'Crotón de interior' };
  }
  if (lower.includes('cinta') || lower.includes('mala madre') || lower.includes('chlorophytum')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Cinta / Mala madre de interior' };
  }
  if (lower.includes('cactus') || lower.includes('suculenta') || lower.includes('crassula') || lower.includes('jade') || lower.includes('haworthia') || lower.includes('schlumbergera') || lower.includes('echeveria')) {
    return { imageUrl: '/crops/rabano.svg', imageAlt: 'Cactus o suculenta de interior' };
  }

  // Plantas de exterior / huerta
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
