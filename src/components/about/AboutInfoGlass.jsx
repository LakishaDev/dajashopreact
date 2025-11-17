import React from "react";

export default function AboutInfoGlass() {
  return (
    <section className="section">
      <div className="container">
        <div className="card glass shadow" style={{display:"grid",gap:14,padding:18,borderRadius:"var(--radius,16px)"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:14,alignItems:"center"}}>
            <div>
              <h3 style={{margin:"0 0 6px"}}>Gde smo</h3>
              <p style={{margin:0}}><strong>Niš, TPC Gorča — lokal C31</strong></p>
              <p style={{margin:0}}>Obrenovićeva bb, Medijana</p>
            </div>
            <div>
              <h3 style={{margin:"0 0 6px"}}>Kontakt</h3>
              <p style={{margin:0}}>📞 064/126-2425 • 065/240-8400</p>
              <p style={{margin:0}}>✉️ cvelenis42@yahoo.com</p>
            </div>
            <div>
              <h3 style={{margin:"0 0 6px"}}>Radno vreme</h3>
              <p style={{margin:0}}>Pon–Pet: 10–20h • Sub: 10–15h • Ned: zatvoreno</p>
            </div>
            <div style={{display:"flex",gap:10,justifySelf:"start"}}>
              <a className="btn btn--primary" href="/contact">Piši nam</a>
              <a className="btn btn--ghost" href="https://maps.app.goo.gl/" target="_blank" rel="noreferrer">Mapa</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
