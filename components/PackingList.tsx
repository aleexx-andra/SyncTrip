'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { genereazaBagajAI } from '@/app/actions'

// ✅ ACTUALIZAT: Primim dataSosire și numarZile de la pagina părinte
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

  // ADAUGA MANUAL (Cu verificare dubluri)
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

  // ✅ ACTUALIZAT: Trimitem contextul de timp către AI
  async function handleAI() {
    if (!tripName) return alert("Numele destinației lipsește!");
    setLoadingAI(true);
    try {
      // Trimitem tripName, dataSosire și numarZile
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
    <div className="bg-white rounded-[24px] p-6 shadow-xl w-full max-w-2xl text-black border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Lista de Bagaje</h2>
        <button onClick={handleAI} disabled={loadingAI} className="bg-[#9333ea] hover:bg-[#7e22ce] text-white px-5 py-2.5 rounded-xl font-semibold disabled:opacity-50 transition-all active:scale-95 shadow-md">
          <span>✨</span> {loadingAI ? 'Se pregătește...' : 'Sugestii AI'}
        </button>
      </div>

      {/* FORMULAR ADĂUGARE MANUALĂ */}
      <form onSubmit={adaugaManual} className="mb-8 flex gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100 shadow-inner">
        <input type="text" value={numeNou} onChange={(e) => setNumeNou(e.target.value)} placeholder="Adaugă un obiect..." className="flex-1 bg-transparent px-4 py-2 text-sm outline-none" />
        <select value={categorieNoua} onChange={(e) => setCategorieNoua(e.target.value)} className="bg-white border border-gray-200 rounded-xl px-2 py-1 text-[10px] font-bold text-gray-500 uppercase outline-none">
          {categoriiSet.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <button type="submit" className="bg-gray-900 text-white w-10 h-10 rounded-xl font-bold hover:bg-black transition-colors">+</button>
      </form>

      {/* LISTA PE CATEGORII */}
      <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {categoriiSet.map(cat => {
          const itemeDinCategorie = bagaje.filter(b => clean(b.categorie).includes(clean(cat)) || clean(cat).includes(clean(b.categorie)));

          if (itemeDinCategorie.length === 0) return null;

          return (
            <div key={cat} className="space-y-3">
              <h3 className="text-[11px] font-black text-purple-600 tracking-[0.2em] uppercase px-1">
                {cat === "VESTIMENTATIE" ? "VESTIMENTAȚIE" : cat === "IGIENA" ? "IGIENĂ" : cat}
              </h3>
              <div className="space-y-1">
                {itemeDinCategorie.map((item) => (
                  <div key={item.id} onClick={() => toggleBifat(item.id, item.bifat)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all group">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${item.bifat ? 'bg-[#9333ea] border-[#9333ea]' : 'border-gray-200 bg-white'}`}>
                      {item.bifat && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`flex-1 text-[16px] font-medium transition-all ${item.bifat ? 'text-gray-300 line-through decoration-gray-400' : 'text-gray-700'}`}>{item.obiect}</span>
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