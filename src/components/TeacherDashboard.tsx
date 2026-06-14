"use client";

import React, { useEffect, useMemo, useState } from "react";
import { css, Fx } from "./fx";
import { getAllUsers, getUserCareers } from "@/lib/api";

interface RealStudent { name: string; estado: string; carrera: string; fecha: string; pct: number; }

// ── Datos de respaldo (si el backend no está disponible) ─────────────────────
const SECTIONS = ["5° A — Secundaria", "5° B — Secundaria", "4° A — Secundaria"];

const METRICS = [
  { label: "Estudiantes", value: "132", sub: "+8 esta semana", color: "#161D1F", accent: "#0661FC", icon: "users" },
  { label: "Tests completados", value: "98", sub: "74% del total", color: "#161D1F", accent: "#0a8f8c", icon: "check" },
  { label: "Pendientes", value: "34", sub: "Sin iniciar o a medias", color: "#FF395C", accent: "#FF395C", icon: "clock" },
  { label: "Tasa de avance", value: "74%", sub: "Meta de la sección: 90%", color: "#0661FC", accent: "#0661FC", icon: "trend" },
] as const;

const CAREER_BARS = [
  { name: "Ingeniería de Software", pct: 81, color: "#0661FC" },
  { name: "Administración", pct: 67, color: "#0a8f8c" },
  { name: "Diseño Gráfico", pct: 54, color: "#FF395C" },
  { name: "Psicología", pct: 42, color: "#F94C61" },
  { name: "Medicina", pct: 38, color: "#7B2CBF" },
];

const STUDENTS = [
  { name: "Ana Torres", estado: "Completado", carrera: "Ing. de Software", fecha: "12 jun", pct: 92 },
  { name: "Diego Ramos", estado: "Pendiente", carrera: "—", fecha: "—", pct: 0 },
  { name: "Camila Flores", estado: "Completado", carrera: "Diseño Gráfico", fecha: "11 jun", pct: 88 },
  { name: "Luis Quispe", estado: "Completado", carrera: "Administración", fecha: "10 jun", pct: 79 },
  { name: "Sofía Mendoza", estado: "Completado", carrera: "Psicología", fecha: "10 jun", pct: 85 },
  { name: "Mateo Ríos", estado: "Pendiente", carrera: "—", fecha: "—", pct: 0 },
];

// Distribución por área (mini-gráfico de anillo).
const AREAS = [
  { label: "Ingeniería", pct: 38, color: "#0661FC" },
  { label: "Negocios", pct: 24, color: "#0a8f8c" },
  { label: "Salud", pct: 18, color: "#FF395C" },
  { label: "Arte y Com.", pct: 12, color: "#FFB020" },
  { label: "Otras", pct: 8, color: "#7B2CBF" },
];

function MetricIcon({ name }: { name: string }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "users") return <svg {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
  if (name === "check") return <svg {...common}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" /></svg>;
  if (name === "clock") return <svg {...common}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
  return <svg {...common}><path d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6" /></svg>;
}

