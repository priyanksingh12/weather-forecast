'use client';

import { useState, useEffect } from 'react';
import { weatherApi, LiveWeatherOut, AirQualityOut, WeatherForecast5DayOut } from '../services/api';

export interface LiveWeatherData {
  weather: LiveWeatherOut | null;
  airQuality: AirQualityOut | null;
  forecast5d: WeatherForecast5DayOut | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useLiveWeather(region: string = 'lucknow'): LiveWeatherData {
  const [weather, setWeather] = useState<LiveWeatherOut | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityOut | null>(null);
  const [forecast5d, setForecast5d] = useState<WeatherForecast5DayOut | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [wRes, aqiRes, fcRes] = await Promise.all([
        weatherApi.getLiveWeather({ region, units: 'metric' }).catch(() => null),
        weatherApi.getAirQuality({ region }).catch(() => null),
        weatherApi.get5DayForecast({ region, units: 'metric' }).catch(() => null),
      ]);

      if (wRes) setWeather(wRes);
      if (aqiRes) setAirQuality(aqiRes);
      if (fcRes) setForecast5d(fcRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to load live OpenWeather telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      fetchAll();
    }
    return () => {
      isMounted = false;
    };
  }, [region]);

  return { weather, airQuality, forecast5d, loading, error, refetch: fetchAll };
}
