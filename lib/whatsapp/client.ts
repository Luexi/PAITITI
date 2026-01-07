/**
 * WhatsApp Business API Client
 * Handles sending messages via the Cloud API
 */

const WHATSAPP_API_VERSION = 'v21.0';
const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

interface SendMessageOptions {
    to: string; // Phone number with country code (e.g., "5217441234567")
    type: 'text' | 'template' | 'interactive';
    content: any;
}

interface TemplateOptions {
    name: string;
    language?: string;
    components?: any[];
}

/**
 * Send a text message
 */
export async function sendTextMessage(to: string, text: string): Promise<string | null> {
    return sendMessage({
        to,
        type: 'text',
        content: { body: text },
    });
}

/**
 * Send a template message (pre-approved by Meta)
 */
export async function sendTemplateMessage(
    to: string,
    templateName: string,
    parameters: Record<string, string> = {},
    language: string = 'es'
): Promise<string | null> {
    // Build components array from parameters
    const components = Object.keys(parameters).length > 0
        ? [
            {
                type: 'body',
                parameters: Object.values(parameters).map((value) => ({
                    type: 'text',
                    text: value,
                })),
            },
        ]
        : [];

    return sendMessage({
        to,
        type: 'template',
        content: {
            name: templateName,
            language: { code: language },
            components,
        },
    });
}

/**
 * Send an interactive message with buttons
 */
export async function sendButtonMessage(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>
): Promise<string | null> {
    // WhatsApp limits: max 3 buttons, titles max 20 chars
    const limitedButtons = buttons.slice(0, 3).map((btn) => ({
        type: 'reply',
        reply: {
            id: btn.id,
            title: btn.title.substring(0, 20),
        },
    }));

    return sendMessage({
        to,
        type: 'interactive',
        content: {
            type: 'button',
            body: { text: bodyText },
            action: { buttons: limitedButtons },
        },
    });
}

/**
 * Send an interactive message with a list
 */
export async function sendListMessage(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: Array<{
        title?: string;
        rows: Array<{ id: string; title: string; description?: string }>;
    }>
): Promise<string | null> {
    return sendMessage({
        to,
        type: 'interactive',
        content: {
            type: 'list',
            body: { text: bodyText },
            action: {
                button: buttonText,
                sections,
            },
        },
    });
}

/**
 * Send location message
 */
export async function sendLocationMessage(
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string
): Promise<string | null> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
        console.error('WhatsApp credentials not configured');
        return null;
    }

    try {
        const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to,
                type: 'location',
                location: {
                    latitude,
                    longitude,
                    name,
                    address,
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('WhatsApp API error:', data);
            return null;
        }

        return data.messages?.[0]?.id || null;
    } catch (error) {
        console.error('Error sending WhatsApp location:', error);
        return null;
    }
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<boolean> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
        return false;
    }

    try {
        const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                status: 'read',
                message_id: messageId,
            }),
        });

        return response.ok;
    } catch (error) {
        console.error('Error marking message as read:', error);
        return false;
    }
}

/**
 * Core send message function
 */
async function sendMessage(options: SendMessageOptions): Promise<string | null> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
        console.error('WhatsApp credentials not configured');
        return null;
    }

    try {
        const body: any = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: options.to,
            type: options.type,
        };

        // Add content based on type
        if (options.type === 'text') {
            body.text = options.content;
        } else if (options.type === 'template') {
            body.template = options.content;
        } else if (options.type === 'interactive') {
            body.interactive = options.content;
        }

        const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('WhatsApp API error:', data);
            throw new Error(data.error?.message || 'Failed to send message');
        }

        console.log('WhatsApp message sent:', data);
        return data.messages?.[0]?.id || null;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
}

/**
 * Get WhatsApp phone number display name
 */
export async function getPhoneNumberInfo(): Promise<any> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
        return null;
    }

    try {
        const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting phone number info:', error);
        return null;
    }
}
