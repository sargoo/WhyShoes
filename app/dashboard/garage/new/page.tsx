import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Save } from 'lucide-react';

export default function NewShoePage() {
  
  async function createShoe(formData: FormData) {
    'use server';

    const brand = formData.get('brand') as string;
    const model = formData.get('model') as string;
    const maxDistance = parseFloat(formData.get('maxDistance') as string) || 800;

    // Buscamos un usuario (temporalmente el primero que encontremos para asignarle la zapa)
    const user = await prisma.user.findFirst();

    if (!user) return; // Si no hay usuario, no hacemos nada (seguridad básica)

    await prisma.shoe.create({
      data: {
        brand,
        model,
        maxDistance,
        userId: user.id,
        currentStatus: "HEALTHY",
        totalDistance: 0
      }
    });

    redirect('/dashboard/garage');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 flex justify-center items-center">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl">
        <h1 className="text-2xl font-black italic text-emerald-400 mb-6">NUEVAS_ZAPAS</h1>
        
        <form action={createShoe} className="space-y-6">
          
          {/* Marca */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Marca</label>
            <select 
              name="brand" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="Adidas">Adidas</option>
              <option value="Nike">Nike</option>
              <option value="New Balance">New Balance</option>
              <option value="Hoka">Hoka</option>
              <option value="Asics">Asics</option>
              <option value="Saucony">Saucony</option>
              <option value="Puma">Puma</option>
            </select>
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Modelo</label>
            <input 
              name="model" 
              type="text" 
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xl font-bold text-white focus:border-emerald-500 focus:outline-none placeholder-slate-700"
              placeholder="Ej: Adios Pro 4"
            />
          </div>

          {/* Vida Útil Estimada */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vida Útil Estimada (KM)</label>
            <input 
              name="maxDistance" 
              type="number" 
              defaultValue={800}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-emerald-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-2">Las zapatillas de competición (carbono) suelen durar menos (400-500km).</p>
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-500 text-slate-950 font-black italic uppercase py-4 rounded-xl hover:bg-emerald-400 transition-all flex justify-center gap-2"
          >
            <Save size={20} /> Guardar en Garage
          </button>
        </form>
      </div>
    </div>
  );
}