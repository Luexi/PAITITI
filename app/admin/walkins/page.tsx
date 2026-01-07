'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRealtimeWalkins, useRealtimeTables, type Walkin, type Table } from '@/lib/supabase/realtime';
import WalkinCard from '@/components/admin/WalkinCard';
import { Plus, Users, Clock, CheckCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminWalkinsPage() {
    const { walkins, loading: walkinsLoading } = useRealtimeWalkins(1, true);
    const { tables } = useRealtimeTables(1);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        party_size: 2,
        notes: '',
        phone: '',
        name: '',
    });

    // Get available tables
    const availableTables = tables.filter((t) => t.active && !walkins.some((w) => w.table_id === t.id));

    // Calculate statistics
    const stats = {
        active: walkins.length,
        avgWaitTime: walkins.length > 0
            ? Math.round(
                walkins.reduce((sum, w) => {
                    const waitMinutes = (new Date().getTime() - new Date(w.start_time).getTime()) / 1000 / 60;
                    return sum + waitMinutes;
                }, 0) / walkins.length
            )
            : 0,
        longestWait: walkins.length > 0
            ? Math.max(
                ...walkins.map((w) => (new Date().getTime() - new Date(w.start_time).getTime()) / 1000 / 60)
            )
            : 0,
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { error } = await supabase.from('walkins').insert({
            venue_id: 1,
            party_size: formData.party_size,
            notes: `${formData.name ? formData.name + ' - ' : ''}${formData.phone ? formData.phone + ' - ' : ''}${formData.notes}`,
            status: 'active',
            start_time: new Date().toISOString(),
        });

        if (!error) {
            setFormData({ party_size: 2, notes: '', phone: '', name: '' });
            setShowForm(false);
        } else {
            alert('Error al registrar walk-in');
        }
    };

    const handleAssignTable = async (walkinId: number, tableId: number | null) => {
        const { error } = await supabase.from('walkins').update({ table_id: tableId }).eq('id', walkinId);

        if (error) {
            alert('Error al asignar mesa');
        }
    };

    const handleComplete = async (walkinId: number) => {
        const { error } = await supabase
            .from('walkins')
            .update({ status: 'completed', end_time: new Date().toISOString() })
            .eq('id', walkinId);

        if (error) {
            alert('Error al completar walk-in');
        }
    };

    const handleCancel = async (walkinId: number) => {
        if (!confirm('¿Estás seguro de cancelar este walk-in?')) return;

        const { error } = await supabase.from('walkins').delete().eq('id', walkinId);

        if (error) {
            alert('Error al cancelar walk-in');
        }
    };

    if (walkinsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-700"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-ocean-900">Walk-ins</h1>
                    <p className="text-gray-600 mt-2">Gestión de clientes sin reserva</p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center px-4 py-2 bg-gradient-ocean text-white rounded-lg font-semibold hover:shadow-ocean transition-all"
                >
                    <Plus size={20} className="mr-2" />
                    Nuevo Walk-in
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Walk-ins Activos</p>
                            <p className="text-3xl font-bold text-ocean-900">{stats.active}</p>
                        </div>
                        <div className="w-12 h-12 bg-ocean-100 rounded-full flex items-center justify-center">
                            <Users className="text-ocean-700" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Tiempo Promedio de Espera</p>
                            <p className="text-3xl font-bold text-blue-600">{stats.avgWaitTime} min</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Clock className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Espera Más Larga</p>
                            <p className="text-3xl font-bold text-yellow-600">{Math.round(stats.longestWait)} min</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Clock className="text-yellow-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-display font-bold text-ocean-900 mb-4">Registrar Walk-in</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nombre (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nombre del cliente"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Teléfono (opcional)
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Ej: 7441234567"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Número de Personas *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="20"
                                    value={formData.party_size}
                                    onChange={(e) => setFormData({ ...formData, party_size: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Notas</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Notas adicionales..."
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-ocean-600 hover:bg-ocean-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                Registrar
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Walk-ins List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-display font-bold text-ocean-900">Lista de Espera</h2>
                    <div className="text-sm text-gray-600">
                        {walkins.length === 0 ? 'Sin clientes esperando' : `${walkins.length} en espera`}
                    </div>
                </div>

                {walkins.length === 0 ? (
                    <div className="text-center py-12">
                        <Users size={64} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 mb-2">No hay walk-ins activos</p>
                        <p className="text-sm text-gray-400">Los clientes sin reserva aparecerán aquí</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {walkins
                            .sort(
                                (a, b) =>
                                    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
                            )
                            .map((walkin) => (
                                <WalkinCard
                                    key={walkin.id}
                                    walkin={walkin}
                                    availableTables={availableTables}
                                    onAssignTable={handleAssignTable}
                                    onComplete={handleComplete}
                                    onCancel={handleCancel}
                                />
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
