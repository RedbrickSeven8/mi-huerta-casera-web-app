import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {AlertCircle,
  Plus,
  MapPin,
  X,
  Sparkles,
  Layers,
  HelpCircle,
  Trees,
  Home, Sprout} from 'lucide-react';
import type { CropItem, CropStage, PageRoute, GardenLocation, LocationType, PlantCategory } from '../types/huerta';
import { CROPS_DATABASE, type CropCategory, type CropVarietyInfo, getCropImage, calculateDynamicWaterFrequency } from '../data/cropsDatabase';
import { loadLocations, addLocation } from '../services/huertaStorage';

interface RegisterPageProps {
  locations?: GardenLocation[];
  onAddLocation?: (location: Omit<GardenLocation, 'id' | 'createdAt'>) => GardenLocation;
  onAddCrop: (crop: CropItem) => void;
  onNavigate: (route: PageRoute) => void;
}

const STAGES: CropStage[] = ['Semilla', 'Plántula', 'Crecimiento', 'Floración', 'Cosecha'];

const NOT_SURE_VARIETY = 'No estoy seguro';

const LOCATION_TYPES: LocationType[] = [
  'Bancal elevado',
  'Mesa de cultivo',
  'Jardinera',
  'Maceta',
  'Suelo directo',
  'Invernadero',
  'Hidroponía / Otro'
];

