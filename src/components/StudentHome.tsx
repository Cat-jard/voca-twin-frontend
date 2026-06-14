"use client";

import React, { useMemo, useState } from "react";
import { css, Fx } from "./fx";
import type { Result } from "@/lib/vocaData";

type View = "inicio" | "historial" | "perfil" | "carreras" | "config";

const BAR_PALETTE = ["#0661FC", "#0a8f8c", "#FF395C", "#7B2CBF", "#FFB020"];

// Historial estático de tests realizados.
const TEST_HISTORY = [
  { fecha: "12 jun 2026", titulo: "Test vocacional completo", top: "Ingeniería de Software", pct: 88, preguntas: 25 },
  { fecha: "28 may 2026", titulo: "Test vocacional completo", top: "Diseño Gráfico", pct: 74, preguntas: 25 },
  { fecha: "15 may 2026", titulo: "Test exploratorio rápido", top: "Administración", pct: 61, preguntas: 10 },
];

const NEXT_STEPS = [
  { label: "Explora universidades que la dictan", done: true },
  { label: "Revisa la malla curricular", done: false },
  { label: "Conoce el campo laboral y sueldos", done: false },
  { label: "Agenda una orientación con un tutor", done: false },
];

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const c = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "home": return <svg {...c}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></svg>;
    case "tests": return <svg {...c}><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
    case "cap": return <svg {...c}><path d="M22 10L12 5 2 10l10 5 10-5z" /><path d="M6 12v5c0 1 4 3 6 3s6-2 6-3v-5" /></svg>;
    case "chat": return <svg {...c}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
    case "user": return <svg {...c}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    case "gear": return <svg {...c}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
    case "logout": return <svg {...c}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>;
    case "target": return <svg {...c}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" /></svg>;
    case "layers": return <svg {...c}><path d="M12 2L2 7l10 5 10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" /></svg>;
    case "spark": return <svg {...c}><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4-6.3-4.6L5.7 21l2.3-7.4-6-4.6h7.6z" /></svg>;
    case "check": return <svg {...c}><path d="M20 6L9 17l-5-5" /></svg>;
    case "arrow": return <svg {...c}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    case "bell": return <svg {...c}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>;
    case "shield": return <svg {...c}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    case "moon": return <svg {...c}><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" /></svg>;
    default: return null;
  }
}

