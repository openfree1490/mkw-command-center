import { useState, useEffect } from 'react'

const STOCKS = [
  { tk:"TSEM",nm:"Tower Semiconductor",px:141.96,dp:2.97,wp:18.85,mp:12.79,
    wein:{stage:"2A",ma:"$120.01 ↑11wk",vol:"2.3x"},
    min:{tpl:8,rs:99,vcp:"3ct (18→10→5.2%)",pivot:138.50,eps:34,rev:22},
    kell:{phase:"EMA Crossback→Pop",emaD:"bull",emaW:"bull",emaM:"bull",light:"green",base:1},
    conv:{score:22,max:22,zone:"CONVERGENCE"},
    setup:"Full convergence — VCP pivot cleared on 2.3x vol at EMA crossback. RS 99, 3/3 EMA alignment.",
    opt:"$140C Apr17 · IVR 38",risk:"SOX sector pullback",flags:[] },
  { tk:"RKLB",nm:"Rocket Lab USA",px:27.84,dp:4.12,wp:11.30,mp:8.45,
    wein:{stage:"2A",ma:"$22.10 ↑8wk",vol:"1.8x"},
    min:{tpl:8,rs:94,vcp:"2ct (22→9%)",pivot:26.50,eps:0,rev:55},
    kell:{phase:"EMA Crossback",emaD:"bull",emaW:"bull",emaM:"bull",light:"green",base:1},
    conv:{score:20,max:22,zone:"CONVERGENCE"},
    setup:"1st base EMA crossback — VCP tightening, 55% rev growth. Pre-profit but strong technicals.",
    opt:"$28C May16 · IVR 42",risk:"Pre-profit. Size smaller.",flags:["EPS negative"] },
  { tk:"DELL",nm:"Dell Technologies",px:149.21,dp:-2.48,wp:1.25,mp:25.32,
    wein:{stage:"2B",ma:"$128.40 ↑16wk",vol:"0.9x"},
    min:{tpl:8,rs:80,vcp:"2ct (15→8%)",pivot:152.00,eps:18,rev:12},
    kell:{phase:"Base n Break",emaD:"neutral",emaW:"bull",emaM:"bull",light:"green",base:2},
    conv:{score:17,max:22,zone:"SECONDARY"},
    setup:"2nd base near EMAs — waiting $152 pivot. Later stage = tighter stop.",
    opt:"Wait for confirm",risk:"2nd base lower success rate",flags:["Stage 2B","Base #2"] },
  { tk:"CF",nm:"CF Industries",px:126.73,dp:2.79,wp:5.49,mp:27.42,
    wein:{stage:"2A",ma:"$105.60 ↑9wk",vol:"1.2x"},
    min:{tpl:7,rs:57,vcp:"—",pivot:null,eps:28,rev:15},
    kell:{phase:"EMA Crossback",emaD:"bull",emaW:"bull",emaM:"bull",light:"green",base:1},
    conv:{score:14,max:22,zone:"BUILDING"},
    setup:"EMA crossback in play but RS 57 fails Minervini criterion. Watch for RS improvement.",
    opt:"No play until RS>70",risk:"RS < 70 — not a leader",flags:["RS < 70","No VCP"] },
  { tk:"GKOS",nm:"Glaukos Corp",px:103.22,dp:0.28,wp:0.35,mp:-11.85,
    wein:{stage:"2A",ma:"$95.80 ↑5wk",vol:"0.7x"},
    min:{tpl:7,rs:44,vcp:"2ct (20→12%)",pivot:108.00,eps:0,rev:18},
    kell:{phase:"Wedge",emaD:"bull",emaW:"bull",emaM:"neutral",light:"green",base:1},
    conv:{score:11,max:22,zone:"BUILDING"},
    setup:"Wedge forming but RS 44 weak. Needs breakout + RS surge to qualify.",
    opt:"No play",risk:"Weak RS, pre-profit",flags:["RS < 70","Monthly negative"] },
  { tk:"SMG",nm:"Scotts Miracle-Gro",px:64.47,dp:3.57,wp:2.69,mp:-6.77,
    wein:{stage:"1B",ma:"$63.10 flat",vol:"0.8x"},
    min:{tpl:1,rs:38,vcp:"—",pivot:null,eps:-12,rev:3},
    kell:{phase:"Wedge Pop attempt",emaD:"neutral",emaW:"bull",emaM:"neutral",light:"yellow",base:0},
    conv:{score:4,max:22,zone:"WATCH"},
    setup:"Late Stage 1 — potential transition. Far from convergence. Watch only.",
    opt:"No play",risk:"Not investable under MKW",flags:["1/8 template","Neg EPS","Stage 1"] },
];

