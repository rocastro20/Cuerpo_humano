/*
 * Cuerpo adentro · orquestación general.
 */
import './styles.css';
import Lenis from 'lenis';
import gsap from 'gsap';
import * as c from './content.js';
import { construirPagina } from './ui/panels.js';
import { crearHUD } from './ui/hud.js';
import { crearCursor } from './ui/cursor.js';
import { cursorSVG } from './illustrations.js';
import { crearAudio } from './audio/audio.js';
import { crearNarrador } from './audio/narrator.js';
import { iniciarSimuladores } from './ui/sims.js';
import { iniciarQuiz } from './ui/quiz.js';
import { crearBitacora } from './ui/logbook.js';
import { iniciarVideo } from './video/player.js';
import { crearMundo, COLORES_ESTACION } from './scene/world.js';
import { crearInteraccion } from './scene/interact.js';

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducido) document.documentElement.classList.add('movimiento-reducido');

const IDS = ['inicio', ...c.paradas.map((p) => p.id), 'final'];
const VERBOS = [c.introduccion.verbo, ...c.paradas.map((p) => p.verbo), c.conclusion.verbo];
const NOMBRES = ['Introducción', ...c.paradas.map((p) => `${p.verbo}: ${p.sistema.toLowerCase()}`), 'Conclusión: el gol'];
const BLOQUES = { inicio: c.introduccion, final: c.conclusion, ...Object.fromEntries(c.paradas.map((p) => [p.id, p])) };
const SONIDO_SORPRESA = ['crujido', 'burbujas', 'respiro', 'latido', 'chispa', 'estiron', 'gol'];

const estado = { narracion: false, quiz: null, lpm: null, lpmMedido: false };

/* ── Fondo con grano procedural ── */
if (window.TEXTURAS?.grano) document.body.style.setProperty('--grano', `url(${window.TEXTURAS.grano})`);

/* ── Cargador con progreso real ── */
const cargadorEl = document.getElementById('cargador');
cargadorEl.innerHTML = `<div class="carga-caja">
  <p class="institucion">${c.proyecto.institucion} · ${c.proyecto.unidad}</p>
  <h1 id="cargador-titulo">${c.proyecto.titulo}</h1>
  <p class="bajada">${c.proyecto.subtitulo}</p>
  <div class="barra-carga" role="progressbar" aria-label="Cargando el viaje" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>
  <div class="estado-carga"><span data-paso>Preparando…</span><span data-pct>0 %</span></div>
  <div class="botones-inicio" hidden>
    <button type="button" class="boton-principal" data-iniciar="sonido">Comenzar con narración y música</button>
    <button type="button" class="boton-secundario" data-iniciar="silencio">Comenzar en silencio</button>
  </div>
  <p class="carga-nota">Un viaje de unos ${c.proyecto.duracionMinutos} minutos. Si estás en clase, usa audífonos. Puedes cambiar el sonido en cualquier momento.</p>
</div>`;
const barraCarga = cargadorEl.querySelector('.barra-carga');
function progreso(p, texto) {
  const v = Math.round(p * 100);
  barraCarga.querySelector('span').style.width = `${v}%`;
  barraCarga.setAttribute('aria-valuenow', v);
  cargadorEl.querySelector('[data-pct]').textContent = `${v} %`;
  if (texto) cargadorEl.querySelector('[data-paso]').textContent = texto;
}

/* ── Utilidades ── */
const avisoEl = document.getElementById('aviso');
let avisoT = null;
function avisar(texto) {
  avisoEl.textContent = texto;
  avisoEl.classList.add('ver');
  clearTimeout(avisoT);
  avisoT = setTimeout(() => avisoEl.classList.remove('ver'), 2800);
}
const subEl = document.getElementById('subtitulos');
function subtitulo(texto) { subEl.innerHTML = texto ? `<span>${texto.replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]))}</span>` : ''; }

