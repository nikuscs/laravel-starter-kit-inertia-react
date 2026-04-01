export type AircraftStatus = 'active' | 'maintenance' | 'storage' | 'retired';

export type Aircraft = {
    id: string;
    name: string;
    model: string;
    manufacturer: string;
    location: string | null;
    status: AircraftStatus;
    notes: string | null;
    purchased_at: string | null;
    last_flight_at: string | null;
    last_maintenance_at: string | null;
    created_at: string;
    updated_at: string;
};

export type PaginatedAircraft = {
    current_page: number;
    data: Aircraft[];
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};