export default function StudentHome({
  userName,
  chosenCareer,
  result,
  onLogout,
  onRetake,
}: {
  userName: string;
  chosenCareer: string;
  result: Result | null;
  onLogout: () => void;
  onRetake: () => void;
}) {
  const [view, setView] = useState<View>("inicio");
  const [saved, setSaved] = useState(false);

  const initials = useMemo(
    () => userName.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "ES",
    [userName]
  );

  const topResults = useMemo(() => {
    const base = result?.shown?.slice(0, 3);
    if (base && base.length) return base.map((s) => ({ name: s.name, pct: s.pct }));
    return [
      { name: "Ingeniería de Software", pct: 88 },
      { name: "Diseño Gráfico", pct: 74 },
      { name: "Administración", pct: 61 },
    ];
  }, [result]);

  const suggested = useMemo(() => result?.shown ?? [], [result]);
  const career = chosenCareer || "Ingeniería de Software";
  const topPct = topResults[0]?.pct ?? 88;
  const compatCount = (result?.shown?.length ?? 5);

  const nav: { v: View; icon: string; label: string }[] = [
    { v: "inicio", icon: "home", label: "Inicio" },
    { v: "historial", icon: "tests", label: "Historial de tests" },
    { v: "perfil", icon: "user", label: "Mi perfil" },
    { v: "carreras", icon: "cap", label: "Carreras sugeridas" },
    { v: "config", icon: "gear", label: "Configuración" },
  ];

  const saveProfile = () => { setSaved(true); setTimeout(() => setSaved(false), 2200); };

  return (
    <div style={css("min-height: 100vh; background: #F2F4F8; display: grid; grid-template-columns: 252px 1fr; animation: vtFadeIn .45s ease both;")}>
      {/* ── Sidebar única (izquierda) ── */}
      <aside style={css("display: flex; flex-direction: column; padding: 22px 16px; background: #000F37; position: sticky; top: 0; height: 100vh;")}>
        <div style={css("display: flex; align-items: center; gap: 10px; padding: 4px 8px 22px; font-weight: 900; font-size: 19px; color: #fff; letter-spacing: -.02em;")}>
          <span style={css("display: grid; place-items: center; width: 32px; height: 32px; border-radius: 9px; background: #FF395C; color: #fff; font-size: 16px; transform: rotate(-6deg);")}>V</span>
          Voca<span style={css("color: #FF395C; margin-left: -5px;")}>Twin</span>
        </div>

        {/* Perfil */}
        <div style={css("display: flex; align-items: center; gap: 12px; padding: 14px; margin-bottom: 18px; border-radius: 14px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08);")}>
          <span style={css("display: grid; place-items: center; width: 42px; height: 42px; border-radius: 50%; background: #0661FC; color: #fff; font-size: 15px; font-weight: 900; flex-shrink: 0;")}>{initials}</span>
          <div style={css("min-width: 0;")}>
            <div style={css("font-size: 14px; font-weight: 800; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;")}>{userName}</div>
            <div style={css("font-size: 12px; font-weight: 700; color: rgba(255,255,255,.55);")}>Estudiante</div>
          </div>
        </div>

        <div style={css("font-size: 11px; font-weight: 800; color: rgba(255,255,255,.4); letter-spacing: .1em; padding: 0 10px 8px;")}>MENÚ</div>
        <nav style={css("display: grid; gap: 4px;")}>
          {nav.map((n, i) => {
            const active = view === n.v;
            return (
              <Fx
                key={i}
                as="button"
                onClick={() => setView(n.v)}
                base={`display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; padding: 12px 14px; border-radius: 12px; border: none; transition: all .16s ease; background: ${active ? "rgba(255,255,255,.12)" : "transparent"}; color: ${active ? "#fff" : "rgba(255,255,255,.6)"};`}
                hover="background: rgba(255,255,255,.08); color: #fff;"
              >
                <Icon name={n.icon} size={18} />
                {n.label}
              </Fx>
            );
          })}
        </nav>

        <div style={css("flex: 1;")} />
        <Fx as="button" onClick={onLogout} base="display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; font-family: inherit; font-size: 14px; font-weight: 800; cursor: pointer; padding: 12px 14px; border-radius: 12px; border: none; background: transparent; color: #FF6B7E; transition: all .16s ease;" hover="background: rgba(227,0,11,.16); color: #FF395C;">
          <Icon name="logout" size={18} />
          Cerrar sesión
        </Fx>
      </aside>

      {/* ── Contenido principal ── */}
      <main style={css("padding: 30px 36px 50px; min-width: 0; overflow-x: hidden;")}>
        <div style={css("margin-bottom: 24px; animation: vtFadeUp .5s ease both;")}>
          <h1 style={css("margin: 0 0 6px; font-size: clamp(24px, 3vw, 32px); font-weight: 900; letter-spacing: -.03em; color: #000F37;")}>Tu dashboard vocacional</h1>
          <p style={css("margin: 0; font-size: 14px; color: #4A4F55;")}>Resultados, seguimiento con IA y recomendaciones</p>
        </div>

        {/* ===== INICIO ===== */}
        {view === "inicio" && (
          <div style={css("display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; align-items: start; animation: vtFadeIn .35s ease both;")}>
            <div style={css("display: flex; flex-direction: column; gap: 20px; min-width: 0;")}>
              {/* Carrera elegida */}
              <div style={css("position: relative; overflow: hidden; background: linear-gradient(135deg, #0661FC, #0a3fb0); border-radius: 20px; padding: 26px; color: #fff; box-shadow: 0 20px 44px rgba(6,97,252,.28); animation: vtPop .5s cubic-bezier(.16,1,.3,1) both;")}>
                <div style={css("position: absolute; top: -40px; right: -30px; width: 190px; height: 190px; border-radius: 50%; background: rgba(61,220,218,.28); filter: blur(6px);")} />
                <div style={css("position: relative; display: flex; align-items: center; gap: 8px; margin-bottom: 12px;")}>
                  <span style={css("display: grid; place-items: center; width: 26px; height: 26px; border-radius: 8px; background: rgba(255,255,255,.2);")}><Icon name="check" size={15} /></span>
                  <span style={css("font-size: 12px; font-weight: 800; letter-spacing: .06em; color: rgba(255,255,255,.85);")}>TU CARRERA ELEGIDA</span>
                </div>
                <h2 style={css("position: relative; margin: 0 0 16px; font-size: clamp(22px, 2.6vw, 30px); font-weight: 900; letter-spacing: -.02em; line-height: 1.1;")}>{career}</h2>
                <div style={css("position: relative; display: flex; gap: 10px; flex-wrap: wrap;")}>
                  <Fx as="button" onClick={() => setView("carreras")} base="font-family: inherit; font-size: 13px; font-weight: 800; cursor: pointer; padding: 10px 16px; border-radius: 11px; border: none; background: #fff; color: #0661FC; transition: transform .16s ease;" hover="transform: translateY(-2px);">Ver comparativa</Fx>
                  <Fx as="button" onClick={() => setView("carreras")} base="font-family: inherit; font-size: 13px; font-weight: 800; cursor: pointer; padding: 10px 16px; border-radius: 11px; border: 1.5px solid rgba(255,255,255,.4); background: transparent; color: #fff; transition: all .16s ease;" hover="background: rgba(255,255,255,.14);">Otras carreras</Fx>
                </div>
              </div>

              {/* Mini-stats */}
              <div style={css("display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;")}>
                {[
                  { icon: "target", label: "Afinidad principal", value: topPct + "%", color: "#0661FC" },
                  { icon: "layers", label: "Carreras compatibles", value: String(compatCount), color: "#0a8f8c" },
                  { icon: "tests", label: "Tests realizados", value: String(TEST_HISTORY.length), color: "#FF395C" },
                ].map((s, i) => (
                  <Fx key={i} base={`background: #fff; border: 1px solid #DDE1E6; border-radius: 16px; padding: 18px; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .5s ease both; animation-delay: ${i * 0.07}s; transition: transform .2s ease, box-shadow .2s ease;`} hover="transform: translateY(-4px); box-shadow: 0 16px 30px rgba(0,15,55,.09);">
                    <span style={{ ...css("display: grid; place-items: center; width: 36px; height: 36px; border-radius: 11px; margin-bottom: 12px;"), background: s.color + "1f", color: s.color }}><Icon name={s.icon} size={19} /></span>
                    <div style={{ ...css("font-size: 26px; font-weight: 900; letter-spacing: -.03em; line-height: 1;"), color: "#161D1F" }}>{s.value}</div>
                    <div style={css("margin-top: 5px; font-size: 12px; font-weight: 700; color: #848D95;")}>{s.label}</div>
                  </Fx>
                ))}
              </div>

              {/* Resultados del test */}
              <div style={css("background: #fff; border: 1px solid #DDE1E6; border-radius: 18px; padding: 24px; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .5s ease both; animation-delay: .12s;")}>
                <h3 style={css("margin: 0 0 18px; font-size: 16px; font-weight: 900; color: #000F37; letter-spacing: -.02em;")}>Tus resultados del test vocacional</h3>
                <div style={css("display: grid; gap: 16px;")}>
                  {topResults.map((r, i) => (
                    <div key={i} style={css("display: grid; grid-template-columns: 170px 1fr 44px; align-items: center; gap: 12px;")}>
                      <span style={css("font-size: 14px; font-weight: 700; color: #161D1F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;")}>{r.name}</span>
                      <div style={css("height: 10px; border-radius: 99px; background: #EEF1F5; overflow: hidden;")}>
                        <div style={{ ...css("height: 100%; border-radius: 99px; transform-origin: left; animation: vtGrowX 1s cubic-bezier(.16,1,.3,1) both;"), width: r.pct + "%", background: BAR_PALETTE[i % BAR_PALETTE.length], animationDelay: 0.2 + i * 0.1 + "s" }} />
                      </div>
                      <span style={{ ...css("font-size: 14px; font-weight: 900; text-align: right;"), color: BAR_PALETTE[i % BAR_PALETTE.length] }}>{r.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Próximos pasos */}
              <div style={css("background: #fff; border: 1px solid #DDE1E6; border-radius: 18px; padding: 24px; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .5s ease both; animation-delay: .18s;")}>
                <h3 style={css("margin: 0 0 16px; font-size: 16px; font-weight: 900; color: #000F37; letter-spacing: -.02em;")}>Próximos pasos</h3>
                <div style={css("display: grid; gap: 8px;")}>
                  {NEXT_STEPS.map((s, i) => (
                    <Fx key={i} base={`display: flex; align-items: center; gap: 13px; padding: 12px 14px; border-radius: 12px; border: 1px solid #EEF1F5; background: #F8FAFC; cursor: pointer; transition: all .16s ease; animation: vtFadeUp .45s ease both; animation-delay: ${0.2 + i * 0.05}s;`} hover="border-color: #0661FC; background: #fff; transform: translateX(3px);">
                      <span style={{ ...css("display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;"), background: s.done ? "#0a8f8c" : "#E8EBF0", color: s.done ? "#fff" : "#848D95" }}>
                        {s.done ? <Icon name="check" size={14} /> : <span style={css("width: 7px; height: 7px; border-radius: 50%; background: #B0B7C0;")} />}
                      </span>
                      <span style={{ ...css("flex: 1; font-size: 14px; font-weight: 700;"), color: s.done ? "#848D95" : "#161D1F", textDecoration: s.done ? "line-through" : "none" }}>{s.label}</span>
                      <span style={css("color: #C7CDD6;")}><Icon name="arrow" size={16} /></span>
                    </Fx>
                  ))}
                </div>
              </div>
            </div>

            {/* Asistente */}
            <div style={css("display: flex; flex-direction: column; background: #fff; border: 1px solid #DDE1E6; border-radius: 18px; overflow: hidden; box-shadow: 0 2px 0 rgba(0,15,55,.03); position: sticky; top: 20px; height: calc(100vh - 130px); min-height: 460px; animation: vtSlideLeft .5s ease both; animation-delay: .08s;")}>
              <div style={css("display: flex; align-items: center; gap: 11px; padding: 16px; background: #0661FC; color: #fff;")}>
                <span style={css("display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,.2);")}><Icon name="chat" size={18} /></span>
                <div><div style={css("font-size: 14px; font-weight: 900;")}>Asistente VocaTwin</div><div style={css("font-size: 11px; font-weight: 700; color: rgba(255,255,255,.8);")}>Con IA · en línea</div></div>
              </div>
              <div style={css("flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: #F8FAFC; overflow-y: auto;")}>
                <div style={css("max-width: 88%; align-self: flex-start; background: #fff; border: 1px solid #EEF1F5; border-radius: 14px 14px 14px 4px; padding: 12px 14px; font-size: 13.5px; line-height: 1.5; color: #161D1F; box-shadow: 0 2px 8px rgba(0,15,55,.05); animation: vtFadeUp .4s ease both;")}>
                  Hola {userName.split(" ")[0]}, vi tus resultados. ¿Quieres que te cuente más sobre {career}?
                </div>
                <div style={css("max-width: 70%; align-self: flex-end; background: #0661FC; color: #fff; border-radius: 14px 14px 4px 14px; padding: 12px 14px; font-size: 13.5px; font-weight: 700; box-shadow: 0 6px 16px rgba(6,97,252,.3); animation: vtFadeUp .4s ease both; animation-delay: .1s;")}>
                  Sí, por favor
                </div>
                <div style={css("max-width: 88%; align-self: flex-start; background: #fff; border: 1px solid #EEF1F5; border-radius: 14px 14px 14px 4px; padding: 12px 14px; font-size: 13.5px; line-height: 1.5; color: #161D1F; box-shadow: 0 2px 8px rgba(0,15,55,.05); animation: vtFadeUp .4s ease both; animation-delay: .2s;")}>
                  Es la carrera con mayor afinidad en tu perfil. Te muestro universidades y un plan de estudios recomendado. 🎓
                </div>
                <div style={css("display: flex; flex-wrap: wrap; gap: 7px; margin-top: 4px; animation: vtFadeUp .4s ease both; animation-delay: .3s;")}>
                  {["Universidades", "Plan de estudios", "Campo laboral"].map((q, k) => (
                    <span key={k} style={css("padding: 8px 12px; border-radius: 99px; border: 1.5px solid #E8EBF0; background: #fff; font-size: 12px; font-weight: 700; color: #4A4F55; cursor: pointer;")}>{q}</span>
                  ))}
                </div>
              </div>
              <div style={css("display: flex; align-items: center; gap: 10px; padding: 14px; border-top: 1px solid #EEF1F5;")}>
                <div style={css("flex: 1; padding: 11px 14px; border-radius: 11px; background: #F2F4F8; border: 1px solid #E8EBF0; font-size: 13px; color: #848D95;")}>Escribe tu mensaje…</div>
                <button style={css("display: grid; place-items: center; width: 42px; height: 42px; border-radius: 11px; border: none; background: #0661FC; color: #fff; cursor: pointer; flex-shrink: 0;")}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg></button>
              </div>
            </div>
          </div>
        )}

        {/* ===== HISTORIAL ===== */}
        {view === "historial" && (
          <div style={css("animation: vtFadeIn .35s ease both; max-width: 880px; margin: 0 auto;")}>
            {/* Resumen */}
            <div style={css("display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 22px;")}>
              {[
                { label: "Tests realizados", value: String(TEST_HISTORY.length), color: "#0661FC", icon: "tests" },
                { label: "Promedio de afinidad", value: "74%", color: "#0a8f8c", icon: "target" },
                { label: "Último test", value: "12 jun", color: "#FF395C", icon: "spark" },
              ].map((s, i) => (
                <Fx key={i} base={`display: flex; align-items: center; gap: 14px; background: #fff; border: 1px solid #DDE1E6; border-radius: 16px; padding: 18px; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .5s ease both; animation-delay: ${i * 0.07}s; transition: transform .2s ease;`} hover="transform: translateY(-3px);">
                  <span style={{ ...css("display: grid; place-items: center; width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;"), background: s.color + "1f", color: s.color }}><Icon name={s.icon} /></span>
                  <div><div style={{ ...css("font-size: 22px; font-weight: 900; letter-spacing: -.02em; line-height: 1;"), color: "#161D1F" }}>{s.value}</div><div style={css("margin-top: 4px; font-size: 12px; font-weight: 700; color: #848D95;")}>{s.label}</div></div>
                </Fx>
              ))}
            </div>

            <div style={css("display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;")}>
              <h3 style={css("margin: 0; font-size: 18px; font-weight: 900; color: #000F37; letter-spacing: -.02em;")}>Línea de tiempo</h3>
              <Fx as="button" onClick={onRetake} base="font-family: inherit; font-size: 13px; font-weight: 800; cursor: pointer; padding: 10px 18px; border-radius: 11px; border: none; background: #FF395C; color: #fff; box-shadow: 0 8px 20px rgba(255,57,92,.3); transition: transform .16s ease;" hover="transform: translateY(-2px);">↻ Repetir test</Fx>
            </div>

            {/* Timeline */}
            <div style={css("position: relative; padding-left: 28px;")}>
              <div style={css("position: absolute; left: 9px; top: 8px; bottom: 8px; width: 2px; background: #E1E5EC;")} />
              <div style={css("display: grid; gap: 14px;")}>
                {TEST_HISTORY.map((t, i) => (
                  <div key={i} style={{ ...css("position: relative; animation: vtFadeUp .5s ease both;"), animationDelay: i * 0.08 + "s" }}>
                    <span style={{ ...css("position: absolute; left: -27px; top: 22px; width: 12px; height: 12px; border-radius: 50%; border: 3px solid #F2F4F8;"), background: BAR_PALETTE[i % BAR_PALETTE.length] }} />
                    <Fx base="display: flex; align-items: center; gap: 16px; background: #fff; border: 1px solid #DDE1E6; border-radius: 16px; padding: 18px 22px; box-shadow: 0 2px 0 rgba(0,15,55,.03); transition: transform .2s ease, box-shadow .2s ease;" hover="transform: translateX(4px); box-shadow: 0 16px 32px rgba(0,15,55,.08);">
                      <div style={css("flex: 1; min-width: 0;")}>
                        <div style={css("font-size: 15px; font-weight: 800; color: #161D1F;")}>{t.titulo}</div>
                        <div style={css("font-size: 13px; font-weight: 600; color: #848D95; margin-top: 3px;")}>{t.fecha} · {t.preguntas} preguntas · Top: {t.top}</div>
                      </div>
                      <span style={{ ...css("display: grid; place-items: center; min-width: 56px; height: 42px; border-radius: 12px; font-size: 15px; font-weight: 900; flex-shrink: 0;"), background: BAR_PALETTE[i % BAR_PALETTE.length] + "1f", color: BAR_PALETTE[i % BAR_PALETTE.length] }}>{t.pct}%</span>
                    </Fx>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== PERFIL ===== */}
        {view === "perfil" && (
          <div style={css("animation: vtFadeIn .35s ease both; max-width: 680px;")}>
            <h3 style={css("margin: 0 0 18px; font-size: 20px; font-weight: 900; color: #000F37; letter-spacing: -.02em;")}>Mi perfil</h3>
            <div style={css("background: #fff; border: 1px solid #DDE1E6; border-radius: 18px; padding: 28px; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .5s ease both;")}>
              <div style={css("display: flex; align-items: center; gap: 16px; margin-bottom: 24px;")}>
                <span style={css("display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: #0661FC; color: #fff; font-size: 22px; font-weight: 900;")}>{initials}</span>
                <div>
                  <div style={css("font-size: 18px; font-weight: 900; color: #161D1F;")}>{userName}</div>
                  <div style={css("font-size: 13px; font-weight: 700; color: #848D95;")}>Estudiante · VocaTwin</div>
                </div>
              </div>
              <div style={css("display: grid; grid-template-columns: 1fr 1fr; gap: 16px;")}>
                {[
                  ["Nombre", userName.split(" ")[0] || "Mariana"],
                  ["Apellido", userName.split(" ")[1] || "Ruiz"],
                  ["Correo", "mariana@vocatwin.com"],
                  ["Teléfono", "+51 987 654 321"],
                  ["Colegio", "I.E. San José"],
                  ["Grado", "5° de secundaria"],
                ].map((f, i) => (
                  <div key={i}>
                    <label style={css("display: block; font-size: 12px; font-weight: 800; color: #4A4F55; margin-bottom: 6px;")}>{f[0]}</label>
                    <Fx as="input" defaultValue={f[1]} base="width: 100%; font-family: inherit; font-size: 14px; padding: 12px 14px; border-radius: 11px; border: 1.5px solid #E8EBF0; background: #F8FAFC; color: #161D1F; outline: none; transition: border-color .16s ease;" focus="border-color: #0661FC; background: #fff;" />
                  </div>
                ))}
              </div>
              <div style={css("display: flex; align-items: center; gap: 14px; margin-top: 24px;")}>
                <Fx as="button" onClick={saveProfile} base="font-family: inherit; font-size: 14px; font-weight: 800; cursor: pointer; padding: 13px 24px; border-radius: 12px; border: none; background: #0661FC; color: #fff; box-shadow: 0 10px 24px rgba(6,97,252,.3); transition: transform .16s ease;" hover="transform: translateY(-2px);" active="transform: scale(.98);">Guardar cambios</Fx>
                {saved && (
                  <span style={css("display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 800; color: #0a8f8c; animation: vtFadeIn .3s ease both;")}>
                    <Icon name="check" size={16} /> Cambios guardados
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== CARRERAS SUGERIDAS ===== */}
        {view === "carreras" && (
          <div style={css("animation: vtFadeIn .35s ease both;")}>
            <h3 style={css("margin: 0 0 6px; font-size: 20px; font-weight: 900; color: #000F37; letter-spacing: -.02em;")}>Carreras sugeridas para ti</h3>
            <p style={css("margin: 0 0 20px; font-size: 14px; color: #4A4F55;")}>Calculadas a partir de tus respuestas en el test vocacional.</p>

            {/* Tu elección destacada */}
            <div style={css("position: relative; overflow: hidden; background: linear-gradient(135deg, #000F37, #0a2a6b); border-radius: 20px; padding: 26px; color: #fff; margin-bottom: 20px; box-shadow: 0 20px 44px rgba(0,15,55,.28); animation: vtPop .5s cubic-bezier(.16,1,.3,1) both;")}>
              <div style={css("position: absolute; top: -50px; right: -30px; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, rgba(255,57,92,.35), transparent 70%);")} />
              <div style={css("position: relative; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;")}>
                <div style={css("min-width: 0;")}>
                  <span style={css("display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px; border-radius: 99px; background: #FF395C; font-size: 11px; font-weight: 900; letter-spacing: .04em; margin-bottom: 12px;")}>★ TU ELECCIÓN</span>
                  <h4 style={css("margin: 0 0 8px; font-size: clamp(22px, 2.4vw, 28px); font-weight: 900; letter-spacing: -.02em;")}>{career}</h4>
                  <p style={css("margin: 0; max-width: 460px; font-size: 14px; line-height: 1.55; color: rgba(255,255,255,.75);")}>Es la carrera con mayor afinidad en tu perfil. Explora universidades, su malla y el campo laboral para confirmar tu decisión.</p>
                </div>
                <div style={{ ...css("display: grid; place-items: center; width: 110px; height: 110px; border-radius: 50%; flex-shrink: 0;"), background: `conic-gradient(#FF395C ${topPct * 3.6}deg, rgba(255,255,255,.14) 0)` }}>
                  <div style={css("display: grid; place-items: center; width: 84px; height: 84px; border-radius: 50%; background: #000F37;")}>
                    <div style={css("text-align: center;")}><div style={css("font-size: 26px; font-weight: 900; line-height: 1;")}>{topPct}%</div><div style={css("font-size: 10px; color: rgba(255,255,255,.6); font-weight: 700;")}>AFINIDAD</div></div>
                  </div>
                </div>
              </div>
            </div>

            {suggested.length ? (
              <div style={css("display: grid; grid-template-columns: repeat(auto-fill, minmax(248px, 1fr)); gap: 16px;")}>
                {suggested.map((s, i) => (
                  <Fx key={i} base={`background: #fff; border: 1px solid #DDE1E6; border-top: 4px solid ${BAR_PALETTE[i % BAR_PALETTE.length]}; border-radius: 16px; padding: 20px; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .5s ease both; animation-delay: ${i * 0.06}s; transition: transform .2s ease, box-shadow .2s ease;`} hover="transform: translateY(-5px); box-shadow: 0 20px 38px rgba(0,15,55,.1);">
                    <div style={css("display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;")}>
                      <span style={{ ...css("display: inline-flex; padding: 4px 11px; border-radius: 99px; font-size: 11px; font-weight: 800;"), background: BAR_PALETTE[i % BAR_PALETTE.length] + "1f", color: BAR_PALETTE[i % BAR_PALETTE.length] }}>{s.cat}</span>
                      <span style={{ ...css("font-size: 22px; font-weight: 900;"), color: BAR_PALETTE[i % BAR_PALETTE.length] }}>{s.pct}%</span>
                    </div>
                    <h4 style={css("margin: 0 0 8px; font-size: 16px; font-weight: 800; color: #161D1F; line-height: 1.25;")}>{s.name}</h4>
                    <p style={css("margin: 0 0 14px; font-size: 13px; line-height: 1.5; color: #848D95;")}>{s.desc}</p>
                    <div style={css("height: 7px; border-radius: 99px; background: #EEF1F5; overflow: hidden;")}>
                      <div style={{ ...css("height: 100%; border-radius: 99px; transform-origin: left; animation: vtGrowX 1s cubic-bezier(.16,1,.3,1) both;"), width: s.pct + "%", background: BAR_PALETTE[i % BAR_PALETTE.length], animationDelay: 0.2 + i * 0.08 + "s" }} />
                    </div>
                  </Fx>
                ))}
              </div>
            ) : (
              <div style={css("background: #fff; border: 1px dashed #DDE1E6; border-radius: 18px; padding: 40px; text-align: center; color: #848D95; animation: vtFadeUp .5s ease both;")}>
                <p style={css("margin: 0 0 16px; font-size: 15px;")}>Aún no tienes resultados guardados.</p>
                <Fx as="button" onClick={onRetake} base="font-family: inherit; font-size: 14px; font-weight: 800; cursor: pointer; padding: 12px 22px; border-radius: 12px; border: none; background: #FF395C; color: #fff; transition: transform .16s ease;" hover="transform: translateY(-2px);">Hacer el test</Fx>
              </div>
            )}

            <div style={css("margin-top: 22px;")}>
              <Fx as="button" onClick={onRetake} base="display: inline-flex; align-items: center; gap: 8px; font-family: inherit; font-size: 14px; font-weight: 800; cursor: pointer; padding: 12px 20px; border-radius: 12px; border: 1.5px solid #DDE1E6; background: #fff; color: #4A4F55; transition: all .16s ease;" hover="border-color: #FF395C; color: #FF395C; transform: translateY(-2px);">
                ↻ Repetir el test vocacional
              </Fx>
            </div>
          </div>
        )}

        {/* ===== CONFIGURACIÓN ===== */}
        {view === "config" && (
          <div style={css("animation: vtFadeIn .35s ease both; max-width: 640px;")}>
            <h3 style={css("margin: 0 0 18px; font-size: 20px; font-weight: 900; color: #000F37; letter-spacing: -.02em;")}>Configuración</h3>

            <ConfigGroup icon="bell" title="Notificaciones" delay={0}
              items={[
                ["Notificaciones por correo", "Recibe novedades sobre tu carrera", true],
                ["Recordatorios de test", "Avisos para completar tus tests", true],
              ]}
            />
            <ConfigGroup icon="shield" title="Privacidad" delay={0.06}
              items={[
                ["Perfil visible para docentes", "Permite que tu profesor vea tu avance", false],
                ["Compartir resultados anónimos", "Ayuda a mejorar las recomendaciones", true],
              ]}
            />
            <ConfigGroup icon="moon" title="Apariencia" delay={0.12}
              items={[["Modo oscuro", "Cambia la apariencia de la app", false]]}
            />

            {/* Cuenta */}
            <div style={css("background: #fff; border: 1px solid #DDE1E6; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .5s ease both; animation-delay: .18s;")}>
              <div style={css("display: flex; align-items: center; gap: 10px; padding: 16px 20px 10px; font-size: 14px; font-weight: 900; color: #000F37;")}><Icon name="user" size={17} /> Cuenta</div>
              <Fx as="button" base="display: flex; align-items: center; justify-content: space-between; width: 100%; text-align: left; font-family: inherit; cursor: pointer; padding: 16px 20px; border: none; border-top: 1px solid #F2F4F8; background: #fff; transition: background .14s ease;" hover="background: #F8FAFC;">
                <span style={css("font-size: 14px; font-weight: 700; color: #161D1F;")}>Cambiar contraseña</span>
                <span style={css("color: #C7CDD6;")}><Icon name="arrow" size={16} /></span>
              </Fx>
              <Fx as="button" onClick={onLogout} base="display: flex; align-items: center; justify-content: space-between; width: 100%; text-align: left; font-family: inherit; cursor: pointer; padding: 16px 20px; border: none; border-top: 1px solid #F2F4F8; background: #fff; transition: background .14s ease;" hover="background: rgba(227,0,11,.05);">
                <span style={css("font-size: 14px; font-weight: 700; color: #E3000B;")}>Cerrar sesión</span>
                <span style={css("color: #E3000B;")}><Icon name="logout" size={16} /></span>
              </Fx>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Grupo de configuración con encabezado e interruptores.
function ConfigGroup({ icon, title, items, delay }: { icon: string; title: string; items: [string, string, boolean][]; delay: number }) {
  return (
    <div style={{ ...css("background: #fff; border: 1px solid #DDE1E6; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 0 rgba(0,15,55,.03); margin-bottom: 16px; animation: vtFadeUp .5s ease both;"), animationDelay: delay + "s" }}>
      <div style={css("display: flex; align-items: center; gap: 10px; padding: 16px 20px 10px; font-size: 14px; font-weight: 900; color: #000F37;")}><Icon name={icon} size={17} /> {title}</div>
      {items.map((it, i) => (
        <Toggle key={i} label={it[0]} desc={it[1]} initial={it[2]} last={i === items.length - 1} />
      ))}
    </div>
  );
}

// Interruptor estático con animación.
function Toggle({ label, desc, initial, last }: { label: string; desc: string; initial: boolean; last: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <div style={{ ...css("display: flex; align-items: center; gap: 16px; padding: 16px 20px;"), borderTop: "1px solid #F2F4F8", marginBottom: last ? 0 : 0 }}>
      <div style={css("flex: 1; min-width: 0;")}>
        <div style={css("font-size: 14px; font-weight: 800; color: #161D1F;")}>{label}</div>
        <div style={css("font-size: 12px; font-weight: 600; color: #848D95; margin-top: 2px;")}>{desc}</div>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        style={{ ...css("position: relative; width: 46px; height: 26px; border-radius: 99px; border: none; cursor: pointer; transition: background .2s ease; flex-shrink: 0;"), background: on ? "#0661FC" : "#DDE1E6" }}
      >
        <span style={{ ...css("position: absolute; top: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.2); transition: left .2s cubic-bezier(.34,1.56,.64,1);"), left: on ? "23px" : "3px" }} />
      </button>
    </div>
  );
}
