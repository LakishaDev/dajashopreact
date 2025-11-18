import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const Q = [
  { q:"Da li su satovi original?", a:"Da, nabavka isključivo iz zvaničnih kanala, uz garanciju i račun." },
  { q:"Kako ide dostava?", a:"Kurirskom službom širom Srbije, obično 1–2 radna dana." },
  { q:"Mogu li da vratim?", a:"Imate pravo na povraćaj u roku od 14 dana, neoštećen proizvod." },
];

function Item({q,a}) {
  const [open,setOpen] = useState(false);
  return (
    <div className="card shadow" style={{borderRadius:"var(--radius,12px)"}}>
      <button onClick={()=>setOpen(v=>!v)} aria-expanded={open} style={{width:"100%",padding:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span className="lead" style={{textAlign:"left"}}>{q}</span>
        <ChevronDown size={18} style={{transform: open?"rotate(180deg)":"rotate(0)", transition:"transform .2s"}}/>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.25}}>
            <div style={{padding:"0 14px 14px"}}>{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AboutFAQ() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="h2">Česta pitanja</h2>
        <div className="grid-3">
          {Q.map((x)=> <Item key={x.q} {...x} /> )}
        </div>
      </div>
    </section>
  );
}
