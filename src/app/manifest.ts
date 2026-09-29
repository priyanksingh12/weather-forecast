import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ForecastIQ - Forecast Reliability Intelligence',
    short_name: 'ForecastIQ',
    description: 'AI-Based Forecast Bust Detection Platform for Medium-Range NWP',
    start_url: '/',
    display: 'standalone',
    background_color: '#060913',
    theme_color: '#060913',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon'
      }
    ]
  };
}
