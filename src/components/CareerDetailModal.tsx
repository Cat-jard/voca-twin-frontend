"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { css, Fx } from "./fx";
import { fetchTikTok } from "@/lib/api";
import { getOrStart, subscribe, type SimScene } from "@/lib/simulationCache";

interface ChatMsg { role: "user" | "bot"; text: string; loading?: boolean; }
interface ActiveChapter { title: string; text: string; imageUrl?: string; }

// Extrae el videoId de una URL larga de TikTok → URL embeddable.
// Devuelve null si es un shortlink (vt.tiktok.com) que no puede embeberse.
function toEmbedUrl(url: string): string | null {
  const m = url.match(/\/video\/(\d+)/);
  return m ? `https://www.tiktok.com/embed/v2/${m[1]}` : null;
}

// Datos visuales de la tarjeta abierta (estructuralmente compatible con
// el estado `modalCard` de VocaTwin).
export interface CareerCard {
  name: string;
  cat: string;
  desc: string;
  pct: number;
  color: string;
  badgeBg: string;
  rank: string;
}

// Cada cuánto avanza la imagen/capítulo de forma automática (≈30 s).
const SLIDE_MS = 30000;

/** Capítulos de la "historia" de la carrera (placeholders estáticos). */
function buildChapters(name: string) {
  return [
    {
      title: "Un día en la carrera",
      text: `Imagina tu día a día estudiando ${name}. Aquí descubrirás cómo es realmente: las clases, los proyectos y las personas con las que compartirás esta aventura.`,
    },
    {
      title: "Lo que vas a aprender",
      text: `A lo largo de ${name} desarrollarás conocimientos y habilidades que te convertirán en un profesional capaz de resolver retos reales del mundo actual.`,
    },
    {
      title: "Dónde vas a trabajar",
      text: `Las puertas que abre ${name} son muchas: empresas, instituciones y proyectos propios donde podrás dejar tu huella y crecer profesionalmente.`,
    },
    {
      title: "El futuro que te espera",
      text: `El mañana de ${name} está lleno de oportunidades. Conoce hacia dónde se dirige esta carrera y por qué puede ser la decisión que cambie tu vida.`,
    },
    {
      title: "Tu impacto en el mundo",
      text: `Como profesional de ${name} tendrás la oportunidad de transformar tu entorno, liderar cambios y dejar una huella duradera en la sociedad.`,
    },
  ];
}

/** Genera el fondo (placeholder de imagen) para cada capítulo. */
function slideBg(color: string, i: number): string {
  const variants = [
    `linear-gradient(135deg, ${color}, #000F37)`,
    `linear-gradient(310deg, ${color}, #0a2a6b)`,
    `radial-gradient(circle at 28% 30%, ${color}, #001a4d)`,
    `linear-gradient(45deg, #000F37, ${color})`,
    `radial-gradient(circle at 72% 62%, ${color}, #04113a)`,
  ];
  return variants[i % variants.length];
}

