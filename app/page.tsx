import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession();

  // Si ya hay sesión, te manda directo al Dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-center text-white">
      <h1 className="text-6xl font-black italic text-emerald-500 mb-4 tracking-tighter">
        WHY_SHOES
      </h1>
      <p className="text-slate-400 text-lg mb-12 max-w-md">
        Tu garaje de running inteligente.
        <br/>
        Controla el desgaste, evita lesiones.
      </p>

      {/* Botón para iniciar sesión con Google */}
      <Link href="/api/auth/signin/google">
        <button className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-xl flex items-center gap-3 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
          <span className="font-black text-blue-600">G</span> Entrar con Google
        </button>
      </Link>
      
      <p className="mt-8 text-xs text-slate-600">
        Versión 2.0 | Login Seguro
      </p>
    </div>
  );
}