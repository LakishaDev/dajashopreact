import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/**
 * Trik: jedan track, ali JS kopira sadržaj u runtime dok ne napuni >= 2x širinu — pa se CSS translateX loopuje.
 * Kad dođe do kraja, modularno resetuje transform bez trzaja.
 */
const BRANDS = ["CASIO","DANIEL KLEIN","Q&Q","ORIENT","G-SHOCK","BABY-G","EDIFICE","SHEEN","RETRO"];

export default function AboutMarquee() {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const posRef = useRef(0);
  const rafRef = useRef();

  useEffect(()=>{
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    // Napuni traku dinamički tako da širina > 2x wrap-a (bez dvostrukog mapiranja u Reactu)
    const base = inner.querySelector(".trackBase");
    while (inner.scrollWidth < wrap.clientWidth * 2) {
      inner.appendChild(base.cloneNode(true));
    }

    let speed = 0.5; // px po frejmu — slobodno uspori/ubrzaj
    const tick = ()=>{
      posRef.current -= speed;
      const width = inner.scrollWidth / inner.childElementCount; // širina jednog "bloka"
      // bez trzaja resetujemo kad pređemo širinu jednog bloka
      if (Math.abs(posRef.current) >= width) posRef.current += width;
      inner.style.transform = `translateX(${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const onHover = ()=> speed = 0.2;
    const onLeave = ()=> speed = 0.5;
    wrap.addEventListener("mouseenter", onHover);
    wrap.addEventListener("mouseleave", onLeave);

    return ()=>{
      cancelAnimationFrame(rafRef.current);
      wrap.removeEventListener("mouseenter", onHover);
      wrap.removeEventListener("mouseleave", onLeave);
    };
  },[]);

  return (
    <section className="section">
      <div className="container">
        <h2 className="h2" style={{textAlign:"center"}}>Brendovi koje volimo</h2>
        <div className="brandMarquee" ref={wrapRef} style={{position:"relative"}}>
          <div className="brandTrack" ref={innerRef} style={{display:"grid",gridAutoFlow:"column",gap:10,alignItems:"center",willChange:"transform"}}>
            <div className="trackBase" style={{display:"grid",gridAutoFlow:"column",gap:10}}>
              {BRANDS.map((b)=>(
                <Link key={b} to={`/catalog?brand=${encodeURIComponent(b)}`} className="pill" aria-label={`Pogledaj ${b}`}>{b}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
