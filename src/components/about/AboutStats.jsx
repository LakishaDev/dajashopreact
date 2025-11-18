import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const DATA = [
  { label: "Godina osnivanja", value: "2007" },
  { label: "Brendova u ponudi", value: "40+" },
  { label: "Kupaca godišnje", value: "5k+" },
  { label: "Ocena korisnika", value: "4.9/5" },
];

export default function AboutStats() {
  return (
    <section className="section">
      <div className="container grid-4 aboutStats" style={{display:"grid",gap:12,gridTemplateColumns:"repeat(4,minmax(0,1fr))"}}>
        {DATA.map((s,i)=>(
          <motion.div key={s.label} className="card shadow" style={{padding:18,textAlign:"center",borderRadius:"var(--radius,14px)"}}
            initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.4}} transition={{duration:.45,delay:i*0.03}}>
            <div style={{fontSize:28,fontWeight:700}}>{s.value}</div>
            <div className="lead" style={{fontSize:14}}>{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
