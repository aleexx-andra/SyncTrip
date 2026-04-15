'use server'
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");



// Baza de date de rezervă pentru Plan 
const sugestiiRezerva: any = {
  "PARIS": [
    { "ora": "09:00", "descriere": "Mic dejun la o boulangerie locală" },
    { "ora": "11:00", "descriere": "Vizită la Muzeul Luvru (Mona Lisa)" },
    { "ora": "15:00", "descriere": "Plimbare în Grădinile Tuileries" }
  ],
  "LONDRA": [
    { "ora": "10:00", "descriere": "Schimbarea gărzii la Buckingham Palace" },
    { "ora": "13:00", "descriere": "Prânz în Borough Market" },
    { "ora": "16:00", "descriere": "Vizită la British Museum" }
  ],
  "TOKYO": [
    { "ora": "08:00", "descriere": "Piața de pește Tsukiji" },
    { "ora": "12:00", "descriere": "Explorare cartierul Shibuya" },
    { "ora": "18:00", "descriere": "Cină în Shinjuku Golden Gai" }
  ]
};



// REZERVĂ BAGAJE
const sugestiiBagajeRezerva: any = {
  "PARIS": [
    { obiect: "Pașaport Schengen", categorie: "DOCUMENTE" },
    { obiect: "Adaptor priză E", categorie: "ELECTRONICE" },
    { obiect: "Palton subțire", categorie: "VESTIMENTAȚIE" },
    { obiect: "Pantofii comozi pentru mers", categorie: "VESTIMENTAȚIE" }
  ],
  "LONDRA": [
    { obiect: "Adaptor priză UK (G)", categorie: "ELECTRONICE" },
    { obiect: "Umbrelă / Impermeabil", categorie: "VESTIMENTAȚIE" },
    { obiect: "Card transport Oyster", categorie: "DOCUMENTE" }
  ],
  "TOKYO": [
    { obiect: "Adaptor priză Tip A", categorie: "ELECTRONICE" },
    { obiect: "Baterie externă", categorie: "ELECTRONICE" },
    { obiect: "Ghid de buzunar japonez", categorie: "ACCESORII UTILE" }
  ]
};




// ✅ FUNCȚIE NOUĂ PENTRU VREME (Helper)
async function getVremeInfo(oras: string, dataISO: string) {
  try {
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${oras}&count=1`);
    const geoData = await geoRes.json();
    if (!geoData.results) return "vreme variabilă";
    
    const { latitude, longitude } = geoData.results[0];
    const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&start_date=${dataISO}&end_date=${dataISO}`);
    const wData = await wRes.json();
    
    if (wData.daily) {
      return `Temp: ${wData.daily.temperature_2m_min[0]}-${wData.daily.temperature_2m_max[0]}°C, Șanse ploaie: ${wData.daily.precipitation_probability_max[0]}%`;
    }
    return "vreme specifică sezonului";
  } catch (e) { return "vreme imprevizibilă"; }
}




export async function genereazaPlanAI(numeVacanta: string, dataSelectata: string, activitatiExistente: string[]) {
  const oras = numeVacanta.toUpperCase().trim();
  
  // ✅ Adăugăm contextul meteo
  const prognoza = await getVremeInfo(numeVacanta, dataSelectata);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    const listaRepetitii = activitatiExistente.length > 0 
      ? `NU include următoarele activități (deja planificate): ${activitatiExistente.join(", ")}.` 
      : "";

    // ✅ Am inclus prognoza în prompt
    const prompt = `Ești un ghid turistic minimalist. Generează un itinerar scurt pentru orașul ${oras}, special pentru data de ${dataSelectata}.
    PROGNOZA METEO: ${prognoza}. 
    IMPORTANT: Dacă plouă, prioritizează activități la interior.
    ${listaRepetitii}
    
    Vreau exact 5 elemente în listă:
    - Primele 4 sunt activități principale cu ORE FIXE.
    - Al 5-lea element are ora "EXTRA" și conține sugestii rapide.

    Pentru activitățile normale, folosește EXACT acest format în descriere:
    Titlu Activitate
    ⏱️ [timp] | [preț]
    💡 [info scurt]
    🍴 Localuri: [Nume 1], [Nume 2]

    Pentru elementul EXTRA, descrierea trebuie să fie:
    Alte sugestii:
    - [Sugestie 1]
    - [Sugestie 2]
    - [Sugestie 3]

    Returnează STRICT JSON valid: [{"ora": "HH:mm sau EXTRA", "descriere": "textul formatat"}]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonCurat = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonCurat);
  } catch (error) {
    return [];
  }
}




export async function genereazaBagajAI(numeVacanta: string, dataSosire: string, numarZile: number) {
  if (!process.env.GOOGLE_API_KEY) throw new Error("Cheia API lipsește.");
  const data = dataSosire ? new Date(dataSosire) : new Date();
  const luna = data.toLocaleString('ro-RO', { month: 'long' });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    const prompt = `Ești un expert în travel packing. Pentru o vacanță de ${numarZile} ZILE în ${numeVacanta} (luna ${luna}), generează o listă de minim 35 de obiecte.
    
    REGULI DE FORMATARE (FOARTE IMPORTANT):
    1. NU PUNE cifre sau paranteze la DOCUMENTE, ELECTRONICE, MAKE-UP sau ACCESORII UTILE (ex: scrie 'Pașaport', NU 'Pașaport (1)').
    2. Pune cantitatea în paranteză DOAR pentru: Lenjerie intimă, Șosete și Tricouri. (ex: 'Șosete (${numarZile} perechi)').
    3. Pentru restul hainelor (Pantaloni, Geci, Rochii), NU pune cifre.
    4. Categorii obligatorii: VESTIMENTATIE, IGIENA, MAKE-UP, ELECTRONICE, DOCUMENTE, ACCESORII UTILE.

    Returnează DOAR array JSON: [{"obiect": "Nume curat", "categorie": "CATEGORIE"}]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonCurat = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonCurat);
   } catch (error: any) {
   return [
      { obiect: "Tricouri", categorie: "VESTIMENTATIE" },
      { obiect: "Pantaloni", categorie: "VESTIMENTATIE" },
      { obiect: "Periuță dinți", categorie: "IGIENA" },
      { obiect: "Mascara", categorie: "MAKE-UP" },
      { obiect: "Încărcător", categorie: "ELECTRONICE" },
      { obiect: "Pașaport", categorie: "DOCUMENTE" },
      { obiect: "Umbrelă", categorie: "ACCESORII UTILE" }
    ];
  }
}