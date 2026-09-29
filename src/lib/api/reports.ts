import { fetchWithFallback } from './client';
import { CreateReportRequest, ReportStatusData, ApiResponse } from './types';
import { INDIA_REGIONS } from '../geo/indiaGeoJson';

export async function createReport(req: CreateReportRequest): Promise<ApiResponse<ReportStatusData>> {
  const reportId = `rep_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  // Convert region_id string slug (e.g. 'uttar-pradesh') into an integer ID expected by backend FastAPI Pydantic schema
  let numericRegionId = 1;
  if (typeof req.region_id === 'number') {
    numericRegionId = req.region_id;
  } else if (typeof req.region_id === 'string') {
    const parsed = parseInt(req.region_id, 10);
    if (!isNaN(parsed) && parsed > 0) {
      numericRegionId = parsed;
    } else {
      const idx = INDIA_REGIONS.findIndex((r) => r.id === req.region_id);
      numericRegionId = idx >= 0 ? idx + 1 : 1;
    }
  }

  // The backend strictly accepts ONLY { region_id: int, lead_day: int }. Extra fields cause 422 Unprocessable Content.
  const backendPayload = {
    region_id: numericRegionId,
    lead_day: Number(req.lead_day) || 7
  };

  return fetchWithFallback<ReportStatusData>(
    '/reports',
    () => ({
      report_id: reportId,
      region_id: String(req.region_id),
      status: 'ready',
      download_url: `/api/v1/r/${reportId}`,
      expires_at_utc: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      file_size_bytes: 1420500 // ~1.4 MB
    }),
    {
      method: 'POST',
      body: JSON.stringify(backendPayload)
    }
  );
}

export async function getReportStatus(reportId: string): Promise<ApiResponse<ReportStatusData>> {
  return fetchWithFallback<ReportStatusData>(`/reports/${reportId}`, () => ({
    report_id: reportId,
    region_id: 'uttar-pradesh',
    status: 'ready',
    download_url: `/api/v1/r/${reportId}`,
    expires_at_utc: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    file_size_bytes: 1420500
  }));
}
