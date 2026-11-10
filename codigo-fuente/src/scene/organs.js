/*
 * Órganos estilizados construidos con geometría procedural (sin modelos externos).
 * Cada constructor devuelve una «estación»:
 *   { grupo, rot, ajustes[], hit:{centro, radio}, actualizar(dt, t, datos, activa), sorpresa() }
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/* ── utilidades ── */
function aleatorio(semilla = 1) {
  let s = semilla >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const suave = (x) => x * x * (3 - 2 * x);

function deformar(geo, fn) {
  const p = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    fn(v);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

/** Registra un material para que el mundo pueda atenuarlo según la parada. */
function atenuable(lista, m, base = 1, siempreSinProfundidad = false) {
  m.transparent = true;
  m.opacity = base;
  lista.push((vis) => {
    m.opacity = base * vis;
    m.depthWrite = !siempreSinProfundidad && vis > 0.7;
    m.visible = vis > 0.01;
  });
  return m;
}

function organico(lista, tex, color, extra = {}, base = 1) {
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.48,
    metalness: 0.02,
    bumpMap: tex.tejido,
    bumpScale: 1.4,
    emissive: new THREE.Color(extra.emissive || color),
    emissiveIntensity: extra.emissiveIntensity ?? 0.1,
    ...extra.props,
  });
  return atenuable(lista, m, base, extra.sinProfundidad);
}

/* Materiales de partículas: el mundo ajusta su escala al tamaño de la pantalla. */
export const materialesParticulas = new Set();

