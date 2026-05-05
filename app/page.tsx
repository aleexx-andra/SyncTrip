'use client'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import HeroSection from "../components/HeroSection";
import { useSearchParams, useRouter } from 'next/navigation'

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter(); 
  const skipIntro = searchParams.get('skip') === 'true';

  const [showHub, setShowHub] = useState(false);
  const [numeNou, setNumeNou] = useState('')
  const [dataSosire, setDataSosire] = useState('')
  const [dataPlecare, setDataPlecare] = useState('')
  const [vacante, setVacante] = useState<any[]>([])

  useEffect(() => {
    if (skipIntro) {
      setShowHub(true);
    }
  }, [skipIntro]);

  async function incarcaVacante() {
    const { data } = await supabase.from('vacante').select('*').order('created_at', { ascending: false })
    if (data) setVacante(data)
  }

  useEffect(() => { incarcaVacante() }, [])

  async function stergeVacanta(id: string) {
    if (!confirm("Ești sigur că vrei să ștergi această vacanță?")) return;
    const { error } = await supabase.from('vacante').delete().eq('id', id);
    if (!error) setVacante(vacante.filter(v => v.id !== id));
  }

  async function adauga(e: React.FormEvent) {
    e.preventDefault()
    if (!numeNou || !dataSosire || !dataPlecare) return;
    const { error } = await supabase.from('vacante').insert([{ nume: numeNou, data_sosire: dataSosire, data_plecare: dataPlecare }])
    if (!error) { setNumeNou(''); setDataSosire(''); setDataPlecare(''); incarcaVacante() }
  }

  const button3D = "bg-[#86C5FF] text-[#2E5AA7] border-2 border-[#2E5AA7] shadow-[0_4px_0_0_#2E5AA7] hover:shadow-none hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all font-black uppercase tracking-widest";

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#DFF1F1]">
      
      {!skipIntro && <HeroSection onNavigate={() => setShowHub(true)} />}

      <AnimatePresence>
        {showHub && (
          <motion.main 
            initial={skipIntro ? { y: 0 } : { y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] min-h-screen bg-[#DFF1F1] flex flex-col items-center overflow-y-auto"
          >
           {/* --- BARA DE NAVIGARE --- */}
            <nav className="w-full flex justify-between items-center pl-10 pr-6 shrink-0 py-6">
                <img src="/logo.svg" alt="Logo" className="w-14" />
                <div className="flex gap-8 font-bold text-[11px] uppercase text-gray-800 tracking-widest">
                    <Link href="/home" className="cursor-pointer hover:opacity-50 transition-opacity">Home</Link>
                    <Link href="/AboutUs" className="cursor-pointer hover:opacity-50 transition-opacity">About Us</Link>
                    <Link href="/FaQ" className="cursor-pointer hover:opacity-50 transition-opacity">FAQ</Link>
                    
                    {/* MODIFICARE: Legătura către Contact activată */}
                    <Link href="/contact" className="cursor-pointer hover:opacity-50 transition-opacity">
                      Contact
                    </Link>
                </div>
            </nav>

            {/* --- CONȚINUT HUB --- */}
            <div className="w-full flex flex-col items-center p-6 md:p-10 pt-4">
                <h1 className="text-4xl md:text-5xl font-black text-[#2E5AA7] mb-10 tracking-tighter uppercase text-center">
                  SyncTrip 
                </h1>
                
                <form onSubmit={adauga} className="flex flex-col gap-4 mb-10 w-full max-w-md bg-white/50 p-6 rounded-3xl border-2 border-[#2E5AA7] shadow-sm">
                  <input 
                    type="text" 
                    value={numeNou} 
                    onChange={(e) => setNumeNou(e.target.value)} 
                    placeholder="Destinație..." 
                    className="w-full p-3 rounded-xl bg-white border-2 border-[#2E5AA7]/30 outline-none focus:border-[#2E5AA7] text-[#2E5AA7] placeholder-[#2E5AA7]/50 transition-all font-bold" 
                  />
                  <div className="flex gap-4">
                     <input type="date" value={dataSosire} onChange={(e) => setDataSosire(e.target.value)} className="flex-1 p-3 rounded-xl bg-white border-2 border-[#2E5AA7]/30 outline-none text-[#2E5AA7] font-bold text-sm focus:border-[#2E5AA7]" />
                     <input type="date" value={dataPlecare} onChange={(e) => setDataPlecare(e.target.value)} className="flex-1 p-3 rounded-xl bg-white border-2 border-[#2E5AA7]/30 outline-none text-[#2E5AA7] font-bold text-sm focus:border-[#2E5AA7]" />
                  </div>
                  
                  <button type="submit" className={`${button3D} py-4 rounded-xl`}>
                    Creează Vacanța
                  </button>

                  <button type="button" onClick={() => router.push('/home')} className="text-[#2E5AA7] text-xs mt-2 underline cursor-pointer font-bold opacity-70 hover:opacity-100 transition-opacity text-center">
                    Înapoi la meniu
                  </button>
                </form>

                <div className="w-full max-w-md space-y-4 pb-20">
                  {vacante.map((v) => (
                    <div key={v.id} className="p-5 bg-[#F5F5F5] rounded-2xl border-2 border-[#2E5AA7] flex justify-between items-center shadow-[0_4px_0_0_rgba(46,90,167,0.1)] hover:shadow-none transition-all">
                      <div className="flex flex-col">
                        <span className="font-black text-xl text-[#2E5AA7] uppercase tracking-tight">{v.nume}</span>
                        <span className="text-[11px] text-[#021A54] font-mono font-bold">{v.data_sosire} → {v.data_plecare}</span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <button onClick={() => stergeVacanta(v.id)} className="p-2 text-[#2E5AA7]/40 hover:text-red-500 transition-colors text-xl">
                          🗑️
                        </button>
                        <Link href={`/trip/${v.id}`} className={`${button3D} px-5 py-2 rounded-lg text-[10px]`}>
                          Detalii
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  )
}