import { supabase } from '@/lib/supabase/client';
import {
    sendTextMessage,
    sendButtonTemplate,
    sendQuickReplies,
    sendGenericTemplate,
    sendTypingIndicator,
    markSeen,
} from './client';
import { format, parse, addHours } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Handle incoming Messenger messages
 */
export async function handleIncomingMessengerMessage(
    conversationId: number,
    senderId: string,
    content: string,
    metadata: any = {}
) {
    // Mark message as seen
    await markSeen(senderId);

    // Show typing indicator
    await sendTypingIndicator(senderId, true);

    // Handle postback payloads
    if (metadata.type === 'postback') {
        await handlePostback(conversationId, senderId, content);
        await sendTypingIndicator(senderId, false);
        return;
    }

    // Detect intent from text
    const intent = detectIntent(content);

    switch (intent) {
        case 'get_started':
        case 'greeting':
            await handleGreeting(conversationId, senderId);
            break;

        case 'new_reservation':
            await handleNewReservation(conversationId, senderId, content);
            break;

        case 'menu':
            await handleMenuInquiry(conversationId, senderId);
            break;

        case 'hours':
            await handleHoursInquiry(conversationId, senderId);
            break;

        case 'location':
            await handleLocationInquiry(conversationId, senderId);
            break;

        default:
            await handleGenericInquiry(conversationId, senderId, content);
            break;
    }

    await sendTypingIndicator(senderId, false);
}

/**
 * Handle postback (button click)
 */
async function handlePostback(conversationId: number, senderId: string, payload: string) {
    switch (payload) {
        case 'GET_STARTED':
        case 'MAIN_MENU':
            await handleGreeting(conversationId, senderId);
            break;

        case 'NEW_RESERVATION':
            await handleNewReservation(conversationId, senderId, '');
            break;

        case 'CHECK_RESERVATION':
            await handleCheckReservation(conversationId, senderId);
            break;

        case 'VIEW_MENU':
            await handleMenuInquiry(conversationId, senderId);
            break;

        case 'VIEW_HOURS':
            await handleHoursInquiry(conversationId, senderId);
            break;

        case 'VIEW_LOCATION':
            await handleLocationInquiry(conversationId, senderId);
            break;

        case 'CONTACT_HUMAN':
            await handleHandoffToHuman(conversationId, senderId);
            break;

        default:
            await handleGreeting(conversationId, senderId);
            break;
    }
}

/**
 * Send welcome message with main menu
 */
async function handleGreeting(conversationId: number, senderId: string) {
    const message = `¡Hola! 👋 Bienvenido a Paititi del Mar, tu restaurante de mariscos en Acapulco Diamante.

Soy tu asistente virtual. ¿En qué puedo ayudarte?`;

    const buttons = [
        { type: 'postback' as const, title: '📅 Nueva Reserva', payload: 'NEW_RESERVATION' },
        { type: 'postback' as const, title: '📖 Ver Menú', payload: 'VIEW_MENU' },
        { type: 'postback' as const, title: '📍 Ubicación', payload: 'VIEW_LOCATION' },
    ];

    const messageId = await sendButtonTemplate(senderId, message, buttons);

    if (messageId) {
        await storeOutboundMessage(conversationId, messageId, message, 'interactive');
    }
}

/**
 * Handle new reservation
 */
async function handleNewReservation(conversationId: number, senderId: string, content: string) {
    const message = `¡Perfecto! Voy a ayudarte a hacer una reserva 📅

Por favor selecciona cuántas personas:`;

    const quickReplies = [
        { title: '2 personas', payload: 'PARTY_SIZE_2' },
        { title: '4 personas', payload: 'PARTY_SIZE_4' },
        { title: '6 personas', payload: 'PARTY_SIZE_6' },
        { title: '8+ personas', payload: 'PARTY_SIZE_8_PLUS' },
    ];

    const messageId = await sendQuickReplies(senderId, message, quickReplies);

    if (messageId) {
        await storeOutboundMessage(conversationId, messageId, message, 'interactive');
    }
}

