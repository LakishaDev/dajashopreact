import React from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Handshake, ShieldCheck } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Originalnost", text: "Zvanični kanali, garancija, fiskalni račun." },
  { icon: BadgeCheck, title: "Transparentna cena", text: "Bez skrivenih troškova. Online & u lokalu." },
  { icon: Handshake, title: "Podrška", text: "Brz savet pri izboru, održavanju i servisu." },
];

export default function AboutValues() {
  return (
    <section className="section">
      <div className="container grid-3">
        {items.map((it,i)=>{
          const Icon = it.icon;
          return (
            <motion.div key={it.title} className="card shadow" style={{padding:18,borderRadius:"var(--radius,14px)"}}
              initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.4}} transition={{duration:.45,delay:i*0.04}}>
              <div className="pill" style={{marginBottom:10}}><Icon size={18}/> {it.title}</div>
              <p className="lead" style={{margin:0}}>{it.text}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
