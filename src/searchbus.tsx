import { parse } from 'csv-parse/browser/esm/sync'

export interface BusRoute {
  route_id: string;
  agency_id: number;
  route_short_name: string;
  route_long_name: string;
  route_type: number;
  route_color: string;
  route_text_color: string;
}

export async function loadBusRoutes(): Promise<BusRoute[]> {
  const response = await fetch('/gtfs/routes.txt')
  const csvData = await response.text()

  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
  })

  return records.map((record: any) => ({
    route_id: record.route_id.toString(),
    agency_id: record.agency_id,
    route_short_name: record.route_short_name,
    route_long_name: record.route_long_name,
    route_type: record.route_type,
    route_color: record.route_color,
    route_text_color: record.route_text_color,
  }))
}
