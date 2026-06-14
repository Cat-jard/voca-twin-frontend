"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { css, Fx } from "./fx";
import CareerDetailModal from "./CareerDetailModal";
import TeacherDashboard from "./TeacherDashboard";
import StudentHome from "./StudentHome";
import {
  CELEBS,
  QUESTIONS,
  computeResult,
  particlesFor,
  type CelebTheme,
  type Result,
} from "@/lib/vocaData";

type Screen =
  | "landing"
  | "test"
  | "results"
  | "teacherLogin"
  | "teacherDashboard"
  | "studentHome";

// Datos visuales de la tarjeta abierta en la ventana de detalle.
interface CardModal {
  name: string;
  cat: string;
  desc: string;
  pct: number;
  color: string;
  badgeBg: string;
  rank: string;
}

const BLOCK = 5;

const celebBgs: Record<CelebTheme, string> = {
  fire: "radial-gradient(circle at 50% 38%, #FF8A2A 0%, #E3000B 60%, #6e0008 100%)",
  blue: "radial-gradient(circle at 50% 38%, #3DDCDA 0%, #0661FC 58%, #001a4d 100%)",
  violet: "radial-gradient(circle at 50% 38%, #C77DFF 0%, #7B2CBF 58%, #2a0a4a 100%)",
  sun: "radial-gradient(circle at 50% 38%, #FFD23F 0%, #FF8A2A 56%, #b34700 100%)",
  party: "radial-gradient(circle at 50% 36%, #7ff0ee 0%, #0a8f8c 50%, #013330 100%)",
};
const celebGlows: Record<CelebTheme, string> = {
  fire: "rgba(255,180,60,.85)", blue: "rgba(159,232,255,.8)", violet: "rgba(224,170,255,.85)",
  sun: "rgba(255,224,138,.9)", party: "rgba(255,210,63,.85)",
};
const celebCtaColors: Record<CelebTheme, string> = {
  fire: "#E3000B", blue: "#0661FC", violet: "#7B2CBF", sun: "#c2410c", party: "#0a8f8c",
};

const blockTitles = [
  "Cuéntanos cómo piensas.",
  "Vamos por más sobre ti.",
  "Mitad del camino.",
  "Casi lo tienes.",
  "Última ronda. ¡Tú puedes!",
];