const THREATS = [
  { tk:"CVNA",sc:9.1,type:"Bull Trap",sum:"Dark pool short volume 73.6%, insiders liquidated $1B+, subprime auto loan deterioration projected Q2-Q3 2026.",sf:10.6,mc:-12.9,exits:["S3→S4 (Weinstein)","Template failing (Minervini)","Wedge Drop (Kell)"] },
  { tk:"HIMS",sc:7.8,type:"Momentum Reversal",sum:"WSB mentions surging while price collapses 33%. All 3 frameworks signal exit.",sf:40.8,mc:-33.0,exits:["Stage 4 confirmed","0/8 Template","Red Light — below EMAs"] },
  { tk:"SMCI",sc:8.4,type:"Accounting Risk",sum:"Repeated restatement concerns. Institutional selling accelerating.",sf:15.2,mc:-18.5,exits:["Stage 4","Failed VCP","Exhaustion→Wedge Drop"] },
];

const JOURNAL = [
  { id:1,d:"03-17",tk:"TSEM",a:"BUY",st:"$140C 04/17",pnl:43.5,conv:"PRIMARY",n:"Full convergence VCP pop" },
  { id:2,d:"03-14",tk:"CF",a:"BUY",st:"$125C 04/17",pnl:27.1,conv:"PARTIAL",n:"EMA crossback, RS<70" },
  { id:3,d:"03-10",tk:"NVDA",a:"STOP",st:"$950C 03/21",pnl:-100,conv:"EXIT",n:"S3 transition — sold per MKW" },
];

const MKT = { spxStage:2, spxEma:"above", tplCount:847, vix:22.45, a50:54.2, a200:61.8,
  sec:[{n:"Energy",p:4.2},{n:"Tech",p:0.8},{n:"Health",p:-0.3},{n:"Finance",p:1.1},{n:"Indust",p:2.4},{n:"ConDisc",p:-1.8},{n:"ConStp",p:0.2},{n:"Matrl",p:3.1},{n:"RealEst",p:-0.9},{n:"Util",p:0.1},{n:"Comms",p:-0.5}] };

// ═══ FUTURISTIC COLOR SYSTEM ═══
const K = {
  void: "#020408",
  panel: "#080d16",
  raised: "#0e1520",
  ghost: "#141e2e",
  edge: "#1b2a40",
  edgeLit: "#243856",
  text: "#8899b4",
  textMid: "#a0b4d0",
  textHi: "#dce8ff",
  white: "#f0f4ff",
  neon: "#00ff88",
  neonDim: "#00ff8840",
  neonGlow: "#00ff8818",
  ember: "#ff2a44",
  emberDim: "#ff2a4440",
  emberGlow: "#ff2a4415",
  sol: "#ffcc00",
  solDim: "#ffcc0040",
  solGlow: "#ffcc0012",
  arc: "#00ccff",
  arcDim: "#00ccff40",
  arcGlow: "#00ccff12",
  prism: "#a855f7",
  prismDim: "#a855f740",
};
const ZONE_K = { CONVERGENCE: K.sol, SECONDARY: K.arc, BUILDING: K.prism, WATCH: K.text };

// Fonts
const hd = "'Orbitron', sans-serif";   // Headlines, tickers, numbers
const bd = "'Rajdhani', sans-serif";   // Body, descriptions
const mn = "'Share Tech Mono', monospace"; // Data, values

// ═══ COMPONENTS ═══
const Pc = ({ v, s = 12 }) => v == null
  ? <span style={{ color: K.text, fontSize: s }}>—</span>
  : <span style={{
      fontSize: s, fontFamily: mn, fontWeight: 600, letterSpacing: 0.5,
      color: v >= 0 ? K.neon : K.ember,
      textShadow: v >= 0 ? `0 0 8px ${K.neonDim}` : `0 0 8px ${K.emberDim}`,
    }}>{v >= 0 ? "+" : ""}{v.toFixed(2)}%</span>;

const Orb = ({ c, sz = 8 }) => <div style={{
  width: sz, height: sz, borderRadius: "50%", background: c,
  boxShadow: `0 0 6px ${c}80, 0 0 2px ${c}`,
}} />;

