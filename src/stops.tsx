// src/loadBusStops.ts
import { parse } from 'csv-parse/browser/esm/sync'

export interface BusStop {
  stop_id: string;
  stop_name: string;
  stop_desc: string;
  stop_lat: number;
  stop_lon: number;
}

export async function loadBusStops(): Promise<BusStop[]> {
  const response = await fetch('/gtfs/stops.txt')
  const csvData = await response.text()

  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
  })

  return records.map((record: any) => ({
    stop_id: record.stop_id.toString(),
    stop_name: record.stop_name,
    stop_desc: record.stop_desc,
    stop_lat: parseFloat(record.stop_lat),
    stop_lon: parseFloat(record.stop_lon),
  }))
}
