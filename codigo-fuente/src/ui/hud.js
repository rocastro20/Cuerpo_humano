/* HUD: marca, interruptores, riel de paradas, indicador en vivo y barra de progreso. */
import { esc } from './panels.js';

const ICONOS = {
  narracion: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/><path class="tachado" d="M3 3l18 18" style="display:none"/></svg>`,
  musica: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/><path class="tachado" d="M3 3l18 18" style="display:none"/></svg>`,
  bitacora: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/><circle cx="12" cy="9" r="2.4"/></svg>`,
  corazon: `<svg class="corazon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/></svg>`,
};

export function crearHUD(raiz, { c, verbos, nombres, colores, alIr, alNarracion, alMusica, alBitacora }) {
  const ini = c.proyecto.institucion.split(/\s+/).filter((p) => p.length > 2).map((p) => p[0]).join('').slice(0, 3);
  raiz.innerHTML = `
    <a class="marca" href="#inicio" data-ir-estacion="0" aria-label="${esc(c.proyecto.institucion)} · ${esc(c.proyecto.titulo)}: volver al inicio">
      <span class="sello-marca">${c.proyecto.logo ? `<img src="${esc(c.proyecto.logo)}" alt="">` : esc(ini)}</span>
      <span class="textos"><b>${esc(c.proyecto.institucion)}</b><span>${esc(c.proyecto.titulo)} · ${esc(c.proyecto.subtitulo)}</span></span>
    </a>
    <div class="controles-hud">
      <button type="button" class="boton-hud" data-narracion aria-pressed="false" aria-label="Narración">${ICONOS.narracion}</button>
      <button type="button" class="boton-hud" data-musica aria-pressed="false" aria-label="Música">${ICONOS.musica}</button>
      <button type="button" class="boton-hud" data-bitacora aria-label="Abrir bitácora">${ICONOS.bitacora}<span class="insignia" data-insignia>0</span></button>
    </div>
    <nav aria-label="Paradas del viaje"><ol class="riel">${verbos
      .map((v, i) => `<li><button type="button" data-ir-estacion="${i}" style="--c:${colores[i]}" aria-label="Ir a ${esc(nombres[i])}"><span class="bolita"></span><span class="nombre" aria-hidden="true">${esc(v)}</span></button></li>`)
      .join('')}</ol></nav>
    <div class="indicador" title="Latidos estimados de tu corazón desde que abriste esta página">
      ${ICONOS.corazon}<b data-latidos-hud>0</b><span data-latidos-nota>latidos desde que llegaste</span>
    </div>
    <div class="progreso" aria-hidden="true"><span></span></div>`;

  raiz.querySelectorAll('[data-ir-estacion]').forEach((b) =>
    b.addEventListener('click', (ev) => { ev.preventDefault(); alIr(+b.dataset.irEstacion); })
  );
  const bNarr = raiz.querySelector('[data-narracion]');
  const bMus = raiz.querySelector('[data-musica]');
  bNarr.addEventListener('click', () => alNarracion(bNarr.getAttribute('aria-pressed') !== 'true'));
  bMus.addEventListener('click', () => alMusica(bMus.getAttribute('aria-pressed') !== 'true'));
  raiz.querySelector('[data-bitacora]').addEventListener('click', alBitacora);
  const riel = [...raiz.querySelectorAll('.riel button')];
  const barra = raiz.querySelector('.progreso span');
  const latidos = raiz.querySelector('[data-latidos-hud]');
  const nota = raiz.querySelector('[data-latidos-nota]');
  const indicador = raiz.querySelector('.indicador');
  const insignia = raiz.querySelector('[data-insignia]');

  return {
    estacion(i) { riel.forEach((b, k) => (k === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current'))); },
    sellos(conjunto, ids) { riel.forEach((b, k) => b.classList.toggle('sellada', conjunto.has(ids[k]))); insignia.textContent = conjunto.size; },
    progreso(p) { barra.style.width = `${(p * 100).toFixed(2)}%`; },
    latidos(n, lpm, medido) {
      latidos.textContent = Math.floor(n).toLocaleString('es-CO');
      nota.textContent = medido ? `latidos desde que llegaste (con tu pulso: ${lpm} lpm)` : 'latidos desde que llegaste (estimado)';
      indicador.style.setProperty('--lpm', lpm);
    },
    narracion(on) { bNarr.setAttribute('aria-pressed', String(on)); bNarr.setAttribute('aria-label', on ? 'Narración activada' : 'Narración desactivada'); },
    musica(on) { bMus.setAttribute('aria-pressed', String(on)); bMus.setAttribute('aria-label', on ? 'Música activada' : 'Música desactivada'); },
  };
}
