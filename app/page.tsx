import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-black italic tracking-tighter text-emerald-500 mb-4">WHY_SHOES</h1>
      <p className="text-xl text-slate-400 mb-8">La ciencia detrás de tu pisada.</p>
      
      <Link href="/dashboard">
        <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-emerald-400 transition-all">
          Ir al Dashboard &rarr;
        </button>
      </Link>
    </div>
  );
}