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
    "category": "Plantas de Huerta"
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
    "category": "Plantas de Huerta"
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
    "category": "Plantas de Huerta"
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
    "category": "Plantas de Huerta"
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
    "category": "Plantas de Huerta"
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
    "category": "Plantas de Huerta"
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
    "category": "Plantas de Huerta"
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
    "category": "Plantas de Huerta"
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
    "category": "Plantas de Huerta"
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
    "category": "Plantas de Huerta"
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
    "category": "Plantas de Huerta"
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
    "category": "Plantas de Huerta"
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
    "category": "Plantas de Huerta"
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
    "category": "Plantas de Huerta"
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
    "category": "Plantas de Huerta"
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
    "category": "Plantas de Huerta"
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
    "category": "Plantas de Huerta"
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
    "category": "Plantas de Huerta"
  },
  {
    "cropName": "Lavanda",
    "climateOverview": "Aromática subarbustiva mediterránea a pleno sol directo, suelos calizos pedregosos y excelente drenaje. Atrae abejas y polinizadores, repele pulgones y polillas.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Lavandula spp.",
      "stageDaysToHarvest": {
        "Semilla": 120,
        "Plántula": 70,
        "Crecimiento": 35,
        "Floración": 15,
        "Cosecha": 0
      },
      "waterFrequencyDays": 5,
      "sunHours": 7.5,
      "recommendedMoisturePercent": 40,
      "recommendedBed": "Bancal Aromático Seco",
      "climateAdaptation": "Pleno sol seco y templado",
      "notes": "Riego escaso dejando secar el sustrato entre riegos. Podar las espigas secas tras la floración para mantener porte redondeado."
    },
    "varieties": [
      {
        "varietyName": "Dentata (francesa)",
        "botanicalName": "Lavandula dentata",
        "stageDaysToHarvest": {
          "Semilla": 110,
          "Plántula": 65,
          "Crecimiento": 30,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 42,
        "recommendedBed": "Bordura Aromática Frontal",
        "climateAdaptation": "Clima templado a cálido",
        "notes": "Hojas dentadas verde grisáceas aromáticas y espigas violetas de floración casi continua."
      },
      {
        "varietyName": "Angustifolia (inglesa)",
        "botanicalName": "Lavandula angustifolia",
        "stageDaysToHarvest": {
          "Semilla": 120,
          "Plántula": 75,
          "Crecimiento": 40,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 5,
        "sunHours": 8.0,
        "recommendedMoisturePercent": 38,
        "recommendedBed": "Rocalla o Bancal Soleado",
        "climateAdaptation": "Templado con inviernos frescos",
        "notes": "La lavanda verdadera con la fragancia más dulce, floral y relajante, muy valorada para aceites e infusiones."
      },
      {
        "varietyName": "Stoechas (mariposa)",
        "botanicalName": "Lavandula stoechas (Cantueso)",
        "stageDaysToHarvest": {
          "Semilla": 115,
          "Plántula": 68,
          "Crecimiento": 32,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 5,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 40,
        "recommendedBed": "Bancal Ácido Pedregoso",
        "climateAdaptation": "Mediterráneo soleado",
        "notes": "Inflorescencia coronada por vistosas brácteas moradas erectas que parecen alas de mariposa."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Romero",
    "climateOverview": "Arbusto perenne leñoso muy rústico, con hojas aciculares resinosas y flores azulinas o lilas. Excelente repelente de plagas en la huerta.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Salvia rosmarinus (Rosmarinus officinalis)",
      "stageDaysToHarvest": {
        "Semilla": 120,
        "Plántula": 70,
        "Crecimiento": 35,
        "Floración": 15,
        "Cosecha": 0
      },
      "waterFrequencyDays": 5,
      "sunHours": 7.5,
      "recommendedMoisturePercent": 40,
      "recommendedBed": "Esquina o Bordura Soleada",
      "climateAdaptation": "Pleno sol y suelos drenados",
      "notes": "Muy resistente a la sequía. No tolera el encharcamiento prolongado ni suelos arcillosos compactos."
    },
    "varieties": [
      {
        "varietyName": "Común (officinalis)",
        "botanicalName": "Salvia rosmarinus 'Officinalis'",
        "stageDaysToHarvest": {
          "Semilla": 120,
          "Plántula": 70,
          "Crecimiento": 35,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 5,
        "sunHours": 8.0,
        "recommendedMoisturePercent": 40,
        "recommendedBed": "Seto Bajo o Esquina de Bancal",
        "climateAdaptation": "Pleno sol",
        "notes": "Porte erguido leñoso de hasta 1-1.5 m con aroma intenso canforado, ideal para cocina y destilación."
      },
      {
        "varietyName": "Rastrero (prostratus)",
        "botanicalName": "Salvia rosmarinus 'Prostratus'",
        "stageDaysToHarvest": {
          "Semilla": 110,
          "Plántula": 65,
          "Crecimiento": 30,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 5,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 42,
        "recommendedBed": "Murete, Talud o Maceta Colgante",
        "climateAdaptation": "Pleno sol",
        "notes": "Tallos arqueados rastreros que caen en cascada sobre muretes o jardineras con densa floración celeste."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Albahaca",
    "climateOverview": "Herbácea anual o perenne de hojas tiernas sumamente aromáticas. Compañera ideal del tomate: repele moscas blancas, trips y realza el sabor.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Ocimum basilicum",
      "stageDaysToHarvest": {
        "Semilla": 55,
        "Plántula": 35,
        "Crecimiento": 20,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 6.0,
      "recommendedMoisturePercent": 68,
      "recommendedBed": "Junto al Tomatero o Mesa de Cultivo",
      "climateAdaptation": "Cálido y templado soleado",
      "notes": "Pellizcar brotes terminales para favorecer ramificación y evitar que florezca prematuramente."
    },
    "varieties": [
      {
        "varietyName": "Genovesa",
        "botanicalName": "Ocimum basilicum 'Genovese'",
        "stageDaysToHarvest": {
          "Semilla": 55,
          "Plántula": 35,
          "Crecimiento": 20,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 68,
        "recommendedBed": "Bancal de Huerta",
        "climateAdaptation": "Cálido soleado",
        "notes": "Hojas anchas abombadas verde brillante con aroma dulce anisado insustituible para pesto y salsas."
      },
      {
        "varietyName": "Morada",
        "botanicalName": "Ocimum basilicum 'Purpurascens' (Dark Opal)",
        "stageDaysToHarvest": {
          "Semilla": 60,
          "Plántula": 38,
          "Crecimiento": 22,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Bordura de Huerto o Maceta",
        "climateAdaptation": "Cálido a pleno sol",
        "notes": "Hojas moradas profundas casi negras con matices cobrizos y notas ligeramente especiadas a clavo."
      },
      {
        "varietyName": "Limón",
        "botanicalName": "Ocimum basilicum var. citriodorum",
        "stageDaysToHarvest": {
          "Semilla": 55,
          "Plántula": 35,
          "Crecimiento": 18,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 66,
        "recommendedBed": "Jardinera Aromática",
        "climateAdaptation": "Cálido y templado",
        "notes": "Aroma cítrico penetrante a lima limón, excelente para infusiones, aderezos y pescados."
      },
      {
        "varietyName": "Tailandesa",
        "botanicalName": "Ocimum basilicum var. thyrsiflora (Thai Basil)",
        "stageDaysToHarvest": {
          "Semilla": 60,
          "Plántula": 36,
          "Crecimiento": 20,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 68,
        "recommendedBed": "Bancal Aromático Cálido",
        "climateAdaptation": "Cálido húmedo",
        "notes": "Tallos púrpuras, hojas lanceoladas con notas marcadas de anís estrellado y regaliz, clave en cocina asiática."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Menta",
    "climateOverview": "Herbácea perenne estolonífera de rápida expansión con aroma fresco mentolado. Estimulante digestivo y gran atrayente de polinizadores.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Mentha spp.",
      "stageDaysToHarvest": {
        "Semilla": 60,
        "Plántula": 35,
        "Crecimiento": 18,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 5.0,
      "recommendedMoisturePercent": 75,
      "recommendedBed": "Maceta Independiente (para controlar rizomas)",
      "climateAdaptation": "Semisombra o sol fresco",
      "notes": "Sembrar preferiblemente en maceta para impedir que invada otros cultivos mediante sus rizomas vigorosos."
    },
    "varieties": [
      {
        "varietyName": "Piperita",
        "botanicalName": "Mentha x piperita",
        "stageDaysToHarvest": {
          "Semilla": 60,
          "Plántula": 35,
          "Crecimiento": 18,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 5.0,
        "recommendedMoisturePercent": 75,
        "recommendedBed": "Maceta Húmeda Semisombra",
        "climateAdaptation": "Fresco a templado",
        "notes": "Alto contenido en mentol natural, aroma picante y refrescante inconfundible para té e infusiones."
      },
      {
        "varietyName": "Spicata (Hierbabuena)",
        "botanicalName": "Mentha spicata",
        "stageDaysToHarvest": {
          "Semilla": 55,
          "Plántula": 30,
          "Crecimiento": 15,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 5.5,
        "recommendedMoisturePercent": 72,
        "recommendedBed": "Jardinera de Hierbas",
        "climateAdaptation": "Templado húmedo",
        "notes": "Sabor dulce y suave mentolado, la clásica hierbabuena de mojitos, sopas, ensaladas y postres."
      },
      {
        "varietyName": "Chocolate",
        "botanicalName": "Mentha x piperita 'Chocolate'",
        "stageDaysToHarvest": {
          "Semilla": 60,
          "Plántula": 35,
          "Crecimiento": 18,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 5.0,
        "recommendedMoisturePercent": 75,
        "recommendedBed": "Maceta Gourmet",
        "climateAdaptation": "Semisombra templada",
        "notes": "Tallos oscuros con hojas redondeadas y una sutil nota aromática a cacao y menta tipo bombón."
      },
      {
        "varietyName": "Manzana",
        "botanicalName": "Mentha suaveolens (Menta manzana)",
        "stageDaysToHarvest": {
          "Semilla": 65,
          "Plántula": 38,
          "Crecimiento": 20,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 5.0,
        "recommendedMoisturePercent": 75,
        "recommendedBed": "Maceta Semisombra",
        "climateAdaptation": "Fresco y húmedo",
        "notes": "Hojas vellosas suaves con delicado toque frutal que recuerda a manzana verde fresca."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Tomillo",
    "climateOverview": "Mata leñosa perenne baja, muy rústica y resistente a la sequía. Famosa por sus propiedades antibacterianas y antisépticas gracias al timol.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Thymus spp.",
      "stageDaysToHarvest": {
        "Semilla": 80,
        "Plántula": 45,
        "Crecimiento": 25,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 4,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 45,
      "recommendedBed": "Rocalla o Bordura Soleada",
      "climateAdaptation": "Pleno sol y suelos drenados",
      "notes": "Suelo arenoso o pedregoso. Riego espaciado; el exceso de humedad encharcada pudre sus raíces finas."
    },
    "varieties": [
      {
        "varietyName": "Común",
        "botanicalName": "Thymus vulgaris",
        "stageDaysToHarvest": {
          "Semilla": 80,
          "Plántula": 45,
          "Crecimiento": 25,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 45,
        "recommendedBed": "Bancal de Aromáticas",
        "climateAdaptation": "Pleno sol",
        "notes": "Aroma profundo terroso y balsámico clásico para guisos, marinados y vahos medicinales respiratorios."
      },
      {
        "varietyName": "Limón (citriodorus)",
        "botanicalName": "Thymus citriodorus",
        "stageDaysToHarvest": {
          "Semilla": 75,
          "Plántula": 42,
          "Crecimiento": 22,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 48,
        "recommendedBed": "Jardinera Aromática Cítrica",
        "climateAdaptation": "Pleno sol a sol suave",
        "notes": "Hojas diminutas con marcado e irresistible aroma a ralladura de limón, ideal para carnes blancas y té."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Orégano",
    "climateOverview": "Planta herbácea aromática vivaz de hojas ovaladas perfumadas y flores en espigas terminales rosáceas o blancas. Potente antioxidante y antimicrobiano.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Origanum spp.",
      "stageDaysToHarvest": {
        "Semilla": 70,
        "Plántula": 40,
        "Crecimiento": 20,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 4,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 50,
      "recommendedBed": "Bancal Soleado o Jardinera",
      "climateAdaptation": "Pleno sol",
      "notes": "Cosechar las ramitas justo antes de abrir la floración para obtener la mayor concentración de aceites esenciales."
    },
    "varieties": [
      {
        "varietyName": "Común",
        "botanicalName": "Origanum vulgare",
        "stageDaysToHarvest": {
          "Semilla": 70,
          "Plántula": 40,
          "Crecimiento": 20,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Bordura de Huerta",
        "climateAdaptation": "Pleno sol templado",
        "notes": "Sabor herbáceo aromático suave indispensable en pastas, pizzas, salsas de tomate y secado tradicional."
      },
      {
        "varietyName": "Griego",
        "botanicalName": "Origanum vulgare subsp. hirtum",
        "stageDaysToHarvest": {
          "Semilla": 75,
          "Plántula": 42,
          "Crecimiento": 22,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 8.0,
        "recommendedMoisturePercent": 45,
        "recommendedBed": "Rocalla Seca Soleada",
        "climateAdaptation": "Pleno sol seco",
        "notes": "Sabor intenso, picante y penetrante con alto porcentaje de carvacrol; el orégano más valorado por chefs."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Oreganón / Orégano orejón",
    "climateOverview": "Herbácea tropical crasa perenne de hojas gruesas, aterciopeladas y suculentas con intenso aroma a orégano y menta. Ampliamente usada en la medicina tradicional y cocina caribeña/andina.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Plectranthus amboinicus (Coleus amboinicus)",
      "stageDaysToHarvest": {
        "Semilla": 60,
        "Plántula": 35,
        "Crecimiento": 18,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 4,
      "sunHours": 5.5,
      "recommendedMoisturePercent": 50,
      "recommendedBed": "Maceta de Jardín o Balcón",
      "climateAdaptation": "Cálido y templado semisombra",
      "notes": "Hojas carnosas que acumulan agua; no regar en exceso. Muy fácil propagación por esqueje de tallo."
    },
    "varieties": [
      {
        "varietyName": "Verde común",
        "botanicalName": "Plectranthus amboinicus 'Green'",
        "stageDaysToHarvest": {
          "Semilla": 60,
          "Plántula": 35,
          "Crecimiento": 18,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 5.5,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Bancal Semisombra Cálido",
        "climateAdaptation": "Cálido libre de heladas",
        "notes": "Hojas verde vivo aterciopeladas, usadas como condimento en sopas, carnes y remedio tradicional para afecciones respiratorias."
      },
      {
        "varietyName": "Variegado",
        "botanicalName": "Plectranthus amboinicus 'Variegatus'",
        "stageDaysToHarvest": {
          "Semilla": 65,
          "Plántula": 38,
          "Crecimiento": 20,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Jardinera Ornamental de Entrada",
        "climateAdaptation": "Semisombra luminosa",
        "notes": "Bordes blanco crema o marfil ondulados en hojas carnosas, sumando gran valor ornamental y aromático."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Toronjil",
    "climateOverview": "Herbácea vivaz con aroma cítrico a limón fresco y propiedades relajantes, sedantes suaves y digestivas. Muy atrayente de abejas por su néctar abundante.",
    "generalInfo": {
      "varietyName": "Melissa officinalis",
      "botanicalName": "Melissa officinalis",
      "stageDaysToHarvest": {
        "Semilla": 70,
        "Plántula": 40,
        "Crecimiento": 20,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 5.5,
      "recommendedMoisturePercent": 65,
      "recommendedBed": "Rincón Semisombra Fresco",
      "climateAdaptation": "Templado a fresco húmedo",
      "notes": "Prefiere suelos ricos y frescos sin sol achicharrante de mediodía. Cosechar hojas tiernas antes de la floración."
    },
    "varieties": [
      {
        "varietyName": "Melissa officinalis",
        "botanicalName": "Melissa officinalis L.",
        "stageDaysToHarvest": {
          "Semilla": 70,
          "Plántula": 40,
          "Crecimiento": 20,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 5.5,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Bancal de Infusiones",
        "climateAdaptation": "Semisombra templada",
        "notes": "Hojas rugosas dentadas con aroma limpio a limón para tisanas calmantes contra el insomnio y la tensión nerviosa."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Limonaria / Limoncillo",
    "climateOverview": "Gramínea cespitosa perenne de gran porte que forma densas matas de hojas acintadas glaucas con alto contenido de citral (aroma a hierbalimón).",
    "generalInfo": {
      "varietyName": "Cymbopogon citratus",
      "botanicalName": "Cymbopogon citratus",
      "stageDaysToHarvest": {
        "Semilla": 90,
        "Plántula": 50,
        "Crecimiento": 25,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 60,
      "recommendedBed": "Macizo Perimetral o Gran Macetón",
      "climateAdaptation": "Pleno sol templado a cálido",
      "notes": "Excelente repelente de mosquitos y malezas. Cosechar los tallos engrosados basales para sopas, curris e infusiones."
    },
    "varieties": [
      {
        "varietyName": "Cymbopogon citratus",
        "botanicalName": "Cymbopogon citratus (Hierba Luisa / Lemongrass)",
        "stageDaysToHarvest": {
          "Semilla": 90,
          "Plántula": 50,
          "Crecimiento": 25,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Bordura de Huerta",
        "climateAdaptation": "Pleno sol",
        "notes": "Porte de 1 a 1.5 m con aroma cítrico dulce. Proteger de heladas fuertes."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Eneldo",
    "climateOverview": "Herbácea anual de la familia de las apiáceas con hojas finamente divididas plumosas y umbelas amarillas aromáticas. Atrae crisopas y mariquitas benéficas.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Anethum graveolens",
      "stageDaysToHarvest": {
        "Semilla": 65,
        "Plántula": 40,
        "Crecimiento": 20,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 6.5,
      "recommendedMoisturePercent": 60,
      "recommendedBed": "Bancal de Huerta Mixta",
      "climateAdaptation": "Templado soleado",
      "notes": "Siembra directa preferible ya que su raíz pivotante sufre con los trasplantes. Regar regularmente sin encharcar."
    },
    "varieties": [
      {
        "varietyName": "Mammoth",
        "botanicalName": "Anethum graveolens 'Mammoth'",
        "stageDaysToHarvest": {
          "Semilla": 70,
          "Plántula": 42,
          "Crecimiento": 22,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Bancal de Cosecha",
        "climateAdaptation": "Pleno sol",
        "notes": "Variedad gigante (hasta 1 m) de gran producción de semillas y follaje para encurtidos y conservas."
      },
      {
        "varietyName": "Bouquet",
        "botanicalName": "Anethum graveolens 'Bouquet'",
        "stageDaysToHarvest": {
          "Semilla": 60,
          "Plántula": 38,
          "Crecimiento": 18,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Jardinera o Huerto Urbano",
        "climateAdaptation": "Templado",
        "notes": "Porte más compacto y floración temprana con umbelas florales densas muy aromáticas."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Estragón",
    "climateOverview": "Aromática perenne de hojas lanceoladas aromáticas de sabor refinado anisado con notas a pimienta dulce, pilar de las finas hierbas culinarias.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Artemisia dracunculus",
      "stageDaysToHarvest": {
        "Semilla": 75,
        "Plántula": 45,
        "Crecimiento": 22,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 6.0,
      "recommendedMoisturePercent": 55,
      "recommendedBed": "Bancal Aromático Fértil",
      "climateAdaptation": "Templado soleado o semisombra ligera",
      "notes": "Suelo drenado rico en compost. Evitar exceso de nitrógeno que atenúa su sabor aromático característico."
    },
    "varieties": [
      {
        "varietyName": "Francés",
        "botanicalName": "Artemisia dracunculus var. sativa",
        "stageDaysToHarvest": {
          "Semilla": 75,
          "Plántula": 45,
          "Crecimiento": 22,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 55,
        "recommendedBed": "Jardinera Gourmet",
        "climateAdaptation": "Templado",
        "notes": "El verdadero estragón culinario, dulce y anisado, estéril (se reproduce exclusivamente por esquejes o división)."
      },
      {
        "varietyName": "Ruso",
        "botanicalName": "Artemisia dracunculus var. inodora",
        "stageDaysToHarvest": {
          "Semilla": 70,
          "Plántula": 40,
          "Crecimiento": 20,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Bancal Rústico",
        "climateAdaptation": "Muy resistente al frío y sequía",
        "notes": "Porte más vigoroso y rústico, con sabor más suave y amargo, fértil por semilla."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Laurel",
    "climateOverview": "Árbol o arbusto perennifolio mediterráneo de hojas coriáceas verde oscuro brillante altamente aromáticas, esencial en guisos, caldos y adobos.",
    "generalInfo": {
      "varietyName": "Laurus nobilis",
      "botanicalName": "Laurus nobilis",
      "stageDaysToHarvest": {
        "Semilla": 180,
        "Plántula": 110,
        "Crecimiento": 50,
        "Floración": 15,
        "Cosecha": 0
      },
      "waterFrequencyDays": 4,
      "sunHours": 6.5,
      "recommendedMoisturePercent": 50,
      "recommendedBed": "Maceta Grande o Esquina de Huerto",
      "climateAdaptation": "Pleno sol o semisombra",
      "notes": "Muy longevo y resistente. Tolera podas de formación como pirámides o arbolitos. Riego moderado."
    },
    "varieties": [
      {
        "varietyName": "Laurus nobilis",
        "botanicalName": "Laurus nobilis (Laurel de cocina)",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 110,
          "Crecimiento": 50,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Esquina Soleada del Jardín",
        "climateAdaptation": "Templado mediterráneo",
        "notes": "Hojas elípticas onduladas que se utilizan frescas o secas para aromatizar cocciones lentas."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Sábila / Aloe",
    "climateOverview": "Suculenta xerófita perenne con hojas carnosas dispuestas en roseta basal, provista de abundante acíbar y gel transparente regenerador celular y cicatrizante.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Aloe spp.",
      "stageDaysToHarvest": {
        "Semilla": 200,
        "Plántula": 120,
        "Crecimiento": 60,
        "Floración": 20,
        "Cosecha": 0
      },
      "waterFrequencyDays": 7,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 35,
      "recommendedBed": "Rocalla o Maceta de Barro",
      "climateAdaptation": "Pleno sol o sol filtrado cálido",
      "notes": "Sustrato arenoso muy permeable. Riego espaciado dejando secar la tierra; sensible a heladas y pudrición por exceso de agua."
    },
    "varieties": [
      {
        "varietyName": "Aloe vera (Barbadensis Miller)",
        "botanicalName": "Aloe barbadensis Miller",
        "stageDaysToHarvest": {
          "Semilla": 200,
          "Plántula": 120,
          "Crecimiento": 60,
          "Floración": 20,
          "Cosecha": 0
        },
        "waterFrequencyDays": 7,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 35,
        "recommendedBed": "Macetero de Huerto Medicinal",
        "climateAdaptation": "Cálido soleado",
        "notes": "La especie medicinal por excelencia; hojas carnosas de hasta 50 cm repletas de gel cicatrizante para quemaduras y piel."
      },
      {
        "varietyName": "Aloe arborescens",
        "botanicalName": "Aloe arborescens (Planta pulpo)",
        "stageDaysToHarvest": {
          "Semilla": 220,
          "Plántula": 130,
          "Crecimiento": 65,
          "Floración": 20,
          "Cosecha": 0
        },
        "waterFrequencyDays": 7,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 35,
        "recommendedBed": "Jardín Xérico Exterior",
        "climateAdaptation": "Pleno sol",
        "notes": "Porte arbustivo ramificado con vistosas espigas florales rojo anaranjadas en invierno y alta concentración terapéutica."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Caléndula",
    "climateOverview": "Flor benéfica indispensable en el huerto: atrae abejas y polinizadores, repele nematodos y plagas, y sus flores son medicinales y comestibles.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Calendula spp.",
      "stageDaysToHarvest": {
        "Semilla": 60,
        "Plántula": 40,
        "Crecimiento": 22,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 6.5,
      "recommendedMoisturePercent": 60,
      "recommendedBed": "Bancal de Huerto o Bordura",
      "climateAdaptation": "Clima templado a fresco",
      "notes": "Cosechar capítulos florales abiertos para estimular nuevas flores continuas. Pétalos útiles en pomadas calmantes."
    },
    "varieties": [
      {
        "varietyName": "Officinalis",
        "botanicalName": "Calendula officinalis L. (Maravilla)",
        "stageDaysToHarvest": {
          "Semilla": 60,
          "Plántula": 38,
          "Crecimiento": 20,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Compañera de Tomates y Lechugas",
        "climateAdaptation": "Templado",
        "notes": "Grandes flores naranja y amarillo vivo muy ricas en flavonoides para ungüentos y afecciones de la piel."
      },
      {
        "varietyName": "Arvensis",
        "botanicalName": "Calendula arvensis (Caléndula silvestre)",
        "stageDaysToHarvest": {
          "Semilla": 55,
          "Plántula": 35,
          "Crecimiento": 18,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 55,
        "recommendedBed": "Pradera Polinizadora",
        "climateAdaptation": "Pleno sol rústico",
        "notes": "Especie silvestre más menuda, muy rústica y autosiembra espontánea en los márgenes de los bancales."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Manzanilla",
    "climateOverview": "Herbácea aromática anual o vivaz con pequeñas cabezuelas florales con pétalos blancos y botón central amarillo cónico, célebre por su acción sedante y antiespasmódica.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Matricaria / Chamaemelum",
      "stageDaysToHarvest": {
        "Semilla": 60,
        "Plántula": 35,
        "Crecimiento": 18,
        "Floración": 8,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 6.0,
      "recommendedMoisturePercent": 60,
      "recommendedBed": "Bancal de Flor Medicinal",
      "climateAdaptation": "Templado soleado",
      "notes": "Cosechar las cabezuelas florales en días secos y soleados justo cuando los pétalos están horizontales."
    },
    "varieties": [
      {
        "varietyName": "Dulce / Alemana (Matricaria chamomilla)",
        "botanicalName": "Matricaria chamomilla (Matricaria recutita)",
        "stageDaysToHarvest": {
          "Semilla": 60,
          "Plántula": 35,
          "Crecimiento": 18,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Bancal de Infusiones",
        "climateAdaptation": "Templado soleado",
        "notes": "Anual de receptáculo floral cónico hueco y dulce aroma a manzana, ideal para tisanas digestivas y relajantes."
      },
      {
        "varietyName": "Romana (Chamaemelum nobile)",
        "botanicalName": "Chamaemelum nobile",
        "stageDaysToHarvest": {
          "Semilla": 65,
          "Plántula": 38,
          "Crecimiento": 20,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 62,
        "recommendedBed": "Tapizante Aromático o Maceta",
        "climateAdaptation": "Templado a fresco",
        "notes": "Perenne de porte rastrero tapizante con flores más amargas y potente acción tónica estomacal."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Llantén",
    "climateOverview": "Herbácea perenne rústica de hojas radicales en roseta con nervaduras longitudinales pronunciadas. Extraordinaria planta depurativa, cicatrizante y antiinflamatoria.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Plantago spp.",
      "stageDaysToHarvest": {
        "Semilla": 60,
        "Plántula": 35,
        "Crecimiento": 18,
        "Floración": 8,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 5.5,
      "recommendedMoisturePercent": 65,
      "recommendedBed": "Bordura de Huerta o Rincón Fresco",
      "climateAdaptation": "Clima templado a frío",
      "notes": "Suelo compacto o fresco. Planta muy adaptable que resiste pisoteo y no exige cuidados intensivos."
    },
    "varieties": [
      {
        "varietyName": "Mayor (Plantago major)",
        "botanicalName": "Plantago major",
        "stageDaysToHarvest": {
          "Semilla": 60,
          "Plántula": 35,
          "Crecimiento": 18,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 5.5,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Huerto Medicinal",
        "climateAdaptation": "Templado a frío",
        "notes": "Hojas anchas ovaladas carnosas en roseta basal con espigas cilíndricas largas; hojas ricas en mucílagos y taninos."
      },
      {
        "varietyName": "Menor (Plantago lanceolata)",
        "botanicalName": "Plantago lanceolata (Llantén menor / Siete venas)",
        "stageDaysToHarvest": {
          "Semilla": 55,
          "Plántula": 32,
          "Crecimiento": 16,
          "Floración": 7,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Bancal Rústico",
        "climateAdaptation": "Templado",
        "notes": "Hojas estrechas lanceoladas erectas muy valoradas en jarabes para calmar la tos y afecciones de garganta."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Prontoalivio",
    "climateOverview": "Arbusto aromático medicinal andino y tropical de ramas flexibles y hojas muy olorosas con flores diminutas rosadas o violáceas. Utilizado popularmente para aliviar cólicos, dolores y catarros.",
    "generalInfo": {
      "varietyName": "Lippia alba",
      "botanicalName": "Lippia alba",
      "stageDaysToHarvest": {
        "Semilla": 70,
        "Plántula": 40,
        "Crecimiento": 20,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 6.5,
      "recommendedMoisturePercent": 60,
      "recommendedBed": "Bancal de Hierbas Medicinales",
      "climateAdaptation": "Cálido y templado soleado",
      "notes": "Fácil propagación por estacas. Riego moderado y poda regular para mantener mata densa y follaje tierno."
    },
    "varieties": [
      {
        "varietyName": "Lippia alba",
        "botanicalName": "Lippia alba (Salvia morada / Prontoalivio)",
        "stageDaysToHarvest": {
          "Semilla": 70,
          "Plántula": 40,
          "Crecimiento": 20,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Bancal Aromático Tradicional",
        "climateAdaptation": "Cálido a templado",
        "notes": "Hojas aserradas con intenso aroma mentolado alimonado, indispensable en el botiquín verde casero."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Diente de león",
    "climateOverview": "Herbácea perenne vivaz con hojas profundamente dentadas en roseta, flor dorada solitaria y aquenios plumosos (vilano). Planta depurativa hepática y renal de primer orden.",
    "generalInfo": {
      "varietyName": "Taraxacum officinale",
      "botanicalName": "Taraxacum officinale",
      "stageDaysToHarvest": {
        "Semilla": 50,
        "Plántula": 30,
        "Crecimiento": 15,
        "Floración": 7,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 6.0,
      "recommendedMoisturePercent": 65,
      "recommendedBed": "Bancal de Hojas Verdes o Silvestre",
      "climateAdaptation": "Clima templado a frío",
      "notes": "Hojas amargas comestibles en ensaladas jóvenes y raíz secada utilizada como sustituto saludable del café."
    },
    "varieties": [
      {
        "varietyName": "Taraxacum officinale",
        "botanicalName": "Taraxacum officinale Weber",
        "stageDaysToHarvest": {
          "Semilla": 50,
          "Plántula": 30,
          "Crecimiento": 15,
          "Floración": 7,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Huerto Casero Multiuso",
        "climateAdaptation": "Templado a frío",
        "notes": "Toda la planta es comestible y medicinal; gran bioacumulador de minerales en el suelo."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Ruda",
    "climateOverview": "Subarbusto perenne leñoso de hojas azuladas glandulares con aroma muy penetrante y característico. Gran guardiana del huerto: repele insectos, pulgones y orugas.",
    "generalInfo": {
      "varietyName": "Ruta graveolens",
      "botanicalName": "Ruta graveolens",
      "stageDaysToHarvest": {
        "Semilla": 90,
        "Plántula": 50,
        "Crecimiento": 25,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 5,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 40,
      "recommendedBed": "Esquina Protectora de Huerto",
      "climateAdaptation": "Pleno sol y suelos secos",
      "notes": "Manejar con precaución y guantes en horas de sol: su savia puede provocar fotosensibilidad cutánea en personas susceptibles."
    },
    "varieties": [
      {
        "varietyName": "Ruta graveolens",
        "botanicalName": "Ruta graveolens L.",
        "stageDaysToHarvest": {
          "Semilla": 90,
          "Plántula": 50,
          "Crecimiento": 25,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 5,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 40,
        "recommendedBed": "Borde Protector de Bancal",
        "climateAdaptation": "Pleno sol",
        "notes": "Flores amarillas de 4-5 pétalos ondulados. Planta protectora tradicional de huertos y hogares."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Anamú",
    "climateOverview": "Herbácea perenne rústica erecta de follaje con aroma fuerte aliáceo (olor a ajo silvestre). Reconocida planta tradicional con propiedades inmunoestimulantes y analgésicas.",
    "generalInfo": {
      "varietyName": "Petiveria alliacea",
      "botanicalName": "Petiveria alliacea",
      "stageDaysToHarvest": {
        "Semilla": 80,
        "Plántula": 45,
        "Crecimiento": 22,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 5.5,
      "recommendedMoisturePercent": 60,
      "recommendedBed": "Bancal Medicinal Semisombra",
      "climateAdaptation": "Tropical y templado cálido",
      "notes": "Riego moderado y suelo fértil con buen drenaje. Follaje con flores diminutas blancas en espigas delgadas."
    },
    "varieties": [
      {
        "varietyName": "Petiveria alliacea",
        "botanicalName": "Petiveria alliacea L. (Hierba de las gallinitas)",
        "stageDaysToHarvest": {
          "Semilla": 80,
          "Plántula": 45,
          "Crecimiento": 22,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 5.5,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Huerto Medicinal Tradicional",
        "climateAdaptation": "Cálido",
        "notes": "Hojas elípticas alternas ricas en compuestos azufrados y flavonoides de alto interés etnobotánico."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Moringa",
    "climateOverview": "Árbol caducifolio o perennifolio de crecimiento ultrarrápido apodado 'el árbol de la vida' por el valor nutricional excepcional de sus hojas, flores y vainas.",
    "generalInfo": {
      "varietyName": "Moringa oleifera",
      "botanicalName": "Moringa oleifera",
      "stageDaysToHarvest": {
        "Semilla": 90,
        "Plántula": 50,
        "Crecimiento": 25,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 4,
      "sunHours": 7.5,
      "recommendedMoisturePercent": 45,
      "recommendedBed": "Suelo o Macetón Profundo Exterior",
      "climateAdaptation": "Pleno sol cálido y seco",
      "notes": "Gran resistencia a sequías gracias a su raíz tuberosa. Podar la punta para que no crezca solo hacia arriba y produzca muchas hojas tiernas."
    },
    "varieties": [
      {
        "varietyName": "Moringa oleifera",
        "botanicalName": "Moringa oleifera Lam.",
        "stageDaysToHarvest": {
          "Semilla": 90,
          "Plántula": 50,
          "Crecimiento": 25,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 8.0,
        "recommendedMoisturePercent": 45,
        "recommendedBed": "Fondo Soleado de Huerto",
        "climateAdaptation": "Cálido a templado",
        "notes": "Hojas compuestas de alto valor en proteínas, calcio y vitamina C que se cosechan regularmente para batidos y guisos."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Valeriana",
    "climateOverview": "Herbácea vivaz perenne de tallos acanalados y umbelas de flores aromáticas blancas o rosadas. Famosa por sus raíces de contrastado efecto tranquilizante y favorecedor del sueño.",
    "generalInfo": {
      "varietyName": "Valeriana officinalis",
      "botanicalName": "Valeriana officinalis",
      "stageDaysToHarvest": {
        "Semilla": 150,
        "Plántula": 90,
        "Crecimiento": 45,
        "Floración": 15,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 5.5,
      "recommendedMoisturePercent": 70,
      "recommendedBed": "Bancal Húmedo Rico en Humus",
      "climateAdaptation": "Clima templado a frío húmedo",
      "notes": "Prefiere sustratos húmedos y ricos. Las raíces se cosechan al segundo año de cultivo durante el reposo otoñal."
    },
    "varieties": [
      {
        "varietyName": "Valeriana officinalis",
        "botanicalName": "Valeriana officinalis L.",
        "stageDaysToHarvest": {
          "Semilla": 150,
          "Plántula": 90,
          "Crecimiento": 45,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 5.5,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "Bancal de Raíces Medicinales",
        "climateAdaptation": "Templado a frío",
        "notes": "Inflorescencias dulcefragantes y rizomas subterráneos con valepotriatos y ácido valerénico."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Ajenjo",
    "climateOverview": "Herbácea perenne leñosa en la base de aspecto plateado cenizo sedoso y sabor amargo muy característico. Excepcional repelente de insectos y tónico digestivo tradicional.",
    "generalInfo": {
      "varietyName": "Artemisia absinthium",
      "botanicalName": "Artemisia absinthium",
      "stageDaysToHarvest": {
        "Semilla": 90,
        "Plántula": 50,
        "Crecimiento": 25,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 4,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 45,
      "recommendedBed": "Bordura Seca Soleada",
      "climateAdaptation": "Pleno sol y suelos drenados",
      "notes": "Tolera suelos áridos y pobres. Se prepara en maceración acuosa para fumigar ecológicamente contra pulgones y orugas."
    },
    "varieties": [
      {
        "varietyName": "Artemisia absinthium",
        "botanicalName": "Artemisia absinthium L. (Hierba santa)",
        "stageDaysToHarvest": {
          "Semilla": 90,
          "Plántula": 50,
          "Crecimiento": 25,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 45,
        "recommendedBed": "Perímetro Bioinsecticida",
        "climateAdaptation": "Pleno sol",
        "notes": "Hojas divididas cubiertas de vellosidad blanca sedosa con principios activos amargos (absintina)."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
  {
    "cropName": "Sauco",
    "climateOverview": "Arbusto o árbol pequeño de rápido desarrollo con corimbos densos de flores blancas muy aromáticas y bayas oscuras, apreciado tradicionalmente para jarabes contra la gripe y el resfriado.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Sambucus spp.",
      "stageDaysToHarvest": {
        "Semilla": 180,
        "Plántula": 100,
        "Crecimiento": 50,
        "Floración": 15,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 6.0,
      "recommendedMoisturePercent": 65,
      "recommendedBed": "Linde o Seto Silvestre de Huerta",
      "climateAdaptation": "Templado a frío con humedad",
      "notes": "Suelo fresco fértil y riego regular. Flores comestibles en infusión o fritas en masa; bayas maduras cocidas en jarabes."
    },
    "varieties": [
      {
        "varietyName": "Sambucus nigra",
        "botanicalName": "Sambucus nigra (Sauco europeo)",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Seto Vivo Medicinal",
        "climateAdaptation": "Templado",
        "notes": "Corimbos planos de flores blancas con aroma almizclado dulce y bayas negro violáceas ricas en antocianinas."
      },
      {
        "varietyName": "Sambucus peruviana",
        "botanicalName": "Sambucus peruviana (Sauco andino)",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 68,
        "recommendedBed": "Bancal de Clima Frío Andino",
        "climateAdaptation": "Clima frío de montaña (1800-3000 msnm)",
        "notes": "Árbol andino muy vigoroso adaptado a zonas altas con excelente producción de flores pectorales."
      }
    ],
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)"
  },
    {
    "cropName": "Veranera / Buganvilla (Bougainvillea)",
    "climateOverview": "Arbusto trepador vigoroso y muy rústico para exteriores a pleno sol directo y clima cálido a templado. Excepcional resistencia a sequías y profusa floración de brácteas coloreadas.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Bougainvillea spp.",
      "stageDaysToHarvest": {
        "Semilla": 180,
        "Plántula": 90,
        "Crecimiento": 45,
        "Floración": 15,
        "Cosecha": 0
      },
      "waterFrequencyDays": 5,
      "sunHours": 7.5,
      "recommendedMoisturePercent": 40,
      "recommendedBed": "Muro o Pérgola Exterior",
      "climateAdaptation": "Pleno sol cálido y seco",
      "notes": "Riego espaciado dejando secar el sustrato entre riegos. El exceso de humedad inhibe la floración y produce solo follaje verde."
    },
    "varieties": [
      {
        "varietyName": "Fucsia",
        "botanicalName": "Bougainvillea spectabilis 'Fuchsia'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 90,
          "Crecimiento": 45,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 5,
        "sunHours": 8.0,
        "recommendedMoisturePercent": 40,
        "recommendedBed": "Muro o Pérgola Exterior",
        "climateAdaptation": "Pleno sol",
        "notes": "Brácteas fucsia magenta vibrantes muy densas y de crecimiento trepador enérgico sobre muros y celosías."
      },
      {
        "varietyName": "Blanca",
        "botanicalName": "Bougainvillea 'White Pride'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 90,
          "Crecimiento": 45,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 5,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 40,
        "recommendedBed": "Fachada o Valla Exterior",
        "climateAdaptation": "Pleno sol",
        "notes": "Brácteas blanco puro muy elegante que contrastan con follaje verde oscuro profundo."
      },
      {
        "varietyName": "Naranja",
        "botanicalName": "Bougainvillea 'Orange King'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 90,
          "Crecimiento": 45,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 5,
        "sunHours": 8.0,
        "recommendedMoisturePercent": 40,
        "recommendedBed": "Arco o Muro Soleado",
        "climateAdaptation": "Pleno sol",
        "notes": "Espectacular tono naranja cobrizo que vira a salmón dorado con la exposición solar directa."
      },
      {
        "varietyName": "Variegada",
        "botanicalName": "Bougainvillea 'Variegata'",
        "stageDaysToHarvest": {
          "Semilla": 190,
          "Plántula": 95,
          "Crecimiento": 50,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 5,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 42,
        "recommendedBed": "Macetero o Muro Exterior",
        "climateAdaptation": "Pleno sol",
        "notes": "Follaje bicolor verde orlado de crema o amarillo marfil con brácteas magenta intenso."
      },
      {
        "varietyName": "Enana",
        "botanicalName": "Bougainvillea 'Pixie' / 'Bambino'",
        "stageDaysToHarvest": {
          "Semilla": 150,
          "Plántula": 75,
          "Crecimiento": 35,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 45,
        "recommendedBed": "Maceta Exterior de Terraza",
        "climateAdaptation": "Pleno sol a sol directo",
        "notes": "Porte arbustivo compacto sin espinas agresivas, ideal para macetones, balcones y borduras."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Novios / Geranios (Pelargonium)",
    "climateOverview": "Clásicas plantas florales de exterior para balcones, jardineras y patios soleados. Floración continua, hojas aromáticas aterciopeladas y gran resistencia a vientos.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Pelargonium spp.",
      "stageDaysToHarvest": {
        "Semilla": 90,
        "Plántula": 55,
        "Crecimiento": 30,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 6.5,
      "recommendedMoisturePercent": 55,
      "recommendedBed": "Jardinera de Balcón",
      "climateAdaptation": "Templado exterior soleado",
      "notes": "Retirar flores y hojas secas periódicamente para estimular floración constante. Regar en la base sin mojar el follaje."
    },
    "varieties": [
      {
        "varietyName": "Zonal (novio de jardín)",
        "botanicalName": "Pelargonium zonale",
        "stageDaysToHarvest": {
          "Semilla": 90,
          "Plántula": 55,
          "Crecimiento": 30,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 55,
        "recommendedBed": "Bancal o Jardinera Frontal",
        "climateAdaptation": "Exterior soleado",
        "notes": "Porte erguido, hojas con anillo oscuro concéntrico (zona) y umbelas densas de tonos vivos."
      },
      {
        "varietyName": "Colgante / Hiedra",
        "botanicalName": "Pelargonium peltatum",
        "stageDaysToHarvest": {
          "Semilla": 85,
          "Plántula": 50,
          "Crecimiento": 28,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 55,
        "recommendedBed": "Cesta Colgante Exterior",
        "climateAdaptation": "Balcones y alféizares",
        "notes": "Tallos rastreros y péndulos de hojas carnosas estilo hiedra, perfecto para colgar en cascada."
      },
      {
        "varietyName": "Pensamiento (real)",
        "botanicalName": "Pelargonium domesticum / grandiflorum",
        "stageDaysToHarvest": {
          "Semilla": 95,
          "Plántula": 60,
          "Crecimiento": 35,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 5.5,
        "recommendedMoisturePercent": 58,
        "recommendedBed": "Jardinera Semisombra Fresca",
        "climateAdaptation": "Clima templado a fresco",
        "notes": "Flores grandes aterciopeladas con manchas oscuras centrales similares a los pensamientos reales."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "San Joaquín / Hibisco (Hibiscus rosa-sinensis)",
    "climateOverview": "Arbusto perenne tropical y subtropical de flores acampanadas llamativas con pistilo sobresaliente prominente. Requiere sol directo para florecer todo el año.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Hibiscus rosa-sinensis",
      "stageDaysToHarvest": {
        "Semilla": 120,
        "Plántula": 70,
        "Crecimiento": 35,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 65,
      "recommendedBed": "Jardín Exterior Soleado",
      "climateAdaptation": "Cálido y templado exterior",
      "notes": "Suelo rico en nutrientes con drenaje impecable. Agradece fertilizaciones ricas en potasio durante floración."
    },
    "varieties": [
      {
        "varietyName": "Rojo doble",
        "botanicalName": "Hibiscus rosa-sinensis 'Rubro-plenus'",
        "stageDaysToHarvest": {
          "Semilla": 120,
          "Plántula": 70,
          "Crecimiento": 35,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Seto Floral Exterior",
        "climateAdaptation": "Pleno sol",
        "notes": "Flores de pétalos múltiples densos y color escarlata profundo que semejan rosas tropicales."
      },
      {
        "varietyName": "Amarillo sencillo",
        "botanicalName": "Hibiscus rosa-sinensis 'Yellow Submarine'",
        "stageDaysToHarvest": {
          "Semilla": 110,
          "Plántula": 65,
          "Crecimiento": 30,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 62,
        "recommendedBed": "Bancal Exterior Central",
        "climateAdaptation": "Pleno sol",
        "notes": "Flores sencillas de 5 pétalos amarillo canario brillante con centro granate o rojo vivo."
      },
      {
        "varietyName": "Salmón",
        "botanicalName": "Hibiscus rosa-sinensis 'Salmon Queen'",
        "stageDaysToHarvest": {
          "Semilla": 115,
          "Plántula": 68,
          "Crecimiento": 32,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 64,
        "recommendedBed": "Macizo Floral Exterior",
        "climateAdaptation": "Pleno sol a sol parcial",
        "notes": "Cálido matiz melocotón y salmón pastel muy florífero durante los meses de alta insolación."
      },
      {
        "varietyName": "Variegado",
        "botanicalName": "Hibiscus rosa-sinensis 'Cooperi'",
        "stageDaysToHarvest": {
          "Semilla": 130,
          "Plántula": 75,
          "Crecimiento": 40,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Jardín de Contraste",
        "climateAdaptation": "Pleno sol suave o semisombra",
        "notes": "Follaje espectacular tricolor jaspeado de blanco, verde y rosa con flores rojas solitarias."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Hortensia (Hydrangea macrophylla)",
    "climateOverview": "Arbusto caducifolio o perennifolio apreciado por sus gigantescas cabezuelas florales esféricas. Exige suelo ácido fértil, alta humedad y semisombra protegida del sol quemante de mediodía.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Hydrangea macrophylla",
      "stageDaysToHarvest": {
        "Semilla": 180,
        "Plántula": 120,
        "Crecimiento": 60,
        "Floración": 20,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 4.5,
      "recommendedMoisturePercent": 75,
      "recommendedBed": "Jardín Exterior Semisombra",
      "climateAdaptation": "Clima templado a fresco húmedo",
      "notes": "Suelo ácido y rico en materia orgánica. Mantener el sustrato siempre fresco sin encharcar las raíces."
    },
    "varieties": [
      {
        "varietyName": "Azul",
        "botanicalName": "Hydrangea macrophylla 'Nikko Blue'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 120,
          "Crecimiento": 60,
          "Floración": 20,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 4.5,
        "recommendedMoisturePercent": 75,
        "recommendedBed": "Suelo Ácido Semisombra",
        "climateAdaptation": "Semisombra fresca ácida",
        "notes": "Tonos azul intenso logrados mediante sulfato de aluminio o tierra ácida de pH 4.5 - 5.5."
      },
      {
        "varietyName": "Rosada",
        "botanicalName": "Hydrangea macrophylla 'Pink Diamond'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 120,
          "Crecimiento": 60,
          "Floración": 20,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 4.5,
        "recommendedMoisturePercent": 75,
        "recommendedBed": "Bancal Semisombra Neutro",
        "climateAdaptation": "Semisombra templada",
        "notes": "Inflorescencias rosa fucsia a magenta suave en sustratos neutros o ligeramente calcáreos (pH 6.0 - 6.8)."
      },
      {
        "varietyName": "Blanca",
        "botanicalName": "Hydrangea macrophylla 'Madame Emile Mouillère'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 120,
          "Crecimiento": 60,
          "Floración": 20,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 4.0,
        "recommendedMoisturePercent": 78,
        "recommendedBed": "Rincón Fresco Semisombra",
        "climateAdaptation": "Semisombra protegida",
        "notes": "Globos blancos puros luminosos que viran a verde menta suave con el paso de las semanas."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Ave del paraíso (Strelitzia)",
    "climateOverview": "Planta exótica majestuosa de hojas coriáceas verde grisáceas y flores con forma de cabeza de ave crestada. Excelente resistencia a vientos y pleno sol exterior.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Strelitzia spp.",
      "stageDaysToHarvest": {
        "Semilla": 240,
        "Plántula": 150,
        "Crecimiento": 70,
        "Floración": 25,
        "Cosecha": 0
      },
      "waterFrequencyDays": 4,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 50,
      "recommendedBed": "Césped o Macizo Exterior",
      "climateAdaptation": "Pleno sol templado a cálido",
      "notes": "Riego moderado permitiendo secar la capa superior de tierra. Excelente drenaje indispensable."
    },
    "varieties": [
      {
        "varietyName": "Reginae (clásica naranja)",
        "botanicalName": "Strelitzia reginae",
        "stageDaysToHarvest": {
          "Semilla": 240,
          "Plántula": 150,
          "Crecimiento": 70,
          "Floración": 25,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Macizo Floral Soleado",
        "climateAdaptation": "Pleno sol exterior",
        "notes": "Flor icónica con sépalos naranja brillante y pétalos azules intensos en espata horizontal rígida."
      },
      {
        "varietyName": "Nicolai (gigante blanca)",
        "botanicalName": "Strelitzia nicolai",
        "stageDaysToHarvest": {
          "Semilla": 300,
          "Plántula": 180,
          "Crecimiento": 90,
          "Floración": 30,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Jardín Amplio de Fondo",
        "climateAdaptation": "Pleno sol a sol parcial",
        "notes": "Porte arbóreo de hasta 5-7 metros con hojas monumentales tipo platanillo y flores blancas con bráctea purpúrea oscura."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Heliconias y platanillos",
    "climateOverview": "Plantas tropicales exuberantes de gran porte con brácteas colgantes o erguidas de colores intensos. Necesitan calor, abundante luz natural y humedad constante en suelo.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Heliconia spp.",
      "stageDaysToHarvest": {
        "Semilla": 200,
        "Plántula": 120,
        "Crecimiento": 60,
        "Floración": 20,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 6.0,
      "recommendedMoisturePercent": 75,
      "recommendedBed": "Bancal Húmedo de Jardín",
      "climateAdaptation": "Cálido húmedo a templado",
      "notes": "Requiere suelo rico en compost y riegos generosos sin encharcamiento prolongado."
    },
    "varieties": [
      {
        "varietyName": "Rostrata (pico de tucán)",
        "botanicalName": "Heliconia rostrata",
        "stageDaysToHarvest": {
          "Semilla": 200,
          "Plántula": 120,
          "Crecimiento": 60,
          "Floración": 20,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 75,
        "recommendedBed": "Jardín Tropical Exterior",
        "climateAdaptation": "Semisombra o sol suave",
        "notes": "Inflorescencia péndula colgante de brácteas rojo escarlata bordeadas de amarillo oro y ápice verde."
      },
      {
        "varietyName": "Psittacorum (chita)",
        "botanicalName": "Heliconia psittacorum",
        "stageDaysToHarvest": {
          "Semilla": 160,
          "Plántula": 90,
          "Crecimiento": 45,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "Bordura Tropical Exterior",
        "climateAdaptation": "Pleno sol a sol parcial",
        "notes": "Porte más bajo y compacto (1 a 1.5 m) con flores erectas anaranjadas ideales para setos y flor cortada."
      },
      {
        "varietyName": "Wagneriana",
        "botanicalName": "Heliconia wagneriana",
        "stageDaysToHarvest": {
          "Semilla": 220,
          "Plántula": 130,
          "Crecimiento": 65,
          "Floración": 20,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 78,
        "recommendedBed": "Macizo Alto de Jardín",
        "climateAdaptation": "Tropical húmedo",
        "notes": "Brácteas erectas de rosa pálido a rojo con quilla verde limón muy duraderas en la mata."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Corona de Cristo (Euphorbia milii)",
    "climateOverview": "Suculenta arbustiva leñosa provista de espinas afiladas y flores (ciatios) casi perpetuas. Extraordinaria tolerancia al calor seco y pleno sol inclemente.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Euphorbia milii",
      "stageDaysToHarvest": {
        "Semilla": 150,
        "Plántula": 90,
        "Crecimiento": 40,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 6,
      "sunHours": 7.5,
      "recommendedMoisturePercent": 35,
      "recommendedBed": "Rocalla o Jardinera Soleada",
      "climateAdaptation": "Pleno sol y sequedad",
      "notes": "Regar únicamente cuando el sustrato esté completamente seco. Su savia blanca lechosa es irritante."
    },
    "varieties": [
      {
        "varietyName": "Roja clásica",
        "botanicalName": "Euphorbia milii var. splendens 'Red'",
        "stageDaysToHarvest": {
          "Semilla": 150,
          "Plántula": 90,
          "Crecimiento": 40,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 6,
        "sunHours": 8.0,
        "recommendedMoisturePercent": 35,
        "recommendedBed": "Jardinera Soleada Exterior",
        "climateAdaptation": "Pleno sol",
        "notes": "Brácteas redondeadas color rojo carmesí brillante en ramilletes constantes."
      },
      {
        "varietyName": "Amarilla",
        "botanicalName": "Euphorbia milii 'Lutea'",
        "stageDaysToHarvest": {
          "Semilla": 150,
          "Plántula": 90,
          "Crecimiento": 40,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 6,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 35,
        "recommendedBed": "Rocalla o Maceta Exterior",
        "climateAdaptation": "Pleno sol",
        "notes": "Flores amarillo mantequilla a limón vivo que aportan contraste cálido en composiciones secas."
      },
      {
        "varietyName": "Gigante tailandesa",
        "botanicalName": "Euphorbia milii 'Poysean' (Thai Hybrid)",
        "stageDaysToHarvest": {
          "Semilla": 160,
          "Plántula": 95,
          "Crecimiento": 45,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 5,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 38,
        "recommendedBed": "Maceta de Gran Calibre",
        "climateAdaptation": "Pleno sol ventilado",
        "notes": "Hojas carnosas más anchas y brácteas gigantes de hasta 5 cm de diámetro con tonalidades jaspeadas."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Ixora",
    "climateOverview": "Arbusto leñoso de hojas brillantes coriáceas y densas inflorescencias globulares en corimbo. Apreciadísimo para setos vivos y macizos ornamentales a pleno sol o ligera semisombra.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Ixora spp.",
      "stageDaysToHarvest": {
        "Semilla": 180,
        "Plántula": 100,
        "Crecimiento": 50,
        "Floración": 15,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 6.5,
      "recommendedMoisturePercent": 60,
      "recommendedBed": "Seto Vivo Exterior",
      "climateAdaptation": "Cálido exterior a pleno sol",
      "notes": "Prefiere sustratos ligeramente ácidos y ricos en humus. Tolera muy bien la poda de formación."
    },
    "varieties": [
      {
        "varietyName": "Coccinea (roja grande)",
        "botanicalName": "Ixora coccinea",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Seto Floral de Jardín",
        "climateAdaptation": "Pleno sol",
        "notes": "Inflorescencias globosas de 8-12 cm con decenas de flores tubulares rojo fuego."
      },
      {
        "varietyName": "Enana roja",
        "botanicalName": "Ixora 'Taiwanese Dwarf Red'",
        "stageDaysToHarvest": {
          "Semilla": 150,
          "Plántula": 85,
          "Crecimiento": 40,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Bordura Baja de Jardín",
        "climateAdaptation": "Pleno sol",
        "notes": "Porte enano compacto (40-60 cm) con follaje menudo y flores rojas tupidas."
      },
      {
        "varietyName": "Enana amarilla",
        "botanicalName": "Ixora 'Taiwanese Dwarf Yellow'",
        "stageDaysToHarvest": {
          "Semilla": 150,
          "Plántula": 85,
          "Crecimiento": 40,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Bordura Baja Soleada",
        "climateAdaptation": "Pleno sol",
        "notes": "Ramilletes compactos amarillo canario muy luminosos para delinear senderos y bancales."
      },
      {
        "varietyName": "Rosada",
        "botanicalName": "Ixora 'Nora Grant' Pink",
        "stageDaysToHarvest": {
          "Semilla": 170,
          "Plántula": 95,
          "Crecimiento": 45,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 62,
        "recommendedBed": "Macizo de Arbustos",
        "climateAdaptation": "Pleno sol a sol parcial",
        "notes": "Flores rosa intenso orquídea que florecen continuamente en climas templados y cálidos."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Duranta",
    "climateOverview": "Arbusto perenne vigoroso de rápido crecimiento utilizado masivamente para setos divisorios, topiaria y jardinería exterior. Muy resistente al calor y podas repetidas.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Duranta erecta",
      "stageDaysToHarvest": {
        "Semilla": 120,
        "Plántula": 70,
        "Crecimiento": 35,
        "Floración": 15,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 55,
      "recommendedBed": "Seto o Cerramiento Exterior",
      "climateAdaptation": "Pleno sol cálido y templado",
      "notes": "Crecimiento rápido. Podar con regularidad para densificar el follaje. Sus bayas doradas son decorativas pero tóxicas si se ingieren."
    },
    "varieties": [
      {
        "varietyName": "Repens (verde común)",
        "botanicalName": "Duranta erecta 'Repens'",
        "stageDaysToHarvest": {
          "Semilla": 120,
          "Plántula": 70,
          "Crecimiento": 35,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 55,
        "recommendedBed": "Seto Divisorio Alto",
        "climateAdaptation": "Pleno sol",
        "notes": "Hojas verde intenso lustroso con racimos colgantes de flores violeta azulado y frutos anaranjados."
      },
      {
        "varietyName": "Gold / Limón",
        "botanicalName": "Duranta erecta 'Gold Mound' / 'Aurea'",
        "stageDaysToHarvest": {
          "Semilla": 120,
          "Plántula": 70,
          "Crecimiento": 35,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 55,
        "recommendedBed": "Bordura Amarilla de Contraste",
        "climateAdaptation": "Pleno sol directo",
        "notes": "Follaje amarillo dorado limón muy brillante bajo sol pleno, ideal para contrastar con plantas de follaje verde oscuro."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Eugenia (Syzygium paniculatum)",
    "climateOverview": "Arbusto o árbol pequeño de follaje denso y reluciente, célebre en paisajismo por sus brotes nuevos de color cobrizo rojizo. Perfecto para setos formales y pantallas visuales.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Syzygium paniculatum",
      "stageDaysToHarvest": {
        "Semilla": 180,
        "Plántula": 110,
        "Crecimiento": 55,
        "Floración": 20,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 6.5,
      "recommendedMoisturePercent": 60,
      "recommendedBed": "Seto Perimetral de Jardín",
      "climateAdaptation": "Pleno sol a sol parcial",
      "notes": "Acepta podas arquitectónicas frecuentes. Riego regular los primeros meses tras el trasplante hasta que desarrolle raíz profunda."
    },
    "varieties": [
      {
        "varietyName": "Seto tradicional",
        "botanicalName": "Syzygium paniculatum 'Standard'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 110,
          "Crecimiento": 55,
          "Floración": 20,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Seto Perimetral Alto",
        "climateAdaptation": "Exterior soleado",
        "notes": "Alcanza de 2 a 4 metros, excelente para privacidad perimetral con brotes rojizos espectaculares tras cada poda."
      },
      {
        "varietyName": "Enana",
        "botanicalName": "Syzygium paniculatum 'Compacta' / 'Nana'",
        "stageDaysToHarvest": {
          "Semilla": 150,
          "Plántula": 90,
          "Crecimiento": 45,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 58,
        "recommendedBed": "Bordura Baja o Topiaria",
        "climateAdaptation": "Exterior soleado",
        "notes": "Porte denso y ramificado bajo (60-120 cm), ideal para macetas cónicas o esferas podadas."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Agapanto (Agapanthus africanus)",
    "climateOverview": "Planta herbácea perenne rizomatosa con hojas acintadas arqueadas verde oscuro y majestuosas umbelas esféricas de flores celestes o blancas.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Agapanthus africanus",
      "stageDaysToHarvest": {
        "Semilla": 180,
        "Plántula": 100,
        "Crecimiento": 50,
        "Floración": 20,
        "Cosecha": 0
      },
      "waterFrequencyDays": 4,
      "sunHours": 6.5,
      "recommendedMoisturePercent": 50,
      "recommendedBed": "Bordura o Macizo Exterior",
      "climateAdaptation": "Pleno sol a semisombra",
      "notes": "Gran resistencia a la sequía gracias a sus gruesos rizomas carnosos. Riego moderado evitando el estancamiento de agua."
    },
    "varieties": [
      {
        "varietyName": "Azul",
        "botanicalName": "Agapanthus africanus 'Blue'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 20,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Macizo de Flor Azul",
        "climateAdaptation": "Pleno sol",
        "notes": "Umbelas con 30-50 flores tubulares acampanadas de color azul cielo a violeta zafiro."
      },
      {
        "varietyName": "Blanco",
        "botanicalName": "Agapanthus africanus 'Albus'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 20,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 50,
        "recommendedBed": "Bordura Blanca Iluminada",
        "climateAdaptation": "Pleno sol",
        "notes": "Flores blanco puro deslumbrantes que destacan sobre follaje denso y oscuro."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Lantana",
    "climateOverview": "Arbusto o cubresuelos rústico y sumamente florífero que tolera sol ardiente, vientos y suelos pobres. Es uno de los mayores imanes de mariposas y polinizadores.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Lantana spp.",
      "stageDaysToHarvest": {
        "Semilla": 90,
        "Plántula": 50,
        "Crecimiento": 25,
        "Floración": 10,
        "Cosecha": 0
      },
      "waterFrequencyDays": 4,
      "sunHours": 7.5,
      "recommendedMoisturePercent": 40,
      "recommendedBed": "Talud o Rocalla Soleada",
      "climateAdaptation": "Pleno sol y calor",
      "notes": "Riego espaciado y moderado. Hojas aromáticas ásperas que ahuyentan herbívoros."
    },
    "varieties": [
      {
        "varietyName": "Camara (multicolor/bandera española)",
        "botanicalName": "Lantana camara",
        "stageDaysToHarvest": {
          "Semilla": 90,
          "Plántula": 50,
          "Crecimiento": 25,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 8.0,
        "recommendedMoisturePercent": 40,
        "recommendedBed": "Arbusto Floral Frontal",
        "climateAdaptation": "Pleno sol",
        "notes": "Inflorescencias que cambian de color del amarillo al naranja y rojo en la misma cabezuela."
      },
      {
        "varietyName": "Montevidensis (morada rastrera)",
        "botanicalName": "Lantana montevidensis",
        "stageDaysToHarvest": {
          "Semilla": 80,
          "Plántula": 45,
          "Crecimiento": 22,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 42,
        "recommendedBed": "Talud Colgante o Rocalla",
        "climateAdaptation": "Pleno sol",
        "notes": "Hábito tapizante rastrero o colgante cubierto de pequeñas flores lavanda violáceo."
      },
      {
        "varietyName": "Enana amarilla",
        "botanicalName": "Lantana 'New Gold'",
        "stageDaysToHarvest": {
          "Semilla": 85,
          "Plántula": 48,
          "Crecimiento": 24,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 8.0,
        "recommendedMoisturePercent": 40,
        "recommendedBed": "Maceta o Bordura Soleada",
        "climateAdaptation": "Pleno sol",
        "notes": "Porte muy bajo y estéril que florece sin pausa con flores amarillo oro puro."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Gardenia / Jazmín del Cabo",
    "climateOverview": "Arbusto ornamental célebre por sus flores blanco ceroso de perfume embriagador inconfundible y follaje verde lustroso perenne.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Gardenia jasminoides",
      "stageDaysToHarvest": {
        "Semilla": 180,
        "Plántula": 120,
        "Crecimiento": 60,
        "Floración": 18,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 5.0,
      "recommendedMoisturePercent": 70,
      "recommendedBed": "Jardín Exterior Semisombra Ácida",
      "climateAdaptation": "Semisombra templada cálida",
      "notes": "Sustrato ácido (pH 5.0 - 6.0) bien drenado y húmedo. Aportar quelatos de hierro si aparecen hojas amarillas con venas verdes."
    },
    "varieties": [
      {
        "varietyName": "Radicans (enana)",
        "botanicalName": "Gardenia jasminoides 'Radicans'",
        "stageDaysToHarvest": {
          "Semilla": 150,
          "Plántula": 90,
          "Crecimiento": 45,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 5.0,
        "recommendedMoisturePercent": 68,
        "recommendedBed": "Bordura Aromática Baja",
        "climateAdaptation": "Semisombra",
        "notes": "Porte rastrero enano (30-50 cm) con flores dobles pequeñas muy perfumadas para bordear caminos."
      },
      {
        "varietyName": "August Beauty",
        "botanicalName": "Gardenia jasminoides 'August Beauty'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 120,
          "Crecimiento": 60,
          "Floración": 18,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 5.5,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "Macizo Floral Perfumado",
        "climateAdaptation": "Sol matutino o semisombra",
        "notes": "Grandes flores dobles de hasta 8 cm de diámetro con fragancia dulce muy potente y prolongada."
      },
      {
        "varietyName": "Cuatro estaciones",
        "botanicalName": "Gardenia jasminoides 'Four Seasons'",
        "stageDaysToHarvest": {
          "Semilla": 170,
          "Plántula": 110,
          "Crecimiento": 55,
          "Floración": 16,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 5.0,
        "recommendedMoisturePercent": 70,
        "recommendedBed": "Maceta de Terraza Protegida",
        "climateAdaptation": "Semisombra húmeda",
        "notes": "Capacidad de rebrotar flores a lo largo de varias temporadas al año en climas estables."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Petunia",
    "climateOverview": "Planta herbácea anual o perenne de exterior famosa por sus abundantes flores acampanadas en forma de trompeta con amplísima gama de colores y rápido crecimiento.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Petunia x hybrida",
      "stageDaysToHarvest": {
        "Semilla": 70,
        "Plántula": 40,
        "Crecimiento": 20,
        "Floración": 8,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 6.5,
      "recommendedMoisturePercent": 60,
      "recommendedBed": "Jardinera o Maceta Colgante",
      "climateAdaptation": "Pleno sol y ventilación",
      "notes": "Requiere buen drenaje y riegos frecuentes pero sin encharcar. Eliminar flores marchitas para asegurar brotación continua."
    },
    "varieties": [
      {
        "varietyName": "Surfinia (colgante)",
        "botanicalName": "Petunia x atkinsiana 'Surfinia'",
        "stageDaysToHarvest": {
          "Semilla": 70,
          "Plántula": 40,
          "Crecimiento": 20,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Cesta Colgante de Balcón",
        "climateAdaptation": "Pleno sol",
        "notes": "Hábito colgante vigoroso que forma cascadas florales de hasta 1 metro de longitud y tolera lluvias mejor."
      },
      {
        "varietyName": "Grandiflora",
        "botanicalName": "Petunia x hybrida 'Grandiflora'",
        "stageDaysToHarvest": {
          "Semilla": 75,
          "Plántula": 42,
          "Crecimiento": 22,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 58,
        "recommendedBed": "Bancal de Flor de Temporada",
        "climateAdaptation": "Pleno sol",
        "notes": "Flores muy grandes (8-10 cm) de pétalos aterciopelados con garganta contrastada."
      },
      {
        "varietyName": "Calibrachoa (mini petunia)",
        "botanicalName": "Calibrachoa x hybrida (Million Bells)",
        "stageDaysToHarvest": {
          "Semilla": 65,
          "Plántula": 35,
          "Crecimiento": 18,
          "Floración": 7,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Jardinera Mixta de Balcón",
        "climateAdaptation": "Pleno sol a semisombra",
        "notes": "Centenares de diminutas campanas florales autorreparables que no requieren pinzado manual de flores secas."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Cordiline / Drácena roja (Cordyline fruticosa)",
    "climateOverview": "Planta arbustiva de hojas lanceoladas erectas o arqueadas con tonalidades púrpuras, rojizas y rosadas fascinantes. Aporta un foco visual vertical de aire tropical.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Cordyline fruticosa",
      "stageDaysToHarvest": {
        "Semilla": 180,
        "Plántula": 100,
        "Crecimiento": 50,
        "Floración": 20,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 5.5,
      "recommendedMoisturePercent": 65,
      "recommendedBed": "Jardín Tropical o Maceta Exterior",
      "climateAdaptation": "Semisombra o sol filtrado cálido",
      "notes": "Evitar vientos fríos secantes. Riego moderado constante dejando secar ligeramente el sustrato entre riegos."
    },
    "varieties": [
      {
        "varietyName": "Red Sister",
        "botanicalName": "Cordyline fruticosa 'Red Sister'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 20,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Macizo de Follaje Rojo",
        "climateAdaptation": "Sol suave a semisombra",
        "notes": "Hojas de tono fucsia encendido y borgoña oscuro con alta intensidad de color."
      },
      {
        "varietyName": "Kiwi",
        "botanicalName": "Cordyline fruticosa 'Kiwi'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 20,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 5.5,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Macetero de Entrada Exterior",
        "climateAdaptation": "Semisombra luminosa",
        "notes": "Follaje variegado rayado con estrías verde lima, crema y márgenes rosa fosforescente."
      },
      {
        "varietyName": "Rubra",
        "botanicalName": "Cordyline fruticosa 'Rubra'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 100,
          "Crecimiento": 50,
          "Floración": 20,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Bancal de Fondo Tropical",
        "climateAdaptation": "Sol filtrado o semisombra",
        "notes": "Hojas anchas verde cobrizo que viran a rojo vino tinto profundo."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Achira / Canna índica",
    "climateOverview": "Herbácea rizomatosa de rápido crecimiento, hojas semejantes a las del plátano y flores llamativas amarillas, naranjas o rojas en espiga.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Canna indica",
      "stageDaysToHarvest": {
        "Semilla": 120,
        "Plántula": 70,
        "Crecimiento": 35,
        "Floración": 12,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 75,
      "recommendedBed": "Bancal Húmedo o Estanque",
      "climateAdaptation": "Pleno sol y humedad abundante",
      "notes": "Suelo muy fértil y riego frecuente; prospera incluso cerca de fuentes o estanques exteriores."
    },
    "varieties": [
      {
        "varietyName": "Roja común",
        "botanicalName": "Canna indica 'Red'",
        "stageDaysToHarvest": {
          "Semilla": 120,
          "Plántula": 70,
          "Crecimiento": 35,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 75,
        "recommendedBed": "Seto Floral Húmedo",
        "climateAdaptation": "Pleno sol",
        "notes": "Flores rojas intensas y follaje verde lustroso muy rústico."
      },
      {
        "varietyName": "Pretoria (hoja rayada)",
        "botanicalName": "Canna 'Pretoria' (Bengal Tiger)",
        "stageDaysToHarvest": {
          "Semilla": 130,
          "Plántula": 75,
          "Crecimiento": 40,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 75,
        "recommendedBed": "Macizo Tropical de Impacto",
        "climateAdaptation": "Pleno sol",
        "notes": "Hojas espectaculares rayadas de amarillo y verde con flores naranja melón luminosas."
      },
      {
        "varietyName": "Amarilla moteada",
        "botanicalName": "Canna 'Yellow King Humbert'",
        "stageDaysToHarvest": {
          "Semilla": 125,
          "Plántula": 72,
          "Crecimiento": 38,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 75,
        "recommendedBed": "Bancal Floral Soleado",
        "climateAdaptation": "Pleno sol",
        "notes": "Pétalos amarillo oro salpicados con pecas y motas rojo escarlata."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Pentas (Pentas lanceolata)",
    "climateOverview": "Arbusto floral siempreverde con racimos densos en corimbo de flores estrelladas de 5 puntas. Florece incansablemente y es un polo de atracción para colibríes y mariposas.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Pentas lanceolata",
      "stageDaysToHarvest": {
        "Semilla": 90,
        "Plántula": 50,
        "Crecimiento": 25,
        "Floración": 8,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 6.5,
      "recommendedMoisturePercent": 60,
      "recommendedBed": "Jardinera o Macizo Polinizador",
      "climateAdaptation": "Pleno sol a semisombra templada",
      "notes": "Pellizcar las flores pasadas para multiplicar nuevos brotes florales. Riego moderado constante."
    },
    "varieties": [
      {
        "varietyName": "Roja",
        "botanicalName": "Pentas lanceolata 'Red'",
        "stageDaysToHarvest": {
          "Semilla": 90,
          "Plántula": 50,
          "Crecimiento": 25,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Bancal de Polinizadores",
        "climateAdaptation": "Pleno sol",
        "notes": "Ramilletes rojo rubí vivo especialmente atrayentes para colibríes."
      },
      {
        "varietyName": "Rosada",
        "botanicalName": "Pentas lanceolata 'Pink'",
        "stageDaysToHarvest": {
          "Semilla": 90,
          "Plántula": 50,
          "Crecimiento": 25,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Jardinera Frontal",
        "climateAdaptation": "Pleno sol a semisombra",
        "notes": "Flores rosa dulce pastel de excelente durabilidad en climas cálidos y templados."
      },
      {
        "varietyName": "Lavanda",
        "botanicalName": "Pentas lanceolata 'Lavender'",
        "stageDaysToHarvest": {
          "Semilla": 90,
          "Plántula": 50,
          "Crecimiento": 25,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Macizo Floral Armónico",
        "climateAdaptation": "Pleno sol",
        "notes": "Estrellas violeta lavanda suave que combinan con follajes plateados y amarillos."
      },
      {
        "varietyName": "Blanca",
        "botanicalName": "Pentas lanceolata 'White'",
        "stageDaysToHarvest": {
          "Semilla": 90,
          "Plántula": 50,
          "Crecimiento": 25,
          "Floración": 8,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 60,
        "recommendedBed": "Jardín de Noche / Luna",
        "climateAdaptation": "Pleno sol a semisombra",
        "notes": "Blanco inmaculado resplandeciente tanto a la luz solar como bajo iluminación nocturna."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Rosas de jardín",
    "climateOverview": "La reina de las flores exteriores. Arbusto caducifolio o perennifolio de fragancia inigualable que exige al menos 6 horas de sol directo, ventilación y suelo muy nutrido.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Rosa spp.",
      "stageDaysToHarvest": {
        "Semilla": 150,
        "Plántula": 90,
        "Crecimiento": 45,
        "Floración": 15,
        "Cosecha": 0
      },
      "waterFrequencyDays": 2,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 65,
      "recommendedBed": "Macizo Floral Exterior",
      "climateAdaptation": "Clima templado exterior soleado",
      "notes": "Podas anuales de saneamiento. Regar directo a la base de la tierra para evitar manchas fúngicas en las hojas."
    },
    "varieties": [
      {
        "varietyName": "Híbrida de té",
        "botanicalName": "Rosa x hybrida de té",
        "stageDaysToHarvest": {
          "Semilla": 150,
          "Plántula": 90,
          "Crecimiento": 45,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Bancal Exclusivo de Rosas",
        "climateAdaptation": "Pleno sol ventilado",
        "notes": "Capullos cónicos elegantes solitarios sobre tallos largos, la rosa clásica de corte por excelencia."
      },
      {
        "varietyName": "Floribunda",
        "botanicalName": "Rosa floribunda",
        "stageDaysToHarvest": {
          "Semilla": 140,
          "Plántula": 85,
          "Crecimiento": 40,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Macizo Arbustivo Floral",
        "climateAdaptation": "Pleno sol",
        "notes": "Racimos tupidos de múltiples flores simultáneas que crean macizos continuos de color."
      },
      {
        "varietyName": "Rosa miniatura",
        "botanicalName": "Rosa chinensis 'Minima'",
        "stageDaysToHarvest": {
          "Semilla": 110,
          "Plántula": 65,
          "Crecimiento": 30,
          "Floración": 10,
          "Cosecha": 0
        },
        "waterFrequencyDays": 2,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 62,
        "recommendedBed": "Jardinera de Ventana o Balcón",
        "climateAdaptation": "Pleno sol directo",
        "notes": "Arbusto menudo (25-45 cm) con rosas diminutas perfectas para borduras o macetas en exterior."
      },
      {
        "varietyName": "Rosal trepador",
        "botanicalName": "Rosa arvensis / Rosa x hybrida 'Climber'",
        "stageDaysToHarvest": {
          "Semilla": 180,
          "Plántula": 110,
          "Crecimiento": 60,
          "Floración": 18,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Pérgola, Arco o Celosía",
        "climateAdaptation": "Pleno sol",
        "notes": "Largas ramas sarmentosas que cubren celosías, arcos y muros con espectaculares floraciones masivas."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Agave",
    "climateOverview": "Suculenta xerófita arquitectónica de hojas suculentas gigantes dispuestas en roseta basal rígida. Insuperable resistencia a sequías extremas y sol abrasador.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Agave spp.",
      "stageDaysToHarvest": {
        "Semilla": 365,
        "Plántula": 180,
        "Crecimiento": 90,
        "Floración": 30,
        "Cosecha": 0
      },
      "waterFrequencyDays": 10,
      "sunHours": 8.0,
      "recommendedMoisturePercent": 25,
      "recommendedBed": "Jardín Seco o Rocalla Xérica",
      "climateAdaptation": "Pleno sol árido y calor",
      "notes": "Riego muy escaso y drenaje arenoso perfecto. El exceso de humedad provoca pudrición basal inmediata."
    },
    "varieties": [
      {
        "varietyName": "Americana (variegado y azul)",
        "botanicalName": "Agave americana var. variegata / protoamericana",
        "stageDaysToHarvest": {
          "Semilla": 365,
          "Plántula": 180,
          "Crecimiento": 90,
          "Floración": 30,
          "Cosecha": 0
        },
        "waterFrequencyDays": 10,
        "sunHours": 8.5,
        "recommendedMoisturePercent": 25,
        "recommendedBed": "Rocalla Monumental Exterior",
        "climateAdaptation": "Pleno sol",
        "notes": "Rosetas majestuosas de hasta 2 metros con espinas marginales y bandas verde azuladas o márgenes amarillo crema."
      },
      {
        "varietyName": "Attenuata (cuello de cisne)",
        "botanicalName": "Agave attenuata",
        "stageDaysToHarvest": {
          "Semilla": 240,
          "Plántula": 120,
          "Crecimiento": 60,
          "Floración": 25,
          "Cosecha": 0
        },
        "waterFrequencyDays": 7,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 35,
        "recommendedBed": "Macetero Escultural de Terraza",
        "climateAdaptation": "Pleno sol suave o semisombra",
        "notes": "Agave sin espinas de hojas suaves verde glauco y elegante inflorescencia curvada en trompa de cisne."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Bromelias de sol",
    "climateOverview": "Bromelias adaptadas a pleno sol directo que acumulan agua en su roseta central 'tanque' y exhiben hojas coriáceas en tonalidades rojizas, anaranjadas y doradas.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Bromeliaceae (géneros Aechmea / Neoregelia)",
      "stageDaysToHarvest": {
        "Semilla": 200,
        "Plántula": 120,
        "Crecimiento": 60,
        "Floración": 20,
        "Cosecha": 0
      },
      "waterFrequencyDays": 4,
      "sunHours": 7.0,
      "recommendedMoisturePercent": 50,
      "recommendedBed": "Macizo Tropical Soleado",
      "climateAdaptation": "Pleno sol a sol parcial",
      "notes": "Mantener agua limpia en el centro de la roseta. Sustrato muy poroso a base de corteza, fibra y perlita."
    },
    "varieties": [
      {
        "varietyName": "Aechmea blanchetiana (naranja)",
        "botanicalName": "Aechmea blanchetiana",
        "stageDaysToHarvest": {
          "Semilla": 200,
          "Plántula": 120,
          "Crecimiento": 60,
          "Floración": 20,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 8.0,
        "recommendedMoisturePercent": 48,
        "recommendedBed": "Foco Escultural Soleado",
        "climateAdaptation": "Pleno sol directo",
        "notes": "Hojas de hasta 1 metro que bajo sol intenso adquieren un asombroso color naranja cobrizo y amarillo brillante."
      },
      {
        "varietyName": "Neoregelia fireball",
        "botanicalName": "Neoregelia 'Fireball'",
        "stageDaysToHarvest": {
          "Semilla": 160,
          "Plántula": 90,
          "Crecimiento": 45,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 52,
        "recommendedBed": "Bordura de Bromelias o Tronco",
        "climateAdaptation": "Pleno sol a sol suave",
        "notes": "Rosetas pequeñas estoloníferas compactas de color rojo fuego profundo que cubren suelo o madera."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Jazmín trepador",
    "climateOverview": "Trepadoras leñosas aromáticas para pérgolas, celosías, rejas y muros exteriores. Famosas por su perfume embriagador que inunda el jardín al atardecer y anochecer.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Jasminum / Trachelospermum / Cestrum",
      "stageDaysToHarvest": {
        "Semilla": 160,
        "Plántula": 90,
        "Crecimiento": 45,
        "Floración": 15,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 6.5,
      "recommendedMoisturePercent": 60,
      "recommendedBed": "Pérgola, Reja o Muro Soleado",
      "climateAdaptation": "Pleno sol a semisombra",
      "notes": "Guiar los tallos jóvenes mediante tutores o ataduras suaves. Riego regular asegurando un buen drenaje."
    },
    "varieties": [
      {
        "varietyName": "De la noche (Cestrum nocturnum)",
        "botanicalName": "Cestrum nocturnum (Galán de noche)",
        "stageDaysToHarvest": {
          "Semilla": 150,
          "Plántula": 85,
          "Crecimiento": 40,
          "Floración": 12,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.0,
        "recommendedMoisturePercent": 62,
        "recommendedBed": "Rincón Cercano a Ventana o Terraza",
        "climateAdaptation": "Sol matutino o semisombra",
        "notes": "Arbusto trepador con racimos de flores blanco verdoso que liberan una intensa fragancia nocturna inconfundible."
      },
      {
        "varietyName": "Estrella (Trachelospermum jasminoides)",
        "botanicalName": "Trachelospermum jasminoides (Jazmín de leche)",
        "stageDaysToHarvest": {
          "Semilla": 170,
          "Plántula": 95,
          "Crecimiento": 50,
          "Floración": 15,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 58,
        "recommendedBed": "Muro o Valla Perimetral",
        "climateAdaptation": "Pleno sol o semisombra",
        "notes": "Hojas coriáceas perennes verde oscuro y miles de florecillas blancas estrelladas con perfume dulce de jazmín."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Mussaenda",
    "climateOverview": "Arbusto o arbolito tropical decorativo caracterizado por sus grandes sépalos petaloides dilatados y vistosos que recubren casi por completo el follaje.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Mussaenda spp.",
      "stageDaysToHarvest": {
        "Semilla": 190,
        "Plántula": 110,
        "Crecimiento": 55,
        "Floración": 18,
        "Cosecha": 0
      },
      "waterFrequencyDays": 3,
      "sunHours": 6.5,
      "recommendedMoisturePercent": 65,
      "recommendedBed": "Jardín Tropical Frontal",
      "climateAdaptation": "Cálido y templado soleado",
      "notes": "Suelo húmedo bien drenado rico en compost. Proteger de heladas o vientos secos extremos."
    },
    "varieties": [
      {
        "varietyName": "Dona Luz (rosada)",
        "botanicalName": "Mussaenda 'Dona Luz'",
        "stageDaysToHarvest": {
          "Semilla": 190,
          "Plántula": 110,
          "Crecimiento": 55,
          "Floración": 18,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Macizo de Foco Tropical",
        "climateAdaptation": "Pleno sol o sol parcial",
        "notes": "Espectaculares brácteas rosado salmón intenso que envuelven las pequeñas flores tubulares estrelladas."
      },
      {
        "varietyName": "Dona Aurora (blanca)",
        "botanicalName": "Mussaenda philippica 'Dona Aurora'",
        "stageDaysToHarvest": {
          "Semilla": 190,
          "Plántula": 110,
          "Crecimiento": 55,
          "Floración": 18,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 6.5,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Jardín Blanco Iluminado",
        "climateAdaptation": "Pleno sol",
        "notes": "Hojas florales blanco marfil puro que asemejan nieve tropical sobre el verde oscuro."
      },
      {
        "varietyName": "Roja",
        "botanicalName": "Mussaenda erythrophylla 'Red'",
        "stageDaysToHarvest": {
          "Semilla": 190,
          "Plántula": 110,
          "Crecimiento": 55,
          "Floración": 18,
          "Cosecha": 0
        },
        "waterFrequencyDays": 3,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 65,
        "recommendedBed": "Bancal Floral Soleado",
        "climateAdaptation": "Pleno sol",
        "notes": "Grandes sépalos rojo terciopelo escarlata encendido de alto impacto estético."
      }
    ],
    "category": "Plantas de exterior"
  },
  {
    "cropName": "Palmas de jardín exterior",
    "climateOverview": "Palmas estilizadas y elegantes de exterior adaptadas a plena intemperie solar, jardines residenciales, patios y frentes de vivienda.",
    "generalInfo": {
      "varietyName": "No estoy seguro (Especie general)",
      "botanicalName": "Arecaceae (géneros Phoenix / Wodyetia / Hyophorbe)",
      "stageDaysToHarvest": {
        "Semilla": 300,
        "Plántula": 180,
        "Crecimiento": 90,
        "Floración": 30,
        "Cosecha": 0
      },
      "waterFrequencyDays": 4,
      "sunHours": 7.5,
      "recommendedMoisturePercent": 50,
      "recommendedBed": "Césped o Macetero Escultural Exterior",
      "climateAdaptation": "Pleno sol templado a cálido",
      "notes": "Suelo arenoso profundo bien drenado. Riego profundo espaciado y abono rico en magnesio y potasio."
    },
    "varieties": [
      {
        "varietyName": "Fénix (Phoenix roebelenii)",
        "botanicalName": "Phoenix roebelenii (Palma fénix enana)",
        "stageDaysToHarvest": {
          "Semilla": 240,
          "Plántula": 140,
          "Crecimiento": 70,
          "Floración": 25,
          "Cosecha": 0
        },
        "waterFrequencyDays": 4,
        "sunHours": 7.0,
        "recommendedMoisturePercent": 55,
        "recommendedBed": "Jardinera o Frente de Jardín",
        "climateAdaptation": "Pleno sol a semisombra",
        "notes": "Palma enana esbelta (1.5 a 2.5 m) con finas frondas arqueadas plumosas verde brillante."
      },
      {
        "varietyName": "Cola de zorro (Wodyetia bifurcata)",
        "botanicalName": "Wodyetia bifurcata (Foxtail Palm)",
        "stageDaysToHarvest": {
          "Semilla": 300,
          "Plántula": 180,
          "Crecimiento": 90,
          "Floración": 30,
          "Cosecha": 0
        },
        "waterFrequencyDays": 5,
        "sunHours": 8.0,
        "recommendedMoisturePercent": 48,
        "recommendedBed": "Jardín Abierto Soleado",
        "climateAdaptation": "Pleno sol",
        "notes": "Tronco anillado liso y frondas excepcionales con folíolos en espiral tupida semejantes a la cola de un zorro."
      },
      {
        "varietyName": "Botella (Hyophorbe verschaffeltii)",
        "botanicalName": "Hyophorbe lagenicaulis / verschaffeltii",
        "stageDaysToHarvest": {
          "Semilla": 300,
          "Plántula": 180,
          "Crecimiento": 90,
          "Floración": 30,
          "Cosecha": 0
        },
        "waterFrequencyDays": 5,
        "sunHours": 7.5,
        "recommendedMoisturePercent": 45,
        "recommendedBed": "Punto Focal Escultural",
        "climateAdaptation": "Pleno sol cálido",
        "notes": "Tronco único abombado en la base con forma de botella y corona de 4 a 6 hojas rígidas ascendentes."
      }
    ],
    "category": "Plantas de exterior"
  },
{
    "cropName": "Monstera",
    "category": "Plantas de interior",
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
    "category": "Plantas de interior",
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
    "category": "Plantas de interior",
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
    "category": "Plantas de interior",
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
    "category": "Plantas de interior",
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
    "category": "Plantas de interior",
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
    "category": "Plantas de interior",
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
    "category": "Plantas de interior",
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
    "category": "Plantas de interior",
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
    "category": "Plantas de interior",
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
    "category": "Plantas de interior",
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
    "category": "Plantas de interior",
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
    "category": "Plantas de interior",
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
    "category": "Plantas de interior",
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
    "category": "Plantas de interior",
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
    "category": "Plantas de interior",
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
    "category": "Plantas de interior",
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
    "category": "Plantas de interior",
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
    "category": "Plantas de interior",
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
    "category": "Otros complementarios y transversales (cactus, aromáticas, etc.)",
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
 * Determina a qué categoría pertenece un cultivo a partir de la base botánica y palabras clave
 */
export function inferCropCategory(cropName: string): PlantCategory {
  const match = CROPS_DATABASE.find(
    (c) => c.cropName.toLowerCase() === cropName.toLowerCase()
  );
  if (match && match.category) {
    return match.category;
  }
  const lower = cropName.toLowerCase();

  // 1. Otros complementarios y transversales (cactus, aromáticas, etc.)
  const transversalKeywords = [
    'lavanda', 'romero', 'albahaca', 'menta', 'hierbabuena', 'tomillo', 'orégano', 'oregano',
    'oreganón', 'oreganon', 'orégano orejón', 'oregano orejon', 'toronjil', 'melissa',
    'limonaria', 'limoncillo', 'cymbopogon', 'eneldo', 'estragón', 'estragon',
    'laurel', 'sábila', 'sabila', 'aloe', 'caléndula', 'calendula',
    'manzanilla', 'chamomilla', 'llantén', 'llanten', 'plantago',
    'prontoalivio', 'lippia', 'diente de león', 'diente de leon', 'taraxacum',
    'ruda', 'anamú', 'anamu', 'moringa', 'valeriana', 'ajenjo', 'absinthium',
    'sauco', 'sambucus', 'perejil',
    'cactus', 'suculenta', 'crassula', 'jade', 'haworthia', 'echeveria',
    'aromática', 'aromatica', 'medicinal'
  ];
  if (transversalKeywords.some(kw => lower.includes(kw))) {
    return 'Otros complementarios y transversales (cactus, aromáticas, etc.)';
  }

  // 2. Plantas de interior
  const indoorKeywords = [
    'monstera', 'pothos', 'potus', 'miami', 'epipremnum', 'sansevieria', 'lengua de suegra',
    'zamioculca', 'zz', 'ficus', 'filodendro', 'philodendron', 'calatea', 'calathea',
    'maranta', 'espatifilo', 'cuna de moisés', 'moises', 'anturio', 'anthurium',
    'aglaonema', 'peperomia', 'palma', 'areca', 'chamaedorea', 'raphis', 'helecho',
    'culantrillo', 'cuerno de alce', 'drácena', 'dracena', 'tronco de brasil',
    'begonia', 'singonio', 'syngonium', 'crotón', 'croton', 'cinta', 'mala madre',
    'chlorophytum', 'schlumbergera', 'interior'
  ];
  if (indoorKeywords.some(kw => lower.includes(kw))) {
    return 'Plantas de interior';
  }

  // 3. Plantas de exterior (ornamentales, arbustos, flores, palmas de exterior)
  const outdoorKeywords = [
    'veranera', 'buganvilla', 'bougainvillea', 'novios', 'geranio', 'pelargonio',
    'san joaquín', 'san joaquin', 'hibisco', 'hibiscus', 'hortensia', 'hydrangea',
    'ave del paraíso', 'ave del paraiso', 'strelitzia', 'heliconia', 'platanillo',
    'corona de cristo', 'milii', 'ixora', 'duranta', 'eugenia', 'agapanto', 'agapanthus',
    'lantana', 'gardenia', 'jazmín del cabo', 'jazmin del cabo', 'petunia', 'surfinia',
    'calibrachoa', 'cordiline', 'drácena roja', 'dracena roja', 'fruticosa', 'achira',
    'canna', 'pentas', 'rosas de jardín', 'rosal', 'agave', 'blanchetiana', 'fireball',
    'bromelias de sol', 'jazmín trepador', 'jazmin trepador', 'mussaenda',
    'palmas de jardín exterior', 'palmas de jardin exterior', 'exterior'
  ];
  if (outdoorKeywords.some(kw => lower.includes(kw))) {
    return 'Plantas de exterior';
  }

  // 4. Por defecto para hortalizas y cultivos alimenticios: Plantas de Huerta
  return 'Plantas de Huerta';
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

  // Plantas complementarias y transversales (aromáticas, medicinales, cactus)
  if (lower.includes('lavanda')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Lavanda aromática' };
  }
  if (lower.includes('romero')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Romero aromático' };
  }
  if (lower.includes('albahaca')) {
    return { imageUrl: '/crops/albahaca.svg', imageAlt: 'Albahaca aromática' };
  }
  if (lower.includes('menta') || lower.includes('hierbabuena')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Menta / Hierbabuena' };
  }
  if (lower.includes('tomillo')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Tomillo aromático' };
  }
  if (lower.includes('orégano') || lower.includes('oregano') || lower.includes('oreganón') || lower.includes('oreganon')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Orégano / Oreganón' };
  }
  if (lower.includes('toronjil') || lower.includes('melissa')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Toronjil relajante' };
  }
  if (lower.includes('limonaria') || lower.includes('limoncillo')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Limonaria aromática' };
  }
  if (lower.includes('eneldo')) {
    return { imageUrl: '/crops/cilantro.svg', imageAlt: 'Eneldo aromático' };
  }
  if (lower.includes('estragón') || lower.includes('estragon')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Estragón aromático' };
  }
  if (lower.includes('laurel')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Laurel de cocina' };
  }
  if (lower.includes('sábila') || lower.includes('sabila') || lower.includes('aloe')) {
    return { imageUrl: '/crops/acelga.svg', imageAlt: 'Sábila / Aloe medicinal' };
  }
  if (lower.includes('caléndula') || lower.includes('calendula')) {
    return { imageUrl: '/crops/calendula.svg', imageAlt: 'Caléndula medicinal' };
  }
  if (lower.includes('manzanilla') || lower.includes('chamomilla')) {
    return { imageUrl: '/crops/calendula.svg', imageAlt: 'Manzanilla medicinal' };
  }
  if (lower.includes('llantén') || lower.includes('llanten')) {
    return { imageUrl: '/crops/espinaca.svg', imageAlt: 'Llantén medicinal' };
  }
  if (lower.includes('prontoalivio')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Prontoalivio medicinal' };
  }
  if (lower.includes('diente de león') || lower.includes('diente de leon')) {
    return { imageUrl: '/crops/calendula.svg', imageAlt: 'Diente de león' };
  }
  if (lower.includes('ruda')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Ruda protectora' };
  }
  if (lower.includes('anamú') || lower.includes('anamu')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Anamú medicinal' };
  }
  if (lower.includes('moringa')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Moringa nutritiva' };
  }
  if (lower.includes('valeriana')) {
    return { imageUrl: '/crops/calendula.svg', imageAlt: 'Valeriana medicinal' };
  }
  if (lower.includes('ajenjo')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Ajenjo amargo' };
  }
  if (lower.includes('sauco')) {
    return { imageUrl: '/crops/calendula.svg', imageAlt: 'Sauco medicinal' };
  }

  // Plantas de exterior ornamentales, florales, arbustos y palmas
  if (lower.includes('veranera') || lower.includes('buganvilla') || lower.includes('bougainvillea')) {
    return { imageUrl: '/crops/fresa.svg', imageAlt: 'Veranera / Buganvilla en exterior' };
  }
  if (lower.includes('novios') || lower.includes('geranio') || lower.includes('pelargonio')) {
    return { imageUrl: '/crops/pimiento.svg', imageAlt: 'Novios / Geranios de jardín' };
  }
  if (lower.includes('san joaquín') || lower.includes('san joaquin') || lower.includes('hibisco') || lower.includes('hibiscus')) {
    return { imageUrl: '/crops/calendula.svg', imageAlt: 'San Joaquín / Hibisco exterior' };
  }
  if (lower.includes('hortensia') || lower.includes('hydrangea')) {
    return { imageUrl: '/crops/calendula.svg', imageAlt: 'Hortensia para jardín exterior' };
  }
  if (lower.includes('ave del paraíso') || lower.includes('ave del paraiso') || lower.includes('strelitzia')) {
    return { imageUrl: '/crops/zanahoria.svg', imageAlt: 'Ave del paraíso exterior' };
  }
  if (lower.includes('heliconia') || lower.includes('platanillo')) {
    return { imageUrl: '/crops/pimiento.svg', imageAlt: 'Heliconia y platanillos exterior' };
  }
  if (lower.includes('corona de cristo')) {
    return { imageUrl: '/crops/rabano.svg', imageAlt: 'Corona de Cristo exterior' };
  }
  if (lower.includes('ixora')) {
    return { imageUrl: '/crops/tomate.svg', imageAlt: 'Ixora floral de jardín' };
  }
  if (lower.includes('duranta')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Duranta ornamental exterior' };
  }
  if (lower.includes('eugenia')) {
    return { imageUrl: '/crops/cebolla.svg', imageAlt: 'Eugenia para setos de jardín' };
  }
  if (lower.includes('agapanto') || lower.includes('agapanthus')) {
    return { imageUrl: '/crops/lechuga.svg', imageAlt: 'Agapanto floral exterior' };
  }
  if (lower.includes('lantana')) {
    return { imageUrl: '/crops/calendula.svg', imageAlt: 'Lantana multicolor exterior' };
  }
  if (lower.includes('gardenia') || lower.includes('jazmín del cabo') || lower.includes('jazmin del cabo')) {
    return { imageUrl: '/crops/calendula.svg', imageAlt: 'Gardenia / Jazmín del Cabo' };
  }
  if (lower.includes('petunia') || lower.includes('surfinia') || lower.includes('calibrachoa')) {
    return { imageUrl: '/crops/calendula.svg', imageAlt: 'Petunia floral de exterior' };
  }
  if (lower.includes('cordiline') || lower.includes('drácena roja') || lower.includes('dracena roja')) {
    return { imageUrl: '/crops/remolacha.svg', imageAlt: 'Cordiline / Drácena roja' };
  }
  if (lower.includes('achira') || lower.includes('canna')) {
    return { imageUrl: '/crops/frijol.svg', imageAlt: 'Achira / Canna índica' };
  }
  if (lower.includes('pentas')) {
    return { imageUrl: '/crops/calendula.svg', imageAlt: 'Pentas lanceolata exterior' };
  }
  if (lower.includes('rosas de jardín') || lower.includes('rosal') || lower.includes('rosa')) {
    return { imageUrl: '/crops/calendula.svg', imageAlt: 'Rosas de jardín exterior' };
  }
  if (lower.includes('agave')) {
    return { imageUrl: '/crops/acelga.svg', imageAlt: 'Agave arquitectónico exterior' };
  }
  if (lower.includes('bromelias de sol') || lower.includes('aechmea') || lower.includes('fireball')) {
    return { imageUrl: '/crops/zanahoria.svg', imageAlt: 'Bromelias de sol exterior' };
  }
  if (lower.includes('jazmín trepador') || lower.includes('jazmin trepador')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Jazmín trepador perfumado' };
  }
  if (lower.includes('mussaenda')) {
    return { imageUrl: '/crops/fresa.svg', imageAlt: 'Mussaenda tropical exterior' };
  }
  if (lower.includes('palmas de jardín exterior') || lower.includes('palmas de jardin exterior')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Palmas de jardín exterior' };
  }
  if (lower.includes('lavanda')) {
    return { imageUrl: '/crops/hierbas.svg', imageAlt: 'Lavanda aromática exterior' };
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
