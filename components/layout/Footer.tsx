import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-ocean-950 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Información de contacto */}
                    <div>
                        <h3 className="text-2xl font-display mb-4 text-sand-200">Paititi del Mar</h3>
                        <p className="text-sand-100 mb-4">
                            Experiencia culinaria frente al mar en Acapulco Diamante
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                                <MapPin size={16} className="text-coral-400" />
                                <span>Acapulco Diamante, Guerrero</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone size={16} className="text-coral-400" />
                                <a href="tel:+527441234567" className="hover:text-coral-400 transition-colors">
                                    +52 744 123 4567
                                </a>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Mail size={16} className="text-coral-400" />
                                <a href="mailto:reservas@paititidelmar.com" className="hover:text-coral-400 transition-colors">
                                    reservas@paititidelmar.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Horarios */}
                    <div>
                        <h4 className="font-display text-lg mb-4 text-sand-200">Horarios</h4>
                        <div className="space-y-1 text-sm">
                            <p>Lunes a Domingo</p>
                            <p className="text-coral-400 font-semibold">13:00 - 23:00 hrs</p>
                        </div>
                    </div>

                    {/* Links y redes sociales */}
                    <div>
                        <h4 className="font-display text-lg mb-4 text-sand-200">Síguenos</h4>
                        <div className="flex space-x-4 mb-6">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-coral-600 transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook size={20} />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-coral-600 transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram size={20} />
                            </a>
                        </div>
                        <Link
                            href="/reservar"
                            className="inline-block bg-coral-600 hover:bg-coral-700 text-white px-6 py-2 rounded-full font-semibold transition-colors"
                        >
                            Reservar Mesa
                        </Link>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm text-sand-200">
                    <p>&copy; {new Date().getFullYear()} Paititi del Mar. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
