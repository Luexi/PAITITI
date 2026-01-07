import Link from 'next/link';
import Image from 'next/image';
import { Waves, ChefHat, Sparkles, ArrowRight } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="pt-20">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-ocean-950/60 via-ocean-900/40 to-ocean-950/80 z-10" />
                    <Image
                        src="/images/hero.jpg"
                        alt="Mariscos frescos del mar"
                        fill
                        className="object-cover"
                        priority
                        quality={90}
                    />
                </div>

                {/* Hero Content */}
                <div className="relative z-20 text-center px-4 max-w-5xl mx-auto animate-fade-in">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-6 animate-slide-up">
                        Paititi <span className="text-coral-400">del Mar</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-sand-100 mb-4 max-w-2xl mx-auto">
                        Experiencia culinaria frente al mar
                    </p>
                    <p className="text-lg text-sand-200 mb-12 max-w-xl mx-auto">
                        Los mariscos más frescos de Acapulco Diamante en un ambiente premium con vista al océano
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/reservar"
                            className="bg-coral-600 hover:bg-coral-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover-lift transition-all inline-flex items-center justify-center group"
                        >
                            Reservar Mesa
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                        </Link>
                        <Link
                            href="/menu"
                            className="glass-dark text-white px-8 py-4 rounded-full text-lg font-semibold hover-lift transition-all"
                        >
                            Ver Menú
                        </Link>
                    </div>
                </div>

                {/* Floating Wave Animation */}
                <div className="absolute bottom-0 left-0 right-0 z-15">
                    <svg
                        viewBox="0 0 1440 120"
                        className="w-full h-24 text-white animate-float"
                        preserveAspectRatio="none"
                    >
                        <path
                            fill="currentColor"
                            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
                        />
                    </svg>
                </div>
            </section>

            {/* Concepto Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-ocean-900 mb-6">
                                Nuestro Concepto
                            </h2>
                            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                                En Paititi del Mar, celebramos la riqueza del océano Pacífico con una propuesta gastronómica que combina tradición mexicana y técnicas contemporáneas.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                Cada platillo es una experiencia sensorial diseñada para transportarte a las profundidades del mar, en un ambiente sofisticado con vistas espectaculares de Acapulco Diamante.
                            </p>
                        </div>
                        <div className="relative h-96 rounded-2xl overflow-hidden shadow-ocean">
                            <div className="absolute inset-0 bg-gradient-sand opacity-20" />
                            <Image
                                src="/images/concept.jpg"
                                alt="Concepto Paititi del Mar"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Highlights Section */}
            <section className="py-20 bg-gradient-sand">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-ocean-900 text-center mb-16">
                        Lo Que Nos Define
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Highlight 1 */}
                        <div className="bg-white rounded-2xl p-8 shadow-xl hover-lift transition-all group">
                            <div className="w-16 h-16 rounded-full bg-ocean-100 flex items-center justify-center mb-6 group-hover:bg-ocean-600 transition-colors">
                                <Waves className="text-ocean-600 group-hover:text-white transition-colors" size={32} />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-ocean-900 mb-4">
                                Frescura del Mar
                            </h3>
                            <p className="text-gray-700">
                                Selección diaria de los mejores mariscos y pescados frescos, directo de pescadores locales al plato.
                            </p>
                        </div>

                        {/* Highlight 2 */}
                        <div className="bg-white rounded-2xl p-8 shadow-xl hover-lift transition-all group">
                            <div className="w-16 h-16 rounded-full bg-coral-100 flex items-center justify-center mb-6 group-hover:bg-coral-600 transition-colors">
                                <ChefHat className="text-coral-600 group-hover:text-white transition-colors" size={32} />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-ocean-900 mb-4">
                                Cocina de Autor
                            </h3>
                            <p className="text-gray-700">
                                Platillos únicos creados por nuestro chef ejecutivo, fusionando tradición mexicana con innovación culinaria.
                            </p>
                        </div>

                        {/* Highlight 3 */}
                        <div className="bg-white rounded-2xl p-8 shadow-xl hover-lift transition-all group">
                            <div className="w-16 h-16 rounded-full bg-sand-200 flex items-center justify-center mb-6 group-hover:bg-sand-500 transition-colors">
                                <Sparkles className="text-sand-700 group-hover:text-white transition-colors" size={32} />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-ocean-900 mb-4">
                                Experiencia Premium
                            </h3>
                            <p className="text-gray-700">
                                Ambiente sofisticado con vistas panorámicas al océano, servicio impecable y atención a cada detalle.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mini Gallery Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-ocean-900 text-center mb-16">
                        Galería
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="relative h-64 rounded-xl overflow-hidden hover-lift cursor-pointer group"
                            >
                                <div className="absolute inset-0 bg-ocean-900/0 group-hover:bg-ocean-900/30 transition-colors z-10" />
                                <Image
                                    src={`/images/gallery-${i}.jpg`}
                                    alt={`Galería ${i}`}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <Link
                            href="/galeria"
                            className="inline-flex items-center text-ocean-700 hover:text-coral-600 font-semibold text-lg group"
                        >
                            Ver más fotos
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 gradient-ocean">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                        Reserva Tu Experiencia
                    </h2>
                    <p className="text-xl text-sand-100 mb-10">
                        Vive una experiencia gastronómica inolvidable frente al mar
                    </p>
                    <Link
                        href="/reservar"
                        className="inline-block bg-coral-600 hover:bg-coral-700 text-white px-10 py-4 rounded-full text-lg font-semibold shadow-2xl hover-lift transition-all"
                    >
                        Reservar Ahora
                    </Link>
                </div>
            </section>
        </div>
    );
}
