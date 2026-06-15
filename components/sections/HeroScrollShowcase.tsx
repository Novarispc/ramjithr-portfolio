"use client";
import React, { useEffect, useRef } from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

// ── Real impact data ──────────────────────────────────────────────
const KPI = [
  { value: 99,  suffix: '%', label: 'Test Coverage',          bar: 99,  color: '#00ff87' },
  { value: 50,  suffix: '%', label: 'Automation Uplift',      bar: 50,  color: '#00ff87' },
  { value: 100, suffix: '%', label: 'On-Time Delivery',       bar: 100, color: '#00ff87' },
  { value: 25,  suffix: '+', label: 'Critical Defects Caught',bar: 83,  color: '#c9a84c' },
  { value: 15,  suffix: '%', label: 'Faster Test Cycles',     bar: 15,  color: '#60a5fa' },
  { value: 25,  suffix: '%', label: 'Faster Issue Resolution',bar: 25,  color: '#60a5fa' },
]

const SYSTEMS = [
  { id: 'ADAS',      status: 'ACTIVE',   color: '#00ff87' },
  { id: 'ISO-26262', status: 'VERIFIED', color: '#00ff87' },
  { id: 'AUTOSAR',   status: 'ACTIVE',   color: '#00ff87' },
  { id: 'ISO-21434', status: 'VERIFIED', color: '#00ff87' },
  { id: 'HIL/SIL',   status: 'ACTIVE',   color: '#c9a84c' },
  { id: 'CAN/LIN',   status: 'ONLINE',   color: '#00ff87' },
]

const TOOLS = ['CAPL', 'CANoe', 'Python', 'vTestStudio', 'pytest', 'Polarion', 'MATLAB', 'JIRA']

// Animated bar that grows into view once
function Bar({ pct, color }: { pct: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.width = `${pct}%`;
        io.disconnect();
      }
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, [pct]);

  return (
    <div className="h-1 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div
        ref={ref}
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: '0%', backgroundColor: color, boxShadow: `0 0 6px ${color}66` }}
      />
    </div>
  );
}

function Dashboard() {
  return (
    <div
      className="w-full h-full flex flex-col font-mono text-[11px] select-none overflow-hidden"
      style={{ background: '#0a0a0a', color: '#a3a3a3' }}
    >
      {/* ── Header bar ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(0,255,135,0.12)' }}>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff87] opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff87]" />
          </span>
          <span className="text-[#00ff87] tracking-[0.25em] uppercase text-[10px]">System Telemetry</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#555] tracking-widest uppercase text-[9px]">Ramjith Radhakrishnan</span>
          <span className="text-[#333] text-[9px]">REV 9.3.1</span>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — KPIs */}
        <div className="flex flex-col gap-0 border-r" style={{ borderColor: 'rgba(255,255,255,0.05)', minWidth: '46%' }}>
          <div className="px-4 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <span className="text-[9px] tracking-[0.3em] text-[#444] uppercase">Impact Metrics</span>
          </div>
          {KPI.map((k) => (
            <div key={k.label} className="px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[10px] text-[#666]">{k.label}</span>
                <span className="text-sm font-bold tabular-nums" style={{ color: k.color }}>
                  {k.value}{k.suffix}
                </span>
              </div>
              <Bar pct={k.bar} color={k.color} />
            </div>
          ))}
        </div>

        {/* Right — Systems + career */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Systems status */}
          <div className="px-4 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <span className="text-[9px] tracking-[0.3em] text-[#444] uppercase">Module Status</span>
          </div>
          <div className="grid grid-cols-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {SYSTEMS.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-4 py-2.5 border-b border-r"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <span className="text-[10px] text-[#555]">{s.id}</span>
                <span className="text-[9px] font-semibold tracking-wider" style={{ color: s.color }}>{s.status}</span>
              </div>
            ))}
          </div>

          {/* Career summary */}
          <div className="px-4 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <span className="text-[9px] tracking-[0.3em] text-[#444] uppercase">Career Snapshot</span>
          </div>
          <div className="grid grid-cols-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {[
              { v: '8+', l: 'Yrs Exp' },
              { v: '4',  l: 'Companies' },
              { v: '6',  l: 'Platforms' },
            ].map((c) => (
              <div key={c.l} className="flex flex-col items-center py-4 border-r" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-xl font-black text-white tabular-nums">{c.v}</span>
                <span className="text-[9px] text-[#444] mt-0.5 tracking-widest uppercase">{c.l}</span>
              </div>
            ))}
          </div>

          {/* Current role */}
          <div className="px-4 py-3 border-b flex-1 flex flex-col justify-center" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="text-[9px] text-[#444] tracking-widest uppercase mb-1">Current Role</div>
            <div className="text-white text-[11px] font-semibold">Senior Automotive SW & Test Engineer</div>
            <div className="text-[#00ff87] text-[10px] mt-0.5">Volvo Cars Corporation · Gothenburg</div>
          </div>
        </div>
      </div>

      {/* ── Footer — tool stack ────────────────────────────── */}
      <div className="flex items-center gap-2 px-5 py-2.5 border-t flex-wrap" style={{ borderColor: 'rgba(0,255,135,0.10)' }}>
        <span className="text-[9px] text-[#333] tracking-widest uppercase mr-1">Stack</span>
        {TOOLS.map((t) => (
          <span
            key={t}
            className="px-2 py-0.5 rounded text-[9px] tracking-wide"
            style={{
              background: 'rgba(0,255,135,0.05)',
              border: '1px solid rgba(0,255,135,0.12)',
              color: 'rgba(0,255,135,0.5)',
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function HeroScrollShowcase() {
  return (
    <div className="flex flex-col overflow-hidden bg-[#080808]">
      <ContainerScroll
        titleComponent={
          <div className="mb-6">
            <p className="text-[#00ff87] text-xs tracking-[0.3em] uppercase font-mono mb-4">
              Impact at a Glance
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Engineering that
              <br />
              <span className="text-[#00ff87]">moves vehicles forward</span>
            </h2>
            <p className="text-[#a3a3a3] text-base sm:text-lg max-w-xl mx-auto">
              8+ years validating safety-critical automotive systems — from ECU firmware to full-vehicle integration.
            </p>
          </div>
        }
      >
        <Dashboard />
      </ContainerScroll>
    </div>
  );
}
