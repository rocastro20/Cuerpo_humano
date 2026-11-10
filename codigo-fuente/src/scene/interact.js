/*
 * Interacción directa con la escena: arrastrar para girar con inercia,
 * clic para viajar a una parada y clic en el objeto actual para la sorpresa.
 */
import * as THREE from 'three';

export function crearInteraccion({ canvas, mundo, cursor, verbos, estacionActual, alViajar, alSorpresa }) {
  const ray = new THREE.Raycaster();
  const puntero = new THREE.Vector2();
  const esfera = new THREE.Sphere();
  const inercia = new Array(7).fill(0);
  let arrastre = null;
  let sobre = -1;

  function golpear(ev) {
    const r = canvas.getBoundingClientRect();
    puntero.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(puntero, mundo.camara);
    let mejor = -1, dist = Infinity;
    const actual = estacionActual();
    for (let i = 0; i < 7; i++) {
      if (i === 0 && actual > 0) continue; // la arepa ya está dentro del cuerpo
      if (i === 6 && actual < 5) continue; // el balón solo al final
      esfera.set(mundo.centroMundo(i), mundo.radios[i]);
      const p = ray.ray.intersectSphere(esfera, new THREE.Vector3());
      if (p) {
        const d = p.distanceTo(ray.ray.origin) - (i === actual ? 0.6 : 0);
        if (d < dist) { dist = d; mejor = i; }
      }
    }
    return mejor;
  }

  function rotulo(i) {
    if (i < 0) return null;
    const actual = estacionActual();
    if (i === actual) return i === 6 ? 'Clic: ¡otro gol!' : 'Arrastra para girar · clic: sorpresa';
    return `Viajar a: ${verbos[i]}`;
  }

  canvas.addEventListener('pointerdown', (ev) => {
    const i = golpear(ev);
    if (i < 0) return;
    arrastre = { i, x: ev.clientX, y: ev.clientY, x0: ev.clientX, y0: ev.clientY, movio: false, id: ev.pointerId };
    inercia[i] = 0;
    cursor.estado('arrastrando', true);
  });

  canvas.addEventListener('pointermove', (ev) => {
    if (arrastre && ev.pointerId === arrastre.id) {
      const dx = ev.clientX - arrastre.x, dy = ev.clientY - arrastre.y;
      arrastre.x = ev.clientX; arrastre.y = ev.clientY;
      if (Math.abs(ev.clientX - arrastre.x0) + Math.abs(ev.clientY - arrastre.y0) > 6) {
        if (!arrastre.movio) { arrastre.movio = true; try { canvas.setPointerCapture(ev.pointerId); } catch { /* sin captura */ } }
      }
      const rot = mundo.rotador(arrastre.i);
      if (rot && arrastre.movio) {
        rot.rotation.y += dx * 0.009;
        rot.rotation.x = Math.max(-0.6, Math.min(0.6, rot.rotation.x + dy * 0.004));
        inercia[arrastre.i] = dx * 0.009;
      }
      return;
    }
    if (ev.pointerType !== 'mouse') return;
    const i = golpear(ev);
    if (i !== sobre) { sobre = i; cursor.rotulo(rotulo(i)); }
  });

  function soltar(ev) {
    if (!arrastre || ev.pointerId !== arrastre.id) return;
    const { i, movio } = arrastre;
    arrastre = null;
    cursor.estado('arrastrando', false);
    try { canvas.releasePointerCapture(ev.pointerId); } catch { /* nada */ }
    if (!movio && ev.type === 'pointerup') {
      if (i === estacionActual()) alSorpresa(i);
      else alViajar(i);
    }
  }
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', soltar);
  canvas.addEventListener('pointerleave', () => { if (!arrastre) { sobre = -1; cursor.rotulo(null); } });

  return {
    cuadro(reducido) {
      for (let i = 0; i < 7; i++) {
        if (Math.abs(inercia[i]) < 0.0001 || (arrastre && arrastre.i === i)) continue;
        const rot = mundo.rotador(i);
        if (rot) rot.rotation.y += inercia[i];
        inercia[i] *= reducido ? 0.5 : 0.94;
      }
    },
  };
}
