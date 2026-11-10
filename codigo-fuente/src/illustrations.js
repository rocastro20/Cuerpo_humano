/*
 * Ilustraciones SVG originales de «Cuerpo adentro».
 * Todo se dibuja por código: retratos, íconos de sistema, sellos y cursor.
 * Ningún personaje, logo ni diseño de terceros.
 */

const PIEL = {
  clara: '#F1C6A4',
  trigueña: '#D9A07A',
  canela: '#B97A55',
  morena: '#8A5638',
  oscura: '#5E3A26',
};

/* ── Peinados: cada uno devuelve <path> dibujados detrás y delante de la cara ── */
function peinado(tipo, color) {
  switch (tipo) {
    case 'colita': // Sofía: cola de caballo alta
      return {
        atras: `<path d="M128 58c22 4 34 26 30 52-3 18-12 30-22 36 6-16 8-34 2-50-4-12-10-20-18-24z" fill="${color}"/>`,
        frente: `<path d="M64 92c0-28 16-46 38-46s38 16 38 42c-10-12-26-18-44-18-14 0-26 8-32 22z" fill="${color}"/><circle cx="128" cy="62" r="7" fill="#FF6B66"/>`,
      };
    case 'mono': // Laura: moño alto
      return {
        atras: `<circle cx="100" cy="40" r="17" fill="${color}"/>`,
        frente: `<path d="M62 96c-2-30 16-50 38-50s40 18 38 50c-6-16-20-28-38-28s-32 12-38 28z" fill="${color}"/>`,
      };
    case 'corto': // Andrés: corto con barba
      return {
        atras: '',
        frente: `<path d="M64 88c0-26 16-40 36-40s36 14 36 40c-4-10-10-16-18-18-6 6-30 6-40 0-8 4-12 10-14 18z" fill="${color}"/><path d="M70 106c2 22 14 34 30 34s28-12 30-34c-6 10-16 14-30 14s-24-4-30-14z" fill="${color}" opacity=".92"/>`,
      };
    case 'rizos': // Valentina: rizos voluminosos
      return {
        atras: `<g fill="${color}">${[
          [62, 70, 20], [80, 52, 20], [102, 46, 21], [124, 52, 20], [140, 70, 20], [146, 94, 18], [56, 94, 18], [58, 118, 15], [144, 118, 15],
        ].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`,
        frente: `<path d="M68 86c4-18 18-28 34-28s30 10 34 28c-10-8-22-12-34-12s-24 4-34 12z" fill="${color}"/>`,
      };
    case 'largo': // Catalina: liso largo
      return {
        atras: `<path d="M60 94c0-30 18-48 40-48s40 18 40 48v62H60z" fill="${color}"/>`,
        frente: `<path d="M64 98c2-26 18-42 38-42 16 0 30 10 36 26-14-6-28-4-40 4-10-6-24-6-34 12z" fill="${color}"/>`,
      };
    case 'afro': // Julián: rizado corto
    default:
      return {
        atras: '',
        frente: `<path d="M62 92c-4-30 16-48 38-48s42 18 38 48c-4-8-8-12-14-14-2-6-8-10-24-10s-22 4-24 10c-6 2-10 6-14 14z" fill="${color}"/>`,
      };
  }
}

function accesorio(tipo, color) {
  switch (tipo) {
    case 'balon':
      return `<g transform="translate(150 160)"><circle r="16" fill="#fff" stroke="#120D24" stroke-width="2"/><path d="M0-7l7 5-3 8h-8l-3-8z" fill="#120D24"/></g>`;
    case 'manzana':
      return `<g transform="translate(148 156)"><path d="M0 4c-8-10-22-2-18 12 3 10 10 16 18 12 8 4 15-2 18-12 4-14-10-22-18-12z" fill="${color}"/><path d="M0 4c0-6 2-10 6-12" stroke="#3b7a3b" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
    case 'pulmones':
      return `<g transform="translate(150 160)" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"><path d="M0-14v10M0-4c-4 4-8 4-10 10M0-4c4 4 8 4 10 10"/><path d="M-6-4c-10-2-14 8-14 18 0 6 6 6 10 2l4-8M6-4c10-2 14 8 14 18 0 6-6 6-10 2l-4-8"/></g>`;
    case 'estetoscopio':
      return `<path d="M78 150c-6 16 0 30 12 32M122 150c6 16 0 30-12 32M90 182c10 6 10 18 20 18" stroke="#2A2340" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="112" cy="200" r="6" fill="#C9C0E6" stroke="#2A2340" stroke-width="2"/>`;
    case 'gafas':
      return `<g fill="none" stroke="#2A2340" stroke-width="3"><circle cx="86" cy="104" r="11"/><circle cx="114" cy="104" r="11"/><path d="M97 104h6"/></g>`;
    case 'cinta':
      return `<path d="M64 168c20 10 52 10 72 0" stroke="${color}" stroke-width="5" fill="none" stroke-dasharray="6 5"/>`;
    default:
      return '';
  }
}

