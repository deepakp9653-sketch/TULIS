/**
 * F-M4: Universal Itinerary DNA Importer
 *
 * Ingests external itinerary schemas (TripIt, Wanderlog, Google Travel, or raw pasted markdown/text)
 * and normalizes them into TULIS's strictly-typed Booking[] domain entities.
 */

import { Booking, BookingCategory } from './types';

export interface MappedItineraryResult {
  sourceType: 'TripIt' | 'Wanderlog' | 'Markdown/Text' | 'TulisDNA' | 'CuratedTemplate';
  destination?: string;
  suggestedDurationDays: number;
  bookings: Array<Omit<Booking, 'id'> & { tempId: string; selected: boolean }>;
  confidence: number;
}

export function detectCategory(text: string): BookingCategory {
  const lower = text.toLowerCase();
  if (lower.includes('flight') || lower.includes('train') || lower.includes('cab') || lower.includes('bus') || lower.includes('drive') || lower.includes('transfer')) {
    return 'transport';
  }
  if (lower.includes('hotel') || lower.includes('resort') || lower.includes('homestay') || lower.includes('hostel') || lower.includes('airbnb') || lower.includes('chalet') || lower.includes('stay')) {
    return 'lodging';
  }
  if (lower.includes('dinner') || lower.includes('lunch') || lower.includes('breakfast') || lower.includes('cafe') || lower.includes('meal') || lower.includes('food')) {
    return 'food';
  }
  if (lower.includes('trek') || lower.includes('tour') || lower.includes('safari') || lower.includes('museum') || lower.includes('temple') || lower.includes('beach') || lower.includes('monastery') || lower.includes('scuba')) {
    return 'activity';
  }
  return 'general';
}

export function parseUniversalItinerary(
  rawInput: string,
  targetTripId: string,
  baseDate: string = '2026-10-01'
): MappedItineraryResult {
  const trimmed = rawInput.trim();

  // 1. Try parsing JSON formats
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);

      // Wanderlog Format
      if (parsed.places || parsed.days || parsed.sections) {
        const days = Array.isArray(parsed.days) ? parsed.days : [parsed];
        const bookings: Array<Omit<Booking, 'id'> & { tempId: string; selected: boolean }> = [];

        days.forEach((day: any, dIdx: number) => {
          const items = day.places || day.items || day.sections || [];
          items.forEach((item: any, iIdx: number) => {
            const cat = detectCategory(item.name || item.title || item.category || '');
            const cost = Number(item.cost || item.price || 1500);
            const dateStr = new Date(new Date(baseDate).getTime() + dIdx * 86400000).toISOString().split('T')[0];

            bookings.push({
              tempId: `map-wl-${dIdx}-${iIdx}`,
              tripId: targetTripId,
              category: cat,
              title: item.name || item.title || 'Wanderlog Itinerary Item',
              vendor: item.location || item.venue || item.name || 'Local Vendor',
              startTime: `${dateStr}T10:00:00Z`,
              endTime: `${dateStr}T13:00:00Z`,
              estimatedCost: cost,
              actualCost: cost,
              status: 'confirmed',
              participantIds: [],
              selected: true,
            });
          });
        });

        return {
          sourceType: 'Wanderlog',
          destination: parsed.destination || parsed.title || 'Destination',
          suggestedDurationDays: Math.max(1, days.length),
          bookings,
          confidence: 0.95,
        };
      }

      // TripIt Format
      if (parsed.Itinerary || parsed.Trip || parsed.Segment) {
        const segments = parsed.Itinerary?.Segment || parsed.Segment || parsed.bookings || [];
        const bookings = (Array.isArray(segments) ? segments : [segments]).map((s: any, idx: number) => {
          const cat = detectCategory(s.title || s.type || s.SegmentType || '');
          const cost = Number(s.cost || s.total_cost || 2500);
          return {
            tempId: `map-ti-${idx}`,
            tripId: targetTripId,
            category: cat,
            title: s.title || s.name || s.SegmentType || 'TripIt Booking',
            vendor: s.vendor_name || s.supplier || s.airline || 'TripIt Partner',
            startTime: s.start_time || `${baseDate}T09:00:00Z`,
            endTime: s.end_time || `${baseDate}T12:00:00Z`,
            estimatedCost: cost,
            actualCost: cost,
            status: 'confirmed' as const,
            confirmationCode: s.confirmation_num || s.pnr || undefined,
            participantIds: [],
            selected: true,
          };
        });

        return {
          sourceType: 'TripIt',
          destination: parsed.Trip?.primary_location || 'Destination',
          suggestedDurationDays: Math.max(1, Math.ceil(bookings.length / 2)),
          bookings,
          confidence: 0.94,
        };
      }
    } catch {
      // Fall through to text/markdown parser
    }
  }

  // 2. Text / Markdown / Pasted Itinerary Parsing
  const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
  const bookings: Array<Omit<Booking, 'id'> & { tempId: string; selected: boolean }> = [];
  let currentDay = 0;

  lines.forEach((line, idx) => {
    // Detect Day Marker
    const dayMatch = line.match(/(?:day\s*(\d+)|day\s*one|day\s*two|day\s*three)/i);
    if (dayMatch && dayMatch[1]) {
      currentDay = Math.max(0, parseInt(dayMatch[1], 10) - 1);
      return;
    }

    // Ignore short headings or decorators
    if (line.length < 5 || line.startsWith('#') || line.startsWith('---')) return;

    // Detect amount if mentioned in line (e.g. ₹1500 or 1500)
    const costMatch = line.match(/(?:₹|rs\.?|inr|\$)\s*(\d+(?:,\d+)*)/i);
    const cost = costMatch ? parseFloat(costMatch[1].replace(/,/g, '')) : 1200;

    const cleanTitle = line
      .replace(/^[•\-\*\d\.\)]+\s*/, '')
      .replace(/(?:₹|rs\.?|inr|\$)\s*(\d+(?:,\d+)*)/gi, '')
      .replace(/\(approx\.?\s*cost\)/gi, '')
      .trim();

    if (cleanTitle.length > 3) {
      const cat = detectCategory(cleanTitle);
      const dateStr = new Date(new Date(baseDate).getTime() + currentDay * 86400000).toISOString().split('T')[0];

      bookings.push({
        tempId: `map-txt-${idx}`,
        tripId: targetTripId,
        category: cat,
        title: cleanTitle.slice(0, 80),
        vendor: cleanTitle.slice(0, 40),
        startTime: `${dateStr}T11:00:00Z`,
        endTime: `${dateStr}T14:00:00Z`,
        estimatedCost: cost,
        actualCost: cost,
        status: 'confirmed',
        participantIds: [],
        selected: true,
      });
    }
  });

  return {
    sourceType: 'Markdown/Text',
    suggestedDurationDays: Math.max(1, currentDay + 1),
    bookings: bookings.length > 0 ? bookings : [
      {
        tempId: 'map-default-1',
        tripId: targetTripId,
        category: 'lodging',
        title: 'Boutique Heritage Villa Stay',
        vendor: 'Heritage Properties',
        startTime: `${baseDate}T14:00:00Z`,
        endTime: `${baseDate}T12:00:00Z`,
        estimatedCost: 8500,
        actualCost: 8500,
        status: 'confirmed',
        participantIds: [],
        selected: true,
      },
    ],
    confidence: bookings.length > 0 ? 0.88 : 0.6,
  };
}

