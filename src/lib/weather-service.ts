// Weather Service integrating Open-Meteo (Free, No API Key Required)
// Feature F1.2: Weather-Aware Replanning

export interface DailyWeatherForecast {
  date: string;
  weatherCode: number;
  weatherLabel: string;
  icon: string;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  isAdverse: boolean;
  adverseReason?: string;
}

export interface WeatherAnalysisResult {
  destination: string;
  latitude: number;
  longitude: number;
  dailyForecast: DailyWeatherForecast[];
  adverseDaysCount: number;
  outdoorAlerts: Array<{
    date: string;
    bookingTitle: string;
    weatherLabel: string;
    precipitationProbability: number;
    recommendedSwap: string;
  }>;
}

// Destination fallback coordinates
const FALLBACK_COORDINATES: Record<string, { lat: number; lon: number }> = {
  goa: { lat: 15.2993, lon: 74.124 },
  manali: { lat: 32.2432, lon: 77.1892 },
  jaipur: { lat: 26.9124, lon: 75.7873 },
  delhi: { lat: 28.6139, lon: 77.209 },
  mumbai: { lat: 19.076, lon: 72.8777 },
  bangalore: { lat: 12.9716, lon: 77.5946 },
  bengaluru: { lat: 12.9716, lon: 77.5946 },
  udaipur: { lat: 24.5854, lon: 73.7125 },
  dubai: { lat: 25.2048, lon: 55.2708 },
  singapore: { lat: 1.3521, lon: 103.8198 },
  bali: { lat: -8.3405, lon: 115.092 },
  paris: { lat: 48.8566, lon: 2.3522 },
  london: { lat: 51.5074, lon: -0.1278 },
};

export function interpretWeatherCode(code: number): { label: string; icon: string; isAdverse: boolean; adverseReason?: string } {
  // WMO Weather interpretation codes (http://open-meteo.com/en/docs)
  if (code === 0) return { label: 'Clear sky', icon: '☀️', isAdverse: false };
  if (code === 1) return { label: 'Mainly clear', icon: '🌤️', isAdverse: false };
  if (code === 2) return { label: 'Partly cloudy', icon: '⛅', isAdverse: false };
  if (code === 3) return { label: 'Overcast', icon: '☁️', isAdverse: false };
  if (code === 45 || code === 48) return { label: 'Fog / Mist', icon: '🌫️', isAdverse: false };
  if (code >= 51 && code <= 55) return { label: 'Drizzle', icon: '🌦️', isAdverse: false };
  if (code >= 61 && code <= 65) return { label: 'Heavy Rain', icon: '🌧️', isAdverse: true, adverseReason: 'Continuous rainfall expected' };
  if (code >= 71 && code <= 77) return { label: 'Snowfall', icon: '❄️', isAdverse: true, adverseReason: 'Sub-zero temperatures and snow' };
  if (code >= 80 && code <= 82) return { label: 'Rain Showers', icon: '🌧️', isAdverse: true, adverseReason: 'High chance of sudden showers' };
  if (code >= 95 && code <= 99) return { label: 'Thunderstorm', icon: '⛈️', isAdverse: true, adverseReason: 'Thunderstorm with hazardous lightning' };
  return { label: 'Variable', icon: '⛅', isAdverse: false };
}

/**
 * Fetch daily 7-day weather forecast from Open-Meteo for a given destination city
 */
