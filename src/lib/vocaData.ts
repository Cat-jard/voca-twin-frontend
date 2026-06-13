// Datos y lógica del test vocacional VocaTwin.
// Migrado fielmente desde "Voca Twin.dc.html".

export type FamKey =
  | "SAL" | "BME" | "CIV" | "ELE" | "SW" | "IND"
  | "BIZ" | "LAW" | "EDU" | "PSI" | "COM" | "ARQ";

export interface Career {
  n: string; // nombre completo
  c: string; // categoría
  d: string; // descripción
  p: string; // familia principal
  s: string; // familia secundaria
}

export interface QOption {
  t: string;
  f: string[];
}

export interface Question {
  title: string;
  options: QOption[];
}

export type CelebTheme = "fire" | "blue" | "violet" | "sun" | "party";

export interface Celeb {
  msg: string;
  sub: string;
  cta: string;
  theme: CelebTheme;
}

export interface ShownItem {
  key: string;
  name: string;
  cat: string;
  desc: string;
  short: string;
  pct: number;
  selected: boolean;
}

export interface Result {
  topKey: string;
  topName: string;
  topCat: string;
  topShort: string;
  topDesc: string;
  topPct: number;
  shown: ShownItem[];
}

export interface Particle {
  left: string;
  top: string;
  w: string;
  h: string;
  r: string;
  color: string;
  glow: string;
  anim: string;
  dur: string;
  delay: string;
}

export const CELEBS: Celeb[] = [
  { msg: "¡Genial!", sub: "Ronda 1 de 5 completa. Vas con todo.", cta: "Seguir →", theme: "fire" },
  { msg: "¡Sigue así!", sub: "Ronda 2 lista. Lo estás haciendo increíble.", cta: "Continuar →", theme: "blue" },
  { msg: "¡Vas a la mitad!", sub: "Ronda 3 completa. No pierdas el ritmo.", cta: "Seguir →", theme: "violet" },
  { msg: "¡Imparable!", sub: "Ronda 4 lista. Una más y terminas.", cta: "Última ronda →", theme: "sun" },
  { msg: "¡Felicidades!", sub: "Terminaste las 25 preguntas. Veamos tu resultado.", cta: "Ver mis resultados →", theme: "party" },
];

