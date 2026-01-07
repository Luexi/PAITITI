'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Calendar, Users, Phone, Search, Filter } from 'lucide-react';

interface Reservation {
    id: number;
    full_name: string;
    phone: string;
    party_size: number;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    celebration_type?: string;
    notes?: string;
    table_id?: number;
    source: string;
    created_at: string;
}

export default function AdminReservasPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        fetchReservations();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filterStatus, filterDate, reservations]);

    const fetchReservations = async () => {
        const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .eq('venue_id', 1)
            .order('date', { ascending: false })
            .order('start_time', { ascending: false })
            .limit(100);

        if (data) {
            setReservations(data);
        }
        setLoading(false);
    };

    const applyFilters = () => {
        let filtered = [...reservations];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (r) =>
                    r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.phone.includes(searchTerm)
            );
        }

        // Status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter((r) => r.status === filterStatus);
        }

        // Date filter
        if (filterDate) {
            filtered = filtered.filter((r) => r.date === filterDate);
        }

        setFilteredReservations(filtered);
    };

    const updateReservationStatus = async (id: number, newStatus: string) => {
        const { error } = await supabase
            .from('reservations')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            fetchReservations();
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            confirmed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            seated: 'bg-blue-100 text-blue-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800',
            no_show: 'bg-orange-100 text-orange-800',
        };

        const labels: Record<string, string> = {
            confirmed: 'Confirmada',
            pending: 'Pendiente',
            seated: 'Sentada',
            completed: 'Completada',
            cancelled: 'Cancelada',
            no_show: 'No-Show',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-700"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-ocean-900">Reservas</h1>
                <p className="text-gray-600 mt-2">Gestión de todas las reservas</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Search className="inline mr-2" size={16} />
                            Buscar
                        </label>
                        <input
                            type="text"
                            placeholder="Nombre o teléfono..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Filter className="inline mr-2" size={16} />
                            Estado
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                        >
                            <option value="all">Todos</option>
                            <option value="confirmed">Confirmadas</option>
                            <option value="pending">Pendientes</option>
                            <option value="seated">Sentadas</option>
                            <option value="completed">Completadas</option>
                            <option value="cancelled">Canceladas</option>
                            <option value="no_show">No-Show</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Calendar className="inline mr-2" size={16} />
                            Fecha
                        </label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('all');
                                setFilterDate('');
                            }}
                            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                </div>
            </div>

            {/* Reservations Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-ocean-50 border-b border-ocean-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-ocean-900">ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-ocean-900">Nombre</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-ocean-900">Teléfono</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-ocean-900">Fecha</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-ocean-900">Hora</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-ocean-900">Personas</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-ocean-900">Estado</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-ocean-900">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredReservations.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron reservas
                                    </td>
                                </tr>
                            ) : (
                                filteredReservations.map((reservation) => (
                                    <tr key={reservation.id} className="hover:bg-ocean-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900">#{reservation.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {reservation.full_name}
                                                </span>
                                                {reservation.celebration_type && (
                                                    <span className="text-xs text-coral-600">🎉 {reservation.celebration_type}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{reservation.phone}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {format(new Date(reservation.date), 'dd/MM/yyyy')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {reservation.start_time} - {reservation.end_time}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <Users size={16} className="mr-1 text-gray-400" />
                                                {reservation.party_size}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(reservation.status)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                {reservation.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => updateReservationStatus(reservation.id, 'seated')}
                                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-semibold transition-colors"
                                                    >
                                                        Check-in
                                                    </button>
                                                )}
                                                {reservation.status === 'seated' && (
                                                    <button
                                                        onClick={() => updateReservationStatus(reservation.id, 'completed')}
                                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded font-semibold transition-colors"
                                                    >
                                                        Completar
                                                    </button>
                                                )}
                                                {['confirmed', 'pending'].includes(reservation.status) && (
                                                    <button
                                                        onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-semibold transition-colors"
                                                    >
                                                        Cancelar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
                Mostrando {filteredReservations.length} de {reservations.length} reservas
            </div>
        </div>
    );
}
