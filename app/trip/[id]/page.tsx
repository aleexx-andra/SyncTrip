'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { genereazaPlanAI } from '@/app/actions'
import PackingList from '../../../components/PackingList'
import Link from 'next/link'

export default function PaginaVacanta() {
  const params = useParams()
  const [nume, setNume] = useState('Se încarcă...')
  const [dataSosire, setDataSosire] = useState('')
  const [numarZile, setNumarZile] = useState(1)
  
  // ✅ State-uri noi pentru Multi-Day
  const [listaDate, setListaDate] = useState<string[]>([])
  const [ziSelectata, setZiSelectata] = useState('')

  const [activitati, setActivitati] = useState<any[]>([])
  const [loadingAI, setLoadingAI] = useState(false)
  const [nouaOra, setNouaOra] = useState('')
  const [nouaDescriere, setNouaDescriere] = useState('')

  async function incarca() {
    const { data: v } = await supabase.from('vacante').select('nume, data_sosire, data_plecare').eq('id', params.id).single()
    
    if (v) {
      setNume(v.nume)
      if (v.data_sosire && v.data_plecare) {
        setDataSosire(v.data_sosire)
        
        // Generăm lista de date între sosire și plecare
        const start = new Date(v.data_sosire)
        const end = new Date(v.data_plecare)
        const dates = []
        let current = new Date(start)
        while (current <= end) {
          dates.push(current.toISOString().split('T')[0])
          current.setDate(current.getDate() + 1)
        }
        setListaDate(dates)
        setNumarZile(dates.length)
        if (!ziSelectata) setZiSelectata(dates[0])
      }
    }

    const { data: act } = await supabase.from('activitati').select('*').eq('trip_id', params.id).order('ora', { ascending: true })
    if (act) setActivitati(act)
  }

  useEffect(() => { incarca() }, [params.id])

  async function adaugaManual(e: React.FormEvent) {
    e.preventDefault()
    if (!nouaOra || !nouaDescriere) return
    // ✅ Salvăm activitatea cu data selectată în coloana 'data_activitate'
    await supabase.from('activitati').insert([{ 
      trip_id: params.id, 
      ora: nouaOra, 
      descriere: nouaDescriere,
      data_activitate: ziSelectata 
    }])
    setNouaOra(''); setNouaDescriere(''); incarca()
  }

  async function handleAI() {
    setLoadingAI(true)
    try {
      // ✅ Colectăm titlurile activităților deja existente în toate zilele pentru a evita repetiția
      const vizitate = activitati.map(a => a.descriere.split('\n')[0])
      
      const sugestii = await genereazaPlanAI(nume, ziSelectata, vizitate)
      
      if (sugestii) {
        // ✅ Ștergem doar activitățile din ziua selectată înainte de a pune cele noi
        await supabase.from('activitati').delete().eq('trip_id', params.id).eq('data_activitate', ziSelectata)
        
        const deInserat = sugestii.map((s: any) => ({
          trip_id: params.id,
          ora: s.ora,
          descriere: s.descriere,
          data_activitate: ziSelectata
        }))
        
        await supabase.from('activitati').insert(deInserat)
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
        <Link href="/" className="text-slate-500 hover:text-white text-sm transition-colors font-medium">← DASHBOARD</Link>
        <h1 className="text-6xl md:text-8xl font-black text-blue-500 mt-4 uppercase tracking-tighter drop-shadow-md">{nume}</h1>
        
        {/* ✅ Selector de date (Calendar horizontal) */}
        <div className="flex gap-3 mt-12 overflow-x-auto pb-4 no-scrollbar">
          {listaDate.map((data) => (
            <button
              key={data}
              onClick={() => setZiSelectata(data)}
              className={`px-5 py-3 rounded-2xl font-bold transition-all whitespace-nowrap flex flex-col items-center min-w-[110px] ${
                ziSelectata === data 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 scale-105' 
                : 'bg-slate-900 text-slate-500 hover:bg-slate-800'
              }`}
            >
              <span className="text-[10px] uppercase tracking-widest opacity-60">
                {new Date(data).toLocaleDateString('ro-RO', { weekday: 'short' })}
              </span>
              <span className="text-lg">
                {new Date(data).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}
              </span>
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-10">
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
            
            <form onSubmit={adaugaManual} className="mb-8 flex gap-2 bg-slate-900/50 p-2 rounded-2xl border border-slate-800 shadow-inner">
              <input placeholder="Ora" value={nouaOra} onChange={(e) => setNouaOra(e.target.value)} className="w-24 bg-slate-800 border-none p-3 rounded-xl text-sm outline-none" />
              <input placeholder="Ex: Vizită la muzeu..." value={nouaDescriere} onChange={(e) => setNouaDescriere(e.target.value)} className="flex-1 bg-slate-800 border-none p-3 rounded-xl text-sm outline-none" />
              <button type="submit" className="bg-slate-700 hover:bg-slate-600 px-5 rounded-xl font-bold transition-colors">+</button>
            </form>

            <div className="space-y-6">
              {/* ✅ Filtrăm activitățile pentru a afișa doar pe cele din ziua selectată */}
              {activitati
                .filter(a => a.data_activitate === ziSelectata)
                .map((a) => {
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
              
              {activitati.filter(a => a.data_activitate === ziSelectata).length === 0 && !loadingAI && (
                <div className="text-center py-24 border-2 border-dashed border-slate-900 rounded-[40px]">
                   <p className="text-slate-600 font-medium italic">Niciun plan pentru această zi.</p>
                </div>
              )}
            </div>
          </section>

          <section className="lg:sticky lg:top-12 self-start">
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