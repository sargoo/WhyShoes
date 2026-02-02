"use client";
import { signIn } from "next-auth/react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-6xl font-black italic text-emerald-500 mb-4">
        WHY_SHOES
      </h1>
      <p className="text-slate-400 text-lg mb-12 max-w-md">
        Tu garaje de running inteligente.<br/>
        Controla el desgaste, evita lesiones.
      </p>

      {/* El botón ahora dispara la función de Google directamente */}
      <button 
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-8 py-4 rounded-full font-bold flex items-center gap-3 transition-all"
      >
        <span className="bg-white p-1 rounded-full text-blue-600 px-2">G</span>
        Entrar con Google
      </button>

      <p className="mt-8 text-xs text-slate-600">
        Versión 2.0 | Login Seguro
      </p>
    </div>
  );
}