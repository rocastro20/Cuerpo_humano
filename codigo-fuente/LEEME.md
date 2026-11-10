# Cuerpo adentro · De la arepa al gol

Recurso web interactivo sobre cinco sistemas del cuerpo humano para estudiantes de grados 6.° y 7.° del **Colegio Universidad Libre** (Ciencias Naturales y Biología). Es un viaje de unos 10 minutos: una arepa se convierte en el gol de Sofía, de 11 años, mientras la cámara recorre su cuerpo por dentro.

## Contenido del .zip

```
sitio/            Listo para publicar o abrir con doble clic (un solo index.html)
codigo-fuente/    Proyecto editable (Vite) y generadores de multimedia
LEEME.md          Este archivo
```

## Abrir y publicar

**Sin instalar nada:** haga doble clic en `sitio/index.html`. Todo va dentro del archivo: código, fuentes, texturas y video. No necesita internet, salvo para la voz de Google en Chrome.

**En internet:** suba `sitio/index.html` a cualquier hosting estático. Tres opciones probadas:

1. **GitHub Pages.** Cree un repositorio, suba `index.html` y active Pages en *Settings → Pages*.
2. **Netlify Drop.** Arrastre la carpeta `sitio/` a app.netlify.com/drop.
3. **Servidor del colegio.** Copie `index.html` a cualquier carpeta pública.

Con el enlace publicado puede generar un código QR para que los estudiantes entren desde el celular.

> En Moodle: si lo sube como *Archivo*, algunas configuraciones lo descargan en vez de mostrarlo. Es más seguro publicarlo en uno de los hostings anteriores y enlazarlo como *URL*.

## Cómo agregar el logo

El HUD muestra las iniciales «CUL» mientras no haya logo. Para poner el oficial:

1. Abra `codigo-fuente/src/content.js`.
2. En `proyecto.logo` escriba una de estas dos opciones:
   - una ruta relativa, como `'logo.png'`, y copie el archivo junto a `sitio/index.html`;
   - o un *data URI* (`'data:image/png;base64,…'`), para que el logo quede dentro del único archivo.
3. Reconstruya el sitio (ver abajo).

## Editar el contenido

Todo el texto vive en **`codigo-fuente/src/content.js`**: guion, narración, profesionales, fichas de datos, simuladores, quiz, video, «Cómo se hizo», fuentes y certificado. Para cambiar algo:

```bash
cd codigo-fuente
npm install        # solo la primera vez
npm run dev        # vista previa en vivo
npm run build      # genera dist/index.html → cópielo a sitio/
```

Para regenerar las texturas y el video: `npm run generar`. Necesita Python 3 con NumPy y Pillow, FFmpeg y Playwright.

## Estructura del código

| Archivo | Qué hace |
|---|---|
| `src/content.js` | Todo el contenido editable |
| `src/main.js` | Orquestación: carga, desplazamiento, llegadas a cada parada |
| `src/scene/organs.js` | Los cinco órganos 3D, la arepa y el balón, hechos con geometría procedural |
| `src/scene/world.js` | Cámara guiada por el desplazamiento, luces y atenuación |
| `src/scene/interact.js` | Arrastrar con inercia, clic para viajar y sorpresa |
| `src/ui/*.js` | Paneles, HUD, simuladores, quiz, bitácora y certificado, cursor |
| `src/audio/*.js` | Música generativa, efectos, sonificación y narración |
| `src/video/player.js` | Video incrustado con subtítulos creados en JavaScript |
| `src/illustrations.js` | Retratos, sellos e íconos en SVG original |
| `generators/` | Generadores de texturas (Python) y del video (canvas, Playwright y FFmpeg) |

Pila técnica: Vite, Three.js, GSAP, Lenis y vite-plugin-singlefile. Las fuentes son locales (Bricolage Grotesque variable e Instrument Serif), sin CDN. Las texturas y el video van en scripts clásicos para que funcione con `file://`.

## Recorrido e interacciones

**Paradas:** introducción, luego *digerir*, *respirar*, *latir*, *sentir* y *mover*, y la conclusión. Siguen el quiz de 8 preguntas, «Cómo se hizo» y las fuentes.

- **Navegación:** desplazamiento suave, flechas ← →, riel de paradas en el HUD y clic sobre un órgano para viajar a él.
- **3D:** arrastrar gira el órgano con inercia. Un clic sobre el órgano de la parada actual dispara una sorpresa: por ejemplo, la arepa se desarma en nutrientes o se repite el gol.
- **Simuladores con fórmula visible:**
  - energía del desayuno, con E = 4·C + 4·P + 9·G;
  - frecuencia respiratoria, contando las propias respiraciones;
  - pulso, con lpm = latidos en 15 s × 4 y FCmáx ≈ 220 − edad;
  - tiempo de reacción, con d = v × t;
  - porcentaje de peso de la maleta, que inclina la columna 3D.
- **Sonificación:** el latido suena a los lpm calculados y la respiración a la frecuencia medida.
- **Gamificación:** bitácora con 7 sellos y certificado PNG con nombre, avance, puntaje, fecha y créditos.
- **HUD:** marca, interruptores de narración y música, riel de paradas, latidos en vivo y barra de progreso.
- **Accesibilidad:**
  - subtítulos en toda la narración y en el video;
  - foco visible y navegación completa por teclado;
  - modo «reducir movimiento», con cortes de cámara en lugar de vuelos;
  - contraste alto y cursor temático que se desactiva en pantallas táctiles.

## Narración

Por defecto se lee con la voz en español del dispositivo (Web Speech API); en Chrome suelen ser voces de Google. Si el navegador no tiene voz en español, aparecen solo los subtítulos, al ritmo de 150 palabras por minuto.

**Para usar audios propios**, por ejemplo hechos con Gemini TTS, agregue `audio: 'narracion-digerir.mp3'` al bloque correspondiente en `content.js` (`introduccion`, cada parada o `conclusion`). Los subtítulos se sincronizan solos con la duración del audio.

## Equipo y créditos de IA

- **Rodrigo Castro**, Desarrollador Web.
- **Oscar Espitia**, Diseñador Instruccional.
- **Claude (Anthropic)**, asistente de IA. Escribió el guion, el código y los generadores de medios.

Todos los medios se generaron por código; no hay fotografías ni modelos de terceros. La tabla completa, con el prompt usado para cada recurso, está en la sección «Cómo se hizo» del propio sitio.

| Recurso | Herramienta |
|---|---|
| Guion, narración, quiz | Claude |
| Escena 3D | Claude · Three.js procedural |
| Texturas | Claude · Python (NumPy) |
| Retratos, sellos, cursor | Claude · SVG original |
| Video «El viaje del oxígeno» (45 s) | Claude · canvas + Playwright + FFmpeg |
| Música y sonificación | Claude · Web Audio API |
| Voz de la narración | Voz del navegador (en Chrome, Google) |

## Fuentes de los datos

Las fuentes están citadas en el sitio, con enlaces: FAO (factores de Atwater), Cleveland Clinic (intestino delgado y signos vitales pediátricos), CDC (frecuencia cardiaca máxima), Universidad de Minnesota y OpenStax (velocidad nerviosa), KidsHealth/Nemours (peso de la maleta), Acıbadem (número de huesos) y los estándares del MEN.

## Qué revisar antes de usarlo en clase

- Logo y colores oficiales del colegio (ver «Cómo agregar el logo»).
- Nombres del equipo y de la unidad en `content.js`.
- Los rangos de pulso y respiración varían entre referencias. Se usa Cleveland Clinic (60–100 lpm y 14–22 rpm entre 6 y 12 años) y se menciona que hay otras tablas.