export const CAREERS: Record<string, Career> = {
  aero:        { n: "Ingeniería Aeronáutica", c: "Ingeniería", d: "Diseño, construcción y mantenimiento de aeronaves y sistemas de vuelo.", p: "CIV", s: "ELE" },
  auto:        { n: "Ingeniería Automotriz", c: "Ingeniería", d: "Diseño y desarrollo de vehículos, motores y sistemas de transporte.", p: "CIV", s: "ELE" },
  biomed:      { n: "Ingeniería Biomédica", c: "Ingeniería", d: "Tecnología y equipos al servicio de la medicina y la salud.", p: "BME", s: "SAL" },
  civil:       { n: "Ingeniería Civil", c: "Ingeniería", d: "Construcción de obras, estructuras e infraestructura que perdura.", p: "CIV", s: "ARQ" },
  electronica: { n: "Ingeniería Electrónica", c: "Ingeniería", d: "Circuitos, dispositivos y sistemas electrónicos inteligentes.", p: "ELE", s: "SW" },
  electrica:   { n: "Ingeniería Eléctrica y de Potencia", c: "Ingeniería", d: "Generación, transmisión y control de energía eléctrica.", p: "ELE", s: "CIV" },
  empresarial: { n: "Ingeniería Empresarial", c: "Ingeniería", d: "Une ingeniería y negocios para optimizar y dirigir organizaciones.", p: "BIZ", s: "IND" },
  industrial:  { n: "Ingeniería Industrial", c: "Ingeniería", d: "Optimización de procesos, productividad y mejora continua.", p: "IND", s: "BIZ" },
  mecatronica: { n: "Ingeniería Mecatrónica", c: "Ingeniería", d: "Robótica y automatización: mecánica, electrónica y software juntos.", p: "ELE", s: "SW" },
  mecanica:    { n: "Ingeniería Mecánica", c: "Ingeniería", d: "Diseño de máquinas, motores y sistemas mecánicos.", p: "CIV", s: "ELE" },
  minas:       { n: "Ingeniería de Minas", c: "Ingeniería", d: "Extracción responsable de recursos minerales y gestión de minas.", p: "CIV", s: "IND" },
  seguridad:   { n: "Ingeniería de Seguridad Industrial y Minera", c: "Ingeniería", d: "Prevención de riesgos y seguridad en industria y minería.", p: "IND", s: "CIV" },
  sistemas:    { n: "Ingeniería de Sistemas e Informática", c: "Ingeniería", d: "Infraestructura, datos y soluciones tecnológicas integrales.", p: "SW", s: "ELE" },
  software:    { n: "Ingeniería de Software", c: "Ingeniería", d: "Crear apps y productos digitales escalables que usan miles.", p: "SW", s: "ELE" },
  telecom:     { n: "Ingeniería de Telecomunicaciones", c: "Ingeniería", d: "Redes, señales y conectividad que comunican al mundo.", p: "ELE", s: "SW" },
  ambiental:   { n: "Ingeniería Ambiental", c: "Ingeniería", d: "Sostenibilidad, gestión de recursos y cuidado del medio ambiente.", p: "IND", s: "CIV" },
  banca:       { n: "Administración Banca y Finanzas", c: "Negocios", d: "Gestión financiera, inversiones y mercados de capital.", p: "BIZ", s: "IND" },
  admin:       { n: "Administración de Empresas", c: "Negocios", d: "Liderazgo, estrategia y dirección de organizaciones.", p: "BIZ", s: "IND" },
  hotelera:    { n: "Administración Hotelera y de Turismo", c: "Negocios", d: "Gestión de hoteles, turismo y experiencias de servicio.", p: "BIZ", s: "COM" },
  internacional: { n: "Administración de Negocios Internacionales", c: "Negocios", d: "Comercio global, exportación y estrategia entre mercados.", p: "BIZ", s: "COM" },
  marketing:   { n: "Administración y Marketing", c: "Negocios", d: "Marcas, mercados y estrategias para conectar con clientes.", p: "BIZ", s: "COM" },
  contabilidad:{ n: "Contabilidad", c: "Negocios", d: "Finanzas claras, control, auditoría y análisis numérico.", p: "BIZ", s: "IND" },
  economia:    { n: "Economía", c: "Negocios", d: "Análisis de mercados, política económica y toma de decisiones.", p: "BIZ", s: "LAW" },
  derecho:     { n: "Derecho", c: "Derecho", d: "Justicia, argumentación y dominio del marco legal.", p: "LAW", s: "BIZ" },
  edu_inicial: { n: "Educación Inicial", c: "Educación", d: "Acompañar el aprendizaje y desarrollo en la primera infancia.", p: "EDU", s: "PSI" },
  edu_primaria:{ n: "Educación Primaria", c: "Educación", d: "Formar a niños en sus primeros años escolares.", p: "EDU", s: "PSI" },
  psico:       { n: "Psicología", c: "Psicología", d: "Comportamiento humano, bienestar y salud mental.", p: "PSI", s: "SAL" },
  comunicacion:{ n: "Ciencias de la Comunicación", c: "Comunicaciones", d: "Medios, periodismo y narrativa para informar e inspirar.", p: "COM", s: "LAW" },
  publicidad:  { n: "Comunicación y Publicidad", c: "Comunicaciones", d: "Campañas, marcas y mensajes que mueven a la acción.", p: "COM", s: "BIZ" },
  disenodigital:{ n: "Diseño Digital Publicitario", c: "Comunicaciones", d: "Piezas visuales y digitales para marcas y campañas.", p: "COM", s: "ARQ" },
  disenografico:{ n: "Diseño Profesional Gráfico", c: "Comunicaciones", d: "Identidad visual, tipografía e imagen de marca.", p: "COM", s: "ARQ" },
  arquitectura:{ n: "Arquitectura", c: "Arquitectura", d: "Diseño de espacios, forma, estructura y función.", p: "ARQ", s: "CIV" },
  interiores:  { n: "Diseño Profesional de Interiores", c: "Arquitectura", d: "Espacios interiores funcionales, bellos y habitables.", p: "ARQ", s: "COM" },
  enfermeria:  { n: "Enfermería", c: "Salud", d: "Cuidado integral y atención directa a los pacientes.", p: "SAL", s: "PSI" },
  nutricion:   { n: "Nutrición y Dietética", c: "Salud", d: "Alimentación, salud y bienestar a través de la dieta.", p: "SAL", s: "BME" },
  obstetricia: { n: "Obstetricia", c: "Salud", d: "Acompañamiento del embarazo, parto y salud materna.", p: "SAL", s: "PSI" },
  terapia:     { n: "Tecnología Médica en Terapia Física y Rehabilitación", c: "Salud", d: "Recuperación del movimiento y la función del cuerpo.", p: "SAL", s: "PSI" },
  odontologia: { n: "Odontología", c: "Salud", d: "Salud bucal, diagnóstico y tratamiento dental.", p: "SAL", s: "BME" },
  farmacia:    { n: "Farmacia y Bioquímica", c: "Salud", d: "Medicamentos, química y bioquímica al servicio de la salud.", p: "SAL", s: "BME" },
  laboratorio: { n: "Tecnología Médica en Laboratorio Clínico y Anatomía Patológica", c: "Salud", d: "Análisis clínicos y diagnóstico de laboratorio.", p: "SAL", s: "BME" },
  medicina:    { n: "Medicina", c: "Medicina", d: "Diagnóstico, tratamiento y cuidado de la salud humana.", p: "SAL", s: "BME" },
};

