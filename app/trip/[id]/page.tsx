'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { genereazaPlanAI } from '@/app/actions'
import PackingList from '../../../components/PackingList' // Cale directă, conform structurii tale
import Link from 'next/link'


export default function PaginaVacanta() {
  const params = useParams()
  const [nume, setNume] = useState('Se încarcă...')
  // ✅ State-uri noi pentru calculele AI-ului
  const [dataSosire, setDataSosire] = useState('')
  const [numarZile, setNumarZile] = useState(1)

  const [activitati, setActivitati] = useState<any[]>([])
  const [loadingAI, setLoadingAI] = useState(false)
  const [nouaOra, setNouaOra] = useState('')
  const [nouaDescriere, setNouaDescriere] = useState('')


  async function incarca() {
    // ✅ Selectăm și noile coloane data_sosire și data_plecare
    const { data: v } = await supabase.from('vacante').select('nume, data_sosire, data_plecare').eq('id', params.id).single()
    
    if (v) {
      setNume(v.nume)
      
      // ✅ Calculăm numărul de zile dacă avem ambele date
      if (v.data_sosire && v.data_plecare) {
        setDataSosire(v.data_sosire)
        const start = new Date(v.data_sosire)
        const end = new Date(v.data_plecare)
        const diferenta = end.getTime() - start.getTime()
        const zileTotal = Math.ceil(diferenta / (1000 * 3600 * 24)) + 1
        setNumarZile(zileTotal)
      }
    }

    const { data: act } = await supabase.from('activitati').select('*').eq('trip_id', params.id).order('ora', { ascending: true })
    if (act) setActivitati(act)
  }

  useEffect(() => { incarca() }, [params.id])


  async function adaugaManual(e: React.FormEvent) {
    e.preventDefault()
    if (!nouaOra || !nouaDescriere) return
    await supabase.from('activitati').insert([{ trip_id: params.id, ora: nouaOra, descriere: nouaDescriere }])
    setNouaOra(''); setNouaDescriere(''); incarca()
  }

  
  async function handleAI() {
    setLoadingAI(true)
    try {
      const sugestii = await genereazaPlanAI(nume)
      if (sugestii) {
        await supabase.from('activitati').delete().eq('trip_id', params.id)
        
        for (const s of sugestii) {
          await supabase.from('activitati').insert([{ trip_id: params.id, ora: s.ora, descriere: s.descriere }])
        }
        await incarca()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingAI(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <Link href="/" className="text-slate-500 hover:text-white text-sm transition-colors font-medium">← DASHBOARD</Link>
        <h1 className="text-6xl md:text-8xl font-black text-blue-500 mt-4 uppercase tracking-tighter drop-shadow-md">{nume}</h1>
        
        {/* ✅ Afișăm perioada și durata calculată sub titlu */}
        {dataSosire && (
          <p className="mt-2 text-slate-400 font-mono text-sm">
            CĂLĂTORIE DE {numarZile} ZILE
          </p>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-16">
          
          {/* SECȚIUNEA ITINERAR */}
          <section>
            <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-3">
                  <span className="text-3xl">📅</span>
                  <h2 className="text-2xl font-black text-slate-100 tracking-tight uppercase">Itinerar</h2>
               </div>
               <button 
                onClick={handleAI} 
                disabled={loadingAI} 
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-lg active:scale-95 disabled:opacity-50"
               >
                 {loadingAI ? "SE GENEREAZĂ..." : "✨ PLAN AI"}
               </button>
            </div>
            
            {/* Formular Adăugare Manuală */}
            <form onSubmit={adaugaManual} className="mb-8 flex gap-2 bg-slate-900/50 p-2 rounded-2xl border border-slate-800 shadow-inner">
              <input 
                placeholder="Ora" 
                value={nouaOra} 
                onChange={(e) => setNouaOra(e.target.value)} 
                className="w-24 bg-slate-800 border-none p-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-500" 
              />
              <input 
                placeholder="Ex: Vizită la muzeu..." 
                value={nouaDescriere} 
                onChange={(e) => setNouaDescriere(e.target.value)} 
                className="flex-1 bg-slate-800 border-none p-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-500" 
              />
              <button type="submit" className="bg-slate-700 hover:bg-slate-600 px-5 rounded-xl font-bold transition-colors">+</button>
            </form>

            {/* Lista de Carduri Activități */}
            <div className="space-y-6">
              {activitati.map((a) => {
                const isExtra = a.ora.toLowerCase() === "extra";
                const linii = a.descriere.split('\n');
                const titlu = linii[0];
                const restulDetaliilor = linii.slice(1).join('\n');

                return (
                  <div key={a.id} className="p-7 bg-slate-900/40 border border-slate-800 rounded-[32px] hover:border-blue-500/20 transition-all group shadow-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
                      <span className="text-blue-400 font-black text-[11px] tracking-[0.25em] uppercase">{a.ora}</span>
                    </div>

                    {isExtra ? (
                      <div className="text-slate-400 text-[16px] whitespace-pre-line leading-relaxed font-medium">
                        {a.descriere}
                      </div>
                    ) : (
                      <>
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight leading-tight">
                          {titlu}
                        </h3>
                        {restulDetaliilor && (
                          <p className="text-slate-400 text-[15px] whitespace-pre-line leading-relaxed font-medium">
                            {restulDetaliilor}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
              
              {activitati.length === 0 && !loadingAI && (
                <div className="text-center py-24 border-2 border-dashed border-slate-900 rounded-[40px]">
                   <p className="text-slate-600 font-medium italic">Niciun plan momentan. Lasă AI-ul să te ajute!</p>
                </div>
              )}
            </div>
          </section>

          {/* SECȚIUNEA PACKING LIST */}
          <section className="lg:sticky lg:top-12 self-start">
             {/* ✅ Trimitem dataSosire și numarZile către componentă */}
             <PackingList 
                tripId={params.id as string} 
                tripName={nume} 
                dataSosire={dataSosire} 
                numarZile={numarZile} 
             />
          </section>
          
        </div>
      </div>
    </main>
  )
}