"use client";

import { signOut } from "next-auth/react";

export default function UserStatus({ name }: { name?: string | null }) {
  return (
    <div className="text-right hidden md:block">
      <div className="text-xs font-bold text-slate-500 uppercase">Usuario</div>
      <div className="font-bold text-emerald-400">{name || "Corredor"}</div>
      <button 
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-[10px] text-red-500 hover:text-red-400 hover:underline mt-1 transition-colors"
      >
        CERRAR SESIÓN
      </button>
    </div>
  );
}