import React from "react";
import { motion } from "framer-motion";

export default function AboutStory() {
  return (
    <section className="section">
      <div className="container" style={{display:"grid",gap:18,gridTemplateColumns:"1.1fr .9fr"}}>
        <motion.div
          initial={{opacity:0,x:-18}} whileInView={{opacity:1,x:0}} viewport={{once:true,amount:.3}} transition={{duration:.5}}>
          <h2 className="h2">Naša priča</h2>
          <p>Daja Shop je pokrenuo <strong>Dejan Cvetković</strong> u Nišu 2007 — ideja: original satovi, jasne informacije i prijateljska podrška.</p>
          <p>Online i u lokalu, guramo iste principe: kvalitet, transparentnost, poštovanje kupca.</p>
        </motion.div>

        <motion.div className="card shadow glass"
          initial={{opacity:0,x:18}} whileInView={{opacity:1,x:0}} viewport={{once:true,amount:.3}} transition={{duration:.5}}
          style={{padding:18,borderRadius:"var(--radius,16px)"}}>
          <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:10}}>
            <img src="/images/team/dejan.jpg" alt="Dejan Cvetković" style={{width:64,height:64,borderRadius:"50%",objectFit:"cover",background:"#ddd"}} onError={(e)=>{e.currentTarget.style.opacity=0}}/>
            <div>
              <h3 style={{margin:0}}>Dejan Cvetković</h3>
              <p className="lead" style={{margin:0}}>Osnivač i vlasnik</p>
            </div>
          </div>
          <ul style={{display:"flex",gap:8,flexWrap:"wrap",listStyle:"none",padding:0,margin:"10px 0 12px"}}>
            <li className="pill">Original</li>
            <li className="pill">Garancija</li>
            <li className="pill">Podrška</li>
          </ul>
          <p>Preko decenije iskustva u izboru i prodaji satova. Preporuka po meri stila i budžeta.</p>
        </motion.div>
      </div>
    </section>
  );
}