const ConvMeter = ({ score, max }) => {
  const pct = (score / max) * 100;
  const c = score >= 20 ? K.sol : score >= 15 ? K.arc : score >= 10 ? K.prism : K.text;
  return <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <div style={{ width: 52, height: 6, background: K.edge, borderRadius: 3, overflow: "hidden", position: "relative" }}>
      <div style={{
        width: `${pct}%`, height: "100%", borderRadius: 3,
        background: `linear-gradient(90deg, ${c}90, ${c})`,
        boxShadow: `0 0 8px ${c}60`,
      }} />
    </div>
    <span style={{ fontSize: 12, fontFamily: hd, fontWeight: 700, color: c, textShadow: `0 0 10px ${c}50` }}>{score}</span>
  </div>;
};

const ZTag = ({ zone }) => {
  const c = ZONE_K[zone];
  return <span style={{
    fontSize: 9, fontFamily: hd, fontWeight: 700, letterSpacing: 1.5,
    padding: "3px 8px", borderRadius: 2,
    color: c, background: c + "12", border: `1px solid ${c}35`,
    textShadow: `0 0 8px ${c}40`,
  }}>{zone}</span>;
};

const Glass = ({ children, glow, style: s = {} }) => <div style={{
  background: `linear-gradient(135deg, ${K.panel}ee, ${K.raised}cc)`,
  backdropFilter: "blur(12px)",
  border: `1px solid ${glow || K.edge}30`,
  borderRadius: 14,
  overflow: "hidden",
  ...s,
}}>{children}</div>;

