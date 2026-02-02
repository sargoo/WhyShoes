import { prisma } from '@/lib/prisma';
import { Activity, Footprints, TrendingUp, Zap, Calendar, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function DashboardPage() {
  
  // 1. DATOS DE CABECERA
  const shoes = await prisma.shoe.findMany({
    where: { isActive: true },
    orderBy: { brand: 'asc' }
  });
  
  // 2. DATOS DE ACTIVIDAD (Traemos las últimas 5 con los datos del zapato)
  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      shoe: true // ¡Truco! Esto trae la marca y modelo del zapato asociado
    }
  });

  // 3. CÁLCULOS
  const mainShoe = shoes[0]; 
  const totalUserDistance = await prisma.activity.aggregate({
    _sum: { distance: true }
  });
  
  const kmRecorridos = totalUserDistance._sum.distance || 0;
  const shoeHealth = mainShoe 
    ? Math.round(100 - (mainShoe.totalDistance / mainShoe.maxDistance * 100)) 
    : 0;

  async function deleteActivity(formData: FormData) {
    'use server';
    const activityId = formData.get('activityId') as string;
    const shoeId = formData.get('shoeId') as string;
    const distance = parseFloat(formData.get('distance') as string);

    // 1. Restar los KM a la zapatilla (Devolverle la vida)
    const shoe = await prisma.shoe.findUnique({ where: { id: shoeId } });
    if (shoe) {
        await prisma.shoe.update({
            where: { id: shoeId },
            data: { totalDistance: Math.max(0, shoe.totalDistance - distance) }
        });
    }

    // 2. Borrar la actividad
    await prisma.activity.delete({ where: { id: activityId } });

    // 3. Recargar la pantalla
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/garage'); // También actualizamos el garage
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-sans">
      {/* HEADER */}
      <header className="mb-12 border-b border-slate-800 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-emerald-400">WHY_SHOES <span className="text-white not-italic text-lg font-normal ml-4">| Panel de Control</span></h1>
          <p className="text-slate-500 font-mono text-sm mt-2">TU CENTRO DE COMANDO</p>
        </div>
        <div className="text-right hidden md:block">
           <div className="text-xs font-bold text-slate-500 uppercase">Usuario</div>
           <div className="font-bold">Runner Pro</div>
        </div>
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

      {/* SECCIÓN NUEVA: HISTORIAL DE ACTIVIDADES */}
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
                        <div key={activity.id} className="flex flex-col md:flex-row justify-between items-center bg-slate-950 border border-slate-800 p-4 rounded-2xl hover:border-slate-700 transition-all">
                            
                            {/* Fecha y Datos Principales */}
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

                            {/* Detalles Técnicos */}
                            <div className="flex gap-8 text-sm text-slate-400">
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-600">Tiempo</span>
                                    <span className="text-white font-mono">{(activity.duration / 60).toFixed(0)} min</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] uppercase font-bold text-slate-600">Ritmo</span>
                                    <span className="text-white font-mono">{activity.pace.toFixed(2)}'</span>
                                </div>
                                <div className="hidden md:flex flex-col items-end">
                                    <span className="text-[10px] uppercase font-bold text-slate-600">Zapa</span>
                                    <span className="text-emerald-400 text-xs">{activity.shoe.brand} {activity.shoe.model}</span>
                                </div>
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