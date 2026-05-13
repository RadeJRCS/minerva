"use client";

import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg: "#050810", bgCard: "rgba(255,255,255,0.03)", bgCardHover: "rgba(255,255,255,0.055)",
  border: "rgba(255,255,255,0.07)", borderAccent: "rgba(255,107,53,0.3)",
  accent: "#ff6b35", accentDim: "rgba(255,107,53,0.1)",
  gold: "#f0c040", goldDim: "rgba(240,192,64,0.1)",
  cyan: "#60d4f5", cyanDim: "rgba(96,212,245,0.1)",
  green: "#4ade80", greenDim: "rgba(74,222,128,0.1)",
  text: "#e8e4dc", textMid: "rgba(232,228,220,0.55)", textDim: "rgba(232,228,220,0.28)",
};
const F = { display: "'Barlow Condensed', sans-serif", mono: "'IBM Plex Mono', monospace", body: "'Barlow', sans-serif" };

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=Barlow+Condensed:wght@300;400;500;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;scrollbar-width:thin;scrollbar-color:rgba(255,107,53,.15) transparent}
html{scroll-behavior:smooth}
body{background:#050810;color:#e8e4dc;font-family:'Barlow',sans-serif;overflow-x:hidden}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:.25}50%{opacity:1}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes shimmer{0%{opacity:.4}50%{opacity:.85}100%{opacity:.4}}
@keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(255,107,53,0)}50%{box-shadow:0 0 28px 6px rgba(255,107,53,.2)}}
@keyframes gridDrift{from{background-position:0 0}to{background-position:0 56px}}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes scanline{0%{top:-2px}100%{top:102%}}
::selection{background:rgba(255,107,53,.3);color:#fff}
section[id]{scroll-margin-top:120px}
`;

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  "U₃O₈ SPOT  $91.40/lb  ▲+2.3%", "UF₆  $156.20  ▲+1.1%", "SWU  $138.50  ▲+0.8%",
  "HALEU  $4,200/kgU  ▲+5.4%", "KAZ SUPPLY RISK  78/100  ↑ HIGH",
  "ROSATOM EXPOSURE  28% US ENRICHMENT  ⚠ WATCH", "LITHIUM CARBONATE  $11,200/t  ▲+3.1%",
  "COBALT  $28,400/t  ▲+0.4%", "GALLIUM  $580/kg  ▼-1.2%  ⚠ CHINA CONTROLS 98%",
  "NEODYMIUM  $73/kg  ▲+2.8%", "NIGER SOMAIR  EXPORTS BLOCKED  ⚠ CRITICAL",
];

const PERSONAS = [
  {
    id: "utility", icon: "⚡", tag: "Nuclear Utilities",
    title: "Nuclear Utility Procurement Teams",
    quote: '"Our TENEX enrichment contract expires in 18 months. We don\'t have a validated alternative. The board is asking questions we can\'t answer."',
    role: "VP Supply Chain, US Nuclear Utility",
    pain: "You're locked into long-term contracts built for a pre-sanctions world. When Rosatom exposure becomes a regulatory or reputational liability, you need 18 months of lead time — not 18 days.",
    solution: "MINERVA monitors all five stages of the uranium fuel cycle — mining through fabrication — and gives you 47-day average early warning on supply disruptions. Turn geopolitical signals into contract renegotiations before the market prices in the shock.",
    metrics: [{ v: "47 days", l: "Avg. advance warning" }, { v: "$40M+", l: "Avg. fuel cost per reactor/yr" }, { v: "5 stages", l: "Full cycle coverage" }],
    color: C.accent,
  },
  {
    id: "trader", icon: "📈", tag: "Trading & Funds",
    title: "Uranium Traders & Commodity Funds",
    quote: '"In a market this thin, being 48 hours early on a Kazakhstan signal is the difference between alpha and being the exit liquidity."',
    role: "Portfolio Manager, Uranium Royalty Fund",
    pain: "The uranium spot market is illiquid. A small number of participants. Geopolitical signals move prices violently — but only if you see them first. By the time Bloomberg runs the story, you're trading against the news.",
    solution: "MINERVA's NLP pipeline processes parliamentary records, regulatory filings, satellite imagery and shipping data. Average lead time vs. mainstream financial media: 45-60 days. In a thin market, that's the entire trade.",
    metrics: [{ v: "45-60d", l: "Lead vs. Bloomberg" }, { v: "91%", l: "Top signal confidence" }, { v: "14,000+", l: "Daily signals monitored" }],
    color: C.gold,
  },
  {
    id: "government", icon: "🏛", tag: "Government Agencies",
    title: "Energy Security Agencies",
    quote: '"After the Rosatom dependency crisis, our minister needed a map of every chokepoint in the national fuel cycle within 72 hours. We didn\'t have one."',
    role: "Director, National Energy Security Office",
    pain: "Russia's invasion of Ukraine exposed every Western government's nuclear fuel dependency in real time — with no systematic intelligence infrastructure in place. The next crisis won't give you 72 hours.",
    solution: "MINERVA provides continuous, multi-jurisdictional monitoring of the full uranium fuel cycle with scenario modeling for supply shock events. From mine to reactor, mapped against geopolitical risk in real time.",
    metrics: [{ v: "Full cycle", l: "Mine to reactor" }, { v: "Multi-country", l: "Jurisdiction risk scoring" }, { v: "Secure", l: "Gov-grade deployment" }],
    color: C.cyan,
  },
  {
    id: "mining", icon: "⛏", tag: "Mining Companies",
    title: "Uranium Miners & Junior Developers",
    quote: '"We made a $120M commitment to a Kazakhstan JV in 2021. The geopolitical risk we were modeling turned out to be 10x worse than what our consultants told us."',
    role: "CEO, Junior Uranium Developer",
    pain: "Mining investment decisions require multi-year demand and geopolitical forecasting. A wrong call on a jurisdiction — Niger 2023, Kazakhstan 2022 — is a $50-150M write-down. Your consultants don't monitor the signals daily.",
    solution: "MINERVA provides continuous demand-side intelligence — reactor build pipelines, policy shifts, enrichment capacity changes — combined with jurisdiction risk scoring to support capital allocation decisions.",
    metrics: [{ v: "Real-time", l: "Jurisdiction risk scoring" }, { v: "10yr", l: "Demand forecast horizon" }, { v: "Policy", l: "Regulatory signal tracking" }],
    color: C.green,
  },
  {
    id: "smr", icon: "⚛", tag: "SMR Developers",
    title: "Advanced Reactor & SMR Developers",
    quote: '"We\'re spending $2B building a reactor that requires HALEU. There are currently two entities that can produce it. Neither is in a geopolitically stable situation."',
    role: "Chief Supply Chain Officer, SMR Developer",
    pain: "You're building fuel supply chains for reactor designs that don't exist at commercial scale — with no historical procurement data, no supplier relationships, and fuel types (HALEU) with near-zero existing production capacity.",
    solution: "MINERVA maps the emerging HALEU supply landscape, tracks DOE cost-share programs, monitors enrichment pathway viability, and gives you 10-year supply chain intelligence for next-generation fuel planning.",
    metrics: [{ v: "HALEU", l: "Supply chain mapping" }, { v: "DOE", l: "Policy & funding tracking" }, { v: "2035+", l: "Long-range forecasting" }],
    color: "#c084fc",
  },
];

const MINERALS = [
  { name: "Uranium", symbol: "U", status: "live", risk: 82, detail: "Full fuel cycle — Mining, Conversion, Enrichment, Fabrication" },
  { name: "Lithium", symbol: "Li", status: "q3", risk: 61, detail: "EV battery supply chains — Chile, Argentina, Australia" },
  { name: "Cobalt", symbol: "Co", status: "q3", risk: 74, detail: "Battery cathode — 70% Congo supply concentration" },
  { name: "Rare Earths", symbol: "REE", status: "q4", risk: 88, detail: "Magnet supply chain — China 98% processing share" },
  { name: "Gallium", symbol: "Ga", status: "q4", risk: 79, detail: "Semiconductor inputs — China export controls active" },
  { name: "Nickel", symbol: "Ni", status: "2027", risk: 44, detail: "Battery & steel — Indonesia, Philippines, Russia" },
];

const HOW_IT_WORKS = [
  { n: "01", icon: "📡", title: "Monitor", sub: "14,000+ daily signals",
    desc: "Continuous ingestion of parliamentary records, regulatory filings, satellite imagery, shipping AIS data, commodity trade flows, and diplomatic communications — across 60+ jurisdictions." },
  { n: "02", icon: "🧠", title: "Analyze", sub: "AI causal modeling",
    desc: "Large language models trained on mineral supply chain dynamics translate raw signals into supply chain impact assessments — mapped to specific minerals, stages, and price effects, with confidence scores." },
  { n: "03", icon: "⚡", title: "Act", sub: "Procurement recommendations",
    desc: "MINERVA closes the loop. Every analysis generates specific, time-bound procurement actions: buy, hedge, reroute, substitute, or wait — with projected financial impact and supplier alternatives." },
];

const PRICING = [
  { name: "Signal", price: "$2,500", period: "/month", tag: "Per mineral module",
    desc: "Single mineral module with daily intelligence briefings.",
    features: ["1 mineral module", "Daily alert digest", "3 user seats", "Supplier database access", "Email support"],
    cta: "Start Free Trial", highlight: false },
  { name: "Intelligence", price: "$7,500", period: "/month", tag: "Most popular",
    desc: "Real-time multi-mineral monitoring with AI recommendations.",
    features: ["3 mineral modules", "Real-time alerts", "15 user seats", "AI Signal Analyzer", "Procurement recommendations", "API access (1,000 calls/mo)", "Priority support"],
    cta: "Request Access", highlight: true },
  { name: "Command", price: "$18,000", period: "/month", tag: "Enterprise",
    desc: "Full spectrum critical mineral intelligence for large procurement teams.",
    features: ["All mineral modules", "Real-time + predictive", "Unlimited users", "Full API access", "Custom integrations", "Dedicated analyst", "SLA guarantee"],
    cta: "Contact Sales", highlight: false },
  { name: "Sovereign", price: "Custom", period: "", tag: "Government",
    desc: "Secure deployment for national energy security programs.",
    features: ["Air-gapped deployment option", "Multi-agency access", "Classified signal integration", "Custom reporting", "National security SLA", "On-site training"],
    cta: "Contact Us", highlight: false },
];

const FUEL_STAGES = [
  { id: "Mining", icon: "⛏", risk: 78, sub: "U₃O₈ Extraction", detail: "Kazakhstan 43% · Niger blocked · Canada stable" },
  { id: "Conversion", icon: "⚗", risk: 62, sub: "UF₆ Processing", detail: "Orano Malvési outage · ConverDyn limited" },
  { id: "Enrichment", icon: "☢", risk: 85, sub: "SWU Capacity", detail: "Rosatom 28% US · Urenco alternative" },
  { id: "Fabrication", icon: "🔩", risk: 44, sub: "Fuel Assembly", detail: "Westinghouse · GNF · TVEL (avoid)" },
];

const ALERTS_DEMO = [
  { severity: "critical", stage: "Enrichment", confidence: 91, time: "3h ago",
    title: "TENEX Under Expanded Sanctions Review",
    body: "91% probability of expanded Rosatom enrichment sanctions within 60 days. 28% US enrichment capacity at risk." },
  { severity: "high", stage: "Mining", confidence: 83, time: "6h ago",
    title: "Kazatomprom Q2 Output Cut 17%",
    body: "Sulfuric acid constraints forcing output revision. Kazakhstan = 43% global supply — Q3 tightening projected." },
  { severity: "high", stage: "Conversion", confidence: 77, time: "9h ago",
    title: "Orano Malvési Outage Extended 5–7 Weeks",
    body: "European UF₆ conversion slots disrupted. ConverDyn and Springfields only short-term alternatives." },
];

const DEMO_SCENARIOS = [
  { label: "Kazakhstan port closure", text: "Kazakhstan announces closure of Caspian Sea ferry routes for 30 days due to severe weather and infrastructure failures at Aktau port" },
  { label: "China uranium export ban", text: "China's Ministry of Commerce announces immediate export controls on uranium hexafluoride UF₆ and enriched uranium products effective next month" },
  { label: "Urenco strike action", text: "Trade unions at Urenco Capenhurst and Almelo enrichment facilities announce indefinite strike action over pay dispute affecting 14.5 million SWU annual capacity" },
  { label: "US Rosatom sanctions", text: "US Treasury announces comprehensive sanctions on Rosatom and TENEX prohibiting all SWU enrichment contracts with Russian entities effective 90 days" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const RC = (r) => r >= 80 ? C.accent : r >= 55 ? C.gold : C.green;
const SEV = { critical: C.accent, high: C.gold, medium: C.cyan, low: C.green };

function Tag({ children, color = C.accent }) {
  return (
    <span style={{ background: `${color}15`, color, border: `1px solid ${color}28`, borderRadius: 4, padding: "2px 9px", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: F.mono, display: "inline-block" }}>
      {children}
    </span>
  );
}

function RiskBar({ value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,.06)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color || RC(value), borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: color || RC(value), fontFamily: F.mono, minWidth: 24 }}>{value}</span>
    </div>
  );
}

function RiskArc({ value, size = 40 }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r, p = (value / 100) * c, col = RC(value);
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth="4"
        strokeDasharray={`${p} ${c}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fill={col} fontSize="10" fontWeight="700" fontFamily="'IBM Plex Mono',monospace">{value}</text>
    </svg>
  );
}

