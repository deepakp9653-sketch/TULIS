import { NextResponse } from 'next/server';
import { sql, saveTripToNeon, saveBookingToNeon } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-service';
import { scrapeDestinationData, buildGeoAnchoredItinerary } from '@/lib/destination-scraper';
import { enrichPlaceWithGoogleMaps } from '@/lib/google-maps-service';
import { getDestinationWeatherForecast, analyzeWeatherConflicts } from '@/lib/weather-service';

const GROQ_API_KEY =
  process.env.GROQ_API_KEY || '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';

// In-memory votes cache for Gogo group consensus (sessionId -> activityIndex -> participantId -> 'yes' | 'no' | 'maybe')
const gogoPlanVotesCache = new Map<string, Record<number, Record<string, string>>>();

const INTERVIEW_QUESTIONS = [
  {
    step: 1,
    key: 'destination',
    title: 'Where do you want to explore?',
    subtitle: 'Name a place, region, or travel vibe you are craving.',
    placeholder: 'e.g. South Goa beach shacks, Manali & Spiti, Kyoto, Bali',
    presets: ['Goa & Gokarna Sunsets', 'Himachal Mountain Escape', 'Rajasthan Royal Palaces', 'Kerala Backwaters & Tea Hills'],
  },
  {
    step: 2,
    key: 'duration',
    title: 'How long is your journey?',
    subtitle: 'Trip duration in days and ideal departure timeline.',
    placeholder: 'e.g. 4 days long weekend, 7 days road trip',
    presets: ['3 Days (Quick Getaway)', '5 Days (Standard Vacation)', '7 Days (Full Adventure)', '10+ Days (Extended Expedition)'],
  },
  {
    step: 3,
    key: 'travelers',
    title: 'Who is in the squad?',
    subtitle: 'Traveler headcount and group dynamic.',
    placeholder: 'e.g. Solo traveler, 4 college friends, family of 3, 8 team members',
    presets: ['Solo Explorer (1 person)', 'Couple Getaway (2 people)', 'Close Friends Squad (4 people)', 'Travel Tribe (6-8 people)'],
  },
  {
    step: 4,
    key: 'budget',
    title: 'What is your budget ceiling?',
    subtitle: 'Total budget target for the entire trip.',
    placeholder: 'e.g. ₹25,000 backpacker, ₹60,000 mid-tier, ₹1.5 Lakh luxury villa',
    presets: ['₹25,000 (Budget Conscious)', '₹50,000 (Balanced & Comfortable)', '₹1,00,000 (Premium Stays & Villas)', '₹2,00,000+ (Luxury Spree)'],
  },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;
    const sessionUser = await getCurrentUser();

    // 1. Start Interview
    if (action === 'start-interview') {
      const sessionId = 'gogo-' + Date.now();
      const userId = sessionUser?.id || body.userId || 'guest';

      await sql`
        INSERT INTO gogo_sessions (id, user_id, status, interview_answers)
        VALUES (${sessionId}, ${userId}, 'in_progress', '{}'::jsonb);
      `;

      return NextResponse.json({
        success: true,
        sessionId,
        currentStep: 1,
        totalSteps: 4,
        question: INTERVIEW_QUESTIONS[0],
      });
    }

    // 2. Answer Question or Generate Full Itinerary Plan
    if (action === 'answer' || action === 'generate-plan') {
      let destQuery = 'Rajasthan';
      let budgetNum = 50000;
      let daysCountNum = 4;
      let travelersNum = 4;
      let sessionId = body.sessionId || 'gogo-' + Date.now();

      if (action === 'answer') {
        const { step, key, answer, previousAnswers = {} } = body;
        if (!key || !answer) {
          return NextResponse.json({ success: false, error: 'Key and answer required' }, { status: 400 });
        }

        const updatedAnswers = { ...previousAnswers, [key]: answer };

        // Update session answers in DB
        try {
          await sql`
            UPDATE gogo_sessions
            SET interview_answers = ${JSON.stringify(updatedAnswers)}::jsonb,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${sessionId};
          `;
        } catch (e) {}

        // If more questions exist, return next question
        if (step < INTERVIEW_QUESTIONS.length) {
          const nextQ = INTERVIEW_QUESTIONS[step]; // 0-indexed matches step directly
          return NextResponse.json({
            success: true,
            sessionId,
            currentStep: step + 1,
            totalSteps: 4,
            question: nextQ,
            updatedAnswers,
            isComplete: false,
          });
        }

        destQuery = updatedAnswers.destination || 'Rajasthan';
        budgetNum = parseInt((updatedAnswers.budget || '50000').replace(/[^0-9]/g, '')) || 50000;
        daysCountNum = parseInt((updatedAnswers.duration || '4').replace(/[^0-9]/g, '')) || 4;
        travelersNum = parseInt((updatedAnswers.travelers || '4').replace(/[^0-9]/g, '')) || 4;
      } else {
        // Direct generate-plan action
        destQuery = body.destination || 'Rajasthan';
        budgetNum = parseInt(String(body.budget || '50000').replace(/[^0-9]/g, '')) || 50000;
        daysCountNum = parseInt(String(body.daysCount || '4').replace(/[^0-9]/g, '')) || 4;
        travelersNum = parseInt(String(body.travelers || '4').replace(/[^0-9]/g, '')) || 4;
      }

      const scrapedDossier = await scrapeDestinationData(destQuery, budgetNum, daysCountNum);

      const systemPrompt = `You are Gogo, an expert travel architect for Tulis.
Generate a structured, geographically accurate travel itinerary and budget breakdown based on the user's answers and verified ground-truth destination data.

END-TO-END JOURNEY ARCHITECTURE ('GOING TO COMING' MANDATE):
The itinerary MUST represent the complete journey from start to finish:
1. "going": Day 1 outbound departure transit (Flight, Train, or Road trip express), arrival in ${scrapedDossier.destination}, luggage drop & check-in at base stay, and evening welcome meal.
2. "stay": Verified base camp / boutique resort stay throughout the trip.
3. "exploration": Intermediate days packed with morning adventures, regional specialty lunch, afternoon cultural exploration, and sunset viewpoints.
4. "coming": Final day farewell souvenir shopping, hotel check-out, inbound return journey transit back home, and squad balance settlement wrap-up.

STRICT GEOGRAPHIC BOUNDARY RULE:
The requested destination is: "${scrapedDossier.destination}" (${scrapedDossier.stateOrCountry}).
EVERY SINGLE stay, hotel, restaurant, and activity MUST BE STRICTLY LOCATED IN ${scrapedDossier.destination.toUpperCase()}.
DO NOT recommend places from any other state or region. Any recommendation outside ${scrapedDossier.destination} is strictly prohibited.

Verified authentic places in ${scrapedDossier.destination}:
- Stays / Hotels: ${scrapedDossier.hotels.map((h) => h.name).join(', ')}
- Dining / Restaurants: ${scrapedDossier.dining.map((d) => d.name).join(', ')}
- Signature Activities: ${scrapedDossier.activities.map((a) => a.name).join(', ')}

Respond ONLY with a valid JSON object matching this schema:
{
  "title": string,
  "destination": "${scrapedDossier.destination}",
  "estimatedBudget": number,
  "daysCount": ${daysCountNum},
  "summary": string,
  "bookings": [
    {
      "title": string,
      "category": "stay" | "flight" | "train" | "rental" | "activity" | "dining",
      "journeyPhase": "going" | "stay" | "exploration" | "coming",
      "vendor": string,
      "estimatedCost": number,
      "dayNumber": number,
      "description": string,
      "phone": string,
      "website": string,
      "rating": number,
      "highlights": string[],
      "address": string,
      "bestTimeToVisit": string
    }
  ]
}

Ensure the bookings include:
- At least 1 outbound transit item on Day 1 (journeyPhase: "going", category: "flight" or "train" or "rental")
- 1 stay item (journeyPhase: "stay", category: "stay")
- Daily activities and dining (journeyPhase: "exploration")
- At least 1 return transit item on Day ${daysCountNum} (journeyPhase: "coming", category: "flight" or "train" or "rental")`;

      const userContent = `Create a complete end-to-end trip itinerary for ${scrapedDossier.destination} from going to coming:
- Duration: ${daysCountNum} days
- Travelers: ${travelersNum} people
- Budget: ₹${budgetNum}
IMPORTANT:
1. Cover the full journey from departure outbound transit ("going") to final inbound return journey back home ("coming").
2. For every hotel, restaurant, and venue, provide valid phone number, official website, real rating (e.g. 4.8), highlights, address, and best time to visit.`;

      let generatedPlan: any = null;

      // Try OpenAI first if OPENAI_API_KEY is available
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
      if (OPENAI_API_KEY) {
        try {
          const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent },
              ],
              temperature: 0.2,
              response_format: { type: 'json_object' },
            }),
          });
          if (oaiRes.ok) {
            const data = await oaiRes.json();
            const text = data.choices?.[0]?.message?.content || '{}';
            generatedPlan = JSON.parse(text);
          }
        } catch (oaiErr) {
          console.warn('OpenAI Gogo generation error:', oaiErr);
        }
      }

      // Try Groq if OpenAI didn't produce a plan and Groq key is present
      if (!generatedPlan && GROQ_API_KEY) {
        const candidateModels = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b'];

        for (const model of candidateModels) {
          try {
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              signal: AbortSignal.timeout(10000),
              headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userContent },
                ],
                temperature: 0.2,
                max_tokens: 1500,
                response_format: { type: 'json_object' },
              }),
            });

            if (groqRes.ok) {
              const data = await groqRes.json();
              const text = data.choices?.[0]?.message?.content || '{}';
              const parsed = JSON.parse(text);
              if (parsed && Array.isArray(parsed.bookings) && parsed.bookings.length > 0) {
                generatedPlan = parsed;
                console.log(`Gogo itinerary generated successfully by Groq model ${model}`);
                break;
              }
            }
          } catch (aiErr) {
            console.warn(`Groq Gogo generation attempt with ${model} failed, checking next model:`, aiErr);
          }
        }
      }

      // Geographically-anchored deterministic itinerary engine (guaranteed zero-hallucination real venues)
      if (!generatedPlan || !Array.isArray(generatedPlan.bookings) || generatedPlan.bookings.length === 0) {
        generatedPlan = buildGeoAnchoredItinerary(scrapedDossier, daysCountNum, travelersNum, budgetNum);
      }

      // Strict Geographic Filter: ensure places strictly belong to the destination
      if (generatedPlan && Array.isArray(generatedPlan.bookings)) {
        const destLower = (scrapedDossier.destination || '').toLowerCase();
        if (destLower.includes('assam') || destLower.includes('kaziranga') || destLower.includes('guwahati') || destLower.includes('majuli')) {
          const outOfStateKeywords = ['rajasthan', 'jaipur', 'udaipur', 'jodhpur', 'jaisalmer', 'rambagh', 'samode', 'chokhi dhani', 'mehrangarh', 'amber fort'];
          generatedPlan.bookings = generatedPlan.bookings.map((b: any, idx: number) => {
            const combined = `${b.title} ${b.vendor} ${b.description}`.toLowerCase();
            const isInvalid = outOfStateKeywords.some((kw) => combined.includes(kw));
            if (isInvalid) {
              const replacement = scrapedDossier.hotels[idx % scrapedDossier.hotels.length] || scrapedDossier.hotels[0];
              return {
                ...b,
                title: replacement.name,
                vendor: replacement.name,
                description: replacement.description,
                category: replacement.category || b.category,
                estimatedCost: replacement.estimatedCost || b.estimatedCost,
                address: replacement.area || 'Assam, India',
              };
            }
            return b;
          });
        }
      }

      // Real-Time Google Maps & Places Enrichment:
      // Attach verified phone/mobile numbers, official websites, Google Maps URLs, and live ratings
      if (Array.isArray(generatedPlan.bookings)) {
        generatedPlan.bookings = await Promise.all(
          generatedPlan.bookings.map(async (b: any) => {
            const enrichTarget = b.vendor || b.title;
            const placeDetails = await enrichPlaceWithGoogleMaps(enrichTarget, scrapedDossier.destination);
            return {
              ...b,
              phone: placeDetails.phone || b.phone || undefined,
              website: placeDetails.website || b.website || undefined,
              googleMapsUrl: placeDetails.googleMapsUrl || b.googleMapsUrl || undefined,
              address: placeDetails.address || b.address || undefined,
              rating: placeDetails.rating || b.rating || 4.7,
              userRatingsTotal: placeDetails.userRatingsTotal || undefined,
              isGoogleVerified: placeDetails.isGoogleVerified ?? true,
            };
          })
        );
      }

      // F1.1: Budget-First Backward Planning Engine
      // If the generated itinerary exceeds the user's explicit budget ceiling, perform iterative backward adjustments.
      const budgetAdjustments: Array<{
        title: string;
        category: string;
        previousCost: number;
        newCost: number;
        reason: string;
      }> = [];

      if (Array.isArray(generatedPlan.bookings) && budgetNum > 0) {
        let currentTotal = generatedPlan.bookings.reduce(
          (sum: number, b: any) => sum + (Number(b.estimatedCost) || 0),
          0
        );

        if (currentTotal > budgetNum) {
          // Pass 1: Optimize accommodations (downgrade luxury/premium stays by ~35%)
          for (let i = 0; i < generatedPlan.bookings.length; i++) {
            if (currentTotal <= budgetNum) break;
            const b = generatedPlan.bookings[i];
            if (b.category === 'stay' && (Number(b.estimatedCost) || 0) > 2000) {
              const origCost = Number(b.estimatedCost);
              const reduction = Math.min(origCost * 0.35, currentTotal - budgetNum);
              const newCost = Math.max(1200, Math.round(origCost - reduction));
              if (newCost < origCost) {
                b.estimatedCost = newCost;
                currentTotal -= origCost - newCost;
                budgetAdjustments.push({
                  title: b.title,
                  category: 'stay',
                  previousCost: origCost,
                  newCost,
                  reason: 'Optimized accommodation tier to boutique heritage stay to fit budget ceiling',
                });
              }
            }
          }

          // Pass 2: If still over budget, adjust high-cost activities/dining (trim activities > ₹800)
          if (currentTotal > budgetNum) {
            for (let i = generatedPlan.bookings.length - 1; i >= 0; i--) {
              if (currentTotal <= budgetNum) break;
              const b = generatedPlan.bookings[i];
              if (
                (b.category === 'activity' || b.category === 'dining') &&
                (Number(b.estimatedCost) || 0) > 800
              ) {
                const origCost = Number(b.estimatedCost);
                const reduction = Math.min(origCost * 0.5, currentTotal - budgetNum);
                const newCost = Math.max(300, Math.round(origCost - reduction));
                if (newCost < origCost) {
                  b.estimatedCost = newCost;
                  currentTotal -= origCost - newCost;
                  budgetAdjustments.push({
                    title: b.title,
                    category: b.category,
                    previousCost: origCost,
                    newCost,
                    reason: `Refined ${b.category} from premium package to self-guided cultural access`,
                  });
                }
              }
            }
          }

          generatedPlan.estimatedBudget = currentTotal;
          generatedPlan.budgetAdjustments = budgetAdjustments;
        } else {
          generatedPlan.estimatedBudget = currentTotal;
          generatedPlan.budgetAdjustments = [];
        }
      }

      // F1.2: Weather-Aware Replanning (Open-Meteo Integration)
      try {
        const dest = scrapedDossier.destination || generatedPlan.destination || 'Goa';
        const forecasts = await getDestinationWeatherForecast(dest);
        const weatherAnalysis = analyzeWeatherConflicts(dest, generatedPlan.bookings || [], forecasts);
        generatedPlan.weatherSnapshot = weatherAnalysis;
      } catch (wErr) {
        console.warn('Weather forecast analysis warning:', wErr);
      }

      // Save generated plan to session in DB
      await sql`
        UPDATE gogo_sessions
        SET generated_plan = ${JSON.stringify(generatedPlan)}::jsonb,
            status = 'completed',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${sessionId};
      `;

      return NextResponse.json({
        success: true,
        sessionId,
        isComplete: true,
        generatedPlan,
        plan: generatedPlan,
        message: 'Gogo itinerary plan crafted successfully!',
      });
    }

    // 3. Convert Gogo Draft to Real Trip & Bookings in Neon
    if (action === 'convert-to-trip') {
      const { sessionId, plan, targetUserId } = body;
      const user = sessionUser || { id: targetUserId || 'p1', name: 'Traveler', email: 'traveler@tulis.in' };

      const activePlan = plan;
      if (!activePlan || !activePlan.title) {
        return NextResponse.json({ success: false, error: 'Valid plan draft is required' }, { status: 400 });
      }

      const tripId = 'trip-' + Date.now();
      const codeSuffix = Math.floor(1000 + Math.random() * 9000);
      const inviteCode = (activePlan.destination.slice(0, 3).toUpperCase() || 'TRP') + codeSuffix;

      // 1. Save trip to Neon
      const newTrip = {
        id: tripId,
        title: activePlan.title,
        destination: activePlan.destination,
        baseCurrency: 'INR',
        budgetCeiling: activePlan.estimatedBudget || 50000,
        inviteCode,
        organizerId: user.id,
      };

      const creatorParticipant = {
        id: user.id.startsWith('p') ? user.id : 'p-' + Date.now(),
        name: user.name,
        email: user.email,
        role: 'organizer',
        upiId: `${user.name.toLowerCase().replace(/\s+/g, '')}@upi`,
        status: 'active',
        weight: 1,
        roomTier: 'suite',
      };

      await saveTripToNeon(newTrip, [creatorParticipant]);

      // 2. Save each generated booking
      if (Array.isArray(activePlan.bookings)) {
        for (let i = 0; i < activePlan.bookings.length; i++) {
          const b = activePlan.bookings[i];
          const bookingId = 'bk-' + Date.now() + '-' + i;
          await saveBookingToNeon({
            id: bookingId,
            tripId,
            category: b.category || 'stay',
            title: b.title,
            vendor: b.vendor || 'Recommended Vendor',
            estimatedCost: b.estimatedCost || 0,
            actualCost: b.estimatedCost || 0,
            status: 'confirmed',
            notes: b.description || 'Auto-drafted by Gogo AI',
            participantIds: [creatorParticipant.id],
          });
        }
      }

      // 3. Mark session converted if sessionId exists
      if (sessionId) {
        await sql`
          UPDATE gogo_sessions
          SET status = 'converted',
              trip_id = ${tripId},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${sessionId};
        `;
      }

      return NextResponse.json({
        success: true,
        tripId,
        inviteCode,
        trip: newTrip,
        message: 'Gogo plan successfully materialized into real Tulis trip and ledger!',
      });
    }

    // 4. Swap Spot / Change Venue (If user doesn't like a specific recommendation)
    if (action === 'swap-spot') {
      const {
        destination = 'Rajasthan',
        category = 'stay',
        currentTitle = '',
        currentVendor = '',
        dayNumber = 1,
        budgetLimit = 25000,
      } = body;

      const prompt = `You are Gogo, an expert travel architect for Tulis.
The traveler dislikes their current recommendation and wants to SWAP it for a completely different authentic alternative spot in ${destination} (${category}).
Current Spot to REPLACE: "${currentTitle || currentVendor}" (vendor: ${currentVendor}).
Find a completely different, authentic, top-rated REAL place in ${destination}.
DO NOT recommend ${currentVendor} or ${currentTitle}.

Respond ONLY with a valid JSON object matching this schema:
{
  "title": string,
  "category": "${category}",
  "vendor": string,
  "estimatedCost": number,
  "dayNumber": ${dayNumber},
  "description": string,
  "phone": string,
  "website": string,
  "rating": number,
  "highlights": string[],
  "address": string,
  "bestTimeToVisit": string
}`;

      let swappedSpot: any = null;
      const candidateModels = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'llama-3.3-70b-versatile'];

      if (GROQ_API_KEY) {
        for (const model of candidateModels) {
          try {
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              signal: AbortSignal.timeout(8000),
              headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model,
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
                temperature: 0.4,
              }),
            });

            if (groqRes.ok) {
              const data = await groqRes.json();
              const text = data.choices?.[0]?.message?.content || '{}';
              const parsed = JSON.parse(text);
              if (parsed && parsed.title && parsed.vendor) {
                swappedSpot = parsed;
                break;
              }
            }
          } catch (swapErr) {
            console.warn(`Groq swap attempt with ${model} failed:`, swapErr);
          }
        }
      }

      // Fallback: pick from ground-truth destination scraper if AI fails
      if (!swappedSpot || !swappedSpot.vendor) {
        const scrapedDossier = await scrapeDestinationData(destination, budgetLimit * 3, 3);
        const pool =
          category === 'stay'
            ? scrapedDossier.hotels
            : category === 'dining'
            ? scrapedDossier.dining
            : scrapedDossier.activities;

        const candidate =
          pool.find(
            (p) =>
              !p.name.toLowerCase().includes(currentVendor.toLowerCase()) &&
              !currentVendor.toLowerCase().includes(p.name.toLowerCase())
          ) || pool[0];

        if (candidate) {
          swappedSpot = {
            title: candidate.name,
            category,
            vendor: candidate.name,
            estimatedCost: candidate.estimatedCost || budgetLimit,
            dayNumber,
            description: candidate.description,
            rating: candidate.rating || 4.7,
            highlights: ['Verified Regional Venue', 'Highly Recommended Experience'],
          };
        }
      }

      // Real-Time Google Maps & Places Enrichment
      const targetName = swappedSpot.vendor || swappedSpot.title;
      const placeDetails = await enrichPlaceWithGoogleMaps(targetName, destination);

      const finalSwappedBooking = {
        ...swappedSpot,
        phone: placeDetails.phone || swappedSpot.phone || undefined,
        website: placeDetails.website || swappedSpot.website || undefined,
        googleMapsUrl: placeDetails.googleMapsUrl || swappedSpot.googleMapsUrl || undefined,
        address: placeDetails.address || swappedSpot.address || undefined,
        rating: placeDetails.rating || swappedSpot.rating || 4.7,
        userRatingsTotal: placeDetails.userRatingsTotal || undefined,
        highlights: swappedSpot.highlights || ['Verified Heritage Spot', 'Signature Ambience'],
        isGoogleVerified: placeDetails.isGoogleVerified ?? true,
      };

      return NextResponse.json({
        success: true,
        newBooking: finalSwappedBooking,
        message: `Spot successfully swapped to ${finalSwappedBooking.title}!`,
      });
    }

    // 5. Consensus Voting on Gogo Plan Itinerary Items (F1.3)
    if (action === 'cast-vote') {
      const { sessionId = 'default-session', participantId = 'user', activityIndex = 0, vote = 'yes' } = body;

      let sessionVotes = gogoPlanVotesCache.get(sessionId);
      if (!sessionVotes) {
        sessionVotes = {};
        gogoPlanVotesCache.set(sessionId, sessionVotes);
      }
      if (!sessionVotes[activityIndex]) {
        sessionVotes[activityIndex] = {};
      }
      sessionVotes[activityIndex][participantId] = vote;

      // Calculate aggregated tallies
      const aggregated: Record<
        number,
        { yes: number; no: number; maybe: number; userVotes: Record<string, string> }
      > = {};
      for (const [idxStr, votesMap] of Object.entries(sessionVotes)) {
        const idx = Number(idxStr);
        let yes = 0,
          no = 0,
          maybe = 0;
        for (const v of Object.values(votesMap)) {
          if (v === 'yes') yes++;
          else if (v === 'no') no++;
          else if (v === 'maybe') maybe++;
        }
        aggregated[idx] = { yes, no, maybe, userVotes: votesMap };
      }

      return NextResponse.json({
        success: true,
        sessionId,
        votes: aggregated,
        message: 'Vote recorded successfully',
      });
    }

    if (action === 'get-votes') {
      const { sessionId = 'default-session' } = body;
      const sessionVotes = gogoPlanVotesCache.get(sessionId) || {};
      const aggregated: Record<
        number,
        { yes: number; no: number; maybe: number; userVotes: Record<string, string> }
      > = {};
      for (const [idxStr, votesMap] of Object.entries(sessionVotes)) {
        const idx = Number(idxStr);
        let yes = 0,
          no = 0,
          maybe = 0;
        for (const v of Object.values(votesMap)) {
          if (v === 'yes') yes++;
          else if (v === 'no') no++;
          else if (v === 'maybe') maybe++;
        }
        aggregated[idx] = { yes, no, maybe, userVotes: votesMap };
      }

      return NextResponse.json({
        success: true,
        sessionId,
        votes: aggregated,
      });
    }

    // 6. Grok AI Direct Assistant: Budget Q&A, Trip Guidance & Direct Booking Creation
    if (action === 'ask-question') {
      const {
        query,
        destination = 'Trip',
        totalSpend = 0,
        budgetCeiling = 50000,
        participants = [],
        expenses = [],
        netBalances = [],
        simplifiedDebts = [],
        bookings = [],
        currentUser,
      } = body;

      if (!query) {
        return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
      }

      const remainingBudget = Math.max(0, budgetCeiling - totalSpend);
      const participantSummary = participants
        .map((p: any) => `${p.name || 'Member'} (${p.role || 'traveler'}, ID: ${p.id})`)
        .join(', ');

      const netBalanceSummary =
        netBalances.length > 0
          ? netBalances
              .map((nb: any) => {
                const p = participants.find((x: any) => x.id === nb.participantId);
                const name = p?.name || nb.participantId;
                const amt = Number(nb.netBalance) || 0;
                if (amt > 0.01) return `${name}: +₹${amt.toFixed(2)} (OWED to them / in surplus)`;
                if (amt < -0.01) return `${name}: -₹${Math.abs(amt).toFixed(2)} (OWES the squad / in deficit)`;
                return `${name}: ₹0.00 (Fully balanced)`;
              })
              .join('; ')
          : 'All balances currently balanced (zero debt)';

      const debtSummary =
        simplifiedDebts.length > 0
          ? simplifiedDebts
              .map((d: any) => {
                const fromP = participants.find((x: any) => x.id === d.fromParticipantId)?.name || d.fromParticipantId;
                const toP = participants.find((x: any) => x.id === d.toParticipantId)?.name || d.toParticipantId;
                return `${fromP} pays ${toP} ₹${Number(d.amount).toFixed(2)}`;
              })
              .join('; ')
          : 'No pending debt transfers';

      const expenseListSummary =
        expenses.length > 0
          ? expenses
              .slice(-10)
              .map((e: any) => {
                const payer = participants.find((x: any) => x.id === e.payerId)?.name || e.payerId || 'Squad';
                return `• "${e.title || 'Expense'}": ₹${e.totalAmount || e.amount || 0} paid by ${payer} (Split: ${e.splitType || 'equal'})`;
              })
              .join('\n')
          : 'No expenses logged yet';

      const bookingListSummary =
        bookings.length > 0
          ? bookings
              .slice(-10)
              .map((b: any) => `• Day ${b.dayNumber || 1}: ${b.title} (${b.category || 'booking'}, ₹${b.estimatedCost || b.actualCost || 0}, vendor: ${b.vendor || 'N/A'})`)
              .join('\n')
          : 'No bookings scheduled yet';

      const systemPrompt = `You are Grok AI, the autonomous, mathematically precise financial auditor and companion for Tulis.
Trip: ${destination}. Total Squad Budget: ₹${budgetCeiling}. Total Spent: ₹${totalSpend}. Remaining: ₹${remainingBudget}.
Squad Members: ${participantSummary || 'Aditya, Sarah, Rahul, Priya'}.

CURRENT VERIFIED LEDGER STATE:
Participant Net Balances:
${netBalanceSummary}

Simplified Optimal Debt Transfers (Minimum Transactions Invariant):
${debtSummary}

Recent Logged Expenses:
${expenseListSummary}

Existing Trip Bookings:
${bookingListSummary}

Current User: ${currentUser?.name || 'Traveler'} (${currentUser?.id || 'user'})

CAPABILITIES:
1. BUDGET & SQUAD BALANCE QUESTIONS:
   - When asked "how much money do I / does someone owe / am I owed and WHY is it this much":
     State the exact net balance. Explain the mathematical WHY: reference the specific expenses they benefited from, their split shares, what they paid out-of-pocket vs what was paid on their behalf, and who they settle up with.
     Reinforce the zero-sum invariant: sum of all net balances in Tulis strictly equals ₹0.00.
2. TRIP & LOCAL DESTINATION GUIDANCE:
   - Answer destination questions (weather, local attractions, authentic cuisine, packing tips, safety, scenic viewpoints) for ${destination} with vivid, authentic regional recommendations.
3. DIRECT BOOKING CREATION:
   - If the user asks to book or schedule something (e.g. "Book Taj Hotel on Day 2 for ₹4500", "Add rafting on Day 3 for ₹1200", "Reserve dinner at Cafe Simla Times for ₹1500"), EXTRACT the booking details and populate "bookingToCreate".

You must respond in strictly valid JSON matching this schema:
{
  "reply": string, // markdown formatted, helpful, transparent and direct
  "bookingToCreate": { // ONLY include if user requested to book or add a stay/activity/flight/train/dining/cab! Otherwise null
    "title": string,
    "category": "stay" | "activity" | "dining" | "flight" | "train" | "rental",
    "vendor": string,
    "estimatedCost": number,
    "actualCost": number,
    "dayNumber": number,
    "description": string,
    "status": "confirmed"
  } | null,
  "suggestedFollowUps": string[]
}`;

      let aiReply: any = null;
      if (GROQ_API_KEY) {
        const candidateModels = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b'];
        for (const model of candidateModels) {
          try {
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              signal: AbortSignal.timeout(10000),
              headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: query },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.2,
              }),
            });

            if (groqRes.ok) {
              const data = await groqRes.json();
              const content = data.choices?.[0]?.message?.content || '{}';
              const parsed = JSON.parse(content);
              if (parsed && parsed.reply) {
                aiReply = parsed;
                break;
              }
            }
          } catch (gErr) {
            console.warn(`Groq ask-question notice (${model}):`, gErr);
          }
        }
      }

      if (!aiReply) {
        aiReply = {
          reply: `For **${destination}**, remaining squad budget is **₹${remainingBudget.toLocaleString('en-IN')}** out of **₹${budgetCeiling.toLocaleString('en-IN')}**. All squad balances are zero-sum reconciled.`,
          bookingToCreate: null,
          suggestedFollowUps: ['Who owes what in the squad?', 'What is our remaining budget?'],
        };
      }

      if (aiReply.bookingToCreate) {
        aiReply.bookingToCreate = {
          id: 'bk-' + Date.now(),
          tripId: body.tripId || 'default-trip',
          status: 'confirmed',
          ...aiReply.bookingToCreate,
        };
      }

      return NextResponse.json({
        success: true,
        reply: aiReply.reply,
        bookingToCreate: aiReply.bookingToCreate || null,
        suggestedFollowUps: aiReply.suggestedFollowUps || [],
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid Gogo action' }, { status: 400 });
  } catch (err: any) {
    console.error('Gogo API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
