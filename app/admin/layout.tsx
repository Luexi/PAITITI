'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Settings,
    LogOut,
    MapPin,
    Ban,
    UserPlus,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/admin/login');
        } else {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Reservas', href: '/admin/reservas', icon: Calendar },
        { name: 'Mesas', href: '/admin/mesas', icon: MapPin },
        { name: 'Walk-ins', href: '/admin/walkins', icon: UserPlus },
        { name: 'Bloqueos', href: '/admin/bloqueos', icon: Ban },
        { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-700"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-ocean-950 text-white z-50">
                <div className="p-6">
                    <h1 className="text-2xl font-display font-bold">
                        Paititi <span className="text-coral-400">Admin</span>
                    </h1>
                </div>

                <nav className="px-3">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${isActive
                                    ? 'bg-ocean-700 text-white'
                                    : 'text-sand-200 hover:bg-ocean-800 hover:text-white'
                                    }`}
                            >
                                <Icon size={20} className="mr-3" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-ocean-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sand-200 hover:bg-ocean-800 hover:text-white rounded-lg transition-colors"
                    >
                        <LogOut size={20} className="mr-3" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