// ─── TICKER ───────────────────────────────────────────────────────────────────

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(255,107,53,.03)", overflow: "hidden", height: 34, display: "flex", alignItems: "center", position: "relative" }}>
      <div style={{ display: "flex", gap: 0, animation: "ticker 40s linear infinite", whiteSpace: "nowrap" }}>
        {items.map((t, i) => (
          <span key={i} style={{ fontSize: 10, fontFamily: F.mono, color: C.textMid, padding: "0 28px", borderRight: `1px solid ${C.border}` }}>
            <span style={{ color: C.accent }}>●</span> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────

function Nav({ onDemo }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 200, background: "rgba(5,8,16,.92)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${C.border}` }}>
      <Ticker />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 52px", flexWrap: "wrap", gap: 12 }}>
        <div onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ position: "relative", width: 30, height: 30 }}>
            <div style={{ position: "absolute", inset: 0, border: `1.5px solid ${C.accent}`, borderRadius: "50%", animation: "spin 12s linear infinite", opacity: .3 }} />
            <div style={{ position: "absolute", inset: 5, background: C.accent, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: C.bg }}>☢</div>
          </div>
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: 3, fontFamily: F.display, textTransform: "uppercase" }}>MINERVA</span>
          <span style={{ fontSize: 8, color: C.accent, fontWeight: 700, letterSpacing: 3 }}>AI</span>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 13, color: C.textDim, fontWeight: 500 }}>
          {[
            { label: "Platform", id: "platform" },
            { label: "Minerals", id: "minerals" },
            { label: "Pricing", id: "pricing" },
            { label: "About", id: "about" },
          ].map(l => (
            <span key={l.id} onClick={() => scrollTo(l.id)} style={{ color: C.textDim, cursor: "pointer", transition: "color .2s", userSelect: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = C.text} onMouseLeave={e => e.currentTarget.style.color = C.textDim}>{l.label}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textMid, borderRadius: 6, padding: "8px 20px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F.display, letterSpacing: 1, textTransform: "uppercase" }}>Sign In</button>
          <button onClick={onDemo} style={{ background: C.accent, color: C.bg, border: "none", borderRadius: 6, padding: "8px 22px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: F.display, letterSpacing: 1, textTransform: "uppercase", animation: "glow 4s infinite" }}>Try Uranium Demo →</button>
        </div>
      </div>
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function Hero({ onDemo }) {
  return (
    <section style={{ minHeight: "92vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", padding: "80px 52px" }}>
      {/* Animated grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`, backgroundSize: "56px 56px", animation: "gridDrift 14s linear infinite", opacity: .5 }} />
      {/* Glow orbs */}
      <div style={{ position: "absolute", top: "10%", right: "5%", width: 600, height: 600, background: "radial-gradient(circle, rgba(255,107,53,.07) 0%, transparent 65%)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: "5%", left: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(96,212,245,.04) 0%, transparent 65%)", borderRadius: "50%" }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div style={{ animation: "fadeUp .6s ease both" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accentDim, border: `1px solid ${C.borderAccent}`, borderRadius: 100, padding: "5px 16px", marginBottom: 32 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 10, color: C.accent, fontWeight: 600, letterSpacing: 2, fontFamily: F.mono }}>BUILT FOR NUCLEAR PROCUREMENT TEAMS</span>
            </div>

            <h1 style={{ fontSize: 78, fontWeight: 900, lineHeight: .96, letterSpacing: -1, margin: "0 0 24px", fontFamily: F.display, textTransform: "uppercase" }}>
              See Fuel Cycle<br />
              <span style={{ background: `linear-gradient(120deg, ${C.accent}, ${C.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Disruptions</span><br />
              47 Days Early.
            </h1>

            <p style={{ fontSize: 18, color: C.textMid, lineHeight: 1.75, maxWidth: 480, marginBottom: 40 }}>
              MINERVA monitors 14,000+ daily signals across mining, conversion, enrichment and fabrication — turning geopolitical events into specific procurement actions before the market prices in the shock.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={onDemo} style={{ background: C.accent, color: C.bg, border: "none", borderRadius: 7, padding: "14px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F.display, letterSpacing: 1.5, textTransform: "uppercase" }}>
                Try Uranium Demo →
              </button>
              <button style={{ background: "transparent", color: C.textMid, border: `1px solid ${C.border}`, borderRadius: 7, padding: "14px 32px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: F.display, letterSpacing: 1.5, textTransform: "uppercase" }}>
                Request Access
              </button>
            </div>

            <div style={{ display: "flex", gap: 32, marginTop: 48, paddingTop: 32, borderTop: `1px solid ${C.border}` }}>
              {[{ v: "47 days", l: "Avg. early warning" }, { v: "14,000+", l: "Daily signals" }, { v: "Full cycle", l: "Mine to reactor" }].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.accent, fontFamily: F.mono }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual - live risk panel */}
          <div style={{ animation: "fadeUp .6s ease .15s both" }}>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ background: "rgba(255,107,53,.06)", borderBottom: `1px solid ${C.border}`, padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "pulse 2s infinite" }} />
                  <span style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: 2 }}>LIVE · URANIUM MODULE</span>
                </div>
                <span style={{ fontSize: 10, color: C.accent, fontFamily: F.mono, fontWeight: 700 }}>RISK INDEX: 82/100 ↑ CRITICAL</span>
              </div>
              <div style={{ padding: "16px" }}>
                {ALERTS_DEMO.map((a, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,.02)", border: `1px solid ${C.border}`, borderLeft: `3px solid ${SEV[a.severity]}`, borderRadius: "0 8px 8px 0", padding: "10px 13px", marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ display: "flex", gap: 5 }}>
                        <Tag color={SEV[a.severity]}>{a.severity}</Tag>
                        <Tag color={C.textDim}>{a.stage}</Tag>
                      </div>
                      <span style={{ fontSize: 10, color: SEV[a.severity], fontFamily: F.mono, fontWeight: 700 }}>{a.confidence}%</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 3, fontFamily: F.display, letterSpacing: .3 }}>{a.title}</div>
                    <div style={{ fontSize: 10, color: C.textDim, lineHeight: 1.5 }}>{a.body}</div>
                  </div>
                ))}
                <button onClick={onDemo} style={{ width: "100%", background: C.accentDim, border: `1px solid ${C.borderAccent}`, color: C.accent, borderRadius: 7, padding: "10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: F.display, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4 }}>
                  Open Full Command Center →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PROBLEM ──────────────────────────────────────────────────────────────────

function Problem() {
  return (
    <section style={{ padding: "96px 52px", borderTop: `1px solid ${C.border}`, position: "relative" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Tag color={C.gold}>The Problem</Tag>
          <h2 style={{ fontSize: 60, fontWeight: 900, lineHeight: 1.0, letterSpacing: -1, margin: "20px 0 20px", fontFamily: F.display, textTransform: "uppercase" }}>
            Your Supply Chain Is Exposed.<br />
            <span style={{ color: C.textDim }}>You Just Don't Know It Yet.</span>
          </h2>
          <p style={{ fontSize: 17, color: C.textMid, lineHeight: 1.75, maxWidth: 620, margin: "0 auto" }}>
            Critical mineral supply chains are fragile, geopolitically concentrated, and monitored by no one systematically. The next disruption is already in the data.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
          {[
            { icon: "🌍", stat: "43%", desc: "Of global uranium mined in one country", sub: "Kazakhstan — one political crisis from a supply shock" },
            { icon: "⚠️", stat: "28%", desc: "US enrichment dependent on Rosatom", sub: "A sanctions liability that's been known for years" },
            { icon: "⏱", stat: "47 days", desc: "Average MINERVA lead vs. market awareness", sub: "Procurement actions executed before competitors know" },
          ].map((s, i) => (
            <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: "40px 36px", borderRadius: i === 0 ? "12px 0 0 12px" : i === 2 ? "0 12px 12px 0" : 0 }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{s.icon}</div>
              <div style={{ fontSize: 52, fontWeight: 900, color: C.accent, fontFamily: F.mono, lineHeight: 1, marginBottom: 12 }}>{s.stat}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: F.display, letterSpacing: .5, marginBottom: 8 }}>{s.desc}</div>
              <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PERSONAS ─────────────────────────────────────────────────────────────────

function Personas() {
  const [active, setActive] = useState(0);
  const p = PERSONAS[active];
  return (
    <section id="platform" style={{ padding: "96px 52px", borderTop: `1px solid ${C.border}`, background: "rgba(255,255,255,.01)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <Tag color={C.cyan}>Built For You</Tag>
          <h2 style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.0, letterSpacing: -1, margin: "20px 0 16px", fontFamily: F.display, textTransform: "uppercase" }}>
            Intelligence That Knows<br />Who It's Talking To
          </h2>
          <p style={{ fontSize: 16, color: C.textMid, maxWidth: 540, margin: "0 auto" }}>
            MINERVA isn't generic market data. Every module is built for a specific role, a specific decision, and a specific dollar value at stake.
          </p>
        </div>

        {/* Persona selector */}
        <div style={{ display: "flex", gap: 4, marginBottom: 32, background: "rgba(255,255,255,.02)", border: `1px solid ${C.border}`, borderRadius: 10, padding: 4, flexWrap: "wrap" }}>
          {PERSONAS.map((p, i) => (
            <button key={p.id} onClick={() => setActive(i)} style={{ flex: 1, minWidth: 140, padding: "10px 8px", fontSize: 11, fontWeight: active === i ? 700 : 500, background: active === i ? `${p.color}12` : "transparent", color: active === i ? p.color : C.textDim, border: `1px solid ${active === i ? `${p.color}30` : "transparent"}`, borderRadius: 7, cursor: "pointer", fontFamily: F.display, letterSpacing: .8, textTransform: "uppercase", transition: "all .2s", textAlign: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 3 }}>{p.icon}</div>
              {p.tag}
            </button>
          ))}
        </div>

        {/* Active persona detail */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, animation: "fadeIn .3s ease" }} key={active}>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: "36px 32px" }}>
            <div style={{ marginBottom: 20 }}>
              <Tag color={p.color}>{p.tag}</Tag>
              <h3 style={{ fontSize: 28, fontWeight: 800, fontFamily: F.display, letterSpacing: .5, margin: "12px 0 20px", lineHeight: 1.2 }}>{p.title}</h3>
              <div style={{ background: `${p.color}08`, border: `1px solid ${p.color}20`, borderLeft: `3px solid ${p.color}`, borderRadius: "0 8px 8px 0", padding: "14px 16px", marginBottom: 20 }}>
                <p style={{ fontSize: 14, color: C.textMid, fontStyle: "italic", lineHeight: 1.65, margin: 0 }}>{p.quote}</p>
                <div style={{ fontSize: 10, color: C.textDim, marginTop: 8, fontFamily: F.mono }}>— {p.role}</div>
              </div>
              <div style={{ fontSize: 8, color: C.textDim, letterSpacing: 2, fontFamily: F.mono, marginBottom: 8 }}>THE PAIN</div>
              <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.7 }}>{p.pain}</p>
            </div>
          </div>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: "36px 32px" }}>
            <div style={{ fontSize: 8, color: p.color, letterSpacing: 2, fontFamily: F.mono, marginBottom: 8, fontWeight: 700 }}>HOW MINERVA SOLVES IT</div>
            <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.75, marginBottom: 32 }}>{p.solution}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
              {p.metrics.map((m, i) => (
                <div key={i} style={{ background: `${p.color}08`, border: `1px solid ${p.color}18`, borderRadius: 8, padding: "14px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: p.color, fontFamily: F.mono }}>{m.v}</div>
                  <div style={{ fontSize: 9, color: C.textDim, marginTop: 4 }}>{m.l}</div>
                </div>
              ))}
            </div>
            <button style={{ width: "100%", background: `${p.color}15`, border: `1px solid ${p.color}35`, color: p.color, borderRadius: 7, padding: "11px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: F.display, letterSpacing: 1.5, textTransform: "uppercase" }}>
              Request Access — {p.tag} →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── MINERALS ─────────────────────────────────────────────────────────────────

function Minerals() {
  return (
    <section id="minerals" style={{ padding: "96px 52px", borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
          <div>
            <Tag color={C.accent}>Coverage</Tag>
            <h2 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.0, letterSpacing: -1, margin: "20px 0 20px", fontFamily: F.display, textTransform: "uppercase" }}>
              Every Critical<br />Mineral. One<br />
              <span style={{ color: C.accent }}>Intelligence Layer.</span>
            </h2>
            <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.75, marginBottom: 32 }}>
              Starting with Uranium — the most geopolitically complex mineral supply chain on the planet. Lithium, Cobalt, Rare Earths, and Gallium modules launching 2026–2027.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {MINERALS.map((m) => (
                <div key={m.name} style={{ background: m.status === "live" ? "rgba(255,107,53,.06)" : C.bgCard, border: `1px solid ${m.status === "live" ? C.borderAccent : C.border}`, borderRadius: 9, padding: "14px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: F.display, letterSpacing: .5 }}>{m.name}</div>
                      <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono }}>{m.symbol}</div>
                    </div>
                    <Tag color={m.status === "live" ? C.green : C.textDim}>{m.status === "live" ? "Live" : m.status.toUpperCase()}</Tag>
                  </div>
                  <RiskBar value={m.risk} />
                  <div style={{ fontSize: 9, color: C.textDim, marginTop: 6 }}>{m.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Uranium fuel cycle */}
          <div>
            <div style={{ fontSize: 8, color: C.textDim, letterSpacing: 2, fontFamily: F.mono, marginBottom: 16 }}>URANIUM — FULL FUEL CYCLE MONITORING</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {FUEL_STAGES.map((s) => (
                <div key={s.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, fontFamily: F.display, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 }}>{s.id}</div>
                  <div style={{ fontSize: 9, color: C.textDim, marginBottom: 10 }}>{s.sub}</div>
                  <RiskArc value={s.risk} size={44} />
                  <div style={{ fontSize: 8, color: C.textDim, marginTop: 7, lineHeight: 1.4 }}>{s.detail}</div>
                </div>
              ))}
            </div>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 9, padding: "14px 16px" }}>
              <div style={{ fontSize: 8, color: C.textDim, letterSpacing: 2, fontFamily: F.mono, marginBottom: 8 }}>UNIQUE TO URANIUM</div>
              <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.65 }}>Unlike any other critical mineral, uranium has a 5-stage fuel cycle with distinct geopolitical chokepoints at every stage. MINERVA monitors all of them — not just the mine.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────

function HowItWorks({ onDemo }) {
  return (
    <section style={{ padding: "96px 52px", borderTop: `1px solid ${C.border}`, background: "rgba(255,255,255,.01)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Tag color={C.cyan}>How It Works</Tag>
          <h2 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.0, letterSpacing: -1, margin: "20px 0 16px", fontFamily: F.display, textTransform: "uppercase" }}>
            Signal → Analysis → Action.<br /><span style={{ color: C.textDim }}>In Minutes, Not Months.</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3, marginBottom: 48 }}>
          {HOW_IT_WORKS.map((s, i) => (
            <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: "40px 32px", borderRadius: i === 0 ? "12px 0 0 12px" : i === 2 ? "0 12px 12px 0" : 0, position: "relative" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, fontFamily: F.mono, letterSpacing: 2, marginBottom: 20 }}>{s.n}</div>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: F.display, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: C.accent, fontFamily: F.mono, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>{s.sub}</div>
              <div style={{ fontSize: 14, color: C.textMid, lineHeight: 1.7 }}>{s.desc}</div>
              {i < 2 && <div style={{ position: "absolute", right: -16, top: "50%", fontSize: 20, color: C.textDim, zIndex: 1 }}>→</div>}
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <button onClick={onDemo} style={{ background: C.accent, color: C.bg, border: "none", borderRadius: 7, padding: "14px 36px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F.display, letterSpacing: 1.5, textTransform: "uppercase" }}>
            See It Live — Uranium Demo →
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── PRICING ──────────────────────────────────────────────────────────────────

function Pricing() {
  return (
    <section id="pricing" style={{ padding: "96px 52px", borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <Tag color={C.gold}>Pricing</Tag>
          <h2 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.0, letterSpacing: -1, margin: "20px 0 16px", fontFamily: F.display, textTransform: "uppercase" }}>
            ROI Measured In Avoided<br />Supply Chain Failures
          </h2>
          <p style={{ fontSize: 15, color: C.textMid, maxWidth: 500, margin: "0 auto" }}>A single reactor outage from fuel shortage costs $1-2M per day. MINERVA pays for itself on the first alert it prevents.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {PRICING.map((p, i) => (
            <div key={i} style={{ background: p.highlight ? "rgba(255,107,53,.07)" : C.bgCard, border: `1px solid ${p.highlight ? C.borderAccent : C.border}`, borderRadius: 12, padding: "32px 24px", position: "relative", display: "flex", flexDirection: "column" }}>
              {p.highlight && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: C.accent, color: C.bg, fontSize: 9, fontWeight: 700, padding: "3px 14px", borderRadius: 100, fontFamily: F.mono, letterSpacing: 1.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>Most Popular</div>}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>{p.tag}</div>
                <div style={{ fontSize: 26, fontWeight: 900, fontFamily: F.display, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: p.highlight ? C.accent : C.text, fontFamily: F.mono }}>{p.price}</span>
                  <span style={{ fontSize: 13, color: C.textDim }}>{p.period}</span>
                </div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 8, lineHeight: 1.5 }}>{p.desc}</div>
              </div>
              <div style={{ flex: 1, marginBottom: 24 }}>
                {p.features.map((f, j) => (
                  <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: C.green, fontSize: 12, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 12, color: C.textMid, lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
              <button style={{ width: "100%", background: p.highlight ? C.accent : "transparent", color: p.highlight ? C.bg : C.textMid, border: `1px solid ${p.highlight ? C.accent : C.border}`, borderRadius: 7, padding: "11px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: F.display, letterSpacing: 1.5, textTransform: "uppercase" }}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── ABOUT ────────────────────────────────────────────────────────────────────

function About() {
  return (
    <section id="about" style={{ padding: "96px 52px", borderTop: `1px solid ${C.border}`, background: "rgba(255,255,255,.01)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
          <div>
            <Tag color={C.cyan}>About MINERVA</Tag>
            <h2 style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.0, letterSpacing: -1, margin: "20px 0 24px", fontFamily: F.display, textTransform: "uppercase" }}>
              Bloomberg Was Built<br />For Stocks.<br />
              <span style={{ color: C.accent }}>We Built MINERVA</span><br />
              For Minerals.
            </h2>
            <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.75, marginBottom: 20 }}>
              Critical mineral supply chains run the modern economy — but they're monitored with spreadsheets, consultants, and PDFs from 2019. When Russia invaded Ukraine, every Western utility discovered their fuel cycle dependencies in real-time, with no warning, no plan B, and no time.
            </p>
            <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.75 }}>
              MINERVA exists because that should never happen again. We combine deep mineral supply chain expertise with frontier AI to give procurement teams, traders, and governments the intelligence layer that the 21st-century resource economy actually needs.
            </p>
          </div>
          <div>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 12 }}>
              <div style={{ fontSize: 8, color: C.textDim, letterSpacing: 2, fontFamily: F.mono, marginBottom: 14 }}>OUR APPROACH</div>
              <div style={{ display: "grid", gap: 18 }}>
                {[
                  { t: "Domain depth over horizontal AI", d: "Every model, every signal, every recommendation is built for one job: critical minerals. No generic LLM repackaging." },
                  { t: "Actionable, not informational", d: "Dashboards show data. MINERVA tells you what to do, when, with whom, and what it will cost or save." },
                  { t: "Trust through transparency", d: "Every recommendation comes with confidence scores, source attribution, and the chain of reasoning behind it." },
                ].map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 14 }}>
                    <div style={{ minWidth: 28, height: 28, borderRadius: "50%", background: C.accentDim, border: `1px solid ${C.borderAccent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.accent, fontFamily: F.mono }}>0{i + 1}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, letterSpacing: .3, marginBottom: 4 }}>{p.t}</div>
                      <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6 }}>{p.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {[
                { v: "2026", l: "Founded" },
                { v: "5", l: "Buyer segments" },
                { v: "6", l: "Mineral modules" },
              ].map((s, i) => (
                <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 9, padding: "16px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.accent, fontFamily: F.mono }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA({ onDemo }) {
  return (
    <section style={{ padding: "96px 52px", borderTop: `1px solid ${C.border}`, textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(255,107,53,.07) 0%, transparent 65%)" }} />
      <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>☢</div>
        <h2 style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.0, letterSpacing: -1, margin: "0 0 20px", fontFamily: F.display, textTransform: "uppercase" }}>
          The Next Disruption<br />
          <span style={{ background: `linear-gradient(120deg,${C.accent},${C.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Is Already In The Data.</span>
        </h2>
        <p style={{ fontSize: 17, color: C.textMid, lineHeight: 1.75, marginBottom: 40 }}>
          Join the waitlist for early access. Uranium module live now. Lithium and Cobalt launching Q3 2026.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
          <button onClick={onDemo} style={{ background: C.accent, color: C.bg, border: "none", borderRadius: 7, padding: "15px 36px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F.display, letterSpacing: 1.5, textTransform: "uppercase", animation: "glow 4s infinite" }}>
            Try Uranium Demo →
          </button>
          <button style={{ background: "transparent", color: C.textMid, border: `1px solid ${C.border}`, borderRadius: 7, padding: "15px 36px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: F.display, letterSpacing: 1.5, textTransform: "uppercase" }}>
            Join Waitlist
          </button>
        </div>
        <div style={{ fontSize: 12, color: C.textDim }}>40+ procurement teams, trading desks and government agencies on the waitlist.</div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, padding: "40px 52px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 22, height: 22, background: C.accent, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: C.bg, fontWeight: 900 }}>☢</div>
        <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: 3, fontFamily: F.display, textTransform: "uppercase" }}>MINERVA AI</span>
      </div>
      <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono }}>Critical Mineral Intelligence Platform · © 2026 MINERVA AI, Inc.</div>
      <div style={{ display: "flex", gap: 20, fontSize: 12, color: C.textDim }}>
        {["Privacy", "Terms", "Security", "Contact"].map(l => <span key={l} style={{ cursor: "pointer" }}>{l}</span>)}
      </div>
    </footer>
  );
}

// ─── FULL MARKETING SITE ──────────────────────────────────────────────────────

function MarketingSite({ onDemo }) {
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <style>{CSS}</style>
      <Nav onDemo={onDemo} />
      <Hero onDemo={onDemo} />
      <Problem />
      <Personas />
      <Minerals />
      <HowItWorks onDemo={onDemo} />
      <Pricing />
      <About />
      <CTA onDemo={onDemo} />
      <Footer />
    </div>
  );
}

// ─── URANIUM DEMO APP ─────────────────────────────────────────────────────────

const DEMO_ALERTS = [
  { id:1, severity:"critical", stage:"Enrichment", time:"3h ago", confidence:91, title:"TENEX Under Expanded Sanctions Review", body:"Congressional NLP analysis: 91% probability of expanded Rosatom enrichment sanctions within 60 days. 28% of US enrichment capacity faces acute re-contracting pressure.", source:"Congressional Record NLP · OFAC Tracker" },
  { id:2, severity:"high", stage:"Mining", time:"6h ago", confidence:83, title:"Kazatomprom Q2 Output Cut 17%", body:"Kazakhstan's state miner revises output downward due to sulfuric acid supply constraints. Kazakhstan = 43% global mined uranium.", source:"Production Filing Analysis · Satellite" },
  { id:3, severity:"high", stage:"Conversion", time:"9h ago", confidence:77, title:"Orano Malvési Outage Extended 5–7 Weeks", body:"European UF₆ conversion slots disrupted. ConverDyn and Springfields are the only short-term alternatives.", source:"Facility Monitoring · IAEA Notifications" },
  { id:4, severity:"medium", stage:"Mining", time:"1d ago", confidence:79, title:"Niger SOMAIR Export Normalisation Stalls", body:"SOMAIR/COMINAK full exports remain 4–6 months from resumption. Orano's Niger assets in ongoing legal dispute.", source:"Diplomatic Sentiment · Trade Flow Data" },
  { id:5, severity:"low", stage:"Fabrication", time:"2d ago", confidence:72, title:"Westinghouse SC Capacity Expansion Filed", body:"Positive demand signal: NRC filing for expanded fuel fabrication capacity signals growing LEU offtake through 2030.", source:"NRC Filing Analysis" },
];

const PRICE_HIST = { spot:[48.2,52.1,55.8,61.4,67.9,72.3,68.1,74.5,79.2,82.6,88.0,91.4], term:[56,57.5,59,61,63.5,65,64.5,67,70,72.5,75,77.5] };
const MONTHS_SHORT = ["May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr"];
const TC = { buy:C.green, reroute:C.cyan, hedge:"#c084fc", substitute:C.gold, wait:"#94a3b8" };
const UC = { immediate:C.accent, high:C.gold, medium:C.cyan, low:"#94a3b8", wait:"#94a3b8" };

function MiniPriceChart() {
  const all=[...PRICE_HIST.spot,...PRICE_HIST.term];
  const min=Math.min(...all)*.94, max=Math.max(...all)*1.03, range=max-min;
  const W=480,H=120,p={t:8,r:8,b:22,l:40},cw=W-p.l-p.r,ch=H-p.t-p.b;
  const xy=d=>d.map((v,i)=>({x:p.l+(i/(d.length-1))*cw,y:p.t+ch-((v-min)/range)*ch}));
  const sp=xy(PRICE_HIST.spot),tp=xy(PRICE_HIST.term);
  const sl=sp.map(q=>`${q.x},${q.y}`).join(" ");
  const tl=tp.map(q=>`${q.x},${q.y}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      <defs><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.accent} stopOpacity=".15"/><stop offset="100%" stopColor={C.accent} stopOpacity="0"/></linearGradient></defs>
      {[0,.25,.5,.75,1].map((t,i)=>{const y=p.t+ch*(1-t); return <g key={i}><line x1={p.l} y1={y} x2={W-p.r} y2={y} stroke="rgba(255,255,255,.04)"/><text x={p.l-5} y={y+3} textAnchor="end" fill="rgba(255,255,255,.22)" fontSize="8" fontFamily="'IBM Plex Mono'">${(min+range*t).toFixed(0)}</text></g>;})}
      {MONTHS_SHORT.map((m,i)=><text key={i} x={p.l+(i/(MONTHS_SHORT.length-1))*cw} y={H-3} textAnchor="middle" fill="rgba(255,255,255,.18)" fontSize="7" fontFamily="'IBM Plex Mono'">{m}</text>)}
      <polygon points={sl+` ${sp[sp.length-1].x},${p.t+ch} ${sp[0].x},${p.t+ch}`} fill="url(#g2)"/>
      <polyline points={sl} fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points={tl} fill="none" stroke={C.gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4,3"/>
      <circle cx={sp[sp.length-1].x} cy={sp[sp.length-1].y} r="3" fill={C.accent}/>
    </svg>
  );
}

async function callAnalyzeAPI(eventText) {
  const res = await fetch("/api/analyze", {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({eventText})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API error");
  return data;
}

function UraniumDemo({ onBack }) {
  const [tab, setTab] = useState("analyzer");
  const [time, setTime] = useState(new Date());
  const [signal, setSignal] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(()=>{ const t=setInterval(()=>setTime(new Date()),1000); return ()=>clearInterval(t); },[]);

  async function analyze() {
    if (!signal.trim()||analyzing) return;
    setAnalyzing(true); setResult(null); setError(null);
    try { setResult(await callAnalyzeAPI(signal)); }
    catch(e) { setError(e.message); }
    finally { setAnalyzing(false); }
  }

  const TABS = [{id:"analyzer",l:"AI Signal Analyzer"},{id:"risk",l:"Price & Risk"},{id:"suppliers",l:"Suppliers"},{id:"routes",l:"Routes"}];
  const SUPPLIERS = [
    {name:"Cameco",flag:"🇨🇦",stage:"Mining+Conv",cap:"High",risk:12,status:"available",rating:4.7,lead:"LT",premium:"+4%"},
    {name:"Orano Mining",flag:"🇫🇷",stage:"Mining+Conv",cap:"Medium",risk:22,status:"available",rating:4.3,lead:"6-9mo",premium:"+7%"},
    {name:"Urenco",flag:"🇬🇧",stage:"Enrichment",cap:"High",risk:9,status:"available",rating:4.8,lead:"LT",premium:"+11%"},
    {name:"ConverDyn",flag:"🇺🇸",stage:"Conversion",cap:"Low-Med",risk:8,status:"limited",rating:4.5,lead:"12mo",premium:"+14%"},
    {name:"Paladin Energy",flag:"🇳🇦",stage:"Mining",cap:"Medium",risk:19,status:"available",rating:3.9,lead:"8-12mo",premium:"+9%"},
    {name:"Centrus/HALEU",flag:"🇺🇸",stage:"HALEU",cap:"Low",risk:7,status:"limited",rating:4.2,lead:"18-24mo",premium:"+38%"},
  ];
  const ROUTES = [
    {from:"Inkai, Kazakhstan",to:"Blind River, Canada",via:"Trans-Caspian → Hamburg",status:"elevated",risk:61,days:52,note:"Trans-Caspian adds 18 days vs Russia transit"},
    {from:"Cigar Lake, Canada",to:"Metropolis, Illinois",via:"Trans-Canada highway",status:"normal",risk:9,days:12,note:"Fully operational domestic route"},
    {from:"Langer Heinrich, Namibia",to:"Springfields, UK",via:"Cape Town → Atlantic",status:"normal",risk:13,days:26,note:"Recommended for European fuel cycle"},
    {from:"SOMAIR, Niger",to:"Orano, France",via:"Trans-Sahara → Mediterranean",status:"critical",risk:94,days:38,note:"Post-coup export suspension. BLOCKED."},
  ];
  const RtC={normal:C.green,elevated:C.gold,critical:C.accent};

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:F.body}}>
      <style>{CSS}</style>
      {/* Top bar */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 20px",borderBottom:`1px solid ${C.border}`,background:"rgba(5,8,16,.95)",position:"sticky",top:0,zIndex:100,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:24,height:24,background:C.accent,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:C.bg,fontWeight:900}}>☢</div>
          <span style={{fontSize:14,fontWeight:900,letterSpacing:2,fontFamily:F.display,textTransform:"uppercase"}}>MINERVA URANIUM</span>
          <span style={{fontSize:8,color:C.textDim,fontFamily:F.mono,letterSpacing:2}}>COMMAND CENTER</span>
        </div>
        <div style={{display:"flex",gap:18,alignItems:"center",flexWrap:"wrap"}}>
          {[{l:"SPOT",v:"$91.40",c:C.accent},{l:"TERM",v:"$77.50",c:C.gold},{l:"KAZ RISK",v:"78/100",c:C.gold},{l:"TENEX",v:"28% ⚠",c:C.accent}].map((s,i)=>(
            <div key={i} style={{textAlign:"center",borderLeft:i>0?`1px solid ${C.border}`:"none",paddingLeft:i>0?18:0}}>
              <div style={{fontSize:13,fontWeight:800,color:s.c,fontFamily:F.mono}}>{s.v}</div>
              <div style={{fontSize:7,color:C.textDim,letterSpacing:1}}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:C.green,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:9,color:C.textDim,fontFamily:F.mono}}>LIVE · {time.toLocaleTimeString()}</span>
          </div>
          <button onClick={onBack} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.textDim,borderRadius:5,padding:"5px 12px",fontSize:10,cursor:"pointer",fontFamily:F.display,letterSpacing:1,textTransform:"uppercase"}}>← Site</button>
        </div>
      </div>

      {/* Fuel cycle bar */}
      <div style={{background:"rgba(255,255,255,.015)",borderBottom:`1px solid ${C.border}`,padding:"7px 18px",display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:8,color:C.textDim,fontFamily:F.mono,letterSpacing:2,marginRight:8}}>FUEL CYCLE</span>
        {FUEL_STAGES.map((s,i)=>(
          <div key={s.id} style={{display:"flex",alignItems:"center",gap:3}}>
            <div style={{background:"rgba(255,255,255,.03)",border:`1px solid ${C.border}`,borderRadius:5,padding:"3px 9px",display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:10}}>{s.icon}</span>
              <span style={{fontSize:9,fontWeight:700,color:C.textMid,fontFamily:F.display,letterSpacing:1,textTransform:"uppercase"}}>{s.id}</span>
              <span style={{fontSize:9,fontWeight:700,color:RC(s.risk),fontFamily:F.mono}}>{s.risk}</span>
            </div>
            {i<3&&<span style={{color:C.textDim,fontSize:11}}>→</span>}
          </div>
        ))}
      </div>

      {/* Layout */}
      <div style={{display:"grid",gridTemplateColumns:"272px 1fr",height:"calc(100vh - 94px)",overflow:"hidden"}}>
        {/* Alerts */}
        <div style={{borderRight:`1px solid ${C.border}`,padding:12,overflowY:"auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
            <span style={{fontSize:8,fontWeight:700,color:C.textDim,letterSpacing:2,fontFamily:F.mono}}>PREDICTIVE ALERTS</span>
            <span style={{background:`${C.accent}15`,color:C.accent,fontSize:8,fontWeight:700,padding:"2px 6px",borderRadius:3}}>2 URGENT</span>
          </div>
          {DEMO_ALERTS.map((a,i)=>(
            <div key={a.id} style={{background:"rgba(255,255,255,.016)",border:`1px solid ${C.border}`,borderLeft:`3px solid ${SEV[a.severity]}`,borderRadius:"0 7px 7px 0",padding:"9px 11px",marginBottom:7,animation:`fadeUp .4s ease ${i*.07}s both`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <div style={{display:"flex",gap:4}}>
                  <Tag color={SEV[a.severity]}>{a.severity}</Tag>
                  <Tag color={C.textDim}>{a.stage}</Tag>
                </div>
                <span style={{fontSize:8,fontWeight:700,color:SEV[a.severity],fontFamily:F.mono}}>{a.confidence}%</span>
              </div>
              <div style={{fontSize:11,fontWeight:700,color:C.text,marginBottom:2,lineHeight:1.3,fontFamily:F.display}}>{a.title}</div>
              <div style={{fontSize:9,color:C.textDim,lineHeight:1.5}}>{a.body}</div>
            </div>
          ))}
        </div>

        {/* Main */}
        <div style={{overflowY:"auto",padding:16}}>
          <div style={{display:"flex",gap:3,marginBottom:16,background:"rgba(255,255,255,.02)",border:`1px solid ${C.border}`,borderRadius:8,padding:3}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"8px 0",fontSize:11,fontWeight:tab===t.id?700:500,background:tab===t.id?C.accentDim:"transparent",color:tab===t.id?C.accent:C.textDim,border:`1px solid ${tab===t.id?"rgba(255,107,53,.28)":"transparent"}`,borderRadius:6,cursor:"pointer",fontFamily:F.display,letterSpacing:1,textTransform:"uppercase",transition:"all .2s"}}>
                {t.l}
              </button>
            ))}
          </div>

          {/* AI ANALYZER */}
          {tab==="analyzer"&&(
            <div style={{animation:"fadeUp .3s ease both"}}>
              <div style={{background:`${C.accent}08`,border:`1px solid ${C.accent}22`,borderRadius:10,padding:"14px 16px",marginBottom:14}}>
                <div style={{fontSize:9,fontWeight:700,color:C.accent,letterSpacing:2,fontFamily:F.mono,marginBottom:5}}>☢ AI SIGNAL ANALYZER — LIVE</div>
                <div style={{fontSize:13,color:C.textMid,lineHeight:1.6}}>Type any geopolitical event or news headline. MINERVA AI analyzes uranium supply chain impact and generates specific procurement recommendations in real time.</div>
              </div>
              <div style={{marginBottom:11}}>
                <div style={{fontSize:8,color:C.textDim,letterSpacing:2,fontFamily:F.mono,marginBottom:6}}>EXAMPLE SCENARIOS →</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {DEMO_SCENARIOS.map((s,i)=>(
                    <button key={i} onClick={()=>{setSignal(s.text);setResult(null);setError(null);}} style={{background:"rgba(255,255,255,.03)",border:`1px solid ${C.border}`,color:C.textMid,borderRadius:5,padding:"5px 11px",fontSize:10,cursor:"pointer",fontFamily:F.display,letterSpacing:.8,textTransform:"uppercase",whiteSpace:"nowrap"}}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{background:"rgba(255,255,255,.018)",border:`1px solid ${C.border}`,borderRadius:10,padding:14,marginBottom:14}}>
                <div style={{fontSize:8,color:C.textDim,letterSpacing:2,fontFamily:F.mono,marginBottom:7}}>INPUT SIGNAL</div>
                <textarea value={signal} onChange={e=>setSignal(e.target.value)} placeholder="Paste any geopolitical event, news headline, or intelligence signal..." rows={3}
                  style={{width:"100%",background:"transparent",border:"none",outline:"none",color:C.text,fontSize:13,lineHeight:1.6,fontFamily:F.body,resize:"none",padding:0}}/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:9,paddingTop:9,borderTop:`1px solid ${C.border}`}}>
                  <span style={{fontSize:10,color:C.textDim,fontFamily:F.mono}}>{signal.length} chars</span>
                  <button onClick={analyze} disabled={!signal.trim()||analyzing}
                    style={{background:signal.trim()&&!analyzing?C.accent:"rgba(255,255,255,.06)",color:signal.trim()&&!analyzing?C.bg:C.textDim,border:"none",borderRadius:6,padding:"9px 22px",fontSize:12,fontWeight:700,cursor:signal.trim()&&!analyzing?"pointer":"not-allowed",fontFamily:F.display,letterSpacing:1.5,textTransform:"uppercase",transition:"all .2s"}}>
                    {analyzing?"Analyzing...":"Analyze Signal →"}
                  </button>
                </div>
              </div>
              {analyzing&&<div style={{background:`${C.accent}08`,border:`1px solid ${C.accent}18`,borderRadius:10,padding:"22px",textAlign:"center",marginBottom:14}}>
                <div style={{fontSize:18,animation:"spin 1s linear infinite",display:"inline-block",marginBottom:8}}>☢</div>
                <div style={{fontSize:12,color:C.textMid,fontFamily:F.mono,animation:"shimmer 1.5s infinite"}}>Scanning 14,000+ signals · Mapping fuel cycle impact · Generating recommendations...</div>
              </div>}
              {error&&<div style={{background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.2)",borderRadius:10,padding:"12px 14px",marginBottom:14,color:"#f87171",fontSize:12}}>⚠ {error}</div>}
              {result&&!analyzing&&(
                <div style={{animation:"fadeUp .4s ease both"}}>
                  <div style={{background:"rgba(255,255,255,.018)",border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:11}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:13}}>
                      <div>
                        <div style={{fontSize:8,color:C.accent,fontWeight:700,letterSpacing:2,fontFamily:F.mono,marginBottom:4}}>MINERVA ANALYSIS · {new Date().toLocaleTimeString()}</div>
                        <div style={{fontSize:17,fontWeight:800,fontFamily:F.display,letterSpacing:.3,lineHeight:1.2}}>{result.eventTitle}</div>
                        <div style={{marginTop:6,display:"flex",gap:5,flexWrap:"wrap"}}>
                          <Tag color={UC[result.urgency]||"#94a3b8"}>{result.urgency} urgency</Tag>
                          {(result.affectedStages||[]).map(s=><Tag key={s} color={C.textDim}>{s}</Tag>)}
                        </div>
                      </div>
                      <div style={{textAlign:"center",minWidth:72}}>
                        <div style={{fontSize:32,fontWeight:900,color:RC(result.impactScore),fontFamily:F.mono,lineHeight:1}}>{result.impactScore}</div>
                        <div style={{fontSize:7,color:C.textDim}}>IMPACT /100</div>
                      </div>
                    </div>
                    <div style={{background:`${C.accent}06`,border:`1px solid ${C.accent}12`,borderRadius:7,padding:"9px 13px",marginBottom:11}}>
                      <div style={{fontSize:12,color:C.textMid,lineHeight:1.55}}>{result.keyRisk}</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
                      {[{l:"SPOT IMPACT",v:result.spotPriceImpact,c:C.accent},{l:"TERM IMPACT",v:result.termPriceImpact,c:C.gold},{l:"TIME TO IMPACT",v:result.timeToImpact,c:C.cyan},{l:"LEAD VS MARKET",v:result.leadVsMarket,c:C.green}].map((d,i)=>(
                        <div key={i} style={{background:"rgba(255,255,255,.02)",borderRadius:6,padding:"8px 9px"}}>
                          <div style={{fontSize:7,color:C.textDim,fontWeight:700,letterSpacing:1,marginBottom:3,fontFamily:F.mono}}>{d.l}</div>
                          <div style={{fontSize:10,fontWeight:700,color:d.c,fontFamily:F.mono,lineHeight:1.3}}>{d.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{fontSize:8,color:C.textDim,letterSpacing:2,fontFamily:F.mono,marginBottom:9}}>AI-GENERATED PROCUREMENT RECOMMENDATIONS</div>
                  {(result.recommendations||[]).map((r,i)=>(
                    <div key={i} style={{background:"rgba(255,255,255,.018)",border:`1px solid ${C.border}`,borderRadius:10,padding:14,marginBottom:9,animation:`fadeUp .4s ease ${i*.1}s both`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div style={{display:"flex",gap:9,alignItems:"flex-start"}}>
                          <span style={{fontSize:18}}>{r.icon}</span>
                          <div>
                            <Tag color={TC[r.type]||"#94a3b8"}>{r.type}</Tag>
                            <div style={{fontSize:13,fontWeight:700,fontFamily:F.display,lineHeight:1.3,marginTop:4}}>{r.action}</div>
                            {r.supplier&&<div style={{fontSize:10,color:C.accent,marginTop:2,fontFamily:F.mono}}>→ {r.supplier}</div>}
                          </div>
                        </div>
                        <div style={{textAlign:"right",minWidth:55}}>
                          <div style={{fontSize:16,fontWeight:800,color:C.accent,fontFamily:F.mono}}>{r.confidence}%</div>
                          <div style={{fontSize:7,color:C.textDim}}>CONF.</div>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:7,marginLeft:27}}>
                        <div style={{background:`${C.green}08`,border:`1px solid ${C.green}18`,borderRadius:6,padding:"6px 10px",flex:1}}>
                          <div style={{fontSize:7,color:C.textDim,letterSpacing:1,marginBottom:2,fontFamily:F.mono}}>VALUE</div>
                          <div style={{fontSize:10,color:C.green,fontWeight:600}}>💰 {r.projectedSaving}</div>
                        </div>
                        <div style={{background:`${C.gold}08`,border:`1px solid ${C.gold}18`,borderRadius:6,padding:"6px 10px",flex:1}}>
                          <div style={{fontSize:7,color:C.textDim,letterSpacing:1,marginBottom:2,fontFamily:F.mono}}>DEADLINE</div>
                          <div style={{fontSize:10,color:C.gold,fontWeight:600}}>⏰ {r.deadline}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RISK TAB */}
          {tab==="risk"&&(
            <div style={{animation:"fadeUp .3s ease both"}}>
              <div style={{background:"rgba(255,255,255,.018)",border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                  <div>
                    <div style={{fontSize:8,color:C.textDim,letterSpacing:2,fontFamily:F.mono,marginBottom:2}}>U₃O₈ PRICE — 12 MONTHS</div>
                    <div style={{fontSize:24,fontWeight:900,fontFamily:F.mono}}>$91.40 <span style={{fontSize:11,color:C.textDim}}>/lb</span></div>
                    <div style={{fontSize:12,fontWeight:700,color:C.accent,fontFamily:F.mono}}>▲ +23.4%</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{display:"flex",gap:12,justifyContent:"flex-end",marginBottom:5}}>
                      <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:14,height:2,background:C.accent}}/><span style={{fontSize:10,color:C.textDim}}>Spot</span></div>
                      <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:14,height:2,background:C.gold}}/><span style={{fontSize:10,color:C.textDim}}>Term</span></div>
                    </div>
                    <div style={{fontSize:12,fontWeight:700,color:C.gold,fontFamily:F.mono}}>Term: $77.50/lb</div>
                  </div>
                </div>
                <MiniPriceChart/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
                {FUEL_STAGES.map(s=>(
                  <div key={s.id} style={{background:"rgba(255,255,255,.018)",border:`1px solid ${C.border}`,borderRadius:9,padding:"13px 11px",textAlign:"center"}}>
                    <div style={{fontSize:16,marginBottom:7}}>{s.icon}</div>
                    <div style={{fontSize:11,fontWeight:800,fontFamily:F.display,letterSpacing:1.5,textTransform:"uppercase",marginBottom:2}}>{s.id}</div>
                    <div style={{fontSize:8,color:C.textDim,marginBottom:8}}>{s.sub}</div>
                    <RiskArc value={s.risk} size={44}/>
                    <div style={{fontSize:8,color:C.textDim,marginTop:6,lineHeight:1.4}}>{s.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUPPLIERS TAB */}
          {tab==="suppliers"&&(
            <div style={{animation:"fadeUp .3s ease both"}}>
              <div style={{fontSize:8,color:C.textDim,letterSpacing:2,fontFamily:F.mono,marginBottom:11}}>NON-RUSSIAN ALTERNATIVE SUPPLIERS · ALL FUEL CYCLE STAGES</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {SUPPLIERS.map((s,i)=>(
                  <div key={i} style={{background:"rgba(255,255,255,.018)",border:`1px solid ${C.border}`,borderRadius:10,padding:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:18}}>{s.flag}</span>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,fontFamily:F.display}}>{s.name}</div>
                          <div style={{display:"flex",gap:4,marginTop:2}}>
                            <Tag color={s.status==="available"?C.green:C.gold}>{s.status}</Tag>
                            <span style={{fontSize:8,color:C.textDim,padding:"2px 0"}}>{s.stage}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:F.mono,fontSize:14,fontWeight:800,color:C.gold}}>★ {s.rating}</div>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,marginBottom:8}}>
                      {[{l:"CAP",v:s.cap,c:s.cap==="High"?C.green:C.gold},{l:"LEAD",v:s.lead,c:C.cyan},{l:"PREMIUM",v:s.premium,c:C.gold},{l:"GEO RISK",v:`${s.risk}/100`,c:s.risk<=15?C.green:s.risk<=25?C.gold:C.accent}].map((d,j)=>(
                        <div key={j} style={{background:"rgba(255,255,255,.02)",borderRadius:5,padding:"5px",textAlign:"center"}}>
                          <div style={{fontSize:6,color:C.textDim,letterSpacing:1,fontFamily:F.mono,marginBottom:2}}>{d.l}</div>
                          <div style={{fontSize:9,fontWeight:700,color:d.c,fontFamily:F.mono}}>{d.v}</div>
                        </div>
                      ))}
                    </div>
                    <button style={{background:C.accent,color:C.bg,border:"none",borderRadius:5,padding:"5px 12px",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:F.display,letterSpacing:1.5,textTransform:"uppercase"}}>Request Quote</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ROUTES TAB */}
          {tab==="routes"&&(
            <div style={{animation:"fadeUp .3s ease both"}}>
              <div style={{fontSize:8,color:C.textDim,letterSpacing:2,fontFamily:F.mono,marginBottom:11}}>URANIUM TRANSPORT ROUTE INTELLIGENCE</div>
              {ROUTES.map((r,i)=>{
                const rc=RtC[r.status];
                return (
                  <div key={i} style={{background:"rgba(255,255,255,.018)",border:`1px solid ${C.border}`,borderLeft:`3px solid ${rc}`,borderRadius:"0 10px 10px 0",padding:14,marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}>
                      <div>
                        <div style={{display:"flex",gap:5,marginBottom:5}}>
                          <Tag color={rc}>{r.status}</Tag>
                          <span style={{fontSize:9,color:rc,fontWeight:700,fontFamily:F.mono}}>{r.risk}/100</span>
                        </div>
                        <div style={{fontSize:13,fontWeight:700,fontFamily:F.display,marginBottom:2}}>
                          <span style={{color:C.accent}}>{r.from}</span>
                          <span style={{color:C.textDim,margin:"0 7px"}}>→</span>
                          <span>{r.to}</span>
                        </div>
                        <div style={{fontSize:10,color:C.textDim}}>Via: {r.via}</div>
                      </div>
                      <div style={{textAlign:"right",minWidth:55}}>
                        <div style={{fontFamily:F.mono,fontSize:20,fontWeight:900}}>{r.days}</div>
                        <div style={{fontSize:8,color:C.textDim}}>days</div>
                      </div>
                    </div>
                    <div style={{background:r.status==="normal"?`${C.green}06`:`${C.accent}06`,border:`1px solid ${r.status==="normal"?`${C.green}15`:`${C.accent}15`}`,borderRadius:6,padding:"7px 11px",display:"flex",gap:7}}>
                      <span>{r.status==="normal"?"✅":r.status==="critical"?"🚫":"⚠️"}</span>
                      <div style={{fontSize:10,color:C.textDim,lineHeight:1.45}}>{r.note}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("site");
  return view === "demo"
    ? <UraniumDemo onBack={() => setView("site")} />
    : <MarketingSite onDemo={() => setView("demo")} />;
}
