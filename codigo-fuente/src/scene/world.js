/*
 * Mundo 3D: renderizador, cámara guiada por el desplazamiento, luces y
 * atenuación de las estaciones que no están en foco.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  construirArepa, construirDigestivo, construirRespiratorio, construirCirculatorio,
  construirNervioso, construirLocomotor, construirBalon, materialesParticulas,
} from './organs.js';

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const facil = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/* Posición de cada estación en el «cuerpo» (y hacia arriba). */
const POS = {
  arepa: v3(0, 2.6, 5.6),
  digerir: v3(0, 3.0, 0.3),
  respirar: v3(0, 6.65, -0.4),
  latir: v3(0.45, 6.25, 0.85),
  sentir: v3(0, 10.1, -0.1),
  mover: v3(0, 5.0, -1.25),
  balon: v3(0.45, -2.2, -0.3),
};
/* Cámara en cada parada: 0 introducción … 6 conclusión. */
const CAM = [
  [v3(0.0, 3.0, 10.4), v3(0, 2.6, 5.6)],
  [v3(2.1, 3.65, 6.5), v3(0, 3.1, 0.3)],
  [v3(-2.4, 7.4, 6.2), v3(0, 6.7, -0.4)],
  [v3(1.75, 6.55, 4.7), v3(0.45, 6.3, 0.85)],
  [v3(-1.6, 10.85, 4.8), v3(0, 10.1, -0.1)],
  [v3(8.6, 5.3, -3.4), v3(0, 4.7, -1.25)],
  [v3(0.0, 4.4, 25.5), v3(0, 4.2, 0)],
];
/* Cuánto se desplaza el objeto hacia un lado para dejar espacio al texto. */
const PESO_OFFSET = [0.85, 1, 1, 1, 1, 1, 0.6];
export const COLORES_ESTACION = ['#FFD98A', '#FFC94A', '#45D6DE', '#FF6B66', '#B49BFF', '#7EE5A0', '#FFFFFF'];