export const SHORT: Record<string, string> = {
  aero: "Ing. Aeronáutica", auto: "Ing. Automotriz", biomed: "Ing. Biomédica", civil: "Ing. Civil",
  electronica: "Ing. Electrónica", electrica: "Ing. Eléctrica", empresarial: "Ing. Empresarial",
  industrial: "Ing. Industrial", mecatronica: "Ing. Mecatrónica", mecanica: "Ing. Mecánica",
  minas: "Ing. de Minas", seguridad: "Ing. Seguridad", sistemas: "Ing. de Sistemas", software: "Ing. de Software",
  telecom: "Ing. Telecom", ambiental: "Ing. Ambiental", banca: "Banca y Finanzas", admin: "Adm. de Empresas",
  hotelera: "Adm. Hotelera", internacional: "Negocios Internac.", marketing: "Adm. y Marketing",
  contabilidad: "Contabilidad", economia: "Economía", derecho: "Derecho", edu_inicial: "Educación Inicial",
  edu_primaria: "Educación Primaria", psico: "Psicología", comunicacion: "Cs. de la Comunicación",
  publicidad: "Comunic. y Publicidad", disenodigital: "Diseño Digital", disenografico: "Diseño Gráfico",
  arquitectura: "Arquitectura", interiores: "Diseño de Interiores", enfermeria: "Enfermería",
  nutricion: "Nutrición", obstetricia: "Obstetricia", terapia: "Terapia Física", odontologia: "Odontología",
  farmacia: "Farmacia y Bioquímica", laboratorio: "Laboratorio Clínico", medicina: "Medicina",
};

