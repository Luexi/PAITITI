/**
 * Facebook Messenger Client
 * Handles sending messages via the Send API
 */

const MESSENGER_API_URL = 'https://graph.facebook.com/v21.0/me/messages';
const PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN;

interface SendMessageOptions {
    recipient: string; // PSID
    message: any;
}

/**
 * Send a text message
 */
export async function sendTextMessage(recipientId: string, text: string): Promise<string | null> {
    return sendMessage({
        recipient: recipientId,
        message: { text },
    });
}

/**
 * Send message with quick replies
 */
export async function sendQuickReplies(
    recipientId: string,
    text: string,
    quickReplies: Array<{ title: string; payload: string }>
): Promise<string | null> {
    return sendMessage({
        recipient: recipientId,
        message: {
            text,
            quick_replies: quickReplies.slice(0, 13).map((qr) => ({
                content_type: 'text',
                title: qr.title.substring(0, 20),
                payload: qr.payload,
            })),
        },
    });
}

/**
 * Send button template
 */
export async function sendButtonTemplate(
    recipientId: string,
    text: string,
    buttons: Array<{ type: 'postback'; title: string; payload: string }>
): Promise<string | null> {
    return sendMessage({
        recipient: recipientId,
        message: {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'button',
                    text,
                    buttons: buttons.slice(0, 3).map((btn) => ({
                        type: btn.type,
                        title: btn.title.substring(0, 20),
                        payload: btn.payload,
                    })),
                },
            },
        },
    });
}

/**
 * Send generic template (rich cards)
 */
export async function sendGenericTemplate(
    recipientId: string,
    elements: Array<{
        title: string;
        subtitle?: string;
        image_url?: string;
        buttons?: Array<{ type: string; title: string; payload?: string; url?: string }>;
    }>
): Promise<string | null> {
    return sendMessage({
        recipient: recipientId,
        message: {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'generic',
                    elements: elements.slice(0, 10),
                },
            },
        },
    });
}

/**
 * Send typing indicator
 */
export async function sendTypingIndicator(recipientId: string, on: boolean = true): Promise<boolean> {
    if (!PAGE_ACCESS_TOKEN) return false;

    try {
        const response = await fetch(MESSENGER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipient: { id: recipientId },
                sender_action: on ? 'typing_on' : 'typing_off',
                access_token: PAGE_ACCESS_TOKEN,
            }),
        });

        return response.ok;
    } catch (error) {
        console.error('Error sending typing indicator:', error);
        return false;
    }
}

/**
 * Mark message as read
 */
export async function markSeen(recipientId: string): Promise<boolean> {
    if (!PAGE_ACCESS_TOKEN) return false;

    try {
        const response = await fetch(MESSENGER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipient: { id: recipientId },
                sender_action: 'mark_seen',
                access_token: PAGE_ACCESS_TOKEN,
            }),
        });

        return response.ok;
    } catch (error) {
        console.error('Error marking as seen:', error);
        return false;
    }
}

/**
 * Set persistent menu
 */
export async function setPersistentMenu(menuItems: any[]): Promise<boolean> {
    if (!PAGE_ACCESS_TOKEN) return false;

    try {
        const response = await fetch(
            `https://graph.facebook.com/v21.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    persistent_menu: [
                        {
                            locale: 'default',
                            composer_input_disabled: false,
                            call_to_actions: menuItems,
                        },
                    ],
                }),
            }
        );

        return response.ok;
    } catch (error) {
        console.error('Error setting persistent menu:', error);
        return false;
    }
}

/**
 * Set get started button
 */
export async function setGetStartedButton(payload: string = 'GET_STARTED'): Promise<boolean> {
    if (!PAGE_ACCESS_TOKEN) return false;

    try {
        const response = await fetch(
            `https://graph.facebook.com/v21.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    get_started: { payload },
                }),
            }
        );

        return response.ok;
    } catch (error) {
        console.error('Error setting get started button:', error);
        return false;
    }
}

/**
 * Set greeting text
 */
export async function setGreeting(text: string): Promise<boolean> {
    if (!PAGE_ACCESS_TOKEN) return false;

    try {
        const response = await fetch(
            `https://graph.facebook.com/v21.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    greeting: [{ locale: 'default', text }],
                }),
            }
        );

        return response.ok;
    } catch (error) {
        console.error('Error setting greeting:', error);
        return false;
    }
}

/**
 * Core send message function
 */
async function sendMessage(options: SendMessageOptions): Promise<string | null> {
    if (!PAGE_ACCESS_TOKEN) {
        console.error('Messenger PAGE_ACCESS_TOKEN not configured');
        return null;
    }

    try {
        const response = await fetch(MESSENGER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipient: { id: options.recipient },
                message: options.message,
                access_token: PAGE_ACCESS_TOKEN,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Messenger API error:', data);
            throw new Error(data.error?.message || 'Failed to send message');
        }

        console.log('Messenger message sent:', data);
        return data.message_id || null;
    } catch (error) {
        console.error('Error sending Messenger message:', error);
        throw error;
    }
}
