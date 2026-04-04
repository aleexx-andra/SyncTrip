'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [numeNou, setNumeNou] = useState('')
  const [dataSosire, setDataSosire] = useState('')
  const [dataPlecare, setDataPlecare] = useState('')
  const [vacante, setVacante] = useState<any[]>([])

  async function incarcaVacante() {
    const { data } = await supabase.from('vacante').select('*').order('created_at', { ascending: false })
    if (data) setVacante(data)
  }

  useEffect(() => { incarcaVacante() }, [])

  // ✅ FUNCȚIA DE ȘTERGERE
  async function stergeVacanta(id: string) {
    if (!confirm("Ești sigur că vrei să ștergi această vacanță?")) return;

    // Ștergem din Supabase
    const { error } = await supabase.from('vacante').delete().eq('id', id);

    if (!error) {
      // Actualizăm lista pe ecran fără să mai dăm refresh
      setVacante(vacante.filter(v => v.id !== id));
    } else {
      alert("Nu am putut șterge. Probabil are activități sau bagaje salvate.");
    }
  }

  async function adauga(e: React.FormEvent) {
    e.preventDefault()
    if (!numeNou || !dataSosire || !dataPlecare) {
      alert("Completează toate câmpurile!");
      return;
    }
    const { error } = await supabase.from('vacante').insert([{ nume: numeNou, data_sosire: dataSosire, data_plecare: dataPlecare }])
    if (!error) { setNumeNou(''); setDataSosire(''); setDataPlecare(''); incarcaVacante() }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10 flex flex-col items-center">
      <h1 className="text-5xl font-black text-blue-500 mb-10 tracking-tighter uppercase">SyncTrip Hub 🌍</h1>
      
      {/* Formular adăugare (nemișcat) */}
      <form onSubmit={adauga} className="flex flex-col gap-4 mb-10 w-full max-w-md bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
        {/* ... (inputurile tale de nume, sosire, plecare) ... */}
        <input type="text" value={numeNou} onChange={(e) => setNumeNou(e.target.value)} placeholder="Destinație..." className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-blue-500 transition-all" />
        <div className="flex gap-4">
           <input type="date" value={dataSosire} onChange={(e) => setDataSosire(e.target.value)} className="flex-1 p-3 rounded-xl bg-slate-800 border border-slate-700 outline-none text-sm" />
           <input type="date" value={dataPlecare} onChange={(e) => setDataPlecare(e.target.value)} className="flex-1 p-3 rounded-xl bg-slate-800 border border-slate-700 outline-none text-sm" />
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black uppercase tracking-widest transition-all">Creează Vacanța</button>
      </form>

      {/* LISTA ACTUALIZATĂ CU BUTON DE ȘTERGERE */}
      <div className="w-full max-w-md space-y-4">
        {vacante.map((v) => (
          <div key={v.id} className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800 flex justify-between items-center hover:border-slate-700 transition-all group">
            <div className="flex flex-col">
              <span className="font-bold text-lg">{v.nume}</span>
              <span className="text-[10px] text-slate-500 font-mono">{v.data_sosire} → {v.data_plecare}</span>
            </div>
            
            <div className="flex gap-2">
              {/* Buton Ștergere (iconiță sau text roșu) */}
              <button 
                onClick={() => stergeVacanta(v.id)}
                className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                title="Șterge"
              >
                🗑️
              </button>
              
              <Link href={`/trip/${v.id}`} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-all text-xs font-bold uppercase">
                 Detalii
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}