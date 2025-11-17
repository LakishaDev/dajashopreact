import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const fade = (d=0)=>({ hidden:{opacity:0,y:18}, visible:{opacity:1,y:0,transition:{duration:.55,delay:d,ease:"easeOut"}} });

export default function AboutHero() {
  return (
    <section className="section aboutHero" style={{
      background: "radial-gradient(900px 500px at 10% -10%, rgba(0,0,0,.06), transparent), radial-gradient(800px 480px at 90% -20%, rgba(0,0,0,.05), transparent)"
    }}>
      <div className="container">
        <motion.div className="card glass shadow" initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.6}}>
          <div style={{padding:"clamp(20px,3vw,28px)"}}>
            <motion.h1 className="h1" variants={fade()} initial="hidden" animate="visible">
              O nama — <span style={{background:"linear-gradient(180deg,#111,#888)",WebkitBackgroundClip:"text",color:"transparent"}}>Daja Shop</span>
            </motion.h1>
            <motion.p className="lead" variants={fade(.06)} initial="hidden" animate="visible">
              Porodična prodavnica satova iz Niša — original brendovi, fer cena i fina usluga. Bez šuplje priče.
            </motion.p>
            <motion.div style={{display:"flex",gap:12,flexWrap:"wrap"}} variants={fade(.12)} initial="hidden" animate="visible">
              <Link to="/catalog" className="btn btn--primary">Katalog</Link>
              <Link to="/contact" className="btn btn--ghost">Kontakt</Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
