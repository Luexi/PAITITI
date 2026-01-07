'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Inicio', href: '/' },
        { name: 'Menú', href: '/menu' },
        { name: 'Galería', href: '/galeria' },
        { name: 'Contacto', href: '/contacto' },
    ];

    return (
        <header className="fixed w-full top-0 z-50 glass border-b border-white/20">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="text-2xl font-bold font-display text-ocean-800">
                            Paititi <span className="text-coral-600">del Mar</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-ocean-900 hover:text-coral-600 font-medium transition-colors duration-200"
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            href="/reservar"
                            className="bg-gradient-ocean text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-ocean hover-lift transition-all duration-300"
                        >
                            Reservar
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-ocean-800 p-2"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 animate-fade-in">
                        <div className="flex flex-col space-y-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-ocean-900 hover:text-coral-600 font-medium transition-colors px-4 py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <Link
                                href="/reservar"
                                className="bg-gradient-ocean text-white px-6 py-3 rounded-full font-semibold text-center mx-4"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Reservar
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