// ═══ DASHBOARD ═══
function DashTab({ onSelect }) {
  const conv = STOCKS.filter(s => s.conv.zone === "CONVERGENCE");
  const sec = STOCKS.filter(s => s.conv.zone === "SECONDARY");
  const weinOk = MKT.spxStage === 2, kellOk = MKT.spxEma === "above", minOk = MKT.tplCount > 500;
  const allOk = weinOk && kellOk && minOk;

  return <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "14px 16px", paddingBottom: 100 }}>
    {/* Triple Check */}
    <Glass glow={allOk ? K.neon : K.sol}>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontFamily: hd, fontSize: 11, fontWeight: 700, color: K.white, letterSpacing: 2 }}>MARKET STATUS</span>
          <span style={{
            fontFamily: hd, fontSize: 10, fontWeight: 800, letterSpacing: 1,
            color: allOk ? K.neon : K.sol,
            textShadow: `0 0 12px ${allOk ? K.neonDim : K.solDim}`,
          }}>{allOk ? "▣ ALL SYSTEMS GO" : "△ MIXED SIGNAL"}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            ["WEINSTEIN", `STG ${MKT.spxStage}`, weinOk, K.neon],
            ["MINERVINI", `${MKT.tplCount}`, minOk, K.prism],
            ["KELL", MKT.spxEma === "above" ? "GREEN" : "RED", kellOk, K.arc],
          ].map(([name, val, ok, c]) => (
            <div key={name} style={{
              flex: 1, background: K.void, borderRadius: 10, padding: "10px 10px",
              border: `1px solid ${ok ? c : K.ember}25`,
              position: "relative", overflow: "hidden",
            }}>
              {ok && <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${c}, transparent)`,
              }} />}
              <div style={{ fontFamily: hd, fontSize: 7, fontWeight: 700, color: c, letterSpacing: 2, marginBottom: 4 }}>{name}</div>
              <div style={{ fontFamily: hd, fontSize: 16, fontWeight: 800, color: K.white, textShadow: `0 0 12px ${c}30` }}>{val}</div>
              <div style={{ fontFamily: mn, fontSize: 9, color: ok ? c : K.ember, marginTop: 4 }}>{ok ? "CLEAR" : "ALERT"}</div>
            </div>
          ))}
        </div>
      </div>
    </Glass>

    {/* Quick Stats */}
    <div style={{ display: "flex", gap: 8 }}>
      {[["VIX", MKT.vix, MKT.vix > 20 ? K.sol : K.neon], [">50D", MKT.a50 + "%", MKT.a50 > 50 ? K.neon : K.ember], ["CONV", conv.length, K.sol]].map(([l, v, c]) =>
        <div key={l} style={{
          flex: 1, background: K.panel, borderRadius: 10, padding: "10px 12px",
          border: `1px solid ${K.edge}`,
        }}>
          <div style={{ fontFamily: hd, fontSize: 7, fontWeight: 600, color: K.text, letterSpacing: 2 }}>{l}</div>
          <div style={{
            fontFamily: hd, fontSize: 22, fontWeight: 900, color: c, marginTop: 4,
            textShadow: `0 0 15px ${c}40`,
          }}>{v}</div>
        </div>
      )}
    </div>

    {/* Convergence Zone */}
    {conv.length > 0 && <Glass glow={K.sol}>
      <div style={{
        padding: "12px 16px", borderBottom: `1px solid ${K.sol}15`,
        background: `linear-gradient(90deg, ${K.solGlow}, transparent)`,
      }}>
        <span style={{
          fontFamily: hd, fontSize: 11, fontWeight: 800, letterSpacing: 3, color: K.sol,
          textShadow: `0 0 15px ${K.solDim}`,
        }}>⚡ CONVERGENCE ZONE</span>
      </div>
      {conv.map(s => <div key={s.tk} onClick={() => onSelect(s)} style={{
        padding: "14px 16px", borderBottom: `1px solid ${K.edge}30`, cursor: "pointer",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{
              fontFamily: hd, fontSize: 18, fontWeight: 900, color: K.white, letterSpacing: 1,
              textShadow: `0 0 10px ${K.sol}25`,
            }}>{s.tk}</span>
            <span style={{ fontFamily: mn, fontSize: 11, color: K.text, marginLeft: 8 }}>${s.px}</span>
          </div>
          <ConvMeter score={s.conv.score} max={s.conv.max} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Pc v={s.dp} /><Pc v={s.wp} /><Pc v={s.mp} />
        </div>
        <div style={{
          fontFamily: mn, fontSize: 10, color: K.sol, marginTop: 8,
          textShadow: `0 0 6px ${K.solDim}`,
        }}>{s.kell.phase} · RS {s.min.rs} · VCP {s.min.vcp}</div>
        <div style={{ fontFamily: bd, fontSize: 11, color: K.textMid, marginTop: 6, lineHeight: 1.6 }}>{s.setup}</div>
        {s.opt && s.opt !== "No play" && <div style={{
          fontFamily: mn, fontSize: 10, color: K.arc, marginTop: 8,
          padding: "6px 10px", background: K.arcGlow, borderRadius: 6,
          border: `1px solid ${K.arc}20`,
        }}>⟐ {s.opt}</div>}
      </div>)}
    </Glass>}

    {/* Secondary */}
    {sec.length > 0 && <Glass glow={K.arc}>
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${K.arc}10`, background: K.arcGlow }}>
        <span style={{ fontFamily: hd, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: K.arc }}>◈ SECONDARY CONVERGENCE</span>
      </div>
      {sec.map(s => <div key={s.tk} onClick={() => onSelect(s)} style={{
        padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: `1px solid ${K.edge}20`, cursor: "pointer",
      }}>
        <div>
          <span style={{ fontFamily: hd, fontSize: 14, fontWeight: 800, color: K.white }}>{s.tk}</span>
          <span style={{ fontFamily: mn, fontSize: 10, color: K.text, marginLeft: 6 }}>Base #{s.kell.base}</span>
        </div>
        <ConvMeter score={s.conv.score} max={s.conv.max} />
      </div>)}
    </Glass>}

    {/* Threat Alerts */}
    <Glass glow={K.ember}>
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${K.ember}10`, background: K.emberGlow }}>
        <span style={{ fontFamily: hd, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: K.ember }}>⊘ DIVERGENCE ALERTS</span>
      </div>
      {THREATS.filter(t => t.sc >= 8).map(t => <div key={t.tk} style={{
        padding: "10px 16px", display: "flex", justifyContent: "space-between",
        borderBottom: `1px solid ${K.edge}15`,
      }}>
        <span style={{ fontFamily: hd, fontSize: 12, fontWeight: 700, color: K.ember, textShadow: `0 0 8px ${K.emberDim}` }}>{t.tk} <span style={{ fontFamily: bd, fontWeight: 400, color: K.text, fontSize: 10 }}>{t.type}</span></span>
        <span style={{ fontFamily: hd, fontSize: 12, fontWeight: 800, color: K.ember }}>{t.sc}</span>
      </div>)}
    </Glass>

    {/* Sectors */}
    <Glass>
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${K.edge}20` }}>
        <span style={{ fontFamily: hd, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: K.textMid }}>SECTOR ROTATION</span>
      </div>
      <div style={{ padding: "8px 12px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4 }}>
        {[...MKT.sec].sort((a, b) => b.p - a.p).slice(0, 8).map(s => {
          const c = s.p > 0.5 ? K.neon : s.p > -0.5 ? K.text : K.ember;
          const bg = s.p > 0 ? `rgba(0,255,136,${Math.min(Math.abs(s.p) / 5, 0.15)})` : `rgba(255,42,68,${Math.min(Math.abs(s.p) / 5, 0.15)})`;
          return <div key={s.n} style={{ background: bg, borderRadius: 8, padding: "6px 4px", textAlign: "center" }}>
            <div style={{ fontFamily: bd, fontSize: 8, color: K.text, fontWeight: 500 }}>{s.n}</div>
            <div style={{ fontFamily: hd, fontSize: 13, fontWeight: 800, color: c, marginTop: 2, textShadow: `0 0 6px ${c}30` }}>{s.p > 0 ? "+" : ""}{s.p}</div>
          </div>;
        })}
      </div>
    </Glass>
  </div>;
}

// ═══ WATCHLIST ═══
function WatchTab({ onSelect }) {
  const zones = ["CONVERGENCE", "SECONDARY", "BUILDING", "WATCH"];
  const icons = { CONVERGENCE: "⚡", SECONDARY: "◈", BUILDING: "◇", WATCH: "◌" };
  return <div style={{ padding: "14px 16px", paddingBottom: 100, display: "flex", flexDirection: "column", gap: 14 }}>
    {zones.map(zone => {
      const items = STOCKS.filter(s => s.conv.zone === zone);
      if (!items.length) return null;
      const zc = ZONE_K[zone];
      return <Glass key={zone} glow={zc}>
        <div style={{
          padding: "10px 16px", borderBottom: `1px solid ${zc}12`,
          background: `linear-gradient(90deg, ${zc}10, transparent)`,
        }}>
          <span style={{ fontFamily: hd, fontSize: 10, fontWeight: 800, letterSpacing: 2, color: zc, textShadow: `0 0 10px ${zc}30` }}>
            {icons[zone]} {zone}
          </span>
          <span style={{ fontFamily: mn, fontSize: 9, color: K.text, marginLeft: 8 }}>{items.length}</span>
        </div>
        {items.map((s, i) => <div key={s.tk} onClick={() => onSelect(s)} style={{
          padding: "12px 16px", cursor: "pointer",
          borderBottom: i < items.length - 1 ? `1px solid ${K.edge}15` : "none",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: hd, fontSize: 16, fontWeight: 900, color: K.white, letterSpacing: 1 }}>{s.tk}</span>
              <span style={{ fontFamily: mn, fontSize: 11, color: K.text }}>${s.px}</span>
            </div>
            <ConvMeter score={s.conv.score} max={s.conv.max} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 6, alignItems: "center" }}>
            <Pc v={s.dp} s={11} /><Pc v={s.wp} s={11} /><Pc v={s.mp} s={11} />
            <span style={{
              marginLeft: "auto", fontFamily: hd, fontSize: 10, fontWeight: 800,
              color: s.min.rs >= 80 ? K.neon : s.min.rs >= 70 ? K.sol : K.ember,
              textShadow: `0 0 8px ${s.min.rs >= 80 ? K.neonDim : s.min.rs >= 70 ? K.solDim : K.emberDim}`,
            }}>RS {s.min.rs}</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 3 }}>
              <Orb c={s.kell.emaD === "bull" ? K.neon : K.sol} />
              <Orb c={s.kell.emaW === "bull" ? K.neon : K.sol} />
              <Orb c={s.kell.emaM === "bull" ? K.neon : K.sol} />
            </div>
            <span style={{ fontFamily: mn, fontSize: 10, color: K.textMid, marginLeft: 4 }}>{s.kell.phase}</span>
            <span style={{ fontFamily: hd, fontSize: 9, color: K.text, marginLeft: "auto", fontWeight: 600 }}>TPL {s.min.tpl}/8</span>
          </div>
          <div style={{ fontFamily: bd, fontSize: 10, color: K.text, marginTop: 6, lineHeight: 1.5 }}>{s.setup}</div>
          {s.flags.length > 0 && <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
            {s.flags.map(f => <span key={f} style={{
              fontSize: 8, fontFamily: hd, fontWeight: 600, letterSpacing: 0.5,
              padding: "2px 6px", borderRadius: 3,
              background: K.emberGlow, color: K.ember, border: `1px solid ${K.ember}20`,
            }}>⚠ {f}</span>)}
          </div>}
        </div>)}
      </Glass>;
    })}
  </div>;
}

