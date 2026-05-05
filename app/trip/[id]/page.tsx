'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { genereazaPlanAI, genereazaBagajAI, genereazaTransportAI } from '@/app/actions'
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

  const [loadingTransport, setLoadingTransport] = useState(false)
  const [transportInfo, setTransportInfo] = useState<any>(null)

  const [vreme, setVreme] = useState<{ temp: number; min: number; max: number; ploaie: number; hourly: any[] } | null>(null)

  const button3D = "bg-[#86C5FF] text-[#2E5AA7] border-2 border-[#2E5AA7] shadow-[0_4px_0_0_#2E5AA7] hover:shadow-none hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all font-black uppercase tracking-widest";

  async function obtineTransportAI(oras: string) {
    if (!oras || oras === 'Se încarcă...') return;
    setLoadingTransport(true);
    try {
      const { data: v } = await supabase.from('vacante').select('transport_info').eq('id', params.id).single();
      if (v?.transport_info) {
        setTransportInfo(v.transport_info);
      } else {
        const dateAI = await genereazaTransportAI(oras);
        setTransportInfo(dateAI);
        await supabase.from('vacante').update({ transport_info: dateAI }).eq('id', params.id);
      }
    } catch (e) { console.error(e); } finally { setLoadingTransport(false); }
  }

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
      obtineTransportAI(v.nume);
    }
    const { data: act } = await supabase.from('activitati').select('*').eq('trip_id', params.id).order('ora', { ascending: true })
    if (act) setActivitati(act)
  }

  async function fetchVreme(oras: string, dataISO: string) {
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${oras}&count=1`);
      const geoData = await geoRes.json();
      if (!geoData.results) return;
      const { latitude, longitude } = geoData.results[0];
      const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&start_date=${dataISO}&end_date=${dataISO}&models=best_match`);
      const wData = await wRes.json();
      if (wData.daily && wData.hourly) {
        const oreRelevante = [9, 12, 15, 18, 21];
        const prognozaOre = oreRelevante.map(ora => ({
          ora: ora + ":00",
          temp: Math.round(wData.hourly.temperature_2m[ora])
        }));
        setVreme({
          temp: Math.round(wData.hourly.temperature_2m[14]),
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
    <main className="min-h-screen bg-[#DFF1F1] text-[#2E5AA7] flex flex-col overflow-y-auto font-sans">
      
      <nav className="w-full flex justify-between items-center pl-10 pr-6 shrink-0 py-6">
          <img src="/logo.svg" alt="Logo" className="w-14" />
          <div className="flex gap-8 font-bold text-[11px] uppercase text-gray-800 tracking-widest">
              <Link href="/home" className="hover:opacity-50 transition-opacity">Home</Link>
              <Link href="/AboutUs" className="hover:opacity-50 transition-opacity cursor-pointer">About Us</Link>
              <Link href="/FaQ" className="hover:opacity-50 transition-opacity cursor-pointer">FAQ</Link>
              <Link href="/contact" className="hover:opacity-50 transition-opacity cursor-pointer">Contact</Link>
          </div>
      </nav>

      <div className="w-full px-10 py-6">
        <Link href="/?skip=true" className="text-[#2E5AA7] hover:underline text-[10px] font-black tracking-widest uppercase">
          ← ÎNAPOI LA DASHBOARD
        </Link>
        
        {/* TITLU + SUBTITLU */}
        <div className="mt-6">
          <h1 className="text-6xl md:text-8xl font-black text-[#0D1A63] uppercase tracking-tighter leading-none drop-shadow-sm">
            {nume}
          </h1>
          <div className="flex items-center gap-3 mt-4 ml-1">
            <div className="h-[3px] w-12 bg-[#2E5AA7]"></div>
            <p className="text-[#2E5AA7] font-black tracking-[0.4em] uppercase text-[12px] italic">
              Vacanță de {numarZile} zile
            </p>
          </div>
        </div>

        {/* VREME (MUTATĂ ȘI LIMITATĂ CA LUNGIME) */}
        {vreme && (
          <div className="mt-8 mb-4">
            <div className="bg-white/60 border-2 border-[#2E5AA7] p-4 px-8 rounded-[32px] flex flex-row items-center gap-8 shadow-[0_4px_0_0_#2E5AA7] w-fit lg:min-w-[650px]">
              <div className="flex items-center gap-4 border-r-2 border-[#2E5AA7]/10 pr-6">
                <span className="text-5xl">{vreme.ploaie > 30 ? '🌧️' : '☀️'}</span>
                <div>
                  <p className="text-4xl font-black text-[#2E5AA7] leading-none">{vreme.temp}°C</p>
                  <p className="text-[10px] text-[#2E5AA7]/70 font-black uppercase tracking-wider mt-1 whitespace-nowrap">
                    MAX: {vreme.max}° | MIN: {vreme.min}°
                  </p>
                </div>
              </div>

              <div className="flex flex-1 justify-between gap-4">
                {vreme.hourly.map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] text-[#2E5AA7]/50 font-bold">{h.ora}</span>
                    <div className="w-1.5 h-4 bg-[#86C5FF] rounded-full border border-[#2E5AA7]/20"></div>
                    <span className="text-[13px] font-black text-[#2E5AA7]">{h.temp}°</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#86C5FF] px-5 py-2 rounded-2xl border-2 border-[#2E5AA7] text-center min-w-[80px]">
                <p className="text-[#2E5AA7] font-black text-xl leading-none">{vreme.ploaie}%</p>
                <p className="text-[9px] text-[#2E5AA7] font-bold uppercase mt-1">Ploaie</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-3 mt-6 overflow-x-auto pb-4 no-scrollbar">
          {listaDate.map((data) => (
            <button key={data} onClick={() => setZiSelectata(data)} className={`px-5 py-3 rounded-2xl font-bold transition-all flex flex-col items-center min-w-[110px] border-2 ${ziSelectata === data ? 'bg-[#86C5FF] text-[#2E5AA7] border-[#2E5AA7] shadow-[0_4px_0_0_#2E5AA7]' : 'bg-white/40 text-[#2E5AA7]/40 border-transparent hover:border-[#2E5AA7]/20'}`}>
              <span className="text-[10px] uppercase font-black tracking-widest">{new Date(data).toLocaleDateString('ro-RO', { weekday: 'short' })}</span>
              <span className="text-lg">{new Date(data).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}</span>
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-8">
          <section>
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-black text-[#0D1A63] tracking-tight uppercase">Itinerar</h2>
               <button onClick={handleAI} disabled={loadingAI} className={`${button3D} px-6 py-2 text-[10px] rounded-full`}>✨ PLAN AI</button>
             </div>
             
             <form onSubmit={adaugaManual} className="mb-8 flex gap-2 bg-[#F5F5F5] p-2 rounded-2xl border-2 border-[#2E5AA7]">
                <input placeholder="Ora" value={nouaOra} onChange={(e) => setNouaOra(e.target.value)} className="w-24 bg-white border-2 border-[#2E5AA7]/20 p-3 rounded-xl text-sm outline-none focus:border-[#2E5AA7] font-bold text-[#2E5AA7]" />
                <input placeholder="Ex: Vizită la muzeu..." value={nouaDescriere} onChange={(e) => setNouaDescriere(e.target.value)} className="flex-1 bg-white border-2 border-[#2E5AA7]/20 p-3 rounded-xl text-sm outline-none focus:border-[#2E5AA7] font-bold text-[#2E5AA7]" />
                <button type="submit" className={`${button3D} px-5 rounded-xl`}>+</button>
             </form>

             <div className="space-y-6">
                {activitati.filter(a => a.data_activitate === ziSelectata).map(a => {
                   const isExtra = a.ora.toLowerCase() === "extra";
                   const linii = a.descriere.split('\n'); const titlu = linii[0]; const rest = linii.slice(1).join('\n');
                   return (
                     <div key={a.id} className="p-7 bg-[#F5F5F5] border-2 border-[#2E5AA7] rounded-[32px] shadow-[0_4px_0_0_rgba(46,90,167,0.1)] hover:shadow-none transition-all">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#86C5FF] border-2 border-[#0D1A63]"></div>
                          <span className="text-[#0D1A63] font-black text-[11px] tracking-[0.25em] uppercase">{a.ora}</span>
                        </div>
                        {isExtra ? (
                          <div className="text-[#0D1A63]/70 text-[16px] whitespace-pre-line leading-relaxed font-bold italic">{a.descriere}</div>
                        ) : (
                          <>
                            <h3 className="text-2xl md:text-3xl font-black text-[#0D1A63] mb-4 tracking-tight leading-tight uppercase">{titlu}</h3>
                            {rest && <p className="text-[#0D1A63]/80 text-[15px] whitespace-pre-line leading-relaxed font-bold">{rest}</p>}
                          </>
                        )}
                     </div>
                   )
                })}
             </div>
          </section>

          <section className="lg:sticky lg:top-12 self-start flex flex-col gap-8">
             <PackingList tripId={params.id as string} tripName={nume} dataSosire={dataSosire} numarZile={numarZile} />
             <div className="bg-[#F5F5F5] rounded-[32px] p-7 border-2 border-[#2E5AA7] shadow-[0_4px_0_0_#2E5AA7] text-[#0D1A63]">
                <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                    <span className="text-2xl">🚕</span> Transport Local {nume}
                </h2>
                {loadingTransport ? (
                  <div className="flex items-center gap-3 animate-pulse opacity-60">
                    <div className="w-4 h-4 bg-[#86C5FF] rounded-full"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">AI caută numere...</span>
                  </div>
                ) : transportInfo ? (
                  <div className="space-y-4">
                    <div className="bg-white/40 p-5 rounded-2xl border-2 border-[#2E5AA7]/5">
                        <p className="text-[10px] font-black text-[#2E5AA7] uppercase tracking-widest mb-4 border-b border-[#2E5AA7]/10 pb-2">Companii Taxi</p>
                        <div className="space-y-3">
                            {transportInfo.taxis?.map((t: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center bg-white p-3 px-4 rounded-xl border border-[#2E5AA7]/10 shadow-sm transition-transform hover:scale-[1.01]">
                                    <span className="font-bold text-sm">{t.nume}</span>
                                    <span className="font-mono text-[13px] bg-[#86C5FF] px-3 py-1 rounded-lg border-2 border-[#2E5AA7] text-[#2E5AA7] font-black">{t.nr}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white/40 p-5 rounded-2xl border-2 border-[#2E5AA7]/5">
                        <p className="text-[10px] font-black text-[#2E5AA7] uppercase tracking-widest mb-4 border-b border-[#2E5AA7]/10 pb-2">Aplicații Recomandate</p>
                        <div className="flex flex-wrap gap-2">
                            {transportInfo.apps?.map((app: string, idx: number) => (
                                <span key={idx} className="px-4 py-2 bg-[#86C5FF] border-2 border-[#2E5AA7] text-[#2E5AA7] text-[10px] font-black rounded-full uppercase shadow-sm">{app}</span>
                            ))}
                        </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] font-bold opacity-40 uppercase text-center py-4 tracking-widest">Datele vor fi disponibile curând</p>
                )}
                <p className="text-[9px] font-bold text-[#2E5AA7]/40 mt-6 uppercase italic text-center tracking-widest">* Generat automat cu AI pentru {nume}</p>
             </div>
          </section>
        </div>
      </div>
    </main>
  )
}