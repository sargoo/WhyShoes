import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Save } from 'lucide-react';

export default async function NewRunPage() {
  // 1. Buscamos los tenis para el select
  const shoes = await prisma.shoe.findMany({
    where: { isActive: true },
    orderBy: { brand: 'asc' }
  });

  // 2. SERVER ACTION
  async function createRun(formData: FormData) {
    'use server';

    const distance = parseFloat(formData.get('distance') as string);
    const duration = parseInt(formData.get('duration') as string) * 60; 
    const shoeId = formData.get('shoeId') as string;

    if (!shoeId) return;

    // Buscamos el zapato para obtener el dueño
    const selectedShoe = await prisma.shoe.findUnique({
        where: { id: shoeId }
    });

    if (!selectedShoe) throw new Error("Zapato no encontrado");

    // A. Guardar la actividad (VERSIÓN CORREGIDA SIN CAMPOS EXTRA)
    await prisma.activity.create({
      data: {
        distance: distance,
        duration: duration, 
        pace: distance > 0 ? (duration / 60) / distance : 0, 
        shoeId: shoeId,
        userId: selectedShoe.userId,
      },
    });

    // B. Actualizar el desgaste del zapato
    await prisma.shoe.update({
      where: { id: shoeId },
      data: {
        totalDistance: { increment: distance }
      }
    });

    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 flex justify-center items-center">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl shadow-emerald-900/20">
        <h1 className="text-2xl font-black italic text-emerald-400 mb-2">REGISTRAR_RUN</h1>
        <p className="text-slate-500 text-sm mb-6">Suma kilómetros a tu historial.</p>
        
        <form action={createRun} className="space-y-6">
          
          {/* Input: Distancia */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Distancia (KM)</label>
            <input 
              name="distance" 
              type="number" 
              step="0.01" 
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-3xl font-black text-white focus:border-emerald-500 focus:outline-none placeholder-slate-800"
              placeholder="0.0"
            />
          </div>

          {/* Input: Duración */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Duración (Minutos)</label>
            <input 
              name="duration" 
              type="number" 
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-emerald-500 focus:outline-none"
              placeholder="Ej: 45"
            />
          </div>

          {/* Select: Zapatillas */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">¿Qué usaste?</label>
            <div className="relative">
                <select 
                name="shoeId" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-emerald-500 focus:outline-none appearance-none"
                >
                {shoes.map(shoe => (
                    <option key={shoe.id} value={shoe.id}>
                    {shoe.brand} {shoe.model} ({shoe.totalDistance.toFixed(1)} km)
                    </option>
                ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
            </div>
          </div>

          {/* Botón Guardar */}
          <button 
            type="submit" 
            className="w-full bg-emerald-500 text-slate-950 font-black italic uppercase py-4 rounded-xl hover:bg-emerald-400 transition-all flex justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Save size={20} /> Guardar Carrera
          </button>

        </form>
      </div>
    </div>
  );
}