import React from "react";
import { motion } from "framer-motion";
import { Watch, Store, Truck, Sparkles } from "lucide-react";

const steps = [
  { icon: Store, year: "2007", title: "Start u Nišu", text: "Otvorena prodavnica — fokus na proverene brendove." },
  { icon: Watch, year: "2012", title: "Širenje asortimana", text: "Više modela i kolekcija, muški/ženski, casual/sport." },
  { icon: Truck, year: "2018", title: "Online prodaja", text: "Ubacujemo dostavu širom Srbije i online poručivanje." },
  { icon: Sparkles, year: "2025", title: "DajaShop 2.0", text: "Modern UI/UX, bolja pretraga i preporuke." },
];

export default function AboutTimeline() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="h2">Kako smo rasli</h2>
        <div style={{display:"grid",gap:12}}>
          {steps.map((s,i)=>{
            const Icon = s.icon;
            return (
              <motion.div key={s.year} className="card shadow" style={{padding:14,borderRadius:"var(--radius,14px)",display:"grid",gridTemplateColumns:"auto 80px 1fr",gap:12,alignItems:"center"}}
                initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.4}} transition={{duration:.4,delay:i*0.03}}>
                <div className="pill"><Icon size={18}/> {s.title}</div>
                <div style={{fontWeight:700}}>{s.year}</div>
                <div className="lead">{s.text}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
