import React from 'react';
import { BookOpen, ArrowUpRight, BrainCircuit, FileText, Layers, Users } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-slate-50">
      {/* Luces de fondo difuminadas para el efecto futurista/tecnológico */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400/20 blur-[120px] rounded-full mix-blend-multiply pointer-events-none -translate-x-1/2 -translate-y-1/4"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-300/20 blur-[120px] rounded-full mix-blend-multiply pointer-events-none translate-x-1/3 -translate-y-1/4"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Columna Izquierda: Copy y CTAs */}
          <div className="max-w-2xl">
            {/* Etiqueta superior */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-blue-600 font-bold text-xs tracking-widest uppercase mb-6 shadow-sm">
              <BookOpen className="w-4 h-4" />
              Estudio Inteligente
            </div>
            
            {/* Titular Principal */}
            <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-extrabold text-slate-950 leading-[1.1] tracking-tight mb-6">
              Convierte tus apuntes en un campus inteligente con IA.
            </h1>
            
            {/* Subtítulo */}
            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
              Base visual preparada para una landing educativa: documentos, respuestas con citas, flashcards, exámenes y salas de estudio en una interfaz clara, escolar y futurista.
            </p>
            
            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a 
                href="#empezar" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3.5 rounded-full transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
              >
                Empezar ahora
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <a 
                href="#funciona" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white text-slate-900 font-medium border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
              >
                Ver cómo funciona
              </a>
            </div>
          </div>

          {/* Columna Derecha: Mockup del Panel */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            {/* Carcasa blanca exterior con sombra suave */}
            <div className="bg-white p-4 md:p-6 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
              
              {/* Tarjeta oscura interior (Simulación de la App) */}
              <div className="bg-[#0B1120] rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col gap-6">
                
                {/* Header de la tarjeta */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-yellow-300 text-[0.65rem] font-bold tracking-[0.2em] uppercase block mb-2">
                      Panel de estudio
                    </span>
                    <h3 className="text-white text-2xl font-semibold">
                      Unidad 1
                    </h3>
                  </div>
                  {/* Ícono IA decorativo */}
                  <div className="bg-blue-950/60 p-2.5 rounded-xl border border-blue-900/50">
                    <BrainCircuit className="w-6 h-6 text-blue-400" />
                  </div>
                </div>

                {/* Lista de características interactivas */}
                <div className="flex flex-col gap-3 mt-2">
                  
                  {/* Item 1: PDF */}
                  <div className="flex items-center gap-4 p-3.5 rounded-xl border border-slate-800/60 bg-slate-800/20 hover:bg-slate-800/40 transition-colors cursor-default">
                    <div className="bg-white rounded-lg p-2.5 shadow-sm flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-semibold">PDF analizado</h4>
                      <p className="text-slate-400 text-xs mt-0.5">Citas listas para responder</p>
                    </div>
                  </div>

                  {/* Item 2: Flashcards */}
                  <div className="flex items-center gap-4 p-3.5 rounded-xl border border-slate-800/60 bg-slate-800/20 hover:bg-slate-800/40 transition-colors cursor-default">
                    <div className="bg-white rounded-lg p-2.5 shadow-sm flex-shrink-0">
                      <Layers className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-semibold">Flashcards</h4>
                      <p className="text-slate-400 text-xs mt-0.5">12 tarjetas generadas</p>
                    </div>
                  </div>

                  {/* Item 3: Sala de estudio */}
                  <div className="flex items-center gap-4 p-3.5 rounded-xl border border-slate-800/60 bg-slate-800/20 hover:bg-slate-800/40 transition-colors cursor-default">
                    <div className="bg-white rounded-lg p-2.5 shadow-sm flex-shrink-0">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-semibold">Sala de estudio</h4>
                      <p className="text-slate-400 text-xs mt-0.5">Equipo conectado</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}