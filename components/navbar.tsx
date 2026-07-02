import React from 'react';
import Link from 'next/link';
import { GraduationCap, ChevronRight } from 'lucide-react';

export default function Navbar() {
    return (
        <div>
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">

                        {/* 1. Logo y Marca */}
                        <div className="flex items-center gap-3 cursor-pointer">
                            {/* Ícono con fondo oscuro y acento amarillo (glow) */}
                            <div className="relative flex items-center justify-center w-11 h-11 bg-slate-900 rounded-xl shadow-lg overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-yellow-300 opacity-20 blur-xl rounded-full translate-x-3 -translate-y-3"></div>
                                <GraduationCap className="w-6 h-6 text-white relative z-10" />
                            </div>
                            {/* Texto de la marca */}
                            <div className="flex flex-col justify-center">
                                <span className="text-xl font-bold text-slate-950 leading-none mb-1">
                                    NexaBot
                                </span>
                                <span className="text-[0.65rem] font-bold text-blue-600 tracking-[0.2em] uppercase leading-none">
                                    Campus IA
                                </span>
                            </div>
                        </div>

                        {/* 2. Enlaces de Navegación (Píldora central) */}
                        <nav className="hidden md:flex items-center bg-slate-50/80 border border-slate-200 rounded-full px-1.5 py-1.5 shadow-sm">
                            <a
                                href="#producto"
                                className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-950 hover:bg-white rounded-full transition-all"
                            >
                                Producto
                            </a>
                            <a
                                href="#como-funciona"
                                className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-950 hover:bg-white rounded-full transition-all"
                            >
                                Cómo funciona
                            </a>
                            <a
                                href="#recursos"
                                className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-950 hover:bg-white rounded-full transition-all"
                            >
                                Recursos
                            </a>
                        </nav>
                        <div className="hidden md:flex items-center gap-5">
                            {/* 2. Cambiamos <a> por <Link> y ajustamos el href */}
                            <Link
                                href="/auth/login"
                                className="text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors"
                            >
                                Iniciar sesión
                            </Link>

                            {/* 3. Mismo proceso para el botón de registro */}
                            <Link
                                href="/auth/register"
                                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all shadow-sm shadow-blue-600/20 hover:shadow-md hover:shadow-blue-600/30"
                            >
                                Crear cuenta
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                    </div>
                </div>
            </header>
        </div>
    );
}