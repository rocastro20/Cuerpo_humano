/*
 * Narración con subtítulos sincronizados.
 *  1. Si el bloque trae un audio (MP3, por ejemplo hecho con Gemini TTS), lo reproduce
 *     y sincroniza los subtítulos por proporción de palabras.
 *  2. Si no, usa la voz en español del navegador (Web Speech API; en Chrome, voces de Google),
 *     frase por frase: cada frase es un subtítulo.
 *  3. Si el navegador no tiene voz en español, muestra los subtítulos al ritmo de 150 palabras/min.
 */
import { frases } from '../ui/panels.js';

export function crearNarrador({ alSubtitulo, alCambio }) {
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let voz = null;
  let ficha = 0;
  let actual = null;
  let audio = null;
  let temporizadores = [];

  function elegirVoz() {
    if (!synth) return null;
    const voces = synth.getVoices().filter((v) => /^es([-_]|$)/i.test(v.lang));
    if (!voces.length) return null;
    const orden = ['es-co', 'es-419', 'es-us', 'es-mx', 'es-ar', 'es-cl', 'es-es'];
    const puntuar = (v) => {
      const l = v.lang.toLowerCase().replace('_', '-');
      let p = orden.indexOf(l); p = p < 0 ? 20 : p;
      if (/google/i.test(v.name)) p -= 5;
      if (/natural|neural|online/i.test(v.name)) p -= 3;
      return p;
    };
    return voces.sort((a, b) => puntuar(a) - puntuar(b))[0];
  }
  if (synth) {
    voz = elegirVoz();
    synth.addEventListener?.('voiceschanged', () => { voz = elegirVoz(); });
  }

  function limpiar() {
    temporizadores.forEach(clearTimeout); temporizadores = [];
    if (audio) { audio.pause(); audio.src = ''; audio = null; }
    if (synth) synth.cancel();
  }

  function detener() {
    ficha++;
    limpiar();
    alSubtitulo('');
    if (actual) { const id = actual; actual = null; alCambio(id, false); }
  }

  function terminar(mi, id) {
    if (mi !== ficha) return;
    alSubtitulo('');
    actual = null;
    alCambio(id, false);
  }

  function porTiempo(lista, mi, id, duracionTotal = null) {
    const palabras = lista.map((f) => f.split(/\s+/).length);
    const suma = palabras.reduce((a, b) => a + b, 0);
    const total = duracionTotal ?? (suma / 150) * 60;
    let acumulado = 0;
    lista.forEach((f, i) => {
      const ini = (acumulado / suma) * total * 1000;
      temporizadores.push(setTimeout(() => { if (mi === ficha) alSubtitulo(f); }, ini));
      acumulado += palabras[i];
    });
    if (!duracionTotal) temporizadores.push(setTimeout(() => terminar(mi, id), total * 1000 + 400));
  }

  function decir(id, texto, { audio: urlAudio = null } = {}) {
    detener();
    const mi = ++ficha;
    actual = id;
    alCambio(id, true);
    const lista = frases(texto);

    if (urlAudio) {
      audio = new Audio(urlAudio);
      audio.addEventListener('loadedmetadata', () => porTiempo(lista, mi, id, audio.duration), { once: true });
      audio.addEventListener('ended', () => terminar(mi, id), { once: true });
      audio.play().catch(() => porTiempo(lista, mi, id));
      return;
    }
    if (!synth || !(voz = voz || elegirVoz())) {
      porTiempo(lista, mi, id);
      return 'sin-voz';
    }
    let i = 0;
    const siguiente = () => {
      if (mi !== ficha) return;
      if (i >= lista.length) return terminar(mi, id);
      const u = new SpeechSynthesisUtterance(lista[i]);
      u.voice = voz; u.lang = voz.lang; u.rate = 0.98; u.pitch = 1;
      const frase = lista[i];
      u.onstart = () => { if (mi === ficha) alSubtitulo(frase); };
      u.onend = () => { i++; siguiente(); };
      u.onerror = (e) => { if (e.error === 'interrupted' || e.error === 'canceled') return; i++; siguiente(); };
      synth.speak(u);
    };
    siguiente();
    return 'voz';
  }

  return {
    decir,
    detener,
    get hablando() { return actual; },
    get tieneVoz() { return Boolean(synth && (voz || elegirVoz())); },
    get nombreVoz() { return voz ? `${voz.name} (${voz.lang})` : null; },
  };
}
