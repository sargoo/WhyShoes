import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Timer, MapPin, Save } from 'lucide-react';

export default async function RunPage() {
  
  // 1. Buscamos las zapatillas disponibles (Sin filtrar por usuario para asegurar que aparezcan)
  const shoes = await prisma.shoe.findMany({
    where: { isActive: true },
    orderBy: { brand: 'asc' }
  });

  async function createActivity(formData: FormData) {
    'use server';

    const distance = parseFloat(formData.get('distance') as string);
    const duration = parseFloat(formData.get('duration') as string) * 60; // Convertimos a segundos
    const shoeId = formData.get('shoeId') as string;

    if (!shoeId) return; // Si no eligió zapa, no hacemos nada

    // --- EL FIX DEL USUARIO (Igual que en Garage) ---
    let user = await prisma.user.findFirst();
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: "runner@whyshoes.com",
                name: "Runner Pro"
            }
        });
    }
    // -----------------------------------------------

    const pace = (duration / 60) / distance; // Minutos por km

    // 1. Guardar la carrera
    await prisma.activity.create({
      data: {
        distance,
        duration,
        pace,
        shoeId,
        userId: user.id
      }
    });

    // 2. Actualizar la zapatilla (Sumar km)
    // Primero leemos la zapa actual para sumar
    const currentShoe = await prisma.shoe.findUnique({ where: { id: shoeId }});
    
    if (currentShoe) {
        await prisma.shoe.update({
            where: { id: shoeId },
            data: {
                totalDistance: currentShoe.totalDistance + distance
            }
        });
    }

    // 3. Avisar al Dashboard que los datos cambiaron
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/garage');
    
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 flex justify-center items-center">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden">
        
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        <h1 className="text-3xl font-black italic text-emerald-400 mb-2 relative z-10">REGISTRAR_RUN</h1>
        <p className="text-slate-500 text-sm mb-8 relative z-10">Suma kilómetros a tu historial.</p>
        
        <form action={createActivity} className="space-y-6 relative z-10">
          
          {/* Distancia */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Distancia (KM)</label>
            <div className="relative">
                <input 
                name="distance" 
                type="number" 
                step="0.01" 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-2xl font-black text-white focus:border-emerald-500 focus:outline-none"
                placeholder="0.00"
                />
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" size={20}/>
            </div>
          </div>

          {/* Duración */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Duración (Minutos)</label>
            <div className="relative">
                <input 
                name="duration" 
                type="number" 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xl font-bold text-white focus:border-emerald-500 focus:outline-none"
                placeholder="0"
                />
                <Timer className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" size={20}/>
            </div>
          </div>

          {/* Selector de Zapatillas */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">¿Qué usaste?</label>
            <div className="relative">
                <select 
                name="shoeId" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white appearance-none focus:border-emerald-500 focus:outline-none cursor-pointer"
                defaultValue=""
                required
                >
                <option value="" disabled>Selecciona tus zapatillas...</option>
                {shoes.map((shoe) => (
                    <option key={shoe.id} value={shoe.id}>
                    {shoe.brand} {shoe.model} ({shoe.totalDistance} km)
                    </option>
                ))}
                </select>
                {/* Flechita custom */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500">
                    ▼
                </div>
            </div>
            {shoes.length === 0 && (
                <p className="text-xs text-red-400 mt-2">
                    ⚠️ No tienes zapatillas. <a href="/dashboard/garage/new" className="underline">Agrega una aquí</a>.
                </p>
            )}
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-500 text-slate-950 font-black italic uppercase py-4 rounded-xl hover:bg-emerald-400 transition-all flex justify-center gap-2 shadow-lg shadow-emerald-500/20 mt-8"
          >
            <Save size={20} /> Guardar Carrera
          </button>
        </form>
      </div>
    </div>
  );
}