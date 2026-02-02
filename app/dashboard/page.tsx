import { prisma } from '@/lib/prisma';
import { Activity, Footprints, TrendingUp, Zap, Calendar, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

// Imports de Autenticación (Seguridad)
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import UserStatus from "./user-status"; // Importamos el componente cliente

export default async function DashboardPage() {
  
  // 0. VERIFICACIÓN DE SESIÓN (Protección)
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/"); // Si no está logueado, lo manda afuera
  }

  // 1. DATOS DE CABECERA
  const shoes = await prisma.shoe.findMany({
    where: { isActive: true },
    orderBy: { brand: 'asc' }
  });
  
  // 2. DATOS DE ACTIVIDAD
  const activities = await prisma.activity.findMany({
    where: { userId: (session.user as any).id }, // OPCIONAL: Filtrar por usuario si quieres privacidad total
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      shoe: true 
    }
  });

  // 3. DATOS DE RÉCORDS
  const longestRun = await prisma.activity.findFirst({
    // where: { userId: (session.user as any).id }, // Descomentar para filtrar por usuario
    orderBy: { distance: 'desc' }, 
    take: 1
  });

  const fastestRun = await prisma.activity.findFirst({
    where: { 
        // userId: (session.user as any).id, // Descomentar para filtrar por usuario
        pace: { gt: 0 } 
    }, 
    orderBy: { pace: 'asc' },   
    take: 1
  });

  // 4. CÁLCULOS
  const mainShoe = shoes[0]; 
  const totalUserDistance = await prisma.activity.aggregate({
    // where: { userId: (session.user as any).id }, // Descomentar para filtrar por usuario
    _sum: { distance: true }
  });
  
  const kmRecorridos = totalUserDistance._sum.distance || 0;
  
  const shoeHealth = mainShoe && mainShoe.maxDistance > 0
    ? Math.round(100 - (mainShoe.totalDistance / mainShoe.maxDistance * 100)) 
    : 0;

  // 5. SERVER ACTION: BORRAR ACTIVIDAD
  async function deleteActivity(formData: FormData) {
    'use server';
    const activityId = formData.get('activityId') as string;
    const shoeId = formData.get('shoeId') as string;
    const distance = parseFloat(formData.get('distance') as string);

    // 1. Restar los KM a la zapatilla
    if (shoeId) {
        const shoe = await prisma.shoe.findUnique({ where: { id: shoeId } });
        if (shoe) {
            await prisma.shoe.update({
                where: { id: shoeId },
                data: { totalDistance: Math.max(0, shoe.totalDistance - distance) }
            });
        }
    }

    // 2. Borrar la actividad
    await prisma.activity.delete({ where: { id: activityId } });

    // 3. Recargar pantallas
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/garage');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-sans">
      {/* HEADER */}
      <header className="mb-12 border-b border-slate-800 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-emerald-400">WHY_SHOES <span className="text-white not-italic text-lg font-normal ml-4">| Panel de Control</span></h1>
          <p className="text-slate-500 font-mono text-sm mt-2">TU CENTRO DE COMANDO</p>
        </div>
        
        {/* Aquí inyectamos el componente de Cliente con el nombre real */}
        <UserStatus name={session.user?.name} />
      
      </header>

      {/* GRID SUPERIOR (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        {/* CARD 1: META TOTAL */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-emerald-500/50 transition-all">
          <div className="flex justify-between mb-4">
            <TrendingUp className="text-emerald-400" />
            <span className="text-xs font-bold uppercase text-slate-500">Distancia Total</span>
          </div>
          <div className="text-5xl font-black italic">{kmRecorridos.toFixed(1)} <span className="text-sm text-slate-400 not-italic">km</span></div>
          <div className="w-full bg-slate-800 h-2 mt-4 rounded-full"><div className="w-1/4 bg-emerald-500 h-2 rounded-full"></div></div>
        </div>

        {/* CARD 2: TENIS ACTUALES */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-blue-500/50 transition-all group">
          <div className="flex justify-between mb-4">
            <Footprints className="text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase text-slate-500">Calzado Principal</span>
          </div>
          
          {mainShoe ? (
            <>
              <div className="text-2xl font-bold">{mainShoe.brand} {mainShoe.model}</div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Vida Útil</span>
                  <span className={shoeHealth < 20 ? "text-red-500" : "text-emerald-400"}>{shoeHealth}% Restante</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${shoeHealth < 20 ? "bg-red-500" : "bg-blue-400"}`} 
                      style={{ width: `${Math.max(shoeHealth, 0)}%` }}
                    />
                </div>
              </div>
            </>
          ) : (
             <div className="text-slate-500">No hay tenis activos</div>
          )}
        </div>

        {/* CARD 3: RITMO ÚLTIMO */}
        <div className="bg-emerald-500 p-6 rounded-3xl text-slate-950 flex flex-col justify-between">
           <Zap className="text-slate-900" />
           <div>
             <span className="text-xs font-bold uppercase opacity-60">Último Ritmo</span>
             <div className="text-4xl font-black italic">
               {activities[0] ? `${activities[0].pace.toFixed(2)}'` : "--'--''"}
             </div>
             <p className="text-xs font-bold mt-1">Min / KM</p>
           </div>
        </div>

      </div>

      {/* SECCIÓN RÉCORDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Récord de Distancia */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp size={60} className="text-yellow-500" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Distancia Máx</p>
                <div className="text-2xl font-black italic text-yellow-400">
                    {longestRun ? `${longestRun.distance} KM` : '--'}
                </div>
                <p className="text-[10px] text-slate-600 mt-1">
                    {longestRun ? new Date(longestRun.createdAt).toLocaleDateString() : 'Sin datos'}
                </p>
            </div>

            {/* Récord de Velocidad */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Zap size={60} className="text-purple-500" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Mejor Ritmo</p>
                <div className="text-2xl font-black italic text-purple-400">
                    {fastestRun ? `${fastestRun.pace.toFixed(2)}'` : '--'}
                </div>
                <p className="text-[10px] text-slate-600 mt-1">Min / KM</p>
            </div>
      </div>

      {/* SECCIÓN INFERIOR: HISTORIAL DE ACTIVIDADES */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* COLUMNA IZQUIERDA: MENÚ RÁPIDO */}
        <div className="space-y-4">
            <Link href="/dashboard/run">
                <button className="w-full bg-white text-black py-4 rounded-xl font-black italic tracking-tighter hover:bg-emerald-400 transition-colors uppercase shadow-lg shadow-white/10">
                Registrar Carrera +
                </button>
            </Link>
            <Link href="/dashboard/garage">
                <button className="w-full bg-slate-900 border border-slate-800 text-slate-300 py-4 rounded-xl font-bold hover:border-emerald-500 hover:text-white transition-all uppercase">
                Ver Mi Garage &rarr;
                </button>
            </Link>
        </div>
      
        {/* COLUMNA DERECHA: TABLA DE CARRERAS */}
        <div className="lg:col-span-3 bg-slate-900/30 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="text-emerald-500" size={20}/> Actividad Reciente
            </h3>

            <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Aún no has registrado carreras.</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex flex-col md:flex-row justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:border-slate-700 transition-all group">
                  
                  {/* IZQUIERDA: DATOS */}
                  <div className="flex items-center gap-4 mb-2 md:mb-0 w-full md:w-auto">
                    <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-500">
                      <Activity size={24} />
                    </div>
                    <div>
                      <div className="text-lg font-black italic">{activity.distance} KM</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* DERECHA: DETALLES Y BOTÓN DE BORRAR */}
                  <div className="flex items-center gap-6">
                    
                    <div className="flex gap-4 text-sm text-slate-400">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase font-bold text-slate-600">Ritmo</span>
                        <span className="text-white font-mono">{activity.pace.toFixed(2)}'</span>
                      </div>
                      <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold text-slate-600">Zapa</span>
                        <span className={`text-xs ${activity.shoe ? 'text-emerald-400' : 'text-slate-600 italic'}`}>
                            {activity.shoe ? `${activity.shoe.brand} ${activity.shoe.model}` : 'Zapa retirada'}
                        </span>
                      </div>
                    </div>

                    <form action={deleteActivity}>
                        <input type="hidden" name="activityId" value={activity.id} />
                        <input type="hidden" name="shoeId" value={activity.shoeId || ''} />
                        <input type="hidden" name="distance" value={activity.distance} />
                        
                        <button 
                            type="submit" 
                            className="bg-slate-800 p-3 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                            title="Borrar Carrera"
                        >
                            <Trash2 size={20} />
                        </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}