async function iniciar() {
  const main = document.getElementById('contenido');
  const canvas = document.getElementById('escena');

  progreso(0.03, 'Construyendo las paradas…');
  construirPagina(main, c);

  progreso(0.08, 'Cargando tipografías…');
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load("800 100px 'Bricolage Grotesque Variable'"),
        document.fonts.load("italic 20px 'Instrument Serif'"),
        document.fonts.load("20px 'Instrument Serif'"),
      ]),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  } catch { /* fuentes de respaldo */ }
  progreso(0.16, 'Generando texturas y órganos 3D…');

  let mundo;
  try {
    mundo = await crearMundo(canvas, { reducido, alProgreso: (p) => progreso(0.16 + p * 0.64, p < 0.6 ? 'Construyendo los órganos…' : 'Compilando la escena…') });
  } catch (err) {
    console.error(err);
    cargadorEl.querySelector('[data-paso]').textContent = 'Tu navegador no pudo iniciar el 3D. El contenido sigue disponible.';
    mundo = null;
  }

  progreso(0.84, 'Preparando el video…');
  const audio = crearAudio();
  const video = iniciarVideo(main, c.video);

  progreso(0.9, 'Buscando una voz en español…');
  await new Promise((r) => {
    if (!('speechSynthesis' in window) || speechSynthesis.getVoices().length) return r();
    speechSynthesis.addEventListener?.('voiceschanged', r, { once: true });
    setTimeout(r, 900);
  });

  /* ── Narración ── */
  const narrador = crearNarrador({
    alSubtitulo: subtitulo,
    alCambio(id, hablando) {
      main.querySelectorAll(`[data-narrar]`).forEach((b) => {
        const on = hablando && b.dataset.narrar === id;
        b.setAttribute('aria-pressed', String(on));
        b.querySelector('span').textContent = on ? 'Detener la narración' : 'Escuchar la narración';
      });
    },
  });
  function narrar(id) {
    const b = BLOQUES[id];
    const r = narrador.decir(id, b.narracion, { audio: b.audio || null });
    if (r === 'sin-voz' && !narrar.avisado) { narrar.avisado = true; avisar('Tu navegador no tiene voz en español: verás los subtítulos.'); }
  }

  /* ── Bitácora, HUD y cursor ── */
  const hud = crearHUD(document.getElementById('hud'), {
    c, verbos: VERBOS, nombres: NOMBRES, colores: COLORES_ESTACION,
    alIr: (i) => irA(i),
    alNarracion: (on) => { estado.narracion = on; hud.narracion(on); if (on) { if (!lejos) narrar(IDS[actual]); } else narrador.detener(); },
    alMusica: (on) => { audio.musica(on); audio.efectos(on); hud.musica(on); },
    alBitacora: () => bitacora.abrir(),
  });
  const bitacora = crearBitacora({ c, estado, audio, avisar, alCambiar: (v) => hud.sellos(v, IDS) });
  hud.sellos(bitacora.visitadas, IDS);
  const cursor = crearCursor(document.getElementById('cursor'), cursorSVG);

  /* ── Simuladores y quiz ── */
  const sims = iniciarSimuladores({ raiz: main, c, mundo: mundo || { datos: {}, impulsoNervioso() {} }, audio, estado, avisar });
  iniciarQuiz({ raiz: main, preguntas: c.quiz, audio, estado, alTerminar: (p) => bitacora.guardarQuiz(p), abrirBitacora: () => bitacora.abrir() });

  /* ── Desplazamiento suave y anclas de cada parada ── */
  const lenis = reducido ? null : new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
  if (lenis) lenis.stop();
  const secciones = IDS.map((id) => document.getElementById(id));
  let anclas = [];
  const medir = () => {
    anclas = secciones.map((s) => { const r = s.getBoundingClientRect(); const a = r.top + window.scrollY; return [a, a + r.height]; });
  };
  medir();
  new ResizeObserver(medir).observe(main);

  function tDesdeScroll() {
    const centro = window.scrollY + window.innerHeight * 0.5;
    for (let i = 0; i < anclas.length; i++) {
      const [a, b] = anclas[i];
      if (centro < a) {
        if (i === 0) return 0;
        const bPrev = anclas[i - 1][1];
        const f = (centro - bPrev) / Math.max(1, a - bPrev);
        return reducido ? (f < 0.5 ? i - 1 : i) : i - 1 + Math.min(1, Math.max(0, f));
      }
      if (centro <= b) return i;
    }
    return anclas.length - 1;
  }
  function irA(i, alTerminar) {
    const destino = i === 0 ? 0 : Math.max(0, anclas[i][0] - window.innerHeight * 0.3);
    const fin = () => { secciones[i].querySelector('h1, h2')?.setAttribute('tabindex', '-1'); secciones[i].querySelector('h1, h2')?.focus({ preventScroll: true }); alTerminar?.(); };
    if (lenis) lenis.scrollTo(destino, { duration: 2.2, onComplete: fin });
    else { window.scrollTo({ top: destino, behavior: 'auto' }); setTimeout(fin, 60); }
  }
  main.querySelectorAll('[data-ir]').forEach((a) =>
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const el = document.getElementById(a.dataset.ir);
      if (lenis) lenis.scrollTo(el, { offset: -80, duration: 1.6 }); else el.scrollIntoView();
    })
  );

  /* ── Sorpresas ── */
  function sorpresa(i) {
    mundo?.sorpresa(i);
    audio.fx[SONIDO_SORPRESA[i]]?.(i === 3 ? 1.6 : undefined);
    if (i === 0) avisar('¡Carbohidratos, proteínas y grasas: el combustible del viaje!');
  }
  main.querySelectorAll('[data-sorpresa]').forEach((b) =>
    b.addEventListener('click', () => {
      const i = +b.dataset.sorpresa;
      if (i === actual) sorpresa(i); else irA(i, () => sorpresa(i));
    })
  );
  main.querySelectorAll('[data-narrar]').forEach((b) =>
    b.addEventListener('click', () => {
      if (b.getAttribute('aria-pressed') === 'true') narrador.detener(); else narrar(b.dataset.narrar);
    })
  );
  if (mundo) mundo.alGol = () => { audio.fx.gol(); avisar('¡Goool de Sofía! Cinco sistemas, un equipo.'); };

  const interaccion = mundo
    ? crearInteraccion({ canvas, mundo, cursor, verbos: VERBOS, estacionActual: () => actual, alViajar: (i) => irA(i), alSorpresa: sorpresa })
    : { cuadro() {} };

  /* ── Palabra gigante detrás del objeto ── */
  const palabra = document.querySelector('#palabra span');
  let palabraActual = -1;
  function ajustarPalabra(i) {
    palabra.textContent = VERBOS[i];
    palabra.style.fontSize = '100px';
    palabra.style.setProperty('--palabra-ancho', 100);
    const w = palabra.getBoundingClientRect().width || 1;
    const porAncho = (window.innerWidth * 0.94) / (w / 100);
    const porAlto = window.innerHeight * (i === 6 ? 0.62 : 0.42);
    palabra.style.fontSize = `${Math.min(porAncho, porAlto)}px`;
    palabra.style.setProperty('--palabra-color', COLORES_ESTACION[i]);
  }

  /* ── Llegadas a cada parada ── */
  let actual = 0, lejos = false;
  function alLlegar(i) {
    actual = i;
    hud.estacion(i);
    bitacora.sellar(IDS[i]);
    audio.estacion(i);
    if (i !== 2 && i !== 3) sims.detenerSonificacion();
    if (estado.narracion && !lejos) narrar(IDS[i]);
  }
  hud.estacion(0);

  /* ── Bucle principal ── */
  let latidos = 0, ultimo = performance.now(), ultimoHUD = 0, alterna = 0;
  const intro = main.querySelector('[data-latidos]');
  function cuadro() {
    const ahora = performance.now();
    const dt = Math.min(0.05, (ahora - ultimo) / 1000);
    const real = (ahora - ultimo) / 1000;
    ultimo = ahora;

    const tObj = tDesdeScroll();
    const finFinal = anclas[anclas.length - 1][1];
    const nuevoLejos = window.scrollY + window.innerHeight * 0.55 > finFinal;
    if (nuevoLejos !== lejos) { lejos = nuevoLejos; document.body.classList.toggle('lejos', lejos); if (lejos) narrador.detener(); }

    let t = tObj, peso = 1, escritorio = window.innerWidth >= 900;
    if (mundo) {
      mundo.tObjetivo = tObj;
      // Lejos (quiz y créditos) se dibuja a menos cuadros por segundo
      if (!lejos || (alterna++ % 3 === 0)) ({ t, peso, escritorio } = mundo.actualizar(lejos ? dt * 3 : dt, Math.min(0.2, real)));
      else t = mundo.t;
      interaccion.cuadro(reducido);
    }
    const n = Math.round(t), d = Math.abs(t - n);
    if (d < 0.08 && n !== actual) alLlegar(n);
    if (d > 0.3 && narrador.hablando && narrador.hablando === IDS[actual]) narrador.detener();

    if (n !== palabraActual) { palabraActual = n; ajustarPalabra(n); }
    const opacidad = Math.max(0, 1 - d * 2.8) * (n === 0 ? 0 : n === 6 ? 0.12 : 0.24);
    palabra.style.opacity = opacidad.toFixed(3);
    palabra.style.setProperty('--palabra-ancho', (75 + 25 * Math.max(0, 1 - d * 3.2)).toFixed(1));
    palabra.style.setProperty('--palabra-y', escritorio ? '0px' : `${(-20 * peso).toFixed(1)}vh`);
    palabra.style.setProperty('--palabra-x', escritorio && n > 0 && n < 6 ? `${(9 * peso).toFixed(1)}vw` : '0px');

    const lpm = estado.lpm || c.proyecto.pulsoReferencia;
    latidos += (lpm / 60) * real;
    if (ahora - ultimoHUD > 250) {
      ultimoHUD = ahora;
      hud.latidos(latidos, lpm, estado.lpmMedido);
      if (intro) intro.textContent = Math.floor(latidos).toLocaleString('es-CO');
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      hud.progreso(maxScroll > 0 ? window.scrollY / maxScroll : 0);
    }
  }

  /* ── Teclado: flechas ← → cambian de parada ── */
  window.addEventListener('keydown', (ev) => {
    if (ev.defaultPrevented || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    const t = ev.target;
    if (t.closest?.('input, textarea, select, [contenteditable], dialog[open], video')) return;
    if (ev.key === 'ArrowRight') { ev.preventDefault(); irA(Math.min(6, Math.max(0, actual) + (lejos ? 0 : 1))); }
    if (ev.key === 'ArrowLeft') { ev.preventDefault(); irA(Math.max(0, lejos ? 6 : Math.max(0, actual) - 1)); }
  });

  window.addEventListener('resize', () => { mundo?.redimensionar(); medir(); palabraActual = -1; });

  /* ── Listo: botones de inicio ── */
  progreso(1, 'Listo');
  const botones = cargadorEl.querySelector('.botones-inicio');
  botones.hidden = false;
  requestAnimationFrame(() => botones.classList.add('listo'));
  botones.querySelector('button').focus();
  // Primer cuadro detrás del cargador
  if (mundo) mundo.actualizar(0.016);

  cargadorEl.querySelectorAll('[data-iniciar]').forEach((b) =>
    b.addEventListener('click', () => {
      const conSonido = b.dataset.iniciar === 'sonido';
      if (conSonido) { audio.asegurar(); audio.musica(true); audio.efectos(true); }
      estado.narracion = conSonido;
      hud.narracion(conSonido); hud.musica(conSonido);
      cargadorEl.classList.add('fuera');
      cargadorEl.setAttribute('aria-hidden', 'true');
      setTimeout(() => (cargadorEl.hidden = true), 900);
      if (lenis) { lenis.start(); gsap.ticker.add((tt) => lenis.raf(tt * 1000)); gsap.ticker.lagSmoothing(0); }
      gsap.ticker.add(cuadro);
      main.focus({ preventScroll: true });
      actual = -1; // fuerza la llegada a la introducción (sello y narración)
    })
  );
}

iniciar();
