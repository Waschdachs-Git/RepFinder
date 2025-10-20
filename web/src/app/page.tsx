"use client";
import { useEffect, useState } from "react";
import { useAgent } from "@/providers/AgentProvider";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import ShippingCoupons from "@/components/ShippingCoupons";

export default function Home() {
  useAgent();
  const [q, setQ] = useState("");
  const [showTopNote, setShowTopNote] = useState(true);

  useEffect(() => {
    try { setShowTopNote(!localStorage.getItem('pf:top-affiliate-note')); } catch {}
  }, []);

  // Removed product suggestions on homepage by request

  return (
    <div className="py-10">
      {showTopNote && (
        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 flex items-center justify-between gap-3">
          <span>Some links are affiliate links. If you buy through them, we may earn a small commission at no extra cost to you.</span>
          <button
            className="shrink-0 rounded-full px-3 py-1 text-sm border border-neutral-200 hover:bg-neutral-50"
            onClick={() => { try { localStorage.setItem('pf:top-affiliate-note', '1'); } catch {}; setShowTopNote(false); }}
          >
            Got it
          </button>
        </div>
      )}
  <Hero />
      <div className="mb-8">
        <SearchBar query={q} setQuery={setQ} onSubmit={(term) => setQ(term)} />
      </div>
      <HowItWorks />
      <ShippingCoupons />
      <FAQ />
    </div>
  );
}
