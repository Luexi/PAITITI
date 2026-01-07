import { NextRequest, NextResponse } from 'next/server';
import {
    initializeWPPConnect,
    getConnectionStatus,
    onMessage,
} from '@/lib/whatsapp/wppconnect-client';
import { supabase } from '@/lib/supabase/client';
import { handleIncomingWhatsAppMessage } from '@/lib/whatsapp/message-handler';

// Initialize WPPConnect on first request
let isInitialized = false;

/**
 * GET - Get connection status and QR code
 */
export async function GET(request: NextRequest) {
    try {
        // Initialize if not already done
        if (!isInitialized) {
            initializeWPPConnect().catch(console.error);

            // Setup message handler
            onMessage(async (message: any) => {
                await handleWPPConnectMessage(message);
            });

            isInitialized = true;
        }

        const status = getConnectionStatus();

        return NextResponse.json(status);
    } catch (error) {
        console.error('Error getting WhatsApp status:', error);
        return NextResponse.json(
            { error: 'Failed to get status' },
            { status: 500 }
        );
    }
}

/**
 * POST - Restart connection
 */
export async function POST(request: NextRequest) {
    try {
        const { action } = await request.json();

        if (action === 'restart') {
            const { restartConnection } = await import('@/lib/whatsapp/wppconnect-client');
            await restartConnection();

            return NextResponse.json({ success: true, message: 'Connection restarted' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error handling WhatsApp action:', error);
        return NextResponse.json(
            { error: 'Failed to perform action' },
            { status: 500 }
        );
    }
}

/**
 * Handle incoming WPPConnect message
 */
async function handleWPPConnectMessage(message: any) {
    try {
        console.log('Processing WPPConnect message:', message);

        // Extract message details
        const phoneNumber = message.from.replace('@c.us', '');
        const content = message.body || message.caption || '';
        const messageId = message.id;

        // Skip if this is an outbound message (from us)
        if (message.fromMe) {
            return;
        }

        // Get or create conversation
        const { data: conversation } = await supabase
            .from('conversations')
            .select('*')
            .eq('venue_id', 1)
            .eq('platform', 'whatsapp')
            .eq('external_id', phoneNumber)
            .single();

        let conversationId: number;

        if (!conversation) {
            // Create new conversation
            const { data: newConversation, error } = await supabase
                .from('conversations')
                .insert({
                    venue_id: 1,
                    platform: 'whatsapp',
                    external_id: phoneNumber,
                    customer_name: message.sender?.pushname || phoneNumber,
                    status: 'active',
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating conversation:', error);
                return;
            }
            conversationId = newConversation.id;
        } else {
            conversationId = conversation.id;

            // Update conversation status to active if it was resolved
            if (conversation.status !== 'active') {
                await supabase
                    .from('conversations')
                    .update({ status: 'active' })
                    .eq('id', conversationId);
            }
        }

        // Determine content type
        let contentType = 'text';
        let metadata: any = {};

        if (message.type === 'image') {
            contentType = 'image';
            metadata.mimetype = message.mimetype;
        } else if (message.type === 'video') {
            contentType = 'video';
            metadata.mimetype = message.mimetype;
        } else if (message.type === 'audio' || message.type === 'ptt') {
            contentType = 'audio';
            metadata.mimetype = message.mimetype;
        } else if (message.type === 'document') {
            contentType = 'document';
            metadata.filename = message.filename;
            metadata.mimetype = message.mimetype;
        } else if (message.type === 'location') {
            contentType = 'location';
            metadata.latitude = message.lat;
            metadata.longitude = message.lng;
        }

        // Store incoming message
        const { error: messageError } = await supabase.from('messages').insert({
            conversation_id: conversationId,
            platform: 'whatsapp',
            external_id: messageId,
            direction: 'inbound',
            sender_type: 'customer',
            content_type: contentType,
            content: content,
            metadata: metadata,
            status: 'delivered',
            delivered_at: new Date(message.timestamp * 1000).toISOString(),
        });

        if (messageError) {
            console.error('Error storing message:', messageError);
            return;
        }

        // Process the message with AI/bot handler
        await handleIncomingWhatsAppMessage(conversationId, phoneNumber, content, metadata);
    } catch (error) {
        console.error('Error handling WPPConnect message:', error);
    }
}
