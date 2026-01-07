'use client';

import { type Walkin, type Table } from '@/lib/supabase/realtime';
import { Users, Clock, MapPin, CheckCircle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface WalkinCardProps {
    walkin: Walkin;
    availableTables: Table[];
    onAssignTable: (walkinId: number, tableId: number | null) => void;
    onComplete: (walkinId: number) => void;
    onCancel: (walkinId: number) => void;
}

export default function WalkinCard({
    walkin,
    availableTables,
    onAssignTable,
    onComplete,
    onCancel,
}: WalkinCardProps) {
    const waitTime = formatDistanceToNow(new Date(walkin.start_time), { addSuffix: true, locale: es });
    const waitMinutes = Math.round((new Date().getTime() - new Date(walkin.start_time).getTime()) / 1000 / 60);

    // Determine priority color based on wait time
    const getPriorityColor = () => {
        if (waitMinutes < 15) return 'border-green-500';
        if (waitMinutes < 30) return 'border-yellow-500';
        return 'border-red-500';
    };

    const getPriorityBadge = () => {
        if (waitMinutes < 15) return { color: 'bg-green-100 text-green-800', text: 'Normal' };
        if (waitMinutes < 30) return { color: 'bg-yellow-100 text-yellow-800', text: 'Atención' };
        return { color: 'bg-red-100 text-red-800', text: '¡Urgente!' };
    };

    const priority = getPriorityBadge();

    // Parse notes to extract name and phone
    const parseNotes = (notes: string | null | undefined) => {
        if (!notes) return { name: '', phone: '', otherNotes: '' };
        const parts = notes.split(' - ');

        let name = '';
        let phone = '';
        let otherNotes = '';

        if (parts.length >= 3) {
            name = parts[0];
            phone = parts[1];
            otherNotes = parts.slice(2).join(' - ');
        } else if (parts.length === 2) {
            name = parts[0];
            otherNotes = parts[1];
        } else {
            otherNotes = notes;
        }

        return { name, phone, otherNotes };
    };

    const { name, phone, otherNotes } = parseNotes(walkin.notes);

    return (
        <div className={`bg-white border-l-4 ${getPriorityColor()} rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow`}>
            <div className="flex items-start justify-between">
                {/* Left Side - Info */}
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                            <Users size={20} className="text-ocean-700" />
                            <span className="text-lg font-bold text-ocean-900">{walkin.party_size} personas</span>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priority.color}`}>
                            {priority.text}
                        </span>

                        {walkin.table_id && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold flex items-center">
                                <MapPin size={14} className="mr-1" />
                                Mesa asignada
                            </span>
                        )}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                        {name && (
                            <div className="flex items-center">
                                <span className="font-semibold mr-2">Nombre:</span>
                                {name}
                            </div>
                        )}
                        {phone && (
                            <div className="flex items-center">
                                <span className="font-semibold mr-2">Teléfono:</span>
                                <a href={`tel:${phone}`} className="text-ocean-600 hover:underline">
                                    {phone}
                                </a>
                            </div>
                        )}
                        <div className="flex items-center">
                            <Clock size={14} className="mr-2 text-gray-400" />
                            <span>Esperando {waitTime} ({waitMinutes} min)</span>
                        </div>
                        {otherNotes && (
                            <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                                <span className="font-semibold">Notas:</span> {otherNotes}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side - Actions */}
                <div className="ml-4 flex flex-col space-y-2">
                    {/* Table Assignment */}
                    {!walkin.table_id ? (
                        <select
                            onChange={(e) => onAssignTable(walkin.id, parseInt(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none"
                            defaultValue=""
                        >
                            <option value="" disabled>
                                Asignar Mesa
                            </option>
                            {availableTables
                                .filter((t) => t.capacity >= walkin.party_size)
                                .map((table) => (
                                    <option key={table.id} value={table.id}>
                                        {table.label} ({table.capacity}p)
                                    </option>
                                ))}
                        </select>
                    ) : (
                        <button
                            onClick={() => onAssignTable(walkin.id, null)}
                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
                        >
                            Liberar Mesa
                        </button>
                    )}

                    {/* Complete Button */}
                    {walkin.table_id && (
                        <button
                            onClick={() => onComplete(walkin.id)}
                            className="flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                            <CheckCircle size={16} className="mr-1" />
                            Completar
                        </button>
                    )}

                    {/* Cancel Button */}
                    <button
                        onClick={() => onCancel(walkin.id)}
                        className="flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                        <X size={16} className="mr-1" />
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
