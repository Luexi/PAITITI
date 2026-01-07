import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { format, addMinutes, parse } from 'date-fns';
import { z } from 'zod';

// Validation schema
const reservationSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters').max(255),
    phone: z.string().regex(/^\+?52\s?\d{10}$/, 'Invalid Mexican phone number'),
    party_size: z.number().min(1).max(20),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    celebration_type: z.string().optional(),
    notes: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validationResult = reservationSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation error', details: validationResult.error.issues },
                { status: 400 }
            );
        }

        const data = validationResult.data;
        const venueId = 1; // Paititi del Mar

        // Get settings
        const { data: settings } = await supabaseAdmin
            .from('settings')
            .select('*')
            .eq('venue_id', venueId)
            .single();

        if (!settings) {
            return NextResponse.json({ error: 'Settings not found' }, { status: 500 });
        }

        // Validate party size
        if (data.party_size > settings.max_party_size) {
            return NextResponse.json(
                { error: `Maximum party size is ${settings.max_party_size}` },
                { status: 400 }
            );
        }

        // Calculate end time
        const startDateTime = parse(`${data.date} ${data.start_time}`, 'yyyy-MM-dd HH:mm', new Date());
        const endDateTime = addMinutes(startDateTime, settings.default_reservation_duration_minutes);
        const endTime = format(endDateTime, 'HH:mm');

        // Double-check availability (prevent race conditions)
        const response = await fetch(
            `${request.nextUrl.origin}/api/availability?venue_id=${venueId}&date=${data.date}&party_size=${data.party_size}`
        );
        const availabilityData = await response.json();
        const slot = availabilityData.slots?.find((s: any) => s.time === data.start_time);

        if (!slot || slot.status !== 'available') {
            return NextResponse.json(
                { error: 'This time slot is no longer available' },
                { status: 409 }
            );
        }

        // Find best-fit table
        const { data: tables } = await supabaseAdmin
            .from('tables')
            .select('*')
            .eq('venue_id', venueId)
            .eq('active', true)
            .gte('capacity', data.party_size)
            .order('capacity', { ascending: true });

        let assignedTableId: number | null = null;

        if (tables && tables.length > 0) {
            // Check each table for conflicts
            for (const table of tables) {
                const { data: conflicts } = await supabaseAdmin
                    .from('reservations')
                    .select('*')
                    .eq('table_id', table.id)
                    .eq('date', data.date)
                    .in('status', ['confirmed', 'seated'])
                    .or(`and(start_time.lt.${endTime},end_time.gt.${data.start_time})`);

                if (!conflicts || conflicts.length === 0) {
                    assignedTableId = table.id;
                    break;
                }
            }
        }

        // Create reservation
        const { data: reservation, error: insertError } = await supabaseAdmin
            .from('reservations')
            .insert({
                venue_id: venueId,
                full_name: data.full_name,
                phone: data.phone,
                party_size: data.party_size,
                date: data.date,
                start_time: data.start_time,
                end_time: endTime,
                status: assignedTableId ? 'confirmed' : 'pending',
                celebration_type: data.celebration_type || null,
                notes: data.notes || null,
                table_id: assignedTableId,
                source: 'web',
            })
            .select()
            .single();

        if (insertError) {
            console.error('Insert error:', insertError);
            return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
        }

        // Create audit log
        await supabaseAdmin.from('audit_log').insert({
            venue_id: venueId,
            action: 'create',
            entity: 'reservation',
            entity_id: reservation.id.toString(),
            diff_json: { created: reservation },
        });

        return NextResponse.json({
            success: true,
            reservation: {
                id: reservation.id,
                full_name: reservation.full_name,
                date: reservation.date,
                start_time: reservation.start_time,
                end_time: reservation.end_time,
                party_size: reservation.party_size,
                status: reservation.status,
                table_assigned: assignedTableId !== null,
            },
        });
    } catch (error) {
        console.error('Reservation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
