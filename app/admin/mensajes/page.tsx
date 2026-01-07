'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { MessageSquare, Phone, Send, Clock, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Conversation {
    id: number;
    platform: 'whatsapp' | 'messenger';
    external_id: string;
    customer_name: string;
    status: string;
    last_message_at: string;
    unread_count: number;
    last_message?: {
        content: string;
        direction: string;
    };
}

interface Message {
    id: number;
    direction: 'inbound' | 'outbound';
    sender_type: string;
    content: string;
    created_at: string;
    status: string;
    delivered_at?: string;
    read_at?: string;
}

export default function AdminMessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [filter, setFilter] = useState<'all' | 'whatsapp' | 'messenger' | 'unread'>('all');

    useEffect(() => {
        loadConversations();

        // Subscribe to real-time updates
        const conversationsChannel = supabase
            .channel('conversations-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
                loadConversations();
            })
            .subscribe();

        return () => {
            conversationsChannel.unsubscribe();
        };
    }, [filter]);

    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.id);

            // Mark as read
            markConversationAsRead(selectedConversation.id);

            // Subscribe to new messages
            const messagesChannel = supabase
                .channel(`messages-${selectedConversation.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                        filter: `conversation_id=eq.${selectedConversation.id}`,
                    },
                    (payload) => {
                        setMessages((prev) => [...prev, payload.new as Message]);
                    }
                )
                .subscribe();

            return () => {
                messagesChannel.unsubscribe();
            };
        }
    }, [selectedConversation]);

    const loadConversations = async () => {
        let query = supabase
            .from('conversations')
            .select(`
                *,
                last_message:messages(content, direction)
            `)
            .eq('venue_id', 1)
            .order('last_message_at', { ascending: false });

        if (filter === 'whatsapp') {
            query = query.eq('platform', 'whatsapp');
        } else if (filter === 'messenger') {
            query = query.eq('platform', 'messenger');
        } else if (filter === 'unread') {
            query = query.gt('unread_count', 0);
        }

        const { data, error } = await query;

        if (!error && data) {
            setConversations(data as any);
        }

        setLoading(false);
    };

    const loadMessages = async (conversationId: number) => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (data) {
            setMessages(data);
        }
    };

    const markConversationAsRead = async (conversationId: number) => {
        await supabase
            .from('conversations')
            .update({ unread_count: 0 })
            .eq('id', conversationId);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !selectedConversation) return;

        setSending(true);

        try {
            // Send via appropriate platform API
            const endpoint =
                selectedConversation.platform === 'whatsapp'
                    ? '/api/messaging/whatsapp/send'
                    : '/api/messaging/messenger/send';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: selectedConversation.external_id,
                    message: newMessage,
                }),
            });

            if (response.ok) {
                setNewMessage('');
            } else {
                alert('Error al enviar mensaje');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error al enviar mensaje');
        } finally {
            setSending(false);
        }
    };

    const getPlatformIcon = (platform: string) => {
        return platform === 'whatsapp' ? '💬' : '⚡';
    };

    const getMessageStatusIcon = (message: Message) => {
        if (message.direction === 'inbound') return null;

        if (message.read_at) {
            return <CheckCheck size={14} className="text-blue-600" />;
        } else if (message.delivered_at) {
            return <CheckCheck size={14} className="text-gray-400" />;
        } else if (message.status === 'sent') {
            return <Check size={14} className="text-gray-400" />;
        }

        return <Clock size={14} className="text-gray-400" />;
    };

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4">
                <h1 className="text-2xl font-display font-bold text-ocean-900">Mensajes</h1>
                <p className="text-gray-600 text-sm">WhatsApp y Messenger unificados</p>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Conversations Sidebar */}
                <div className="w-80 bg-white border-r flex flex-col">
                    {/* Filter */}
                    <div className="p-4 border-b">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${filter === 'all'
                                        ? 'bg-ocean-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFilter('whatsapp')}
                                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${filter === 'whatsapp'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                💬 WhatsApp
                            </button>
                            <button
                                onClick={() => setFilter('messenger')}
                                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${filter === 'messenger'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                ⚡ Messenger
                            </button>
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedConversation(conv)}
                                className={`p-4 border-b cursor-pointer hover:bg-ocean-50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-ocean-100' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <div className="flex items-center">
                                        <span className="mr-2">{getPlatformIcon(conv.platform)}</span>
                                        <span className="font-semibold text-gray-900">
                                            {conv.customer_name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(conv.last_message_at), {
                                            addSuffix: true,
                                            locale: es,
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600 truncate max-w-[200px]">
                                        {conv.last_message?.content || 'Nueva conversación'}
                                    </p>
                                    {conv.unread_count > 0 && (
                                        <span className="bg-ocean-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {conv.unread_count}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {conversations.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-500">
                                <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>No hay conversaciones</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 flex flex-col bg-gray-50">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center">
                                        <span className="mr-2">
                                            {getPlatformIcon(selectedConversation.platform)}
                                        </span>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            {selectedConversation.customer_name}
                                        </h2>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {selectedConversation.platform === 'whatsapp'
                                            ? selectedConversation.external_id
                                            : 'Messenger'}
                                    </p>
                                </div>

                                <button
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
                                >
                                    Ver Detalles
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.direction === 'inbound'
                                                ? 'justify-start'
                                                : 'justify-end'
                                            }`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.direction === 'inbound'
                                                    ? 'bg-white text-gray-900'
                                                    : 'bg-ocean-600 text-white'
                                                }`}
                                        >
                                            <p className="text-sm">{message.content}</p>
                                            <div
                                                className={`flex items-center justify-end mt-1 space-x-1 text-xs ${message.direction === 'inbound'
                                                        ? 'text-gray-500'
                                                        : 'text-ocean-100'
                                                    }`}
                                            >
                                                <span>
                                                    {formatDistanceToNow(new Date(message.created_at), {
                                                        addSuffix: true,
                                                        locale: es,
                                                    })}
                                                </span>
                                                {getMessageStatusIcon(message)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Message Input */}
                            <div className="bg-white border-t px-6 py-4">
                                <form onSubmit={handleSendMessage} className="flex space-x-4">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Escribe un mensaje..."
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || !newMessage.trim()}
                                        className="px-6 py-2 bg-ocean-600 hover:bg-ocean-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center"
                                    >
                                        <Send size={18} className="mr-2" />
                                        Enviar
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
                                <p>Selecciona una conversación para comenzar</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
