import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function GaragePage() {
  // 1. Buscamos los tenis (Ordenados por marca para evitar errores)
  const shoes = await prisma.shoe.findMany({
    where: { isActive: true },
    orderBy: { brand: 'asc' }
  });

  // 2. LA FUNCIÓN DE BORRADO (Server Action)
  async function deleteShoe(formData: FormData) {
    'use server';
    const shoeId = formData.get('shoeId') as string;
    
    if (shoeId) {
      // Borramos el zapato de la base de datos
      await prisma.shoe.delete({
        where: { id: shoeId }
      });
      
      // Recargamos la página para ver el cambio
      revalidatePath('/dashboard/garage');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black italic text-emerald-400">GARAGE_</h1>
          <p className="text-slate-400">Tu rotación activa.</p>
        </div>
        <Link href="/dashboard/garage/new">
          <button className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all flex gap-2 items-center">
            <Plus size={20} /> Añadir Zapas
          </button>
        </Link>
      </div>

      {/* Grid de Zapatillas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shoes.map((shoe) => {
          const health = Math.round(100 - (shoe.totalDistance / shoe.maxDistance * 100));
          
          return (
            <div key={shoe.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative group hover:border-emerald-500/50 transition-all">
              
              {/* BOTÓN DE BORRAR (Ahora funciona) */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <form action={deleteShoe}>
                  <input type="hidden" name="shoeId" value={shoe.id} />
                  <button type="submit" className="text-slate-600 hover:text-red-500 transition-colors p-2" title="Eliminar Zapa">
                    <Trash2 size={20} />
                  </button>
                </form>
              </div>
              
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">{shoe.brand}</h3>
              <p className="text-2xl font-black italic">{shoe.model}</p>
              
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">{shoe.totalDistance} km</span>
                  <span className={health < 20 ? "text-red-500" : "text-emerald-400"}>{health}% Vida</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${health < 20 ? "bg-red-500" : "bg-emerald-500"}`} 
                    style={{ width: `${Math.max(health, 0)}%` }} 
                  />
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Card vacía para incitar a añadir */}
        {shoes.length === 0 && (
           <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
             <p className="text-slate-500">Tu garaje está vacío...</p>
           </div>
        )}
      </div>
      
      <div className="mt-12">
        <Link href="/dashboard" className="text-slate-500 hover:text-white underline underline-offset-4">
          &larr; Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}