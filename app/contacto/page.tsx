import { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Contacto | Paititi del Mar',
    description: 'Encuéntranos en Acapulco Diamante. Horarios, teléfono y ubicación de Paititi del Mar.',
};

export default function ContactoPage() {
    return (
        <div className="pt-20 min-h-screen bg-gradient-sand">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-ocean-900 mb-4">
                        Contacto
                    </h1>
                    <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                        Estamos aquí para atenderte y hacer de tu visita una experiencia inolvidable
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Información de contacto */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl p-8 shadow-xl">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 rounded-full bg-ocean-100 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="text-ocean-700" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-ocean-900 mb-2">Ubicación</h3>
                                    <p className="text-gray-700">
                                        Acapulco Diamante<br />
                                        Guerrero, México
                                    </p>
                                    <a
                                        href="https://maps.google.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-3 text-coral-600 hover:text-coral-700 font-semibold"
                                    >
                                        Ver en Google Maps →
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-xl">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0">
                                    <Phone className="text-coral-700" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-ocean-900 mb-2">Teléfono</h3>
                                    <a
                                        href="tel:+527441234567"
                                        className="text-lg text-gray-700 hover:text-coral-600 transition-colors"
                                    >
                                        +52 744 123 4567
                                    </a>
                                    <p className="text-sm text-gray-500 mt-2">
                                        También por WhatsApp
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-xl">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 rounded-full bg-sand-200 flex items-center justify-center flex-shrink-0">
                                    <Mail className="text-sand-700" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-ocean-900 mb-2">Email</h3>
                                    <a
                                        href="mailto:reservas@paititidelmar.com"
                                        className="text-lg text-gray-700 hover:text-coral-600 transition-colors"
                                    >
                                        reservas@paititidelmar.com
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-xl">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 rounded-full bg-ocean-100 flex items-center justify-center flex-shrink-0">
                                    <Clock className="text-ocean-700" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-ocean-900 mb-2">Horarios</h3>
                                    <div className="space-y-1 text-gray-700">
                                        <p className="font-semibold">Lunes a Domingo</p>
                                        <p className="text-2xl font-display text-coral-600">13:00 - 23:00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mapa y CTA */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-8 shadow-xl h-96 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <MapPin size={48} className="mx-auto mb-4 text-ocean-300" />
                                <p className="font-semibold">Mapa de Google Maps</p>
                                <p className="text-sm mt-2">Integración disponible en producción</p>
                            </div>
                        </div>

                        <div className="bg-gradient-ocean rounded-2xl p-8 text-white text-center">
                            <h3 className="text-3xl font-display font-bold mb-4">
                                Reserva Tu Mesa
                            </h3>
                            <p className="mb-6 text-sand-100">
                                Asegura tu lugar en la mejor experiencia gastronómica de Acapulco
                            </p>
                            <a
                                href="/reservar"
                                className="inline-block bg-coral-600 hover:bg-coral-700 text-white px-8 py-3 rounded-full font-semibold hover-lift shadow-xl transition-all"
                            >
                                Reservar Ahora
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
