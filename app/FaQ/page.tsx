"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Lobster } from "next/font/google";

const calligraphicFont = Lobster({ 
  subsets: ["latin"], 
  weight: ["400"] 
});

const faqData = [
  {
    question: "What is SyncTrip?",
    answer: "SyncTrip is your travel companion that lets you plan itineraries, manage packing lists with AI, and sync locations with your friends in real-time."
  },
  {
    question: "How does the AI packing list work?",
    answer: "Our AI analyzes your destination, weather, and trip duration to generate a custom checklist. You can edit and assign items to friends easily."
  },
  {
    question: "Can I collaborate with friends?",
    answer: "Absolutely! Just share your unique trip code, and your friends can join to edit the itinerary and packing list in real-time."
  },
  {
    question: "Is SyncTrip free to use?",
    answer: "The core features of SyncTrip, including planning and syncing, are completely free for all users."
  }
];

export default function FAQPage() {
  const [expanded, setExpanded] = useState<number | null>(0); 

  return (
    <motion.main 
      initial={{ y: "100%" }} 
      animate={{ y: 0 }} 
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen w-screen bg-[#DFF1F1] flex flex-col items-center py-6 overflow-x-hidden select-none"
    >
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-10 shrink-0 mb-16">
        <img src="/logo.svg" alt="Logo" className="w-14" />
        <div className="flex gap-8 font-bold text-[11px] uppercase text-gray-800 tracking-widest">
          <Link href="/home" className="hover:text-[#162E93] transition-all cursor-pointer">Home</Link>
          <Link href="/AboutUs" className="hover:text-[#162E93] transition-all cursor-pointer">About Us</Link>
          <Link href="/FaQ" className="border-b-2 border-[#162E93]">FAQ</Link>
          
          {/* Link activat către Contact */}
          <Link href="/contact" className="hover:text-[#162E93] transition-all cursor-pointer">
            Contact
          </Link>
        </div>
      </nav>

      {/* Grid Layout */}
      <div className="w-full max-w-7xl px-10 grid grid-cols-1 lg:grid-cols-[0.8fr_1.5fr] gap-12 items-start">
        
        {/* Partea STANGA: Titlu */}
        <div className="flex flex-col items-start text-left sticky top-10">
          <div className="bg-[#162E93]/10 text-[#162E93] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border border-[#162E93]/20 mb-6 flex items-center gap-2">
            <span className="text-xs">✨</span> Frequently asked questions
          </div>
          
          <h2 className="text-3xl md:text-[4.2vw] font-black text-[#0D1A63] mb-3 tracking-tighter leading-[0.85] uppercase">
            Frequently asked <br />
            <span 
              className={`${calligraphicFont.className} text-[#462C7D] lowercase first-letter:uppercase italic text-[6.5vw] leading-none tracking-normal inline-block mt-2 ml-4`}
              style={{ transform: "skewX(-15deg)" }}
            >
              Questions
            </span>
          </h2>
          
          <p className="text-gray-600 text-base mb-10 max-w-sm font-medium leading-tight italic">
            Choose a plan that fits your journey. No hidden fees, no surprises—just straightforward syncing for your world.
          </p>

          <Link 
            href="/home" 
            className="bg-[#86C5FF] border-[3px] border-[#2E5AA7] text-[#2E5AA7] px-10 py-3.5 rounded-xl font-black shadow-[0_4px_0_#2E5AA7] hover:brightness-105 active:translate-y-1 transition-all uppercase text-sm tracking-tighter text-center"
          >
            Back to planning
          </Link>
        </div>

        {/* Partea DREAPTA: Casete lungi și scunde */}
        <div className="w-full space-y-4">
          {faqData.map((item, index) => (
            <div key={index} className="w-full">
              <button
                onClick={() => setExpanded(expanded === index ? null : index)}
                className={`w-full bg-[#F5F5F5] border-[3px] border-[#360185] py-5 px-10 rounded-[2rem] flex justify-between items-center transition-all duration-300 ${
                  expanded === index ? "shadow-[0_8px_0_#360185]" : "shadow-[0_4px_0_#360185]"
                }`}
              >
                <span className="font-black text-[#0D1A63] text-[15px] md:text-[16px] tracking-tight text-left">
                  {item.question}
                </span>
                
                <motion.div 
                  animate={{ 
                    rotate: expanded === index ? 180 : 0,
                    backgroundColor: expanded === index ? "#360185" : "rgba(22, 46, 147, 0.1)"
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-[#360185]/20 shrink-0"
                >
                  <span className={`text-[10px] ${expanded === index ? "text-white" : "text-[#162E93]"}`}>▼</span>
                </motion.div>
              </button>
              
              <AnimatePresence>
                {expanded === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mx-4 p-7 bg-white/50 border-x-[3px] border-b-[3px] border-[#360185] rounded-b-[2rem] text-[#0D1A63] font-bold text-sm leading-relaxed shadow-[0_4px_0_#360185]">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

      </div>
    </motion.main>
  );
}