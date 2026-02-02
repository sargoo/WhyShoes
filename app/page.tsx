"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Si detecta que ya estás logueado, te manda al Dashboard automáticamente
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-6xl font-black italic text-emerald-500 mb-4">
        WHY_SHOES
      </h1>
      <p className="text-slate-400 text-lg mb-12 max-w-md">
        Tu garaje de running inteligente.<br/>
        Controla el desgaste, evita lesiones.
      </p>

      <button 
        onClick={() => signIn("google")}
        className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-8 py-4 rounded-full font-bold flex items-center gap-3 transition-all"
      >
        <span className="bg-white p-1 rounded-full text-blue-600 px-2">G</span>
        Entrar con Google
      </button>

      <p className="mt-8 text-xs text-slate-600">
        Versión 2.0 | Conexión Exitosa
      </p>
    </div>
  );
}