// ═══ DETAIL VIEW ═══
function DetailView({ s, onBack }) {
  const zc = ZONE_K[s.conv.zone];
  return <div style={{ padding: "14px 16px", paddingBottom: 100, display: "flex", flexDirection: "column", gap: 12 }}>
    {/* Header */}
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button onClick={onBack} style={{
        background: K.raised, border: `1px solid ${K.edge}`, borderRadius: 10,
        color: K.textMid, fontSize: 18, cursor: "pointer", padding: "6px 12px",
      }}>‹</button>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{
            fontFamily: hd, fontSize: 24, fontWeight: 900, color: K.white, letterSpacing: 2,
            textShadow: `0 0 20px ${zc}30`,
          }}>{s.tk}</span>
          <div style={{
            fontFamily: hd, fontSize: 28, fontWeight: 900, color: zc,
            textShadow: `0 0 20px ${zc}50`,
          }}>{s.conv.score}<span style={{ fontSize: 12, color: K.text, fontWeight: 400 }}>/{s.conv.max}</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
          <span style={{ fontFamily: bd, fontSize: 12, color: K.text }}>{s.nm}</span>
          <ZTag zone={s.conv.zone} />
        </div>
      </div>
    </div>

    {/* Performance */}
    <div style={{ display: "flex", gap: 6 }}>
      {[["DAY", s.dp], ["WEEK", s.wp], ["MONTH", s.mp]].map(([l, v]) =>
        <div key={l} style={{
          flex: 1, background: K.panel, borderRadius: 10, padding: "10px 12px",
          border: `1px solid ${K.edge}`,
        }}>
          <div style={{ fontFamily: hd, fontSize: 7, fontWeight: 600, color: K.text, letterSpacing: 2, marginBottom: 4 }}>{l}</div>
          <Pc v={v} s={16} />
        </div>
      )}
    </div>

    {/* 3 Frameworks */}
    {[
      ["WEINSTEIN", K.neon, `Stage ${s.wein.stage}\n30wk MA ${s.wein.ma}\nBreakout Vol: ${s.wein.vol}`],
      ["MINERVINI", K.prism, `Template ${s.min.tpl}/8 · RS ${s.min.rs}\nVCP: ${s.min.vcp || "—"}\nEPS: ${s.min.eps > 0 ? "+" : ""}${s.min.eps}% · Rev: +${s.min.rev}%${s.min.pivot ? `\nPivot: $${s.min.pivot}` : ""}`],
      ["KELL", K.arc, `Phase: ${s.kell.phase}\nLight: ${s.kell.light} · Base #${s.kell.base || "—"}\nEMA D/W/M: ${s.kell.emaD}/${s.kell.emaW}/${s.kell.emaM}`],
    ].map(([name, c, detail]) => <Glass key={name} glow={c}>
      <div style={{ padding: "12px 16px", position: "relative" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, bottom: 0, width: 3,
          background: `linear-gradient(180deg, ${c}, transparent)`,
        }} />
        <div style={{
          fontFamily: hd, fontSize: 9, fontWeight: 800, color: c, letterSpacing: 3, marginBottom: 6,
          textShadow: `0 0 10px ${c}40`,
        }}>{name}</div>
        <div style={{ fontFamily: mn, fontSize: 11, color: K.textMid, lineHeight: 1.8, whiteSpace: "pre-line" }}>{detail}</div>
      </div>
    </Glass>)}

    {/* Thesis */}
    <Glass glow={zc} style={{ borderLeft: `3px solid ${zc}` }}>
      <div style={{ padding: "14px 16px" }}>
        <div style={{
          fontFamily: hd, fontSize: 9, fontWeight: 800, color: zc, letterSpacing: 3, marginBottom: 8,
          textShadow: `0 0 12px ${zc}40`,
        }}>CONVERGENCE THESIS</div>
        <div style={{ fontFamily: bd, fontSize: 13, color: K.textHi, lineHeight: 1.8, fontWeight: 500 }}>{s.setup}</div>
      </div>
    </Glass>

    {/* Options */}
    {s.opt && s.opt !== "No play" && <Glass glow={K.arc}>
      <div style={{ padding: "12px 16px" }}>
        <div style={{ fontFamily: hd, fontSize: 8, fontWeight: 700, color: K.arc, letterSpacing: 2, marginBottom: 4 }}>OPTIONS PLAY</div>
        <div style={{
          fontFamily: hd, fontSize: 14, fontWeight: 700, color: K.white, letterSpacing: 0.5,
          textShadow: `0 0 10px ${K.arc}30`,
        }}>{s.opt}</div>
      </div>
    </Glass>}

    {/* Risk */}
    <Glass glow={K.ember} style={{ borderLeft: `3px solid ${K.ember}` }}>
      <div style={{ padding: "12px 16px" }}>
        <div style={{ fontFamily: hd, fontSize: 8, fontWeight: 700, color: K.ember, letterSpacing: 2, marginBottom: 6 }}>RISK / FLAGS</div>
        <div style={{ fontFamily: bd, fontSize: 12, color: K.textMid, lineHeight: 1.7 }}>{s.risk}</div>
        {s.flags.map((f, i) => <div key={i} style={{
          fontFamily: mn, fontSize: 10, color: K.sol, marginTop: 4,
        }}>⚠ {f}</div>)}
      </div>
    </Glass>
  </div>;
}

