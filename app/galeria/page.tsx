import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Galería | Paititi del Mar',
    description: 'Descubre el ambiente y los platillos de Paititi del Mar a través de nuestra galería.',
};

export default function GaleriaPage() {
    // Placeholder images - in production, these would come from Supabase Storage
    const galleryImages = [
        { id: 1, alt: 'Mariscos frescos' },
        { id: 2, alt: 'Vista al mar' },
        { id: 3, alt: 'Interior del restaurante' },
        { id: 4, alt: 'Langosta a la parrilla' },
        { id: 5, alt: 'Ceviche fresco' },
        { id: 6, alt: 'Ambiente nocturno' },
        { id: 7, alt: 'Bar de cocteles' },
        { id: 8, alt: 'Terraza con vista' },
        { id: 9, alt: 'Platillo de pescado' },
    ];

    return (
        <div className="pt-20 min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-ocean-900 mb-4">
                        Galería
                    </h1>
                    <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                        Un vistazo a la experiencia que te espera en Paititi del Mar
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleryImages.map((image) => (
                        <div
                            key={image.id}
                            className="relative h-80 rounded-xl overflow-hidden shadow-lg hover-lift cursor-pointer group"
                        >
                            <div className="absolute inset-0 bg-gradient-ocean opacity-0 group-hover:opacity-30 transition-opacity z-10" />
                            <Image
                                src={`/images/gallery-${image.id}.jpg`}
                                alt={image.alt}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                    ))}
                </div>

                <div className="text-center mt-16 bg-gradient-sand rounded-2xl p-12">
                    <h3 className="text-3xl font-display font-bold text-ocean-900 mb-4">
                        Vive la Experiencia
                    </h3>
                    <p className="text-gray-700 mb-8">
                        Las fotos no le hacen justicia. Ven y descubre por qué Paititi del Mar es único.
                    </p>
                    <a
                        href="/reservar"
                        className="inline-block bg-coral-600 hover:bg-coral-700 text-white px-8 py-3 rounded-full font-semibold hover-lift shadow-xl transition-all"
                    >
                        Reservar Mesa
                    </a>
                </div>
            </div>
        </div>
    );
}
