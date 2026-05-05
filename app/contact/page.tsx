"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Lobster } from "next/font/google";

const calligraphicFont = Lobster({ 
  subsets: ["latin"], 
  weight: ["400"] 
});

export default function ContactPage() {
  const [isSent, setIsSent] = useState(false);

  const inputStyle = "w-full bg-[#F5F5F5] border-[3px] border-[#162E93] p-3.5 rounded-2xl outline-none text-[#0D1A63] font-bold placeholder-[#162E93]/40 focus:bg-white transition-all mb-3 shadow-[0_4px_0_rgba(22,46,147,0.1)] text-sm";
  
  const buttonStyle = "bg-[#86C5FF] border-[3px] border-[#162E93] text-[#162E93] w-full py-3.5 rounded-2xl font-black shadow-[0_5px_0_#162E93] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all uppercase text-sm tracking-tighter text-center flex items-center justify-center cursor-pointer";

  return (
    <motion.main 
      initial={{ y: "100%" }} 
      animate={{ y: 0 }} 
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="h-screen w-screen bg-[#DFF1F1] flex flex-col justify-between select-none overflow-hidden"
    >
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-10 shrink-0 py-4">
        <img src="/logo.svg" alt="Logo" className="w-14" />
        <div className="flex gap-8 font-bold text-[11px] uppercase text-gray-800 tracking-widest">
          <Link href="/home" className="hover:text-[#162E93] transition-all cursor-pointer">Home</Link>
          <Link href="/AboutUs" className="hover:text-[#162E93] transition-all cursor-pointer">About Us</Link>
          <Link href="/FaQ" className="hover:text-[#162E93] transition-all cursor-pointer">FAQ</Link>
          <Link href="/contact" className="border-b-2 border-[#162E93]">Contact</Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center w-full px-10">
        {/* Schimbat grid de la 1fr_1.3fr la 1.1fr_1.2fr si gap de la 12 la 8 pentru a aduce caseta la stanga */}
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[1.1fr_1.2fr] gap-8 items-center">
          
          {/* Partea Stângă: Info */}
          <div className="text-left relative">
            <h1 className="text-4xl md:text-[4.5vw] font-black text-[#0D1A63] mb-0 tracking-tighter leading-[0.6] uppercase">
              Get in <br />
              {/* mt-[-32px] (în loc de -40) pentru a mări distanța foarte puțin */}
              <div className="flex items-baseline gap-10 mt-[-32px]"> 
                <span 
                  className={`${calligraphicFont.className} text-[#008BFF] lowercase first-letter:uppercase italic text-[7vw] leading-none tracking-normal inline-block -skew-x-12`}
                  style={{ transform: "skewX(-15deg)" }}
                >
                  Touch
                </span>
                <img 
                  src="/logo.svg" 
                  alt="Logo" 
                  className="w-28 md:w-32 opacity-75 object-contain translate-y-[35px]" 
                />
              </div>
            </h1>

            <p className="text-gray-600 text-sm mt-8 mb-4 max-w-sm font-medium italic leading-tight">
              Have a question about SyncTrip? We&apos;re here to help you plan your next adventure.
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-black font-black text-[13px] tracking-tight">
                <span className="text-xl">📍</span> Galați, România
              </div>
              <div className="flex items-center gap-4 text-black font-black text-[13px] tracking-tight lowercase">
                <span className="text-xl">✉️</span> synctrip.auth@gmail.com
              </div>
            </div>
          </div>

          {/* Partea Dreaptă: Formular */}
          <div className="relative w-full max-w-[550px] justify-self-center lg:justify-self-start">
            <AnimatePresence mode="wait">
              {!isSent ? (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={(e) => { e.preventDefault(); setIsSent(true); }}
                  className="bg-[#F5F5F5] border-[4px] border-[#1A3263] p-6 rounded-[2.5rem] shadow-[0_6px_0_#1A3263]"
                >
                  <input type="text" placeholder="Your name" className={inputStyle} required />
                  <input type="email" placeholder="Your email" className={inputStyle} required />
                  <textarea placeholder="What's on your mind?" rows={3} className={inputStyle + " resize-none"} required />
                  
                  <button type="submit" className={buttonStyle}>
                    Send Message 🚀
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border-[4px] border-[#1A3263] p-10 rounded-[2.5rem] shadow-[0_6px_0_#1A3263] text-center"
                >
                  <span className="text-5xl mb-4 block">✈️</span>
                  <h3 className="text-2xl font-black text-[#1A3263] uppercase tracking-tighter">Message Sent!</h3>
                  <p className="text-[#0D1A63] font-bold mt-2 text-sm">We&apos;re syncing your request. Check your inbox soon!</p>
                  <button 
                    onClick={() => setIsSent(false)}
                    className="mt-6 text-[#1A3263] font-black underline uppercase text-[10px] tracking-widest"
                  >
                    Send another one
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <footer className="w-full h-14 bg-[#0D1A63] flex items-center justify-center shrink-0 mt-auto">
        <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em]">
          SyncTrip © 2026 • Perfectly Synced Journeys
        </p>
      </footer>
    </motion.main>
  );
}