'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { format, parseISO } from 'date-fns';
import { Ban, Plus, Trash2 } from 'lucide-react';

interface Block {
    id: number;
    start_datetime: string;
    end_datetime: string;
    reason: string;
    created_at: string;
}

export default function AdminBloqueosPage() {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        reason: '',
    });

    useEffect(() => {
        fetchBlocks();
    }, []);

    const fetchBlocks = async () => {
        const { data, error } = await supabase
            .from('blocks')
            .select('*')
            .eq('venue_id', 1)
            .order('start_datetime', { ascending: true });

        if (data) {
            setBlocks(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { error } = await supabase.from('blocks').insert({
            venue_id: 1,
            start_datetime: `${formData.start_date}T${formData.start_time}:00`,
            end_datetime: `${formData.end_date}T${formData.end_time}:00`,
            reason: formData.reason,
        });

        if (!error) {
            setFormData({
                start_date: '',
                start_time: '',
                end_date: '',
                end_time: '',
                reason: '',
            });
            setShowForm(false);
            fetchBlocks();
        }
    };

    const deleteBlock = async (id: number) => {
        if (confirm('¿Estás seguro de eliminar este bloqueo?')) {
            const { error } = await supabase.from('blocks').delete().eq('id', id);

            if (!error) {
                fetchBlocks();
            }
        }
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-ocean-900">Bloqueos</h1>
                    <p className="text-gray-600 mt-2">Gestión de fechas y horarios bloqueados</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center px-4 py-2 bg-gradient-ocean text-white rounded-lg font-semibold hover:shadow-ocean transition-all"
                >
                    <Plus size={20} className="mr-2" />
                    Nuevo Bloqueo
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-display font-bold text-ocean-900 mb-4">Crear Bloqueo</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Fecha Inicio *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Hora Inicio *
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Fecha Fin *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Hora Fin *
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.end_time}
                                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Razón *</label>
                            <input
                                type="text"
                                required
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="Evento privado, mantenimiento, etc."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-ocean-600 hover:bg-ocean-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                Crear Bloqueo
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

            {/* Blocks List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-ocean-50 border-b border-ocean-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-ocean-900">Inicio</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-ocean-900">Fin</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-ocean-900">Razón</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-ocean-900">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {blocks.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    <Ban size={48} className="mx-auto mb-4 text-gray-300" />
                                    No hay bloqueos configurados
                                </td>
                            </tr>
                        ) : (
                            blocks.map((block) => (
                                <tr key={block.id} className="hover:bg-ocean-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {format(parseISO(block.start_datetime), 'dd/MM/yyyy HH:mm')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {format(parseISO(block.end_datetime), 'dd/MM/yyyy HH:mm')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{block.reason}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => deleteBlock(block.id)}
                                            className="flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-semibold transition-colors"
                                        >
                                            <Trash2 size={14} className="mr-1" />
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
