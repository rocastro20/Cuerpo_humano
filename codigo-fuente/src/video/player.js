/*
 * Video incrustado como base64 en un script clásico (window.VIDEO_DATA) y
 * subtítulos creados con JavaScript: funciona en hosting y en file://.
 */
export function iniciarVideo(raiz, video) {
  const v = raiz.querySelector('[data-video]');
  if (!v) return;
  const sub = raiz.querySelector('[data-sub-video]');
  const cc = raiz.querySelector('[data-cc]');
  const datos = window.VIDEO_DATA;
  if (!datos || !datos.b64) { v.closest('figure').hidden = true; return; }
  let url = null;
  function preparar() {
    if (url) return;
    const bin = atob(datos.b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    url = URL.createObjectURL(new Blob([bytes], { type: datos.mime }));
    v.src = url;
  }
  if (datos.posters?.poster) v.poster = datos.posters.poster;
  // Prepara el video cuando la figura se acerca a la pantalla
  const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { preparar(); io.disconnect(); } }, { rootMargin: '600px' });
  io.observe(v);
  let activos = true;
  let anim = null;
  const pintar = () => {
    if (!activos) { sub.textContent = ''; return; }
    const t = v.currentTime;
    const c = video.subtitulos.find((s) => t >= s.ini && t <= s.fin);
    const texto = c ? c.texto : '';
    if (sub.textContent !== texto) sub.textContent = texto;
  };
  const bucle = () => { pintar(); if (!v.paused) anim = requestAnimationFrame(bucle); };
  v.addEventListener('play', () => { cancelAnimationFrame(anim); bucle(); });
  v.addEventListener('seeked', pintar);
  v.addEventListener('timeupdate', pintar);
  v.addEventListener('ended', () => { sub.textContent = ''; });
  cc.addEventListener('click', () => {
    activos = !activos;
    cc.setAttribute('aria-pressed', String(activos));
    pintar();
  });
  return { pausar: () => v.pause() };
}
