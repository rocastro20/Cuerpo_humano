/*
 * Simuladores: cada uno muestra su fórmula, la sustitución con los valores
 * del estudiante y el resultado calculado en vivo. Sus datos animan la escena 3D.
 */
const fmt = (n, d = 0) => Number(n).toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });

export function pintarRango(input) {
  const p = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty('--p', `${p}%`);
}

function guardar(clave, valor) { try { localStorage.setItem(`cuerpo-adentro:${clave}`, JSON.stringify(valor)); } catch { /* sin almacenamiento */ } }
function leer(clave, defecto) { try { const v = localStorage.getItem(`cuerpo-adentro:${clave}`); return v === null ? defecto : JSON.parse(v); } catch { return defecto; } }

function semaforo(sim, color, texto) {
  const i = sim.querySelector('.interpretacion');
  i.style.setProperty('--estado', color);
  sim.querySelector('[data-interpretacion]').textContent = texto;
}

/* Contador con cronómetro (respiración y pulso) */
function contador(sim, { segundos, inicial, audio, alCambiar, avisar, unidad }) {
  const reloj = sim.querySelector('[data-reloj]');
  const relojTxt = sim.querySelector('[data-reloj-texto]');
  const crono = sim.querySelector('[data-cronometro]');
  const toque = sim.querySelector('[data-toque]');
  const salida = sim.querySelector('[data-conteo]');
  let n = inicial, corriendo = false, fin = 0, intervalo = null;
  const pintar = () => { salida.textContent = n; alCambiar(n); };
  function parar(completo) {
    corriendo = false; clearInterval(intervalo);
    toque.disabled = true; crono.textContent = `Empezar ${segundos} s`;
    reloj.style.setProperty('--avance', completo ? 1 : 0); relojTxt.textContent = completo ? '✓' : segundos;
    if (completo) { avisar(`¡Tiempo! Contaste ${n} ${unidad}.`); audio.fx.sello(); }
  }
  crono.addEventListener('click', () => {
    if (corriendo) return parar(false);
    n = 0; pintar(); corriendo = true; fin = performance.now() + segundos * 1000;
    toque.disabled = false; toque.focus(); crono.textContent = 'Detener';
    intervalo = setInterval(() => {
      const resta = Math.max(0, fin - performance.now());
      reloj.style.setProperty('--avance', 1 - resta / (segundos * 1000));
      relojTxt.textContent = Math.ceil(resta / 1000);
      if (resta <= 0) parar(true);
    }, 100);
  });
  toque.addEventListener('click', () => { if (!corriendo) return; n++; pintar(); audio.fx.clic(); });
  sim.querySelector('[data-mas]').addEventListener('click', () => { n = Math.min(99, n + 1); pintar(); });
  sim.querySelector('[data-menos]').addEventListener('click', () => { n = Math.max(0, n - 1); pintar(); });
  pintar();
}

