/**
 * WPPConnect Client - Open Source WhatsApp Integration
 * Replaces Meta's official API with free alternative
 */

import * as wppconnect from '@wppconnect-team/wppconnect';

// Singleton instance
let client: wppconnect.Whatsapp | null = null;
let isInitializing = false;
let qrCodeData: string | null = null;
let connectionStatus: 'disconnected' | 'connecting' | 'qr' | 'connected' = 'disconnected';
let statusMessage: string = 'Not initialized';

// Event listeners
const eventListeners: {
    onQRCode?: (qr: string) => void;
    onMessage?: (message: any) => void;
    onStatusChange?: (status: string) => void;
} = {};

/**
 * Initialize WPPConnect client
 */
export async function initializeWPPConnect(): Promise<void> {
    if (client) {
        console.log('WPPConnect already initialized');
        return;
    }

    if (isInitializing) {
        console.log('WPPConnect initialization in progress');
        return;
    }

    isInitializing = true;
    connectionStatus = 'connecting';
    statusMessage = 'Initializing WhatsApp connection...';

    try {
        console.log('Starting WPPConnect client...');

        client = await wppconnect.create({
            session: 'paititi-whatsapp',
            catchQR: (base64Qr, asciiQR, attempts, urlCode) => {
                console.log('QR Code received, attempt:', attempts);
                qrCodeData = base64Qr;
                connectionStatus = 'qr';
                statusMessage = `Scan QR code to connect (Attempt ${attempts}/5)`;

                // Emit QR code event
                if (eventListeners.onQRCode) {
                    eventListeners.onQRCode(base64Qr);
                }
            },
            statusFind: (statusSession, session) => {
                console.log('Status:', statusSession);
                statusMessage = `Session status: ${statusSession}`;

                if (eventListeners.onStatusChange) {
                    eventListeners.onStatusChange(statusSession);
                }

                if (statusSession === 'qrReadSuccess') {
                    connectionStatus = 'connected';
                    statusMessage = 'Connected successfully!';
                    qrCodeData = null;
                } else if (statusSession === 'qrReadFail') {
                    connectionStatus = 'disconnected';
                    statusMessage = 'QR scan failed. Please try again.';
                }
            },
            headless: true, // Run in headless mode (no browser window)
            devtools: false,
            useChrome: true,
            debug: false,
            logQR: true,
            browserArgs: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
            ],
            autoClose: 60000, // Auto close browser after 60 seconds of inactivity
            disableWelcome: true,
        });

        console.log('WPPConnect client created successfully');
        connectionStatus = 'connected';
        statusMessage = 'Connected and ready to send/receive messages';

        // Setup message listener
        client.onMessage(async (message) => {
            console.log('Message received:', message);

            if (eventListeners.onMessage) {
                eventListeners.onMessage(message);
            }
        });

        // Setup disconnect listener
        client.onStateChange((state) => {
            console.log('State changed:', state);
            if (state === 'CONFLICT' || state === 'UNPAIRED') {
                connectionStatus = 'disconnected';
                statusMessage = 'Disconnected from WhatsApp';
                client = null;
            }
        });

    } catch (error) {
        console.error('Error initializing WPPConnect:', error);
        connectionStatus = 'disconnected';
        statusMessage = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        client = null;
    } finally {
        isInitializing = false;
    }
}

/**
 * Get current connection status
 */
export function getConnectionStatus() {
    return {
        status: connectionStatus,
        message: statusMessage,
        qrCode: qrCodeData,
        isConnected: connectionStatus === 'connected' && client !== null,
    };
}

/**
 * Send text message
 */
export async function sendTextMessage(to: string, text: string): Promise<string | null> {
    if (!client) {
        throw new Error('WhatsApp client not initialized. Call initializeWPPConnect() first.');
    }

    try {
        // Format phone number (add @c.us if not present)
        const chatId = to.includes('@') ? to : `${to}@c.us`;

        const result = await client.sendText(chatId, text);
        console.log('Message sent successfully:', result);

        return result.id || null;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

/**
 * Send message with buttons
 */
export async function sendButtonMessage(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>
): Promise<string | null> {
    if (!client) {
        throw new Error('WhatsApp client not initialized');
    }

    try {
        const chatId = to.includes('@') ? to : `${to}@c.us`;

        // WPPConnect uses different format for buttons
        const formattedButtons = buttons.slice(0, 3).map((btn) => ({
            buttonText: { displayText: btn.title.substring(0, 20) },
            buttonId: btn.id,
            type: 1,
        }));

        const result = await client.sendMessageOptions(chatId, bodyText, {
            useTemplateButtons: true,
            buttons: formattedButtons,
        });

        return result.id || null;
    } catch (error) {
        console.error('Error sending button message:', error);
        throw error;
    }
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
    if (!client) {
        throw new Error('WhatsApp client not initialized');
    }

    try {
        const chatId = to.includes('@') ? to : `${to}@c.us`;

        const result = await client.sendLocation(chatId, latitude, longitude, name || address || 'Location');

        return result.id || null;
    } catch (error) {
        console.error('Error sending location:', error);
        throw error;
    }
}

/**
 * Send image message
 */
export async function sendImageMessage(
    to: string,
    imageUrl: string,
    caption?: string
): Promise<string | null> {
    if (!client) {
        throw new Error('WhatsApp client not initialized');
    }

    try {
        const chatId = to.includes('@') ? to : `${to}@c.us`;

        const result = await client.sendImageFromBase64(chatId, imageUrl, 'image.jpg', caption);

        return result.id || null;
    } catch (error) {
        console.error('Error sending image:', error);
        throw error;
    }
}

/**
 * Get chat messages
 */
export async function getChatMessages(chatId: string) {
    if (!client) {
        throw new Error('WhatsApp client not initialized');
    }

    try {
        const formattedChatId = chatId.includes('@') ? chatId : `${chatId}@c.us`;
        return await client.getAllMessagesInChat(formattedChatId, true, false);
    } catch (error) {
        console.error('Error getting messages:', error);
        throw error;
    }
}

/**
 * Check if number is registered on WhatsApp
 */
export async function checkNumberStatus(phone: string): Promise<boolean> {
    if (!client) {
        throw new Error('WhatsApp client not initialized');
    }

    try {
        const result = await client.checkNumberStatus(`${phone}@c.us`);
        return result.numberExists;
    } catch (error) {
        console.error('Error checking number:', error);
        return false;
    }
}

/**
 * Register event listeners
 */
export function onQRCode(callback: (qr: string) => void) {
    eventListeners.onQRCode = callback;
}

export function onMessage(callback: (message: any) => void) {
    eventListeners.onMessage = callback;
}

export function onStatusChange(callback: (status: string) => void) {
    eventListeners.onStatusChange = callback;
}

/**
 * Close connection
 */
export async function closeConnection(): Promise<void> {
    if (client) {
        try {
            await client.close();
            client = null;
            connectionStatus = 'disconnected';
            statusMessage = 'Connection closed';
            qrCodeData = null;
        } catch (error) {
            console.error('Error closing connection:', error);
        }
    }
}

/**
 * Restart connection
 */
export async function restartConnection(): Promise<void> {
    await closeConnection();
    await initializeWPPConnect();
}

/**
 * Get client instance (for advanced usage)
 */
export function getClient(): wppconnect.Whatsapp | null {
    return client;
}
