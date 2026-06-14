// Caché en memoria del storytelling IA (nivel 1).
//
// - Sobrevive a abrir/cerrar el modal y cambiar de pantalla (es un singleton de módulo).
// - Se pierde al recargar la página (el módulo se reinicia) → cumple "si recargo desaparece".
// - Genera UNA historia a la vez (cola secuencial) para no saturar la GPU/HuggingFace.
// - Tras terminar la #1 arranca la #2, luego la #3 (enqueue del top-3 tras el test).
//
// La persistencia definitiva (BD) ocurre al loguearse: ahí se guarda el `simulationId`
// que captura el evento SSE `complete`.

export interface SimScene {
  year: number;
  narrative: string;
  imageUrl: string;
}

type Status = "idle" | "loading" | "done" | "error";

interface Entry {
  scenes: SimScene[];
  simulationId?: string;
  status: Status;
}

const cache = new Map<string, Entry>();
const listeners = new Map<string, Set<() => void>>();
let queue: string[] = [];
let active: string | null = null;

function ensure(career: string): Entry {
  let e = cache.get(career);
  if (!e) {
    e = { scenes: [], status: "idle" };
    cache.set(career, e);
  }
  return e;
}

function notify(career: string) {
  listeners.get(career)?.forEach((cb) => {
    try { cb(); } catch { /* noop */ }
  });
}

async function run(career: string) {
  active = career;
  const entry = ensure(career);
  entry.status = "loading";
  entry.scenes = [];
  notify(career);

  try {
    const res = await fetch("/api/simulation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ career, years: 10 }),
    });
    if (!res.ok || !res.body) throw new Error(`simulation ${res.status}`);

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let evType = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trimEnd();
        if (trimmed.startsWith("event:")) {
          evType = trimmed.slice(6).trim();
        } else if (trimmed.startsWith("data:")) {
          const payload = trimmed.slice(5).trim();
          if (evType === "scene") {
            try {
              const scene: SimScene = JSON.parse(payload);
              entry.scenes = [...entry.scenes, scene];
              notify(career);
            } catch { /* skip malformed */ }
          } else if (evType === "complete") {
            try {
              const data = JSON.parse(payload);
              if (data?.id) entry.simulationId = String(data.id);
            } catch { /* skip */ }
          }
          evType = "";
        } else if (trimmed === "") {
          evType = "";
        }
      }
    }
    entry.status = "done";
    console.log(`[simCache] ✅ "${career}" lista (id=${entry.simulationId}, ${entry.scenes.length} escenas)`);
  } catch (e) {
    entry.status = "error";
    console.warn(`[simCache] ⚠️ Error generando "${career}":`, e);
  }

  notify(career);
  active = null;
  processQueue();
}

function processQueue() {
  if (active) return;
  while (queue.length > 0) {
    const next = queue.shift()!;
    const e = cache.get(next);
    if (e && (e.status === "done" || e.status === "loading")) continue;
    void run(next);
    return;
  }
}

/** Encola el top-3 tras el test. Procesa una a la vez, empezando por la primera. */
export function enqueue(careers: string[]) {
  for (const c of careers) {
    if (!c) continue;
    const e = ensure(c);
    if (e.status === "idle" && !queue.includes(c)) queue.push(c);
  }
  console.log("[simCache] cola:", [...queue]);
  processQueue();
}

/** Devuelve la entrada actual y, si está en idle, la prioriza para generarse ya. */
export function getOrStart(career: string): Entry {
  const e = ensure(career);
  if (e.status === "idle") {
    queue = queue.filter((c) => c !== career);
    if (!active) {
      void run(career);
    } else {
      queue.unshift(career); // siguiente en cuanto termine la activa
    }
  }
  return e;
}

export function get(career: string): Entry | undefined {
  return cache.get(career);
}

/** Suscribe al modal a los cambios de una carrera (escenas que van llegando). */
export function subscribe(career: string, cb: () => void): () => void {
  let set = listeners.get(career);
  if (!set) {
    set = new Set();
    listeners.set(career, set);
  }
  set.add(cb);
  return () => set!.delete(cb);
}
