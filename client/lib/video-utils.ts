/**
 * Format duration in seconds to MM:SS or HH:MM:SS format
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format view count to human-readable format (e.g., 1.2k, 3.5M)
 */
export function formatViews(views: number | null | undefined): string {
  if (!views || views <= 0) return "0 views";

  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  }

  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}k views`;
  }

  return `${views} views`;
}
