// Database Types for Paititi del Mar

export interface Venue {
    id: number;
    name: string;
    timezone: string;
    theme_json: ThemeConfig;
    created_at: string;
}

export interface ThemeConfig {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontDisplay: string;
    fontBody: string;
    logo?: string;
    heroImage?: string;
}

export interface OpeningHours {
    id: number;
    venue_id: number;
    day_of_week: number; // 0-6 (Sunday-Saturday)
    open_time: string; // HH:MM
    close_time: string; // HH:MM
    is_closed: boolean;
}

export interface Settings {
    id: number;
    venue_id: number;
    slot_minutes: number;
    default_reservation_duration_minutes: number;
    max_party_size: number;
    min_notice_minutes: number;
    max_days_ahead: number;
}

export interface Table {
    id: number;
    venue_id: number;
    label: string;
    capacity: number;
    active: boolean;
    x: number;
    y: number;
    w: number;
    h: number;
    shape: 'square' | 'circle' | 'rectangle';
    rotation: number;
}

export type ReservationStatus =
    | 'pending'
    | 'confirmed'
    | 'seated'
    | 'completed'
    | 'cancelled'
    | 'no_show';

export type ReservationSource =
    | 'web'
    | 'whatsapp'
    | 'messenger'
    | 'walkin';

export interface Reservation {
    id: number;
    venue_id: number;
    full_name: string;
    phone: string;
    party_size: number;
    date: string; // YYYY-MM-DD
    start_time: string; // HH:MM
    end_time: string; // HH:MM
    status: ReservationStatus;
    celebration_type?: string;
    notes?: string;
    table_id?: number;
    source: ReservationSource;
    created_at: string;
}

export interface Block {
    id: number;
    venue_id: number;
    start_datetime: string;
    end_datetime: string;
    reason: string;
    created_by?: string;
    created_at: string;
}

export interface WalkIn {
    id: number;
    venue_id: number;
    party_size: number;
    start_time: string;
    end_time?: string;
    table_id?: number;
    notes?: string;
    status: 'active' | 'completed';
    created_at: string;
}

export interface AuditLog {
    id: number;
    venue_id: number;
    actor_user_id?: string;
    action: string;
    entity: string;
    entity_id: string;
    diff_json: Record<string, any>;
    created_at: string;
}

export interface StaffProfile {
    id: number;
    user_id: string;
    venue_id: number;
    role: 'owner' | 'manager' | 'host';
    created_at: string;
}
