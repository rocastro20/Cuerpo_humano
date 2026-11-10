/*
 * Sonido sintetizado en vivo con la Web Audio API:
 *  - banda sonora ambiental generativa (bucle sin cortes: nunca se repite ni se corta),
 *  - efectos y sonificación de datos (latido a los lpm calculados, respiración a la FR).
 */
const ACORDES = [
  [50, 57, 62, 66, 69], // Re maj9
  [47, 54, 59, 62, 66], // Si m7
  [43, 50, 55, 59, 62], // Sol maj7
  [45, 52, 57, 59, 64], // La sus
];
const PENTATONICA = [74, 76, 78, 81, 83, 86];
const BRILLO_ESTACION = [900, 1150, 1350, 1050, 1550, 1250, 1750];
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

export function crearAudio() {
  let ctx = null;
  let maestro, busMusica, busEfectos, filtro, reverb, envioRev;
  let musicaActiva = false, efectosActivos = false;
  let proximoAcorde = 0, indiceAcorde = 0, proximoBrillo = 0;
  let reloj = null;
  const bucles = { latido: null, respiracion: null };

  function impulso(seg = 3.8, caida = 2.4) {
    const n = Math.floor(ctx.sampleRate * seg);
    const b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, caida);
    }
    return b;
  }

  function asegurar() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      maestro = ctx.createGain(); maestro.gain.value = 0.9; maestro.connect(ctx.destination);
      reverb = ctx.createConvolver(); reverb.buffer = impulso();
      const retorno = ctx.createGain(); retorno.gain.value = 0.6; reverb.connect(retorno).connect(maestro);
      busMusica = ctx.createGain(); busMusica.gain.value = 0;
      filtro = ctx.createBiquadFilter(); filtro.type = 'lowpass'; filtro.frequency.value = 1000; filtro.Q.value = 0.4;
      busMusica.connect(filtro);
      filtro.connect(maestro);
      envioRev = ctx.createGain(); envioRev.gain.value = 0.8; filtro.connect(envioRev).connect(reverb);
      busEfectos = ctx.createGain(); busEfectos.gain.value = 0;
      busEfectos.connect(maestro);
      const envE = ctx.createGain(); envE.gain.value = 0.25; busEfectos.connect(envE).connect(reverb);
      reloj = setInterval(programar, 250);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* ── Música generativa ── */
  function voz(m, ini, dur, amp) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ini);
    g.gain.linearRampToValueAtTime(amp, ini + 2.6);
    g.gain.setValueAtTime(amp, ini + dur);
    g.gain.linearRampToValueAtTime(0, ini + dur + 4);
    g.connect(busMusica);
    for (const [tipo, des] of [['sine', -4], ['triangle', 5]]) {
      const o = ctx.createOscillator();
      o.type = tipo; o.frequency.value = hz(m); o.detune.value = des;
      const og = ctx.createGain(); og.gain.value = tipo === 'sine' ? 1 : 0.35;
      o.connect(og).connect(g);
      o.start(ini); o.stop(ini + dur + 4.2);
    }
  }
  function brillo(ini) {
    const m = PENTATONICA[Math.floor(Math.random() * PENTATONICA.length)];
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = hz(m);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ini); g.gain.linearRampToValueAtTime(0.028, ini + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ini + 2.6);
    o.connect(g).connect(envioRev); o.start(ini); o.stop(ini + 2.7);
  }
  function programar() {
    if (!ctx || !musicaActiva) return;
    const ahora = ctx.currentTime;
    if (proximoAcorde < ahora) proximoAcorde = ahora + 0.1;
    while (proximoAcorde < ahora + 2.5) {
      ACORDES[indiceAcorde % ACORDES.length].forEach((m, k) => voz(m, proximoAcorde, 8, k === 0 ? 0.05 : 0.032));
      proximoAcorde += 8; indiceAcorde++;
    }
    if (proximoBrillo < ahora) proximoBrillo = ahora + 1;
    while (proximoBrillo < ahora + 2.5) { brillo(proximoBrillo); proximoBrillo += 2 + Math.random() * 3.5; }
  }

  function musica(on) {
    musicaActiva = on;
    if (!asegurar()) return;
    const ahora = ctx.currentTime;
    busMusica.gain.cancelScheduledValues(ahora);
    busMusica.gain.setTargetAtTime(on ? 0.85 : 0, ahora, on ? 0.8 : 0.4);
    if (on) programar();
  }
  function efectos(on) {
    efectosActivos = on;
    if (!asegurar()) return;
    busEfectos.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, 0.05);
  }
  function estacion(i) {
    if (!ctx) return;
    filtro.frequency.setTargetAtTime(BRILLO_ESTACION[i] || 1000, ctx.currentTime, 1.2);
  }

  /* ── Efectos ── */
  const listo = () => ctx && efectosActivos;
  function golpe(f0, amp, ini, dur = 0.16) {
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(f0, ini); o.frequency.exponentialRampToValueAtTime(f0 * 0.55, ini + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ini); g.gain.linearRampToValueAtTime(amp, ini + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, ini + dur);
    o.connect(g).connect(busEfectos); o.start(ini); o.stop(ini + dur + 0.02);
  }
  function ruido(dur, { ini, tipo = 'bandpass', f = 900, q = 0.8, amp = 0.2, ataque = 0.01, fin = null }) {
    const n = Math.floor(ctx.sampleRate * dur);
    const b = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(); s.buffer = b;
    const fl = ctx.createBiquadFilter(); fl.type = tipo; fl.frequency.setValueAtTime(f, ini); fl.Q.value = q;
    if (fin) fl.frequency.linearRampToValueAtTime(fin, ini + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ini); g.gain.linearRampToValueAtTime(amp, ini + ataque); g.gain.linearRampToValueAtTime(0, ini + dur);
    s.connect(fl).connect(g).connect(busEfectos); s.start(ini); s.stop(ini + dur);
  }
  function tono(m, ini, dur = 0.4, amp = 0.08, tipo = 'sine') {
    const o = ctx.createOscillator(); o.type = tipo; o.frequency.value = hz(m);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ini); g.gain.linearRampToValueAtTime(amp, ini + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, ini + dur);
    o.connect(g).connect(busEfectos); o.start(ini); o.stop(ini + dur + 0.05);
  }
  const fx = {
    latido(fuerte = 1) { if (!listo()) return; const t = ctx.currentTime + 0.01; golpe(72, 0.6 * fuerte, t); golpe(58, 0.4 * fuerte, t + 0.16); },
    respiro(dur = 1.5) { if (!listo()) return; const t = ctx.currentTime; ruido(dur * 0.45, { ini: t, f: 600, fin: 1300, amp: 0.12, ataque: dur * 0.3 }); ruido(dur * 0.55, { ini: t + dur * 0.45, f: 1100, fin: 500, amp: 0.08, ataque: 0.1 }); },
    clic() { if (!listo()) return; tono(88, ctx.currentTime, 0.06, 0.04, 'triangle'); },
    sello() { if (!listo()) return; const t = ctx.currentTime; golpe(140, 0.45, t, 0.12); tono(81, t + 0.05, 0.6, 0.05); tono(86, t + 0.12, 0.7, 0.04); },
    crujido() { if (!listo()) return; const t = ctx.currentTime; for (let i = 0; i < 4; i++) ruido(0.06, { ini: t + i * 0.07, tipo: 'highpass', f: 2500, amp: 0.18 }); },
    burbujas() { if (!listo()) return; const t = ctx.currentTime; for (let i = 0; i < 7; i++) { const o = ctx.createOscillator(); const g = ctx.createGain(); const ini = t + i * 0.11 + Math.random() * 0.05; o.frequency.setValueAtTime(300 + Math.random() * 300, ini); o.frequency.exponentialRampToValueAtTime(900 + Math.random() * 500, ini + 0.08); g.gain.setValueAtTime(0.06, ini); g.gain.exponentialRampToValueAtTime(0.0001, ini + 0.1); o.connect(g).connect(busEfectos); o.start(ini); o.stop(ini + 0.12); } },
    chispa() { if (!listo()) return; const t = ctx.currentTime; ruido(0.5, { ini: t, tipo: 'highpass', f: 3000, amp: 0.12 }); [86, 90, 93, 98].forEach((m, i) => tono(m, t + i * 0.05, 0.3, 0.04, 'square')); },
    estiron() { if (!listo()) return; const t = ctx.currentTime; ruido(0.35, { ini: t, tipo: 'lowpass', f: 300, fin: 180, amp: 0.25, ataque: 0.15 }); golpe(220, 0.3, t + 0.36, 0.08); },
    gol() { if (!listo()) return; const t = ctx.currentTime; golpe(110, 0.7, t, 0.2); [62, 66, 69, 74, 78].forEach((m, i) => tono(m, t + 0.45 + i * 0.07, 1.4, 0.07, 'triangle')); ruido(2.2, { ini: t + 0.4, tipo: 'bandpass', f: 1200, q: 0.3, amp: 0.14, ataque: 0.4 }); },
    acierto() { if (!listo()) return; const t = ctx.currentTime; tono(74, t, 0.3, 0.07, 'triangle'); tono(81, t + 0.09, 0.45, 0.07, 'triangle'); },
    error() { if (!listo()) return; const t = ctx.currentTime; tono(57, t, 0.25, 0.06, 'triangle'); tono(53, t + 0.12, 0.35, 0.06, 'triangle'); },
  };

  /* ── Sonificación: bucles a un ritmo dado ── */
  function bucle(nombre, porMinuto, sonar) {
    clearInterval(bucles[nombre]);
    bucles[nombre] = null;
    if (!porMinuto) return;
    asegurar();
    const periodo = 60000 / porMinuto;
    sonar(periodo / 1000);
    bucles[nombre] = setInterval(() => sonar(periodo / 1000), periodo);
  }
  function sonificarLatido(lpm) {
    bucle('latido', lpm, () => { if (ctx) { const t = ctx.currentTime + 0.01; golpe(72, 0.55, t); golpe(58, 0.38, t + 0.16); } });
  }
  function sonificarRespiracion(fr) {
    bucle('respiracion', fr, (p) => { if (ctx) { const t = ctx.currentTime; ruido(p * 0.42, { ini: t, f: 600, fin: 1300, amp: 0.13, ataque: p * 0.3 }); ruido(p * 0.5, { ini: t + p * 0.45, f: 1100, fin: 450, amp: 0.09, ataque: 0.15 }); } });
  }
  function detenerSonificacion() { sonificarLatido(null); sonificarRespiracion(null); }

  return {
    asegurar, musica, efectos, estacion, fx,
    sonificarLatido, sonificarRespiracion, detenerSonificacion,
    get musicaActiva() { return musicaActiva; },
    get efectosActivos() { return efectosActivos; },
    // La sonificación suena en su propio canal, aunque los efectos estén apagados
    prepararSonificacion() { asegurar(); if (busEfectos && !efectosActivos) busEfectos.gain.setTargetAtTime(1, ctx.currentTime, 0.05); },
  };
}