// ═══ RISK TAB ═══
function RiskTab() {
  const [sel, setSel] = useState(null);
  return <div style={{ padding: "14px 16px", paddingBottom: 100, display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{
      fontFamily: hd, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: K.ember,
      textShadow: `0 0 12px ${K.emberDim}`, textAlign: "center", padding: "12px 0",
    }}>⊘ DIVERGENCE ZONE</div>
    {THREATS.map(t => <Glass key={t.tk} glow={K.ember}>
      <div onClick={() => setSel(sel?.tk === t.tk ? null : t)} style={{ padding: "14px 16px", cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{
            fontFamily: hd, fontSize: 16, fontWeight: 900, color: K.ember, letterSpacing: 1,
            textShadow: `0 0 12px ${K.emberDim}`,
          }}>{t.tk}</span>
          <span style={{
            fontFamily: hd, fontSize: 18, fontWeight: 900, color: K.ember,
            textShadow: `0 0 15px ${K.emberDim}`,
          }}>{t.sc}</span>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
          <span style={{ fontFamily: mn, fontSize: 10, color: K.ember }}>Short: {t.sf}%</span>
          <Pc v={t.mc} s={10} />
          <span style={{ fontFamily: bd, fontSize: 10, color: K.text }}>{t.type}</span>
        </div>
        {sel?.tk === t.tk && <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: bd, fontSize: 12, color: K.textMid, lineHeight: 1.8, marginBottom: 10 }}>{t.sum}</div>
          <div style={{ fontFamily: hd, fontSize: 8, fontWeight: 700, color: K.ember, letterSpacing: 2, marginBottom: 6 }}>EXIT SIGNALS</div>
          {t.exits.map((e, i) => <div key={i} style={{
            fontFamily: mn, fontSize: 10, color: K.textMid, padding: "4px 0 4px 12px",
            borderLeft: `2px solid ${K.ember}50`, marginBottom: 3,
          }}>✗ {e}</div>)}
        </div>}
      </div>
    </Glass>)}
  </div>;
}