/**
 * Handle menu inquiry
 */
async function handleMenuInquiry(conversationId: number, senderId: string) {
    const elements = [
        {
            title: 'Camarones al Coco',
            subtitle: 'Deliciosos camarones empanizados en coco - $385',
            image_url: 'https://paititidelmar.com/images/camarones-coco.jpg',
            buttons: [
                {
                    type: 'postback',
                    title: 'Reservar Mesa',
                    payload: 'NEW_RESERVATION',
                },
            ],
        },
        {
            title: 'Pescado Zarandeado',
            subtitle: 'Pescado fresco a la parrilla estilo Nayarit - $420',
            image_url: 'https://paititidelmar.com/images/pescado-zarandeado.jpg',
            buttons: [
                {
                    type: 'postback',
                    title: 'Reservar Mesa',
                    payload: 'NEW_RESERVATION',
                },
            ],
        },
        {
            title: 'Langosta Puerto Nuevo',
            subtitle: 'Langosta fresca con frijoles y tortillas - $850',
            image_url: 'https://paititidelmar.com/images/langosta.jpg',
            buttons: [
                {
                    type: 'web_url',
                    title: 'Ver Menú Completo',
                    url: 'https://paititidelmar.com/menu',
                },
            ],
        },
    ];

    const messageId = await sendGenericTemplate(senderId, elements);

    if (messageId) {
        await storeOutboundMessage(conversationId, messageId, 'Menu cards', 'interactive');
    }
}

/**
 * Handle hours inquiry
 */
async function handleHoursInquiry(conversationId: number, senderId: string) {
    const message = `⏰ Nuestro Horario de Atención:

🗓️ Lunes a Jueves: 1:00 PM - 10:00 PM
🗓️ Viernes a Domingo: 1:00 PM - 11:00 PM

¡Te esperamos! 🌊`;

    const buttons = [
        { type: 'postback' as const, title: '📅 Hacer Reserva', payload: 'NEW_RESERVATION' },
        { type: 'postback' as const, title: '📖 Ver Menú', payload: 'VIEW_MENU' },
    ];

    const messageId = await sendButtonTemplate(senderId, message, buttons);

    if (messageId) {
        await storeOutboundMessage(conversationId, messageId, message, 'interactive');
    }
}

/**
 * Handle location inquiry
 */
async function handleLocationInquiry(conversationId: number, senderId: string) {
    const message = `📍 Nos encontramos en:

Av. Costera de las Palmas
Acapulco Diamante, Guerrero
¡Frente al mar! 🌊

Ver en Google Maps: https://maps.google.com/?q=Paititi+del+Mar+Acapulco`;

    const buttons = [
        { type: 'postback' as const, title: '📅 Reservar Mesa', payload: 'NEW_RESERVATION' },
        { type: 'postback' as const, title: '🕐 Ver Horarios', payload: 'VIEW_HOURS' },
    ];

    const messageId = await sendButtonTemplate(senderId, message, buttons);

    if (messageId) {
        await storeOutboundMessage(conversationId, messageId, message, 'interactive');
    }
}

/**
 * Handle check reservation
 */
async function handleCheckReservation(conversationId: number, senderId: string) {
    // Get phone number from conversation if available
    const { data: conversation } = await supabase
        .from('conversations')
        .select('metadata')
        .eq('id', conversationId)
        .single();

    const phone = conversation?.metadata?.phone;

    if (!phone) {
        await sendTextMessage(
            senderId,
            'Para consultar tus reservas, por favor envíame tu número de teléfono o contacta directamente al restaurante.'
        );
        return;
    }

    const { data: reservations } = await supabase
        .from('reservations')
        .select('*')
        .eq('phone', phone)
        .gte('date', format(new Date(), 'yyyy-MM-dd'))
        .order('date', { ascending: true });

    if (!reservations || reservations.length === 0) {
        await sendTextMessage(senderId, 'No encontré reservas activas con tu número de teléfono.');
        return;
    }

    let message = `📋 Tus Próximas Reservas:\n\n`;

    reservations.forEach((res) => {
        const date = parse(res.date, 'yyyy-MM-dd', new Date());
        message += `📅 ${format(date, "EEEE d 'de' MMMM", { locale: es })}\n`;
        message += `🕐 ${res.start_time}\n`;
        message += `👥 ${res.party_size} personas\n`;
        message += `ID: #${res.id}\n\n`;
    });

    await sendTextMessage(senderId, message);
}