export async function crearMundo(canvas, { reducido = false, alProgreso = () => {} } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const escena = new THREE.Scene();
  escena.fog = new THREE.Fog(0x120d24, 12, 40);
  const pmrem = new THREE.PMREMGenerator(renderer);
  escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  escena.environmentIntensity = 0.55;

  const camara = new THREE.PerspectiveCamera(38, 1, 0.1, 120);

  escena.add(new THREE.HemisphereLight(0x9c8cff, 0x120d24, 0.9));
  const clave = new THREE.DirectionalLight(0xffffff, 1.6);
  clave.position.set(5, 12, 9);
  escena.add(clave);
  const contra = new THREE.DirectionalLight(0x8f7bff, 0.9);
  contra.position.set(-6, 4, -8);
  escena.add(contra);
  const acento = new THREE.PointLight(0xffd98a, 22, 14, 1.6);
  escena.add(acento);

  /* Texturas incrustadas en el script clásico window.TEXTURAS */
  const cargador = new THREE.TextureLoader();
  const T = window.TEXTURAS || {};
  const cargar = (url) => new Promise((res) => (url ? cargador.load(url, res, undefined, () => res(null)) : res(null)));
  const [tejido, brillo, arepaTex] = await Promise.all([cargar(T.tejido), cargar(T.brillo), cargar(T.arepa)]);
  if (tejido) { tejido.wrapS = tejido.wrapT = THREE.RepeatWrapping; tejido.repeat.set(3, 3); }
  if (arepaTex) arepaTex.colorSpace = THREE.SRGBColorSpace;
  const tex = { tejido, brillo, arepa: arepaTex };
  alProgreso(0.35);

  /* Estaciones */
  const arepa = construirArepa(tex);
  const dig = construirDigestivo(tex);
  const resp = construirRespiratorio(tex);
  const circ = construirCirculatorio(tex);
  const nerv = construirNervioso(tex);
  const loco = construirLocomotor(tex);
  const balon = construirBalon(tex);
  const lista = [arepa, dig, resp, circ, nerv, loco, balon];
  const cuerpo = new THREE.Group();
  escena.add(cuerpo);
  arepa.grupo.position.copy(POS.arepa);
  dig.grupo.position.copy(POS.digerir);
  resp.grupo.position.copy(POS.respirar);
  circ.grupo.position.copy(POS.latir);
  nerv.grupo.position.copy(POS.sentir);
  loco.grupo.position.copy(POS.mover);
  balon.grupo.position.copy(POS.balon);
  escena.add(arepa.grupo);
  [dig, resp, circ, nerv, loco, balon].forEach((e) => cuerpo.add(e.grupo));
  alProgreso(0.6);

  const destinoArepa = POS.digerir.clone().add(dig.estomagoLocal);
  const centros = [POS.arepa, POS.digerir, POS.respirar.clone().add(v3(0, 0.1, 0)), POS.latir.clone().add(v3(0, 0.2, 0)), POS.sentir, POS.mover, POS.balon];

  /* Curvas de cámara */
  const curvaPos = new THREE.CatmullRomCurve3(CAM.map((c) => c[0]), false, 'centripetal');
  const curvaObj = new THREE.CatmullRomCurve3(CAM.map((c) => c[1]), false, 'centripetal');

  const datos = { energia: 318, fr: 18, lpm: 80, maletaPct: 12.5, maletaKg: 5 };
  let t = 0, tObjetivo = 0, ancho = 1, alto = 1, tiempo = 0, golLanzado = false;
  const visible = new Array(7).fill(1);
  const colorAcento = new THREE.Color(COLORES_ESTACION[0]);
  const tmpC = new THREE.Color();
  const deriva = v3(0, 0, 0);

  function visibilidadDe(i, tt) {
    if (i === 0) return clamp(1 - tt * 1.05);
    const fin = clamp(tt - 5);
    const intro = clamp(1 - tt);
    let v;
    if (i === 6) v = Math.max(fin, 0.12 * (1 - clamp(Math.abs(tt - 5) * 1.3)));
    else v = Math.max(0.06 + 0.94 * Math.pow(1 - clamp(Math.abs(tt - i) * 1.3), 1.5), fin);
    return v * (1 - intro) + (i === 6 ? 0 : 0.07) * intro;
  }

  function pesoOffset(tt) {
    const i = Math.min(5, Math.floor(tt));
    const f = facil(clamp(tt - i));
    return PESO_OFFSET[i] + (PESO_OFFSET[i + 1] - PESO_OFFSET[i]) * f;
  }

  function esEscritorio() { return ancho >= 900 && ancho / alto > 1.0; }

  function aplicarOffset() {
    const p = pesoOffset(t);
    if (esEscritorio()) camara.setViewOffset(ancho, alto, -0.19 * ancho * p, 0, ancho, alto);
    else camara.setViewOffset(ancho, alto, 0, 0.2 * alto * p, ancho, alto);
    return p;
  }

  function redimensionar() {
    ancho = window.innerWidth; alto = window.innerHeight;
    const movil = ancho < 900;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, movil ? 1.5 : 2));
    renderer.setSize(ancho, alto, false);
    camara.aspect = ancho / alto;
    // En pantallas verticales se abre el campo de visión para que los órganos quepan a lo ancho
    const ajuste = Math.max(1, Math.min(1.7, 0.72 / camara.aspect));
    camara.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(19)) * ajuste));
    camara.updateProjectionMatrix();
    aplicarOffset();
    const escala = (alto * renderer.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(camara.fov / 2)));
    materialesParticulas.forEach((m) => (m.uniforms.escala.value = escala));
  }
  redimensionar();

  function actualizar(dt, dtCamara = dt) {
    tiempo += dt;
    t = reducido ? tObjetivo : t + (tObjetivo - t) * Math.min(1, dtCamara * 4.5);
    if (Math.abs(tObjetivo - t) < 0.0005) t = tObjetivo;
    const i = Math.min(5, Math.floor(t));
    const u = (i + facil(clamp(t - i))) / 6;
    curvaPos.getPoint(clamp(u), camara.position);
    const obj = curvaObj.getPoint(clamp(u));
    if (!reducido) {
      const quieto = 1 - Math.min(1, Math.abs(t - Math.round(t)) * 4);
      deriva.set(Math.sin(tiempo * 0.21) * 0.18, Math.cos(tiempo * 0.17) * 0.1, 0).multiplyScalar(quieto);
      camara.position.add(deriva);
    }
    camara.lookAt(obj);
    const peso = aplicarOffset();

    // Color de la luz de acento
    const n = Math.round(t);
    tmpC.set(COLORES_ESTACION[n]);
    colorAcento.lerp(tmpC, Math.min(1, dt * 3));
    acento.color.copy(colorAcento);
    acento.position.copy(obj).add(v3(1.6, 1.8, 2.6));

    // Atenuación y animación de cada estación
    lista.forEach((e, k) => {
      const v = visibilidadDe(k, t);
      if (Math.abs(v - visible[k]) > 0.003 || v === 0) { e.ajustes.forEach((f) => f(v)); visible[k] = v; }
      if (v > 0.05) e.actualizar(dt, tiempo, { ...datos, reducido }, true);
    });

    // La arepa viaja al estómago
    const a = facil(clamp(t));
    arepa.grupo.position.lerpVectors(POS.arepa, destinoArepa, a);
    arepa.grupo.scale.setScalar(1 - a * 0.85);

    // En la conclusión: el cuerpo se balancea y llega el gol
    if (t > 5.97) {
      if (!golLanzado) { golLanzado = true; gol(); }
      if (!reducido) cuerpo.rotation.y = Math.sin(tiempo * 0.35) * 0.22;
    } else {
      if (t < 5.6) golLanzado = false;
      cuerpo.rotation.y += (0 - cuerpo.rotation.y) * Math.min(1, dt * 2);
    }
    renderer.render(escena, camara);
    return { t, peso, escritorio: esEscritorio() };
  }

  function gol() {
    loco.patear();
    balon.lanzar();
    mundo.alGol?.();
  }

  function sorpresa(i) {
    if (i === 6) return gol();
    lista[i]?.sorpresa?.();
  }

  // Compila sombreadores antes de mostrar (carga real)
  lista.forEach((e) => e.ajustes.forEach((f) => f(1)));
  lista.forEach((e) => e.actualizar(0.016, 0, datos, true));
  redimensionar();
  renderer.compile(escena, camara);
  alProgreso(0.95);

  const mundo = {
    renderer, escena, camara, cuerpo, lista, centros,
    datos,
    get t() { return t; },
    set tObjetivo(v) { tObjetivo = clamp(v, 0, 6); },
    get tObjetivo() { return tObjetivo; },
    radios: [arepa.hit.radio, dig.hit.radio, resp.hit.radio, 1.1, nerv.hit.radio, loco.hit.radio, balon.hit.radio],
    actualizar, redimensionar, sorpresa, gol,
    impulsoNervioso: () => nerv.impulso(),
    rotador: (i) => lista[i]?.rot,
    centroMundo: (i) => {
      const c = centros[i].clone();
      if (i === 0) c.copy(arepa.grupo.position);
      else if (i > 0) cuerpo.localToWorld(c);
      return c;
    },
    alGol: null,
  };
  return mundo;
}
