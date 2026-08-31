/**
 * Assigns non-overlapping column slots to bookings that overlap in time.
 * Returns each booking paired with { column, totalColumns } so the UI
 * can position them side-by-side without overlap.
 */
export interface BookingWithSlot<T> {
  booking: T;
  column: number;
  totalColumns: number;
}

interface TimeRange {
  start: number; // minutes from midnight
  end: number;
}

function getTimeRange(startTime: string, endTime?: string | null): TimeRange {
  const start = new Date(startTime);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  // Default duration: 60 min if no end_time
  const endMinutes = endTime
    ? new Date(endTime).getHours() * 60 + new Date(endTime).getMinutes()
    : startMinutes + 60;
  return { start: startMinutes, end: Math.max(endMinutes, startMinutes + 30) };
}

function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

export function assignSlots<T extends { start_time: string; end_time?: string | null }>(
  bookings: T[]
): BookingWithSlot<T>[] {
  if (bookings.length === 0) return [];

  const sorted = [...bookings].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const ranges = sorted.map((b) => getTimeRange(b.start_time, b.end_time));

  // Group into clusters of overlapping bookings
  const clusters: number[][] = [];
  const assigned = new Array(sorted.length).fill(false);

  for (let i = 0; i < sorted.length; i++) {
    if (assigned[i]) continue;
    const cluster: number[] = [i];
    assigned[i] = true;
    for (let j = i + 1; j < sorted.length; j++) {
      if (assigned[j]) continue;
      // Check if j overlaps with any item already in this cluster
      const clusterOverlap = cluster.some((k) => overlaps(ranges[k], ranges[j]));
      if (clusterOverlap) {
        cluster.push(j);
        assigned[j] = true;
      }
    }
    clusters.push(cluster);
  }

  // Within each cluster, assign columns greedily
  const result: BookingWithSlot<T>[] = new Array(sorted.length);

  for (const cluster of clusters) {
    const cols: number[] = new Array(cluster.length).fill(-1);
    const colEndTimes: number[] = []; // track when each column is free

    for (let ci = 0; ci < cluster.length; ci++) {
      const idx = cluster[ci];
      const range = ranges[idx];
      // Find first free column
      let col = 0;
      while (colEndTimes[col] !== undefined && colEndTimes[col] > range.start) {
        col++;
      }
      cols[ci] = col;
      colEndTimes[col] = range.end;
    }

    const totalColumns = Math.max(...cols) + 1;

    for (let ci = 0; ci < cluster.length; ci++) {
      const idx = cluster[ci];
      result[idx] = {
        booking: sorted[idx],
        column: cols[ci],
        totalColumns,
      };
    }
  }

  return result;
}