/**
 * Retrato plano parametrizable.
 * @param {object} o  piel, pelo, peinado, ropa, cuello, fondo, accesorio, extra
 */
export function retrato(o) {
  const p = peinado(o.peinado, o.pelo);
  const piel = PIEL[o.piel] || o.piel;
  const sombra = 'rgba(18,13,36,.16)';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="${o.alt}">
  <defs><clipPath id="c-${o.id}"><circle cx="100" cy="100" r="96"/></clipPath></defs>
  <g clip-path="url(#c-${o.id})">
    <rect width="200" height="200" fill="${o.fondo}"/>
    <circle cx="160" cy="36" r="40" fill="#fff" opacity=".18"/>
    ${p.atras}
    <path d="M30 210c4-40 30-62 70-62s66 22 70 62z" fill="${o.ropa}"/>
    ${o.cuello ? `<path d="M84 148l16 18 16-18" fill="${o.cuello}"/>` : ''}
    <rect x="88" y="126" width="24" height="26" rx="10" fill="${piel}"/>
    <path d="M88 140h24v6c-8 4-16 4-24 0z" fill="${sombra}"/>
    <ellipse cx="100" cy="100" rx="36" ry="42" fill="${piel}"/>
    <ellipse cx="64" cy="104" rx="6" ry="9" fill="${piel}"/><ellipse cx="136" cy="104" rx="6" ry="9" fill="${piel}"/>
    ${p.frente}
    <path d="M80 92q6-5 12 0M108 92q6-5 12 0" stroke="#2A2340" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="86" cy="104" r="3.6" fill="#2A2340"/><circle cx="114" cy="104" r="3.6" fill="#2A2340"/>
    <path d="M100 108q-3 8 2 10" stroke="${sombra}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M88 124q12 9 24 0" stroke="#2A2340" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="76" cy="116" r="6" fill="#FF6B66" opacity=".22"/><circle cx="124" cy="116" r="6" fill="#FF6B66" opacity=".22"/>
    ${o.extra || ''}
    ${accesorio(o.accesorio, o.acento)}
  </g>
</svg>`;
}

export const personajes = {
  sofia: {
    id: 'sofia', alt: 'Sofía, estudiante de 11 años con camiseta de fútbol número 11',
    piel: 'canela', pelo: '#2B1A12', peinado: 'colita', ropa: '#FF6B66', fondo: '#FFD98A',
    accesorio: 'balon', acento: '#FF6B66',
    extra: '<text x="100" y="192" text-anchor="middle" font-family="Bricolage Grotesque Variable, sans-serif" font-weight="800" font-size="30" fill="#fff">11</text>',
  },
  laura: {
    id: 'laura', alt: 'Laura Méndez, nutricionista, con bata y una manzana',
    piel: 'trigueña', pelo: '#1D1410', peinado: 'mono', ropa: '#FFFFFF', cuello: '#FFC94A', fondo: '#FFC94A',
    accesorio: 'manzana', acento: '#E2463F',
  },
  andres: {
    id: 'andres', alt: 'Andrés Rojas, terapeuta respiratorio, con uniforme clínico',
    piel: 'morena', pelo: '#17110D', peinado: 'corto', ropa: '#1F8C93', fondo: '#45D6DE',
    accesorio: 'pulmones', acento: '#E8FBFC',
  },
  valentina: {
    id: 'valentina', alt: 'Valentina Ospina, médica del deporte, con estetoscopio',
    piel: 'clara', pelo: '#5A3420', peinado: 'rizos', ropa: '#FFFFFF', cuello: '#FF6B66', fondo: '#FF8F8A',
    accesorio: 'estetoscopio', acento: '#FF6B66',
  },
  catalina: {
    id: 'catalina', alt: 'Catalina Herrera, neuróloga pediatra, con gafas',
    piel: 'trigueña', pelo: '#7A3B22', peinado: 'largo', ropa: '#FFFFFF', cuello: '#B49BFF', fondo: '#B49BFF',
    accesorio: 'gafas', acento: '#B49BFF',
  },
  julian: {
    id: 'julian', alt: 'Julián Pardo, fisioterapeuta, con camiseta deportiva',
    piel: 'oscura', pelo: '#120C09', peinado: 'afro', ropa: '#2E9E62', fondo: '#7EE5A0',
    accesorio: 'cinta', acento: '#E8FFF0',
  },
};

export function retratoDe(clave) {
  return retrato(personajes[clave]);
}

/* ── Íconos de línea por sistema (24×24, trazo) ── */
export const iconos = {
  adentro: '<circle cx="12" cy="12" r="7.5"/><path d="M6.5 11.5c2 1.6 3.6-.2 5.5 0s3.4 1.8 5.5 0"/><path d="M8 15.5c1.4.8 2.6.6 4 0s2.6-.8 4 0"/>',
  digerir: '<path d="M9 3c0 3 3 3 3 6s-6 2-6 6 4 3 6 3 6-1 6-4-4-3-4-1 2 2 2 2"/>',
  respirar: '<path d="M12 3v7"/><path d="M12 10c-1.5 1.5-3 1.5-4 4"/><path d="M12 10c1.5 1.5 3 1.5 4 4"/><path d="M9.5 9C5 8 4 13 4 17c0 2 2.5 2.5 4 1l1.5-4"/><path d="M14.5 9C19 8 20 13 20 17c0 2-2.5 2.5-4 1l-1.5-4"/>',
  latir: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M5 12h3l1.5-3 2 6 1.5-3H19"/>',
  sentir: '<circle cx="12" cy="7" r="2.5"/><path d="M12 9.5V20"/><path d="M10 6 6 3M14 6l4-3M10 8.5 5 10M14 8.5l5 1.5"/><path d="M12 20l-3 1.5M12 20l3 1.5"/>',
  mover: '<path d="M12 3v18"/><rect x="9" y="4" width="6" height="2.5" rx="1"/><rect x="9" y="8.5" width="6" height="2.5" rx="1"/><rect x="9" y="13" width="6" height="2.5" rx="1"/><rect x="9" y="17.5" width="6" height="2.5" rx="1"/>',
  gol: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5l3.3 2.4-1.3 3.9h-4l-1.3-3.9z"/><path d="M12 4v3.5M19.3 9l-4 .9M16.5 18.5l-2.5-4.7M7.5 18.5l2.5-4.7M4.7 9l4 .9"/>',
};

export function icono(nombre, color = 'currentColor', tam = 24) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconos[nombre] || ''}</svg>`;
}