export const QUESTIONS: Question[] = [
  { title: "¿Qué área del conocimiento te genera más curiosidad genuina?", options: [
    { t: "Todo lo relacionado con física, energía, materiales y construcción", f: ["CIV", "ELE"] },
    { t: "La biología, química, el cuerpo humano y los seres vivos", f: ["SAL", "BME"] },
    { t: "La programación, los datos, las redes y los sistemas digitales", f: ["SW"] },
    { t: "Las personas, la sociedad, el lenguaje y la cultura", f: ["PSI", "EDU", "LAW"] },
    { t: "El diseño, la forma, el espacio y la comunicación visual", f: ["COM", "ARQ"] },
    { t: "La economía, los negocios, la estrategia y las organizaciones", f: ["BIZ"] },
  ]},
  { title: "¿Qué tipo de impacto quieres generar con tu trabajo?", options: [
    { t: "Mejorar la salud y salvar vidas directamente", f: ["SAL"] },
    { t: "Construir infraestructura, tecnología o sistemas que duren décadas", f: ["CIV", "ELE"] },
    { t: "Transformar organizaciones, mercados o economías", f: ["BIZ"] },
    { t: "Defender derechos, hacer justicia o cambiar leyes", f: ["LAW"] },
    { t: "Comunicar, inspirar o crear cultura visual", f: ["COM"] },
    { t: "Proteger el entorno, la seguridad o el medio ambiente", f: ["IND"] },
  ]},
  { title: "¿Qué materias del colegio se te daban mejor sin esforzarte mucho?", options: [
    { t: "Matemáticas y física", f: ["CIV", "ELE"] },
    { t: "Biología y química", f: ["SAL", "BME"] },
    { t: "Computación e informática", f: ["SW"] },
    { t: "Lenguaje, literatura e historia", f: ["LAW", "EDU"] },
    { t: "Arte, dibujo y educación visual", f: ["COM", "ARQ"] },
    { t: "Economía, gestión o matemática financiera", f: ["BIZ"] },
  ]},
  { title: "¿En qué tipo de entorno de trabajo te imaginas más cómodo/a?", options: [
    { t: "En campo: obras, minas, sitios de construcción al aire libre", f: ["CIV"] },
    { t: "En hospitales, clínicas o centros de atención médica", f: ["SAL"] },
    { t: "En oficinas, empresas o entidades financieras", f: ["BIZ"] },
    { t: "En estudios de diseño, agencias creativas o medios de comunicación", f: ["COM"] },
    { t: "En laboratorios, plantas industriales o talleres técnicos", f: ["IND", "ELE"] },
    { t: "En aulas, centros educativos o atendiendo personas directamente", f: ["EDU", "PSI"] },
  ]},
  { title: "¿Cómo describes tu forma natural de trabajar?", options: [
    { t: "Técnico/a y manual: me gusta usar equipos, máquinas y herramientas", f: ["ELE", "CIV"] },
    { t: "Analítico/a: me gustan los datos, los números y la lógica pura", f: ["SW", "BIZ"] },
    { t: "Con personas: escuchar, acompañar, enseñar o tratar a otros", f: ["PSI", "EDU", "SAL"] },
    { t: "Creativo/a: diseñar, imaginar, construir desde cero algo visual", f: ["COM", "ARQ"] },
    { t: "Estratégico/a: planificar, organizar, decisiones de largo plazo", f: ["BIZ"] },
    { t: "Normativo/a: aplicar reglas, protocolos, estándares y procedimientos", f: ["LAW", "IND"] },
  ]},
  { title: "¿Cómo reaccionas ante situaciones de alta presión o emergencia?", options: [
    { t: "Me activo, pienso rápido y soy muy efectivo/a bajo presión extrema", f: ["SAL"] },
    { t: "Funciono bien bajo presión técnica, aunque prefiero no arriesgar vidas", f: ["CIV", "ELE"] },
    { t: "Soy calmado/a: eso me ayuda a escuchar y decidir con claridad", f: ["PSI", "EDU"] },
    { t: "Prefiero entornos estables y predecibles para trabajar mejor", f: ["BIZ", "IND"] },
    { t: "Me adapto al nivel de presión que la situación requiera", f: ["COM"] },
    { t: "Prefiero evitar entornos de alto riesgo físico o vital", f: ["LAW"] },
  ]},
  { title: "Si tuvieras que resolver un problema ahora mismo, ¿cuál elegirías?", options: [
    { t: "Un sistema mecánico o eléctrico que no funciona", f: ["ELE", "CIV"] },
    { t: "Un paciente o persona que necesita atención", f: ["SAL"] },
    { t: "Un algoritmo, app o sistema de información con errores", f: ["SW"] },
    { t: "Un conflicto legal, social o comunicacional complejo", f: ["LAW", "COM"] },
    { t: "Un espacio o producto que necesita mejor diseño visual", f: ["ARQ", "COM"] },
    { t: "Un negocio, presupuesto o estrategia con pérdidas", f: ["BIZ"] },
  ]},
  { title: "¿Cuál de estas frases describe mejor tu motivación principal?", options: [
    { t: "Quiero curar enfermedades y mejorar la calidad de vida humana", f: ["SAL"] },
    { t: "Quiero construir cosas que duren: edificios, máquinas, redes", f: ["CIV", "ELE"] },
    { t: "Quiero entender y transformar la economía o los mercados", f: ["BIZ"] },
    { t: "Quiero proteger derechos, educar o cambiar la sociedad", f: ["LAW", "EDU"] },
    { t: "Quiero crear ideas, marcas, imágenes o experiencias que emocionen", f: ["COM"] },
    { t: "Quiero liderar organizaciones y generar impacto económico y empleo", f: ["BIZ"] },
  ]},
  { title: "¿Qué habilidad destacarían tus profesores o amigos en ti?", options: [
    { t: "Razonamiento lógico y matemático", f: ["SW", "ELE"] },
    { t: "Creatividad e imaginación visual", f: ["COM", "ARQ"] },
    { t: "Empatía, escucha activa y apoyo emocional", f: ["PSI", "SAL", "EDU"] },
    { t: "Organización, precisión y atención al detalle", f: ["IND"] },
    { t: "Liderazgo, comunicación y capacidad de convencer", f: ["BIZ"] },
    { t: "Curiosidad científica y pensamiento investigador", f: ["BME", "SAL"] },
  ]},
  { title: "¿Cómo te relacionas con los números y el análisis cuantitativo?", options: [
    { t: "Me encantan: cálculo, estadística, simulaciones numéricas", f: ["SW", "ELE"] },
    { t: "Los manejo bien como herramienta, no son mi pasión", f: ["CIV", "IND"] },
    { t: "Los uso lo indispensable, prefiero el razonamiento cualitativo", f: ["LAW"] },
    { t: "Prefiero trabajar con personas, relaciones e ideas abstractas", f: ["PSI", "EDU"] },
    { t: "Prefiero trabajar con formas, espacios y composiciones visuales", f: ["ARQ", "COM"] },
    { t: "Prefiero trabajar con organismos, reacciones o procesos naturales", f: ["SAL", "BME"] },
  ]},
  { title: "¿Cómo prefieres trabajar la mayor parte del tiempo?", options: [
    { t: "Solo/a, con concentración profunda y autonomía", f: ["SW"] },
    { t: "En equipo técnico pequeño y especializado", f: ["ELE", "BME"] },
    { t: "Con muchas personas: pacientes, alumnos, clientes, público", f: ["SAL", "EDU"] },
    { t: "Liderando equipos y tomando decisiones estratégicas", f: ["BIZ"] },
    { t: "En terreno, campo o entornos variados y no rutinarios", f: ["CIV"] },
    { t: "Mezclando trabajo creativo individual con colaboración", f: ["COM", "ARQ"] },
  ]},
  { title: "¿Cuánta responsabilidad estás dispuesto/a a asumir?", options: [
    { t: "Máxima: decisiones críticas donde está en juego la vida de personas", f: ["SAL"] },
    { t: "Alta: decisiones técnicas de gran impacto pero no de vida o muerte", f: ["CIV", "ELE"] },
    { t: "Media: contribuir como experto/a sin ser el único responsable", f: ["IND"] },
    { t: "Quiero ser el mejor experto/a de mi área sin gestionar equipos", f: ["SW"] },
    { t: "Quiero liderar organizaciones completas o crear mi empresa", f: ["BIZ"] },
    { t: "No lo tengo claro todavía, me adapto", f: ["COM"] },
  ]},
  { title: "¿Cuánto te importa el nivel de ingresos al elegir tu carrera?", options: [
    { t: "Es la prioridad principal: quiero uno de los salarios más altos", f: ["SAL", "BIZ"] },
    { t: "Importa mucho, pero junto con un trabajo que me apasione", f: ["ELE"] },
    { t: "Prefiero vocación sobre salario, aunque gane lo suficiente", f: ["EDU", "PSI"] },
    { t: "Busco equilibrio: buena remuneración sin sacrificar calidad de vida", f: ["IND"] },
    { t: "Priorizo la estabilidad y seguridad laboral sobre el salario", f: ["EDU"] },
    { t: "Quiero crear mi propio negocio y generar riqueza propia", f: ["BIZ"] },
  ]},
  { title: "¿Cuántos años de estudio estás dispuesto/a a invertir?", options: [
    { t: "7 o más años: quiero la carrera más completa y de mayor prestigio", f: ["SAL"] },
    { t: "5-6 años: una carrera universitaria completa es lo que busco", f: ["CIV", "ELE"] },
    { t: "4-5 años: eficiencia sin sacrificar calidad académica", f: ["BIZ", "SW"] },
    { t: "No importa si las oportunidades laborales son excelentes", f: ["ELE"] },
    { t: "Quiero poder trabajar mientras estudio desde temprano", f: ["COM"] },
    { t: "Prefiero la carrera más corta que me dé salida laboral rápida", f: ["EDU"] },
  ]},
  { title: "¿Dónde te visualizas trabajando en 10 años?", options: [
    { t: "En una empresa multinacional o corporación global", f: ["BIZ"] },
    { t: "En el sector público: hospital, colegio, municipio o estado", f: ["SAL", "EDU"] },
    { t: "Como consultor/a o profesional independiente con mis propios clientes", f: ["PSI", "LAW"] },
    { t: "En una startup o empresa de tecnología e innovación", f: ["SW"] },
    { t: "En el extranjero o con proyectos internacionales", f: ["BIZ", "CIV"] },
    { t: "Fundando y dirigiendo mi propia empresa", f: ["BIZ"] },
  ]},
  { title: "¿Qué tipo de actividad extracurricular has disfrutado más?", options: [
    { t: "Robótica, electrónica, programación o ferias de ciencias", f: ["SW", "ELE"] },
    { t: "Voluntariado en salud, trabajo social o tutorías académicas", f: ["SAL", "EDU", "PSI"] },
    { t: "Debates, moot court, periodismo estudiantil u oratoria", f: ["LAW", "COM"] },
    { t: "Arte, fotografía, diseño, teatro o medios audiovisuales", f: ["COM", "ARQ"] },
    { t: "Liderazgo estudiantil, deportes en equipo o emprendimientos", f: ["BIZ"] },
    { t: "Proyectos de negocio, ferias de emprendimiento o finanzas", f: ["BIZ"] },
  ]},
  { title: "Cuando algo importante falla, ¿cuál es tu reacción natural?", options: [
    { t: "Analizo metódicamente qué falló y corrijo con un plan claro", f: ["IND", "SW"] },
    { t: "Me frustro un momento, pero sigo con más energía que antes", f: ["CIV"] },
    { t: "Consulto con mi equipo y buscamos la solución juntos", f: ["EDU", "PSI"] },
    { t: "Busco una solución alternativa creativa e innovadora", f: ["COM", "SW"] },
    { t: "Reviso normas, protocolos y estándares para identificar la causa", f: ["LAW", "IND"] },
    { t: "Lo tomo con calma, reflexiono y vuelvo a intentarlo con paciencia", f: ["SAL", "EDU"] },
  ]},
  { title: "¿Qué sector te parece más relevante para el futuro del mundo?", options: [
    { t: "Tecnología: inteligencia artificial, ciberseguridad y software", f: ["SW"] },
    { t: "Salud y biotecnología: medicina personalizada, genómica", f: ["SAL", "BME"] },
    { t: "Sostenibilidad: energías renovables, medio ambiente y minería responsable", f: ["IND", "CIV"] },
    { t: "Economía digital: fintech, comercio global, criptomonedas", f: ["BIZ"] },
    { t: "Educación y desarrollo humano: psicología, pedagogía y bienestar", f: ["EDU", "PSI"] },
    { t: "Infraestructura e industria: manufactura avanzada, construcción, aviación", f: ["CIV", "ELE"] },
  ]},
  { title: "¿Cómo aprendes mejor las cosas nuevas?", options: [
    { t: "Practicando directamente: armando, tocando y experimentando", f: ["CIV", "ELE"] },
    { t: "Leyendo, investigando y elaborando mis propias conclusiones", f: ["LAW"] },
    { t: "Programando, resolviendo ejercicios en pantalla o con simuladores", f: ["SW"] },
    { t: "Debatiendo, escuchando experiencias y aprendiendo de otros", f: ["PSI", "COM"] },
    { t: "Dibujando, maquetando, visualizando o creando prototipos", f: ["ARQ", "COM"] },
    { t: "En laboratorio, con experimentos, muestras y análisis científico", f: ["SAL", "BME"] },
  ]},
  { title: "¿Cuál de estos proyectos te gustaría liderar?", options: [
    { t: "Desarrollar un sistema de IA o aplicación que use millones de personas", f: ["SW"] },
    { t: "Diseñar y construir un aeropuerto, puente o planta de energía", f: ["CIV", "ELE"] },
    { t: "Crear una campaña que cambie la percepción de una marca o causa social", f: ["COM"] },
    { t: "Investigar y desarrollar un tratamiento o medicamento nuevo", f: ["SAL", "BME"] },
    { t: "Fundar y escalar una empresa que genere cientos de empleos", f: ["BIZ"] },
    { t: "Diseñar un hospital, escuela, vivienda social o espacio público", f: ["ARQ"] },
  ]},
  { title: "¿Qué frase te describe mejor como persona?", options: [
    { t: "Soy muy metódico/a, me gustan las reglas claras y la precisión", f: ["IND", "LAW"] },
    { t: "Soy curioso/a y siempre necesito entender el porqué de las cosas", f: ["BME", "SAL"] },
    { t: "Soy empático/a y me importa mucho el bienestar de los demás", f: ["PSI", "SAL", "EDU"] },
    { t: "Soy ambicioso/a y me motivan las metas grandes y los logros", f: ["BIZ"] },
    { t: "Soy creativo/a y me incomoda hacer siempre lo mismo", f: ["COM", "ARQ"] },
    { t: "Soy práctico/a: valoro los resultados concretos y tangibles", f: ["CIV", "ELE"] },
  ]},
  { title: "¿Qué tan cómodo/a te sientes con la tecnología digital?", options: [
    { t: "Soy apasionado/a: siempre al día con lo último en tech", f: ["SW"] },
    { t: "La domino bien para lo que necesito en mi trabajo", f: ["ELE"] },
    { t: "La uso lo necesario, pero no es lo que más me atrae", f: ["EDU", "PSI"] },
    { t: "Me interesa cómo la tecnología transforma la medicina y la salud", f: ["BME", "SAL"] },
    { t: "Me interesa cómo la tecnología mejora los negocios y mercados", f: ["BIZ"] },
    { t: "Me interesa cómo la tecnología transforma estructuras físicas y ciudades", f: ["CIV", "ARQ"] },
  ]},
  { title: "¿Cuál de estos problemas del mundo actual te parece más urgente resolver?", options: [
    { t: "La crisis de salud mental y bienestar psicológico en jóvenes", f: ["PSI"] },
    { t: "La brecha tecnológica y la exclusión digital en países en desarrollo", f: ["SW"] },
    { t: "El cambio climático y la destrucción de ecosistemas", f: ["IND"] },
    { t: "La corrupción, la injusticia y la desigualdad social", f: ["LAW"] },
    { t: "La falta de infraestructura: hospitales, vivienda, carreteras", f: ["CIV", "ARQ"] },
    { t: "La competitividad económica y la generación de empleo", f: ["BIZ"] },
  ]},
  { title: "¿Cuál de estas actividades realizarías en un día ideal de trabajo?", options: [
    { t: "Diseñar planos, modelos 3D o esquemas de construcción", f: ["ARQ", "CIV"] },
    { t: "Atender pacientes, hacer diagnósticos o procedimientos clínicos", f: ["SAL"] },
    { t: "Escribir código, depurar algoritmos o diseñar arquitecturas de software", f: ["SW"] },
    { t: "Negociar contratos, presentar propuestas o analizar mercados globales", f: ["BIZ"] },
    { t: "Crear piezas gráficas, campañas visuales o conceptos de marca", f: ["COM"] },
    { t: "Supervisar procesos en planta, analizar fallas o gestionar la seguridad", f: ["IND", "ELE"] },
  ]},
  { title: "Si pudieras ver un documental ahora mismo, ¿cuál elegirías?", options: [
    { t: "Cómo se construyen aviones, cohetes o infraestructura de gran escala", f: ["CIV"] },
    { t: "Descubrimientos médicos, epidemias o el futuro de la biotecnología", f: ["SAL", "BME"] },
    { t: "Grandes emprendedores, economías globales o el mundo de las finanzas", f: ["BIZ"] },
    { t: "Diseño, arquitectura, ciudades del futuro o grandes marcas", f: ["ARQ", "COM"] },
    { t: "Justicia social, psicología humana, educación o derechos humanos", f: ["LAW", "PSI", "EDU"] },
    { t: "Inteligencia artificial, ciberseguridad o el futuro digital", f: ["SW"] },
  ]},
];

