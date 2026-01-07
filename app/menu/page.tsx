import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Menú | Paititi del Mar',
    description: 'Descubre nuestra selección de mariscos frescos, pescados y platillos de autor en Paititi del Mar.',
};

const menuCategories = {
    entradas: [
        {
            name: 'Aguachile de Camarón',
            description: 'Camarones frescos en salsa verde picante con pepino y cebolla morada',
            price: '$285',
        },
        {
            name: 'Ceviche Paititi',
            description: 'Pescado del día, camarón y pulpo con chile habanero y mango',
            price: '$320',
        },
        {
            name: 'Tostadas de Atún',
            description: 'Atún sellado sobre tostadas de maíz con guacamole y chipotle',
            price: '$265',
        },
        {
            name: 'Pulpo al Carbón',
            description: 'Pulpo a las brasas con puré de papa morada y aceite de chile',
            price: '$380',
        },
    ],
    platosFuertes: [
        {
            name: 'Pescado a la Talla',
            description: 'Pescado entero a las brasas con salsa especial de chile ancho',
            price: '$520',
        },
        {
            name: 'Langosta al Grill',
            description: 'Langosta fresca con mantequilla de hierbas y vegetales asados',
            price: '$850',
        },
        {
            name: 'Camarones Zarandeados',
            description: 'Camarones gigantes marinados con receta tradicional nayarita',
            price: '$480',
        },
        {
            name: 'Filete de Robalo',
            description: 'En costra de hierbas con risotto de mariscos y reducción de vino blanco',
            price: '$620',
        },
        {
            name: 'Parrillada de Mariscos (2 personas)',
            description: 'Langosta, camarones, mejillones, almejas y pescado del día',
            price: '$1,450',
        },
    ],
    cocteles: [
        {
            name: 'Margarita del Mar',
            description: 'Tequila reposado, triple sec, limón y sal de mar',
            price: '$180',
        },
        {
            name: 'Mojito de Maracuyá',
            description: 'Ron blanco, maracuyá fresca, hierbabuena y agua mineral',
            price: '$165',
        },
        {
            name: 'Mezcalita Tropical',
            description: 'Mezcal artesanal, mango, chile tajín y limón',
            price: '$195',
        },
    ],
};

export default function MenuPage() {
    return (
        <div className="pt-20 min-h-screen bg-gradient-sand">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-ocean-900 mb-4">
                        Nuestro Menú
                    </h1>
                    <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                        Una selección curada de los mejores mariscos y pescados del Pacífico
                    </p>
                </div>

                {/* Entradas */}
                <section className="mb-16">
                    <h2 className="text-4xl font-display font-bold text-ocean-800 mb-8">Entradas</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {menuCategories.entradas.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-6 shadow-lg hover-lift transition-all"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-semibold text-ocean-900">{item.name}</h3>
                                    <span className="text-coral-600 font-bold text-lg">{item.price}</span>
                                </div>
                                <p className="text-gray-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Platos Fuertes */}
                <section className="mb-16">
                    <h2 className="text-4xl font-display font-bold text-ocean-800 mb-8">
                        Platos Fuertes
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {menuCategories.platosFuertes.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-6 shadow-lg hover-lift transition-all"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-semibold text-ocean-900">{item.name}</h3>
                                    <span className="text-coral-600 font-bold text-lg">{item.price}</span>
                                </div>
                                <p className="text-gray-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Cocteles */}
                <section className="mb-16">
                    <h2 className="text-4xl font-display font-bold text-ocean-800 mb-8">Cocteles</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {menuCategories.cocteles.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-6 shadow-lg hover-lift transition-all"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-semibold text-ocean-900">{item.name}</h3>
                                    <span className="text-coral-600 font-bold text-lg">{item.price}</span>
                                </div>
                                <p className="text-gray-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <div className="text-center bg-white rounded-2xl p-12 shadow-xl">
                    <h3 className="text-3xl font-display font-bold text-ocean-900 mb-4">
                        ¿Listo para disfrutar?
                    </h3>
                    <p className="text-gray-700 mb-8">Reserva tu mesa y vive la experiencia Paititi del Mar</p>
                    <a
                        href="/reservar"
                        className="inline-block bg-gradient-ocean text-white px-8 py-3 rounded-full font-semibold hover-lift shadow-ocean transition-all"
                    >
                        Reservar Ahora
                    </a>
                </div>
            </div>
        </div>
    );
}
