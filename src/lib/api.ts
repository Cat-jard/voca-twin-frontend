// "/proxy" → rewrite en next.config.ts → http://localhost:9000 (server-side, sin CORS)
const BASE = "/proxy";

// ── Tipos que reflejan los DTOs del backend ────────────────────────────────

export interface ApiOption {
  id: number;
  optionLetter: string;
  optionText: string;
}

export interface ApiQuestion {
  id: number;
  questionOrder: number;
  questionText: string;
  options: ApiOption[];
}

export interface ApiCareer {
  id: number;
  name: string;
}

export interface AnswerRequest {
  questionId: number;
  optionId: number;
}

export interface CareerResult {
  careerId: number;
  careerName: string;
  score: number;
}

// ── Llamadas al backend vía API Gateway ───────────────────────────────────

export async function fetchQuestions(): Promise<ApiQuestion[]> {
  const res = await fetch(`${BASE}/api/questions`);
  if (!res.ok) throw new Error(`fetchQuestions: ${res.status}`);
  return res.json();
}

export async function fetchCareers(): Promise<ApiCareer[]> {
  const res = await fetch(`${BASE}/api/careers`);
  if (!res.ok) throw new Error(`fetchCareers: ${res.status}`);
  return res.json();
}

export interface TikTokRecommendation {
  id: string;
  career: string;
  tiktokUrl: string;
}

export async function fetchTikTok(career: string): Promise<TikTokRecommendation> {
  const res = await fetch(`${BASE}/api/recommendations/search?career=${encodeURIComponent(career)}`);
  if (!res.ok) throw new Error(`fetchTikTok: ${res.status}`);
  return res.json();
}

export async function submitTest(answers: AnswerRequest[]): Promise<CareerResult[]> {
  const res = await fetch(`${BASE}/api/recommendation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error(`submitTest: ${res.status}`);
  return res.json();
}

// ── Autenticación (servicio 'usuarios') ───────────────────────────────────

export interface AuthUser {
  idUsuario: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  tipo: string;
  token: string | null;
}

/** Lee el token JWT guardado tras el login (para endpoints protegidos). */
function getToken(): string | null {
  try { return localStorage.getItem("vt_token"); } catch { return null; }
}

/** Headers con Authorization: Bearer si hay sesión. */
function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${BASE}/usuarios/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`login: ${res.status}`);
  return res.json();
}

/**
 * Registro simple: el backend exige nombre/apellido/DNI(8)/password(8+), así que
 * derivamos nombre/apellido del email y generamos un DNI dummy de 8 dígitos.
 * Tras registrar, hace auto-login para obtener el token + userId.
 */
export async function registerUser(email: string, password: string): Promise<AuthUser> {
  const localPart = (email.split("@")[0] || "alumno").replace(/[^a-zA-Z]/g, "") || "alumno";
  const nombre = (localPart.charAt(0).toUpperCase() + localPart.slice(1)).slice(0, 100) || "Alumno";
  const dni = String(Math.floor(10_000_000 + Math.random() * 89_999_999)); // 8 dígitos

  const res = await fetch(`${BASE}/usuarios/registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, apellido: "VocaTwin", dni, email, password }),
  });
  if (!res.ok && res.status !== 409) throw new Error(`registro: ${res.status}`);
  // 201 (creado) o 409 (ya existe) → en ambos casos intentamos login.
  return loginUser(email, password);
}

// ── Persistencia de carreras/historias por usuario (vocatwin, vía gateway) ──

export interface SaveCareerItem {
  career: string;
  pct: number;
  simulationId?: string;
}

export interface UserCareerScene {
  year: number;
  narrative: string;
  imageUrl: string;
}

export interface UserCareer {
  career: string;
  pct: number;
  chosen: boolean;
  simulationId: string | null;
  createdAt: string | null;
  scenes: UserCareerScene[];
}

export async function saveUserCareers(userId: number, items: SaveCareerItem[]): Promise<void> {
  const res = await fetch(`${BASE}/api/simulation/save`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ userId, items }),
  });
  if (!res.ok) throw new Error(`saveUserCareers: ${res.status}`);
}

export async function chooseUserCareer(userId: number, item: SaveCareerItem): Promise<void> {
  const res = await fetch(`${BASE}/api/simulation/choose`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ userId, ...item }),
  });
  if (!res.ok) throw new Error(`chooseUserCareer: ${res.status}`);
}

export async function getUserCareers(userId: number): Promise<UserCareer[]> {
  const res = await fetch(`${BASE}/api/simulation/user/${userId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`getUserCareers: ${res.status}`);
  return res.json();
}

// ── Perfil de usuario (servicio 'usuarios', vía gateway con Bearer) ─────────

export interface UpdateUserInput {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
}

export async function getUser(id: number): Promise<AuthUser> {
  const res = await fetch(`${BASE}/usuarios/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`getUser: ${res.status}`);
  return res.json();
}

export async function getAllUsers(): Promise<AuthUser[]> {
  const res = await fetch(`${BASE}/usuarios/all`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`getAllUsers: ${res.status}`);
  return res.json();
}

export async function updateUser(id: number, data: UpdateUserInput): Promise<AuthUser> {
  const res = await fetch(`${BASE}/usuarios/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`updateUser: ${res.status}`);
  return res.json();
}