// Obtener horas de sol enteras según la exposición solar de la ubicación/bancal
const getSunHoursFromExposure = (exposure?: 'Pleno sol' | 'Semisombra' | 'Sombra'): number => {
  if (exposure === 'Pleno sol') return 8;
  if (exposure === 'Semisombra') return 5;
  if (exposure === 'Sombra') return 3;
  return 6;
};

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const RegisterPage: React.FC<RegisterPageProps> = ({
  locations: initialLocationsProp,
  onAddLocation,
  onAddCrop,
  onNavigate
}) => {

  // Locations list from props or storage
  const [locations, setLocations] = useState<GardenLocation[]>(() => {
    if (initialLocationsProp && initialLocationsProp.length > 0) return initialLocationsProp;
    return loadLocations();
  });

  React.useEffect(() => {
    if (initialLocationsProp && initialLocationsProp.length > 0) {
      setLocations(initialLocationsProp);
    }
  }, [initialLocationsProp]);
  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationType, setNewLocationType] = useState<LocationType>('Bancal elevado');
  const [newLocationSun, setNewLocationSun] = useState<'Pleno sol' | 'Semisombra' | 'Sombra'>('Pleno sol');
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);

  const [selectedPlantCategory, setSelectedPlantCategory] = useState<PlantCategory>('Plantas de Huerta');
  const [selectedCropName, setSelectedCropName] = useState<string>(() => {
    const firstHuerta = CROPS_DATABASE.find(c => c.category === 'Plantas de Huerta');
    return firstHuerta ? firstHuerta.cropName : CROPS_DATABASE[0].cropName;
  });
  const [selectedVarietyName, setSelectedVarietyName] = useState<string>(CROPS_DATABASE[0].varieties[0].varietyName);

  const [plantedDate, setPlantedDate] = useState<string>(getTodayString());
  const [stage, setStage] = useState<CropStage>('Plántula');
  
  // Selected location (bed): primera ubicacion disponible o en blanco
  const [bed, setBed] = useState<string>(() => {
    const locs = (initialLocationsProp && initialLocationsProp.length > 0) ? initialLocationsProp : loadLocations();
    return locs.length > 0 ? locs[0].name : '';
  });

  const [daysToHarvest, setDaysToHarvest] = useState<number>(CROPS_DATABASE[0].varieties[0].stageDaysToHarvest['Plántula']);
  const [recommendedMoisture, setRecommendedMoisture] = useState<number>(CROPS_DATABASE[0].varieties[0].recommendedMoisturePercent);
  const [waterFrequencyDays, setWaterFrequencyDays] = useState<number>(CROPS_DATABASE[0].varieties[0].waterFrequencyDays);
  const [sunHours, setSunHours] = useState<number>(() => {
    const locs = (initialLocationsProp && initialLocationsProp.length > 0) ? initialLocationsProp : loadLocations();
    const initialLoc = locs.length > 0 ? locs[0] : null;
    return getSunHoursFromExposure(initialLoc?.sunExposure);
  });
  const [notes, setNotes] = useState<string>(CROPS_DATABASE[0].varieties[0].notes);

  // Cálculo de la fecha de siembra como objeto Date local
  const parsePlantedDate = (dateStr: string): Date => {
    const parts = (dateStr || getTodayString()).split('-').map(Number);
    return new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentCategory: CropCategory | undefined = CROPS_DATABASE.find(
    (c) => c.cropName === selectedCropName
  );

  const isNotSure = selectedVarietyName === NOT_SURE_VARIETY;

  const currentVariety: CropVarietyInfo | undefined = isNotSure
    ? currentCategory?.generalInfo
    : currentCategory?.varieties.find((v) => v.varietyName === selectedVarietyName);

  const availableCropsForCategory = CROPS_DATABASE.filter(
    (c) => (c.category || 'Plantas de Huerta') === selectedPlantCategory
  );

  const handlePlantCategoryChange = (cat: PlantCategory) => {
    setSelectedPlantCategory(cat);
    const firstOfCategory = CROPS_DATABASE.find((c) => (c.category || 'Plantas de Huerta') === cat);
    if (firstOfCategory) {
      handleCropNameChange(firstOfCategory.cropName);
    }
  };

  const handleCropNameChange = (newCropName: string) => {
    setSelectedCropName(newCropName);
    const category = CROPS_DATABASE.find((c) => c.cropName === newCropName);
    if (category) {
      if (selectedVarietyName === NOT_SURE_VARIETY) {
        updateFieldsFromVariety(category.generalInfo, stage);
      } else if (category.varieties.length > 0) {
        const firstVar = category.varieties[0];
        setSelectedVarietyName(firstVar.varietyName);
        updateFieldsFromVariety(firstVar, stage);
      }
    }
  };

  const handleVarietyNameChange = (newVarietyName: string) => {
    setSelectedVarietyName(newVarietyName);
    if (!currentCategory) return;

    if (newVarietyName === NOT_SURE_VARIETY) {
      updateFieldsFromVariety(currentCategory.generalInfo, stage);
    } else {
      const varietyObj = currentCategory.varieties.find((v) => v.varietyName === newVarietyName);
      if (varietyObj) {
        updateFieldsFromVariety(varietyObj, stage);
      }
    }
  };

  const handleStageChange = (newStage: CropStage) => {
    setStage(newStage);
    if (currentVariety) {
      setDaysToHarvest(currentVariety.stageDaysToHarvest[newStage]);
    }
  };

  const updateFieldsFromVariety = (varietyObj: CropVarietyInfo, currentStage: CropStage) => {
    setDaysToHarvest(varietyObj.stageDaysToHarvest[currentStage]);
    setRecommendedMoisture(varietyObj.recommendedMoisturePercent);
    setNotes(varietyObj.notes);

    // Si la variedad sugiere una ubicación y existe entre las del usuario, seleccionarla y sincronizar el sol
    let currentSun = sunHours;
    if (varietyObj.recommendedBed && locations.some((l) => l.name.toLowerCase() === varietyObj.recommendedBed.toLowerCase())) {
      setBed(varietyObj.recommendedBed);
      const matchedLoc = locations.find((l) => l.name.toLowerCase() === varietyObj.recommendedBed!.toLowerCase());
      if (matchedLoc) {
        currentSun = getSunHoursFromExposure(matchedLoc.sunExposure);
        setSunHours(currentSun);
      }
    }

    // Cálculo dinámico de frecuencia de riego según las horas de sol de la ubicación
    const dynamicWater = calculateDynamicWaterFrequency(varietyObj.waterFrequencyDays, currentSun, parsePlantedDate(plantedDate));
    setWaterFrequencyDays(dynamicWater.adjustedDays);
  };

  const handleCreateLocationInline = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newLocationName.trim();
    if (!trimmed) return;

    const created = onAddLocation
      ? onAddLocation({
          name: trimmed,
          type: newLocationType,
          sunExposure: newLocationSun
        })
      : addLocation({
          name: trimmed,
          type: newLocationType,
          sunExposure: newLocationSun
        });

    const updatedLocations = loadLocations();
    setLocations(updatedLocations);
    setBed(created.name);
    const derivedSun = getSunHoursFromExposure(created.sunExposure);
    setSunHours(derivedSun);
    if (currentVariety) {
      const dynamicWater = calculateDynamicWaterFrequency(currentVariety.waterFrequencyDays, derivedSun, parsePlantedDate(plantedDate));
      setWaterFrequencyDays(dynamicWater.adjustedDays);
    }
    setNewLocationName('');
    setIsCreatingLocation(false);
    setLocationSuccessMsg(`Ubicación "${created.name}" creada y seleccionada.`);
    setTimeout(() => setLocationSuccessMsg(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bed.trim()) {
      setErrorMessage('Por favor asigna o crea una ubicación para el cultivo.');
      return;
    }
    setErrorMessage(null);

    const img = getCropImage(selectedCropName);
    const varietyLabel = isNotSure
      ? `${selectedCropName} (Especie general)`
      : currentVariety
      ? `${selectedCropName} (${currentVariety.varietyName})`
      : selectedCropName;

    const newCrop: CropItem = {
      id: 'crop-' + Date.now(),
      name: varietyLabel,
      variety: currentVariety ? currentVariety.botanicalName : 'Cultivo registrado',
      category: selectedPlantCategory,
      bed: bed.trim(),
      plantedDate: plantedDate || getTodayString(),
      daysToHarvest: Number(daysToHarvest) || 30,
      stage,
      recommendedMoisturePercent: Number(recommendedMoisture) || 70,
      sunHours: Number(sunHours) || 6,
      waterFrequencyDays: Number(waterFrequencyDays) || 2,
      lastWatered: 'Sin riego',
      notes: notes.trim(),
      imageUrl: img.imageUrl,
      imageAlt: `${selectedCropName} en ${bed.trim() || 'huerta'}`,
      log: [
        {
          id: 'log-' + Date.now(),
          type: 'Siembra',
          title: 'Siembra registrada',
          date: plantedDate || getTodayString(),
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          notes: `Categoría: ${selectedPlantCategory}. Ubicación: ${bed.trim()}. Etapa inicial: ${stage}. ${isNotSure ? 'Configuración general de especie aplicada.' : ''}`
        }
      ]
    };

    onAddCrop(newCrop);
    onNavigate('agradecimiento');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto px-4 py-8 sm:py-12"
    >
      <div className="mb-6 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Nuevo Cultivo</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A231E]">
          Crear Cultivo
        </h1>
        <p className="text-xs sm:text-sm text-[#4A554E]">
          Selecciona tu especie, variedad y asigna la ubicación o crea un bancal nuevo al instante.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {locationSuccessMsg && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#2D5A27] text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{locationSuccessMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Selector de Categoría (4 categorías solicitadas) */}
        <div>
          <label className="block text-xs font-semibold text-[#1A231E] mb-2">
            Categoría del cultivo *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Plantas de interior */}
            <button
              type="button"
              onClick={() => handlePlantCategoryChange('Plantas de interior')}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                selectedPlantCategory === 'Plantas de interior'
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm shadow-[#1E3A8A]/20 ring-2 ring-[#1E3A8A]/30'
                  : 'bg-[#FAF9F6] border-[#D5E0D3] text-[#4A554E] hover:border-[#1E3A8A] hover:bg-white'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${selectedPlantCategory === 'Plantas de interior' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'}`}>
                <Home className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block font-bold leading-tight">Plantas de interior</span>
                <span className={`text-[11px] block mt-0.5 ${selectedPlantCategory === 'Plantas de interior' ? 'text-blue-100' : 'text-[#5A655E]'}`}>
                  Salón, luz indirecta, follaje y macetas
                </span>
              </div>
            </button>

            {/* Plantas de exterior */}
            <button
              type="button"
              onClick={() => handlePlantCategoryChange('Plantas de exterior')}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                selectedPlantCategory === 'Plantas de exterior'
                  ? 'bg-[#B45309] text-white border-[#B45309] shadow-sm shadow-[#B45309]/20 ring-2 ring-[#B45309]/30'
                  : 'bg-[#FAF9F6] border-[#D5E0D3] text-[#4A554E] hover:border-[#B45309] hover:bg-white'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${selectedPlantCategory === 'Plantas de exterior' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-800'}`}>
                <Trees className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block font-bold leading-tight">Plantas de exterior</span>
                <span className={`text-[11px] block mt-0.5 ${selectedPlantCategory === 'Plantas de exterior' ? 'text-amber-100' : 'text-[#5A655E]'}`}>
                  Jardín, florales, arbustos y pleno sol
                </span>
              </div>
            </button>

            {/* Plantas de Huerta */}
            <button
              type="button"
              onClick={() => handlePlantCategoryChange('Plantas de Huerta')}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                selectedPlantCategory === 'Plantas de Huerta'
                  ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-sm shadow-[#2D5A27]/20 ring-2 ring-[#2D5A27]/30'
                  : 'bg-[#FAF9F6] border-[#D5E0D3] text-[#4A554E] hover:border-[#2D5A27] hover:bg-white'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${selectedPlantCategory === 'Plantas de Huerta' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'}`}>
                <Sprout className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block font-bold leading-tight">Plantas de Huerta</span>
                <span className={`text-[11px] block mt-0.5 ${selectedPlantCategory === 'Plantas de Huerta' ? 'text-emerald-100' : 'text-[#5A655E]'}`}>
                  Hortalizas, verduras, bancales y cosecha
                </span>
              </div>
            </button>

            {/* Otros complementarios y transversales */}
            <button
              type="button"
              onClick={() => handlePlantCategoryChange('Otros complementarios y transversales (cactus, aromáticas, etc.)')}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                selectedPlantCategory === 'Otros complementarios y transversales (cactus, aromáticas, etc.)'
                  ? 'bg-[#6B21A8] text-white border-[#6B21A8] shadow-sm shadow-[#6B21A8]/20 ring-2 ring-[#6B21A8]/30'
                  : 'bg-[#FAF9F6] border-[#D5E0D3] text-[#4A554E] hover:border-[#6B21A8] hover:bg-white'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${selectedPlantCategory === 'Otros complementarios y transversales (cactus, aromáticas, etc.)' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700'}`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block font-bold leading-tight">Otros complementarios y transversales</span>
                <span className={`text-[11px] block mt-0.5 ${selectedPlantCategory === 'Otros complementarios y transversales (cactus, aromáticas, etc.)' ? 'text-purple-100' : 'text-[#5A655E]'}`}>
                  Cactus, suculentas, aromáticas y medicinales
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Especie y Variedad con opción 'No estoy seguro' */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="crop-name" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Especie hortícola *
            </label>
            <select
              id="crop-name"
              value={selectedCropName}
              onChange={(e) => handleCropNameChange(e.target.value)}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] cursor-pointer"
            >
              {availableCropsForCategory.map((crop) => (
                <option key={crop.cropName} value={crop.cropName}>
                  {crop.cropName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="variety-name" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Variedad *
            </label>
            <select
              id="variety-name"
              value={selectedVarietyName}
              onChange={(e) => handleVarietyNameChange(e.target.value)}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] cursor-pointer"
            >
              <option value={NOT_SURE_VARIETY}>
                🤔 No estoy seguro (Valores generales de la especie)
              </option>
              <optgroup label="Variedades específicas">
                {currentCategory?.varieties.map((v) => (
                  <option key={v.varietyName} value={v.varietyName}>
                    {v.varietyName}
                  </option>
                ))}
              </optgroup>
            </select>
            {isNotSure ? (
              <span className="text-[11px] text-[#2D5A27] flex items-center gap-1 mt-1 font-medium">
                <HelpCircle className="w-3 h-3" />
                <span>Datos pre-rellenados con información botánica general de {selectedCropName}</span>
              </span>
            ) : currentVariety ? (
              <span className="text-[11px] text-[#5A655E] italic mt-1 block">
                {currentVariety.botanicalName}
              </span>
            ) : null}
          </div>
        </div>

        {/* Sección de Ubicación / Bancal con Creación en el mismo lugar */}
        <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2DFD7] space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="crop-bed" className="text-xs font-semibold text-[#1A231E] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#2D5A27]" />
              <span>Ubicación o Bancal *</span>
            </label>
            <button
              type="button"
              onClick={() => setIsCreatingLocation((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#2D5A27]/10 text-[#2D5A27] hover:bg-[#2D5A27] hover:text-white transition-colors cursor-pointer"
            >
              {isCreatingLocation ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>Cancelar</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear nueva ubicación</span>
                </>
              )}
            </button>
          </div>

          {/* Selector de ubicaciones: solo las creadas por el usuario, en blanco si no ha creado ninguna */}
          <div>
            <select
              id="crop-bed"
              value={bed}
              onChange={(e) => {
                const selectedBedName = e.target.value;
                setBed(selectedBedName);
                const matched = locations.find((l) => l.name.toLowerCase() === selectedBedName.toLowerCase());
                if (matched) {
                  const derivedSun = getSunHoursFromExposure(matched.sunExposure);
                  setSunHours(derivedSun);
                  if (currentVariety) {
                    const dynamicWater = calculateDynamicWaterFrequency(currentVariety.waterFrequencyDays, derivedSun, parsePlantedDate(plantedDate));
                    setWaterFrequencyDays(dynamicWater.adjustedDays);
                  }
                }
              }}
              className="w-full rounded-xl border border-[#D5E0D3] bg-white px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] cursor-pointer"
            >
              {locations.length === 0 ? (
                <option value="">(No has creado ninguna ubicación aún)</option>
              ) : (
                <>
                  <option value="">-- Selecciona una de tus ubicaciones creadas --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name} {loc.type ? `(${loc.type})` : ''} {loc.sunExposure ? `• ${loc.sunExposure}` : ''}
                    </option>
                  ))}
                </>
              )}
            </select>
            {locations.length === 0 ? (
              <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-lg mt-2">
                ⚠️ Aún no has creado ubicaciones. Haz clic en <strong>«Crear nueva ubicación»</strong> arriba para registrar tu primer bancal o maceta sin salir de este formulario.
              </p>
            ) : (
              <p className="text-[11px] text-[#5A655E] mt-1.5">
                Mostrando únicamente las ubicaciones creadas por ti. Puedes crear una nueva en cualquier momento con el botón superior.
              </p>
            )}
          </div>

          {/* Formulario rápido inline para crear ubicación/bancal */}
          <AnimatePresence>
            {isCreatingLocation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="pt-3 border-t border-[#E2DFD7] space-y-3 overflow-hidden"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A231E]">
                  <Layers className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>Crear nueva ubicación o bancal</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-medium text-[#4A554E] mb-1">
                      Nombre / Identificador *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Bancal Aromáticas #1"
                      value={newLocationName}
                      onChange={(e) => setNewLocationName(e.target.value)}
                      className="w-full rounded-lg border border-[#D5E0D3] bg-white px-3 py-1.5 text-xs text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#4A554E] mb-1">
                      Tipo de contenedor
                    </label>
                    <select
                      value={newLocationType}
                      onChange={(e) => setNewLocationType(e.target.value as LocationType)}
                      className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] cursor-pointer"
                    >
                      {LOCATION_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#4A554E] mb-1">
                      Exposición solar
                    </label>
                    <select
                      value={newLocationSun}
                      onChange={(e) => setNewLocationSun(e.target.value as 'Pleno sol' | 'Semisombra' | 'Sombra')}
                      className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] cursor-pointer"
                    >
                      <option value="Pleno sol">Pleno sol (+6h)</option>
                      <option value="Semisombra">Semisombra (3-5h)</option>
                      <option value="Sombra">Sombra (&lt;3h)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingLocation(false)}
                    className="px-3 py-1.5 rounded-lg border border-[#D5E0D3] bg-white text-xs text-[#4A554E] hover:bg-[#F2EFE9] cursor-pointer"
                  >
                    Descartar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateLocationInline}
                    disabled={!newLocationName.trim()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2D5A27] text-white text-xs font-semibold hover:bg-[#23471E] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Guardar y asignar</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fecha de Siembra con width reducido y Etapa inicial */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5">
            <label htmlFor="planted-date" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Fecha de siembra *
            </label>
            <input
              id="planted-date"
              type="date"
              value={plantedDate}
              onChange={(e) => {
                const newDateStr = e.target.value;
                setPlantedDate(newDateStr);
                if (currentVariety) {
                  const dynamicWater = calculateDynamicWaterFrequency(
                    currentVariety.waterFrequencyDays,
                    sunHours,
                    parsePlantedDate(newDateStr)
                  );
                  setWaterFrequencyDays(dynamicWater.adjustedDays);
                }
              }}
              className="w-full max-w-[190px] rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3 py-2 text-xs sm:text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
            />
          </div>

          <div className="sm:col-span-7">
            <label htmlFor="crop-stage" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
              Etapa inicial *
            </label>
            <select
              id="crop-stage"
              value={stage}
              onChange={(e) => handleStageChange(e.target.value as CropStage)}
              className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] cursor-pointer"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>



        {/* Métricas agronómicas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF9F6] p-4 rounded-xl border border-[#E2DFD7]">
          <div>
            <label className="block text-[11px] font-medium text-[#4A554E] mb-1">
              Días a cosecha
            </label>
            <input
              type="number"
              min={0}
              value={daysToHarvest}
              onChange={(e) => setDaysToHarvest(Number(e.target.value))}
              className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#4A554E] mb-1">
              Humedad (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={recommendedMoisture}
              onChange={(e) => setRecommendedMoisture(Number(e.target.value))}
              className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#4A554E] mb-1">
              Riego (días)
            </label>
            <input
              type="number"
              min={1}
              value={waterFrequencyDays}
              onChange={(e) => setWaterFrequencyDays(Number(e.target.value))}
              className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#4A554E] mb-1">
              Sol (horas/d)
            </label>
            <input
              type="number"
              min={0}
              max={24}
              step="1"
              value={Math.round(sunHours)}
              onChange={(e) => {
                const val = Math.max(0, Math.min(24, Math.round(Number(e.target.value) || 0)));
                setSunHours(val);
                if (currentVariety) {
                  const dynamicWater = calculateDynamicWaterFrequency(currentVariety.waterFrequencyDays, val, parsePlantedDate(plantedDate));
                  setWaterFrequencyDays(dynamicWater.adjustedDays);
                }
              }}
              className="w-full rounded-lg border border-[#D5E0D3] bg-white px-2.5 py-1.5 text-xs text-[#1A231E]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="crop-notes" className="block text-xs font-semibold text-[#1A231E] mb-1.5">
            Notas
          </label>
          <textarea
            id="crop-notes"
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[120px] rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#1A231E] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] resize-y"
          />
        </div>

                <div className="flex justify-end pt-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-sm font-semibold hover:bg-[#23471E] transition-colors cursor-pointer shadow-sm"
          >
            Guardar Cultivo
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};
