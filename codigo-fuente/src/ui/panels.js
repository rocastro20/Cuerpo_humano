/*
 * Construye todo el contenido desplazable a partir de src/content.js.
 */
import { retratoDe, icono, sello } from '../illustrations.js';

/* Retrato: foto generada con Canva (incrustada) y, si existe junto a index.html, la versión en alta resolución retratos/<id>.jpg */
export function retratoFoto(id, alt) {
  const d = (window.RETRATOS_DATA || {})[id];
  if (!d) return retratoDe(id);
  const alta = window.PROYECTO_RETRATOS_ALTA; // true cuando retratos/<id>.jpg están junto a index.html (ver LEEME)
  return alta
    ? `<img class="foto-retrato" src="retratos/${id}.jpg" alt="${esc(alt)}" width="200" height="200" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=this.dataset.respaldo" data-respaldo="${d.b64}">`
    : `<img class="foto-retrato" src="${d.b64}" alt="${esc(alt)}" width="200" height="200" loading="lazy" decoding="async">`;
}

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ICONO_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

/* Divide la narración en párrafos parejos de 2–3 frases para leerla cómodamente. */
export function frases(texto) {
  return texto.match(/[^.!?…]+(?:[.!?…]+[»"”]?|$)/g).map((f) => f.trim()).filter(Boolean);
}
function parrafos(texto) {
  const fs = frases(texto);
  const grupos = [];
  const tam = Math.max(2, Math.round(fs.length / 4));
  for (let i = 0; i < fs.length; i += tam) grupos.push(fs.slice(i, i + tam).join(' '));
  return grupos.map((g) => `<p>${esc(g)}</p>`).join('');
}

function numerosFuente(fuentes) {
  const mapa = {};
  Object.keys(fuentes).forEach((k, i) => (mapa[k] = i + 1));
  return mapa;
}

function controlesNarracion(id) {
  return `<div class="controles-narracion">
    <button type="button" class="boton-pildora" data-narrar="${id}" aria-pressed="false">${ICONO_PLAY}<span>Escuchar la narración</span></button>
  </div>`;
}

function encabezado(p, total) {
  return `<p class="etiqueta-parada"><span class="punto"></span>Parada ${p.numero} de ${total} · ${esc(p.sistema)}</p>
    <h2 class="titulo-parada">${esc(p.verbo)}</h2>
    <p class="subtitulo-parada"><span>${esc(p.hora)}</span>
      <button type="button" class="boton-sorpresa" data-sorpresa="${p.numero}">Sorpresa en 3D</button></p>`;
}

function caso(p) {
  return `<div class="caso">
    <div class="retrato">${retratoFoto(p.profesional.retrato, `${p.profesional.nombre}, ${p.profesional.oficio}`)}</div>
    <div>
      <span class="quien">${esc(p.profesional.nombre)}</span>
      <span class="oficio">${esc(p.profesional.oficio)}</span>
      <blockquote>${esc(p.profesional.caso)}</blockquote>
    </div>
  </div>`;
}

function fichas(p, nums) {
  return `<div class="fichas" role="list" aria-label="Datos verificados">${p.fichas
    .map(
      (f) => `<div class="ficha" role="listitem"><span class="dato">${esc(f.dato)}</span><span class="texto">${esc(f.texto)}${
        f.fuente ? `<sup><a href="#fuente-${f.fuente}" aria-label="Fuente ${nums[f.fuente]}">[${nums[f.fuente]}]</a></sup>` : ''
      }</span></div>`
    )
    .join('')}</div>`;
}

function conexion(p) {
  return `<div class="conexion"><h4>Conecta con tus asignaturas</h4>${p.conexion
    .map((c) => `<p><b>${esc(c.area)}:</b> ${esc(c.texto)}</p>`)
    .join('')}</div>`;
}

/* ── Simuladores: solo la estructura; el comportamiento vive en sims.js ── */
function simulador(p) {
  const s = p.simulador;
  const cab = `<h3>${esc(s.titulo)} <span class="chip">simulador</span></h3>
    <p class="formula" aria-label="Fórmula: ${esc(s.formula)}">${esc(s.formula)}</p>
    <p class="leyenda">${esc(s.leyenda)}</p>`;
  let cuerpo = '';
  if (s.tipo === 'energia') {
    cuerpo = s.controles
      .map(
        (c) => `<div class="control">
        <label for="sim-${c.id}">${esc(c.etiqueta)}</label><output id="out-${c.id}" for="sim-${c.id}">${c.inicial} ${c.unidad}</output>
        <input type="range" id="sim-${c.id}" data-var="${c.id}" min="${c.min}" max="${c.max}" step="${c.paso}" value="${c.inicial}">
      </div>`
      )
      .join('') +
      `<div class="sustitucion" data-sustitucion></div>
       <div class="resultado" aria-live="polite"><span class="numero" data-resultado>0</span><span class="unidad">kcal</span></div>
       <div class="barra-apilada" aria-hidden="true"><span data-barra="C" style="background:#FFC94A"></span><span data-barra="P" style="background:#FF6B66"></span><span data-barra="G" style="background:#F4F0FF"></span></div>
       <div class="leyenda-barra" data-leyenda-barra></div>
       <p class="interpretacion"><span class="semaforo"></span><span data-interpretacion></span></p>`;
  } else if (s.tipo === 'respiracion' || s.tipo === 'pulso') {
    const qué = s.tipo === 'respiracion' ? 'respiraciones' : 'latidos';
    const tocar = s.tipo === 'respiracion' ? 'Respiré' : 'Latido';
    const inicial = s.tipo === 'respiracion' ? Math.round(s.inicial / 2) : s.latidosIniciales;
    cuerpo = `<div class="contador">
        <div class="reloj" data-reloj><span data-reloj-texto>${s.segundos}</span></div>
        <div class="acciones-contador">
          <button type="button" class="boton-pildora" data-cronometro>Empezar ${s.segundos} s</button>
          <button type="button" class="toque-grande" data-toque disabled>${tocar}</button>
        </div>
      </div>
      <div class="fila-paso"><span>${qué[0].toUpperCase() + qué.slice(1)} en ${s.segundos} s</span>
        <span class="paso"><button type="button" data-menos aria-label="Uno menos">−</button><output data-conteo aria-live="polite">${inicial}</output><button type="button" data-mas aria-label="Uno más">+</button></span>
      </div>
      ${
        s.tipo === 'pulso'
          ? `<div class="control"><label for="sim-edad">Tu edad</label><output id="out-edad">${s.edadInicial} años</output>
             <input type="range" id="sim-edad" min="9" max="13" step="1" value="${s.edadInicial}"></div>`
          : ''
      }
      <div class="sustitucion" data-sustitucion></div>
      <div class="resultado" aria-live="polite"><span class="numero" data-resultado>0</span><span class="unidad">${s.tipo === 'pulso' ? 'lpm' : 'resp./min'}</span></div>
      <p class="interpretacion"><span class="semaforo"></span><span data-interpretacion></span></p>
      <div class="fila-botones" style="margin-top:12px">
        <button type="button" class="boton-pildora" data-sonificar aria-pressed="false">${icono(s.tipo === 'pulso' ? 'latir' : 'respirar', 'currentColor', 18)}<span>${s.tipo === 'pulso' ? 'Escuchar mi latido' : 'Escuchar mi respiración'}</span></button>
      </div>`;
  } else if (s.tipo === 'reaccion') {
    cuerpo = `<button type="button" class="diana" data-diana data-estado="inicio"><span><span class="bola"></span><span data-diana-texto>Toca aquí para empezar</span></span></button>
      <div class="intentos" data-intentos aria-live="polite"></div>
      <div class="control"><label for="sim-vbalon">Velocidad del tiro (v)</label><output id="out-vbalon">${s.velocidadBalonInicial} m/s</output>
        <input type="range" id="sim-vbalon" min="5" max="30" step="1" value="${s.velocidadBalonInicial}"></div>
      <div class="control"><label for="sim-estatura">Tu estatura (≈ distancia del cerebro al pie)</label><output id="out-estatura">${s.estaturaInicial.toFixed(2)} m</output>
        <input type="range" id="sim-estatura" min="1.1" max="1.8" step="0.01" value="${s.estaturaInicial}"></div>
      <div class="sustitucion" data-sustitucion>Haz un intento para calcular.</div>
      <div class="resultado" aria-live="polite"><span class="numero" data-resultado>—</span><span class="unidad">ms de reacción</span></div>
      <p class="interpretacion"><span class="semaforo"></span><span data-interpretacion>La señal nerviosa viaja a ${s.velocidadNervio} m/s en las fibras rápidas.</span></p>`;
  } else if (s.tipo === 'maleta') {
    cuerpo = `<div class="control"><label for="sim-peso">Tu peso corporal</label><output id="out-peso">${s.peso.inicial} kg</output>
        <input type="range" id="sim-peso" min="${s.peso.min}" max="${s.peso.max}" step="${s.peso.paso}" value="${s.peso.inicial}"></div>
      <div class="control"><label for="sim-maleta">Peso de la maleta</label><output id="out-maleta">${s.maleta.inicial} kg</output>
        <input type="range" id="sim-maleta" min="${s.maleta.min}" max="${s.maleta.max}" step="${s.maleta.paso}" value="${s.maleta.inicial}"></div>
      <div class="sustitucion" data-sustitucion></div>
      <div class="resultado" aria-live="polite"><span class="numero" data-resultado>0</span><span class="unidad">% de tu peso</span></div>
      <p class="interpretacion"><span class="semaforo"></span><span data-interpretacion></span></p>
      <ul class="consejos"><li>Usa las dos correas.</li><li>Ajústala para que quede al centro de la espalda.</li><li>Levántala doblando las rodillas y con las dos manos.</li></ul>`;
  }
  return `<div class="simulador interactivo" data-tipo="${s.tipo}" data-parada="${p.id}">${cab}${cuerpo}<p class="nota-sim">${esc(s.nota)}</p></div>`;
}

function videoFig(video) {
  return `<figure class="video">
    <div class="marco"><video data-video playsinline controls preload="metadata" aria-describedby="video-desc"></video><div class="sub-video" data-sub-video aria-hidden="true"></div></div>
    <figcaption><span id="video-desc"><b>${esc(video.titulo)}</b> · ${esc(video.descripcion)}</span>
      <button type="button" class="boton-pildora" data-cc aria-pressed="true">CC subtítulos</button></figcaption>
  </figure>`;
}

export function construirPagina(raiz, c) {
  const nums = numerosFuente(c.fuentes);
  const total = c.paradas.length;
  const partes = [];

  /* Introducción */
  const intro = c.introduccion;
  partes.push(`<section class="estacion intro" id="inicio" data-estacion="0" style="--color:${intro.color}" aria-labelledby="titulo-inicio">
    <div class="portada">
      <p class="gancho">${esc(intro.gancho)} <strong data-latidos>0</strong> <span>veces.</span></p>
      <h1 id="titulo-inicio">${esc(intro.titulo).replace(" ", "<br>")}</h1>
      <p class="bajada">${esc(c.proyecto.subtitulo)}</p>
      <div><a class="boton-principal bajar" href="#panel-inicio" data-ir="panel-inicio">Empezar el viaje ↓</a></div>
    </div>
    <div class="panel" id="panel-inicio">
      <p class="etiqueta-parada"><span class="punto"></span>Introducción · ${esc(c.proyecto.unidad)}</p>
      <h2 class="titulo-parada" style="font-size:clamp(40px,6vw,64px)">${esc(intro.bajada)}</h2>
      <p class="subtitulo-parada"><span>${esc(intro.ganchoNota)}</span>
        <button type="button" class="boton-sorpresa" data-sorpresa="0">Sorpresa en 3D</button></p>
      ${controlesNarracion('inicio')}
      <div class="narracion">${parrafos(intro.narracion)}</div>
      <h3 style="font-size:20px;margin:18px 0 12px;font-variation-settings:'wdth' 84">Al terminar podrás…</h3>
      <ol class="objetivos">${intro.objetivos.map((o) => `<li>${esc(o)}</li>`).join('')}</ol>
      <div class="reto">
        <h3>Primer reto</h3>
        <p>${esc(intro.reto.pregunta)}</p>
        <div class="control"><label for="sim-reto">Mi respuesta</label><output id="out-reto">${intro.reto.inicial} ${intro.reto.unidad}</output>
          <input type="range" id="sim-reto" min="${intro.reto.min}" max="${intro.reto.max}" step="${intro.reto.paso}" value="${intro.reto.inicial}"></div>
        <button type="button" class="boton-secundario" data-guardar-reto>Guardar mi respuesta</button>
        <p class="nota-sim" data-reto-estado>La respuesta aparece en la primera parada.</p>
      </div>
    </div>
  </section>`);

  /* Paradas */
  c.paradas.forEach((p, i) => {
    partes.push(`<div class="viaje" aria-hidden="true" style="--hacia:${p.color}"><p>rumbo a <b>${esc(p.verbo)}</b></p></div>`);
    partes.push(`<section class="estacion" id="${p.id}" data-estacion="${i + 1}" style="--color:${p.color}" aria-labelledby="titulo-${p.id}">
      <div class="panel">
        ${encabezado(p, total).replace('<h2 class="titulo-parada">', `<h2 class="titulo-parada" id="titulo-${p.id}">`)}
        ${caso(p)}
        ${p.id === 'digerir' ? `<div class="revelacion" data-revelacion>${esc(c.introduccion.reto.revelacion)}</div>` : ''}
        ${controlesNarracion(p.id)}
        <div class="narracion">${parrafos(p.narracion)}</div>
        ${fichas(p, nums)}
        ${simulador(p)}
        ${p.video ? videoFig(c.video) : ''}
        ${conexion(p)}
      </div>
    </section>`);
  });

  /* Conclusión */
  const f = c.conclusion;
  const colorDe = Object.fromEntries(c.paradas.map((p) => [p.verbo, p.color]));
  partes.push(`<div class="viaje" aria-hidden="true" style="--hacia:#fff"><p>todo junto: <b>gol</b></p></div>`);
  partes.push(`<section class="estacion" id="final" data-estacion="${total + 1}" style="--color:#FFD98A" aria-labelledby="titulo-final">
    <div class="panel">
      <p class="etiqueta-parada"><span class="punto"></span>Conclusión · 12:52 p. m. · ¡Gol de Sofía!</p>
      <h2 class="titulo-parada" id="titulo-final" style="font-size:clamp(46px,7vw,84px)">${esc(f.titulo)}</h2>
      <p class="subtitulo-parada"><span>Cómo se convirtió la arepa en gol</span>
        <button type="button" class="boton-sorpresa" data-sorpresa="${total + 1}">Repetir el gol</button></p>
      ${controlesNarracion('final')}
      <ol class="cadena">${f.cadena.map((k) => `<li style="--c:${colorDe[k.verbo]}"><b>${esc(k.verbo)}</b><span>${esc(k.texto)}</span></li>`).join('')}</ol>
      <h3 style="font-size:20px;margin:0 0 12px;font-variation-settings:'wdth' 84">Tres ideas para llevarte</h3>
      <div class="ideas">${f.ideas.map((k) => `<div class="idea"><div><h3>${esc(k.titulo)}</h3><p>${esc(k.texto)}</p></div></div>`).join('')}</div>
      <div class="reflexion"><label for="reflexion">${esc(f.pregunta)}</label>
        <textarea id="reflexion" placeholder="Escribe tu decisión. Solo la ves tú."></textarea></div>
      <p class="cierre">${esc(f.cierre)}</p>
      <details><summary>Leer la narración completa</summary><div class="narracion" style="margin-top:10px">${parrafos(f.narracion)}</div></details>
      <figure class="video video-canva" data-video-canva>
        <div class="marco"><video data-video-externo playsinline controls preload="metadata" src="${esc(c.videoCanva.archivo)}" aria-describedby="video-canva-desc"></video><div class="sub-video" data-sub-video aria-hidden="true"></div>
          <div class="video-falta" data-video-falta hidden><b>Video pendiente de copiar</b><span>Descarga «${esc(c.videoCanva.titulo)}» desde Canva y guárdalo como <code>${esc(c.videoCanva.archivo)}</code> junto a index.html.</span><a href="${esc(c.videoCanva.enlaceCanva)}" target="_blank" rel="noopener">Abrir en Canva</a></div></div>
        <figcaption><span id="video-canva-desc"><b>${esc(c.videoCanva.titulo)}</b> · ${esc(c.videoCanva.descripcion)}</span>
          <button type="button" class="boton-pildora" data-cc aria-pressed="true">CC subtítulos</button></figcaption>
      </figure>
      <div class="fila-botones" style="margin-top:20px"><a class="boton-principal" href="#quiz" data-ir="quiz">Ir al quiz</a></div>
    </div>
  </section>`);

  /* Quiz */
  partes.push(`<section class="seccion-lejos" id="quiz" aria-labelledby="titulo-quiz" style="--acento:#FFD98A">
    <div class="panel"><h2 id="titulo-quiz">Quiz final</h2>
      <p style="color:var(--tinta-suave)">Ocho preguntas, una respuesta correcta en cada una. Verás la explicación enseguida.</p>
      <div data-quiz></div>
    </div>
  </section>`);

  /* Cómo se hizo */
  const ch = c.comoSeHizo;
  const tex = window.TEXTURAS || {};
  const vid = (window.VIDEO_DATA && window.VIDEO_DATA.posters) || {};
  const galeria = [
    ...['sofia', 'laura', 'andres', 'valentina', 'catalina', 'julian'].map((k) => { const n = k === 'sofia' ? 'Sofía' : c.paradas.find((p) => p.profesional.retrato === k)?.profesional.nombre; return { html: retratoFoto(k, n), pie: `Retrato · ${n} (IA de imágenes de Canva)` }; }),
    ...['sofia', 'laura', 'andres', 'valentina', 'catalina', 'julian'].map((k) => ({ html: retratoDe(k), pie: `Boceto SVG previo · ${k === 'sofia' ? 'Sofía' : c.paradas.find((p) => p.profesional.retrato === k)?.profesional.nombre}` })),
    ...[['adentro', '#FFD98A'], ...c.paradas.map((p) => [p.verbo, p.color]), ['gol', '#FFFFFF']].map(([v, col]) => ({ html: sello(v, col, true), pie: `Sello SVG · ${v}`, clase: 'sello-l' })),
    ...Object.entries({ tejido: 'Textura de tejido (ruido de Worley)', arepa: 'Textura de arepa (ruido de valor)', brillo: 'Destello para partículas', grano: 'Grano del fondo' })
      .filter(([k]) => tex[k])
      .map(([k, pie]) => ({ html: `<img src="${tex[k]}" alt="${esc(pie)}" loading="lazy">`, pie })),
    ...Object.entries({ poster: 'Video: título', alveolo: 'Video: alvéolo', corazon: 'Video: corazón', musculo: 'Video: célula muscular' })
      .filter(([k]) => vid[k])
      .map(([k, pie]) => ({ html: `<img src="${vid[k]}" alt="Cuadro del video: ${esc(pie)}" loading="lazy">`, pie })),
  ];
  partes.push(`<section class="seccion-lejos como" id="como-se-hizo" aria-labelledby="titulo-como" style="--acento:#B49BFF">
    <div class="panel"><h2 id="titulo-como">Cómo se hizo</h2>
      <p style="color:var(--tinta-suave)">${esc(ch.perfil.resumen)}</p>
      <h3>Perfil de la población</h3>
      <ul class="rasgos">${ch.perfil.rasgos.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
      <h3>Lo que sabemos del grupo → Decisión de diseño</h3>
      <div class="tabla-scroll" tabindex="0" role="region" aria-label="Tabla de decisiones de diseño"><table>
        <thead><tr><th scope="col">Lo que sabemos del grupo</th><th scope="col" aria-hidden="true"></th><th scope="col">Decisión de diseño</th></tr></thead>
        <tbody>${ch.decisiones.map((d) => `<tr><td>${esc(d.sabemos)}</td><td class="flecha" aria-hidden="true">→</td><td>${esc(d.decision)}</td></tr>`).join('')}</tbody>
      </table></div>
      <h3>Créditos de IA por recurso</h3>
      <div class="tabla-scroll" tabindex="0" role="region" aria-label="Créditos de inteligencia artificial"><table>
        <thead><tr><th scope="col">Recurso</th><th scope="col">Tipo</th><th scope="col">Herramienta</th><th scope="col">Cómo se hizo y prompt usado</th></tr></thead>
        <tbody>${ch.creditos
          .map((k) => `<tr><td><b>${esc(k.recurso)}</b></td><td>${esc(k.tipo)}</td><td>${esc(k.herramienta)}</td><td>${esc(k.como)}<details><summary>Ver prompt</summary><p>${esc(k.prompt)}</p></details></td></tr>`)
          .join('')}</tbody>
      </table></div>
      <h3>Galería de imágenes generadas</h3>
      <div class="galeria">${galeria.map((g) => `<figure><div class="lamina ${g.clase || ''}">${g.html}</div><figcaption>${esc(g.pie)}</figcaption></figure>`).join('')}</div>
      <h3>Equipo</h3>
      <div class="equipo">${c.proyecto.equipo.map((e) => `<div class="persona"><b>${esc(e.nombre)}</b><span>${esc(e.rol)}</span></div>`).join('')}
        <div class="persona"><b>Claude (Anthropic)</b><span>Asistente de IA: código, textos y medios generados por programación</span></div></div>
    </div>
  </section>`);

  /* Fuentes */
  partes.push(`<section class="seccion-lejos fuentes" id="fuentes" aria-labelledby="titulo-fuentes" style="--acento:#45D6DE">
    <div class="panel"><h2 id="titulo-fuentes">Fuentes</h2>
      <p style="color:var(--tinta-suave)">Cada dato del recorrido se verificó en estas fuentes (consultadas en noviembre de 2026). Los rangos de pulso y respiración varían un poco entre referencias.</p>
      <ol>${Object.entries(c.fuentes).map(([k, v]) => `<li id="fuente-${k}">${esc(v.cita)} <a href="${esc(v.url)}" target="_blank" rel="noopener">Abrir fuente</a></li>`).join('')}</ol>
    </div>
  </section>
  <footer class="pie">${esc(c.proyecto.titulo)} · ${esc(c.proyecto.institucion)} · ${c.proyecto.equipo.map((e) => esc(e.nombre)).join(' y ')} · Hecho con apoyo de Claude (Anthropic)</footer>`);

  raiz.innerHTML = partes.join('\n');

  // Revelar paneles al entrar en pantalla (el texto se desvanece mientras la cámara viaja)
  const io = new IntersectionObserver(
    (entradas) => entradas.forEach((e) => e.target.classList.toggle('visible', e.isIntersecting)),
    { rootMargin: '-8% 0px -8% 0px', threshold: 0.02 }
  );
  raiz.querySelectorAll('.panel').forEach((p) => io.observe(p));
}