export function particlesFor(theme: CelebTheme): Particle[] {
  const cfg = (
    {
      fire:   { colors: ["#FFC53D", "#FF8A2A", "#FF395C", "#FFE08A"], anim: "vtEmber", round: true },
      blue:   { colors: ["#3DDCDA", "#9FE8FF", "#0661FC", "#FFFFFF"], anim: "vtEmber", round: true },
      violet: { colors: ["#C77DFF", "#E0AAFF", "#7B2CBF", "#FFFFFF"], anim: "vtEmber", round: true },
      sun:    { colors: ["#FFD23F", "#FF8A2A", "#FFE08A", "#FFFFFF"], anim: "vtEmber", round: true },
      party:  { colors: ["#FF395C", "#3DDCDA", "#0661FC", "#FFD23F"], anim: "vtConfetti", round: false },
    } as const
  )[theme] || { colors: ["#fff"], anim: "vtEmber", round: true };

  const arr: Particle[] = [];
  for (let i = 0; i < 26; i++) {
    const sz = 6 + Math.round(Math.random() * 9);
    const color = cfg.colors[i % cfg.colors.length];
    arr.push({
      left: (Math.random() * 100).toFixed(1) + "%",
      top: cfg.round ? (56 + Math.random() * 46).toFixed(0) + "%" : "-5%",
      w: sz + "px",
      h: (cfg.round ? sz : Math.round(sz * 1.7)) + "px",
      r: cfg.round ? "50%" : "2px",
      color: color,
      glow: cfg.round ? "0 0 10px " + color : "none",
      anim: cfg.anim,
      dur: (2.6 + Math.random() * 2.6).toFixed(2) + "s",
      delay: (Math.random() * 2.6).toFixed(2) + "s",
    });
  }
  return arr;
}

