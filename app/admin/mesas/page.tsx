'use client';

import { MapPin } from 'lucide-react';

export default function AdminMesasPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-ocean-900">Mesas</h1>
                <p className="text-gray-600 mt-2">Visualización y gestión del mapa de mesas</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <MapPin size={64} className="mx-auto mb-6 text-ocean-300" />
                <h2 className="text-2xl font-display font-bold text-ocean-900 mb-4">
                    Mapa 2D de Mesas
                </h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    El editor visual de mesas con estado en tiempo real se implementará en la Fase 3.
                    Incluirá drag & drop, redimensionamiento, y visualización de ocupación en vivo.
                </p>
                <div className="inline-block px-6 py-3 bg-ocean-100 text-ocean-800 rounded-lg font-semibold">
                    Próximamente en Fase 3
                </div>
            </div>
        </div>
    );
}