export function iniciarSimuladores({ raiz, c, mundo, audio, estado, avisar, alDato }) {
  raiz.querySelectorAll('input[type="range"]').forEach((r) => { pintarRango(r); r.addEventListener('input', () => pintarRango(r)); });

  /* ── Reto de la introducción ── */
  const reto = c.introduccion.reto;
  const inReto = raiz.querySelector('#sim-reto');
  const outReto = raiz.querySelector('#out-reto');
  const estadoReto = raiz.querySelector('[data-reto-estado]');
  const revel = raiz.querySelector('[data-revelacion]');
  const guardado = leer('reto', null);
  if (guardado !== null) { inReto.value = guardado; pintarRango(inReto); }
  const mostrarReto = () => { outReto.textContent = `${fmt(inReto.value, 1)} ${reto.unidad}`; };
  function revelar() {
    const v = Number(leer('reto', inReto.value));
    const dif = Math.abs(v - reto.respuesta);
    const juicio = dif <= 0.6 ? '¡Casi exacto!' : v < reto.respuesta ? `Te quedaste corto por ${fmt(dif, 1)} m.` : `Te pasaste por ${fmt(dif, 1)} m.`;
    revel.innerHTML = `<strong>Reto: tu respuesta fue ${fmt(v, 1)} m.</strong> ${reto.revelacion} ${juicio}`;
  }
  inReto.addEventListener('input', mostrarReto);
  raiz.querySelector('[data-guardar-reto]').addEventListener('click', () => {
    guardar('reto', Number(inReto.value));
    estadoReto.textContent = `Guardado: ${fmt(inReto.value, 1)} m. La respuesta está en la primera parada.`;
    audio.fx.clic(); revelar();
  });
  mostrarReto(); revelar();

  /* ── 1 · Energía del desayuno ── */
  {
    const sim = raiz.querySelector('[data-tipo="energia"]');
    const ins = Object.fromEntries([...sim.querySelectorAll('input[data-var]')].map((i) => [i.dataset.var, i]));
    const nombres = { C: 'carbohidratos', P: 'proteínas', G: 'grasas' };
    const calc = () => {
      const C = +ins.C.value, P = +ins.P.value, G = +ins.G.value;
      ['C', 'P', 'G'].forEach((k) => (sim.querySelector(`#out-${k}`).textContent = `${ins[k].value} g`));
      const e = { C: 4 * C, P: 4 * P, G: 9 * G };
      const E = e.C + e.P + e.G;
      sim.querySelector('[data-sustitucion]').textContent = `E = 4·${C} + 4·${P} + 9·${G} = ${e.C} + ${e.P} + ${e.G}`;
      sim.querySelector('[data-resultado]').textContent = fmt(E);
      ['C', 'P', 'G'].forEach((k) => (sim.querySelector(`[data-barra="${k}"]`).style.width = E ? `${(e[k] / E) * 100}%` : '0'));
      sim.querySelector('[data-leyenda-barra]').innerHTML = ['C', 'P', 'G']
        .map((k, i) => `<span><i style="background:${['#FFC94A', '#FF6B66', '#F4F0FF'][i]}"></i>${nombres[k]} ${E ? fmt((e[k] / E) * 100) : 0} %</span>`).join('');
      const faltan = ['C', 'P', 'G'].filter((k) => +ins[k].value === 0).map((k) => nombres[k]);
      if (faltan.length) semaforo(sim, 'var(--alerta)', `Le faltan ${faltan.join(' y ')}. Laura pide combinar los tres nutrientes.`);
      else semaforo(sim, 'var(--ok)', `Combina los tres nutrientes. Las grasas dan más energía por gramo (9), por eso pocas pesan mucho en el total.`);
      mundo.datos.energia = E; estado.energia = E; alDato?.();
    };
    Object.values(ins).forEach((i) => i.addEventListener('input', calc));
    calc();
  }

  /* ── 2 · Respiración ── */
  const simR = raiz.querySelector('[data-tipo="respiracion"]');
  const cfgR = c.paradas.find((p) => p.id === 'respirar').simulador;
  let frActual = cfgR.inicial;
  const sonR = simR.querySelector('[data-sonificar]');
  contador(simR, {
    segundos: cfgR.segundos, inicial: Math.round(cfgR.inicial / 2), audio, avisar, unidad: 'respiraciones',
    alCambiar(n) {
      const fr = n * 2;
      frActual = fr;
      const dia = fr * 1440;
      simR.querySelector('[data-sustitucion]').textContent = `FR = ${n} × 2 = ${fr}   ·   al día = ${fr} × 1 440 = ${fmt(dia)}`;
      simR.querySelector('[data-resultado]').textContent = fr;
      const [a, b] = cfgR.rangoReposo;
      if (fr === 0) semaforo(simR, 'var(--tinta-tenue)', 'Cuenta tus respiraciones para calcular.');
      else if (fr < a) semaforo(simR, 'var(--respirar)', `Más lento que el rango de reposo (${a}–${b}). ¿Contaste todas? Repite con calma.`);
      else if (fr <= b) semaforo(simR, 'var(--ok)', `Dentro del rango de reposo para 6 a 12 años (${a}–${b}). Respiras unas ${fmt(dia)} veces al día.`);
      else semaforo(simR, 'var(--medio)', `Más rápido que el reposo (${a}–${b}): normal si acabas de moverte. Tu cuerpo pide más oxígeno.`);
      mundo.datos.fr = Math.max(6, fr); estado.fr = fr;
      if (sonR.getAttribute('aria-pressed') === 'true') audio.sonificarRespiracion(Math.max(6, fr));
    },
  });
  sonR.addEventListener('click', () => {
    const on = sonR.getAttribute('aria-pressed') !== 'true';
    sonR.setAttribute('aria-pressed', String(on));
    if (on) { audio.prepararSonificacion(); audio.sonificarRespiracion(Math.max(6, frActual)); } else audio.sonificarRespiracion(null);
  });

  /* ── 3 · Pulso ── */
  const simP = raiz.querySelector('[data-tipo="pulso"]');
  const cfgP = c.paradas.find((p) => p.id === 'latir').simulador;
  const edad = simP.querySelector('#sim-edad');
  const sonP = simP.querySelector('[data-sonificar]');
  let conteoP = cfgP.latidosIniciales, lpmActual = conteoP * 4, medido = false;
  const calcP = () => {
    const lpm = conteoP * 4;
    lpmActual = lpm;
    const e = +edad.value;
    simP.querySelector('#out-edad').textContent = `${e} años`;
    const max = 220 - e;
    const pct = max ? (lpm / max) * 100 : 0;
    simP.querySelector('[data-sustitucion]').textContent = `lpm = ${conteoP} × 4 = ${lpm}   ·   FCmáx ≈ 220 − ${e} = ${max}   ·   ${lpm} ÷ ${max} × 100 = ${fmt(pct)} %`;
    simP.querySelector('[data-resultado]').textContent = lpm;
    const zona = cfgP.zonas.find((z) => pct < z.hasta);
    const color = { calma: 'var(--ok)', media: 'var(--respirar)', alta: 'var(--medio)', alerta: 'var(--alerta)' }[zona.tono];
    semaforo(simP, color, lpm ? `${fmt(pct)} % de tu máximo estimado: ${zona.nombre}. En reposo, entre 60 y 100 lpm es lo común de 6 a 12 años.` : 'Cuenta tus latidos para calcular.');
    if (lpm) { mundo.datos.lpm = Math.max(40, lpm); estado.lpm = lpm; estado.lpmMedido = medido; }
    if (sonP.getAttribute('aria-pressed') === 'true' && lpm) audio.sonificarLatido(Math.max(40, lpm));
    alDato?.();
  };
  contador(simP, {
    segundos: cfgP.segundos, inicial: cfgP.latidosIniciales, audio, avisar, unidad: 'latidos',
    alCambiar(n) { conteoP = n; if (n !== cfgP.latidosIniciales) medido = true; calcP(); },
  });
  edad.addEventListener('input', calcP);
  sonP.addEventListener('click', () => {
    const on = sonP.getAttribute('aria-pressed') !== 'true';
    sonP.setAttribute('aria-pressed', String(on));
    if (on) { audio.prepararSonificacion(); audio.sonificarLatido(Math.max(40, lpmActual)); } else audio.sonificarLatido(null);
  });

  /* ── 4 · Reacción ── */
  {
    const sim = raiz.querySelector('[data-tipo="reaccion"]');
    const cfg = c.paradas.find((p) => p.id === 'sentir').simulador;
    const diana = sim.querySelector('[data-diana]');
    const txt = sim.querySelector('[data-diana-texto]');
    const vb = sim.querySelector('#sim-vbalon');
    const est = sim.querySelector('#sim-estatura');
    const intentos = [];
    let espera = null, t0 = 0, estadoD = 'inicio', ignorarClic = false;
    const poner = (e, texto) => { estadoD = e; diana.dataset.estado = e; txt.textContent = texto; };
    const calc = () => {
      sim.querySelector('#out-vbalon').textContent = `${vb.value} m/s`;
      sim.querySelector('#out-estatura').textContent = `${fmt(est.value, 2)} m`;
      if (!intentos.length) return;
      const mejor = Math.min(...intentos);
      const ts = mejor / 1000;
      const d = +vb.value * ts;
      const tn = (+est.value / cfg.velocidadNervio) * 1000;
      const pct = (tn / mejor) * 100;
      sim.querySelector('[data-sustitucion]').innerHTML =
        `Balón: d = v × t = ${vb.value} m/s × ${fmt(ts, 3)} s = <b>${fmt(d, 1)} m</b><br>` +
        `Nervio: t = d ÷ v = ${fmt(est.value, 2)} m ÷ ${cfg.velocidadNervio} m/s = <b>${fmt(tn, 1)} ms</b>`;
      sim.querySelector('[data-resultado]').textContent = fmt(mejor);
      semaforo(sim, 'var(--sentir)', `Mientras reaccionabas, el balón avanzó ${fmt(d, 1)} m. El viaje por el nervio fue solo el ${fmt(pct)} % de tu tiempo: el resto fue tu cerebro viendo y decidiendo. Tu medida incluye el pequeño retraso de la pantalla.`);
      sim.querySelector('[data-intentos]').innerHTML = intentos.map((x) => `<span class="${x === mejor ? 'mejor' : ''}">${fmt(x)} ms</span>`).join('');
      estado.reaccion = mejor;
    };
    function accion() {
      if (estadoD === 'inicio' || estadoD === 'pronto' || estadoD === 'hecho') {
        poner('espera', 'Espera a que se ponga verde…');
        espera = setTimeout(() => { poner('ya', '¡Ya! ¡Toca!'); t0 = performance.now(); }, 1300 + Math.random() * 2500);
      } else if (estadoD === 'espera') {
        clearTimeout(espera);
        poner('pronto', '¡Muy pronto! Toca para intentar de nuevo');
        audio.fx.error();
      } else if (estadoD === 'ya') {
        const ms = Math.round(performance.now() - t0);
        intentos.push(ms); if (intentos.length > 5) intentos.shift();
        poner('hecho', `${fmt(ms)} ms. Toca para otro intento`);
        mundo.impulsoNervioso(); audio.fx.chispa();
        calc();
      }
    }
    diana.addEventListener('pointerdown', (ev) => { if (ev.button !== 0) return; ev.preventDefault(); ignorarClic = true; accion(); });
    diana.addEventListener('keydown', (ev) => { if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); if (!ev.repeat) accion(); } });
    diana.addEventListener('click', (ev) => { if (ignorarClic) { ignorarClic = false; return; } if (ev.detail === 0) return; accion(); });
    [vb, est].forEach((i) => i.addEventListener('input', calc));
    calc();
  }

  /* ── 5 · Maleta ── */
  {
    const sim = raiz.querySelector('[data-tipo="maleta"]');
    const cfg = c.paradas.find((p) => p.id === 'mover').simulador;
    const peso = sim.querySelector('#sim-peso'), maleta = sim.querySelector('#sim-maleta');
    const calc = () => {
      const p = +peso.value, m = +maleta.value;
      sim.querySelector('#out-peso').textContent = `${p} kg`;
      sim.querySelector('#out-maleta').textContent = `${fmt(m, 1)} kg`;
      const pct = (m / p) * 100;
      sim.querySelector('[data-sustitucion]').textContent = `% = ${fmt(m, 1)} ÷ ${p} × 100 = ${fmt(pct, 1)} %   ·   tu 10 % = ${fmt(p * 0.1, 1)} kg`;
      sim.querySelector('[data-resultado]').textContent = fmt(pct, 1);
      const [a, b] = cfg.limites;
      if (pct <= a) semaforo(sim, 'var(--ok)', `Dentro de lo recomendado: no más del ${a} % es lo ideal.`);
      else if (pct <= b) semaforo(sim, 'var(--medio)', `Entre ${a} y ${b} %: es el máximo recomendado. Intenta acercarte al ${a} %; saca lo que no necesites hoy.`);
      else semaforo(sim, 'var(--alerta)', `Más del ${b} %: demasiado peso para tu espalda. Mira cómo se inclina la columna.`);
      mundo.datos.maletaPct = pct; mundo.datos.maletaKg = m; estado.maletaPct = pct;
    };
    [peso, maleta].forEach((i) => i.addEventListener('input', calc));
    calc();
  }

  return {
    detenerSonificacion() {
      audio.detenerSonificacion();
      raiz.querySelectorAll('[data-sonificar]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    },
  };
}