export function computeResult(answers: Record<number, number>): Result {
  const fam: Record<string, number> = {
    SAL: 0, BME: 0, CIV: 0, ELE: 0, SW: 0, IND: 0,
    BIZ: 0, LAW: 0, EDU: 0, PSI: 0, COM: 0, ARQ: 0,
  };
  QUESTIONS.forEach((q, qi) => {
    const oi = answers[qi];
    if (oi == null) return;
    (q.options[oi].f || []).forEach((k) => {
      if (fam[k] != null) fam[k] += 1;
    });
  });
  const keys = Object.keys(CAREERS);
  const scored = keys
    .map((k, idx) => {
      const c = CAREERS[k];
      const sc = (fam[c.p] || 0) * 1.0 + (fam[c.s] || 0) * 0.5 + idx * 0.0001;
      return { key: k, score: sc };
    })
    .sort((a, b) => b.score - a.score);
  const topScore = scored[0].score || 1;
  const shown: ShownItem[] = scored.slice(0, 5).map((r, i) => {
    const c = CAREERS[r.key];
    // base afinidad por puntaje + separación por ranking (evita que todo empate visualmente)
    let pct = Math.round(50 + (r.score / topScore) * 47) - i * 3;
    pct = Math.max(38, Math.min(98, pct));
    if (i === 0) pct = Math.min(98, Math.max(pct, 93));
    return { key: r.key, name: c.n, cat: c.c, desc: c.d, short: SHORT[r.key] || c.n, pct, selected: i < 3 };
  });
  const top = shown[0];
  return {
    topKey: top.key,
    topName: top.name,
    topCat: top.cat,
    topShort: top.short,
    topDesc: top.desc,
    topPct: top.pct,
    shown,
  };
}
