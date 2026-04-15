'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { genereazaPlanAI, genereazaBagajAI } from '@/app/actions'
import PackingList from '../../../components/PackingList'
import Link from 'next/link'

export default function PaginaVacanta() {
  const params = useParams()
  const [nume, setNume] = useState('Se încarcă...')
  const [dataSosire, setDataSosire] = useState('')
  const [numarZile, setNumarZile] = useState(1)
  const [listaDate, setListaDate] = useState<string[]>([])
  const [ziSelectata, setZiSelectata] = useState('')
  const [activitati, setActivitati] = useState<any[]>([])
  const [loadingAI, setLoadingAI] = useState(false)
  const [nouaOra, setNouaOra] = useState('')
  const [nouaDescriere, setNouaDescriere] = useState('')

  // ✅ STATE ACTUALIZAT CU MIN/MAX
  const [vreme, setVreme] = useState<{ temp: number; min: number; max: number; ploaie: number; hourly: any[] } | null>(null)

  async function incarca() {
    const { data: v } = await supabase.from('vacante').select('nume, data_sosire, data_plecare').eq('id', params.id).single()
    if (v) {
      setNume(v.nume)
      if (v.data_sosire && v.data_plecare) {
        setDataSosire(v.data_sosire)
        const start = new Date(v.data_sosire); const end = new Date(v.data_plecare);
        const dates = []; let curr = new Date(start);
        while (curr <= end) { dates.push(curr.toISOString().split('T')[0]); curr.setDate(curr.getDate() + 1); }
        setListaDate(dates); setNumarZile(dates.length);
        if (!ziSelectata) setZiSelectata(dates[0]);
      }
    }
    const { data: act } = await supabase.from('activitati').select('*').eq('trip_id', params.id).order('ora', { ascending: true })
    if (act) setActivitati(act)
  }

  // ✅ FETCH VREME CALIBRAT (Precizie mai mare)
  async function fetchVreme(oras: string, dataISO: string) {
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${oras}&count=1`);
      const geoData = await geoRes.json();
      if (!geoData.results) return;
      const { latitude, longitude } = geoData.results[0];
      
      const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&start_date=${dataISO}&end_date=${dataISO}`);
      const wData = await wRes.json();
      
      if (wData.daily && wData.hourly) {
        const oreRelevante = [9, 12, 15, 18, 21];
        const prognozaOre = oreRelevante.map(ora => ({
          ora: ora + ":00",
          temp: Math.round(wData.hourly.temperature_2m[ora])
        }));

        setVreme({
          temp: Math.round(wData.hourly.temperature_2m[14]), // Temperatura la amiază pentru acuratețe vizuală
          max: Math.round(wData.daily.temperature_2m_max[0]),
          min: Math.round(wData.daily.temperature_2m_min[0]),
          ploaie: wData.daily.precipitation_probability_max[0],
          hourly: prognozaOre
        });
      }
    } catch (e) { console.error(e); }
  }

  useEffect(() => { incarca() }, [params.id])
  useEffect(() => { if (nume !== 'Se încarcă...' && ziSelectata) fetchVreme(nume, ziSelectata); }, [nume, ziSelectata]);

  async function adaugaManual(e: React.FormEvent) {
    e.preventDefault(); if (!nouaOra || !nouaDescriere) return;
    await supabase.from('activitati').insert([{ trip_id: params.id, ora: nouaOra, descriere: nouaDescriere, data_activitate: ziSelectata }]);
    setNouaOra(''); setNouaDescriere(''); incarca();
  }

  async function handleAI() {
    setLoadingAI(true);
    try {
      const vizitate = activitati.map(a => a.descriere.split('\n')[0]);
      const sugestii = await genereazaPlanAI(nume, ziSelectata, vizitate);
      if (sugestii) {
        await supabase.from('activitati').delete().eq('trip_id', params.id).eq('data_activitate', ziSelectata);
        const deInserat = sugestii.map((s: any) => ({ trip_id: params.id, ora: s.ora, descriere: s.descriere, data_activitate: ziSelectata }));
        await supabase.from('activitati').insert(deInserat);
        await incarca();
      }
    } catch (err) { console.error(err); } finally { setLoadingAI(false); }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="text-slate-500 hover:text-white text-sm transition-colors font-medium">← DASHBOARD</Link>
        
        {/* HEADER SECTION REPARAT */}
        <div className="flex flex-col lg:flex-row justify-between items-start mt-6 gap-6">
          <div className="flex-1">
            {/* ✅ Milano mai mic (text-5xl la 7xl) */}
            <h1 className="text-6xl md:text-8xl font-black text-blue-500 uppercase tracking-tighter leading-none drop-shadow-2xl">{nume}</h1>
            
            {/* Text Vacanta de X zile */}
            <div className="flex items-center gap-3 mt-4 ml-1">
              <div className="h-[2px] w-8 bg-blue-500/50"></div>
              <p className="text-slate-400 font-black tracking-[0.4em] uppercase text-[12px] italic opacity-80">
                Vacanță de {numarZile} zile
              </p>
            </div>
          </div>

          {/* ✅ CARD VREME MAI LUNG (înălțime) ȘI CU MIN/MAX */}
          {vreme && (
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[32px] flex flex-col gap-6 backdrop-blur-md shadow-2xl min-w-[360px] border-white/5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                   <span className="text-5xl">{vreme.ploaie > 30 ? '🌧️' : '☀️'}</span>
                   <div>
                     <p className="text-4xl font-black text-white">{vreme.temp}°C</p>
                     {/* ✅ Min și Max adăugate sub temperatura principală */}
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-1">
                        MAX: <span className="text-white">{vreme.max}°</span> | MIN: <span className="text-white">{vreme.min}°</span>
                     </p>
                   </div>
                </div>
                <div className="bg-blue-500/10 px-4 py-2 rounded-2xl border border-blue-500/20 text-center">
                   <p className="text-blue-400 font-black text-xl leading-none">{vreme.ploaie}%</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Ploaie</p>
                </div>
              </div>
              
              <div className="flex justify-between px-1 border-t border-white/5 pt-4">
                {vreme.hourly.map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <span className="text-[9px] text-slate-500 font-bold">{h.ora}</span>
                    <div className="w-1 h-3 bg-blue-500/30 rounded-full overflow-hidden flex items-end">
                       <div className="bg-blue-500 w-full" style={{ height: `${(h.temp / vreme.max) * 100}%` }}></div>
                    </div>
                    <span className="text-[13px] font-black text-slate-200">{h.temp}°</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* ✅ DISTANȚA MICȘORATĂ AICI (mt-6 în loc de mt-12) */}
        <div className="flex gap-3 mt-6 overflow-x-auto pb-4 no-scrollbar">
          {listaDate.map((data) => (
            <button key={data} onClick={() => setZiSelectata(data)} className={`px-5 py-3 rounded-2xl font-bold transition-all flex flex-col items-center min-w-[110px] ${ziSelectata === data ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-slate-900/40 text-slate-500 hover:bg-slate-800'}`}>
              <span className="text-[10px] uppercase opacity-60 font-black tracking-widest">{new Date(data).toLocaleDateString('ro-RO', { weekday: 'short' })}</span>
              <span className="text-lg">{new Date(data).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}</span>
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-8">
          <section>
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-black text-slate-100 tracking-tight uppercase">Itinerar</h2>
               <button onClick={handleAI} disabled={loadingAI} className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-2xl font-bold text-xs transition-all shadow-lg active:scale-95 disabled:opacity-50">✨ PLAN AI</button>
             </div>
             <form onSubmit={adaugaManual} className="mb-8 flex gap-2 bg-slate-900/50 p-2 rounded-2xl border border-slate-800 shadow-inner">
                <input placeholder="Ora" value={nouaOra} onChange={(e) => setNouaOra(e.target.value)} className="w-24 bg-slate-800 border-none p-3 rounded-xl text-sm outline-none" />
                <input placeholder="Ex: Vizită la muzeu..." value={nouaDescriere} onChange={(e) => setNouaDescriere(e.target.value)} className="flex-1 bg-slate-800 border-none p-3 rounded-xl text-sm outline-none" />
                <button type="submit" className="bg-slate-700 hover:bg-slate-600 px-5 rounded-xl font-bold transition-colors">+</button>
             </form>
             <div className="space-y-6">
                {activitati.filter(a => a.data_activitate === ziSelectata).map(a => {
                   const isExtra = a.ora.toLowerCase() === "extra";
                   const linii = a.descriere.split('\n'); const titlu = linii[0]; const rest = linii.slice(1).join('\n');
                   return (
                     <div key={a.id} className="p-7 bg-slate-900/40 border border-slate-800 rounded-[32px] shadow-xl hover:border-blue-500/20 transition-all">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
                          <span className="text-blue-400 font-black text-[11px] tracking-[0.25em] uppercase">{a.ora}</span>
                        </div>
                        {isExtra ? (
                          <div className="text-slate-400 text-[16px] whitespace-pre-line leading-relaxed font-medium italic">{a.descriere}</div>
                        ) : (
                          <>
                            <h3 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight leading-tight">{titlu}</h3>
                            {rest && <p className="text-slate-400 text-[15px] whitespace-pre-line leading-relaxed font-medium">{rest}</p>}
                          </>
                        )}
                     </div>
                   )
                })}
             </div>
          </section>

          <section className="lg:sticky lg:top-12 self-start">
             <PackingList tripId={params.id as string} tripName={nume} dataSosire={dataSosire} numarZile={numarZile} />
          </section>
        </div>
      </div>
    </main>
  )
}