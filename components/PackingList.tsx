'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { genereazaBagajAI } from '@/app/actions'

interface PackingListProps { 
  tripId: string; 
  tripName: string; 
  dataSosire: string; 
  numarZile: number; 
}

export default function PackingList({ tripId, tripName, dataSosire, numarZile }: PackingListProps) {
  const [bagaje, setBagaje] = useState<any[]>([])
  const [loadingAI, setLoadingAI] = useState(false)
  const [loading, setLoading] = useState(false)
  const [numeNou, setNumeNou] = useState('')
  const [categorieNoua, setCategorieNoua] = useState('VESTIMENTATIE')

  const categoriiSet = ["VESTIMENTATIE", "IGIENA", "MAKE-UP", "ELECTRONICE", "DOCUMENTE", "ACCESORII UTILE"];

  const button3D = "bg-[#86C5FF] text-[#2E5AA7] border-2 border-[#2E5AA7] shadow-[0_4px_0_0_#2E5AA7] hover:shadow-none hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all font-black uppercase tracking-widest";

  async function incarca() {
    setLoading(true)
    const { data } = await supabase.from('bagaje').select('*').eq('trip_id', tripId);
    if (data) setBagaje(data)
    setLoading(false)
  }

  useEffect(() => { incarca() }, [tripId])

  async function toggleBifat(id: string, stareActuala: boolean) {
    const { error } = await supabase.from('bagaje').update({ bifat: !stareActuala }).eq('id', id);
    if (!error) setBagaje(bagaje.map(b => b.id === id ? { ...b, bifat: !stareActuala } : b));
  }

  async function adaugaManual(e: React.FormEvent) {
    e.preventDefault();
    const numeCurat = numeNou.trim();
    if (!numeCurat) return;

    const existaDeja = bagaje.some(
      (item) => item.obiect.toLowerCase().trim() === numeCurat.toLowerCase()
    );

    if (existaDeja) {
      alert(`"${numeCurat}" există deja în listă!`);
      return;
    }

    const { data } = await supabase.from('bagaje').insert([
      { trip_id: tripId, obiect: numeCurat, categorie: categorieNoua, bifat: false }
    ]).select();

    if (data) {
      setBagaje([...bagaje, data[0]]);
      setNumeNou('');
    }
  }

  async function handleAI() {
    if (!tripName) return alert("Numele destinației lipsește!");
    setLoadingAI(true);
    try {
      const sugestii = await genereazaBagajAI(tripName, dataSosire, numarZile);
      await supabase.from('bagaje').delete().eq('trip_id', tripId);
      const dateNoi = sugestii.map((s: any) => ({
        trip_id: tripId,
        obiect: s.obiect,
        categorie: s.categorie.toUpperCase().trim(),
        bifat: false
      }));
      await supabase.from('bagaje').insert(dateNoi);
      await incarca();
    } catch (err) { 
      alert("Eroare la generare AI."); 
      console.error(err);
    } finally { 
      setLoadingAI(false); 
    }
  }

  const clean = (txt: string) => txt?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() || "";

  return (
    <div className="bg-[#F5F5F5] rounded-[32px] p-7 border-2 border-[#2E5AA7] shadow-[0_4px_0_0_rgba(46,90,167,0.1)] w-full max-w-2xl text-black">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-[#0D1A63] tracking-tight uppercase">Lista de Bagaje</h2>
        <button onClick={handleAI} disabled={loadingAI} className={`${button3D} px-6 py-2 text-[10px] rounded-full flex items-center gap-2`}>
          <span>✨</span> {loadingAI ? 'Se pregătește...' : 'Sugestii AI'}
        </button>
      </div>

      {/* FORMULAR ADĂUGARE MANUALĂ */}
      <form onSubmit={adaugaManual} className="mb-8 flex gap-2 bg-white p-2 rounded-2xl border-2 border-[#2E5AA7] shadow-sm">
        <input 
          type="text" 
          value={numeNou} 
          onChange={(e) => setNumeNou(e.target.value)} 
          placeholder="Adaugă un obiect..." 
          className="flex-1 bg-transparent px-4 py-2 text-sm outline-none font-bold text-[#0D1A63]" 
        />
        <select 
          value={categorieNoua} 
          onChange={(e) => setCategorieNoua(e.target.value)} 
          className="bg-[#F5F5F5] border-2 border-[#2E5AA7]/20 rounded-xl px-3 py-1 text-[10px] font-black text-[#2E5AA7] uppercase outline-none focus:border-[#2E5AA7]"
        >
          {categoriiSet.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <button type="submit" className={`${button3D} w-10 h-10 rounded-xl text-lg flex items-center justify-center`}>+</button>
      </form>

      {/* LISTA PE CATEGORII */}
      <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {categoriiSet.map(cat => {
          const itemeDinCategorie = bagaje.filter(b => clean(b.categorie).includes(clean(cat)) || clean(cat).includes(clean(b.categorie)));

          if (itemeDinCategorie.length === 0) return null;

          return (
            <div key={cat} className="space-y-4">
              <h3 className="text-[11px] font-black text-[#0D1A63] tracking-[0.25em] uppercase px-1 border-l-4 border-[#86C5FF] ml-1 pl-3">
                {cat === "VESTIMENTATIE" ? "VESTIMENTAȚIE" : cat === "IGIENA" ? "IGIENĂ" : cat}
              </h3>
              <div className="space-y-2">
                {itemeDinCategorie.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleBifat(item.id, item.bifat)} 
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/50 cursor-pointer transition-all border-2 border-transparent hover:border-[#2E5AA7]/10 group"
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${item.bifat ? 'bg-[#86C5FF] border-[#2E5AA7]' : 'border-[#2E5AA7]/20 bg-white'}`}>
                      {item.bifat && <svg className="w-3.5 h-3.5 text-[#2E5AA7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`flex-1 text-[15px] font-bold transition-all ${item.bifat ? 'text-gray-400 line-through decoration-gray-400' : 'text-black'}`}>
                      {item.obiect}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}