"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface HeroProps {
  onNavigate?: () => void;
}

export default function HeroSection({ onNavigate = () => {} }: HeroProps) {
  const [step, setStep] = useState(0); 
  const router = useRouter();

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 2000); 
    const t2 = setTimeout(() => setStep(2), 3500); 
    // După ce animația Explore se termină, mergem automat la pagina de Home
    const t3 = setTimeout(() => {
      router.push("/home");
    }, 7500); 

    return () => { [t1, t2, t3].forEach(clearTimeout); };
  }, [router]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white select-none">
      
      {/* --- ETAPA 1: ZOOM ÎN GLOB --- */}
      <AnimatePresence>
        {step < 2 && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
          >
            <Image src="/landscape.jpg" alt="Splash" fill className="object-cover" priority />
            <motion.div
              initial={{ scale: 1 }}
              animate={step === 1 ? { scale: 100, opacity: 0 } : { scale: 1 }}
              transition={{ duration: 2, ease: [0.7, 0, 0.3, 1] }}
              className="relative z-[101]"
            >
              <img src="/logo.svg" alt="Logo" className="w-64 md:w-80" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ETAPA 2: PEISAJUL + EXPLORE --- */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={step >= 2 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 z-10 overflow-hidden"
      >
        <motion.div
          animate={step >= 2 ? { scale: [1.1, 1] } : { scale: 1.1 }}
          transition={{ duration: 5, ease: "easeOut" }}
          className="relative w-full h-full"
        >
          <Image src="/hero-bg.png" alt="Lake" fill className="object-cover" priority />
        </motion.div>
        
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <motion.h1 
              initial={{ opacity: 0, letterSpacing: "5rem", scale: 0.9 }}
              animate={step >= 2 ? { opacity: 0.8, letterSpacing: "1.5rem", scale: 1 } : {}}
              transition={{ duration: 3, delay: 0.5 }}
              className="text-white text-[10vw] font-black uppercase"
            >
                Explore
            </motion.h1>
        </div>
      </motion.div>
    </div>
  );
}