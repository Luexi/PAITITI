import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { format, parse, addMinutes, isBefore, isAfter, parseISO, startOfDay, addDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface TimeSlot {
    time: string;
    status: 'available' | 'blocked' | 'full';
    reason?: string;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const venueId = parseInt(searchParams.get('venue_id') || '1');
        const dateStr = searchParams.get('date'); // YYYY-MM-DD
        const partySize = parseInt(searchParams.get('party_size') || '2');

        if (!dateStr) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        const timezone = 'America/Mexico_City';
        const requestedDate = parseISO(dateStr);
        const now = toZonedTime(new Date(), timezone);
        const today = startOfDay(now);

        // Get settings
        const { data: settings, error: settingsError } = await supabaseAdmin
            .from('settings')
            .select('*')
            .eq('venue_id', venueId)
            .single();

        if (settingsError || !settings) {
            return NextResponse.json({ error: 'Settings not found' }, { status: 500 });
        }

        // Validate date is within allowed range
        const maxDate = addDays(today, settings.max_days_ahead);
        const minDateTime = addMinutes(now, settings.min_notice_minutes);

        if (isBefore(requestedDate, today)) {
            return NextResponse.json({ error: 'Cannot book past dates' }, { status: 400 });
        }

        if (isAfter(requestedDate, maxDate)) {
            return NextResponse.json(
                { error: `Cannot book more than ${settings.max_days_ahead} days ahead` },
                { status: 400 }
            );
        }

        // Get opening hours for the day
        const dayOfWeek = requestedDate.getDay();
        const { data: openingHours, error: hoursError } = await supabaseAdmin
            .from('opening_hours')
            .select('*')
            .eq('venue_id', venueId)
            .eq('day_of_week', dayOfWeek)
            .single();

        if (hoursError || !openingHours || openingHours.is_closed) {
            return NextResponse.json({ slots: [], message: 'Restaurant is closed on this day' });
        }

        // Generate time slots
        const slots: TimeSlot[] = [];
        const openTime = parse(openingHours.open_time, 'HH:mm:ss', requestedDate);
        const closeTime = parse(openingHours.close_time, 'HH:mm:ss', requestedDate);

        let currentSlot = openTime;
        while (isBefore(currentSlot, closeTime)) {
            const slotTime = format(currentSlot, 'HH:mm');
            const slotDateTime = parse(`${dateStr} ${slotTime}`, 'yyyy-MM-dd HH:mm', new Date());

            // Skip past slots for today
            if (format(requestedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') && isBefore(slotDateTime, minDateTime)) {
                currentSlot = addMinutes(currentSlot, settings.slot_minutes);
                continue;
            }

            // Check if slot is blocked
            const { data: blocks } = await supabaseAdmin
                .from('blocks')
                .select('*')
                .eq('venue_id', venueId)
                .lte('start_datetime', `${dateStr} ${slotTime}:00`)
                .gte('end_datetime', `${dateStr} ${slotTime}:00`);

            if (blocks && blocks.length > 0) {
                slots.push({
                    time: slotTime,
                    status: 'blocked',
                    reason: blocks[0].reason
                });
                currentSlot = addMinutes(currentSlot, settings.slot_minutes);
                continue;
            }

            // Check table availability
            const endTime = format(addMinutes(currentSlot, settings.default_reservation_duration_minutes), 'HH:mm');

            // Get all tables with sufficient capacity
            const { data: tables } = await supabaseAdmin
                .from('tables')
                .select('*')
                .eq('venue_id', venueId)
                .eq('active', true)
                .gte('capacity', partySize)
                .order('capacity', { ascending: true }); // Best fit

            if (!tables || tables.length === 0) {
                slots.push({
                    time: slotTime,
                    status: 'full',
                    reason: `No tables available for ${partySize} people`
                });
                currentSlot = addMinutes(currentSlot, settings.slot_minutes);
                continue;
            }

            // Check which tables are available (no overlapping reservations or walk-ins)
            let hasAvailableTable = false;

            for (const table of tables) {
                // Check reservations
                const { data: reservations } = await supabaseAdmin
                    .from('reservations')
                    .select('*')
                    .eq('table_id', table.id)
                    .eq('date', dateStr)
                    .in('status', ['confirmed', 'seated'])
                    .or(`and(start_time.lte.${endTime},end_time.gt.${slotTime})`);

                if (!reservations || reservations.length === 0) {
                    // Check walk-ins
                    const { data: walkins } = await supabaseAdmin
                        .from('walkins')
                        .select('*')
                        .eq('table_id', table.id)
                        .eq('status', 'active')
                        .gte('start_time', `${dateStr}T${slotTime}:00`)
                        .lte('start_time', `${dateStr}T${endTime}:00`);

                    if (!walkins || walkins.length === 0) {
                        hasAvailableTable = true;
                        break;
                    }
                }
            }

            slots.push({
                time: slotTime,
                status: hasAvailableTable ? 'available' : 'full'
            });

            currentSlot = addMinutes(currentSlot, settings.slot_minutes);
        }

        return NextResponse.json({ slots, date: dateStr });
    } catch (error) {
        console.error('Availability error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
