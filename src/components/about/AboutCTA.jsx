import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function AboutCTA() {
  return (
    <section className="section" style={{paddingBottom:"clamp(32px,6vw,80px)"}}>
      <div className="container" style={{justifyItems:"center",textAlign:"center"}}>
        <motion.h2 className="h2" initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.4}} transition={{duration:.45}}>
          Spreman za novi sat?
        </motion.h2>
        <motion.div initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true,amount:.4}} transition={{duration:.45,delay:.05}} style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <Link to="/catalog" className="btn btn--primary">Katalog</Link>
          <Link to="/catalog?brand=CASIO" className="btn btn--ghost">Casio</Link>
        </motion.div>
      </div>
    </section>
  );
}
