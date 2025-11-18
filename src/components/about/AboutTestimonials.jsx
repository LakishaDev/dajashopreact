import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const REVIEWS = [
  { name:"Milan", text:"Brza isporuka i original sat. Sve preporuke.", rating:5 },
  { name:"Jelena", text:"Ljubazni u kontaktu, pomogli oko izbora poklona.", rating:5 },
  { name:"Nikola", text:"Fer cena i odlična komunikacija.", rating:5 },
];

export default function AboutTestimonials() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="h2">Šta kupci kažu</h2>
        <div className="grid-3">
          {REVIEWS.map((r,i)=>(
            <motion.div key={r.name} className="card shadow glass" style={{padding:18,borderRadius:"var(--radius,14px)"}}
              initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.4}} transition={{duration:.4,delay:i*0.05}}>
              <div className="pill" style={{marginBottom:8}}><Quote size={16}/> {r.name}</div>
              <p style={{margin:"0 0 8px"}}>“{r.text}”</p>
              <div aria-label={`${r.rating} zvezdica`}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