// ═══ JOURNAL ═══
function JournalTab() {
  const w = JOURNAL.filter(j => j.pnl > 0).length;
  const avg = JOURNAL.reduce((s, j) => s + j.pnl, 0) / JOURNAL.length;
  const CONV_C = { PRIMARY: K.sol, PARTIAL: K.prism, EXIT: K.ember };
  return <div style={{ padding: "14px 16px", paddingBottom: 100, display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ display: "flex", gap: 8 }}>
      {[["TRADES", JOURNAL.length, K.white], ["WIN", `${((w / JOURNAL.length) * 100).toFixed(0)}%`, w / JOURNAL.length >= .5 ? K.neon : K.ember], ["AVG", `${avg >= 0 ? "+" : ""}${avg.toFixed(0)}%`, avg >= 0 ? K.neon : K.ember]].map(([l, v, c]) =>
        <div key={l} style={{ flex: 1, background: K.panel, borderRadius: 10, padding: "10px 12px", border: `1px solid ${K.edge}` }}>
          <div style={{ fontFamily: hd, fontSize: 7, fontWeight: 600, color: K.text, letterSpacing: 2 }}>{l}</div>
          <div style={{ fontFamily: hd, fontSize: 20, fontWeight: 900, color: c, marginTop: 4, textShadow: `0 0 10px ${c}30` }}>{v}</div>
        </div>
      )}
    </div>
    {JOURNAL.map(j => <Glass key={j.id}>
      <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: hd, fontSize: 16, fontWeight: 900, color: K.white }}>{j.tk}</span>
            <span style={{
              fontFamily: hd, fontSize: 9, fontWeight: 700,
              color: j.a === "BUY" ? K.neon : K.ember,
              textShadow: `0 0 6px ${j.a === "BUY" ? K.neonDim : K.emberDim}`,
            }}>{j.a}</span>
          </div>
          <span style={{
            fontFamily: hd, fontSize: 16, fontWeight: 900,
            color: j.pnl >= 0 ? K.neon : K.ember,
            textShadow: `0 0 12px ${j.pnl >= 0 ? K.neonDim : K.emberDim}`,
          }}>{j.pnl >= 0 ? "+" : ""}{j.pnl}%</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, alignItems: "center" }}>
          <span style={{ fontFamily: mn, fontSize: 10, color: K.arc }}>{j.st}</span>
          <span style={{
            fontFamily: hd, fontSize: 8, fontWeight: 700, letterSpacing: 1,
            padding: "2px 8px", borderRadius: 3,
            color: CONV_C[j.conv], background: CONV_C[j.conv] + "15",
            border: `1px solid ${CONV_C[j.conv]}25`,
          }}>{j.conv}</span>
        </div>
        <div style={{ fontFamily: bd, fontSize: 10, color: K.text, marginTop: 6 }}>{j.d} · {j.n}</div>
      </div>
    </Glass>)}
  </div>;
}

