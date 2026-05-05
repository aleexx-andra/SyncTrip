"use client";
import Link from "next/link";

export default function AboutUsPage() {
  const buttonStyle = "bg-[#86C5FF] border-[3px] border-[#2E5AA7] text-[#2E5AA7] w-64 py-3.5 rounded-xl font-black shadow-[0_4px_0_#2E5AA7] hover:brightness-105 active:translate-y-1 transition-all uppercase text-sm tracking-tighter text-center flex items-center justify-center";

  return (
    <main className="h-screen w-screen bg-[#DFF1F1] flex flex-col items-center py-6 overflow-hidden select-none">
      
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-10 shrink-0 mb-12">
        <img src="/logo.svg" alt="Logo" className="w-14" />
        <div className="flex gap-8 font-bold text-[11px] uppercase text-gray-800 tracking-widest">
          <Link href="/home" className="hover:text-[#2E5AA7] transition-all cursor-pointer">Home</Link>
          <Link href="/AboutUs" className="border-b-2 border-[#2E5AA7]">About Us</Link>
          <Link href="/FaQ" className="hover:text-[#2E5AA7] transition-all cursor-pointer">FAQ</Link>
          
          {/* Link activat către Contact */}
          <Link href="/contact" className="hover:text-[#2E5AA7] transition-all cursor-pointer">
            Contact
          </Link>
        </div>
      </nav>

      <div className="flex flex-col items-center text-center px-6 max-w-5xl">
        <h2 className="text-3xl md:text-[3.5vw] font-black text-gray-900 mb-4 tracking-tight leading-none">
          Your journey, <span className="text-[#462C7D]">perfectly synced.</span>
        </h2>
        
        <p className="text-gray-600 text-lg mb-12 italic font-medium">
          We believe travel should be about the destination, not the stress of getting there.
        </p>

        {/* Sectiunile explicative */}
        <div className="grid md:grid-cols-3 gap-6 w-full mb-12">
          {/* Bagaje */}
          <div className="bg-white/40 p-8 rounded-[2.5rem] border-2 border-white/60 shadow-xl">
            <div className="text-2xl mb-3">🧳</div>
            <h3 className="font-black text-[#2E5AA7] uppercase text-xs mb-2">Smart Packing</h3>
            <p className="text-sm text-gray-700 leading-snug">
              Stop worrying about what you missed. Our <b>AI analyzes</b> your trip to ensure your bags are perfectly packed every single time.
            </p>
          </div>

          {/* Idei Virale + Personale */}
          <div className="bg-white/40 p-8 rounded-[2.5rem] border-2 border-white/60 shadow-xl">
            <div className="text-2xl mb-3">✨</div>
            <h3 className="font-black text-[#2E5AA7] uppercase text-xs mb-2">Viral & Personal</h3>
            <p className="text-sm text-gray-700 leading-snug">
              Why choose? Seamlessly blend <b>trending viral spots</b> with your own hidden gems for an itinerary that is truly yours.
            </p>
          </div>

          {/* Fara stres la plecare */}
          <div className="bg-white/40 p-8 rounded-[2.5rem] border-2 border-white/60 shadow-xl">
            <div className="text-2xl mb-3">✈️</div>
            <h3 className="font-black text-[#2E5AA7] uppercase text-xs mb-2">Zero Stress</h3>
            <p className="text-sm text-gray-700 leading-snug">
              Departure day shouldn&apos;t be a problem. We coordinate the chaos so you can <b>start your vacation</b> the moment you lock the door.
            </p>
          </div>
        </div>

        <Link href="/home" className={buttonStyle}>
          Back to planning
        </Link>
      </div>
    </main>
  );
}