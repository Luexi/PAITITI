import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
    title: "Paititi del Mar | Restaurante de Mariscos en Acapulco Diamante",
    description: "Experiencia culinaria frente al mar. Los mejores mariscos frescos en Acapulco Diamante. Reserva tu mesa ahora.",
    keywords: "restaurante, mariscos, Acapulco, Diamante, pescado fresco, cocina mexicana, vista al mar",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className="antialiased">
                <Header />
                <main className="min-h-screen">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
