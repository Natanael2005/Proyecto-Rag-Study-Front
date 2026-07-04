export default function DashboardPage() {
  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-600">Panel de estudio</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Bienvenido a NexaBot
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Aquí podrás gestionar tus documentos, generar flashcards y estudiar con apoyo de IA.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">Documentos</h2>
          <p className="mt-2 text-sm text-slate-600">
            Sube apuntes o archivos PDF para analizarlos.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">Flashcards</h2>
          <p className="mt-2 text-sm text-slate-600">
            Genera tarjetas de estudio automáticamente.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">Sala de estudio</h2>
          <p className="mt-2 text-sm text-slate-600">
            Organiza tu material y estudia por unidades.
          </p>
        </div>
      </div>
    </section>
  );
}