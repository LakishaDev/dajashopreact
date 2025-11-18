// ==============================
// File: src/pages/About.jsx
// Sastavlja sve sekcije "O nama"
// ==============================
import React from "react";
import "./About.css";

import AboutHero from "../components/About/AboutHero.jsx";
import AboutStats from "../components/About/AboutStats.jsx";
import AboutStory from "../components/About/AboutStory.jsx";
import AboutMarquee from "../components/About/AboutMarquee.jsx";
import AboutValues from "../components/About/AboutValues.jsx";
import AboutInfoGlass from "../components/About/AboutInfoGlass.jsx";
import AboutTimeline from "../components/about/AboutTimeline.jsx";
import AboutTestimonials from "../components/About/AboutTestimonials.jsx";
import AboutFAQ from "../components/About/AboutFAQ.jsx";
import AboutCTA from "../components/About/AboutCTA.jsx";

export default function About() {
  return (
    <main className="about">
      <AboutHero />
      <AboutStats />
      <AboutStory />
      <AboutMarquee />
      <AboutValues />
      <AboutInfoGlass />
      <AboutTimeline />
      <AboutTestimonials />
      <AboutFAQ />
      <AboutCTA />
    </main>
  );
}