// ═══ MAIN APP ═══
const TABS = [
  { id: "dash", icon: "◈", label: "HOME" },
  { id: "watch", icon: "◉", label: "WATCH" },
  { id: "risk", icon: "⊘", label: "RISK" },
  { id: "journal", icon: "⊞", label: "LOG" },
];

export default function App() {
  const [tab, setTab] = useState("dash");
  const [detail, setDetail] = useState(null);
  const [time, setTime] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setTime(new Date()), 60000); return () => clearInterval(i); }, []);

  const convCount = STOCKS.filter(s => s.conv.zone === "CONVERGENCE").length;
  const onSelect = (s) => { setDetail(s); setTab("detail"); };

  return <div style={{
    fontFamily: mn, background: K.void, color: K.textMid,
    height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden",
    position: "relative",
  }}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}
      ::-webkit-scrollbar{display:none}
      @keyframes glow{0%,100%{opacity:.5}50%{opacity:1}}
      @keyframes scan{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
    `}</style>

    {/* Ambient scanline */}
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0,
      background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${K.white}01 2px, ${K.white}01 4px)`,
    }} />

    {/* Top Bar */}
    <div style={{
      padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
      borderBottom: `1px solid ${K.edge}`, background: K.panel,
      position: "relative", zIndex: 10, flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          fontFamily: hd, fontSize: 15, fontWeight: 900, color: K.white, letterSpacing: 3,
        }}><span style={{ color: K.sol, textShadow: `0 0 15px ${K.solDim}` }}>MKW</span></span>
        {convCount > 0 && <span style={{
          fontFamily: hd, fontSize: 8, fontWeight: 700, letterSpacing: 1,
          padding: "2px 8px", borderRadius: 10,
          background: K.solGlow, color: K.sol, border: `1px solid ${K.sol}30`,
          animation: "glow 2s infinite",
          textShadow: `0 0 8px ${K.solDim}`,
        }}>⚡ {convCount}</span>}
      </div>
      <span style={{ fontFamily: mn, fontSize: 9, color: K.text }}>{time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
    </div>

    {/* Content */}
    <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch", position: "relative", zIndex: 5 }}>
      {tab === "dash" && <DashTab onSelect={onSelect} />}
      {tab === "watch" && <WatchTab onSelect={onSelect} />}
      {tab === "detail" && detail && <DetailView s={detail} onBack={() => setTab("watch")} />}
      {tab === "risk" && <RiskTab />}
      {tab === "journal" && <JournalTab />}
    </div>

    {/* Bottom Tab Bar */}
    <div style={{
      display: "flex", justifyContent: "space-around",
      padding: "8px 0 22px", flexShrink: 0,
      background: `linear-gradient(180deg, ${K.panel}f0, ${K.void})`,
      borderTop: `1px solid ${K.edge}`,
      backdropFilter: "blur(20px)",
      position: "relative", zIndex: 10,
    }}>
      {TABS.map(t => {
        const active = tab === t.id || (tab === "detail" && t.id === "watch");
        return <button key={t.id} onClick={() => { setTab(t.id); if (t.id !== "detail") setDetail(null); }} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          padding: "4px 18px",
          color: active ? K.sol : K.text,
          transition: "all 0.2s",
        }}>
          <span style={{
            fontSize: 20,
            filter: active ? `drop-shadow(0 0 6px ${K.sol}80)` : "none",
          }}>{t.icon}</span>
          <span style={{
            fontSize: 8, fontFamily: hd, fontWeight: active ? 800 : 500,
            letterSpacing: 1.5,
            textShadow: active ? `0 0 8px ${K.sol}40` : "none",
          }}>{t.label}</span>
        </button>;
      })}
    </div>
  </div>;
}