/**
 * Handle handoff to human
 */
async function handleHandoffToHuman(conversationId: number, senderId: string) {
    await sendTextMessage(
        senderId,
        '✅ Perfecto. Un miembro de nuestro equipo te atenderá en breve. Gracias por tu paciencia.'
    );

    // Mark conversation for human attention
    await supabase
        .from('conversations')
        .update({ metadata: { needs_human_attention: true, handoff_requested: true } })
        .eq('id', conversationId);
}

/**
 * Handle generic inquiry
 */
async function handleGenericInquiry(conversationId: number, senderId: string, content: string) {
    const message = `Gracias por tu mensaje. ¿En qué puedo ayudarte?`;

    const quickReplies = [
        { title: '📅 Reservar Mesa', payload: 'NEW_RESERVATION' },
        { title: '📖 Ver Menú', payload: 'VIEW_MENU' },
        { title: '👤 Hablar con Alguien', payload: 'CONTACT_HUMAN' },
    ];

    const messageId = await sendQuickReplies(senderId, message, quickReplies);

    if (messageId) {
        await storeOutboundMessage(conversationId, messageId, message, 'interactive');
    }
}

/**
 * Detect intent from message
 */
function detectIntent(content: string): string {
    const lowerContent = content.toLowerCase().trim();

    if (/^(hola|hi|hello|comenzar|empezar)/i.test(lowerContent)) {
        return 'greeting';
    }

    if (/reserv(a|ar|acion)|mesa|agendar/i.test(lowerContent)) {
        return 'new_reservation';
    }

    if (/men[uú]|platillo|comida|carta/i.test(lowerContent)) {
        return 'menu';
    }

    if (/horario|hora(s)?|abierto/i.test(lowerContent)) {
        return 'hours';
    }

    if (/ubicaci[oó]n|direcci[oó]n|d[oó]nde/i.test(lowerContent)) {
        return 'location';
    }

    return 'generic';
}

/**
 * Store outbound message
 */
async function storeOutboundMessage(
    conversationId: number,
    externalId: string,
    content: string,
    contentType: string = 'text'
) {
    await supabase.from('messages').insert({
        conversation_id: conversationId,
        platform: 'messenger',
        external_id: externalId,
        direction: 'outbound',
        sender_type: 'bot',
        content_type: contentType,
        content: content,
        status: 'sent',
    });
}

/**
 * Initialize Messenger bot profile (call once during setup)
 */
export async function initializeMessengerProfile() {
    const { setGetStartedButton, setGreeting, setPersistentMenu } = await import('./client');

    // Set get started button
    await setGetStartedButton('GET_STARTED');

    // Set greeting text
    await setGreeting('¡Bienvenido a Paititi del Mar! 🌊 Haz clic en Comenzar para empezar.');

    // Set persistent menu
    await setPersistentMenu([
        {
            type: 'postback',
            title: '📅 Nueva Reserva',
            payload: 'NEW_RESERVATION',
        },
        {
            type: 'postback',
            title: '📋 Ver Reservas',
            payload: 'CHECK_RESERVATION',
        },
        {
            type: 'postback',
            title: '📖 Ver Menú',
            payload: 'VIEW_MENU',
        },
        {
            type: 'postback',
            title: '📍 Ubicación',
            payload: 'VIEW_LOCATION',
        },
        {
            type: 'postback',
            title: '👤 Hablar con Alguien',
            payload: 'CONTACT_HUMAN',
        },
    ]);

    console.log('Messenger profile initialized successfully');
}