/* ── Sello circular de la bitácora ── */
export function sello(verbo, color, sellado = true, etiqueta = '') {
  const id = `arco-${verbo}`;
  const texto = (etiqueta || verbo).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Sello ${verbo}${sellado ? ', visitado' : ', pendiente'}">
  <defs><path id="${id}" d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0"/></defs>
  <g opacity="${sellado ? 1 : 0.32}" transform="rotate(${sellado ? -8 : 0} 60 60)">
    <circle cx="60" cy="60" r="55" fill="none" stroke="${color}" stroke-width="3"/>
    <circle cx="60" cy="60" r="33" fill="${color}" fill-opacity="0.1"/>
    <text font-family="Bricolage Grotesque Variable, sans-serif" font-size="9.5" font-weight="700" fill="${color}" letter-spacing="2"><textPath href="#${id}" startOffset="0">${texto} · ${texto} · ${texto} ·</textPath></text>
    <g transform="translate(44.4 44.4) scale(1.3)" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${iconos[verbo] || iconos.adentro}</g>
  </g>
</svg>`;
}

/* ── Cursor: glóbulo rojo bicóncavo ── */
export const cursorSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" aria-hidden="true">
  <defs><radialGradient id="g-cur" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#B8322E"/><stop offset=".55" stop-color="#FF6B66"/><stop offset="1" stop-color="#FF8F8A"/></radialGradient></defs>
  <ellipse cx="20" cy="20" rx="15" ry="13" fill="url(#g-cur)"/>
  <ellipse cx="20" cy="20" rx="7" ry="5.6" fill="#9E2622" opacity=".55"/>
  <ellipse cx="15" cy="14" rx="4" ry="2" fill="#fff" opacity=".35"/>
</svg>`;
