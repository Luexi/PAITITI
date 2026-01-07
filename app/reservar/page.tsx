'use client';

import { useState } from 'react';
import { Calendar, Users, Clock, PartyPopper, MessageSquare, CheckCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function ReservarPage() {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        party_size: 2,
        date: '',
        start_time: '',
        celebration_type: '',
        notes: '',
        acceptPolicy: false,
    });

    // Availability state
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Success data
    const [reservationData, setReservationData] = useState<any>(null);

    const celebrationTypes = [
        { value: '', label: 'Ninguno' },
        { value: 'birthday', label: 'Cumpleaños' },
        { value: 'anniversary', label: 'Aniversario' },
        { value: 'graduation', label: 'Graduación' },
        { value: 'date', label: 'Cita romántica' },
        { value: 'other', label: 'Otro' },
    ];

    const fetchAvailability = async (date: string, partySize: number) => {
        if (!date) return;

        setLoadingSlots(true);
        try {
            const response = await fetch(
                `/api/availability?venue_id=1&date=${date}&party_size=${partySize}`
            );
            const data = await response.json();
            setAvailableSlots(data.slots || []);
        } catch (err) {
            console.error('Error fetching availability:', err);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleDateChange = (date: string) => {
        setFormData({ ...formData, date, start_time: '' });
        fetchAvailability(date, formData.party_size);
    };

    const handlePartySizeChange = (size: number) => {
        setFormData({ ...formData, party_size: size, start_time: '' });
        if (formData.date) {
            fetchAvailability(formData.date, size);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.acceptPolicy) {
            setError('Debes aceptar la política de cancelación');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: formData.full_name,
                    phone: formData.phone.startsWith('+52') ? formData.phone : `+52${formData.phone}`,
                    party_size: formData.party_size,
                    date: formData.date,
                    start_time: formData.start_time,
                    celebration_type: formData.celebration_type || undefined,
                    notes: formData.notes || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Error al crear la reserva');
                return;
            }

            setReservationData(data.reservation);
            setStep('success');
        } catch (err) {
            setError('Error de conexión. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'success' && reservationData) {
        return (
            <div className="pt-20 min-h-screen bg-gradient-sand flex items-center justify-center px-4">
                <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-600" size={48} />
                    </div>

                    <h1 className="text-4xl font-display font-bold text-ocean-900 mb-4">
                        ¡Reserva Confirmada!
                    </h1>

                    <p className="text-lg text-gray-700 mb-8">
                        Tu mesa ha sido reservada exitosamente. Te esperamos en Paititi del Mar.
                    </p>

                    <div className="bg-ocean-50 rounded-2xl p-6 mb-8">
                        <div className="grid md:grid-cols-2 gap-4 text-left">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Folio</p>
                                <p className="text-2xl font-bold text-ocean-900">#{reservationData.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Estado</p>
                                <p className="text-lg font-semibold text-green-600">
                                    {reservationData.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Nombre</p>
                                <p className="text-lg font-semibold text-gray-900">{reservationData.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Personas</p>
                                <p className="text-lg font-semibold text-gray-900">{reservationData.party_size}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Fecha</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {format(new Date(reservationData.date), 'dd/MM/yyyy')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Hora</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {reservationData.start_time} - {reservationData.end_time}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-coral-50 border border-coral-200 rounded-xl p-4 mb-8 text-sm text-gray-700">
                        <p className="font-semibold text-coral-800 mb-2">Política de Cancelación</p>
                        <p>Para cancelar o modificar tu reserva, contáctanos al menos 2 horas antes por teléfono o WhatsApp.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/"
                            className="inline-block bg-ocean-700 hover:bg-ocean-800 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                        >
                            Volver al Inicio
                        </a>
                        <button
                            onClick={() => window.print()}
                            className="inline-block border-2 border-ocean-700 text-ocean-700 hover:bg-ocean-50 px-6 py-3 rounded-full font-semibold transition-colors"
                        >
                            Imprimir Confirmación
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Minimum booking date (today)
    const minDate = format(new Date(), 'yyyy-MM-dd');
    // Maximum booking date (30 days ahead)
    const maxDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

    return (
        <div className="pt-20 min-h-screen bg-gradient-sand py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-ocean-900 mb-4">
                        Reserva Tu Mesa
                    </h1>
                    <p className="text-xl text-gray-700">
                        Asegura tu lugar en la mejor experiencia gastronómica de Acapulco
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-6 md:p-10">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nombre Completo *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition"
                                placeholder="Juan Pérez"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Teléfono *
                            </label>
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition"
                                placeholder="7441234567"
                            />
                            <p className="text-xs text-gray-500 mt-1">Formato: 7441234567 (10 dígitos)</p>
                        </div>

                        {/* Party Size */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Users className="inline mr-2" size={18} />
                                Número de Personas *
                            </label>
                            <div className="flex items-center space-x-4">
                                <button
                                    type="button"
                                    onClick={() => handlePartySizeChange(Math.max(1, formData.party_size - 1))}
                                    className="w-12 h-12 rounded-full bg-ocean-100 hover:bg-ocean-200 text-ocean-700 font-bold transition"
                                >
                                    −
                                </button>
                                <span className="text-3xl font-bold text-ocean-900 w-12 text-center">
                                    {formData.party_size}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handlePartySizeChange(Math.min(10, formData.party_size + 1))}
                                    className="w-12 h-12 rounded-full bg-ocean-100 hover:bg-ocean-200 text-ocean-700 font-bold transition"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Calendar className="inline mr-2" size={18} />
                                Fecha *
                            </label>
                            <input
                                type="date"
                                required
                                min={minDate}
                                max={maxDate}
                                value={formData.date}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                        {/* Time Slots */}
                        {formData.date && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <Clock className="inline mr-2" size={18} />
                                    Hora *
                                </label>
                                {loadingSlots ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-700"></div>
                                    </div>
                                ) : availableSlots.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No hay horarios disponibles</p>
                                ) : (
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                        {availableSlots.map((slot) => (
                                            <button
                                                key={slot.time}
                                                type="button"
                                                disabled={slot.status !== 'available'}
                                                onClick={() => setFormData({ ...formData, start_time: slot.time })}
                                                className={`px-4 py-3 rounded-lg font-semibold transition ${formData.start_time === slot.time
                                                        ? 'bg-ocean-700 text-white ring-2 ring-ocean-400'
                                                        : slot.status === 'available'
                                                            ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                                            : slot.status === 'blocked'
                                                                ? 'bg-red-50 text-red-400 cursor-not-allowed line-through'
                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                title={slot.reason || ''}
                                            >
                                                {slot.time}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Celebration Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <PartyPopper className="inline mr-2" size={18} />
                                ¿Es una celebración especial?
                            </label>
                            <select
                                value={formData.celebration_type}
                                onChange={(e) => setFormData({ ...formData, celebration_type: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition"
                            >
                                {celebrationTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <MessageSquare className="inline mr-2" size={18} />
                                Comentarios Especiales
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                maxLength={500}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition resize-none"
                                placeholder="Alergias, preferencias de mesa, etc."
                            />
                        </div>

                        {/* Policy Checkbox */}
                        <div className="bg-ocean-50 rounded-xl p-4">
                            <label className="flex items-start cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.acceptPolicy}
                                    onChange={(e) => setFormData({ ...formData, acceptPolicy: e.target.checked })}
                                    className="mt-1 mr-3 w-5 h-5 text-ocean-600 border-gray-300 rounded focus:ring-ocean-500"
                                    required
                                />
                                <span className="text-sm text-gray-700">
                                    Acepto la política de cancelación. Las reservas deben cancelarse con al menos 2 horas de anticipación.
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !formData.start_time}
                            className="w-full bg-gradient-ocean text-white px-8 py-4 rounded-full text-lg font-semibold shadow-ocean hover-lift transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? 'Procesando...' : 'Confirmar Reserva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
