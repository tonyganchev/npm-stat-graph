/// <reference types="vite/client" />

/**
 * Utility functions for interacting with the npm public registry API
 * Specifically focusing on the download statistics endpoints.
 * See: https://github.com/npm/registry/blob/master/docs/download-counts.md
 */

export interface DownloadStat {
  downloads: number;
  day: string;
}

export interface NpmStatsResponse {
  start: string;
  end: string;
  package: string;
  downloads: DownloadStat[];
}

/**
 * Fetches download stats for a specific package over a given time range.
 * Range format options:
 * - "last-day"
 * - "last-week"
 * - "last-month"
 * - "YYYY-MM-DD:YYYY-MM-DD" (specific range)
 */
export async function fetchPackageStats(
  packageName: string,
  range: "last-7-days" | "last-30-days" | "last-year"
): Promise<NpmStatsResponse> {
  // Mapping the UI friendly ranges to the exact format expected by the API
  let apiRange = "last-week";

  if (range === "last-7-days") {
    apiRange = "last-week";
  } else if (range === "last-30-days") {
    apiRange = "last-month";
  } else if (range === "last-year") {
    apiRange = "last-year";
  }

  const encodedPackageName = encodeURIComponent(packageName);

  // Use local Vite proxy with dev cache, or direct API in production
  const baseUrl = import.meta.env?.DEV
    ? '/api/npm'
    : 'https://api.npmjs.org';

  const response = await fetch(`${baseUrl}/downloads/range/${apiRange}/${encodedPackageName}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Package "\${packageName}" not found or has no data.`);
    }
    throw new Error(`Failed to fetch downlads data: \${response.statusText}`);
  }

  const data: NpmStatsResponse = await response.json();

  if (!data || !data.downloads) {
    throw new Error("Invalid data format received from npm API");
  }

  return data;
}
