'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { format, isToday, parseISO, addHours, isBefore, isAfter } from 'date-fns';
import { Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DashboardStats {
    totalToday: number;
    confirmed: number;
    pending: number;
    seated: number;
    completed: number;
    cancelled: number;
    noShow: number;
}

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
    table_id?: number;
    created_at: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalToday: 0,
        confirmed: 0,
        pending: 0,
        seated: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0,
    });
    const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();

        // Refresh every 30 seconds
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        const today = format(new Date(), 'yyyy-MM-dd');

        // Get today's reservations
        const { data: todayReservations } = await supabase
            .from('reservations')
            .select('*')
            .eq('venue_id', 1)
            .eq('date', today)
            .order('start_time', { ascending: true });

        if (todayReservations) {
            setStats({
                totalToday: todayReservations.length,
                confirmed: todayReservations.filter((r) => r.status === 'confirmed').length,
                pending: todayReservations.filter((r) => r.status === 'pending').length,
                seated: todayReservations.filter((r) => r.status === 'seated').length,
                completed: todayReservations.filter((r) => r.status === 'completed').length,
                cancelled: todayReservations.filter((r) => r.status === 'cancelled').length,
                noShow: todayReservations.filter((r) => r.status === 'no_show').length,
            });

            // Get upcoming reservations (next 4 hours)
            const now = new Date();
            const fourHoursLater = addHours(now, 4);

            const upcoming = todayReservations.filter((r) => {
                const resTime = parseISO(`${r.date}T${r.start_time}`);
                return isAfter(resTime, now) && isBefore(resTime, fourHoursLater) &&
                    ['confirmed', 'pending'].includes(r.status);
            });

            setUpcomingReservations(upcoming);
        }

        setLoading(false);
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
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
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
                <h1 className="text-3xl font-display font-bold text-ocean-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Resumen de reservas - {format(new Date(), 'dd/MM/yyyy')}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Hoy</p>
                            <p className="text-3xl font-bold text-ocean-900">{stats.totalToday}</p>
                        </div>
                        <div className="w-12 h-12 bg-ocean-100 rounded-full flex items-center justify-center">
                            <Calendar className="text-ocean-700" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Confirmadas</p>
                            <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Sentadas</p>
                            <p className="text-3xl font-bold text-blue-600">{stats.seated}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Pendientes</p>
                            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="text-yellow-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Reservations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-display font-bold text-ocean-900">
                        Próximas Reservas (4 horas)
                    </h2>
                    <Clock className="text-ocean-700" size={24} />
                </div>

                {upcomingReservations.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay reservas próximas</p>
                ) : (
                    <div className="space-y-4">
                        {upcomingReservations.map((reservation) => (
                            <div
                                key={reservation.id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-ocean-50 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="font-semibold text-ocean-900">{reservation.full_name}</h3>
                                        {getStatusBadge(reservation.status)}
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span className="flex items-center">
                                            <Clock size={14} className="mr-1" />
                                            {reservation.start_time}
                                        </span>
                                        <span className="flex items-center">
                                            <Users size={14} className="mr-1" />
                                            {reservation.party_size} personas
                                        </span>
                                        {reservation.celebration_type && (
                                            <span className="text-coral-600 font-semibold">
                                                🎉 {reservation.celebration_type}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <a
                                        href={`/admin/reservas?id=${reservation.id}`}
                                        className="px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white rounded-lg text-sm font-semibold transition-colors"
                                    >
                                        Ver
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
