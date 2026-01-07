'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Clock, Save } from 'lucide-react';

interface OpeningHours {
    id: number;
    day_of_week: number;
    open_time: string;
    close_time: string;
    is_closed: boolean;
}

interface Settings {
    slot_minutes: number;
    default_reservation_duration_minutes: number;
    max_party_size: number;
    min_notice_minutes: number;
    max_days_ahead: number;
}

export default function AdminConfiguracionPage() {
    const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);
    const [settings, setSettings] = useState<Settings>({
        slot_minutes: 30,
        default_reservation_duration_minutes: 90,
        max_party_size: 10,
        min_notice_minutes: 120,
        max_days_ahead: 30,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // Fetch opening hours
        const { data: hoursData } = await supabase
            .from('opening_hours')
            .select('*')
            .eq('venue_id', 1)
            .order('day_of_week');

        if (hoursData) {
            setOpeningHours(hoursData);
        }

        // Fetch settings
        const { data: settingsData } = await supabase
            .from('settings')
            .select('*')
            .eq('venue_id', 1)
            .single();

        if (settingsData) {
            setSettings({
                slot_minutes: settingsData.slot_minutes,
                default_reservation_duration_minutes: settingsData.default_reservation_duration_minutes,
                max_party_size: settingsData.max_party_size,
                min_notice_minutes: settingsData.min_notice_minutes,
                max_days_ahead: settingsData.max_days_ahead,
            });
        }

        setLoading(false);
    };

    const updateOpeningHours = async (day: number, field: string, value: any) => {
        const hours = openingHours.find((h) => h.day_of_week === day);
        if (!hours) return;

        const { error } = await supabase
            .from('opening_hours')
            .update({ [field]: value })
            .eq('id', hours.id);

        if (!error) {
            fetchData();
        }
    };

    const saveSettings = async () => {
        setSaving(true);

        const { error } = await supabase
            .from('settings')
            .update(settings)
            .eq('venue_id', 1);

        setSaving(false);

        if (!error) {
            alert('Configuración guardada exitosamente');
        } else {
            alert('Error al guardar configuración');
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
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-ocean-900">Configuración</h1>
                <p className="text-gray-600 mt-2">Horarios de apertura y parámetros operativos</p>
            </div>

            {/* Opening Hours */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-display font-bold text-ocean-900 mb-6">
                    <Clock className="inline mr-2" size={24} />
                    Horarios de Apertura
                </h2>

                <div className="space-y-4">
                    {openingHours.map((hours) => (
                        <div
                            key={hours.id}
                            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 border border-gray-200 rounded-lg"
                        >
                            <div className="font-semibold text-ocean-900">
                                {daysOfWeek[hours.day_of_week]}
                            </div>

                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Apertura</label>
                                <input
                                    type="time"
                                    value={hours.open_time.substring(0, 5)}
                                    onChange={(e) => updateOpeningHours(hours.day_of_week, 'open_time', e.target.value)}
                                    disabled={hours.is_closed}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Cierre</label>
                                <input
                                    type="time"
                                    value={hours.close_time.substring(0, 5)}
                                    onChange={(e) => updateOpeningHours(hours.day_of_week, 'close_time', e.target.value)}
                                    disabled={hours.is_closed}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none disabled:bg-gray-100"
                                />
                            </div>

                            <div className="flex items-center">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={hours.is_closed}
                                        onChange={(e) => updateOpeningHours(hours.day_of_week, 'is_closed', e.target.checked)}
                                        className="mr-2 w-5 h-5 text-ocean-600 border-gray-300 rounded focus:ring-ocean-500"
                                    />
                                    <span className="text-sm text-gray-700">Cerrado</span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-display font-bold text-ocean-900 mb-6">
                    Parámetros Operativos
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Duración de Slot (minutos)
                        </label>
                        <select
                            value={settings.slot_minutes}
                            onChange={(e) => setSettings({ ...settings, slot_minutes: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                        >
                            <option value="15">15 minutos</option>
                            <option value="30">30 minutos</option>
                            <option value="60">60 minutos</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Duración Default de Reserva (minutos)
                        </label>
                        <input
                            type="number"
                            value={settings.default_reservation_duration_minutes}
                            onChange={(e) =>
                                setSettings({ ...settings, default_reservation_duration_minutes: parseInt(e.target.value) })
                            }
                            min="30"
                            max="300"
                            step="15"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Máximo de Personas por Reserva
                        </label>
                        <input
                            type="number"
                            value={settings.max_party_size}
                            onChange={(e) => setSettings({ ...settings, max_party_size: parseInt(e.target.value) })}
                            min="1"
                            max="50"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Anticipación Mínima (minutos)
                        </label>
                        <input
                            type="number"
                            value={settings.min_notice_minutes}
                            onChange={(e) => setSettings({ ...settings, min_notice_minutes: parseInt(e.target.value) })}
                            min="0"
                            max="1440"
                            step="30"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Máximo de Días por Adelantado
                        </label>
                        <input
                            type="number"
                            value={settings.max_days_ahead}
                            onChange={(e) => setSettings({ ...settings, max_days_ahead: parseInt(e.target.value) })}
                            min="1"
                            max="365"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 outline-none"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="flex items-center px-6 py-3 bg-gradient-ocean text-white rounded-lg font-semibold hover:shadow-ocean transition-all disabled:opacity-50"
                    >
                        <Save size={20} className="mr-2" />
                        {saving ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                </div>
            </div>
        </div>
    );
}
