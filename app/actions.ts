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



export async function genereazaPlanAI(numeVacanta: string, dataSelectata: string, activitatiExistente: string[]) {
  const oras = numeVacanta.toUpperCase().trim();
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    // Adăugăm contextul pentru a evita repetițiile
    const listaRepetitii = activitatiExistente.length > 0 
      ? `NU include următoarele activități (deja planificate): ${activitatiExistente.join(", ")}.` 
      : "";

    const prompt = `Ești un ghid turistic minimalist. Generează un itinerar scurt pentru orașul ${oras}, special pentru data de ${dataSelectata}.
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
    
    REGULI DE FORMATATRE:
    1. NU folosi prefixe de tipul '1x', '2x' sau 'Bucăți'.
    2. Folosește denumiri simple: 'Tricouri', 'Pastă de dinți', 'Încărcător'.
    3. DOAR pentru hainele unde cantitatea este critică (lenjerie intimă, șosete, tricouri), adaugă la finalul numelui numărul necesar în paranteză, calculat pentru ${numarZile} zile. Exemplu: 'Lenjerie intimă (${numarZile + 1} seturi)', 'Șosete (${numarZile} perechi)'.
    4. Categorii obligatorii: VESTIMENTATIE, IGIENA, MAKE-UP, ELECTRONICE, DOCUMENTE, ACCESORII UTILE.

    Returnează DOAR array JSON: [{"obiect": "Nume (eventual cantitate)", "categorie": "CATEGORIE"}]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonCurat = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonCurat);

   } catch (error: any) {
    console.error("❌ EROARE AI:", error.message);
    // Rezervă simplă (backup)
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