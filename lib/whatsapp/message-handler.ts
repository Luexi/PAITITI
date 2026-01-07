import { supabase } from '@/lib/supabase/client';
import {
    sendTextMessage,
    sendButtonMessage,
    sendLocationMessage,
} from './wppconnect-client';
import { format, parse, addHours, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Handle incoming WhatsApp messages with intelligent conversation flow
 */
export async function handleIncomingWhatsAppMessage(
    conversationId: number,
    phoneNumber: string,
    content: string,
    metadata: any = {}
) {
    // Detect user intent
    const intent = detectIntent(content);

    console.log(`WhatsApp message intent detected: ${intent}`);

    switch (intent) {
        case 'new_reservation':
            await handleNewReservation(conversationId, phoneNumber, content);
            break;

        case 'check_reservation':
            await handleCheckReservation(conversationId, phoneNumber, content);
            break;

        case 'cancel_reservation':
            await handleCancelReservation(conversationId, phoneNumber, content);
            break;

        case 'modify_reservation':
            await handleModifyReservation(conversationId, phoneNumber, content);
            break;

        case 'menu_inquiry':
            await handleMenuInquiry(conversationId, phoneNumber);
            break;

        case 'hours_inquiry':
            await handleHoursInquiry(conversationId, phoneNumber);
            break;

        case 'location_inquiry':
            await handleLocationInquiry(conversationId, phoneNumber);
            break;

        case 'greeting':
            await handleGreeting(conversationId, phoneNumber);
            break;

        default:
            await handleGenericInquiry(conversationId, phoneNumber, content);
            break;
    }
}

/**
 * Detect user intent from message content
 */
function detectIntent(content: string): string {
    const lowerContent = content.toLowerCase().trim();

    // Greeting
    if (
        /^(hola|buenos dias|buenas tardes|buenas noches|hi|hello)/i.test(lowerContent) &&
        lowerContent.length < 30
    ) {
        return 'greeting';
    }

    // New reservation
    if (
        /reserv(a|ar|acion|ación)|mesa|agendar|apartar|quiero (una )?mesa/i.test(lowerContent)
    ) {
        return 'new_reservation';
    }

    // Check reservation
    if (/consultar|ver (mi )?reserva|tengo una reserva|mi reserva/i.test(lowerContent)) {
        return 'check_reservation';
    }

    // Cancel reservation
    if (/cancelar|eliminar|borrar (mi )?reserva/i.test(lowerContent)) {
        return 'cancel_reservation';
    }

    // Modify reservation
    if (/cambiar|modificar|mover (mi )?reserva/i.test(lowerContent)) {
        return 'modify_reservation';
    }

    // Menu inquiry
    if (/men[uú]|platillos|comida|precios|carta/i.test(lowerContent)) {
        return 'menu_inquiry';
    }

    // Hours inquiry
    if (/horario|hora(s)?|abierto|cerrado|abren|cierran/i.test(lowerContent)) {
        return 'hours_inquiry';
    }

    // Location inquiry
    if (/ubicaci[oó]n|direcci[oó]n|d[oó]nde|como llegar|mapa/i.test(lowerContent)) {
        return 'location_inquiry';
    }

    return 'generic_inquiry';
}

/**
 * Handle greeting message
 */
async function handleGreeting(conversationId: number, phoneNumber: string) {
    const message = `¡Hola! Bienvenido a Paititi del Mar 🌊

Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?`;

    const buttons = [
        { id: 'new_reservation', title: '📅 Nueva Reserva' },
        { id: 'check_reservation', title: '🔍 Ver Reserva' },
        { id: 'menu', title: '📖 Ver Menú' },
    ];

    const messageId = await sendButtonMessage(phoneNumber, message, buttons);

    if (messageId) {
        await storeOutboundMessage(conversationId, messageId, message, 'interactive');
    }
}

/**
 * Handle new reservation request
 */
async function handleNewReservation(conversationId: number, phoneNumber: string, content: string) {
    // Try to extract reservation details from the message
    const details = extractReservationDetails(content);

    if (details.date && details.time && details.partySize) {
        // All details provided, check availability
        await checkAvailabilityAndConfirm(conversationId, phoneNumber, details);
    } else {
        // Ask for missing details
        const message = `¡Perfecto! Voy a ayudarte a hacer una reserva.

Por favor proporciona los siguientes datos:
📅 Fecha (ej: mañana, 15 de enero)
🕐 Hora (ej: 7:00 PM, 19:00)
👥 Número de personas

Ejemplo: "Quiero una mesa para 4 personas el viernes 15 a las 8 PM"`;

        const messageId = await sendTextMessage(phoneNumber, message);

        if (messageId) {
            await storeOutboundMessage(conversationId, messageId, message);
        }
    }
}

/**
 * Check availability and confirm reservation
 */
async function checkAvailabilityAndConfirm(
    conversationId: number,
    phoneNumber: string,
    details: any
) {
    // Check if date/time is available
    const dateStr = format(details.date, 'yyyy-MM-dd');
    const timeStr = format(details.date, 'HH:mm:ss');

    const { data: existingReservations } = await supabase
        .from('reservations')
        .select('*')
        .eq('venue_id', 1)
        .eq('date', dateStr)
        .gte('end_time', timeStr)
        .lte('start_time', timeStr);

    // Simple availability check (can be enhanced with table capacity)
    const isAvailable = !existingReservations || existingReservations.length < 10;

    if (isAvailable) {
        // Get customer name from conversation
        const { data: conversation } = await supabase
            .from('conversations')
            .select('customer_name')
            .eq('id', conversationId)
            .single();

        // Create reservation
        const endTime = format(addHours(details.date, 2), 'HH:mm:ss');

        const { data: newReservation, error } = await supabase
            .from('reservations')
            .insert({
                venue_id: 1,
                full_name: conversation?.customer_name || 'Cliente WhatsApp',
                phone: phoneNumber,
                party_size: details.partySize,
                date: dateStr,
                start_time: timeStr,
                end_time: endTime,
                status: 'confirmed',
                source: 'whatsapp',
            })
            .select()
            .single();

        if (!error && newReservation) {
            const confirmationMessage = `✅ ¡Reserva confirmada!

📅 Fecha: ${format(details.date, "EEEE d 'de' MMMM", { locale: es })}
🕐 Hora: ${format(details.date, 'h:mm a')}
👥 Personas: ${details.partySize}
📞 Teléfono: ${phoneNumber}

¡Te esperamos en Paititi del Mar! 🌊🦐

ID de reserva: #${newReservation.id}`;

            const messageId = await sendTextMessage(phoneNumber, confirmationMessage);

            if (messageId) {
                await storeOutboundMessage(conversationId, messageId, confirmationMessage);
            }
        } else {
            await sendTextMessage(
                phoneNumber,
                '❌ Hubo un error al crear la reserva. Por favor intenta de nuevo o llámanos.'
            );
        }
    } else {
        const message = `⚠️ Lo siento, no hay disponibilidad para ${format(
            details.date,
            "EEEE d 'de' MMMM 'a las' h:mm a",
            { locale: es }
        )}

¿Te gustaría intentar con otra hora? Nuestros horarios disponibles son:
🕐 1:00 PM - 10:00 PM (Lun-Jue)
🕐 1:00 PM - 11:00 PM (Vie-Dom)`;

        const messageId = await sendTextMessage(phoneNumber, message);

        if (messageId) {
            await storeOutboundMessage(conversationId, messageId, message);
        }
    }
}

/**
 * Handle menu inquiry
 */
async function handleMenuInquiry(conversationId: number, phoneNumber: string) {
    const message = `📖 Nuestro Menú

Especialidades Paititi:
🦐 Camarones al Coco - $385
🐟 Pescado Zarandeado - $420
🦞 Langosta Puerto Nuevo - $850
🦪 Ostiones Frescos (docena) - $280
🍤 Ceviche de Camarón - $245

Ver menú completo: https://paititidelmar.com/menu

¿Te gustaría hacer una reserva?`;

    const buttons = [
        { id: 'new_reservation', title: 'Sí, reservar' },
        { id: 'more_info', title: 'Más información' },
    ];

    const messageId = await sendButtonMessage(phoneNumber, message, buttons);

    if (messageId) {
        await storeOutboundMessage(conversationId, messageId, message, 'interactive');
    }
}

/**
 * Handle hours inquiry
 */
async function handleHoursInquiry(conversationId: number, phoneNumber: string) {
    const message = `🕐 Nuestro Horario

🗓️ Lunes a Jueves: 1:00 PM - 10:00 PM
🗓️ Viernes a Domingo: 1:00 PM - 11:00 PM

¡Te esperamos!`;

    const buttons = [{ id: 'new_reservation', title: '📅 Hacer Reserva' }];

    const messageId = await sendButtonMessage(phoneNumber, message, buttons);

    if (messageId) {
        await storeOutboundMessage(conversationId, messageId, message, 'interactive');
    }
}

/**
 * Handle location inquiry
 */
async function handleLocationInquiry(conversationId: number, phoneNumber: string) {
    // Send location
    await sendLocationMessage(
        phoneNumber,
        16.8531, // Acapulco Diamante latitude (example)
        -99.8237, // Longitude (example)
        'Paititi del Mar',
        'Av. Costera de las Palmas, Acapulco Diamante, Guerrero'
    );

    const message = `📍 Estamos ubicados en:

Av. Costera de las Palmas
Acapulco Diamante, Guerrero
¡Frente al mar! 🌊

¿Te gustaría hacer una reserva?`;

    const messageId = await sendTextMessage(phoneNumber, message);

    if (messageId) {
        await storeOutboundMessage(conversationId, messageId, message);
    }
}

/**
 * Handle generic inquiry - handoff to human
 */
async function handleGenericInquiry(conversationId: number, phoneNumber: string, content: string) {
    const message = `Gracias por tu mensaje. Un miembro de nuestro equipo te responderá pronto.

Mientras tanto, puedes:`;

    const buttons = [
        { id: 'new_reservation', title: '📅 Reservar' },
        { id: 'menu', title: '📖 Ver Menú' },
        { id: 'hours', title: '🕐 Horarios' },
    ];

    const messageId = await sendButtonMessage(phoneNumber, message, buttons);

    if (messageId) {
        await storeOutboundMessage(conversationId, messageId, message, 'interactive');
    }

    // Mark conversation for human attention
    await supabase
        .from('conversations')
        .update({ metadata: { needs_human_attention: true } })
        .eq('id', conversationId);
}

/**
 * Handle check reservation
 */
async function handleCheckReservation(conversationId: number, phoneNumber: string, content: string) {
    const { data: reservations } = await supabase
        .from('reservations')
        .select('*')
        .eq('phone', phoneNumber)
        .gte('date', format(new Date(), 'yyyy-MM-dd'))
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

    if (!reservations || reservations.length === 0) {
        await sendTextMessage(phoneNumber, 'No encontré reservas activas con este número de teléfono.');
        return;
    }

    let message = `📋 Tus Reservas:\n\n`;

    reservations.forEach((res, index) => {
        const date = parse(res.date, 'yyyy-MM-dd', new Date());
        message += `${index + 1}. ID: #${res.id}
📅 ${format(date, "EEEE d 'de' MMMM", { locale: es })}
🕐 ${res.start_time}
👥 ${res.party_size} personas
📊 Estado: ${res.status === 'confirmed' ? 'Confirmada ✅' : 'Pendiente ⏳'}\n\n`;
    });

    const messageId = await sendTextMessage(phoneNumber, message);

    if (messageId) {
        await storeOutboundMessage(conversationId, messageId, message);
    }
}

/**
 * Handle cancel reservation
 */
async function handleCancelReservation(conversationId: number, phoneNumber: string, content: string) {
    // Extract reservation ID if mentioned
    const idMatch = content.match(/#?(\d+)/);

    if (!idMatch) {
        await sendTextMessage(phoneNumber, 'Por favor indica el ID de la reserva que deseas cancelar (ej: #123)');
        return;
    }

    const reservationId = parseInt(idMatch[1]);

    const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId)
        .eq('phone', phoneNumber);

    if (!error) {
        await sendTextMessage(
            phoneNumber,
            `✅ Tu reserva #${reservationId} ha sido cancelada. Esperamos verte pronto en Paititi del Mar.`
        );
    } else {
        await sendTextMessage(phoneNumber, 'No pude encontrar esa reserva. Verifica el ID e intenta de nuevo.');
    }
}

/**
 * Handle modify reservation
 */
async function handleModifyReservation(conversationId: number, phoneNumber: string, content: string) {
    await sendTextMessage(
        phoneNumber,
        'Para modificar tu reserva, por favor llámanos al (744) 123-4567 o envía los nuevos detalles (fecha, hora, personas).'
    );
}

/**
 * Extract reservation details from natural language
 */
function extractReservationDetails(content: string): {
    date?: Date;
    time?: string;
    partySize?: number;
} {
    const details: any = {};

    // Extract party size
    const sizeMatch = content.match(/(\d+)\s*(persona|gente|comensales)/i);
    if (sizeMatch) {
        details.partySize = parseInt(sizeMatch[1]);
    }

    // Extract time
    const timeMatch = content.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|hrs)?/i);
    if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const meridiem = timeMatch[3]?.toLowerCase();

        if (meridiem === 'pm' && hours < 12) hours += 12;
        if (meridiem === 'am' && hours === 12) hours = 0;

        const now = new Date();
        details.date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    }

    // Extract date (simple patterns)
    if (/ma[ñn]ana/i.test(content)) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (details.date) {
            details.date.setFullYear(tomorrow.getFullYear());
            details.date.setMonth(tomorrow.getMonth());
            details.date.setDate(tomorrow.getDate());
        }
    } else if (/hoy/i.test(content)) {
        // Already set to today
    }

    return details;
}

/**
 * Store outbound message in database
 */
async function storeOutboundMessage(
    conversationId: number,
    externalId: string,
    content: string,
    contentType: string = 'text'
) {
    await supabase.from('messages').insert({
        conversation_id: conversationId,
        platform: 'whatsapp',
        external_id: externalId,
        direction: 'outbound',
        sender_type: 'bot',
        content_type: contentType,
        content: content,
        status: 'sent',
    });
}