export default function CareerDetailModal({
  card,
  onClose,
  onChoose,
  isLoggedIn = false,
}: {
  card: CareerCard;
  onClose: () => void;
  onChoose?: (career: string) => void;
  isLoggedIn?: boolean;
}) {
  const [moreInfo, setMoreInfo] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [playing, setPlaying] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [chosen, setChosen] = useState(false);

  // ── Simulation (AI story) state ───────────────────────────────────────────
  const [simScenes, setSimScenes] = useState<SimScene[]>([]);
  const [simLoading, setSimLoading] = useState(false);

  // ── Chat state ────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputText, setInputText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const conversationId = useRef(`cv-${Date.now()}`);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendChat = useCallback(async (userText: string) => {
    if (!userText.trim() || chatLoading) return;
    const question = userText.trim();
    setInputText("");
    const mensaje = question;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: question },
      { role: "bot", text: "", loading: true },
    ]);
    setChatLoading(true);

    try {
      const res = await fetch("/proxy/api/chat/career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ career: card.name, mensaje: question, conversationId: conversationId.current }),
      });

      if (!res.ok) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "bot", text: "Lo siento, no pude conectarme al asistente.", loading: false };
          return copy;
        });
        return;
      }

      const text = await res.text();
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "bot", text: text || "Sin respuesta.", loading: false };
        return copy;
      });
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "bot", text: "Error al conectar con el asistente.", loading: false };
        return copy;
      });
    } finally {
      setChatLoading(false);
    }
  }, [card.name, chatLoading]);

  // Auto-scroll al fondo del chat al recibir nuevos mensajes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // TikTok del servicio vocatwin
  const [tiktokUrl, setTiktokUrl] = useState<string | null>(null);
  const [tiktokLoading, setTiktokLoading] = useState(true);
  const directEmbed = tiktokUrl ? toEmbedUrl(tiktokUrl) : null;
  const [resolvedEmbed, setResolvedEmbed] = useState<string | null>(null);
  const embedUrl = directEmbed ?? resolvedEmbed;

  useEffect(() => {
    setTiktokLoading(true);
    setResolvedEmbed(null);
    console.log(`[CareerDetail] GET /api/recommendations/search?career=${card.name}`);
    fetchTikTok(card.name)
      .then((rec) => {
        console.log(`[CareerDetail] ✅ TikTok recibido:`, rec);
        setTiktokUrl(rec.tiktokUrl);
      })
      .catch((err) => {
        console.warn(`[CareerDetail] ⚠️ Sin TikTok para "${card.name}":`, err);
        setTiktokUrl(null);
      })
      .finally(() => setTiktokLoading(false));
  }, [card.name]);

  // Si la URL es un shortlink (sin videoId), la resolvemos server-side
  useEffect(() => {
    if (!tiktokUrl || directEmbed) return;
    console.log(`[CareerDetail] Resolviendo shortlink: ${tiktokUrl}`);
    fetch(`/api/resolve-tiktok?url=${encodeURIComponent(tiktokUrl)}`)
      .then((r) => r.json())
      .then((data) => {
        const embed = data.resolvedUrl ? toEmbedUrl(data.resolvedUrl) : null;
        console.log(`[CareerDetail] ✅ Shortlink resuelto → embed: ${embed}`);
        setResolvedEmbed(embed);
      })
      .catch((err) => console.warn("[CareerDetail] ⚠️ No se pudo resolver shortlink:", err));
  }, [tiktokUrl, directEmbed]);

  const chapters = useMemo(() => buildChapters(card.name), [card.name]);

  // Merge AI scenes progressively as they arrive; fallback to static for missing slots
  const activeChapters = useMemo<ActiveChapter[]>(() => {
    const count = Math.max(simScenes.length, chapters.length);
    return Array.from({ length: count }, (_, i) => {
      const scene = simScenes[i];
      const fallback = chapters[i];
      return {
        title: fallback?.title ?? `Año ${(i + 1) * 2}`,
        text: scene?.narrative ?? fallback?.text ?? "",
        imageUrl: scene?.imageUrl,
      };
    });
  }, [simScenes, chapters]);

  const total = activeChapters.length;
  const current = activeChapters[Math.min(chapter, Math.max(0, total - 1))];

  const goTo = (next: number, d: 1 | -1) => {
    setDir(d);
    setChapter((next + total) % total);
  };
  const nextCh = () => goTo(chapter + 1, 1);
  const prevCh = () => goTo(chapter - 1, -1);

  // Avance automático de la imagen/capítulo cada ≈30 s mientras se reproduce.
  useEffect(() => {
    if (!moreInfo || !playing || confirm) return;
    const t = setTimeout(() => goTo(chapter + 1, 1), SLIDE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moreInfo, playing, confirm, chapter]);

  // Teclado: Escape retrocede de panel o cierra; flechas navegan capítulos.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirm) setConfirm(false);
        else if (moreInfo) setMoreInfo(false);
        else onClose();
      } else if (moreInfo && !confirm) {
        if (e.key === "ArrowRight") nextCh();
        if (e.key === "ArrowLeft") prevCh();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moreInfo, confirm, chapter]);

  // Storytelling IA desde el caché compartido (nivel 1). Si ya se prefetcheó
  // tras el test, aparece instantáneo; si no, se prioriza y se pinta progresivo.
  useEffect(() => {
    if (!moreInfo) {
      setSimScenes([]);
      setSimLoading(false);
      window.speechSynthesis?.cancel();
      return;
    }
    const sync = () => {
      const entry = getOrStart(card.name);
      setSimScenes(entry.scenes);
      setSimLoading(entry.status === "loading" || entry.status === "idle");
    };
    sync();
    const unsub = subscribe(card.name, sync);
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moreInfo, card.name]);

  // Web Speech API: narrate the current chapter text when playing
  useEffect(() => {
    if (!moreInfo || !current) { window.speechSynthesis?.cancel(); return; }
    if (!playing) { window.speechSynthesis?.cancel(); return; }
    window.speechSynthesis?.cancel();
    const utter = new SpeechSynthesisUtterance(current.text);
    utter.lang = "es-PE";
    utter.rate = 0.92;
    const speak = () => {
      const voices = window.speechSynthesis.getVoices();
      const v = voices.find(v => v.lang.startsWith("es"));
      if (v) utter.voice = v;
      window.speechSynthesis.speak(utter);
    };
    if (window.speechSynthesis.getVoices().length > 0) {
      speak();
    } else {
      window.speechSynthesis.onvoiceschanged = speak;
    }
    return () => { window.speechSynthesis?.cancel(); };
  }, [moreInfo, playing, chapter, current?.text]);

  const confirmChoose = () => {
    setChosen(true);
    setTimeout(() => {
      if (onChoose) onChoose(card.name);
      else onClose();
    }, 1500);
  };

  return (
    <div
      data-screen-label="Detalle de carrera"
      onClick={onClose}
      style={css(
        "position: fixed; inset: 0; z-index: 360; display: grid; place-items: center; padding: 24px; background: rgba(0,15,55,.55); backdrop-filter: blur(8px); animation: vtFadeIn .3s ease both;"
      )}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={css(
          `position: relative; width: min(1180px, 96vw); max-height: 92vh; overflow: hidden; background: #F2F4F8; border-radius: 28px; box-shadow: 0 40px 100px rgba(0,15,55,.5); border-top: 5px solid ${card.color}; animation: vtPop .45s cubic-bezier(.16,1,.3,1) both;`
        )}
      >
        {/* Botón cerrar (X) — siempre cierra toda la ventana */}
        <Fx
          as="button"
          onClick={onClose}
          base="position: absolute; top: 18px; right: 18px; z-index: 8; display: grid; place-items: center; width: 42px; height: 42px; border-radius: 12px; border: 1px solid #DDE1E6; background: #fff; color: #4A4F55; cursor: pointer; box-shadow: 0 6px 16px rgba(0,15,55,.12); transition: all .16s ease;"
          hover="border-color: #E3000B; color: #E3000B; transform: rotate(90deg);"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </Fx>

        {/* ====================== VISTA DETALLE ====================== */}
        {!moreInfo && (
          <div style={css("max-height: 92vh; overflow: auto; animation: vtFadeIn .35s ease both;")}>
            <div style={css("display: grid; grid-template-columns: 1.55fr 1fr; gap: 20px; padding: 26px; align-items: stretch;")}>
              {/* Columna izquierda: video + info */}
              <div style={css("display: flex; flex-direction: column; gap: 20px; min-width: 0;")}>
                {/* Video TikTok */}
                <div style={css(`position: relative; height: 460px; border-radius: 22px; overflow: hidden; background: #0a0a0a; box-shadow: 0 24px 50px rgba(0,15,55,.25); animation: vtPop .5s cubic-bezier(.16,1,.3,1) both; flex-shrink: 0;`)}>

                  {/* ── Cargando ── */}
                  {tiktokLoading && (
                    <div style={css(`position: absolute; inset: 0; display: grid; place-items: center; background: ${slideBg(card.color, 0)};`)}>
                      <div style={css("display: flex; flex-direction: column; align-items: center; gap: 14px;")}>
                        <div style={css("width: 40px; height: 40px; border-radius: 99px; border: 3px solid rgba(255,255,255,.25); border-top-color: #fff; animation: vtSpin .8s linear infinite;")} />
                        <span style={css("color: rgba(255,255,255,.7); font-size: 13px; font-weight: 700;")}>Cargando video…</span>
                      </div>
                    </div>
                  )}

                  {/* ── Embed TikTok (URL larga → videoId) ── */}
                  {!tiktokLoading && embedUrl && (
                    <iframe
                      src={embedUrl}
                      style={css("position: absolute; top: 0; left: 0; width: 100%; height: 680px; border: none;")}
                      allow="fullscreen; autoplay"
                      allowFullScreen
                      title={`TikTok - ${card.name}`}
                    />
                  )}

                  {/* ── Shortlink: tarjeta de apertura con branding TikTok ── */}
                  {!tiktokLoading && !embedUrl && tiktokUrl && (
                    <div style={css(`position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; padding: 32px; background: ${slideBg(card.color, 0)};`)}>
                      <div style={css("display: flex; flex-direction: column; align-items: center; gap: 8px;")}>
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="#fff" style={css("filter: drop-shadow(0 4px 12px rgba(0,0,0,.4));")}><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.75a4.85 4.85 0 01-1-.06z"/></svg>
                        <span style={css("color: rgba(255,255,255,.6); font-size: 11px; font-weight: 800; letter-spacing: .12em;")}>TIKTOK</span>
                      </div>
                      <p style={css("color: #fff; font-size: 17px; font-weight: 900; text-align: center; margin: 0; line-height: 1.3; text-shadow: 0 2px 12px rgba(0,0,0,.4);")}>{card.name}</p>
                      <a
                        href={tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={css("display: inline-flex; align-items: center; gap: 9px; padding: 14px 26px; border-radius: 14px; background: rgba(255,255,255,.15); backdrop-filter: blur(8px); border: 1.5px solid rgba(255,255,255,.3); font-size: 14px; font-weight: 800; color: #fff; text-decoration: none; transition: background .18s ease;")}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.75a4.85 4.85 0 01-1-.06z"/></svg>
                        Ver video
                      </a>
                    </div>
                  )}

                  {/* ── Sin video ── */}
                  {!tiktokLoading && !tiktokUrl && (
                    <div style={css(`position: absolute; inset: 0; display: grid; place-items: center; background: ${slideBg(card.color, 0)};`)}>
                      <span style={css("color: rgba(255,255,255,.6); font-size: 14px; font-weight: 700;")}>Video no disponible</span>
                    </div>
                  )}

                  {/* Degradado inferior: oculta "Related videos" del embed */}
                  <div style={css("position: absolute; bottom: 0; left: 0; right: 0; height: 90px; background: linear-gradient(to bottom, transparent, #F2F4F8); z-index: 3; pointer-events: none;")} />

                  {/* Badge TikTok */}
                  <div style={css("position: absolute; top: 14px; left: 14px; z-index: 4; display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px; border-radius: 99px; background: rgba(0,0,0,.55); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.12);")}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.75a4.85 4.85 0 01-1-.06z"/></svg>
                    <span style={css("color: #fff; font-size: 11px; font-weight: 800; letter-spacing: .05em;")}>{card.name}</span>
                  </div>
                </div>

                {/* Info */}
                <div style={css("position: relative; flex: 1; background: #fff; border: 1px solid #DDE1E6; border-radius: 20px; padding: 24px; box-shadow: 0 2px 0 rgba(0,15,55,.03); animation: vtFadeUp .5s ease both; animation-delay: .06s;")}>
                  <div style={css("display: flex; align-items: center; gap: 10px; margin-bottom: 14px;")}>
                    <span style={css("font-size: 13px; font-weight: 900; color: #848D95; letter-spacing: .14em;")}>INFO</span>
                    <span style={{ ...css("display: inline-flex; padding: 4px 11px; border-radius: 99px; font-size: 11px; font-weight: 800;"), background: card.badgeBg, color: card.color }}>{card.cat}</span>
                    <span style={{ ...css("margin-left: auto; font-size: 22px; font-weight: 900; letter-spacing: -.02em;"), color: card.color }}>{card.pct}%</span>
                  </div>
                  <h3 style={css("margin: 0 0 10px; font-size: 22px; font-weight: 900; color: #000F37; letter-spacing: -.02em; line-height: 1.15;")}>{card.name}</h3>
                  <p style={css("margin: 0 0 18px; font-size: 14px; line-height: 1.6; color: #4A4F55;")}>{card.desc}</p>

                  <div style={css("display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 18px;")}>
                    {[["Duración", "— años"], ["Modalidad", "Presencial"], ["Demanda", "Alta"]].map((it, k) => (
                      <div key={k} style={{ ...css("background: #F2F4F8; border-radius: 12px; padding: 12px 14px; animation: vtFadeUp .5s ease both;"), animationDelay: 0.1 + k * 0.06 + "s" }}>
                        <div style={css("font-size: 11px; font-weight: 800; color: #848D95; letter-spacing: .04em; margin-bottom: 4px;")}>{it[0]}</div>
                        <div style={css("font-size: 14px; font-weight: 900; color: #161D1F;")}>{it[1]}</div>
                      </div>
                    ))}
                  </div>

                  {/* Tab "Más info" → abre el panel de historias */}
                  <Fx
                    as="button"
                    onClick={() => { setMoreInfo(true); setChapter(0); setDir(1); setPlaying(true); }}
                    base={`display: inline-flex; align-items: center; gap: 8px; font-family: inherit; font-size: 13px; font-weight: 800; cursor: pointer; padding: 11px 18px; border-radius: 11px; border: none; background: ${card.color}; color: #fff; box-shadow: 0 10px 24px rgba(0,15,55,.18); transition: all .18s cubic-bezier(.34,1.56,.64,1);`}
                    hover="transform: translateY(-2px) scale(1.03);"
                    active="transform: scale(.97);"
                  >
                    Más info
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </Fx>
                </div>
              </div>

              {/* Columna derecha: chatbot */}
              <div style={css("display: flex; flex-direction: column; background: #fff; border: 1px solid #DDE1E6; border-radius: 20px; overflow: hidden; box-shadow: 0 2px 0 rgba(0,15,55,.03); align-self: start; animation: vtSlideRight .5s ease both; animation-delay: .08s;")}>
                <div style={css("display: flex; align-items: center; gap: 12px; padding: 16px 18px; border-bottom: 1px solid #EEF1F5;")}>
                  <span style={{ ...css("display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; color: #fff; flex-shrink: 0;"), background: card.color }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4M8 8h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2zM2 14h2M20 14h2M9 13v2M15 13v2" /></svg>
                  </span>
                  <div style={css("min-width: 0;")}>
                    <div style={css("font-size: 14px; font-weight: 900; color: #161D1F; line-height: 1.2;")}>Asistente VocaTwin</div>
                    <div style={css("display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #0a8f8c;")}>
                      <span style={css("width: 6px; height: 6px; border-radius: 99px; background: #3DDCDA; animation: vtPulseRing 2s infinite;")} />
                      En línea
                    </div>
                  </div>
                </div>

                <div style={css("max-height: 430px; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 12px; background: #F8FAFC;")}>
                  {/* Mensaje de bienvenida + acciones rápidas (solo cuando no hay mensajes) */}
                  {messages.length === 0 && (
                    <>
                      <div style={css("max-width: 90%; align-self: flex-start; background: #fff; border: 1px solid #EEF1F5; border-radius: 14px 14px 14px 4px; padding: 12px 14px; font-size: 13.5px; line-height: 1.5; color: #161D1F; box-shadow: 0 2px 8px rgba(0,15,55,.05); animation: vtFadeUp .45s ease both;")}>
                        ¡Hola! 👋 Soy tu asistente sobre <b>{card.name}</b>. Elige una pregunta o escribe la tuya.
                      </div>
                      <div style={css("display: flex; flex-direction: column; gap: 8px; margin-top: 4px;")}>
                        {[
                          "¿Cuántos años dura?",
                          "¿Cuánto se gana?",
                          "¿Dónde puedo trabajar?",
                          "¿Qué habilidades necesito?",
                          "¿Tiene buen futuro?",
                        ].map((q, k) => (
                          <Fx
                            as="button"
                            key={k}
                            onClick={() => sendChat(q)}
                            base={`text-align: left; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; padding: 11px 14px; border-radius: 12px; border: 1.5px solid #E8EBF0; background: #fff; color: #161D1F; transition: all .15s ease; animation: vtFadeUp .45s ease both; animation-delay: ${0.06 + k * 0.05}s;`}
                            hover={`border-color: ${card.color}; color: ${card.color}; transform: translateX(3px);`}
                          >
                            {q}
                          </Fx>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Historial de mensajes */}
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      style={css(
                        msg.role === "user"
                          ? "max-width: 80%; align-self: flex-end; animation: vtFadeUp .3s ease both;"
                          : "max-width: 90%; align-self: flex-start; animation: vtFadeUp .3s ease both;"
                      )}
                    >
                      {msg.role === "user" ? (
                        <div style={{ ...css("padding: 11px 14px; border-radius: 14px 14px 4px 14px; font-size: 13.5px; line-height: 1.5; color: #fff; font-weight: 600;"), background: card.color }}>
                          {msg.text}
                        </div>
                      ) : (
                        <div style={css("background: #fff; border: 1px solid #EEF1F5; border-radius: 14px 14px 14px 4px; padding: 12px 14px; font-size: 13.5px; line-height: 1.5; color: #161D1F; box-shadow: 0 2px 8px rgba(0,15,55,.05); white-space: pre-wrap;")}>
                          {msg.loading ? (
                            <span style={css("display: inline-flex; gap: 5px; align-items: center;")}>
                              {[0, 1, 2].map((d) => (
                                <span key={d} style={{ ...css("width: 7px; height: 7px; border-radius: 99px; display: inline-block;"), background: card.color, animation: `vtPulseRing 1.2s ${d * 0.2}s infinite` }} />
                              ))}
                            </span>
                          ) : msg.text || "…"}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <div style={css("display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-top: 1px solid #EEF1F5; background: #fff;")}>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChat(inputText)}
                    placeholder="Escribe tu pregunta…"
                    disabled={chatLoading}
                    style={css("flex: 1; padding: 12px 16px; border-radius: 12px; background: #F2F4F8; border: 1px solid #E8EBF0; font-size: 13px; color: #161D1F; font-family: inherit; outline: none;")}
                  />
                  <button
                    onClick={() => sendChat(inputText)}
                    disabled={chatLoading || !inputText.trim()}
                    style={{ ...css(`display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; border: none; color: #fff; cursor: pointer; flex-shrink: 0; opacity: ${chatLoading || !inputText.trim() ? "0.5" : "1"}; transition: opacity .15s ease;`), background: card.color }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================== PANEL "MÁS INFO" (HISTORIAS) ====================== */}
        {moreInfo && (
          <div style={css("max-height: 92vh; overflow: auto; animation: vtFadeIn .35s ease both;")}>
            {/* Cabecera */}
            <div style={css("display: flex; align-items: center; gap: 14px; padding: 20px 26px 0;")}>
              <Fx
                as="button"
                onClick={() => setMoreInfo(false)}
                base="display: inline-flex; align-items: center; gap: 7px; font-family: inherit; font-size: 14px; font-weight: 800; color: #4A4F55; background: #fff; border: 1px solid #DDE1E6; cursor: pointer; padding: 9px 15px; border-radius: 11px; transition: all .16s ease;"
                hover="border-color: #FF395C; color: #FF395C; transform: translateX(-2px);"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                Volver
              </Fx>
              <div style={css("min-width: 0;")}>
                <div style={css("font-size: 12px; font-weight: 800; color: #848D95; letter-spacing: .1em;")}>HISTORIAS · {card.name.toUpperCase()}</div>
                <div style={{ ...css("font-size: 18px; font-weight: 900; letter-spacing: -.02em;"), color: card.color }}>Capítulo {chapter + 1} de {total}</div>
              </div>
            </div>

            <div style={css("display: grid; grid-template-columns: 1fr 1.05fr; gap: 22px; padding: 18px 26px 24px; align-items: stretch;")}>
              {/* Izquierda: imagen que cambia cada ≈30 s */}
              <div style={css("display: flex; flex-direction: column; gap: 14px;")}>
                <div style={css("position: relative; flex: 1; min-height: 360px; border-radius: 22px; overflow: hidden; box-shadow: 0 20px 46px rgba(0,15,55,.22);")}>
                  <div
                    key={chapter}
                    style={{
                      ...css(`position: absolute; inset: 0; background: ${slideBg(card.color, chapter)}; animation: ${dir === 1 ? "vtSlideRight" : "vtSlideLeft"} .5s ease both;`),
                    }}
                  >
                    {current.imageUrl ? (
                      <>
                        <img
                          key={current.imageUrl}
                          src={current.imageUrl}
                          alt={current.title}
                          style={css("position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1;")}
                        />
                        <div style={css("position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,.15), rgba(0,0,0,.55)); z-index: 2;")} />
                      </>
                    ) : (
                      <>
                        <div style={css("position: absolute; inset: 0; animation: vtKenBurns 30s linear both;")}>
                          <div style={css("position: absolute; inset: 0; background: radial-gradient(circle at 30% 28%, rgba(255,255,255,.16), transparent 55%);")} />
                        </div>
                        {simLoading && (
                          <div style={css("position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 3;")}>
                            <div style={css("display: flex; flex-direction: column; align-items: center; gap: 10px;")}>
                              <div style={css("width: 32px; height: 32px; border-radius: 99px; border: 3px solid rgba(255,255,255,.25); border-top-color: #fff; animation: vtSpin .8s linear infinite;")} />
                              <span style={css("color: rgba(255,255,255,.8); font-size: 12px; font-weight: 700;")}>Generando con IA…</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <div style={css("position: absolute; top: 22px; left: 24px; font-size: 88px; font-weight: 900; color: rgba(255,255,255,.16); letter-spacing: -.04em; line-height: 1; z-index: 4;")}>{chapter + 1}</div>
                    <div style={css("position: absolute; left: 24px; right: 24px; bottom: 22px; color: #fff; z-index: 4;")}>
                      <div style={css("font-size: 11px; font-weight: 800; letter-spacing: .12em; opacity: .8; margin-bottom: 6px;")}>IMAGEN DEL CAPÍTULO</div>
                      <div style={css("font-size: 22px; font-weight: 900; letter-spacing: -.02em; text-shadow: 0 4px 16px rgba(0,0,0,.35);")}>{current.title}</div>
                    </div>
                  </div>

                  {/* Barra de progreso del slide (reinicia cada capítulo) */}
                  <div style={css("position: absolute; left: 0; right: 0; bottom: 0; height: 5px; background: rgba(255,255,255,.22);")}>
                    <div
                      key={`${chapter}-${playing}`}
                      style={{
                        ...css(`height: 100%; transform-origin: left; background: #fff; transform: scaleX(0); animation: vtProgressFill ${SLIDE_MS}ms linear both;`),
                        animationPlayState: playing ? "running" : "paused",
                      }}
                    />
                  </div>
                </div>

                {/* Botón para cambiar de imagen/capítulo manualmente */}
                <Fx
                  as="button"
                  onClick={nextCh}
                  base="display: inline-flex; align-items: center; justify-content: center; gap: 9px; font-family: inherit; font-size: 14px; font-weight: 800; cursor: pointer; padding: 13px; border-radius: 13px; border: 1.5px solid #DDE1E6; background: #fff; color: #161D1F; transition: all .16s ease;"
                  hover={`border-color: ${card.color}; color: ${card.color}; transform: translateY(-2px);`}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>
                  Cambiar imagen
                </Fx>
              </div>

              {/* Derecha: texto narrativo + lector de audio */}
              <div style={css("display: flex; flex-direction: column; gap: 16px;")}>
                <div style={css("position: relative; flex: 1; background: #fff; border: 1px solid #DDE1E6; border-radius: 20px; padding: 26px; box-shadow: 0 2px 0 rgba(0,15,55,.03); overflow: hidden;")}>
                  <span style={{ ...css("display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px; border-radius: 99px; font-size: 11px; font-weight: 800; letter-spacing: .05em; margin-bottom: 16px;"), background: card.badgeBg, color: card.color }}>
                    TEXTO NARRATIVO
                  </span>
                  <div key={chapter} style={css(`animation: ${dir === 1 ? "vtSlideRight" : "vtSlideLeft"} .45s ease both;`)}>
                    <h3 style={css("margin: 0 0 12px; font-size: 24px; font-weight: 900; color: #000F37; letter-spacing: -.02em; line-height: 1.15;")}>{current.title}</h3>
                    <p style={css("margin: 0; font-size: 15px; line-height: 1.7; color: #4A4F55;")}>{current.text}</p>
                  </div>

                  {/* Ecualizador (visual) cuando se "reproduce" */}
                  {playing && (
                    <div style={css("position: absolute; right: 26px; bottom: 22px; display: flex; align-items: flex-end; gap: 4px; height: 26px;")}>
                      {[0, 1, 2, 3, 4].map((b) => (
                        <span key={b} style={{ ...css("width: 4px; height: 100%; border-radius: 2px; transform-origin: bottom;"), background: card.color, animation: `vtEq ${0.7 + b * 0.12}s ease-in-out ${b * 0.08}s infinite` }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Controles del lector de audio */}
                <div style={css("display: flex; align-items: center; gap: 14px; background: #fff; border: 1px solid #DDE1E6; border-radius: 18px; padding: 14px 18px; box-shadow: 0 2px 0 rgba(0,15,55,.03);")}>
                  <Fx as="button" onClick={prevCh} base="display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; border: 1.5px solid #E8EBF0; background: #fff; color: #161D1F; cursor: pointer; transition: all .15s ease;" hover="border-color: #FF395C; color: #FF395C; transform: translateX(-2px);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zM20 6v12l-9-6z" /></svg>
                  </Fx>
                  <Fx
                    as="button"
                    onClick={() => setPlaying((p) => !p)}
                    base={`display: grid; place-items: center; width: 56px; height: 56px; border-radius: 50%; border: none; background: ${card.color}; color: #fff; cursor: pointer; box-shadow: 0 10px 24px rgba(0,15,55,.22); transition: transform .16s cubic-bezier(.34,1.56,.64,1);`}
                    hover="transform: scale(1.08);"
                    active="transform: scale(.95);"
                  >
                    {playing ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7z" /></svg>
                    )}
                  </Fx>
                  <Fx as="button" onClick={nextCh} base="display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; border: 1.5px solid #E8EBF0; background: #fff; color: #161D1F; cursor: pointer; transition: all .15s ease;" hover="border-color: #FF395C; color: #FF395C; transform: translateX(2px);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zM4 6l9 6-9 6z" /></svg>
                  </Fx>
                  <div style={css("flex: 1; min-width: 0;")}>
                    <div style={css("font-size: 13px; font-weight: 800; color: #161D1F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;")}>{playing ? "Narrando…" : "En pausa"} · {current.title}</div>
                    <div style={css("margin-top: 7px; height: 5px; border-radius: 99px; background: #EEF1F5; overflow: hidden;")}>
                      <div
                        key={`bar-${chapter}-${playing}`}
                        style={{
                          ...css(`height: 100%; border-radius: 99px; transform-origin: left; background: ${card.color}; transform: scaleX(0); animation: vtProgressFill ${SLIDE_MS}ms linear both;`),
                          animationPlayState: playing ? "running" : "paused",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Indicadores de capítulo */}
                <div style={css("display: flex; align-items: center; justify-content: center; gap: 7px;")}>
                  {activeChapters.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i, i >= chapter ? 1 : -1)}
                      style={{
                        ...css("height: 8px; border-radius: 99px; border: none; cursor: pointer; transition: all .3s cubic-bezier(.16,1,.3,1);"),
                        width: i === chapter ? "26px" : "8px",
                        background: i === chapter ? card.color : "#DDE1E6",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Botón inferior: Elegir carrera */}
            <div style={css("padding: 0 26px 26px;")}>
              <Fx
                as="button"
                onClick={() => { if (isLoggedIn) setConfirm(true); else onChoose?.(card.name); }}
                base={`width: 100%; font-family: inherit; font-size: 16px; font-weight: 900; cursor: pointer; padding: 17px; border-radius: 15px; border: none; background: ${card.color}; color: #fff; box-shadow: 0 14px 32px rgba(0,15,55,.2); letter-spacing: -.01em; transition: transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s ease;`}
                hover="transform: translateY(-3px); box-shadow: 0 20px 42px rgba(0,15,55,.28);"
                active="transform: scale(.98);"
              >
                {isLoggedIn ? "✦ Elegir esta carrera" : "✦ Inicia sesión para elegir esta carrera"}
              </Fx>
            </div>
          </div>
        )}

        {/* ====================== CONFIRMACIÓN ====================== */}
        {confirm && (
          <div
            onClick={() => !chosen && setConfirm(false)}
            style={css("position: absolute; inset: 0; z-index: 12; display: grid; place-items: center; padding: 24px; background: rgba(0,15,55,.5); backdrop-filter: blur(6px); animation: vtFadeIn .25s ease both;")}
          >
            <div onClick={(e) => e.stopPropagation()} style={css("width: min(440px, 92%); background: #fff; border-radius: 24px; padding: 34px; text-align: center; box-shadow: 0 30px 70px rgba(0,15,55,.4); animation: vtPop .4s cubic-bezier(.16,1,.3,1) both;")}>
              {!chosen ? (
                <>
                  <div style={{ ...css("display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 18px; color: #fff;"), background: card.color }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4-6.3-4.6L5.7 21l2.3-7.4-6-4.6h7.6z" /></svg>
                  </div>
                  <h3 style={css("margin: 0 0 8px; font-size: 23px; font-weight: 900; color: #000F37; letter-spacing: -.02em;")}>¿Seguro de tu elección?</h3>
                  <p style={css("margin: 0 0 26px; font-size: 14px; line-height: 1.6; color: #4A4F55;")}>Estás a punto de elegir <b style={css(`color: ${card.color};`)}>{card.name}</b> como tu carrera. Podrás cambiarla más adelante.</p>
                  <div style={css("display: grid; grid-template-columns: 1fr 1fr; gap: 12px;")}>
                    <Fx as="button" onClick={() => setConfirm(false)} base="font-family: inherit; font-size: 15px; font-weight: 800; cursor: pointer; padding: 14px; border-radius: 13px; border: 1.5px solid #DDE1E6; background: #fff; color: #4A4F55; transition: all .16s ease;" hover="border-color: #848D95; color: #161D1F;">Cancelar</Fx>
                    <Fx as="button" onClick={confirmChoose} base={`font-family: inherit; font-size: 15px; font-weight: 900; cursor: pointer; padding: 14px; border-radius: 13px; border: none; background: ${card.color}; color: #fff; box-shadow: 0 10px 24px rgba(0,15,55,.2); transition: transform .16s ease;`} hover="transform: translateY(-2px);" active="transform: scale(.98);">Sí, es mi carrera</Fx>
                  </div>
                </>
              ) : (
                <div style={css("animation: vtFadeIn .3s ease both;")}>
                  <div style={{ ...css("display: grid; place-items: center; width: 76px; height: 76px; border-radius: 50%; margin: 0 auto 18px; color: #fff; animation: vtCheckPop .5s cubic-bezier(.34,1.56,.64,1) both;"), background: "#0a8f8c" }}>
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                  <h3 style={css("margin: 0 0 8px; font-size: 23px; font-weight: 900; color: #000F37; letter-spacing: -.02em;")}>¡Carrera elegida! 🎉</h3>
                  <p style={css("margin: 0; font-size: 14px; line-height: 1.6; color: #4A4F55;")}>Elegiste <b style={css(`color: ${card.color};`)}>{card.name}</b>. ¡Mucho éxito en tu camino!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