export default function TeacherDashboard({
  teacherName,
  onLogout,
}: {
  teacherName: string;
  onLogout: () => void;
}) {
  const [section, setSection] = useState(0);

  // ── Datos reales del backend (alumnos + sus carreras) ──
  const [realStudents, setRealStudents] = useState<RealStudent[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const users = await getAllUsers();
        const alumnos = users.filter((u) => (u.tipo ?? "").toUpperCase().includes("POSTULANTE"));
        const rows = await Promise.all(
          alumnos.map(async (u): Promise<RealStudent> => {
            const nombre = `${u.nombre ?? ""} ${u.apellido ?? ""}`.trim() || u.email;
            try {
              const careers = await getUserCareers(u.idUsuario);
              if (!careers.length) return { name: nombre, estado: "Pendiente", carrera: "—", fecha: "—", pct: 0 };
              const top = [...careers].sort((a, b) => b.pct - a.pct)[0];
              const iso = careers.find((c) => c.createdAt)?.createdAt;
              const fecha = iso ? new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short" }) : "—";
              return { name: nombre, estado: "Completado", carrera: top.career, fecha, pct: top.pct };
            } catch {
              return { name: nombre, estado: "Pendiente", carrera: "—", fecha: "—", pct: 0 };
            }
          })
        );
        if (!cancelled) setRealStudents(rows);
      } catch (e) {
        console.warn("[TeacherDashboard] ⚠️ sin datos reales (uso respaldo):", e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Si hay datos reales se usan; si no, respaldo estático.
  const students = realStudents ?? STUDENTS;
  const metrics = useMemo(() => {
    if (!realStudents) return METRICS;
    const total = realStudents.length;
    const done = realStudents.filter((s) => s.estado === "Completado").length;
    const pend = total - done;
    const tasa = total ? Math.round((done / total) * 100) : 0;
    return [
      { label: "Estudiantes", value: String(total), sub: "registrados", color: "#161D1F", accent: "#0661FC", icon: "users" },
      { label: "Tests completados", value: String(done), sub: total ? `${Math.round((done / total) * 100)}% del total` : "—", color: "#161D1F", accent: "#0a8f8c", icon: "check" },
      { label: "Pendientes", value: String(pend), sub: "Sin iniciar o a medias", color: "#FF395C", accent: "#FF395C", icon: "clock" },
      { label: "Tasa de avance", value: tasa + "%", sub: "Meta de la sección: 90%", color: "#0661FC", accent: "#0661FC", icon: "trend" },
    ] as const;
  }, [realStudents]);

  // Carreras con mayor afinidad (agregadas de los alumnos reales).
  const careerBars = useMemo(() => {
    if (!realStudents) return CAREER_BARS;
    const counts = new Map<string, { sum: number; n: number }>();
    realStudents.filter((s) => s.carrera !== "—").forEach((s) => {
      const e = counts.get(s.carrera) ?? { sum: 0, n: 0 };
      e.sum += s.pct; e.n += 1; counts.set(s.carrera, e);
    });
    const palette = ["#0661FC", "#0a8f8c", "#FF395C", "#F94C61", "#7B2CBF"];
    const arr = [...counts.entries()]
      .map(([name, { sum, n }]) => ({ name, pct: Math.round(sum / n) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5)
      .map((c, i) => ({ ...c, color: palette[i % palette.length] }));
    return arr.length ? arr : CAREER_BARS;
  }, [realStudents]);

  // Geometría del anillo de distribución (offsets acumulados sin mutación).
  const ringStops = AREAS.map((a, i) => {
    const start = AREAS.slice(0, i).reduce((s, x) => s + x.pct * 3.6, 0);
    const end = start + a.pct * 3.6;
    return `${a.color} ${start}deg ${end}deg`;
  }).join(", ");

  return (
    <div style={css("min-height: 100vh; background: #F2F4F8; animation: vtFadeIn .45s ease both;")}>
      {/* Barra superior */}
      <nav style={css("position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 16px 40px; background: #000F37; color: #fff; box-shadow: 0 6px 20px rgba(0,15,55,.25); animation: vtFadeDown .5s ease both;")}>
        <div style={css("display: flex; align-items: center; gap: 14px;")}>
          <div style={css("display: flex; align-items: center; gap: 9px; font-weight: 900; font-size: 20px; letter-spacing: -.02em;")}>
            <span style={css("display: grid; place-items: center; width: 30px; height: 30px; border-radius: 9px; background: #fff; color: #000F37; font-size: 15px; transform: rotate(-6deg);")}>V</span>
            Voca<span style={css("color: #FF395C;")}>Twin</span>
          </div>
          <span style={css("display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 99px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18); font-size: 12px; font-weight: 800; letter-spacing: .03em;")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 1 4 3 6 3s6-2 6-3v-5" /></svg>
            Instructor
          </span>
        </div>
        <div style={css("display: flex; align-items: center; gap: 18px;")}>
          <Fx as="button" base="position: relative; display: grid; place-items: center; width: 38px; height: 38px; border-radius: 11px; border: none; background: rgba(255,255,255,.08); color: #fff; cursor: pointer; transition: background .16s ease;" hover="background: rgba(255,255,255,.18);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
            <span style={css("position: absolute; top: 7px; right: 8px; width: 8px; height: 8px; border-radius: 99px; background: #FF395C; border: 2px solid #000F37;")} />
          </Fx>
          <Fx as="button" onClick={onLogout} base="display: flex; align-items: center; gap: 9px; background: none; border: none; cursor: pointer; color: #fff; font-family: inherit;" hover="opacity: .85;">
            <span style={css("display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; background: #FF395C; color: #fff; font-size: 13px; font-weight: 900;")}>JL</span>
          </Fx>
        </div>
      </nav>

      <div style={css("max-width: 1180px; margin: 0 auto; padding: 36px 40px 80px;")}>
        {/* Encabezado */}
        <div style={css("display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-bottom: 26px; animation: vtFadeUp .5s ease both;")}>
          <div>
            <h1 style={css("margin: 0 0 6px; font-size: clamp(26px, 3.4vw, 36px); font-weight: 900; letter-spacing: -.03em; color: #000F37;")}>Hola, profesor {teacherName}</h1>
            <p style={css("margin: 0; font-size: 15px; color: #4A4F55;")}>Resumen de resultados vocacionales de tus secciones</p>
          </div>
          {/* Selector de sección segmentado (sin solapamientos) */}
          <div style={css("display: flex; gap: 4px; padding: 4px; border-radius: 13px; background: #E8EBF0;")}>
            {SECTIONS.map((s, i) => {
              const active = i === section;
              return (
                <button
                  key={i}
                  onClick={() => setSection(i)}
                  style={{
                    ...css("font-family: inherit; font-size: 13px; font-weight: 800; cursor: pointer; padding: 9px 15px; border-radius: 10px; border: none; white-space: nowrap; transition: all .2s ease;"),
                    background: active ? "#fff" : "transparent",
                    color: active ? "#000F37" : "#4A4F55",
                    boxShadow: active ? "0 2px 8px rgba(0,15,55,.12)" : "none",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Métricas */}
        <div style={css("display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 22px;")}>
          {metrics.map((m, i) => (
            <Fx key={i} base={`position: relative; overflow: hidden; background: #fff; border: 1px solid #DDE1E6; border-radius: 18px; padding: 22px; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .55s ease both; animation-delay: ${i * 0.07}s; transition: transform .2s ease, box-shadow .2s ease;`} hover="transform: translateY(-5px); box-shadow: 0 22px 40px rgba(0,15,55,.1);">
              <div style={css("display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;")}>
                <span style={css("font-size: 13px; font-weight: 800; color: #848D95;")}>{m.label}</span>
                <span style={{ ...css("display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px;"), background: m.accent + "1f", color: m.accent }}><MetricIcon name={m.icon} /></span>
              </div>
              <div style={{ ...css("font-size: 38px; font-weight: 900; letter-spacing: -.03em; line-height: 1;"), color: m.color }}>{m.value}</div>
              <div style={css("margin-top: 8px; font-size: 12px; font-weight: 700; color: #848D95;")}>{m.sub}</div>
              <div style={{ ...css("position: absolute; left: 0; bottom: 0; height: 3px; transform-origin: left; animation: vtGrowX .9s cubic-bezier(.16,1,.3,1) both;"), width: "100%", background: m.accent, animationDelay: i * 0.07 + 0.2 + "s" }} />
            </Fx>
          ))}
        </div>

        {/* Carreras con mayor afinidad + distribución */}
        <div style={css("display: grid; grid-template-columns: 1.6fr 1fr; gap: 18px; margin-bottom: 22px;")}>
          <div style={css("background: #fff; border: 1px solid #DDE1E6; border-radius: 18px; padding: 26px; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .55s ease both; animation-delay: .1s;")}>
            <h3 style={css("margin: 0 0 22px; font-size: 18px; font-weight: 900; color: #000F37; letter-spacing: -.02em;")}>Carreras con mayor afinidad (sección)</h3>
            <div style={css("display: grid; gap: 18px;")}>
              {careerBars.map((c, i) => (
                <div key={i} style={css("display: grid; grid-template-columns: 180px 1fr 46px; align-items: center; gap: 14px;")}>
                  <span style={css("font-size: 14px; font-weight: 700; color: #161D1F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;")}>{c.name}</span>
                  <div style={css("height: 12px; border-radius: 99px; background: #EEF1F5; overflow: hidden;")}>
                    <div style={{ ...css("height: 100%; border-radius: 99px; transform-origin: left; animation: vtGrowX 1s cubic-bezier(.16,1,.3,1) both;"), width: c.pct + "%", background: c.color, animationDelay: 0.2 + i * 0.1 + "s" }} />
                  </div>
                  <span style={{ ...css("font-size: 14px; font-weight: 900; text-align: right;"), color: c.color }}>{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div style={css("background: #fff; border: 1px solid #DDE1E6; border-radius: 18px; padding: 26px; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .55s ease both; animation-delay: .16s;")}>
            <h3 style={css("margin: 0 0 18px; font-size: 18px; font-weight: 900; color: #000F37; letter-spacing: -.02em;")}>Distribución por área</h3>
            <div style={css("display: flex; align-items: center; gap: 20px;")}>
              <div style={{ ...css("position: relative; display: grid; place-items: center; width: 116px; height: 116px; border-radius: 50%; flex-shrink: 0; animation: vtPop .6s cubic-bezier(.16,1,.3,1) both;"), background: `conic-gradient(${ringStops})` }}>
                <div style={css("display: grid; place-items: center; width: 78px; height: 78px; border-radius: 50%; background: #fff;")}>
                  <span style={css("font-size: 22px; font-weight: 900; color: #000F37;")}>5</span>
                </div>
              </div>
              <div style={css("display: grid; gap: 9px; flex: 1;")}>
                {AREAS.map((a, i) => (
                  <div key={i} style={{ ...css("display: flex; align-items: center; gap: 9px; animation: vtFadeUp .5s ease both;"), animationDelay: 0.2 + i * 0.06 + "s" }}>
                    <span style={{ ...css("width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0;"), background: a.color }} />
                    <span style={css("font-size: 13px; font-weight: 700; color: #4A4F55; flex: 1;")}>{a.label}</span>
                    <span style={css("font-size: 13px; font-weight: 800; color: #161D1F;")}>{a.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Estudiantes recientes */}
        <div style={css("background: #fff; border: 1px solid #DDE1E6; border-radius: 18px; padding: 26px; box-shadow: 0 2px 0 rgba(0,15,55,.03); margin-bottom: 22px; animation: vtFadeUp .55s ease both; animation-delay: .2s;")}>
          <div style={css("display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;")}>
            <h3 style={css("margin: 0; font-size: 18px; font-weight: 900; color: #000F37; letter-spacing: -.02em;")}>Estudiantes recientes</h3>
            <Fx as="button" base="font-family: inherit; font-size: 13px; font-weight: 800; cursor: pointer; padding: 9px 16px; border-radius: 10px; border: 1.5px solid #DDE1E6; background: #fff; color: #0661FC; transition: all .16s ease;" hover="border-color: #0661FC; background: rgba(6,97,252,.06);">Ver todos</Fx>
          </div>
          <div style={css("display: grid; grid-template-columns: 1.4fr 1fr 1.2fr .7fr; padding: 0 4px 10px; border-bottom: 1px solid #EEF1F5;")}>
            {["Estudiante", "Estado", "Carrera top", "Fecha"].map((h, i) => (
              <span key={i} style={css("font-size: 12px; font-weight: 800; color: #848D95; letter-spacing: .04em;")}>{h}</span>
            ))}
          </div>
          {students.map((s, i) => {
            const done = s.estado === "Completado";
            return (
              <Fx key={i} base={`display: grid; grid-template-columns: 1.4fr 1fr 1.2fr .7fr; align-items: center; padding: 14px 4px; border-bottom: 1px solid #F2F4F8; animation: vtFadeUp .45s ease both; animation-delay: ${0.25 + i * 0.05}s; transition: background .14s ease;`} hover="background: #F8FAFC;">
                <div style={css("display: flex; align-items: center; gap: 11px;")}>
                  <span style={{ ...css("display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; font-size: 12px; font-weight: 900; color: #fff;"), background: done ? "#0661FC" : "#C7CDD6" }}>{s.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</span>
                  <span style={css("font-size: 14px; font-weight: 700; color: #161D1F;")}>{s.name}</span>
                </div>
                <span style={{ ...css("justify-self: start; display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 99px; font-size: 12px; font-weight: 800;"), background: done ? "rgba(10,143,140,.12)" : "rgba(255,138,42,.14)", color: done ? "#0a8f8c" : "#c2410c" }}>
                  <span style={{ ...css("width: 6px; height: 6px; border-radius: 99px;"), background: done ? "#0a8f8c" : "#c2410c" }} />
                  {s.estado}
                </span>
                <span style={css("font-size: 14px; font-weight: 600; color: #4A4F55;")}>{s.carrera}</span>
                <span style={css("font-size: 13px; font-weight: 700; color: #848D95;")}>{s.fecha}</span>
              </Fx>
            );
          })}
        </div>

        {/* Acciones */}
        <div style={css("display: grid; grid-template-columns: 1fr 1fr; gap: 18px;")}>
          <Fx base="display: flex; align-items: center; gap: 16px; background: #fff; border: 1px solid #DDE1E6; border-radius: 18px; padding: 22px; box-shadow: 0 2px 0 rgba(0,15,55,.03); cursor: pointer; animation: vtFadeUp .55s ease both; animation-delay: .3s; transition: transform .2s ease, box-shadow .2s ease;" hover="transform: translateY(-4px); box-shadow: 0 20px 38px rgba(0,15,55,.1);">
            <span style={css("display: grid; place-items: center; width: 50px; height: 50px; border-radius: 14px; background: rgba(6,97,252,.12); color: #0661FC; flex-shrink: 0;")}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" /><path d="M22 6l-10 7L2 6" /></svg>
            </span>
            <div><div style={css("font-size: 16px; font-weight: 900; color: #161D1F;")}>Enviar recordatorio</div><div style={css("font-size: 13px; font-weight: 600; color: #848D95;")}>34 estudiantes pendientes</div></div>
          </Fx>
          <Fx base="display: flex; align-items: center; gap: 16px; background: #fff; border: 1px solid #DDE1E6; border-radius: 18px; padding: 22px; box-shadow: 0 2px 0 rgba(0,15,55,.03); cursor: pointer; animation: vtFadeUp .55s ease both; animation-delay: .35s; transition: transform .2s ease, box-shadow .2s ease;" hover="transform: translateY(-4px); box-shadow: 0 20px 38px rgba(0,15,55,.1);">
            <span style={css("display: grid; place-items: center; width: 50px; height: 50px; border-radius: 14px; background: rgba(10,143,140,.14); color: #0a8f8c; flex-shrink: 0;")}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            </span>
            <div><div style={css("font-size: 16px; font-weight: 900; color: #161D1F;")}>Exportar reporte</div><div style={css("font-size: 13px; font-weight: 600; color: #848D95;")}>Formato PDF / Excel</div></div>
          </Fx>
        </div>
      </div>
    </div>
  );
}
