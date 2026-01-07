import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { handleIncomingWhatsAppMessage } from '@/lib/whatsapp/message-handler';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'paititi_webhook_verify_2026';

/**
 * GET - Webhook Verification
 * Meta will call this endpoint to verify the webhook
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // Verify the webhook
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WhatsApp webhook verified successfully');
        return new NextResponse(challenge, { status: 200 });
    } else {
        console.error('WhatsApp webhook verification failed');
        return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
    }
}

/**
 * POST - Receive WhatsApp Messages
 * Meta sends incoming messages to this endpoint
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Log incoming webhook for debugging
        console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

        // Verify this is a WhatsApp webhook
        if (body.object !== 'whatsapp_business_account') {
            return NextResponse.json({ error: 'Invalid webhook object' }, { status: 400 });
        }

        // Process each entry (usually just one)
        for (const entry of body.entry || []) {
            for (const change of entry.changes || []) {
                const value = change.value;

                // Handle incoming messages
                if (value?.messages && value.messages.length > 0) {
                    for (const message of value.messages) {
                        await processIncomingMessage(message, value);
                    }
                }

                // Handle message status updates (sent, delivered, read)
                if (value?.statuses && value.statuses.length > 0) {
                    for (const status of value.statuses) {
                        await processMessageStatus(status);
                    }
                }
            }
        }

        // Always return 200 to acknowledge receipt
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error processing WhatsApp webhook:', error);
        // Still return 200 to prevent Meta from retrying
        return NextResponse.json({ success: false }, { status: 200 });
    }
}

/**
 * Process an incoming WhatsApp message
 */
async function processIncomingMessage(message: any, value: any) {
    const phoneNumber = message.from; // Customer's phone number
    const messageId = message.id;
    const timestamp = message.timestamp;

    let content = '';
    let contentType = 'text';
    let metadata: any = {};

    // Extract message content based on type
    if (message.type === 'text') {
        content = message.text?.body || '';
    } else if (message.type === 'button') {
        content = message.button?.text || '';
        metadata.button_payload = message.button?.payload;
    } else if (message.type === 'interactive') {
        if (message.interactive?.type === 'button_reply') {
            content = message.interactive.button_reply.title;
            metadata.button_id = message.interactive.button_reply.id;
        } else if (message.interactive?.type === 'list_reply') {
            content = message.interactive.list_reply.title;
            metadata.list_id = message.interactive.list_reply.id;
        }
    } else if (message.type === 'location') {
        contentType = 'location';
        content = 'Location shared';
        metadata = {
            latitude: message.location?.latitude,
            longitude: message.location?.longitude,
            name: message.location?.name,
            address: message.location?.address,
        };
    } else if (message.type === 'image' || message.type === 'document') {
        contentType = message.type;
        content = message[message.type]?.caption || 'Attachment';
        metadata = {
            media_id: message[message.type]?.id,
            mime_type: message[message.type]?.mime_type,
        };
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
                customer_name: value.contacts?.[0]?.profile?.name || phoneNumber,
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
        delivered_at: new Date(parseInt(timestamp) * 1000).toISOString(),
    });

    if (messageError) {
        console.error('Error storing message:', messageError);
        return;
    }

    // Process the message with AI/bot handler
    await handleIncomingWhatsAppMessage(conversationId, phoneNumber, content, metadata);
}

/**
 * Process WhatsApp message status updates
 */
async function processMessageStatus(status: any) {
    const messageId = status.id;
    const newStatus = status.status; // sent, delivered, read, failed

    const statusMap: Record<string, string> = {
        sent: 'sent',
        delivered: 'delivered',
        read: 'read',
        failed: 'failed',
    };

    const updates: any = {
        status: statusMap[newStatus] || newStatus,
    };

    if (newStatus === 'delivered') {
        updates.delivered_at = new Date().toISOString();
    } else if (newStatus === 'read') {
        updates.read_at = new Date().toISOString();
    } else if (newStatus === 'failed') {
        updates.error_message = status.errors?.[0]?.title || 'Message failed';
    }

    await supabase.from('messages').update(updates).eq('external_id', messageId).eq('platform', 'whatsapp');
}
