/* Cursor temático (glóbulo rojo) con rótulos contextuales. Se desactiva en pantallas táctiles. */
export function crearCursor(el, svg) {
  const nulo = { rotulo() {}, estado() {} };
  if (!window.matchMedia('(pointer: fine)').matches) return nulo;
  document.documentElement.classList.add('cursor-propio');
  el.innerHTML = `${svg}<span class="rotulo"></span>`;
  const rot = el.querySelector('.rotulo');
  let x = -100, y = -100, cx = x, cy = y;
  window.addEventListener('pointermove', (ev) => {
    if (ev.pointerType !== 'mouse') { el.classList.add('oculto'); return; }
    x = ev.clientX; y = ev.clientY;
    const t = ev.target;
    const campo = t.closest?.('input[type="text"], textarea');
    el.classList.toggle('oculto', Boolean(campo));
    el.classList.toggle('sobre-boton', Boolean(t.closest?.('a, button, input, select, label, summary, video')));
  }, { passive: true });
  document.addEventListener('pointerleave', () => el.classList.add('oculto'));
  document.addEventListener('pointerenter', () => el.classList.remove('oculto'));
  const mover = () => {
    cx += (x - cx) * 0.35; cy += (y - cy) * 0.35;
    el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    requestAnimationFrame(mover);
  };
  mover();
  return {
    rotulo(texto) {
      if (texto) rot.textContent = texto;
      el.classList.toggle('con-rotulo', Boolean(texto));
    },
    estado(nombre, on) { el.classList.toggle(nombre, on); },
  };
}
