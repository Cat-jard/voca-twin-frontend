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
    case "play": return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7z" /></svg>;
    default: return null;
  }
}

export default function StudentHome({
  userName,
  chosenCareer,
  result,
  onLogout,
  onRetake,
  onGoGeneral,
}: {
  userName: string;
  chosenCareer: string;
  result: Result | null;
  onLogout: () => void;
  onRetake: () => void;
  onGoGeneral: () => void;
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

  const suggested = useMemo(() => {
    const base = result?.shown;
    if (base && base.length) return base;
    return [];
  }, [result]);

  const railItems: { v: View; icon: string }[] = [
    { v: "inicio", icon: "home" },
    { v: "historial", icon: "tests" },
    { v: "carreras", icon: "cap" },
    { v: "config", icon: "gear" },
  ];

  const options: { v: View; icon: string; label: string }[] = [
    { v: "historial", icon: "tests", label: "Historial de tests" },
    { v: "perfil", icon: "user", label: "Mi perfil" },
    { v: "carreras", icon: "cap", label: "Carreras sugeridas" },
    { v: "config", icon: "gear", label: "Configuración" },
  ];

  const saveProfile = () => { setSaved(true); setTimeout(() => setSaved(false), 2200); };

  return (
    <div style={css("min-height: 100vh; background: #F2F4F8; display: grid; grid-template-columns: 68px 1fr 280px; animation: vtFadeIn .45s ease both;")}>
      {/* ── Rail de iconos ── */}
      <aside style={css("display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 18px 0; background: #000F37; position: sticky; top: 0; height: 100vh;")}>
        <div style={css("display: grid; place-items: center; width: 38px; height: 38px; border-radius: 11px; background: #FF395C; color: #fff; font-weight: 900; font-size: 20px; margin-bottom: 14px; box-shadow: 0 8px 20px rgba(255,57,92,.4);")}>+</div>
        {railItems.map((r, i) => {
          const active = view === r.v;
          return (
            <Fx
              key={i}
              as="button"
              onClick={() => setView(r.v)}
              base={`display: grid; place-items: center; width: 44px; height: 44px; border-radius: 13px; border: none; cursor: pointer; transition: all .18s ease; background: ${active ? "rgba(255,255,255,.14)" : "transparent"}; color: ${active ? "#fff" : "rgba(255,255,255,.55)"};`}
              hover="background: rgba(255,255,255,.1); color: #fff;"
            >
              <Icon name={r.icon} />
            </Fx>
          );
        })}
        <div style={css("flex: 1;")} />
        <Fx as="button" onClick={onLogout} base="display: grid; place-items: center; width: 44px; height: 44px; border-radius: 13px; border: none; cursor: pointer; background: transparent; color: rgba(255,255,255,.55); transition: all .18s ease;" hover="background: rgba(227,0,11,.2); color: #FF395C;">
          <Icon name="logout" />
        </Fx>
      </aside>

      {/* ── Contenido principal ── */}
      <main style={css("padding: 30px 34px; min-width: 0; overflow-x: hidden;")}>
        <div style={css("margin-bottom: 24px; animation: vtFadeUp .5s ease both;")}>
          <h1 style={css("margin: 0 0 6px; font-size: clamp(24px, 3vw, 32px); font-weight: 900; letter-spacing: -.03em; color: #000F37;")}>Tu dashboard vocacional</h1>
          <p style={css("margin: 0; font-size: 14px; color: #4A4F55;")}>Resultados, seguimiento con IA y recomendaciones</p>
        </div>

        {/* ===== INICIO ===== */}
        {view === "inicio" && (
          <div style={css("display: grid; grid-template-columns: 1.35fr 1fr; gap: 20px; align-items: start; animation: vtFadeIn .35s ease both;")}>
            <div style={css("display: flex; flex-direction: column; gap: 20px; min-width: 0;")}>
              {/* Carrera elegida */}
              <div style={css("position: relative; overflow: hidden; background: linear-gradient(135deg, #0661FC, #0a3fb0); border-radius: 20px; padding: 24px; color: #fff; box-shadow: 0 20px 44px rgba(6,97,252,.28); animation: vtPop .5s cubic-bezier(.16,1,.3,1) both;")}>
                <div style={css("position: absolute; top: -40px; right: -30px; width: 180px; height: 180px; border-radius: 50%; background: rgba(61,220,218,.28); filter: blur(6px);")} />
                <div style={css("position: relative; display: flex; align-items: center; gap: 8px; margin-bottom: 10px;")}>
                  <span style={css("display: grid; place-items: center; width: 26px; height: 26px; border-radius: 8px; background: rgba(255,255,255,.2);")}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </span>
                  <span style={css("font-size: 12px; font-weight: 800; letter-spacing: .06em; color: rgba(255,255,255,.85);")}>TU CARRERA ELEGIDA</span>
                </div>
                <h2 style={css("position: relative; margin: 0; font-size: clamp(22px, 2.6vw, 30px); font-weight: 900; letter-spacing: -.02em; line-height: 1.1;")}>{chosenCareer || "Ingeniería de Software"}</h2>
              </div>

              {/* Resultados del test */}
              <div style={css("background: #fff; border: 1px solid #DDE1E6; border-radius: 18px; padding: 24px; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .5s ease both; animation-delay: .06s;")}>
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

              {/* Video IA */}
              <div style={css("background: #fff; border: 1px solid #DDE1E6; border-radius: 18px; padding: 24px; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .5s ease both; animation-delay: .12s;")}>
                <h3 style={css("margin: 0 0 16px; font-size: 16px; font-weight: 900; color: #000F37; letter-spacing: -.02em;")}>Video informativo: tu perfil vocacional</h3>
                <div style={css("position: relative; aspect-ratio: 16/9; border-radius: 14px; overflow: hidden; background: linear-gradient(135deg, #1a2a5e, #000F37);")}>
                  <div style={css("position: absolute; inset: 0; display: grid; place-items: center;")}>
                    <Fx as="button" base="display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; border: none; background: rgba(255,255,255,.22); color: #fff; cursor: pointer; backdrop-filter: blur(4px); animation: vtPulseSoft 2.4s ease-in-out infinite;" hover="transform: scale(1.1);" active="transform: scale(.95);"><Icon name="play" size={26} /></Fx>
                  </div>
                </div>
                <p style={css("margin: 14px 0 0; font-size: 13px; color: #848D95;")}>Generado por IA según tus resultados · 2:30 min</p>
              </div>
            </div>

            {/* Asistente */}
            <div style={css("display: flex; flex-direction: column; background: #fff; border: 1px solid #DDE1E6; border-radius: 18px; overflow: hidden; box-shadow: 0 2px 0 rgba(0,15,55,.03); min-height: 560px; animation: vtSlideRight .5s ease both; animation-delay: .08s;")}>
              <div style={css("display: flex; align-items: center; gap: 11px; padding: 16px; background: #0661FC; color: #fff;")}>
                <span style={css("display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,.2);")}><Icon name="chat" size={18} /></span>
                <div><div style={css("font-size: 14px; font-weight: 900;")}>Asistente VocaTwin</div><div style={css("font-size: 11px; font-weight: 700; color: rgba(255,255,255,.8);")}>Con IA · en línea</div></div>
              </div>
              <div style={css("flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: #F8FAFC; overflow-y: auto;")}>
                <div style={css("max-width: 88%; align-self: flex-start; background: #fff; border: 1px solid #EEF1F5; border-radius: 14px 14px 14px 4px; padding: 12px 14px; font-size: 13.5px; line-height: 1.5; color: #161D1F; box-shadow: 0 2px 8px rgba(0,15,55,.05); animation: vtFadeUp .4s ease both;")}>
                  Hola {userName}, vi tus resultados. ¿Quieres que te cuente más sobre {chosenCareer || "Ingeniería de Software"}?
                </div>
                <div style={css("max-width: 70%; align-self: flex-end; background: #0661FC; color: #fff; border-radius: 14px 14px 4px 14px; padding: 12px 14px; font-size: 13.5px; font-weight: 700; box-shadow: 0 6px 16px rgba(6,97,252,.3); animation: vtFadeUp .4s ease both; animation-delay: .1s;")}>
                  Sí, por favor
                </div>
                <div style={css("max-width: 88%; align-self: flex-start; background: #fff; border: 1px solid #EEF1F5; border-radius: 14px 14px 14px 4px; padding: 12px 14px; font-size: 13.5px; line-height: 1.5; color: #161D1F; box-shadow: 0 2px 8px rgba(0,15,55,.05); animation: vtFadeUp .4s ease both; animation-delay: .2s;")}>
                  Es la carrera con mayor afinidad en tu perfil. Te muestro universidades y un plan de estudios recomendado. 🎓
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
          <div style={css("animation: vtFadeIn .35s ease both; max-width: 760px;")}>
            <div style={css("display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;")}>
              <h3 style={css("margin: 0; font-size: 20px; font-weight: 900; color: #000F37; letter-spacing: -.02em;")}>Historial de tests</h3>
              <Fx as="button" onClick={onRetake} base="font-family: inherit; font-size: 13px; font-weight: 800; cursor: pointer; padding: 10px 18px; border-radius: 11px; border: none; background: #FF395C; color: #fff; box-shadow: 0 8px 20px rgba(255,57,92,.3); transition: transform .16s ease;" hover="transform: translateY(-2px);">↻ Repetir test</Fx>
            </div>
            <div style={css("display: grid; gap: 14px;")}>
              {TEST_HISTORY.map((t, i) => (
                <Fx key={i} base={`display: flex; align-items: center; gap: 16px; background: #fff; border: 1px solid #DDE1E6; border-radius: 16px; padding: 18px 22px; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .5s ease both; animation-delay: ${i * 0.08}s; transition: transform .2s ease, box-shadow .2s ease;`} hover="transform: translateY(-3px); box-shadow: 0 16px 32px rgba(0,15,55,.08);">
                  <span style={css("display: grid; place-items: center; width: 46px; height: 46px; border-radius: 13px; background: rgba(6,97,252,.1); color: #0661FC; flex-shrink: 0;")}><Icon name="tests" /></span>
                  <div style={css("flex: 1; min-width: 0;")}>
                    <div style={css("font-size: 15px; font-weight: 800; color: #161D1F;")}>{t.titulo}</div>
                    <div style={css("font-size: 13px; font-weight: 600; color: #848D95; margin-top: 3px;")}>{t.fecha} · {t.preguntas} preguntas</div>
                  </div>
                  <div style={css("text-align: right; flex-shrink: 0;")}>
                    <div style={css("font-size: 12px; font-weight: 700; color: #848D95;")}>Carrera top</div>
                    <div style={css("font-size: 14px; font-weight: 800; color: #161D1F;")}>{t.top}</div>
                  </div>
                  <span style={css("display: grid; place-items: center; min-width: 54px; height: 40px; border-radius: 11px; background: rgba(10,143,140,.12); color: #0a8f8c; font-size: 15px; font-weight: 900; flex-shrink: 0;")}>{t.pct}%</span>
                </Fx>
              ))}
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
                  <div key={i} style={i >= 4 ? css("grid-column: span 1;") : undefined}>
                    <label style={css("display: block; font-size: 12px; font-weight: 800; color: #4A4F55; margin-bottom: 6px;")}>{f[0]}</label>
                    <Fx as="input" defaultValue={f[1]} base="width: 100%; font-family: inherit; font-size: 14px; padding: 12px 14px; border-radius: 11px; border: 1.5px solid #E8EBF0; background: #F8FAFC; color: #161D1F; outline: none; transition: border-color .16s ease;" focus="border-color: #0661FC; background: #fff;" />
                  </div>
                ))}
              </div>
              <div style={css("display: flex; align-items: center; gap: 14px; margin-top: 24px;")}>
                <Fx as="button" onClick={saveProfile} base="font-family: inherit; font-size: 14px; font-weight: 800; cursor: pointer; padding: 13px 24px; border-radius: 12px; border: none; background: #0661FC; color: #fff; box-shadow: 0 10px 24px rgba(6,97,252,.3); transition: transform .16s ease;" hover="transform: translateY(-2px);" active="transform: scale(.98);">Guardar cambios</Fx>
                {saved && (
                  <span style={css("display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 800; color: #0a8f8c; animation: vtFadeIn .3s ease both;")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    Cambios guardados
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== CARRERAS SUGERIDAS ===== */}
        {view === "carreras" && (
          <div style={css("animation: vtFadeIn .35s ease both;")}>
            <h3 style={css("margin: 0 0 18px; font-size: 20px; font-weight: 900; color: #000F37; letter-spacing: -.02em;")}>Carreras sugeridas para ti</h3>
            {suggested.length ? (
              <div style={css("display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;")}>
                {suggested.map((s, i) => (
                  <Fx key={i} base={`background: #fff; border: 1px solid #DDE1E6; border-top: 4px solid ${BAR_PALETTE[i % BAR_PALETTE.length]}; border-radius: 16px; padding: 20px; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .5s ease both; animation-delay: ${i * 0.06}s; transition: transform .2s ease, box-shadow .2s ease;`} hover="transform: translateY(-5px); box-shadow: 0 20px 38px rgba(0,15,55,.1);">
                    <div style={css("display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;")}>
                      <span style={{ ...css("display: inline-flex; padding: 4px 11px; border-radius: 99px; font-size: 11px; font-weight: 800;"), background: BAR_PALETTE[i % BAR_PALETTE.length] + "1f", color: BAR_PALETTE[i % BAR_PALETTE.length] }}>{s.cat}</span>
                      <span style={{ ...css("font-size: 22px; font-weight: 900;"), color: BAR_PALETTE[i % BAR_PALETTE.length] }}>{s.pct}%</span>
                    </div>
                    <h4 style={css("margin: 0 0 6px; font-size: 16px; font-weight: 800; color: #161D1F; line-height: 1.25;")}>{s.name}</h4>
                    <p style={css("margin: 0; font-size: 13px; line-height: 1.5; color: #848D95;")}>{s.desc}</p>
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
              <Fx as="button" onClick={onGoGeneral} base="display: inline-flex; align-items: center; gap: 8px; font-family: inherit; font-size: 14px; font-weight: 800; cursor: pointer; padding: 12px 20px; border-radius: 12px; border: 1.5px solid #DDE1E6; background: #fff; color: #4A4F55; transition: all .16s ease;" hover="border-color: #0661FC; color: #0661FC; transform: translateY(-2px);">
                Ver comparativa completa →
              </Fx>
            </div>
          </div>
        )}

        {/* ===== CONFIGURACIÓN ===== */}
        {view === "config" && (
          <div style={css("animation: vtFadeIn .35s ease both; max-width: 620px;")}>
            <h3 style={css("margin: 0 0 18px; font-size: 20px; font-weight: 900; color: #000F37; letter-spacing: -.02em;")}>Configuración</h3>
            <div style={css("background: #fff; border: 1px solid #DDE1E6; border-radius: 18px; overflow: hidden; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .5s ease both;")}>
              {[
                ["Notificaciones por correo", "Recibe novedades sobre tu carrera", true],
                ["Recordatorios de test", "Avisos para completar tus tests", true],
                ["Perfil visible para docentes", "Permite que tu profesor vea tu avance", false],
                ["Modo oscuro", "Cambia la apariencia de la app", false],
              ].map((s, i) => (
                <Toggle key={i} label={s[0] as string} desc={s[1] as string} initial={s[2] as boolean} last={i === 3} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Panel de opciones (derecha) ── */}
      <aside style={css("padding: 24px 22px; background: #fff; border-left: 1px solid #DDE1E6; position: sticky; top: 0; height: 100vh; overflow-y: auto; animation: vtSlideLeft .5s ease both;")}>
        <div style={css("display: flex; align-items: center; gap: 12px; margin-bottom: 28px;")}>
          <span style={css("display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%; background: #0661FC; color: #fff; font-size: 16px; font-weight: 900;")}>{initials}</span>
          <div style={css("min-width: 0;")}>
            <div style={css("font-size: 15px; font-weight: 900; color: #161D1F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;")}>{userName}</div>
            <div style={css("font-size: 12px; font-weight: 700; color: #848D95;")}>Estudiante</div>
          </div>
        </div>

        <div style={css("font-size: 12px; font-weight: 800; color: #848D95; letter-spacing: .08em; margin-bottom: 12px;")}>OPCIONES</div>
        <div style={css("display: grid; gap: 4px;")}>
          {options.map((o, i) => {
            const active = view === o.v;
            return (
              <Fx
                key={i}
                as="button"
                onClick={() => setView(o.v)}
                base={`display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; padding: 12px 14px; border-radius: 12px; border: none; transition: all .16s ease; background: ${active ? "rgba(6,97,252,.08)" : "transparent"}; color: ${active ? "#0661FC" : "#4A4F55"};`}
                hover="background: #F2F4F8;"
              >
                <Icon name={o.icon} size={18} />
                {o.label}
              </Fx>
            );
          })}
        </div>

        <div style={css("height: 1px; background: #EEF1F5; margin: 16px 0;")} />

        <Fx as="button" onClick={onLogout} base="display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; font-family: inherit; font-size: 14px; font-weight: 800; cursor: pointer; padding: 12px 14px; border-radius: 12px; border: none; background: transparent; color: #E3000B; transition: all .16s ease;" hover="background: rgba(227,0,11,.07);">
          <Icon name="logout" size={18} />
          Cerrar sesión
        </Fx>
      </aside>
    </div>
  );
}

// Interruptor estático con animación.
function Toggle({ label, desc, initial, last }: { label: string; desc: string; initial: boolean; last: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <div style={{ ...css("display: flex; align-items: center; gap: 16px; padding: 18px 22px;"), borderBottom: last ? "none" : "1px solid #F2F4F8" }}>
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