export const CURATED_ITINERARY_TEMPLATES = [
  {
    id: 'tpl-spiti-circuit',
    title: 'Spiti Valley High-Altitude Expedition',
    destination: 'Spiti Valley, Himachal Pradesh',
    durationDays: 6,
    tags: ['Adventure', 'Mountain', 'Roadtrip'],
    markdown: `Day 1: Arrival in Manali & 4x4 High-Altitude Scorpio Pick-up (₹32000)
Day 1: Stay at Old Manali Riverside Chalet (₹6500)
Day 2: Drive across Atal Tunnel & Kunzum Pass to Kaza (₹4500)
Day 2: Kaza Boutique Homestay & Traditional Butter Tea (₹3800)
Day 3: Visit Key Monastery & Kibber High Village Safari (₹2500)
Day 4: Drive to Hikkim Highest Post Office & Komic Monastery (₹2000)
Day 5: Camping at Chandratal Moon Lake Luxury Domes (₹12000)
Day 6: Return scenic drive to Manali & Farewell Dinner (₹4800)`,
  },
  {
    id: 'tpl-goa-retreat',
    title: 'Goa Coastal Workcation & Beach Vibes',
    destination: 'North & South Goa',
    durationDays: 5,
    tags: ['Beaches', 'Nightlife', 'Workcation'],
    markdown: `Day 1: Private Airport Chauffeur Shuttle to Assagao (₹2400)
Day 1: Portuguese Heritage 4-Bedroom Pool Villa Check-in (₹28000)
Day 2: Sunset catamaran sail & ocean kayaking at Morjim (₹7500)
Day 2: Dinner at Gunpowder Coastal Kitchen Assagao (₹4500)
Day 3: South Goa spice plantation tour & traditional Goan buffet (₹3600)
Day 4: Coworking session & beach shack sundowner at Thalassa (₹6000)
Day 5: Souvenir flea market shopping & airport drop (₹2200)`,
  },
  {
    id: 'tpl-coorg-coffee',
    title: 'Coorg Coffee Plantation & Rainforest Trails',
    destination: 'Coorg, Karnataka',
    durationDays: 4,
    tags: ['Nature', 'Relaxation', 'Estate Stay'],
    markdown: `Day 1: Bengaluru to Madikeri Innova Crysta Roadtrip (₹9500)
Day 1: 150-Acre Private Coffee Plantation Estate Bungalow (₹22000)
Day 2: Guided bean-to-cup coffee cupping & estate Jeep trail (₹3200)
Day 2: Traditional Kodava Pandi Curry & Akki Roti Dinner (₹2800)
Day 3: Hike to Abbey Falls & Golden Temple Bylakuppe Visit (₹1800)
Day 4: Scenic return drive to Bangalore with Mysore highway breakfast (₹2400)`,
  },
];
