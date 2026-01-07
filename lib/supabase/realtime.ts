import { useEffect, useState } from 'react';
import { supabase } from './client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Types - Export for use in components
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
    current_reservation?: {
        id: number;
        full_name: string;
        party_size: number;
        status: string;
    };
}

export interface Reservation {
    id: number;
    venue_id: number;
    full_name: string;
    phone: string;
    party_size: number;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    celebration_type?: string;
    notes?: string;
    table_id?: number;
    source: string;
    created_at: string;
}

export interface Walkin {
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

/**
 * Hook for real-time table updates
 * Subscribes to changes in the tables table
 */
export function useRealtimeTables(venueId: number = 1) {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let channel: RealtimeChannel;

        const fetchTables = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('tables')
                    .select('*')
                    .eq('venue_id', venueId)
                    .order('id');

                if (fetchError) throw fetchError;
                setTables(data || []);
                setLoading(false);
            } catch (err) {
                setError(err as Error);
                setLoading(false);
            }
        };

        const setupRealtimeSubscription = () => {
            channel = supabase
                .channel(`tables-${venueId}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'tables',
                        filter: `venue_id=eq.${venueId}`
                    },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            setTables((prev) => [...prev, payload.new as Table]);
                        } else if (payload.eventType === 'UPDATE') {
                            setTables((prev) =>
                                prev.map((table) =>
                                    table.id === payload.new.id ? (payload.new as Table) : table
                                )
                            );
                        } else if (payload.eventType === 'DELETE') {
                            setTables((prev) => prev.filter((table) => table.id !== payload.old.id));
                        }
                    }
                )
                .subscribe();
        };

        fetchTables();
        setupRealtimeSubscription();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [venueId]);

    return { tables, loading, error, setTables };
}

/**
 * Hook for real-time reservation updates
 * Subscribes to changes in the reservations table
 */
export function useRealtimeReservations(venueId: number = 1, filters?: { date?: string; status?: string }) {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let channel: RealtimeChannel;

        const fetchReservations = async () => {
            try {
                let query = supabase
                    .from('reservations')
                    .select('*')
                    .eq('venue_id', venueId);

                if (filters?.date) {
                    query = query.eq('date', filters.date);
                }
                if (filters?.status) {
                    query = query.eq('status', filters.status);
                }

                const { data, error: fetchError } = await query.order('date', { ascending: false }).order('start_time');

                if (fetchError) throw fetchError;
                setReservations(data || []);
                setLoading(false);
            } catch (err) {
                setError(err as Error);
                setLoading(false);
            }
        };

        const setupRealtimeSubscription = () => {
            channel = supabase
                .channel(`reservations-${venueId}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'reservations',
                        filter: `venue_id=eq.${venueId}`
                    },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            setReservations((prev) => [payload.new as Reservation, ...prev]);
                        } else if (payload.eventType === 'UPDATE') {
                            setReservations((prev) =>
                                prev.map((res) =>
                                    res.id === payload.new.id ? (payload.new as Reservation) : res
                                )
                            );
                        } else if (payload.eventType === 'DELETE') {
                            setReservations((prev) => prev.filter((res) => res.id !== payload.old.id));
                        }
                    }
                )
                .subscribe();
        };

        fetchReservations();
        setupRealtimeSubscription();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [venueId, filters?.date, filters?.status]);

    return { reservations, loading, error, setReservations };
}

/**
 * Hook for real-time walk-in updates
 * Subscribes to changes in the walkins table
 */
export function useRealtimeWalkins(venueId: number = 1, activeOnly: boolean = true) {
    const [walkins, setWalkins] = useState<Walkin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let channel: RealtimeChannel;

        const fetchWalkins = async () => {
            try {
                let query = supabase
                    .from('walkins')
                    .select('*')
                    .eq('venue_id', venueId);

                if (activeOnly) {
                    query = query.eq('status', 'active');
                }

                const { data, error: fetchError } = await query.order('start_time', { ascending: true });

                if (fetchError) throw fetchError;
                setWalkins(data || []);
                setLoading(false);
            } catch (err) {
                setError(err as Error);
                setLoading(false);
            }
        };

        const setupRealtimeSubscription = () => {
            channel = supabase
                .channel(`walkins-${venueId}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'walkins',
                        filter: `venue_id=eq.${venueId}`
                    },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            const newWalkin = payload.new as Walkin;
                            if (!activeOnly || newWalkin.status === 'active') {
                                setWalkins((prev) => [...prev, newWalkin]);
                            }
                        } else if (payload.eventType === 'UPDATE') {
                            const updatedWalkin = payload.new as Walkin;
                            if (activeOnly && updatedWalkin.status !== 'active') {
                                setWalkins((prev) => prev.filter((w) => w.id !== updatedWalkin.id));
                            } else {
                                setWalkins((prev) =>
                                    prev.map((w) => (w.id === updatedWalkin.id ? updatedWalkin : w))
                                );
                            }
                        } else if (payload.eventType === 'DELETE') {
                            setWalkins((prev) => prev.filter((w) => w.id !== payload.old.id));
                        }
                    }
                )
                .subscribe();
        };

        fetchWalkins();
        setupRealtimeSubscription();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [venueId, activeOnly]);

    return { walkins, loading, error, setWalkins };
}

/**
 * Get current table status based on reservations and walk-ins
 */
export function getTableStatus(
    table: Table,
    reservations: Reservation[],
    walkins: Walkin[]
): 'available' | 'reserved' | 'occupied' | 'cleaning' {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

    // Check if table has active walk-in
    const activeWalkin = walkins.find((w) => w.table_id === table.id && w.status === 'active');
    if (activeWalkin) {
        return 'occupied';
    }

    // Check if table has current reservation
    const currentReservation = reservations.find((r) => {
        if (r.table_id !== table.id) return false;
        if (r.date !== currentDate) return false;
        if (r.status !== 'confirmed' && r.status !== 'seated') return false;

        // Check if current time is within reservation window
        return r.start_time <= currentTime && r.end_time >= currentTime;
    });

    if (currentReservation) {
        return currentReservation.status === 'seated' ? 'occupied' : 'reserved';
    }

    // Check for upcoming reservation (within next 30 minutes)
    const upcomingReservation = reservations.find((r) => {
        if (r.table_id !== table.id) return false;
        if (r.date !== currentDate) return false;
        if (r.status !== 'confirmed') return false;

        const startMinutes = parseInt(r.start_time.split(':')[0]) * 60 + parseInt(r.start_time.split(':')[1]);
        const nowMinutes = parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1]);

        return startMinutes > nowMinutes && startMinutes - nowMinutes <= 30;
    });

    if (upcomingReservation) {
        return 'reserved';
    }

    return 'available';
}
