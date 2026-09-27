import { NextRequest, NextResponse } from 'next/server';
import { getCurrentLiveWeather } from '@/lib/weather-service';
import { computeSocialGroundTruthVerification, getDestinationSocialSignals } from '@/lib/social-signals-service';
import { runDigitalTwinSimulation, PRESET_SIMULATION_SCENARIOS, WeatherSimulationParameters } from '@/lib/digital-twin-engine';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get('destination') || 'Goa';

  try {
    const liveWeather = await getCurrentLiveWeather(destination);
    const socialVerification = computeSocialGroundTruthVerification(
      destination,
      liveWeather.precipitationRate,
      liveWeather.windSpeed,
      liveWeather.weatherLabel
    );

    return NextResponse.json({
      success: true,
      destination,
      liveWeather,
      socialVerification,
      presets: PRESET_SIMULATION_SCENARIOS,
    });
  } catch (error: any) {
    console.error('Digital Twin GET Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch digital twin telemetry' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      participants = [],
      bookings = [],
      expenses = [],
      payments = [],
      refunds = [],
      parameters,
      destination = 'Goa',
    } = body;

    const defaultParams: WeatherSimulationParameters = PRESET_SIMULATION_SCENARIOS.monsoon_cloudburst;
    const simParams: WeatherSimulationParameters = parameters || defaultParams;

    const simulationResult = runDigitalTwinSimulation(
      participants,
      bookings,
      expenses,
      payments,
      refunds,
      simParams,
      destination
    );

    return NextResponse.json({
      success: true,
      simulation: simulationResult,
    });
  } catch (error: any) {
    console.error('Digital Twin POST Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to execute digital twin simulation' },
      { status: 500 }
    );
  }
}
