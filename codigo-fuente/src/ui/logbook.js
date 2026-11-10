/*
 * Bitácora: sella cada parada visitada y genera un certificado PNG descargable
 * con nombre, avance, puntaje del quiz, fecha y créditos.
 */
import { sello } from '../illustrations.js';
import { esc } from './panels.js';

function leer(k, d) { try { const v = localStorage.getItem(`cuerpo-adentro:${k}`); return v === null ? d : JSON.parse(v); } catch { return d; } }
function guardar(k, v) { try { localStorage.setItem(`cuerpo-adentro:${k}`, JSON.stringify(v)); } catch { /* sin almacenamiento */ } }

export function crearBitacora({ c, estado, audio, avisar, alCambiar }) {
  const paradas = [
    { id: 'inicio', verbo: 'adentro', color: c.introduccion.color, nombre: 'Introducción' },
    ...c.paradas.map((p) => ({ id: p.id, verbo: p.verbo, color: p.color, nombre: p.sistema })),
    { id: 'final', verbo: 'gol', color: '#FFFFFF', nombre: 'Conclusión' },
  ];
  const visitadas = new Set(leer('sellos', []));
  let nombre = leer('nombre', '');

  const dialogo = document.createElement('dialog');
  dialogo.className = 'bitacora';
  dialogo.setAttribute('aria-labelledby', 'titulo-bitacora');
  dialogo.setAttribute('data-lenis-prevent', '');
  document.body.appendChild(dialogo);

  function sellar(id) {
    if (visitadas.has(id)) return false;
    visitadas.add(id);
    guardar('sellos', [...visitadas]);
    const p = paradas.find((x) => x.id === id);
    audio.fx.sello();
    avisar(`Sello en tu bitácora: ${p.verbo}`);
    alCambiar?.(visitadas);
    if (dialogo.open) pintar();
    return true;
  }

  function pintar() {
    const quiz = estado.quiz ?? leer('quiz', null);
    dialogo.innerHTML = `<div class="interior">
      <button type="button" class="boton-hud cerrar" aria-label="Cerrar bitácora" data-cerrar><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      <h2 id="titulo-bitacora">Bitácora</h2>
      <p style="color:var(--tinta-suave)">${visitadas.size} de ${paradas.length} sellos · Quiz: ${quiz === null ? 'pendiente' : `${quiz}/${c.quiz.length}`}</p>
      <div class="sellos">${paradas.map((p) => `<figure>${sello(p.verbo, p.color, visitadas.has(p.id))}<figcaption>${esc(p.nombre)}</figcaption></figure>`).join('')}</div>
      <div class="campo"><label for="nombre-cert">Tu nombre para el certificado</label>
        <input id="nombre-cert" type="text" maxlength="40" autocomplete="name" value="${esc(nombre)}" placeholder="Escribe tu nombre"></div>
      <div class="vista-cert"><canvas width="1600" height="1000" aria-label="Vista previa del certificado"></canvas></div>
      <div class="fila-botones"><button type="button" class="boton-principal" data-descargar style="--acento:#FFD98A">Descargar certificado (PNG)</button>
        <button type="button" class="boton-secundario" data-cerrar>Seguir el viaje</button></div>
      <p class="nota-sim">Tu avance se guarda solo en este navegador.</p>
    </div>`;
    const lienzo = dialogo.querySelector('canvas');
    const campo = dialogo.querySelector('#nombre-cert');
    const redibujar = () => dibujar(lienzo, campo.value.trim());
    campo.addEventListener('input', () => { nombre = campo.value; guardar('nombre', nombre); redibujar(); });
    dialogo.querySelectorAll('[data-cerrar]').forEach((b) => b.addEventListener('click', () => dialogo.close()));
    dialogo.querySelector('[data-descargar]').addEventListener('click', () => descargar(lienzo, campo.value.trim()));
    redibujar();
  }

  function envolver(ctx, texto, x, y, ancho, alto) {
    const palabras = texto.split(' ');
    let linea = '';
    for (const p of palabras) {
      const prueba = linea ? `${linea} ${p}` : p;
      if (ctx.measureText(prueba).width > ancho && linea) { ctx.fillText(linea, x, y); linea = p; y += alto; } else linea = prueba;
    }
    ctx.fillText(linea, x, y);
    return y;
  }

  function dibujar(cv, quien) {
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const g = ctx.createRadialGradient(W * 0.7, H * 0.2, 50, W * 0.6, H * 0.5, W * 0.9);
    g.addColorStop(0, '#2C2160'); g.addColorStop(1, '#120D24');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(244,240,255,.25)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(40, 40, W - 80, H - 80, 36); ctx.stroke();
    // franja de colores del viaje
    paradas.slice(1, 6).forEach((p, i) => { ctx.fillStyle = p.color; ctx.fillRect(40 + 36 + i * 120, 40, 110, 8); });
    ctx.fillStyle = '#CFC7EA'; ctx.font = "600 26px 'Bricolage Grotesque Variable', sans-serif";
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(c.proyecto.institucion, 100, 130);
    const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    ctx.textAlign = 'right'; ctx.fillText(fecha, W - 100, 130); ctx.textAlign = 'left';
    ctx.fillStyle = '#FFD98A'; ctx.font = "italic 54px 'Instrument Serif', Georgia, serif";
    ctx.fillText(c.certificado.titulo, 100, 230);
    const nom = quien || 'Explorador o exploradora';
    let tam = 132;
    ctx.font = `800 ${tam}px 'Bricolage Grotesque Variable', sans-serif`;
    while (ctx.measureText(nom).width > W - 220 && tam > 50) { tam -= 6; ctx.font = `800 ${tam}px 'Bricolage Grotesque Variable', sans-serif`; }
    ctx.fillStyle = '#F4F0FF'; ctx.fillText(nom, 96, 230 + tam * 0.95 + 20);
    ctx.font = "400 34px 'Bricolage Grotesque Variable', sans-serif"; ctx.fillStyle = '#CFC7EA';
    const yTexto = envolver(ctx, c.certificado.texto, 100, 230 + tam + 90, W - 200, 46);
    // sellos
    const y0 = yTexto + 70;
    paradas.forEach((p, i) => {
      const x = 150 + i * 150, sellado = visitadas.has(p.id);
      ctx.globalAlpha = sellado ? 1 : 0.25;
      ctx.strokeStyle = p.color; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(x, y0 + 50, 52, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([3, 7]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y0 + 50, 42, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = p.color; ctx.font = "700 17px 'Bricolage Grotesque Variable', sans-serif"; ctx.textAlign = 'center';
      ctx.fillText(p.verbo, x, y0 + 57);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    });
    // datos
    const quiz = estado.quiz ?? leer('quiz', null);
    const yDatos = y0 + 170;
    const datos = [
      ['Paradas selladas', `${visitadas.size}/${paradas.length}`],
      ['Quiz', quiz === null ? 'pendiente' : `${quiz}/${c.quiz.length}`],
      ['Fecha', new Date().toLocaleDateString('es-CO')],
    ];
    datos.forEach(([k, v], i) => {
      const x = 100 + i * 330;
      ctx.fillStyle = '#A79DC9'; ctx.font = "600 22px 'Bricolage Grotesque Variable', sans-serif"; ctx.fillText(k, x, yDatos);
      ctx.fillStyle = '#F4F0FF'; ctx.font = "800 48px 'Bricolage Grotesque Variable', sans-serif"; ctx.fillText(v, x, yDatos + 52);
    });
    ctx.fillStyle = '#A79DC9'; ctx.font = "400 21px 'Bricolage Grotesque Variable', sans-serif";
    ctx.fillText(`Equipo: ${c.proyecto.equipo.map((e) => `${e.nombre} (${e.rol})`).join(' · ')}`, 100, H - 112);
    ctx.fillText(c.certificado.creditos, 100, H - 80);
  }

  function descargar(cv, quien) {
    dibujar(cv, quien);
    const nombreArchivo = `certificado-cuerpo-adentro${quien ? '-' + quien.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-') : ''}.png`;
    const fallar = () => avisar('No se pudo descargar aquí. Abre el recurso en el navegador para guardar el certificado.');
    try {
      cv.toBlob(async (b) => {
        if (!b) return fallar();
        // Dentro de un visor de claude.ai la descarga pasa por su capacidad «downloads»
        if (window.claude?.use) {
          const descargas = await window.claude.use('downloads').catch(() => null);
          if (descargas) {
            try { await descargas.save({ filename: nombreArchivo, data: b }); audio.fx.sello(); avisar('Certificado guardado.'); }
            catch (e) { if (e?.code !== 'declined') fallar(); }
            return;
          }
        }
        const url = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = url; a.download = nombreArchivo;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        audio.fx.sello();
        avisar('Certificado descargado.');
      }, 'image/png');
    } catch { fallar(); }
  }

  return {
    sellar,
    abrir() { pintar(); if (!dialogo.open) dialogo.showModal(); },
    visitadas,
    guardarQuiz(p) { guardar('quiz', p); },
  };
}
