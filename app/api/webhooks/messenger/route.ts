import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { handleIncomingMessengerMessage } from '@/lib/messenger/message-handler';

const VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN || 'paititi_messenger_verify_2026';
const PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN;

/**
 * GET - Webhook Verification
 * Facebook will call this endpoint to verify the webhook
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Messenger webhook verified successfully');
        return new NextResponse(challenge, { status: 200 });
    } else {
        console.error('Messenger webhook verification failed');
        return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
    }
}

/**
 * POST - Receive Messenger Messages
 * Facebook sends incoming messages and postbacks to this endpoint
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('Messenger webhook received:', JSON.stringify(body, null, 2));

        if (body.object !== 'page') {
            return NextResponse.json({ error: 'Invalid webhook object' }, { status: 400 });
        }

        // Process each entry
        for (const entry of body.entry || []) {
            // Handle messaging events
            if (entry.messaging) {
                for (const event of entry.messaging) {
                    await processMessagingEvent(event);
                }
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error processing Messenger webhook:', error);
        return NextResponse.json({ success: false }, { status: 200 });
    }
}

/**
 * Process a messaging event from Messenger
 */
async function processMessagingEvent(event: any) {
    const senderId = event.sender.id; // PSID (Page-Scoped ID)
    const recipientId = event.recipient.id; // Page ID

    // Handle different event types
    if (event.message) {
        await handleMessage(senderId, event.message);
    } else if (event.postback) {
        await handlePostback(senderId, event.postback);
    } else if (event.delivery) {
        await handleDelivery(event.delivery);
    } else if (event.read) {
        await handleRead(event.read);
    }
}

/**
 * Handle incoming text message
 */
async function handleMessage(senderId: string, message: any) {
    const messageText = message.text || '';
    const messageId = message.mid;

    // Get or create conversation
    const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('venue_id', 1)
        .eq('platform', 'messenger')
        .eq('external_id', senderId)
        .single();

    let conversationId: number;

    if (!conversation) {
        // Get user info from Facebook
        const userInfo = await getUserInfo(senderId);

        const { data: newConversation, error } = await supabase
            .from('conversations')
            .insert({
                venue_id: 1,
                platform: 'messenger',
                external_id: senderId,
                customer_name: userInfo?.name || `Messenger User ${senderId.substring(0, 8)}`,
                metadata: { profile_pic: userInfo?.profile_pic },
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

        if (conversation.status !== 'active') {
            await supabase
                .from('conversations')
                .update({ status: 'active' })
                .eq('id', conversationId);
        }
    }

    // Store incoming message
    await supabase.from('messages').insert({
        conversation_id: conversationId,
        platform: 'messenger',
        external_id: messageId,
        direction: 'inbound',
        sender_type: 'customer',
        content_type: 'text',
        content: messageText,
        status: 'delivered',
        delivered_at: new Date().toISOString(),
    });

    // Process message with bot handler
    await handleIncomingMessengerMessage(conversationId, senderId, messageText);
}

/**
 * Handle postback (button click)
 */
async function handlePostback(senderId: string, postback: any) {
    const payload = postback.payload;
    const title = postback.title;

    // Get conversation
    const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('venue_id', 1)
        .eq('platform', 'messenger')
        .eq('external_id', senderId)
        .single();

    if (!conversation) return;

    // Store postback as a message
    await supabase.from('messages').insert({
        conversation_id: conversation.id,
        platform: 'messenger',
        direction: 'inbound',
        sender_type: 'customer',
        content_type: 'text',
        content: title,
        metadata: { postback_payload: payload },
        status: 'delivered',
        delivered_at: new Date().toISOString(),
    });

    // Handle based on payload
    await handleIncomingMessengerMessage(conversation.id, senderId, payload, { type: 'postback' });
}

/**
 * Handle delivery confirmation
 */
async function handleDelivery(delivery: any) {
    const messageIds = delivery.mids || [];

    for (const mid of messageIds) {
        await supabase
            .from('messages')
            .update({
                status: 'delivered',
                delivered_at: new Date(delivery.watermark).toISOString(),
            })
            .eq('external_id', mid)
            .eq('platform', 'messenger');
    }
}

/**
 * Handle read receipt
 */
async function handleRead(read: any) {
    const watermark = read.watermark; // Timestamp of last read message

    await supabase
        .from('messages')
        .update({
            status: 'read',
            read_at: new Date(watermark).toISOString(),
        })
        .eq('platform', 'messenger')
        .lte('created_at', new Date(watermark).toISOString());
}

/**
 * Get user info from Facebook Graph API
 */
async function getUserInfo(psid: string): Promise<any> {
    if (!PAGE_ACCESS_TOKEN) return null;

    try {
        const response = await fetch(
            `https://graph.facebook.com/v21.0/${psid}?fields=name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`
        );

        if (!response.ok) return null;

        return await response.json();
    } catch (error) {
        console.error('Error getting user info:', error);
        return null;
    }
}
