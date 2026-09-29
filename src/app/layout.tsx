import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '../components/layout/AppLayout';
import { DataQualityBanner } from '../components/layout/DataQualityBanner';
import { ThemeProvider } from '../components/theme/ThemeProvider';

export const metadata: Metadata = {
  title: 'CloudSense · AI Forecast Bust Detection & Weather Intelligence Platform',
  description: 'AI-Based Forecast Bust Detection & Reliability Assessment for Medium-Range Numerical Weather Prediction (SIH 2026)',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('cloudsense-theme') || 'dark';
                document.documentElement.setAttribute('data-theme', t);
                if (t === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-[var(--background)] text-[var(--text-primary)] font-sans selection:bg-[var(--weather-blue)] selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <DataQualityBanner quality="ok" timestampUtc="2026-09-23T06:12:00Z" />
          <AppLayout>
            {children}
          </AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