export async function getDestinationWeatherForecast(destination: string): Promise<DailyWeatherForecast[]> {
  try {
    const cleanDest = (destination || 'Goa').toLowerCase().trim();
    let lat = 15.2993;
    let lon = 74.124;

    // Check predefined cache
    const matchedKey = Object.keys(FALLBACK_COORDINATES).find((k) => cleanDest.includes(k));
    if (matchedKey) {
      lat = FALLBACK_COORDINATES[matchedKey].lat;
      lon = FALLBACK_COORDINATES[matchedKey].lon;
    } else {
      // Dynamic geocoding via Open-Meteo
      try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(3000) });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            lat = geoData.results[0].latitude;
            lon = geoData.results[0].longitude;
          }
        }
      } catch (err) {
        console.warn('Geocoding lookup timed out, using regional fallback:', err);
      }
    }

    // Call Open-Meteo daily forecast API
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
    const res = await fetch(forecastUrl, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }

    const data = await res.json();
    const daily = data.daily || {};
    const times: string[] = daily.time || [];
    const codes: number[] = daily.weathercode || [];
    const maxTemps: number[] = daily.temperature_2m_max || [];
    const minTemps: number[] = daily.temperature_2m_min || [];
    const precipProbs: number[] = daily.precipitation_probability_max || [];

    const forecasts: DailyWeatherForecast[] = times.map((t, idx) => {
      const code = codes[idx] ?? 0;
      const precip = precipProbs[idx] ?? 0;
      const interpretation = interpretWeatherCode(code);
      const isHighPrecip = precip >= 50;
      const isAdverse = interpretation.isAdverse || isHighPrecip;
      const adverseReason = interpretation.adverseReason || (isHighPrecip ? `Precipitation risk at ${precip}%` : undefined);

      return {
        date: t,
        weatherCode: code,
        weatherLabel: interpretation.label,
        icon: interpretation.icon,
        tempMax: Math.round(maxTemps[idx] ?? 30),
        tempMin: Math.round(minTemps[idx] ?? 22),
        precipitationProbability: precip,
        isAdverse,
        adverseReason,
      };
    });

    return forecasts;
  } catch (error) {
    console.warn('Weather service fallback engaged:', error);
    // Graceful offline mock forecast for next 7 days
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getTime() + i * 86400000).toISOString().slice(0, 10);
      const isRain = i === 2; // Simulate 1 rain day for testing
      return {
        date: d,
        weatherCode: isRain ? 61 : 1,
        weatherLabel: isRain ? 'Light Rain Showers' : 'Mostly Sunny',
        icon: isRain ? '🌧️' : '☀️',
        tempMax: isRain ? 27 : 31,
        tempMin: 23,
        precipitationProbability: isRain ? 65 : 15,
        isAdverse: isRain,
        adverseReason: isRain ? 'Precipitation risk at 65%' : undefined,
      };
    });
  }
}

/**
 * Scan a list of bookings against destination weather forecasts.
 * Identifies outdoor activities scheduled on adverse weather days and suggests indoor swap-spot alternatives.
 */
export function analyzeWeatherConflicts(
  destination: string,
  bookings: Array<{ id?: string; title: string; category?: string; startTime?: string }>,
  forecasts: DailyWeatherForecast[]
): WeatherAnalysisResult {
  const OUTDOOR_KEYWORDS = [
    'beach',
    'trek',
    'hike',
    'cruise',
    'boat',
    'water sports',
    'scuba',
    'kayak',
    'parasail',
    'safari',
    'outdoor',
    'rooftop',
    'camping',
    'snorkeling',
    'sightseeing',
  ];

  const INDOOR_SWAP_SUGGESTIONS: Record<string, string[]> = {
    beach: ['Goa State Museum & Heritage Gallery', 'Indoor Artisanal Brewery Tasting', 'Spice Plantation Covered Cooking Workshop'],
    water: ['Luxury Thalassotherapy Spa Session', 'Aquarium & Marine Life Conservation Center', 'Indoor VR Scuba Simulator Experience'],
    trek: ['Fort Aguada Indoor Exhibition', 'Local Ceramic Art Studio Masterclass', 'Historic Portuguese Mansion Architectural Tour'],
    general: ['Art Gallery & Café Tour', 'Regional Food Culinary Masterclass', 'Indoor Bowling & Gaming Arena'],
  };

  const outdoorAlerts: WeatherAnalysisResult['outdoorAlerts'] = [];

  bookings.forEach((booking) => {
    const bookingTitleLower = (booking.title || '').toLowerCase();
    const isOutdoor = OUTDOOR_KEYWORDS.some((kw) => bookingTitleLower.includes(kw));
    if (!isOutdoor) return;

    const bookingDate = (booking.startTime || '').slice(0, 10);
    const matchingForecast = forecasts.find((f) => f.date === bookingDate);

    if (matchingForecast && matchingForecast.isAdverse) {
      // Pick a swap recommendation
      const categoryKey = bookingTitleLower.includes('beach')
        ? 'beach'
        : bookingTitleLower.includes('water') || bookingTitleLower.includes('boat') || bookingTitleLower.includes('scuba')
        ? 'water'
        : bookingTitleLower.includes('trek') || bookingTitleLower.includes('hike')
        ? 'trek'
        : 'general';

      const swaps = INDOOR_SWAP_SUGGESTIONS[categoryKey] || INDOOR_SWAP_SUGGESTIONS.general;
      const swapPick = swaps[Math.floor(Math.random() * swaps.length)];

      outdoorAlerts.push({
        date: matchingForecast.date,
        bookingTitle: booking.title,
        weatherLabel: matchingForecast.weatherLabel,
        precipitationProbability: matchingForecast.precipitationProbability,
        recommendedSwap: swapPick,
      });
    }
  });

  return {
    destination,
    latitude: 15.2993,
    longitude: 74.124,
    dailyForecast: forecasts,
    adverseDaysCount: forecasts.filter((f) => f.isAdverse).length,
    outdoorAlerts,
  };
}
