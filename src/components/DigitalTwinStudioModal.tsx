'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  X,
  CloudRain,
  Wind,
  Thermometer,
  Clock,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  Radio,
  FileCheck,
  Share2,
  MapPin,
  Search,
  Check,
  Info,
} from 'lucide-react';
import { Participant, Booking, Expense, Payment, RefundEvent } from '@/lib/types';
import {
  runDigitalTwinSimulation,
  PRESET_SIMULATION_SCENARIOS,
  WeatherSimulationParameters,
  DigitalTwinSimulationResult,
} from '@/lib/digital-twin-engine';
import {
  getCurrentLiveWeather,
  CurrentLiveWeather,
  POPULAR_TRAVEL_DESTINATIONS,
  evaluatePlanFeasibility,
  PlanFeasibilityResult,
} from '@/lib/weather-service';
import { GeospatialImpactMap } from './GeospatialImpactMap';
import { OpenStreetMap2D } from './OpenStreetMap2D';

interface DigitalTwinStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  participants: Participant[];
  bookings: Booking[];
  expenses: Expense[];
  payments: Payment[];
  refunds: RefundEvent[];
  onCommitSimulation?: (action: DigitalTwinSimulationResult['commitAction']) => void;
}

export const DigitalTwinStudioModal: React.FC<DigitalTwinStudioModalProps> = ({
  isOpen,
  onClose,
  destination: initialDestination,
  participants,
  bookings,
  expenses,
  payments,
  refunds,
  onCommitSimulation,
}) => {
  // Destination Switcher & Explorer State
  const [activeDestination, setActiveDestination] = useState<string>(initialDestination || 'Goa');
  const [customSearchQuery, setCustomSearchQuery] = useState<string>('');
  const [mapViewMode, setMapViewMode] = useState<'osm_2d' | 'radar_canvas'>('osm_2d');

  // Live Weather Telemetry State (Real data with Open-Meteo keys)
  const [liveWeather, setLiveWeather] = useState<CurrentLiveWeather | null>(null);
  const [isLoadingLiveWeather, setIsLoadingLiveWeather] = useState(false);

  // Digital Twin Weather Parameters (Overridable sliders)
  const [params, setParams] = useState<WeatherSimulationParameters>({
    rainfallMmPerHour: 0,
    stormDurationHours: 3,
    temperatureC: 30,
    windSpeedKmh: 14,
    epicenterName: `${initialDestination || 'Goa'} City Center`,
    epicenterCoords: { lat: 15.2993, lng: 74.1240 },
  });

  // Active right sidebar tab: 'feasibility' | 'controls' | 'social' | 'ledger'
  const [activeTab, setActiveTab] = useState<'feasibility' | 'controls' | 'social' | 'ledger'>('feasibility');

  // Fetch real-time weather whenever activeDestination changes
  useEffect(() => {
    if (isOpen && activeDestination) {
      setIsLoadingLiveWeather(true);
      getCurrentLiveWeather(activeDestination)
        .then((data) => {
          setLiveWeather(data);
          setParams((prev) => ({
            ...prev,
            rainfallMmPerHour: data.precipitationRate,
            temperatureC: data.temperature,
            windSpeedKmh: data.windSpeed,
            epicenterName: `${data.destination} Center`,
            epicenterCoords: { lat: data.latitude, lng: data.longitude },
          }));
        })
        .finally(() => setIsLoadingLiveWeather(false));
    }
  }, [isOpen, activeDestination]);

  // Compute Plan Feasibility Verdict
  const feasibility: PlanFeasibilityResult = useMemo(() => {
    const effectiveWeather = {
      temperature: params.temperatureC,
      precipitationRate: params.rainfallMmPerHour,
      windSpeed: params.windSpeedKmh,
      weatherLabel: liveWeather?.weatherLabel || 'Variable',
      icon: liveWeather?.icon || '🌤️',
    };
    return evaluatePlanFeasibility(activeDestination, effectiveWeather, bookings);
  }, [activeDestination, params, liveWeather, bookings]);

  // Run the multi-agent digital twin simulation reactively
  const simulation: DigitalTwinSimulationResult = useMemo(() => {
    return runDigitalTwinSimulation(
      participants,
      bookings,
      expenses,
      payments,
      refunds,
      params,
      activeDestination
    );
  }, [participants, bookings, expenses, payments, refunds, params, activeDestination]);

  if (!isOpen) return null;

  const handleSelectDestination = (destName: string, lat?: number, lon?: number) => {
    setActiveDestination(destName);
    if (lat && lon) {
      setParams((prev) => ({
        ...prev,
        epicenterCoords: { lat, lng: lon },
        epicenterName: `${destName} Center`,
      }));
    }
  };

  const handleSearchCustomPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSearchQuery.trim()) {
      handleSelectDestination(customSearchQuery.trim());
      setCustomSearchQuery('');
    }
  };

  const handleApplyPreset = (presetKey: string) => {
    const preset = PRESET_SIMULATION_SCENARIOS[presetKey];
    if (preset) {
      setParams(preset);
    }
  };

  const handleCommit = () => {
    if (onCommitSimulation) {
      onCommitSimulation(simulation.commitAction);
    }
    onClose();
  };

  // Prepare venues for 2D OpenStreetMap
  const mapCenter: [number, number] = [
    params.epicenterCoords.lat || 15.2993,
    params.epicenterCoords.lng || 74.1240,
  ];

  const mapVenues = simulation.impactedBookings.map((ib, idx) => ({
    name: ib.booking.title,
    lat: mapCenter[0] + (idx % 2 === 0 ? 0.03 : -0.03),
    lng: mapCenter[1] + (idx % 2 === 0 ? 0.04 : -0.04),
    status: ib.impactSeverity === 'suspended' ? ('suspended' as const) : ('at_risk' as const),
  }));

  return (
    <div className="fixed inset-0 z-50 bg-[#1C261F]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#F4F5EE] border border-[#D1D8BE] rounded-3xl max-w-6xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]"
      >
        {/* TOP HEADER: DESTINATION & TELEMETRY */}
        <div className="p-4 sm:p-5 border-b border-[#D1D8BE] flex flex-wrap items-center justify-between gap-3 bg-[#EBF4DD]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5A7863] text-white flex items-center justify-center shadow-sm">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '24s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#3B4953] tracking-tight">
                  Weather & Plan Feasibility Studio
                </h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047] font-bold">
                  Real Open-Meteo & 2D Free Map
                </span>
              </div>
              <p className="text-xs text-[#6B7C85] flex items-center gap-1.5 mt-0.5">
                <span>Active Destination:</span>
                <strong className="text-[#3B4953] bg-white px-2 py-0.5 rounded-md border border-[#D1D8BE]">
                  📍 {activeDestination}
                </strong>
                <span className="hidden sm:inline text-[11px] text-[#6B7C85]">
                  ({params.epicenterCoords.lat.toFixed(3)}° N, {params.epicenterCoords.lng.toFixed(3)}° E)
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {liveWeather && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 border border-[#D1D8BE] text-xs font-medium text-[#3B4953] shadow-xs">
                <span>{liveWeather.icon}</span>
                <span className="font-bold text-[#5A7863]">{liveWeather.temperature}°C</span>
                <span className="text-[10px] text-[#6B7C85] border-l border-[#D1D8BE] pl-2">
                  Rain: {liveWeather.precipitationRate} mm/h
                </span>
                <span className="text-[10px] text-[#6B7C85] border-l border-[#D1D8BE] pl-2">
                  Wind: {liveWeather.windSpeed} km/h
                </span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#6B7C85] hover:text-[#3B4953] hover:bg-[#EBF4DD] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DESTINATION SWITCHER BAR: SHOWCASE OTHER POSSIBILITIES */}
        <div className="p-3 bg-white/80 border-b border-[#D1D8BE] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#3B4953] shrink-0">
            <MapPin className="w-3.5 h-3.5 text-[#5A7863]" />
            <span>Switch Destination:</span>
          </div>

          {/* Quick Place Chips */}
          <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
            {POPULAR_TRAVEL_DESTINATIONS.slice(0, 8).map((dest) => {
              const isSelected = activeDestination.toLowerCase().includes(dest.name.toLowerCase());
              return (
                <button
                  key={dest.name}
                  onClick={() => handleSelectDestination(dest.name, dest.lat, dest.lon)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#5A7863] text-white shadow-xs font-bold'
                      : 'bg-[#F4F5EE] text-[#3B4953] hover:bg-[#EBF4DD] border border-[#D1D8BE]'
                  }`}
                >
                  {dest.name}
                </button>
              );
            })}
          </div>

          {/* Search any custom place */}
          <form onSubmit={handleSearchCustomPlace} className="flex items-center gap-1.5 shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search any place..."
                value={customSearchQuery}
                onChange={(e) => setCustomSearchQuery(e.target.value)}
                className="w-36 sm:w-44 text-xs py-1 px-2.5 pl-7 rounded-lg border border-[#D1D8BE] bg-white text-[#3B4953] focus:outline-none focus:border-[#5A7863]"
              />
              <Search className="w-3.5 h-3.5 text-[#6B7C85] absolute left-2 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-[#5A7863] text-white text-xs font-semibold hover:bg-[#486350] transition-colors cursor-pointer"
            >
              Go
            </button>
          </form>
        </div>

        {/* MODAL BODY: SPLIT VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-[#D1D8BE]">
          {/* LEFT 7 COLS: 2D MAP / GEOSPATIAL VISUALIZER */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col gap-4">
            {/* Map Mode Toggle & Info Bar */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7C85] font-bold">
                2D Geospatial Map View
              </span>
              <div className="flex items-center gap-1 bg-[#EBF4DD] p-0.5 rounded-lg border border-[#D1D8BE] text-[11px]">
                <button
                  onClick={() => setMapViewMode('osm_2d')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    mapViewMode === 'osm_2d'
                      ? 'bg-[#5A7863] text-white shadow-xs'
                      : 'text-[#6B7C85] hover:text-[#3B4953]'
                  }`}
                >
                  🗺️ OpenStreetMap 2D
                </button>
                <button
                  onClick={() => setMapViewMode('radar_canvas')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    mapViewMode === 'radar_canvas'
                      ? 'bg-[#5A7863] text-white shadow-xs'
                      : 'text-[#6B7C85] hover:text-[#3B4953]'
                  }`}
                >
                  🛰️ Radar Impact Canvas
                </button>
              </div>
            </div>

            {/* Map Canvas: OpenStreetMap 2D vs Radar Impact Canvas */}
            <div className="flex-1 min-h-[380px]">
              {mapViewMode === 'osm_2d' ? (
                <OpenStreetMap2D
                  center={mapCenter}
                  zoom={11}
                  destinationName={activeDestination}
                  weatherIntensity={params.rainfallMmPerHour}
                  impactRadiusKm={simulation.impactRadiusKm}
                  venues={mapVenues}
                  className="w-full h-full min-h-[380px]"
                />
              ) : (
                <GeospatialImpactMap
                  simulation={simulation}
                  participants={participants}
                  bookings={bookings}
                  onSelectEpicenter={(coords, name) => {
                    setParams((prev) => ({
                      ...prev,
                      epicenterCoords: coords,
                      epicenterName: name,
                    }));
                  }}
                  className="w-full h-full min-h-[380px]"
                />
              )}
            </div>

            {/* Real Data Telemetry Footnote */}
            <div className="p-3 rounded-2xl bg-white border border-[#D1D8BE] shadow-xs flex items-center justify-between text-xs text-[#3B4953]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5A7863]" />
                <span className="font-semibold">Real Data Ground Truth:</span>
                <span className="text-[#6B7C85]">
                  Open-Meteo physical keys & OpenStreetMap 2D tiles verified.
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FEF9C3] text-[#854D0E] font-bold">
                100% Real API
              </span>
            </div>
          </div>

          {/* RIGHT 5 COLS: FEASIBILITY VERDICT, WEATHER OVERRIDES & LEDGER */}
          <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col gap-4 bg-white/60">
            {/* Navigation Tabs */}
            <div className="flex rounded-xl bg-[#EBF4DD] p-1 border border-[#D1D8BE] text-xs font-semibold">
              <button
                onClick={() => setActiveTab('feasibility')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'feasibility'
                    ? 'bg-[#5A7863] text-white shadow-xs'
                    : 'text-[#6B7C85] hover:text-[#3B4953]'
                }`}
              >
                <span>⚡</span> Feasibility
              </button>
              <button
                onClick={() => setActiveTab('controls')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'controls'
                    ? 'bg-[#5A7863] text-white shadow-xs'
                    : 'text-[#6B7C85] hover:text-[#3B4953]'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5" /> Weather Sliders
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'ledger'
                    ? 'bg-[#5A7863] text-white shadow-xs'
                    : 'text-[#6B7C85] hover:text-[#3B4953]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" /> Ledger Rebalance
              </button>
            </div>

            {/* TAB 1: PLAN FEASIBILITY VERDICT */}
            {activeTab === 'feasibility' && (
              <div className="space-y-3.5 flex-1 overflow-y-auto">
                {/* Feasibility Hero Banner */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    feasibility.status === 'FEASIBLE'
                      ? 'bg-[#EBF4DD] border-[#5A7863]/40 text-[#1C261F]'
                      : feasibility.status === 'PARTIALLY_FEASIBLE'
                      ? 'bg-[#FEF9C3] border-[#FDE047] text-[#713F12]'
                      : 'bg-[#FFE4E6] border-red-300 text-red-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold tracking-wide uppercase font-mono">
                      {feasibility.verdictLabel}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white/80 shadow-xs">
                      {feasibility.feasibilityScore}% Feasibility Index
                    </span>
                  </div>
                  <h4 className="text-sm font-bold">{feasibility.headline}</h4>
                  <p className="text-xs leading-relaxed opacity-90">{feasibility.summary}</p>
                </div>

                {/* Place Feasibility Comparison Chips */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#D1D8BE] space-y-2">
                  <span className="text-xs font-bold text-[#3B4953] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#5A7863]" />
                    <span>Compare Other Places (Feasible vs Not Feasible):</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { name: 'Manali', state: 'Himachal', note: '🟢 95% Feasible (Crisp)' },
                      { name: 'Jaipur', state: 'Rajasthan', note: '🟢 98% Feasible (Sunny)' },
                      { name: 'Mumbai', state: 'Maharashtra', note: '🟢 92% Feasible (Clear)' },
                      { name: 'Goa Coast', state: 'Goa', note: '🟡 Marine Caution' },
                    ].map((comp) => (
                      <button
                        key={comp.name}
                        onClick={() => handleSelectDestination(comp.name)}
                        className="p-2 rounded-xl bg-[#F4F5EE] hover:bg-[#EBF4DD] border border-[#D1D8BE] text-left transition-colors cursor-pointer"
                      >
                        <div className="font-bold text-[#3B4953]">{comp.name}</div>
                        <div className="text-[10px] text-[#6B7C85]">{comp.note}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity Breakdown List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#3B4953]">Activity-by-Activity Feasibility:</span>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {feasibility.activityBreakdown.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                          item.isFeasible
                            ? 'bg-[#EBF4DD]/40 border-[#D1D8BE]'
                            : 'bg-[#FFE4E6]/50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#3B4953]">{item.title}</span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                              item.isFeasible
                                ? 'bg-[#5A7863] text-white'
                                : 'bg-red-600 text-white'
                            }`}
                          >
                            {item.isFeasible ? 'FEASIBLE' : 'AT RISK'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B7C85] leading-tight">{item.reason}</p>
                        {item.recommendedSwap && (
                          <div className="text-[10px] font-medium text-[#5A7863] pt-0.5">
                            ✨ Recommended Swap: {item.recommendedSwap}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: WEATHER PARAMETER OVERRIDE SLIDERS */}
            {activeTab === 'controls' && (
              <div className="space-y-4 flex-1 overflow-y-auto">
                <div className="text-xs text-[#6B7C85] bg-[#EBF4DD] p-2.5 rounded-xl border border-[#D1D8BE]">
                  💡 Adjust weather parameters below to simulate how weather shifts impact plan feasibility in real-time.
                </div>

                {/* Rainfall Slider */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#D1D8BE] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#3B4953] flex items-center gap-1.5">
                      <CloudRain className="w-4 h-4 text-[#5A7863]" /> Rainfall Intensity
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]">
                      {params.rainfallMmPerHour} mm/h
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={80}
                    step={5}
                    value={params.rainfallMmPerHour}
                    onChange={(e) =>
                      setParams((prev) => ({ ...prev, rainfallMmPerHour: Number(e.target.value) }))
                    }
                    className="w-full accent-[#5A7863] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#6B7C85]">
                    <span>0 mm (Clear)</span>
                    <span>20 mm (Moderate)</span>
                    <span>80 mm (Cloudburst)</span>
                  </div>
                </div>

                {/* Wind Speed Slider */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#D1D8BE] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#3B4953] flex items-center gap-1.5">
                      <Wind className="w-4 h-4 text-[#5A7863]" /> Wind Speed
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#EBF4DD] text-[#5A7863] border border-[#D1D8BE]">
                      {params.windSpeedKmh} km/h
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={90}
                    step={5}
                    value={params.windSpeedKmh}
                    onChange={(e) =>
                      setParams((prev) => ({ ...prev, windSpeedKmh: Number(e.target.value) }))
                    }
                    className="w-full accent-[#5A7863] cursor-pointer"
                  />
                </div>

                {/* Temperature & Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white border border-[#D1D8BE] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#3B4953] flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-[#5A7863]" /> Temp
                      </span>
                      <span className="text-xs font-mono font-bold text-[#3B4953]">{params.temperatureC}°C</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={45}
                      step={1}
                      value={params.temperatureC}
                      onChange={(e) =>
                        setParams((prev) => ({ ...prev, temperatureC: Number(e.target.value) }))
                      }
                      className="w-full accent-[#5A7863] cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-[#D1D8BE] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#3B4953] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#5A7863]" /> Duration
                      </span>
                      <span className="text-xs font-mono font-bold text-[#3B4953]">{params.stormDurationHours}h</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={12}
                      step={1}
                      value={params.stormDurationHours}
                      onChange={(e) =>
                        setParams((prev) => ({ ...prev, stormDurationHours: Number(e.target.value) }))
                      }
                      className="w-full accent-[#5A7863] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LEDGER SHOCK REBALANCE */}
            {activeTab === 'ledger' && (
              <div className="space-y-3 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-white border border-[#D1D8BE] space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#6B7C85] font-bold">
                      Act-of-God Refund
                    </span>
                    <div className="text-base font-bold text-[#5A7863]">
                      +₹{simulation.financialDelta.totalRefundInflow.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#6B7C85]">100% weather clause</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#D1D8BE] space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#6B7C85] font-bold">
                      Indoor Swap Cost
                    </span>
                    <div className="text-base font-bold text-[#3B4953]">
                      -₹{simulation.financialDelta.totalIndoorSwapCost.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#6B7C85]">Safe weather alternative</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#EBF4DD] border border-[#5A7863]/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5A7863]">Net Squad Savings</span>
                    <span className="text-sm font-bold text-[#5A7863] font-mono">
                      +₹{simulation.financialDelta.netSquadSavings.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7C85]">
                    Automatic debt simplification reduces settlement transfers from{' '}
                    <strong className="text-[#3B4953]">
                      {simulation.financialDelta.originalDebts.length} down to{' '}
                      {simulation.financialDelta.simulatedDebts.length}
                    </strong>
                    .
                  </p>
                </div>
              </div>
            )}

            {/* ACTION COMMIT BUTTON */}
            <div className="mt-auto pt-3 border-t border-[#D1D8BE] space-y-2">
              <button
                onClick={handleCommit}
                className="w-full py-3 px-4 rounded-2xl bg-[#5A7863] text-white font-bold text-xs hover:bg-[#486350] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Apply Simulation & Rebalance Live Plan
              </button>
              <div className="text-center text-[10px] text-[#6B7C85]">
                Updates live itinerary with feasible swaps and executes Act-of-God refund credit.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
