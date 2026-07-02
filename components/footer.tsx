import React from 'react';
import { GraduationCap, ArrowUpRight } from 'lucide-react';
import path from 'path/win32';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 relative overflow-hidden">
      {/* Detalle estético opcional: un sutil destello de luz de fondo en una esquina */}
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-[200px] h-[200px] bg-yellow-300/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-slate-200">
          
          {/* Columna 1: Branding e Introducción (Toma 4 columnas en pantallas grandes) */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="relative flex items-center justify-center w-10 h-10 bg-slate-900 rounded-xl shadow-md overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-yellow-300 opacity-20 blur-xl rounded-full translate-x-2 -translate-y-2"></div>
                <GraduationCap className="w-5 h-5 text-white relative z-10" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-lg font-bold text-slate-950 leading-none mb-1">
                  NexaBot
                </span>
                <span className="text-[0.6rem] font-bold text-blue-600 tracking-[0.2em] uppercase leading-none">
                  Campus IA
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              Transformamos tus apuntes y documentos en un entorno de aprendizaje inteligente. Estudia de forma más ágil con el poder de la IA escolar y futurista.
            </p>
          </div>

          {/* Espaciador para centrar mejor las columnas en escritorio */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Columna 2: Enlaces de Producto (2 columnas) */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-950 tracking-wider uppercase">
              Producto
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm font-medium text-slate-600">
              <li><a href="#caracteristicas" className="hover:text-blue-600 transition-colors">Características</a></li>
              <li><a href="#precios" className="hover:text-blue-600 transition-colors">Precios</a></li>
              <li>
                <a href="#roadmap" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                  Roadmap <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-semibold">Beta</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Enlaces de Recursos (2 columnas) */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-950 tracking-wider uppercase">
              Recursos
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm font-medium text-slate-600">
              <li><a href="#comunidad" className="hover:text-blue-600 transition-colors">Comunidad</a></li>
              <li><a href="#guias" className="hover:text-blue-600 transition-colors">Guías y Tutoriales</a></li>
              <li><a href="#soporte" className="hover:text-blue-600 transition-colors">Centro de ayuda</a></li>
            </ul>
          </div>

          {/* Columna 4: Enlaces de Compañía / Legal (3 columnas) */}
          <div className="md:col-span-3 lg:col-span-3 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-950 tracking-wider uppercase">
              Legal & Contacto
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm font-medium text-slate-600">
              <li><a href="#privacidad" className="hover:text-blue-600 transition-colors">Privacidad</a></li>
              <li><a href="#terminos" className="hover:text-blue-600 transition-colors">Términos del servicio</a></li>
              <li>
                <a href="mailto:contacto@nexabot.com" className="flex items-center gap-1 hover:text-blue-600 transition-colors group">
                  contacto@nexabot.com
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Sección Inferior: Copyright y Redes Sociales */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-xs text-slate-600 font-medium">
            &copy; {new Date().getFullYear()} NexaBot. Todos los derechos reservados.
          </p>
          
          {/* Redes Sociales con estilo interactivo suave (Usando SVG directo para marcas) */}
          <div className="flex items-center gap-3">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 text-slate-600 hover:text-slate-950 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg transition-all"
              aria-label="Twitter"
            >
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
              </svg>
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 text-slate-600 hover:text-slate-950 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg transition-all"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect width="4" height="12" x="2" y="9"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 text-slate-600 hover:text-slate-950 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg transition-all"
              aria-label="GitHub"
            >
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                <path d="M9 18c-4.51 2-5-2-7-2"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}