'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, RefreshCw, CheckCircle, XCircle, QrCode } from 'lucide-react';

interface ConnectionStatus {
    status: 'disconnected' | 'connecting' | 'qr' | 'connected';
    message: string;
    qrCode: string | null;
    isConnected: boolean;
}

export default function WhatsAppConnectionPage() {
    const [status, setStatus] = useState<ConnectionStatus>({
        status: 'disconnected',
        message: 'Checking connection...',
        qrCode: null,
        isConnected: false,
    });
    const [loading, setLoading] = useState(true);
    const [restarting, setRestarting] = useState(false);

    // Fetch connection status
    const fetchStatus = async () => {
        try {
            const response = await fetch('/api/whatsapp/init');
            const data = await response.json();
            setStatus(data);
        } catch (error) {
            console.error('Error fetching status:', error);
            setStatus({
                status: 'disconnected',
                message: 'Error connecting to WhatsApp service',
                qrCode: null,
                isConnected: false,
            });
        } finally {
            setLoading(false);
        }
    };

    // Restart connection
    const handleRestart = async () => {
        setRestarting(true);
        try {
            await fetch('/api/whatsapp/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'restart' }),
            });
            await fetchStatus();
        } catch (error) {
            console.error('Error restarting:', error);
        } finally {
            setRestarting(false);
        }
    };

    // Auto-refresh status every 5 seconds
    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = () => {
        switch (status.status) {
            case 'connected':
                return <CheckCircle className="text-green-500" size={48} />;
            case 'qr':
                return <QrCode className="text-blue-500" size={48} />;
            case 'connecting':
                return <RefreshCw className="text-yellow-500 animate-spin" size={48} />;
            default:
                return <XCircle className="text-red-500" size={48} />;
        }
    };

    const getStatusColor = () => {
        switch (status.status) {
            case 'connected':
                return 'bg-green-100 border-green-500 text-green-900';
            case 'qr':
                return 'bg-blue-100 border-blue-500 text-blue-900';
            case 'connecting':
                return 'bg-yellow-100 border-yellow-500 text-yellow-900';
            default:
                return 'bg-red-100 border-red-500 text-red-900';
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center mb-2">
                    <MessageCircle className="mr-3 text-green-600" size={32} />
                    <h1 className="text-3xl font-display font-bold text-ocean-900">
                        Conexión WhatsApp
                    </h1>
                </div>
                <p className="text-gray-600 mt-2">
                    Configuración de WPPConnect - Conexión gratuita de código abierto
                </p>
            </div>

            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-ocean-900">Estado de Conexión</h2>
                    <button
                        onClick={handleRestart}
                        disabled={restarting}
                        className="flex items-center px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={`mr-2 ${restarting ? 'animate-spin' : ''}`} />
                        {restarting ? 'Reiniciando...' : 'Reiniciar'}
                    </button>
                </div>

                {/* Status Display */}
                <div className={`border-2 rounded-lg p-6 mb-6 ${getStatusColor()}`}>
                    <div className="flex items-center mb-4">
                        {getStatusIcon()}
                        <div className="ml-4">
                            <h3 className="text-xl font-bold capitalize">{status.status}</h3>
                            <p className="text-sm mt-1">{status.message}</p>
                        </div>
                    </div>
                </div>

                {/* QR Code Display */}
                {status.qrCode && (
                    <div className="border-2 border-blue-300 rounded-lg p-6 bg-blue-50">
                        <h3 className="text-lg font-bold text-blue-900 mb-4 text-center">
                            Escanea este código QR con WhatsApp
                        </h3>
                        <div className="flex justify-center mb-4">
                            <img
                                src={status.qrCode}
                                alt="WhatsApp QR Code"
                                className="border-4 border-white shadow-lg rounded-lg"
                                style={{ width: '300px', height: '300px' }}
                            />
                        </div>
                        <div className="bg-white rounded-lg p-4">
                            <h4 className="font-bold text-blue-900 mb-2">Pasos para conectar:</h4>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                                <li>Abre WhatsApp en tu teléfono</li>
                                <li>Ve a <strong>Configuración</strong> → <strong>Dispositivos vinculados</strong></li>
                                <li>Toca <strong>Vincular un dispositivo</strong></li>
                                <li>Escanea este código QR</li>
                            </ol>
                        </div>
                    </div>
                )}

                {/* Connected Info */}
                {status.isConnected && (
                    <div className="border-2 border-green-300 rounded-lg p-6 bg-green-50">
                        <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center">
                            <CheckCircle className="mr-2" size={24} />
                            ¡WhatsApp Conectado!
                        </h3>
                        <p className="text-sm text-green-800 mb-4">
                            Tu aplicación está conectada y lista para enviar y recibir mensajes de WhatsApp.
                        </p>
                        <div className="bg-white rounded-lg p-4">
                            <h4 className="font-bold text-green-900 mb-2">Funciones disponibles:</h4>
                            <ul className="space-y-1 text-sm text-gray-700">
                                <li>✅ Envío de mensajes de texto</li>
                                <li>✅ Mensajes con botones interactivos</li>
                                <li>✅ Compartir ubicación</li>
                                <li>✅ Recepción de mensajes en tiempo real</li>
                                <li>✅ Gestión automática de reservas</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-ocean-50 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-ocean-900 mb-3">
                    Acerca de WPPConnect
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                    <p>
                        <strong>WPPConnect</strong> es una solución de código abierto que permite automatizar
                        WhatsApp sin costos de API.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-white rounded-lg p-4">
                            <h4 className="font-bold text-green-700 mb-2">✅ Ventajas</h4>
                            <ul className="space-y-1 text-xs">
                                <li>• 100% gratuito</li>
                                <li>• Sin límites de mensajes</li>
                                <li>• Código abierto</li>
                                <li>• Todas las funciones de WhatsApp</li>
                            </ul>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                            <h4 className="font-bold text-orange-700 mb-2">⚠️ Consideraciones</h4>
                            <ul className="space-y-1 text-xs">
                                <li>• No es API oficial de Meta</li>
                                <li>• Requiere mantenimiento ocasional</li>
                                <li>• Usa WhatsApp Web</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