/* Sistema de partículas con color y transparencia por partícula. */
export class Particulas {
  constructor(n, tex, { tam = 0.18, aditivo = true } = {}) {
    this.n = n;
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(n * 3);
    this.col = new Float32Array(n * 3).fill(1);
    this.alfa = new Float32Array(n);
    this.tam = new Float32Array(n).fill(tam);
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('tinte', new THREE.BufferAttribute(this.col, 3));
    g.setAttribute('alfa', new THREE.BufferAttribute(this.alfa, 1));
    g.setAttribute('tam', new THREE.BufferAttribute(this.tam, 1));
    this.mat = new THREE.ShaderMaterial({
      uniforms: { mapa: { value: tex.brillo }, opacidad: { value: 1 }, escala: { value: 300 } },
      vertexShader: `attribute vec3 tinte; attribute float alfa; attribute float tam; varying vec3 vC; varying float vA;
        uniform float escala;
        void main(){ vC=tinte; vA=alfa; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=tam*escala/max(0.1,-mv.z); gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `uniform sampler2D mapa; uniform float opacidad; varying vec3 vC; varying float vA;
        void main(){ vec4 t=texture2D(mapa,gl_PointCoord); gl_FragColor=vec4(vC, t.a*vA*opacidad); if(gl_FragColor.a<0.01) discard; }`,
      transparent: true,
      depthWrite: false,
      blending: aditivo ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    materialesParticulas.add(this.mat);
    this.puntos = new THREE.Points(g, this.mat);
    this.puntos.frustumCulled = false;
    this.geo = g;
  }
  poner(i, x, y, z, a = 1, c = null, tam = null) {
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.alfa[i] = a;
    if (c) { this.col[i * 3] = c.r; this.col[i * 3 + 1] = c.g; this.col[i * 3 + 2] = c.b; }
    if (tam !== null) this.tam[i] = tam;
  }
  subir() {
    for (const k of ['position', 'tinte', 'alfa', 'tam']) this.geo.attributes[k].needsUpdate = true;
  }
  registrar(lista) {
    lista.push((vis) => { this.mat.uniforms.opacidad.value = vis; this.puntos.visible = vis > 0.01; });
  }
}

function base(nombre) {
  const grupo = new THREE.Group();
  grupo.name = nombre;
  const rot = new THREE.Group();
  grupo.add(rot);
  return { grupo, rot, ajustes: [] };
}

/* Pulso de sorpresa genérico: devuelve 0→1→0 durante «dur» segundos. */
function temporizador() {
  let t = -1, dur = 1;
  return {
    iniciar(d) { t = 0; dur = d; },
    avanzar(dt) { if (t < 0) return 0; t += dt; if (t > dur) { t = -1; return 0; } return Math.sin((t / dur) * Math.PI); },
    get activo() { return t >= 0; },
    get fase() { return t < 0 ? 0 : t / dur; },
  };
}

/* ───────────────────────── Arepa (introducción) ───────────────────────── */
export function construirArepa(tex) {
  const e = base('arepa');
  const lado = organico(e.ajustes, tex, '#D9A85E', { emissiveIntensity: 0.06, props: { bumpScale: 0.6, roughness: 0.85 } });
  const cara = atenuable(e.ajustes, new THREE.MeshStandardMaterial({ map: tex.arepa, bumpMap: tex.arepa, bumpScale: 3, roughness: 0.9, color: '#d8c09a', envMapIntensity: 0.35 }));
  const disco = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.26, 72, 1), [lado, cara, cara]);
  const borde = new THREE.Mesh(new THREE.TorusGeometry(1, 0.13, 18, 96), lado);
  borde.rotation.x = Math.PI / 2;
  const cuerpo = new THREE.Group();
  cuerpo.add(disco, borde);
  cuerpo.rotation.x = 0.72;
  cuerpo.scale.setScalar(0.72);
  e.rot.add(cuerpo);

  // Partículas de nutrientes para la sorpresa
  const nutr = new Particulas(150, tex, { tam: 0.16 });
  nutr.registrar(e.ajustes);
  e.rot.add(nutr.puntos);
  const colores = [new THREE.Color('#FFC94A'), new THREE.Color('#FF6B66'), new THREE.Color('#FFF4D6')];
  const r = aleatorio(7);
  const dirs = Array.from({ length: 150 }, () => v3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(1.4 + r() * 1.6));
  const sorp = temporizador();
  e.hit = { radio: 1.25 };
  e.actualizar = (dt, t) => {
    cuerpo.rotation.z = Math.sin(t * 0.6) * 0.15;
    e.rot.rotation.y += dt * 0.25;
    const s = sorp.avanzar(dt);
    cuerpo.scale.setScalar(0.72 * (1 - s * 0.85));
    for (let i = 0; i < 150; i++) {
      const d = dirs[i];
      const giro = sorp.fase * 6;
      const x = d.x * s, y = d.y * s, z = d.z * s;
      nutr.poner(i, x * Math.cos(giro) - z * Math.sin(giro), y, x * Math.sin(giro) + z * Math.cos(giro), s, colores[i % 3], 0.14 + (i % 3) * 0.04);
    }
    nutr.subir();
  };
  e.sorpresa = () => sorp.iniciar(2.4);
  return e;
}

/* ───────────────────────── 1 · Digestivo ───────────────────────── */
export function construirDigestivo(tex) {
  const e = base('digerir');
  // Estómago en forma de J
  const geoE = deformar(new THREE.SphereGeometry(0.6, 56, 40), (v) => {
    v.x *= 1.35; v.y *= 0.82; v.z *= 0.72;
    v.y += -0.32 * v.x * v.x + 0.05 * v.x;
  });
  const est = new THREE.Mesh(geoE, organico(e.ajustes, tex, '#F08C7C', { emissive: '#FFC94A', emissiveIntensity: 0.08 }));
  est.position.set(-0.45, 1.08, 0.12);
  est.rotation.z = 0.3;
  e.rot.add(est);
  // Esófago
  const eso = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3([v3(-0.95, 2.2, 0.1), v3(-0.9, 1.7, 0.12), v3(-0.95, 1.35, 0.12)]), 30, 0.08, 10),
    organico(e.ajustes, tex, '#E99C8B', { emissiveIntensity: 0.05 })
  );
  e.rot.add(eso);
  // Intestino delgado: serpentina compacta
  const pts = [v3(0.35, 0.86, 0.15)];
  const filas = 7;
  for (let f = 0; f < filas; f++) {
    const y = 0.62 - f * 0.21;
    const dir = f % 2 === 0 ? -1 : 1;
    for (let k = 0; k <= 9; k++) {
      const x = dir * (-0.78 + (1.56 * k) / 9);
      pts.push(v3(x, y + Math.sin(k * 1.4 + f) * 0.05, 0.16 * Math.sin(k * 1.1 + f * 0.7) + 0.08));
    }
  }
  const curva = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.35);
  const delgado = new THREE.Mesh(new THREE.TubeGeometry(curva, 900, 0.1, 14), organico(e.ajustes, tex, '#F4A794', { emissive: '#FFC94A', emissiveIntensity: 0.09 }));
  e.rot.add(delgado);
  // Intestino grueso: marco alrededor
  const grueso = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([v3(-1.0, -1.0, 0.05), v3(-1.12, -0.2, 0.08), v3(-1.08, 0.75, 0.1), v3(-0.5, 0.98, 0.0), v3(0.45, 1.0, -0.05), v3(1.12, 0.72, 0.05), v3(1.15, -0.3, 0.05), v3(0.85, -1.0, 0.08), v3(0.2, -1.22, 0.05)]),
      260, 0.18, 16
    ),
    organico(e.ajustes, tex, '#E0806F', { emissive: '#FFC94A', emissiveIntensity: 0.05 })
  );
  e.rot.add(grueso);
  // El bocado de arepa que viaja
  const bocadoMat = atenuable(e.ajustes, new THREE.SpriteMaterial({ map: tex.brillo, color: '#FFC94A', blending: THREE.AdditiveBlending, depthWrite: false }), 1, true);
  const bocado = new THREE.Sprite(bocadoMat);
  e.rot.add(bocado);
  // Absorción: nutrientes que salen del intestino hacia la sangre
  const abs = new Particulas(70, tex, { tam: 0.11 });
  abs.registrar(e.ajustes);
  e.rot.add(abs.puntos);
  const r = aleatorio(3);
  const semillas = Array.from({ length: 70 }, () => ({ u: r(), vida: r(), dir: v3(r() - 0.5, r() * 0.6 + 0.2, r() * 0.6 + 0.2).normalize() }));
  const amarillo = new THREE.Color('#FFD36E');
  let u = 0;
  const sorp = temporizador();
  e.hit = { radio: 1.6 };
  e.actualizar = (dt, t, datos) => {
    const energia = datos.energia ?? 318;
    const fuerza = clamp(energia / 600, 0.25, 1.6);
    const s = sorp.avanzar(dt);
    u = (u + dt * (0.035 + fuerza * 0.03) * (1 + s * 5)) % 1;
    curva.getPointAt(u, bocado.position);
    bocado.scale.setScalar(0.32 + fuerza * 0.3 + s * 0.6);
    const p = new THREE.Vector3();
    for (let i = 0; i < 70; i++) {
      const sd = semillas[i];
      sd.vida += dt * (0.25 + fuerza * 0.2);
      if (sd.vida > 1) { sd.vida = 0; sd.u = r(); }
      curva.getPointAt(sd.u, p);
      p.addScaledVector(sd.dir, sd.vida * 0.55);
      abs.poner(i, p.x, p.y, p.z, Math.sin(sd.vida * Math.PI) * 0.85 * clamp(fuerza, 0.4, 1), amarillo);
    }
    abs.subir();
    delgado.scale.setScalar(1 + Math.sin(t * 2.2) * 0.008 + s * 0.03);
  };
  e.sorpresa = () => sorp.iniciar(2.2);
  e.estomagoLocal = est.position.clone();
  return e;
}

/* ───────────────────────── 2 · Respiratorio ───────────────────────── */
export function construirRespiratorio(tex) {
  const e = base('respirar');
  const r = aleatorio(11);
  const segmentos = [];
  const puntas = [];
  const caminos = [];
  const raiz = v3(0, 0.62, 0);
  segmentos.push([v3(0, 1.75, 0), raiz.clone(), 0.11]);
  function ramificar(p, dir, largo, radio, prof, camino) {
    const fin = p.clone().addScaledVector(dir, largo);
    segmentos.push([p.clone(), fin.clone(), radio]);
    const c = [...camino, fin.clone()];
    if (prof === 0) { puntas.push(fin); caminos.push(c); return; }
    for (const lado of [-1, 1]) {
      const eje = v3(r() - 0.5, r() - 0.5, r() - 0.5).cross(dir).normalize();
      const d = dir.clone().applyAxisAngle(eje, lado * (0.42 + r() * 0.25)).normalize();
      d.y -= 0.12; d.normalize();
      ramificar(fin, d, largo * (0.7 + r() * 0.1), radio * 0.7, prof - 1, c);
    }
  }
  ramificar(raiz, v3(-0.62, -0.78, 0.05).normalize(), 0.55, 0.085, 4, [v3(0, 1.75, 0), raiz.clone()]);
  ramificar(raiz, v3(0.6, -0.8, -0.02).normalize(), 0.55, 0.085, 4, [v3(0, 1.75, 0), raiz.clone()]);

  const cil = new THREE.CylinderGeometry(1, 1, 1, 10, 1);
  const matArbol = organico(e.ajustes, tex, '#9AE8EC', { emissive: '#45D6DE', emissiveIntensity: 0.22 });
  const arbol = new THREE.InstancedMesh(cil, matArbol, segmentos.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), arriba = v3(0, 1, 0);
  segmentos.forEach(([a, b, rad], i) => {
    const d = b.clone().sub(a);
    q.setFromUnitVectors(arriba, d.clone().normalize());
    m.compose(a.clone().add(b).multiplyScalar(0.5), q, v3(rad, d.length(), rad));
    arbol.setMatrixAt(i, m);
  });
  const gArbol = new THREE.Group();
  gArbol.add(arbol);
  // Anillos de la tráquea
  const anillos = new THREE.InstancedMesh(new THREE.TorusGeometry(0.12, 0.022, 8, 24), matArbol, 9);
  for (let i = 0; i < 9; i++) {
    m.compose(v3(0, 0.78 + i * 0.11, 0), new THREE.Quaternion().setFromAxisAngle(v3(1, 0, 0), Math.PI / 2), v3(1, 1, 1));
    anillos.setMatrixAt(i, m);
  }
  gArbol.add(anillos);
  // Alvéolos en racimos
  const porPunta = 7;
  const alv = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 10), organico(e.ajustes, tex, '#C4F4F6', { emissive: '#45D6DE', emissiveIntensity: 0.35 }), puntas.length * porPunta);
  const baseAlv = [];
  puntas.forEach((p, i) => {
    for (let k = 0; k < porPunta; k++) {
      const off = v3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(0.06 + r() * 0.04);
      baseAlv.push({ p: p.clone().add(off), s: 0.045 + r() * 0.025 });
    }
  });
  gArbol.add(alv);
  e.rot.add(gArbol);
  // Lóbulos translúcidos
  const lobulos = [];
  for (const lado of [-1, 1]) {
    const g = deformar(new THREE.SphereGeometry(1, 56, 40), (v) => {
      if (v.x * -lado > 0.25) v.x = -lado * (0.25 + (v.x * -lado - 0.25) * 0.35);
      v.y += -0.12 * v.x * v.x;
      if (v.y > 0.5) { v.x *= 1 - (v.y - 0.5) * 0.5; v.z *= 1 - (v.y - 0.5) * 0.4; }
    });
    const mat = organico(e.ajustes, tex, '#45D6DE', { emissiveIntensity: 0.3, sinProfundidad: true, props: { roughness: 0.15, side: THREE.DoubleSide, bumpScale: 0.6 } }, 0.2);
    const lob = new THREE.Mesh(g, mat);
    lob.position.set(lado * 0.88, -0.05, 0);
    lob.scale.set(0.92, 1.35, 0.78);
    lob.renderOrder = 2;
    lobulos.push(lob);
    e.rot.add(lob);
  }
  // Oxígeno que entra
  const o2 = new Particulas(60, tex, { tam: 0.12 });
  o2.registrar(e.ajustes);
  e.rot.add(o2.puntos);
  const viajeros = Array.from({ length: 60 }, (_, i) => ({ c: caminos[i % caminos.length], u: r() }));
  const cian = new THREE.Color('#8FF3F8');
  let fase = 0;
  const sorp = temporizador();
  const tmp = v3(0, 0, 0);
  e.hit = { radio: 1.8 };
  e.actualizar = (dt, t, datos) => {
    const fr = datos.fr ?? 18;
    const s = sorp.avanzar(dt);
    fase += dt * (fr / 60) * Math.PI * 2 * (1 - s * 0.5);
    const resp = 0.5 - 0.5 * Math.cos(fase);
    const amp = 1 + s * 1.4;
    lobulos.forEach((l) => l.scale.set(0.92 * (1 + 0.07 * resp * amp), 1.35 * (1 + 0.05 * resp * amp), 0.78 * (1 + 0.08 * resp * amp)));
    baseAlv.forEach((a, i) => {
      m.compose(a.p, q.identity(), tmp.setScalar(a.s * (1 + 0.35 * resp * amp)));
      alv.setMatrixAt(i, m);
    });
    alv.instanceMatrix.needsUpdate = true;
    gArbol.scale.setScalar(1 + 0.02 * resp * amp);
    const inspirando = Math.sin(fase) > 0 ? 1 : 0.25;
    for (let i = 0; i < 60; i++) {
      const v = viajeros[i];
      v.u += dt * 0.35 * inspirando * (1 + s * 2);
      if (v.u > 1) { v.u = 0; v.c = caminos[Math.floor(r() * caminos.length)]; }
      const n = v.c.length - 1;
      const f = v.u * n, k = Math.min(n - 1, Math.floor(f)), w = f - k;
      tmp.lerpVectors(v.c[k], v.c[k + 1], w);
      o2.poner(i, tmp.x, tmp.y, tmp.z, Math.sin(v.u * Math.PI) * 0.9, cian);
    }
    o2.subir();
  };
  e.sorpresa = () => sorp.iniciar(3);
  return e;
}

/* ───────────────────────── 3 · Circulatorio ───────────────────────── */
export function construirCirculatorio(tex) {
  const e = base('latir');
  const corazon = new THREE.Group();
  const geoV = deformar(new THREE.SphereGeometry(0.6, 64, 48), (v) => {
    v.y *= 1.12;
    if (v.y < 0) { const k = 1 + v.y * 0.62; v.x *= k; v.z *= k; }
    v.x += 0.08 * Math.sin(v.y * 3);
  });
  const matC = organico(e.ajustes, tex, '#E8504A', { emissive: '#FF6B66', emissiveIntensity: 0.18 });
  const ventr = new THREE.Mesh(geoV, matC);
  ventr.rotation.z = -0.42;
  corazon.add(ventr);
  const auriculaD = new THREE.Mesh(new THREE.SphereGeometry(0.33, 40, 30), matC);
  auriculaD.position.set(-0.36, 0.5, 0.06);
  const auriculaI = new THREE.Mesh(new THREE.SphereGeometry(0.29, 40, 30), matC);
  auriculaI.position.set(0.28, 0.56, -0.2);
  corazon.add(auriculaD, auriculaI);
  const matA = organico(e.ajustes, tex, '#E2463F', { emissive: '#FF6B66', emissiveIntensity: 0.15 });
  const matV = organico(e.ajustes, tex, '#6C79D8', { emissive: '#8C95F0', emissiveIntensity: 0.15 });
  const tubo = (pts, rad, mat) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, rad, 14), mat);
  corazon.add(tubo([v3(0.02, 0.4, 0.05), v3(0.04, 0.95, 0.06), v3(-0.05, 1.28, -0.12), v3(0.34, 1.22, -0.45), v3(0.46, 0.6, -0.56), v3(0.46, -0.6, -0.56)], 0.11, matA));
  corazon.add(tubo([v3(0.14, 0.32, 0.36), v3(0.2, 0.8, 0.3), v3(0.5, 0.98, 0.1), v3(0.95, 0.95, -0.05)], 0.09, matV));
  corazon.add(tubo([v3(0.2, 0.8, 0.3), v3(-0.2, 0.98, 0.15), v3(-0.6, 1.0, 0.0)], 0.08, matV));
  corazon.add(tubo([v3(-0.38, 1.35, -0.05), v3(-0.38, 0.95, -0.02), v3(-0.36, 0.55, 0.02)], 0.09, matV));
  e.rot.add(corazon);
  // Glóbulos rojos bicóncavos en un circuito cerrado
  const perfil = [[0.001, 0.011], [0.025, 0.017], [0.05, 0.026], [0.068, 0.021], [0.079, 0], [0.068, -0.021], [0.05, -0.026], [0.025, -0.017], [0.001, -0.011]].map(([x, y]) => new THREE.Vector2(x, y));
  const geoG = new THREE.LatheGeometry(perfil, 18).scale(1.4, 1.4, 1.4);
  const nG = 240;
  const matG = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0, emissive: '#7A1020', emissiveIntensity: 0.4, transparent: true });
  e.ajustes.push((vis) => { matG.opacity = vis * vis; matG.depthWrite = vis > 0.7; matG.visible = vis > 0.02; });
  const globulos = new THREE.InstancedMesh(geoG, matG, nG);
  const circuito = new THREE.CatmullRomCurve3(
    [v3(0.05, 1.25, -0.1), v3(0.9, 1.6, 0.5), v3(1.75, 0.5, 0.8), v3(1.3, -0.95, 0.7), v3(0, -1.5, 0.55), v3(-1.35, -0.85, 0.65), v3(-1.7, 0.5, 0.55), v3(-0.95, 1.55, 0.35)],
    true
  );
  const r = aleatorio(5);
  const gl = Array.from({ length: nG }, () => ({ u: r(), off: v3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(0.28), giro: v3(r(), r(), r()) }));
  e.rot.add(globulos);
  const rojo = new THREE.Color('#FF3B3B'), oscuro = new THREE.Color('#7C2E6A'), col = new THREE.Color();
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), eul = new THREE.Euler(), p = v3(0, 0, 0), uno = v3(1, 1, 1);
  let fase = 0;
  const sorp = temporizador();
  e.hit = { radio: 1.35 };
  e.actualizar = (dt, t, datos) => {
    const lpm = datos.lpm ?? 80;
    const s = sorp.avanzar(dt);
    fase += dt * (lpm / 60) * (1 + s * 0.6);
    const x = fase % 1;
    const latido = Math.exp(-((x / 0.06) ** 2)) + 0.6 * Math.exp(-(((x - 0.17) / 0.06) ** 2));
    ventr.scale.setScalar(1 + 0.07 * latido + s * 0.12);
    auriculaD.scale.setScalar(1 + 0.08 * Math.exp(-(((x - 0.85) / 0.07) ** 2)));
    auriculaI.scale.copy(auriculaD.scale);
    matC.emissiveIntensity = 0.15 + latido * 0.35 + s * 0.4;
    const vel = (lpm / 80) * 0.06 * (1 + s * 3) * (1 + latido * 0.8);
    for (let i = 0; i < nG; i++) {
      const g = gl[i];
      g.u = (g.u + dt * vel) % 1;
      circuito.getPointAt(g.u, p).add(g.off);
      eul.set(g.giro.x * 6 + t * 0.6, g.giro.y * 6 + t * 0.4, g.giro.z * 6);
      m.compose(p, q.setFromEuler(eul), uno);
      globulos.setMatrixAt(i, m);
      // Sale con oxígeno (rojo brillante) por la aorta y vuelve sin él (más oscuro)
      col.copy(rojo).lerp(oscuro, suave(clamp((g.u - 0.45) / 0.4)));
      globulos.setColorAt(i, col);
    }
    globulos.instanceMatrix.needsUpdate = true;
    if (globulos.instanceColor) globulos.instanceColor.needsUpdate = true;
    e.ultimoLatido = latido;
  };
  e.sorpresa = () => sorp.iniciar(1.6);
  return e;
}

/* ───────────────────────── 4 · Nervioso ───────────────────────── */
export function construirNervioso(tex) {
  const e = base('sentir');
  const r = aleatorio(21);
  const nodos = [];
  while (nodos.length < 150) {
    const lado = nodos.length % 2 ? 1 : -1;
    const p = v3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1);
    if (p.lengthSq() > 1) continue;
    p.set(lado * 0.46 + p.x * 0.72, p.y * 0.62 + 0.05, p.z * 0.95);
    if (p.x * lado < 0.06) continue;
    nodos.push(p);
  }
  // tronco encefálico
  for (let i = 0; i < 6; i++) nodos.push(v3(0, -0.45 - i * 0.09, -0.25 - i * 0.02));
  const matN = organico(e.ajustes, tex, '#D9CCFF', { emissive: '#B49BFF', emissiveIntensity: 0.9, props: { bumpMap: null } });
  const neuronas = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.048, 1), matN, nodos.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), tam = v3(1, 1, 1);
  nodos.forEach((p, i) => { m.compose(p, q, tam.setScalar(0.7 + r() * 0.8)); neuronas.setMatrixAt(i, m); });
  e.rot.add(neuronas);
  // Conexiones con los 3 vecinos más cercanos
  const aristas = [];
  const vecinos = nodos.map(() => []);
  nodos.forEach((a, i) => {
    const cerca = nodos.map((b, j) => [j, a.distanceToSquared(b)]).filter(([j]) => j !== i).sort((x, y) => x[1] - y[1]).slice(0, 3);
    cerca.forEach(([j]) => {
      if (!aristas.some(([x, y]) => (x === j && y === i))) aristas.push([i, j]);
      vecinos[i].push(j); vecinos[j].push(i);
    });
  });
  const lp = new Float32Array(aristas.length * 6);
  aristas.forEach(([a, b], k) => { nodos[a].toArray(lp, k * 6); nodos[b].toArray(lp, k * 6 + 3); });
  const geoL = new THREE.BufferGeometry();
  geoL.setAttribute('position', new THREE.BufferAttribute(lp, 3));
  const lineas = new THREE.LineSegments(geoL, atenuable(e.ajustes, new THREE.LineBasicMaterial({ color: '#B49BFF' }), 0.42, true));
  e.rot.add(lineas);
  // Cáscara del cerebro
  for (const lado of [-1, 1]) {
    const c = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 30), organico(e.ajustes, tex, '#B49BFF', { emissiveIntensity: 0.4, sinProfundidad: true, props: { side: THREE.BackSide, roughness: 0.3 } }, 0.1));
    c.position.set(lado * 0.46, 0.05, 0);
    c.scale.set(0.8, 0.7, 1.02);
    e.rot.add(c);
  }
  // Médula espinal: baja hasta la columna (estación «mover»)
  const medulaCurva = new THREE.CatmullRomCurve3([v3(0, -0.5, -0.27), v3(0, -0.95, -0.55), v3(0, -1.55, -1.12), v3(0, -3.5, -1.2), v3(0, -6.0, -1.1), v3(0, -8.6, -1.18)]);
  const medula = new THREE.Mesh(new THREE.TubeGeometry(medulaCurva, 160, 0.045, 10), organico(e.ajustes, tex, '#CBB8FF', { emissive: '#B49BFF', emissiveIntensity: 0.7, props: { bumpMap: null } }));
  e.grupo.add(medula); // fuera de «rot»: no gira con el arrastre
  // Impulsos
  const imp = new Particulas(70, tex, { tam: 0.14 });
  imp.registrar(e.ajustes);
  e.rot.add(imp.puntos);
  const viajes = Array.from({ length: 70 }, () => { const a = Math.floor(r() * 150); return { a, b: vecinos[a][0], u: r() }; });
  const lav = new THREE.Color('#E6DDFF');
  const bajada = new Particulas(6, tex, { tam: 0.3 });
  bajada.registrar(e.ajustes);
  e.grupo.add(bajada.puntos);
  const descargas = [];
  const tmp = v3(0, 0, 0);
  const sorp = temporizador();
  e.hit = { radio: 1.35 };
  e.actualizar = (dt, t, datos) => {
    const s = sorp.avanzar(dt);
    matN.emissiveIntensity = 0.7 + Math.sin(t * 3) * 0.1 + s * 2.2;
    for (let i = 0; i < 70; i++) {
      const v = viajes[i];
      v.u += dt * (1.3 + s * 4);
      if (v.u >= 1) { v.a = v.b; const vs = vecinos[v.a]; v.b = vs[Math.floor(r() * vs.length)]; v.u = 0; }
      tmp.lerpVectors(nodos[v.a], nodos[v.b], v.u);
      imp.poner(i, tmp.x, tmp.y, tmp.z, 0.95, lav);
    }
    imp.subir();
    for (let i = 0; i < 6; i++) {
      const d = descargas[i];
      if (d) {
        d.u += dt * 0.9;
        if (d.u > 1) descargas[i] = null;
        else { medulaCurva.getPointAt(d.u, tmp); bajada.poner(i, tmp.x, tmp.y, tmp.z, 1 - d.u * 0.5, lav); continue; }
      }
      bajada.poner(i, 0, 0, 0, 0);
    }
    bajada.subir();
  };
  e.impulso = () => { const libre = [0, 1, 2, 3, 4, 5].find((i) => !descargas[i]); if (libre !== undefined) descargas[libre] = { u: 0 }; };
  e.sorpresa = () => { sorp.iniciar(1.4); e.impulso(); };
  return e;
}

/* ───────────────────────── 5 · Locomotor ───────────────────────── */
export function construirLocomotor(tex) {
  const e = base('mover');
  const matHueso = organico(e.ajustes, tex, '#EFE6D2', { emissive: '#7EE5A0', emissiveIntensity: 0.05, props: { bumpScale: 0.8, roughness: 0.55 } });
  // Vértebra: cuerpo + apófisis espinosa + apófisis transversas
  const cuerpoV = new THREE.CylinderGeometry(0.2, 0.21, 0.15, 22);
  const espinosa = new THREE.BoxGeometry(0.07, 0.08, 0.3).translate(0, -0.02, -0.28);
  const transversas = new THREE.BoxGeometry(0.5, 0.05, 0.07).translate(0, 0, -0.12);
  const geoV = mergeGeometries([cuerpoV, espinosa, transversas].map((g) => g.toNonIndexed()));
  geoV.computeVertexNormals();
  const NV = 24;
  const vert = new THREE.InstancedMesh(geoV, matHueso, NV);
  const matDisco = atenuable(e.ajustes, new THREE.MeshStandardMaterial({ roughness: 0.4, emissive: '#7EE5A0', emissiveIntensity: 0.35, color: '#7EE5A0' }));
  const discos = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.19, 0.19, 0.06, 22), matDisco, NV - 1);
  e.rot.add(vert, discos);
  const sacro = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.6, 20), matHueso);
  sacro.rotation.x = Math.PI;
  e.rot.add(sacro);
  // Pelvis
  const pelvis = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.12, 14, 44), matHueso);
  pelvis.rotation.x = Math.PI / 2 - 0.25;
  pelvis.scale.set(1, 0.8, 0.62);
  pelvis.position.set(0, -4.05, 0.05);
  e.rot.add(pelvis);
  // Piernas
  const pierna = (lado) => {
    const cadera = new THREE.Group();
    cadera.position.set(lado * 0.42, -4.1, 0.05);
    const femur = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 1.42, 8, 16), matHueso);
    femur.position.y = -0.85;
    const rodilla = new THREE.Group();
    rodilla.position.y = -1.7;
    const rotula = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 16), matHueso);
    const tibia = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 1.38, 8, 16), matHueso);
    tibia.position.y = -0.8;
    const pie = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.12, 0.5, 3, 0.05), matHueso);
    pie.position.set(0, -1.6, 0.15);
    rodilla.add(rotula, tibia, pie);
    cadera.add(femur, rodilla);
    e.rot.add(cadera);
    return { cadera, rodilla };
  };
  pierna(-1);
  const derecha = pierna(1);
  // Maleta
  const matMaleta = organico(e.ajustes, tex, '#4B3A9A', { emissive: '#7EE5A0', emissiveIntensity: 0.06, props: { bumpScale: 0.3, roughness: 0.75 } });
  const maleta = new THREE.Group();
  const caja = new THREE.Mesh(new RoundedBoxGeometry(1, 1, 1, 4, 0.14), matMaleta);
  maleta.add(caja);
  const matCorrea = organico(e.ajustes, tex, '#2E2466', { emissiveIntensity: 0.02 });
  for (const lado of [-1, 1]) {
    const correa = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 8, 30, Math.PI * 1.1), matCorrea);
    correa.rotation.y = Math.PI / 2;
    correa.position.set(lado * 0.28, 0.32, 0.42);
    maleta.add(correa);
  }
  e.rot.add(maleta);

  const L = 7.2;
  const curvaNatural = (s) => {
    if (s < 0.24) return 0.13 * Math.sin((Math.PI * s) / 0.24);
    if (s < 0.68) return -0.2 * Math.sin((Math.PI * (s - 0.24)) / 0.44);
    return 0.17 * Math.sin((Math.PI * (s - 0.68)) / 0.32);
  };
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), uno = v3(1, 1, 1), arriba = v3(0, 1, 0);
  const verde = new THREE.Color('#7EE5A0'), ambar = new THREE.Color('#FFC94A'), rojo = new THREE.Color('#FF6B66');
  let inclinActual = 0, pctActual = 12.5, kgActual = 5;
  const sorp = temporizador();
  const pos = (s, incl) => {
    const y = 3.6 - s * L;
    const z = curvaNatural(s) + incl * Math.pow(1 - s, 2) * 1.9;
    return v3(0, y, z);
  };
  function colocar(incl, kg, pct) {
    for (let i = 0; i < NV; i++) {
      const s = i / (NV - 1) * 0.93;
      const p = pos(s, incl), p2 = pos(s + 0.01, incl);
      const tang = p.clone().sub(p2).normalize();
      q.setFromUnitVectors(arriba, tang);
      const esc = 0.78 + s * 0.42;
      m.compose(p, q, v3(esc, 1, esc));
      vert.setMatrixAt(i, m);
      if (i < NV - 1) {
        const pm = pos(s + 0.93 / (NV - 1) / 2, incl);
        m.compose(pm, q, v3(esc, 1, esc));
        discos.setMatrixAt(i, m);
      }
    }
    vert.instanceMatrix.needsUpdate = true;
    discos.instanceMatrix.needsUpdate = true;
    const fin = pos(0.97, incl);
    sacro.position.copy(fin).add(v3(0, -0.2, -0.02));
    // Maleta pegada a la espalda en la zona dorsal
    const pM = pos(0.34, incl), pM2 = pos(0.36, incl);
    const t2 = pM.clone().sub(pM2).normalize();
    const ancho = 0.9 + kg * 0.035, alto = 1.0 + kg * 0.045, fondo = 0.34 + kg * 0.03;
    caja.scale.set(ancho, alto, fondo);
    maleta.quaternion.setFromUnitVectors(arriba, t2);
    maleta.position.copy(pM).add(v3(0, 0, -(0.62 + fondo / 2)).applyQuaternion(maleta.quaternion));
    const c = pct <= 10 ? verde : pct <= 20 ? verde.clone().lerp(ambar, (pct - 10) / 10) : ambar.clone().lerp(rojo, clamp((pct - 20) / 10));
    matDisco.color.copy(c);
    matDisco.emissive.copy(c);
  }
  colocar(0, 5, 12.5);
  let patada = -1;
  e.hit = { radio: 2.2 };
  e.actualizar = (dt, t, datos) => {
    const pct = datos.maletaPct ?? 12.5;
    const kg = datos.maletaKg ?? 5;
    const s = sorp.avanzar(dt);
    const objetivo = clamp((pct - 6) / 24) * 0.42 * (1 - s);
    inclinActual += (objetivo - inclinActual) * Math.min(1, dt * 3);
    pctActual += (pct - pctActual) * Math.min(1, dt * 4);
    kgActual += (kg - kgActual) * Math.min(1, dt * 4);
    colocar(inclinActual, kgActual, pctActual);
    maleta.position.y += Math.sin(s * Math.PI * 3) * 0.15;
    if (patada >= 0) {
      patada += dt;
      const f = patada;
      const ang = f < 0.35 ? -0.7 * suave(f / 0.35) : f < 0.6 ? -0.7 + 1.6 * suave((f - 0.35) / 0.25) : 0.9 * (1 - suave(clamp((f - 0.6) / 0.9)));
      derecha.cadera.rotation.x = -ang;
      derecha.rodilla.rotation.x = f < 0.35 ? 0.9 * suave(f / 0.35) : 0.9 * (1 - suave(clamp((f - 0.35) / 0.25)));
      if (f > 1.6) { patada = -1; derecha.cadera.rotation.x = 0; derecha.rodilla.rotation.x = 0; }
    }
  };
  e.sorpresa = () => sorp.iniciar(1.6);
  e.patear = () => { patada = 0; };
  e.pieDerechoLocal = v3(0.42, -7.35, 0.4);
  return e;
}

/* ───────────────────────── Balón y confeti (el gol) ───────────────────────── */
export function construirBalon(tex) {
  const e = base('balon');
  const blanco = atenuable(e.ajustes, new THREE.MeshStandardMaterial({ color: '#F7F4FF', roughness: 0.4, flatShading: true }));
  const negro = atenuable(e.ajustes, new THREE.MeshStandardMaterial({ color: '#1A1430', roughness: 0.5, side: THREE.DoubleSide }));
  const balon = new THREE.Group();
  balon.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 3), blanco));
  const ico = new THREE.IcosahedronGeometry(1, 0);
  const vistos = [];
  const pa = ico.attributes.position;
  for (let i = 0; i < pa.count; i++) {
    const v = v3(pa.getX(i), pa.getY(i), pa.getZ(i)).normalize();
    if (vistos.some((w) => w.distanceTo(v) < 0.01)) continue;
    vistos.push(v);
    const pent = new THREE.Mesh(new THREE.CircleGeometry(0.105, 5), negro);
    pent.position.copy(v).multiplyScalar(0.318);
    pent.lookAt(v.clone().multiplyScalar(2));
    balon.add(pent);
  }
  e.rot.add(balon);
  const conf = new Particulas(160, tex, { tam: 0.2 });
  conf.registrar(e.ajustes);
  e.grupo.add(conf.puntos);
  const colores = ['#FFC94A', '#45D6DE', '#FF6B66', '#B49BFF', '#7EE5A0'].map((c) => new THREE.Color(c));
  const r = aleatorio(9);
  const piezas = Array.from({ length: 160 }, () => ({ v: v3(r() - 0.5, r() * 0.9 + 0.3, r() - 0.2).normalize().multiplyScalar(2 + r() * 4), c: colores[Math.floor(r() * 5)] }));
  let vuelo = -1;
  const origen = v3(0, 0, 0);
  e.hit = { radio: 0.6 };
  e.actualizar = (dt, t) => {
    if (vuelo < 0) { balon.position.set(0, 0, 0); balon.rotation.y += dt * 0.4; for (let i = 0; i < 160; i++) conf.poner(i, 0, 0, 0, 0); conf.subir(); return; }
    vuelo += dt;
    const f = vuelo;
    if (f > 0.42) {
      const g = f - 0.42;
      balon.position.set(g * 2.6, g * 4.2 - g * g * 2.2, g * 5.2);
      balon.rotation.x += dt * 10;
      balon.scale.setScalar(Math.max(0, 1 - Math.max(0, g - 1.2) * 1.5));
    }
    for (let i = 0; i < 160; i++) {
      const g = Math.max(0, f - 0.45);
      const p = piezas[i];
      conf.poner(i, origen.x + p.v.x * g, origen.y + p.v.y * g - 2.2 * g * g, origen.z + p.v.z * g, g > 0 ? Math.max(0, 1 - g / 2.2) : 0, p.c);
    }
    conf.subir();
    if (f > 3.2) { vuelo = -1; balon.scale.setScalar(1); }
  };
  e.lanzar = () => { vuelo = 0; balon.scale.setScalar(1); };
  e.sorpresa = e.lanzar;
  return e;
}
