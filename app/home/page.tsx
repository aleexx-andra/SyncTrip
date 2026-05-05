"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const carouselImages = Array.from({ length: 20 }, (_, i) => i + 1);
  const buttonStyle = "bg-[#86C5FF] border-[3px] border-[#2E5AA7] text-[#2E5AA7] w-64 py-3.5 rounded-xl font-black shadow-[0_4px_0_#2E5AA7] hover:brightness-105 active:translate-y-1 transition-all uppercase text-sm tracking-tighter text-center flex items-center justify-center";

  return (
    <motion.main 
      initial={{ y: "100%" }} 
      animate={{ y: 0 }} 
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="h-screen w-screen bg-[#DFF1F1] flex flex-col items-center justify-between py-6 overflow-hidden select-none"
    >
      <nav className="w-full flex justify-between items-center px-10 shrink-0">
        <img src="/logo.svg" alt="Logo" className="w-14" />
        <div className="flex gap-8 font-bold text-[11px] uppercase text-gray-800 tracking-widest">
          {/* Link activ Home */}
          <Link href="/home" className="border-b-2 border-[#2E5AA7]">Home</Link>
          
          <Link href="/AboutUs" className="hover:text-[#2E5AA7] transition-all cursor-pointer">
            About Us
          </Link>
          
          <Link href="/FaQ" className="hover:text-[#2E5AA7] transition-all cursor-pointer">
            FAQ
          </Link>
          
          {/* MODIFICARE: Link-ul către Contact este acum activ */}
          <Link href="/contact" className="hover:text-[#2E5AA7] transition-all cursor-pointer">
            Contact
          </Link>
        </div>
      </nav>

      <div className="flex flex-col items-center text-center px-6">
        <h2 className="text-3xl md:text-[4vw] font-black text-gray-900 mb-2 whitespace-nowrap tracking-tight leading-none">
          Plan your journey, sync your world.
        </h2>
        <p className="text-gray-600 text-sm md:text-base mb-8 max-w-5xl italic font-medium whitespace-nowrap">
          Organize your itineraries, manage packing lists with AI, and coordinate with friends in real-time.
        </p>
        <div className="flex gap-6 mb-8">
          <button className={buttonStyle}>Join on vacation</button>
          <Link href="/?skip=true" className={buttonStyle}>Create your vacation</Link>
        </div>
      </div>

      <div className="w-full flex overflow-x-auto gap-5 px-20 no-scrollbar pb-10 items-center">
        {carouselImages.map((nr) => (
          <motion.div key={nr} className="min-w-[200px] h-[280px] md:min-w-[240px] md:h-[340px] relative rounded-[2.5rem] overflow-hidden shadow-2xl flex-shrink-0 border-4 border-white/20">
            <Image src={`/carusel/${nr}.jpg`} alt="Trip" fill className="object-cover" />
          </motion.div>
        ))}
      </div>
    </motion.main>
  );
}