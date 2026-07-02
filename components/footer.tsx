import { ArrowUpRight, GraduationCap } from "lucide-react";

const pendingLinks = {
  product: ["Características", "Precios", "Roadmap"],
  resources: ["Comunidad", "Guías y tutoriales", "Centro de ayuda"],
  legal: ["Privacidad", "Términos del servicio"],
};

export default function Footer() {
  return (
    <footer
      id="recursos"
      className="bg-white border-t border-slate-200 relative scroll-mt-20 overflow-hidden"
    >
      <div className="absolute bottom-0 right-0 h-75 w-75 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-1/4 h-50 w-50 bg-yellow-300/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-slate-200">
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 bg-slate-900 rounded-xl shadow-md overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-yellow-300 opacity-20 blur-xl rounded-full translate-x-2 -translate-y-2" />
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
              Transformamos tus apuntes y documentos en un entorno de
              aprendizaje inteligente. Estudia de forma más ágil con el poder
              de la IA escolar y futurista.
            </p>
          </div>

          <div className="hidden lg:block lg:col-span-1" />

          <div className="md:col-span-2 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-950 tracking-wider uppercase">
              Producto
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm font-medium text-slate-500">
              {pendingLinks.product.map((label) => (
                <li key={label}>
                  <span className="inline-flex items-center gap-1">
                    {label}
                    {label === "Roadmap" ? (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-semibold">
                        Beta
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-950 tracking-wider uppercase">
              Recursos
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm font-medium text-slate-500">
              {pendingLinks.resources.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 lg:col-span-3 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-950 tracking-wider uppercase">
              Legal & Contacto
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm font-medium text-slate-600">
              {pendingLinks.legal.map((label) => (
                <li key={label} className="text-slate-500">
                  {label}
                </li>
              ))}
              <li>
                <a
                  href="mailto:contacto@nexabot.com"
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors group"
                >
                  contacto@nexabot.com
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-xs text-slate-600 font-medium">
            &copy; {new Date().getFullYear()} NexaBot. Todos los derechos
            reservados.
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Redes sociales pendientes de configurar.
          </p>
        </div>
      </div>
    </footer>
  );
}