export default function VocaTwin() {
  const heroRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [screen, setScreen] = useState<Screen>("landing");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPwd, setLoginPwd] = useState("");
  const [loginError, setLoginError] = useState("");
  const [testBlock, setTestBlock] = useState(0);
  const [celebration, setCelebration] = useState(false);
  const [modalCard, setModalCard] = useState<CardModal | null>(null);
  const [chosenCareer, setChosenCareer] = useState("");
  const [loginHint, setLoginHint] = useState(false);
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPwd, setTeacherPwd] = useState("");
  const [teacherError, setTeacherError] = useState("");
  const [teacherName, setTeacherName] = useState("Luna");

  // Partículas fijas por tema (se calculan una sola vez).
  const parts = useMemo(
    () => ({
      fire: particlesFor("fire"),
      blue: particlesFor("blue"),
      violet: particlesFor("violet"),
      sun: particlesFor("sun"),
      party: particlesFor("party"),
    }),
    []
  );

  const scrollTop = useCallback(() => {
    try { window.scrollTo({ top: 0, behavior: "auto" }); } catch { }
  }, []);

  // --- Montaje: cargar localStorage + listeners de parallax y progreso ---
  useEffect(() => {
    try {
      const logged = localStorage.getItem("vt_isLoggedIn") === "true";
      const email = localStorage.getItem("vt_userEmail") || "";
      const res = localStorage.getItem("vt_result");
      setIsLoggedIn(logged);
      setUserEmail(email);
      setResult(res ? (JSON.parse(res) as Result) : null);
      setChosenCareer(localStorage.getItem("vt_chosenCareer") || "");
    } catch { }

    const mm = (e: MouseEvent) => {
      const h = heroRef.current;
      if (!h) return;
      const r = h.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      h.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => {
        const d = parseFloat(el.getAttribute("data-depth") || "1") || 1;
        el.style.setProperty("--px", dx * d * -10 + "px");
        el.style.setProperty("--py", dy * d * -10 + "px");
      });
    };
    window.addEventListener("mousemove", mm);

    return () => {
      window.removeEventListener("mousemove", mm);
    };
  }, []);

  // Barra de progreso de scroll (solo en landing).
  useEffect(() => {
    const sc = () => {
      const p = progressRef.current;
      if (!p || screen !== "landing") return;
      const st = window.scrollY || document.documentElement.scrollTop;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      p.style.width = (max > 0 ? (st / max) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", sc, { passive: true });
    return () => window.removeEventListener("scroll", sc);
  }, [screen]);

  // --- Acciones ---
  const startTest = () => {
    setScreen("test"); setAnswers({}); setTestBlock(0); setCelebration(false); scrollTop();
  };
  const goLanding = () => { setScreen("landing"); scrollTop(); };
  const goStudentHome = () => { setScreen("studentHome"); scrollTop(); };

  // Sin sesión: al intentar abrir una card / video, pedir registro o login.
  const promptLogin = () => {
    setLoginHint(true);
    setTimeout(() => {
      const el = document.getElementById("vt-login");
      if (el) {
        const y = el.getBoundingClientRect().top + (window.scrollY || 0) - 90;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 30);
    setTimeout(() => setLoginHint(false), 2400);
  };

  const selectAnswer = (qi: number, oi: number) => {
    setAnswers((prev) => ({ ...prev, [qi]: oi }));
    setTimeout(() => {
      const sameBlock = Math.floor((qi + 1) / 5) === Math.floor(qi / 5);
      const target =
        sameBlock && qi + 1 < QUESTIONS.length
          ? document.getElementById("vt-q-" + (qi + 1))
          : document.getElementById("vt-continue");
      if (target) {
        const y = target.getBoundingClientRect().top + (window.scrollY || 0) - 100;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 240);
  };

  const submitTest = useCallback(() => {
    if (Object.keys(answers).length < QUESTIONS.length) return;
    setLoading(true);
    setTimeout(() => {
      const res = computeResult(answers);
      try {
        localStorage.setItem("vt_answers", JSON.stringify(answers));
        localStorage.setItem("vt_result", JSON.stringify(res));
      } catch { }
      setLoading(false);
      setResult(res);
      setScreen("results");
      scrollTop();
    }, 1700);
  }, [answers, scrollTop]);

  const continueBlock = () => {
    const start = testBlock * BLOCK;
    for (let i = start; i < start + BLOCK; i++) {
      if (answers[i] == null) return;
    }
    setCelebration(true);
    scrollTop();
  };

  const continueFromCeleb = () => {
    if (testBlock < 4) {
      setTestBlock((b) => b + 1);
      setCelebration(false);
      scrollTop();
    } else {
      setCelebration(false);
      submitTest();
    }
  };

  const onLoginEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginEmail(e.target.value); setLoginError("");
  };
  const onLoginPwd = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginPwd(e.target.value); setLoginError("");
  };

  const doLogin = () => {
    const email = (loginEmail || "").trim();
    const pwd = loginPwd || "";
    if (!email || !/.+@.+\..+/.test(email)) { setLoginError("Ingresa un correo válido."); return; }
    if (pwd.length < 4) { setLoginError("La contraseña debe tener al menos 4 caracteres."); return; }
    try {
      localStorage.setItem("vt_isLoggedIn", "true");
      localStorage.setItem("vt_userEmail", email);
    } catch { }
    // Tras iniciar sesión se queda en la pantalla de resultados, ya desbloqueada.
    setIsLoggedIn(true); setUserEmail(email);
    setLoginPwd(""); setLoginHint(false); scrollTop();
  };

  const logout = () => {
    try {
      localStorage.removeItem("vt_isLoggedIn");
      localStorage.removeItem("vt_userEmail");
      localStorage.removeItem("vt_result");
      localStorage.removeItem("vt_answers");
      localStorage.removeItem("vt_chosenCareer");
    } catch { }
    setIsLoggedIn(false); setUserEmail(""); setResult(null); setAnswers({});
    setScreen("landing"); setTestBlock(0); setCelebration(false);
    setChosenCareer(""); scrollTop();
  };

  // --- Login del docente (estático / demo) ---
  const doTeacherLogin = () => {
    const email = (teacherEmail || "").trim();
    const pwd = teacherPwd || "";
    if (!email || !/.+@.+\..+/.test(email)) { setTeacherError("Ingresa un correo válido."); return; }
    if (pwd.length < 4) { setTeacherError("La contraseña debe tener al menos 4 caracteres."); return; }
    const name = email.split("@")[0];
    setTeacherName(name.charAt(0).toUpperCase() + name.slice(1));
    setTeacherPwd(""); setTeacherError(""); setScreen("teacherDashboard"); scrollTop();
  };

  // --- El alumno confirma su carrera → se queda en la página, marca elegida ---
  const chooseCareer = (career: string) => {
    setChosenCareer(career);
    try { localStorage.setItem("vt_chosenCareer", career); } catch { }
    setModalCard(null);
  };

  const retake = () => {
    setAnswers({}); setScreen("test"); setTestBlock(0); setCelebration(false); scrollTop();
  };

  // --- Valores derivados (equivalente a renderVals) ---
  const total = QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const block = testBlock;
  const start = block * BLOCK;

  const blockQuestions = QUESTIONS.slice(start, start + BLOCK).map((q, li) => {
    const qi = start + li;
    return {
      domId: "vt-q-" + qi,
      num: qi + 1,
      title: q.title,
      delay: li * 0.06 + "s",
      options: q.options.map((opt, oi) => {
        const sel = answers[qi] === oi;
        return {
          text: opt.t,
          qi, oi,
          borderColor: sel ? "#FF395C" : "#E8EBF0",
          bg: sel ? "rgba(255,57,92,.06)" : "#fff",
          dotBorder: sel ? "#FF395C" : "#C7CDD6",
          dotBg: sel ? "#FF395C" : "#fff",
          dotScale: sel ? "1" : "0",
          textColor: sel ? "#161D1F" : "#4A4F55",
        };
      }),
    };
  });

  let blockAnswered = 0;
  for (let i = start; i < start + BLOCK; i++) if (answers[i] != null) blockAnswered++;
  const blockComplete = blockAnswered >= BLOCK;
  const blockDots = [0, 1, 2, 3, 4].map((i) => ({
    w: i === block ? "26px" : "8px",
    color: i < block ? "#3DDCDA" : i === block ? "#FF395C" : "#DDE1E6",
  }));

  const celeb = CELEBS[block] || CELEBS[0];
  const celebDots = [0, 1, 2, 3, 4].map((i) => ({
    w: i === block ? "30px" : "10px",
    color: i <= block ? "#fff" : "rgba(255,255,255,.35)",
  }));

  const r = result || { topName: "", topCat: "", topShort: "", topDesc: "", topPct: 0, shown: [] };
  const topPctDeg = (r.topPct ?? 0) * 3.6 + "deg";
  const shown = r.shown || [];
  const palette = ["#FF395C", "#0661FC", "#0a8f8c", "#5b6470", "#5b6470"];
  const softBg = ["rgba(255,57,92,.12)", "rgba(6,97,252,.12)", "rgba(10,143,140,.14)", "#EEF1F5", "#EEF1F5"];
  const ranking = shown.map((item, i) => {
    const sel = i < 3;
    const color = palette[i] || "#5b6470";
    return {
      rank: String(i + 1),
      name: item.name, cat: item.cat, desc: item.desc, pct: item.pct,
      color,
      cardBorder: color,
      barBg: i === 0 ? "linear-gradient(90deg,#FF395C,#F94C61)" : color,
      barW: item.pct + "%",
      deg: item.pct * 3.6 + "deg",
      delay: i * 0.07 + "s",
      badgeBg: softBg[i] || "#EEF1F5",
      badgeColor: sel ? color : "#848D95",
      selected: sel,
      selTag: sel ? "Seleccionada" : "Compatible",
      selTagColor: sel ? color : "#848D95",
      selTagBg: sel ? softBg[i] || "#EEF1F5" : "#EEF1F5",
      rowOpacity: sel ? "1" : ".72",
    };
  });
  const resultSelected = ranking.slice(0, 3);
  const resultAlso = ranking.slice(3, 5);

  const userName = (userEmail || "").split("@")[0] || "estudiante";

  const isLanding = screen === "landing";
  const isTest = screen === "test";
  const isResults = screen === "results";
  const isTeacherLogin = screen === "teacherLogin";
  const isTeacherDashboard = screen === "teacherDashboard";
  const isStudentHome = screen === "studentHome";
  const needsLogin = isResults && !isLoggedIn;
  const alreadyLogged = isResults && isLoggedIn;

  return (
    <div
      style={css(
        "position: relative; min-height: 100vh; background-color: #F2F4F8; background-image: linear-gradient(rgba(0,15,55,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,15,55,.035) 1px, transparent 1px); background-size: 30px 30px; overflow-x: hidden;"
      )}
    >
      {/* Barra de progreso de scroll */}
      <div style={css("position: fixed; top: 0; left: 0; right: 0; height: 4px; z-index: 200; background: transparent; pointer-events: none;")}>
        <div
          ref={progressRef}
          style={css("height: 100%; width: 0%; background: linear-gradient(90deg, #FF395C, #F94C61 55%, #0661FC); box-shadow: 0 0 14px rgba(255,57,92,.5); transition: width .08s linear;")}
        />
      </div>

      {/* ============================== LANDING ============================== */}
      {isLanding && (
        <div data-screen-label="Landing" style={css("animation: vtFadeIn .5s ease both;")}>
          <nav style={css("position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 18px 48px; backdrop-filter: blur(14px); background: rgba(242,244,248,.72); border-bottom: 1px solid rgba(0,15,55,.06); animation: vtFadeDown .6s ease both;")}>
            <div style={css("display: flex; align-items: center; gap: 11px; font-weight: 900; font-size: 23px; letter-spacing: -.02em;")}>
              <span style={css("display: grid; place-items: center; width: 34px; height: 34px; border-radius: 11px; background: #000F37; color: #fff; font-size: 17px; box-shadow: 0 6px 16px rgba(0,15,55,.28); transform: rotate(-6deg);")}>V</span>
              <span style={css("color: #000000;")}>Voca<span style={css("color: #FF395C;")}>Twin</span></span>
            </div>
            <div style={css("display: flex; align-items: center; gap: 30px;")}>
              <Fx as="a" base="font-size: 15px; font-weight: 700; color: #4A4F55; cursor: pointer; text-decoration: none;" hover="color: #161D1F;">El test</Fx>
              <Fx as="a" base="font-size: 15px; font-weight: 700; color: #4A4F55; cursor: pointer; text-decoration: none;" hover="color: #161D1F;">¿Por qué?</Fx>
              <Fx as="button" onClick={() => { setScreen("teacherLogin"); setTeacherError(""); scrollTop(); }} base="display: inline-flex; align-items: center; gap: 7px; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; padding: 11px 18px; border-radius: 11px; border: 1.5px solid #DDE1E6; background: #fff; color: #161D1F; white-space: nowrap; transition: all .18s ease;" hover="border-color: #000F37; color: #000F37; transform: translateY(-1px);">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 1 4 3 6 3s6-2 6-3v-5" /></svg>
                Docentes
              </Fx>
              {isLoggedIn && (
                <Fx as="button" onClick={goStudentHome} base="font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; padding: 11px 20px; border-radius: 11px; border: 1.5px solid #DDE1E6; background: #fff; color: #161D1F; white-space: nowrap; transition: all .18s ease;" hover="border-color: #0661FC; color: #0661FC; transform: translateY(-1px);">Mi dashboard</Fx>
              )}
              <Fx as="button" onClick={startTest} base="position: relative; overflow: hidden; font-family: inherit; font-size: 14px; font-weight: 800; cursor: pointer; padding: 12px 22px; border-radius: 11px; border: none; background: #FF395C; color: #fff; box-shadow: 0 8px 20px rgba(255,57,92,.32); white-space: nowrap; transition: transform .16s ease, box-shadow .16s ease;" hover="transform: translateY(-2px); box-shadow: 0 12px 26px rgba(255,57,92,.42);" active="transform: translateY(0) scale(.97);">Hacer el test</Fx>
            </div>
          </nav>

          <section style={css("position: relative; display: grid; grid-template-columns: 1.05fr .95fr; gap: 40px; align-items: center; max-width: 1280px; margin: 0 auto; padding: 64px 48px 90px;")}>
            <div style={css("position: relative; z-index: 2;")}>
              <div style={css("display: inline-flex; align-items: center; gap: 9px; padding: 8px 15px; border-radius: 99px; background: rgba(61,220,218,.16); border: 1px solid rgba(61,220,218,.4); color: #0a8f8c; font-size: 13px; font-weight: 800; letter-spacing: .02em; margin-bottom: 26px; animation: vtFadeUp .6s ease both; animation-delay: .05s;")}>
                <span style={css("width: 7px; height: 7px; border-radius: 99px; background: #3DDCDA; animation: vtPulseRing 2s infinite;")} />
                TEST VOCACIONAL · GRATIS · 5 MINUTOS
              </div>
              <h1 style={css("margin: 0; font-size: clamp(46px, 6vw, 78px); line-height: .96; font-weight: 900; letter-spacing: -.035em; color: #000000; animation: vtFadeUp .7s cubic-bezier(.16,1,.3,1) both; animation-delay: .12s;")}>
                Descubre la<br />carrera que <span style={css("color: #FF395C;")}>eres</span>.
              </h1>
              <p style={css("margin: 26px 0 0; max-width: 470px; font-size: 19px; line-height: 1.55; color: #4A4F55; animation: vtFadeUp .7s ease both; animation-delay: .22s;")}>
                Responde 25 preguntas en 5 rondas y recibe tus carreras recomendadas entre más de 40 opciones que pueden marcar tu futuro.
              </p>
              <div style={css("display: flex; align-items: center; gap: 16px; margin-top: 38px; animation: vtFadeUp .7s ease both; animation-delay: .32s;")}>
                <Fx as="button" onClick={startTest} base="position: relative; overflow: hidden; font-family: inherit; font-size: 17px; font-weight: 800; cursor: pointer; padding: 18px 30px; border-radius: 15px; border: none; background: #FF395C; color: #fff; box-shadow: 0 14px 34px rgba(255,57,92,.36); transition: transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s ease;" hover="transform: translateY(-3px); box-shadow: 0 20px 44px rgba(255,57,92,.46);" active="transform: translateY(-1px) scale(.98);">
                  Realiza tu test y prepárate para tu futuro →
                </Fx>
              </div>
              <div style={css("display: flex; align-items: center; gap: 14px; margin-top: 30px; animation: vtFadeUp .7s ease both; animation-delay: .42s;")}>
                <div style={css("display: flex;")}>
                  <span style={css("width: 34px; height: 34px; border-radius: 99px; border: 2.5px solid #F2F4F8; background: #0661FC;")} />
                  <span style={css("width: 34px; height: 34px; border-radius: 99px; border: 2.5px solid #F2F4F8; background: #3DDCDA; margin-left: -12px;")} />
                  <span style={css("width: 34px; height: 34px; border-radius: 99px; border: 2.5px solid #F2F4F8; background: #F94C61; margin-left: -12px;")} />
                  <span style={css("width: 34px; height: 34px; border-radius: 99px; border: 2.5px solid #F2F4F8; background: #000F37; margin-left: -12px;")} />
                </div>
                <span style={css("font-size: 14px; font-weight: 700; color: #4A4F55;")}><b style={css("color: #161D1F;")}>+12 000</b> estudiantes ya descubrieron su rumbo</span>
              </div>
            </div>

            <div ref={heroRef} style={css("position: relative; height: 540px; perspective: 1400px;")}>
              <div data-depth="0.6" style={css("position: absolute; top: 12%; left: 16%; width: 70%; height: 70%; border-radius: 50%; background: radial-gradient(circle, rgba(255,57,92,.22), transparent 65%); filter: blur(20px); transform: translate3d(var(--px,0px), var(--py,0px), 0); transition: transform .25s ease-out;")} />
              <div data-depth="1.4" style={css("position: absolute; top: 70px; right: 18px; width: 300px; height: 220px; transform: translate3d(var(--px,0px), var(--py,0px), 0); transition: transform .25s ease-out;")}>
                <div style={css("width: 100%; height: 100%; border-radius: 24px; background: rgba(0,15,55,.82); backdrop-filter: blur(8px); box-shadow: 0 30px 60px rgba(0,15,55,.28); animation: vtFloatB 7s ease-in-out infinite; overflow: hidden; border: 1px solid rgba(255,255,255,.08);")}>
                  <svg viewBox="0 0 300 140" style={css("position: absolute; bottom: 0; left: 0; width: 100%; height: 70%;")}>
                    <defs><linearGradient id="vtChart" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF395C" stopOpacity=".5" /><stop offset="1" stopColor="#FF395C" stopOpacity="0" /></linearGradient></defs>
                    <path d="M0 96 C40 96 50 50 92 54 C140 58 150 22 198 30 C246 38 262 64 300 58 L300 140 L0 140 Z" fill="url(#vtChart)" />
                    <path d="M0 96 C40 96 50 50 92 54 C140 58 150 22 198 30 C246 38 262 64 300 58" fill="none" stroke="#FF7E96" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="600" strokeDashoffset="600" style={css("animation: vtDash 2.2s ease-out .5s forwards;")} />
                    <circle cx="300" cy="58" r="5" fill="#fff" />
                  </svg>
                  <div style={css("position: absolute; top: 16px; left: 18px; font-size: 12px; font-weight: 800; color: rgba(255,255,255,.6); letter-spacing: .08em;")}>AFINIDAD</div>
                </div>
              </div>
              <div data-depth="2.6" style={css("position: absolute; top: 14px; left: 0; width: 250px; transform: translate3d(var(--px,0px), var(--py,0px), 0); transition: transform .25s ease-out;")}>
                <div style={css("border-radius: 26px; background: rgba(255,255,255,.66); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,.9); box-shadow: 0 34px 70px rgba(0,15,55,.18); padding: 22px; animation: vtFloat 6s ease-in-out infinite;")}>
                  <div style={css("display: grid; place-items: center; width: 78px; height: 78px; border-radius: 22px; background: linear-gradient(150deg, #000F37, #1a2a5e); box-shadow: 0 14px 30px rgba(0,15,55,.4); margin-bottom: 18px;")}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M7 5v14l12-7z" /></svg>
                  </div>
                  <div style={css("height: 9px; width: 80%; border-radius: 99px; background: #E1E5EC; margin-bottom: 9px;")} />
                  <div style={css("height: 9px; width: 55%; border-radius: 99px; background: #E1E5EC; margin-bottom: 18px;")} />
                  <div style={css("display: flex; gap: 7px;")}>
                    <span style={css("width: 9px; height: 9px; border-radius: 99px; background: #FF395C;")} />
                    <span style={css("width: 9px; height: 9px; border-radius: 99px; background: #DDE1E6;")} />
                    <span style={css("width: 9px; height: 9px; border-radius: 99px; background: #DDE1E6;")} />
                  </div>
                </div>
              </div>
              <div data-depth="3.4" style={css("position: absolute; bottom: 96px; left: 40px; width: 320px; transform: translate3d(var(--px,0px), var(--py,0px), 0); transition: transform .25s ease-out;")}>
                <div style={css("display: flex; align-items: center; gap: 14px; border-radius: 18px; background: rgba(255,255,255,.78); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,.9); box-shadow: 0 22px 48px rgba(0,15,55,.16); padding: 16px 20px; animation: vtFloatC 5.5s ease-in-out infinite;")}>
                  <div style={css("position: relative; flex: 1; height: 8px; border-radius: 99px; background: #E1E5EC;")}>
                    <div style={css("position: absolute; inset: 0 28% 0 0; border-radius: 99px; background: linear-gradient(90deg, #FF395C, #F94C61);")} />
                    <div style={css("position: absolute; top: 50%; left: 72%; transform: translate(-50%,-50%); width: 24px; height: 24px; border-radius: 99px; background: #fff; box-shadow: 0 4px 12px rgba(255,57,92,.5); border: 3px solid #FF395C;")} />
                  </div>
                  <span style={css("font-size: 22px; font-weight: 900; color: #161D1F; letter-spacing: -.02em;")}>72%</span>
                </div>
              </div>
              <div data-depth="4.6" style={css("position: absolute; bottom: 56px; right: 70px; transform: translate3d(var(--px,0px), var(--py,0px), 0); transition: transform .25s ease-out;")}>
                <div style={css("display: grid; place-items: center; width: 70px; height: 70px; border-radius: 99px; background: linear-gradient(150deg, #F94C61, #FF395C); box-shadow: 0 18px 36px rgba(249,76,97,.5); animation: vtBob 3s ease-in-out infinite;")}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M4 2l16 9-6.5 1.5L11 20z" /></svg>
                </div>
              </div>
              <span data-depth="5" style={css("position: absolute; top: 40px; right: 120px; width: 12px; height: 12px; border-radius: 99px; background: #3DDCDA; transform: translate3d(var(--px,0px), var(--py,0px), 0); transition: transform .25s ease-out; box-shadow: 0 4px 10px rgba(61,220,218,.6);")} />
              <span data-depth="3.8" style={css("position: absolute; bottom: 180px; right: 8px; width: 9px; height: 9px; border-radius: 99px; background: #0661FC; transform: translate3d(var(--px,0px), var(--py,0px), 0); transition: transform .25s ease-out;")} />
              <span data-depth="6" style={css("position: absolute; top: 200px; left: 8px; width: 14px; height: 14px; border-radius: 99px; background: #FF395C; transform: translate3d(var(--px,0px), var(--py,0px), 0); transition: transform .25s ease-out;")} />
            </div>
          </section>

          <section style={css("max-width: 1280px; margin: 0 auto; padding: 30px 48px 40px;")}>
            <div style={css("display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 40px; animation: vtFadeUp .8s ease both;")}>
              <div>
                <span style={css("font-size: 14px; font-weight: 800; color: #FF395C; letter-spacing: .08em;")}>¿POR QUÉ HACER EL TEST?</span>
                <h2 style={css("margin: 12px 0 0; font-size: clamp(34px, 4vw, 50px); font-weight: 900; letter-spacing: -.03em; color: #000F37; line-height: 1.02;")}>Decidir tu futuro<br />no debería ser al azar.</h2>
              </div>
              <p style={css("max-width: 360px; font-size: 16px; line-height: 1.6; color: #4A4F55; margin: 0;")}>Un diagnóstico claro, visual y guardado para que avances con seguridad sobre la carrera ideal para ti.</p>
            </div>
            <div style={css("display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px;")}>
              <Fx base="background: #fff; border: 1px solid #DDE1E6; border-radius: 22px; padding: 30px; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .7s ease both; animation-delay: .05s; transition: transform .22s ease, box-shadow .22s ease;" hover="transform: translateY(-6px); box-shadow: 0 24px 44px rgba(0,15,55,.1);">
                <div style={css("display: grid; place-items: center; width: 54px; height: 54px; border-radius: 15px; background: rgba(255,57,92,.12); margin-bottom: 22px;")}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF395C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" /><circle cx="12" cy="12" r="3.2" /></svg>
                </div>
                <h3 style={css("margin: 0 0 8px; font-size: 21px; font-weight: 900; color: #161D1F;")}>Resultado personalizado</h3>
                <p style={css("margin: 0; font-size: 15px; line-height: 1.55; color: #4A4F55;")}>Tus respuestas se traducen en tus 3 mejores carreras con porcentaje de afinidad real.</p>
              </Fx>
              <Fx base="background: #fff; border: 1px solid #DDE1E6; border-radius: 22px; padding: 30px; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .7s ease both; animation-delay: .13s; transition: transform .22s ease, box-shadow .22s ease;" hover="transform: translateY(-6px); box-shadow: 0 24px 44px rgba(0,15,55,.1);">
                <div style={css("display: grid; place-items: center; width: 54px; height: 54px; border-radius: 15px; background: rgba(6,97,252,.12); margin-bottom: 22px;")}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0661FC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7z" /></svg>
                </div>
                <h3 style={css("margin: 0 0 8px; font-size: 21px; font-weight: 900; color: #161D1F;")}>Con Cat Jard a tu lado</h3>
                <p style={css("margin: 0; font-size: 15px; line-height: 1.55; color: #4A4F55;")}>25 preguntas en 5 rondas, y Cat Jard celebra contigo entre cada una para que no decaigas.</p>
              </Fx>
              <Fx base="background: #fff; border: 1px solid #DDE1E6; border-radius: 22px; padding: 30px; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .7s ease both; animation-delay: .21s; transition: transform .22s ease, box-shadow .22s ease;" hover="transform: translateY(-6px); box-shadow: 0 24px 44px rgba(0,15,55,.1);">
                <div style={css("display: grid; place-items: center; width: 54px; height: 54px; border-radius: 15px; background: rgba(61,220,218,.18); margin-bottom: 22px;")}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0a8f8c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <h3 style={css("margin: 0 0 8px; font-size: 21px; font-weight: 900; color: #161D1F;")}>Guardado en tu cuenta</h3>
                <p style={css("margin: 0; font-size: 15px; line-height: 1.55; color: #4A4F55;")}>Inicia sesión y revisa tu resultado cuando quieras desde tu dashboard personal.</p>
              </Fx>
            </div>
          </section>

          <section style={css("max-width: 1280px; margin: 0 auto; padding: 60px 48px 70px;")}>
            <div style={css("background: #000F37; border-radius: 30px; padding: 56px; position: relative; overflow: hidden; animation: vtFadeUp .8s ease both;")}>
              <div style={css("position: absolute; top: -60px; right: -40px; width: 280px; height: 280px; border-radius: 50%; background: radial-gradient(circle, rgba(255,57,92,.34), transparent 70%);")} />
              <div style={css("position: absolute; bottom: -80px; left: 30%; width: 240px; height: 240px; border-radius: 50%; background: radial-gradient(circle, rgba(61,220,218,.22), transparent 70%);")} />
              <span style={css("position: relative; font-size: 14px; font-weight: 800; color: #3DDCDA; letter-spacing: .08em;")}>CÓMO FUNCIONA</span>
              <h2 style={css("position: relative; margin: 12px 0 44px; font-size: clamp(30px, 3.4vw, 44px); font-weight: 900; letter-spacing: -.03em; color: #fff;")}>Tres pasos hacia tu decisión</h2>
              <div style={css("position: relative; display: grid; grid-template-columns: repeat(3, 1fr); gap: 34px;")}>
                <div>
                  <div style={css("font-size: 15px; font-weight: 900; color: #FF395C; margin-bottom: 14px;")}>01</div>
                  <h3 style={css("margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #fff;")}>Responde el test</h3>
                  <p style={css("margin: 0; font-size: 15px; line-height: 1.6; color: rgba(255,255,255,.62);")}>25 preguntas en 5 rondas sobre cómo piensas, qué disfrutas y cómo trabajas.</p>
                </div>
                <div>
                  <div style={css("font-size: 15px; font-weight: 900; color: #3DDCDA; margin-bottom: 14px;")}>02</div>
                  <h3 style={css("margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #fff;")}>Recibe tus carreras</h3>
                  <p style={css("margin: 0; font-size: 15px; line-height: 1.6; color: rgba(255,255,255,.62);")}>Calculamos tu afinidad con más de 40 carreras y te mostramos tus 3 mejores.</p>
                </div>
                <div>
                  <div style={css("font-size: 15px; font-weight: 900; color: #0661FC; margin-bottom: 14px;")}>03</div>
                  <h3 style={css("margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #fff;")}>Dialoga con Cat Jard</h3>
                  <p style={css("margin: 0; font-size: 15px; line-height: 1.6; color: rgba(255,255,255,.62);")}>Crea tu cuenta y revisa tu dashboard con Cat Jard agente chatbot completo.</p>
                </div>
              </div>
              <Fx as="button" onClick={startTest} base="position: relative; margin-top: 44px; font-family: inherit; font-size: 16px; font-weight: 800; cursor: pointer; padding: 16px 28px; border-radius: 14px; border: none; background: #FF395C; color: #fff; box-shadow: 0 14px 30px rgba(255,57,92,.4); transition: transform .18s cubic-bezier(.34,1.56,.64,1);" hover="transform: translateY(-3px);" active="transform: scale(.97);">Empezar ahora →</Fx>
            </div>
          </section>

          <footer style={css("border-top: 1px solid #DDE1E6; padding: 40px 48px; max-width: 1280px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;")}>
            <div style={css("display: flex; align-items: center; gap: 10px; font-weight: 900; font-size: 19px;")}>
              <span style={css("display: grid; place-items: center; width: 28px; height: 28px; border-radius: 9px; background: #000F37; color: #fff; font-size: 14px; transform: rotate(-6deg);")}>V</span>
              Voca<span style={css("color: #FF395C; margin-left: -5px;")}>Twin</span>
            </div>
            <span style={css("font-size: 14px; color: #848D95;")}>© 2026 Voca Twin · Orientación vocacional</span>
          </footer>
        </div>
      )}

      {/* ============================== TEST ============================== */}
      {isTest && (
        <div data-screen-label="Test" style={css("animation: vtFadeIn .45s ease both; padding-bottom: 90px;")}>
          <div style={css("position: sticky; top: 0; z-index: 100; backdrop-filter: blur(14px); background: rgba(242,244,248,.86); border-bottom: 1px solid rgba(0,15,55,.06);")}>
            <div style={css("max-width: 820px; margin: 0 auto; padding: 18px 32px;")}>
              <div style={css("display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;")}>
                <Fx as="button" onClick={goLanding} base="display: inline-flex; align-items: center; gap: 7px; font-family: inherit; font-size: 14px; font-weight: 700; color: #4A4F55; background: none; border: none; cursor: pointer; padding: 0; transition: color .16s;" hover="color: #FF395C;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  Salir
                </Fx>
                <span style={css("font-size: 14px; font-weight: 800; color: #161D1F;")}>{answeredCount} / {total} respondidas</span>
              </div>
              <div style={css("height: 8px; border-radius: 99px; background: #E1E5EC; overflow: hidden;")}>
                <div style={{ ...css("height: 100%; border-radius: 99px; background: linear-gradient(90deg, #FF395C, #F94C61); box-shadow: 0 0 12px rgba(255,57,92,.5); transition: width .5s cubic-bezier(.16,1,.3,1);"), width: Math.round((answeredCount / total) * 100) + "%" }} />
              </div>
            </div>
          </div>

          <div style={css("max-width: 820px; margin: 0 auto; padding: 44px 32px 0;")}>
            <div style={css("margin-bottom: 36px; animation: vtFadeUp .6s ease both;")}>
              <div style={css("display: flex; align-items: center; gap: 12px; margin-bottom: 14px;")}>
                <span style={css("font-size: 14px; font-weight: 800; color: #FF395C; letter-spacing: .06em;")}>Ronda {block + 1} de 5</span>
                <div style={css("display: flex; gap: 6px;")}>
                  {blockDots.map((d, i) => (
                    <span key={i} style={{ ...css("height: 8px; border-radius: 99px; transition: all .35s cubic-bezier(.16,1,.3,1);"), width: d.w, background: d.color }} />
                  ))}
                </div>
              </div>
              <h1 style={css("margin: 0; font-size: clamp(28px, 4vw, 40px); font-weight: 900; letter-spacing: -.03em; color: #000F37;")}>{blockTitles[block]}</h1>
            </div>

            {blockQuestions.map((q) => (
              <div key={q.domId} id={q.domId} style={{ ...css("background: #fff; border: 1px solid #DDE1E6; border-radius: 24px; padding: 32px; margin-bottom: 22px; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .6s cubic-bezier(.16,1,.3,1) both;"), animationDelay: q.delay }}>
                <div style={css("display: flex; align-items: center; gap: 12px; margin-bottom: 22px;")}>
                  <span style={css("display: grid; place-items: center; min-width: 34px; height: 34px; border-radius: 10px; background: #000F37; color: #fff; font-size: 15px; font-weight: 900;")}>{q.num}</span>
                  <h2 style={css("margin: 0; font-size: 21px; font-weight: 800; letter-spacing: -.02em; color: #161D1F; line-height: 1.25;")}>{q.title}</h2>
                </div>
                <div style={css("display: grid; gap: 10px;")}>
                  {q.options.map((opt, oi) => (
                    <Fx
                      as="button"
                      key={oi}
                      onClick={() => selectAnswer(opt.qi, opt.oi)}
                      base={`display: flex; align-items: center; gap: 14px; width: 100%; text-align: left; font-family: inherit; cursor: pointer; padding: 14px 17px; border-radius: 13px; border: 2px solid ${opt.borderColor}; background: ${opt.bg}; transition: border-color .18s ease, background .18s ease, transform .12s ease;`}
                      hover="border-color: #FF395C; transform: translateX(3px);"
                      active="transform: scale(.99);"
                    >
                      <span style={{ ...css("display: grid; place-items: center; min-width: 23px; height: 23px; border-radius: 99px; transition: all .18s ease;"), border: `2px solid ${opt.dotBorder}`, background: opt.dotBg }}>
                        <span style={{ ...css("width: 8px; height: 8px; border-radius: 99px; background: #fff; transition: transform .2s cubic-bezier(.34,1.56,.64,1);"), transform: `scale(${opt.dotScale})` }} />
                      </span>
                      <span style={{ ...css("font-size: 15px; font-weight: 700; line-height: 1.35;"), color: opt.textColor }}>{opt.text}</span>
                    </Fx>
                  ))}
                </div>
              </div>
            ))}

            <div id="vt-continue" style={css("display: flex; flex-direction: column; align-items: center; gap: 14px; margin-top: 34px; scroll-margin-top: 110px;")}>
              <Fx
                as="button"
                onClick={continueBlock}
                disabled={!blockComplete}
                base={`position: relative; overflow: hidden; font-family: inherit; font-size: 18px; font-weight: 800; cursor: ${blockComplete ? "pointer" : "not-allowed"}; padding: 18px 44px; border-radius: 16px; border: none; background: ${blockComplete ? (block < 4 ? "#FF395C" : "#0a8f8c") : "#C7CDD6"}; color: #fff; box-shadow: ${blockComplete ? (block < 4 ? "0 14px 34px rgba(255,57,92,.36)" : "0 14px 34px rgba(10,143,140,.34)") : "none"}; opacity: ${blockComplete ? "1" : ".7"}; transition: transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s ease, opacity .25s ease;`}
                hover="transform: translateY(-2px);"
                active="transform: scale(.98);"
              >
                {block < 4 ? "Continuar →" : "Finalizar test →"}
              </Fx>
              <span style={css("font-size: 14px; color: #848D95; font-weight: 600;")}>
                {blockComplete
                  ? block < 4
                    ? "¡Bien! catjard te espera al continuar."
                    : "¡Listo! Calcularemos tus carreras ideales."
                  : "Responde las 5 preguntas de esta ronda (" + blockAnswered + "/5)."}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================== CELEBRACIÓN (catjard) ============================== */}
      {celebration && (
        <div data-screen-label="Celebración" style={{ ...css("position: fixed; inset: 0; z-index: 320; display: grid; place-items: center; overflow: hidden; animation: vtFadeIn .35s ease both;"), background: celebBgs[celeb.theme] }}>
          <div style={css("position: absolute; inset: 0; pointer-events: none;")}>
            {parts[celeb.theme].map((p, i) => (
              <span key={i} style={{ position: "absolute", left: p.left, top: p.top, width: p.w, height: p.h, borderRadius: p.r, background: p.color, boxShadow: p.glow, opacity: 0, animation: `${p.anim} ${p.dur} linear ${p.delay} infinite` }} />
            ))}
          </div>
          <div style={css("position: absolute; inset: 0; background: radial-gradient(circle at 50% 42%, transparent 30%, rgba(0,0,0,.35) 100%); pointer-events: none;")} />

          <div style={css("position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 24px;")}>
            <div style={css("position: relative; width: 240px; height: 230px; display: flex; align-items: flex-end; justify-content: center;")}>
              <div style={{ ...css("position: absolute; top: 42%; left: 50%; width: 230px; height: 230px; border-radius: 50%; filter: blur(10px); animation: vtGlowPulse 1.6s ease-in-out infinite;"), background: `radial-gradient(circle, ${celebGlows[celeb.theme]}, transparent 68%)` }} />
              <div data-mascot="catjard" style={css("position: relative; width: 188px; height: 188px; animation: vtHop 1.25s cubic-bezier(.3,.7,.4,1) infinite;")}>
                <div style={css("width: 100%; height: 100%; border-radius: 50%; overflow: hidden; border: 5px solid rgba(255,255,255,.92); box-shadow: 0 18px 40px rgba(0,0,0,.4); background: #2a2018;")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/catjard.jpg" alt="catjard" style={css("width: 150%; height: 150%; object-fit: cover; object-position: 50% 40%; margin: -22% 0 0 -25%; display: block;")} />
                </div>
              </div>
              <div style={css("position: absolute; bottom: -4px; left: 50%; width: 130px; height: 18px; border-radius: 50%; background: rgba(0,0,0,.4); filter: blur(7px); animation: vtShadowP 1.25s cubic-bezier(.3,.7,.4,1) infinite;")} />
            </div>

            <h1 style={css("margin: 30px 0 0; font-size: clamp(48px, 8vw, 84px); font-weight: 900; letter-spacing: -.04em; color: #fff; text-shadow: 0 6px 24px rgba(0,0,0,.35); animation: vtPopBig .6s cubic-bezier(.34,1.56,.64,1) both;")}>
              <span style={css("display: inline-block; animation: vtWiggle 1.6s ease-in-out infinite;")}>{celeb.msg}</span>
            </h1>
            <p style={css("margin: 14px 0 0; font-size: 18px; font-weight: 700; color: rgba(255,255,255,.92); max-width: 460px; animation: vtFadeUp .6s ease both; animation-delay: .2s;")}>{celeb.sub}</p>

            <div style={css("display: flex; gap: 9px; margin-top: 26px; animation: vtFadeUp .6s ease both; animation-delay: .3s;")}>
              {celebDots.map((d, i) => (
                <span key={i} style={{ ...css("height: 10px; border-radius: 99px; transition: all .35s ease;"), width: d.w, background: d.color }} />
              ))}
            </div>

            <Fx as="button" onClick={continueFromCeleb} base={`margin-top: 34px; font-family: inherit; font-size: 17px; font-weight: 800; cursor: pointer; padding: 17px 40px; border-radius: 15px; border: none; background: #fff; color: ${celebCtaColors[celeb.theme]}; box-shadow: 0 14px 34px rgba(0,0,0,.28); animation: vtPop .5s cubic-bezier(.34,1.56,.64,1) both; animation-delay: .35s; transition: transform .18s cubic-bezier(.34,1.56,.64,1);`} hover="transform: translateY(-3px) scale(1.03);" active="transform: scale(.97);">{celeb.cta}</Fx>
          </div>
        </div>
      )}

      {/* ============================== LOADING ============================== */}
      {loading && (
        <div data-screen-label="Procesando" style={css("position: fixed; inset: 0; z-index: 300; display: grid; place-items: center; background: rgba(242,244,248,.95); backdrop-filter: blur(6px); animation: vtFadeIn .3s ease both;")}>
          <div style={css("width: 420px; max-width: 88vw; text-align: center;")}>
            <div style={css("position: relative; width: 76px; height: 76px; margin: 0 auto 26px;")}>
              <div style={css("position: absolute; inset: 0; border-radius: 99px; border: 5px solid #E1E5EC;")} />
              <div style={css("position: absolute; inset: 0; border-radius: 99px; border: 5px solid transparent; border-top-color: #FF395C; border-right-color: #F94C61; animation: vtSpin .8s linear infinite;")} />
            </div>
            <h2 style={css("margin: 0 0 8px; font-size: 26px; font-weight: 900; color: #000F37; letter-spacing: -.02em;")}>Procesando tus datos…</h2>
            <p style={css("margin: 0 0 28px; font-size: 15px; color: #4A4F55;")}>Calculando tu afinidad con más de 40 carreras.</p>
            <div style={css("display: grid; gap: 12px; text-align: left;")}>
              <div style={css("height: 16px; width: 70%; border-radius: 99px; background: linear-gradient(90deg, #E8EBF0 25%, #f4f6f9 50%, #E8EBF0 75%); background-size: 560px 100%; animation: vtShimmer 1.3s infinite linear;")} />
              <div style={css("height: 16px; width: 90%; border-radius: 99px; background: linear-gradient(90deg, #E8EBF0 25%, #f4f6f9 50%, #E8EBF0 75%); background-size: 560px 100%; animation: vtShimmer 1.3s infinite linear .15s;")} />
              <div style={css("height: 16px; width: 50%; border-radius: 99px; background: linear-gradient(90deg, #E8EBF0 25%, #f4f6f9 50%, #E8EBF0 75%); background-size: 560px 100%; animation: vtShimmer 1.3s infinite linear .3s;")} />
            </div>
          </div>
        </div>
      )}

      {/* ============================== RESULTS + LOGIN ============================== */}
      {isResults && (
        <div data-screen-label="Resultados" style={css("animation: vtFadeIn .45s ease both; padding: 40px 32px 90px;")}>
          <div style={css("max-width: 980px; margin: 0 auto;")}>
            <div style={css("text-align: center; margin-bottom: 34px; animation: vtFadeUp .6s ease both;")}>
              <span style={css("display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 99px; background: rgba(61,220,218,.16); border: 1px solid rgba(61,220,218,.4); color: #0a8f8c; font-size: 13px; font-weight: 800; letter-spacing: .04em;")}>✦ TEST COMPLETADO</span>
              <h1 style={css("margin: 18px 0 8px; font-size: clamp(30px, 4vw, 46px); font-weight: 900; letter-spacing: -.03em; color: #000F37;")}>Tu carrera ideal</h1>
              <p style={css("margin: 0; font-size: 16px; color: #4A4F55;")}>Analizamos tus 25 respuestas. Estas son tus mejores coincidencias.</p>
            </div>

            <div style={css("position: relative; overflow: hidden; background: #000F37; border-radius: 28px; padding: 44px; color: #fff; box-shadow: 0 30px 70px rgba(0,15,55,.3); animation: vtPop .7s cubic-bezier(.16,1,.3,1) both;")}>
              <div style={css("position: absolute; top: -70px; right: -50px; width: 320px; height: 320px; border-radius: 50%; background: radial-gradient(circle, rgba(255,57,92,.4), transparent 68%);")} />
              <div style={css("position: relative; display: grid; grid-template-columns: 1fr auto; gap: 30px; align-items: center;")}>
                <div>
                  <div style={css("display: flex; align-items: center; gap: 10px; margin-bottom: 14px;")}>
                    <span style={css("display: inline-flex; padding: 6px 13px; border-radius: 99px; background: #FF395C; color: #fff; font-size: 12px; font-weight: 900; letter-spacing: .04em;")}>TU #1</span>
                    <span style={css("display: inline-flex; padding: 6px 13px; border-radius: 99px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.16); color: rgba(255,255,255,.85); font-size: 12px; font-weight: 800;")}>{r.topCat}</span>
                  </div>
                  <h2 style={css("margin: 0 0 14px; font-size: clamp(26px, 3.4vw, 40px); font-weight: 900; letter-spacing: -.025em; line-height: 1.05;")}>{r.topName}</h2>
                  <p style={css("margin: 0; max-width: 480px; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,.72);")}>{r.topDesc}</p>
                </div>
                <div style={{ ...css("display: grid; place-items: center; width: 150px; height: 150px; border-radius: 50%; position: relative;"), background: `conic-gradient(#FF395C ${topPctDeg}, rgba(255,255,255,.12) 0)` }}>
                  <div style={css("position: absolute; inset: 12px; border-radius: 50%; background: #000F37; display: grid; place-items: center;")}>
                    <div style={css("text-align: center;")}>
                      <div style={css("font-size: 38px; font-weight: 900; line-height: 1; letter-spacing: -.03em;")}>{r.topPct}<span style={css("font-size: 20px;")}>%</span></div>
                      <div style={css("font-size: 11px; color: rgba(255,255,255,.55); font-weight: 700; letter-spacing: .05em;")}>AFINIDAD</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={css("display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin: 36px 0 18px; animation: vtFadeUp .6s ease both; animation-delay: .1s;")}>
              <h3 style={css("margin: 0; font-size: 22px; font-weight: 900; color: #000F37; letter-spacing: -.02em;")}>Tus 3 carreras seleccionadas</h3>
              <span style={css("font-size: 14px; font-weight: 700; color: #848D95;")}>Las que más encajan contigo</span>
            </div>
            <div style={css("display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px;")}>
              {resultSelected.map((a, i) => (
                <Fx
                  key={i}
                  onClick={() => { if (isLoggedIn) setModalCard({ name: a.name, cat: a.cat, desc: a.desc, pct: a.pct, color: a.color, badgeBg: a.badgeBg, rank: a.rank }); else promptLogin(); }}
                  base={`position: relative; background: #fff; border: 2px solid ${a.cardBorder}; border-radius: 20px; padding: 24px; box-shadow: 0 12px 30px rgba(0,15,55,.06); cursor: pointer; animation: vtPop .6s cubic-bezier(.16,1,.3,1) both; transition: transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s ease;`}
                  hover="transform: translateY(-6px) scale(1.035); box-shadow: 0 28px 54px rgba(0,15,55,.17);"
                  active="transform: scale(.99);"
                  style={{ animationDelay: a.delay }}
                >
                  {!isLoggedIn && (
                    <span style={css("position: absolute; top: 14px; right: 14px; display: grid; place-items: center; width: 28px; height: 28px; border-radius: 9px; background: #F2F4F8; color: #848D95;")}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </span>
                  )}
                  <div style={css("display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;")}>
                    <span style={{ ...css("display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; font-size: 17px; font-weight: 900;"), background: a.badgeBg, color: a.color }}>{a.rank}</span>
                    <span style={{ ...css("font-size: 30px; font-weight: 900; letter-spacing: -.03em;"), color: a.color, marginRight: isLoggedIn ? "0" : "34px" }}>{a.pct}%</span>
                  </div>
                  <span style={{ ...css("display: inline-flex; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 800; letter-spacing: .03em; margin-bottom: 10px;"), background: a.badgeBg, color: a.color }}>{a.cat}</span>
                  <h4 style={css("margin: 0 0 8px; font-size: 17px; font-weight: 900; color: #161D1F; line-height: 1.22;")}>{a.name}</h4>
                  <p style={css("margin: 0; font-size: 13px; line-height: 1.5; color: #848D95;")}>{a.desc}</p>
                  <div style={{ ...css("display: flex; align-items: center; gap: 6px; margin-top: 16px; padding-top: 14px; border-top: 1px solid #EEF1F5; font-size: 12px; font-weight: 800;"), color: isLoggedIn ? a.color : "#848D95" }}>
                    {isLoggedIn ? "Toca para ver videos e info →" : "🔒 Inicia sesión para ver más"}
                  </div>
                </Fx>
              ))}
            </div>

            <h4 style={css("margin: 32px 0 14px; font-size: 16px; font-weight: 800; color: #4A4F55; animation: vtFadeUp .6s ease both;")}>También compatibles contigo</h4>
            <div style={css("display: grid; grid-template-columns: 1fr 1fr; gap: 14px;")}>
              {resultAlso.map((a, i) => (
                <div key={i} style={{ ...css("display: flex; align-items: center; justify-content: space-between; gap: 14px; background: #fff; border: 1px solid #DDE1E6; border-radius: 16px; padding: 16px 20px; animation: vtFadeUp .55s ease both;"), animationDelay: a.delay }}>
                  <div style={css("display: flex; align-items: center; gap: 13px;")}>
                    <span style={css("display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: #EEF1F5; color: #848D95; font-size: 14px; font-weight: 900;")}>{a.rank}</span>
                    <div>
                      <div style={css("font-size: 15px; font-weight: 800; color: #161D1F; line-height: 1.2;")}>{a.name}</div>
                      <div style={css("font-size: 12px; font-weight: 700; color: #848D95; margin-top: 2px;")}>{a.cat}</div>
                    </div>
                  </div>
                  <span style={css("font-size: 18px; font-weight: 900; color: #4A4F55;")}>{a.pct}%</span>
                </div>
              ))}
            </div>

            {needsLogin && (
              <div id="vt-login" style={{ ...css("display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-top: 30px; background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .6s ease both; animation-delay: .15s; transition: box-shadow .25s ease, border-color .25s ease;"), border: loginHint ? "2px solid #FF395C" : "1px solid #DDE1E6", boxShadow: loginHint ? "0 0 0 6px rgba(255,57,92,.16)" : "0 2px 0 rgba(0,15,55,.03)" }}>
                <div style={css("padding: 40px; background: #F2F4F8; border-right: 1px solid #DDE1E6;")}>
                  <span style={css("display: inline-flex; align-items: center; gap: 7px; padding: 6px 13px; border-radius: 99px; background: rgba(255,57,92,.1); color: #FF395C; font-size: 12px; font-weight: 800; letter-spacing: .03em; margin-bottom: 16px;")}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    CONTENIDO BLOQUEADO
                  </span>
                  <h3 style={css("margin: 0 0 12px; font-size: 26px; font-weight: 900; color: #000F37; letter-spacing: -.02em;")}>Regístrate o inicia sesión</h3>
                  <p style={css("margin: 0 0 22px; font-size: 15px; line-height: 1.6; color: #4A4F55;")}>Crea tu cuenta para desbloquear los videos, la info de cada carrera y poder elegir la tuya.</p>
                  <div style={css("display: grid; gap: 12px;")}>
                    <div style={css("display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; color: #161D1F;")}><span style={css("color: #3DDCDA;")}>✓</span> Ver videos e información de cada carrera</div>
                    <div style={css("display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; color: #161D1F;")}><span style={css("color: #3DDCDA;")}>✓</span> Elegir tu carrera y guardar tu resultado</div>
                    <div style={css("display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; color: #161D1F;")}><span style={css("color: #3DDCDA;")}>✓</span> Tu dashboard personal con seguimiento</div>
                  </div>
                </div>
                <div style={css("padding: 40px;")}>
                  {loginHint && (
                    <div style={css("font-size: 13px; font-weight: 800; color: #FF395C; background: rgba(255,57,92,.08); padding: 11px 14px; border-radius: 10px; margin-bottom: 16px; animation: vtPop .35s cubic-bezier(.16,1,.3,1) both;")}>👇 Inicia sesión o regístrate para continuar</div>
                  )}
                  <div style={css("display: grid; gap: 16px;")}>
                    <div>
                      <label style={css("display: block; font-size: 13px; font-weight: 800; color: #4A4F55; margin-bottom: 7px;")}>Correo</label>
                      <Fx as="input" type="email" value={loginEmail} onChange={onLoginEmail} placeholder="test@vocatwin.com" base={`width: 100%; font-family: inherit; font-size: 15px; padding: 14px 16px; border-radius: 12px; border: 2px solid ${loginError ? "#E3000B" : "#E8EBF0"}; background: #F2F4F8; color: #161D1F; outline: none; transition: border-color .18s ease;`} focus="border-color: #0661FC; background: #fff;" />
                    </div>
                    <div>
                      <label style={css("display: block; font-size: 13px; font-weight: 800; color: #4A4F55; margin-bottom: 7px;")}>Contraseña</label>
                      <Fx as="input" type="password" value={loginPwd} onChange={onLoginPwd} placeholder="••••••" base={`width: 100%; font-family: inherit; font-size: 15px; padding: 14px 16px; border-radius: 12px; border: 2px solid ${loginError ? "#E3000B" : "#E8EBF0"}; background: #F2F4F8; color: #161D1F; outline: none; transition: border-color .18s ease;`} focus="border-color: #0661FC; background: #fff;" />
                    </div>
                    {loginError && (
                      <div style={css("font-size: 13px; font-weight: 700; color: #E3000B; background: rgba(227,0,11,.08); padding: 10px 14px; border-radius: 10px; animation: vtFadeUp .3s ease both;")}>{loginError}</div>
                    )}
                    <Fx as="button" onClick={doLogin} base="position: relative; overflow: hidden; font-family: inherit; font-size: 16px; font-weight: 800; cursor: pointer; padding: 15px; border-radius: 12px; border: none; background: #FF395C; color: #fff; box-shadow: 0 10px 24px rgba(255,57,92,.34); transition: transform .16s ease;" hover="transform: translateY(-2px);" active="transform: scale(.98);">Continuar y desbloquear →</Fx>
                    <p style={css("margin: 0; text-align: center; font-size: 12px; color: #848D95;")}>Demo: cualquier correo y contraseña funcionan.</p>
                  </div>
                </div>
              </div>
            )}
            {alreadyLogged && (
              <div style={css("position: relative; overflow: hidden; margin-top: 30px; background: linear-gradient(135deg, #0a8f8c, #066b69); border-radius: 24px; padding: 32px; color: #fff; box-shadow: 0 20px 44px rgba(10,143,140,.28); animation: vtFadeUp .6s ease both;")}>
                <div style={css("position: absolute; top: -50px; right: -30px; width: 200px; height: 200px; border-radius: 50%; background: rgba(61,220,218,.3); filter: blur(8px);")} />
                <div style={css("position: relative; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap;")}>
                  <div style={css("min-width: 0;")}>
                    <span style={css("display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px; border-radius: 99px; background: rgba(255,255,255,.18); font-size: 12px; font-weight: 800; margin-bottom: 12px;")}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                      SESIÓN INICIADA
                    </span>
                    <h3 style={css("margin: 0 0 6px; font-size: 24px; font-weight: 900; letter-spacing: -.02em;")}>¡Listo, {userName}! Ya está desbloqueado.</h3>
                    <p style={css("margin: 0; font-size: 14px; line-height: 1.55; color: rgba(255,255,255,.82); max-width: 460px;")}>{chosenCareer ? `Tu carrera elegida es ${chosenCareer}. ` : "Toca cualquiera de tus 3 carreras para ver sus videos e info, y elige la tuya. "}Todo queda guardado en tu dashboard.</p>
                  </div>
                  <Fx as="button" onClick={goStudentHome} base="font-family: inherit; font-size: 15px; font-weight: 800; cursor: pointer; padding: 15px 26px; border-radius: 13px; border: none; background: #fff; color: #0a8f8c; box-shadow: 0 12px 28px rgba(0,0,0,.18); white-space: nowrap; transition: transform .18s cubic-bezier(.34,1.56,.64,1);" hover="transform: translateY(-3px);" active="transform: scale(.98);">Abrir mi dashboard →</Fx>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================== LOGIN DOCENTE ============================== */}
      {isTeacherLogin && (
        <div data-screen-label="Login docente" style={css("position: relative; min-height: 100vh; display: grid; place-items: center; padding: 24px; overflow: hidden; animation: vtFadeIn .4s ease both;")}>
          <div style={css("position: absolute; inset: 0; background: radial-gradient(circle at 50% 0%, #0a2a6b, #000F37 60%);")} />
          <div style={css("position: absolute; top: -80px; left: -60px; width: 320px; height: 320px; border-radius: 50%; background: radial-gradient(circle, rgba(255,57,92,.3), transparent 70%); animation: vtFloat 7s ease-in-out infinite;")} />
          <div style={css("position: absolute; bottom: -90px; right: -50px; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(61,220,218,.22), transparent 70%); animation: vtFloatB 8s ease-in-out infinite;")} />

          <div style={css("position: relative; width: min(420px, 94vw); background: #fff; border-radius: 26px; padding: 40px; box-shadow: 0 40px 90px rgba(0,0,0,.4); animation: vtPop .5s cubic-bezier(.16,1,.3,1) both;")}>
            <Fx as="button" onClick={goLanding} base="display: inline-flex; align-items: center; gap: 7px; font-family: inherit; font-size: 13px; font-weight: 700; color: #848D95; background: none; border: none; cursor: pointer; padding: 0; margin-bottom: 22px; transition: color .16s ease;" hover="color: #FF395C;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Volver al inicio
            </Fx>

            <div style={css("display: flex; align-items: center; gap: 12px; margin-bottom: 8px;")}>
              <span style={css("display: grid; place-items: center; width: 46px; height: 46px; border-radius: 13px; background: #000F37; color: #fff; box-shadow: 0 10px 24px rgba(0,15,55,.3);")}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 1 4 3 6 3s6-2 6-3v-5" /></svg>
              </span>
              <div>
                <h1 style={css("margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -.02em; color: #000F37;")}>Acceso docentes</h1>
                <p style={css("margin: 2px 0 0; font-size: 13px; color: #848D95;")}>Revisa los resultados de tus secciones</p>
              </div>
            </div>

            <div style={css("display: grid; gap: 15px; margin-top: 26px;")}>
              <div>
                <label style={css("display: block; font-size: 13px; font-weight: 800; color: #4A4F55; margin-bottom: 7px;")}>Correo institucional</label>
                <Fx as="input" type="email" value={teacherEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setTeacherEmail(e.target.value); setTeacherError(""); }} placeholder="profesor@colegio.edu" base={`width: 100%; font-family: inherit; font-size: 15px; padding: 14px 16px; border-radius: 12px; border: 2px solid ${teacherError ? "#E3000B" : "#E8EBF0"}; background: #F2F4F8; color: #161D1F; outline: none; transition: border-color .18s ease;`} focus="border-color: #0661FC; background: #fff;" />
              </div>
              <div>
                <label style={css("display: block; font-size: 13px; font-weight: 800; color: #4A4F55; margin-bottom: 7px;")}>Contraseña</label>
                <Fx as="input" type="password" value={teacherPwd} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setTeacherPwd(e.target.value); setTeacherError(""); }} placeholder="••••••" base={`width: 100%; font-family: inherit; font-size: 15px; padding: 14px 16px; border-radius: 12px; border: 2px solid ${teacherError ? "#E3000B" : "#E8EBF0"}; background: #F2F4F8; color: #161D1F; outline: none; transition: border-color .18s ease;`} focus="border-color: #0661FC; background: #fff;" />
              </div>
              {teacherError && (
                <div style={css("font-size: 13px; font-weight: 700; color: #E3000B; background: rgba(227,0,11,.08); padding: 10px 14px; border-radius: 10px; animation: vtFadeUp .3s ease both;")}>{teacherError}</div>
              )}
              <Fx as="button" onClick={doTeacherLogin} base="font-family: inherit; font-size: 16px; font-weight: 800; cursor: pointer; padding: 15px; border-radius: 12px; border: none; background: #000F37; color: #fff; box-shadow: 0 12px 28px rgba(0,15,55,.3); transition: transform .16s ease;" hover="transform: translateY(-2px);" active="transform: scale(.98);">Ingresar al panel docente →</Fx>
              <p style={css("margin: 0; text-align: center; font-size: 12px; color: #848D95;")}>Demo: cualquier correo y contraseña funcionan.</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================== DASHBOARD DOCENTE ============================== */}
      {isTeacherDashboard && (
        <TeacherDashboard teacherName={teacherName} onLogout={logout} />
      )}

      {/* ============================== PANEL DEL ALUMNO (HISTORIAL) ============================== */}
      {isStudentHome && (
        <StudentHome
          userName={userName}
          chosenCareer={chosenCareer}
          result={result}
          onLogout={logout}
          onRetake={retake}
        />
      )}

      {/* ============================== VENTANA DE DETALLE (tarjeta) ============================== */}
      {modalCard && (
        <CareerDetailModal card={modalCard} onClose={() => setModalCard(null)} onChoose={chooseCareer} />
      )}
    </div>
  );
}
