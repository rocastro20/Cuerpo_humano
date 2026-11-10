/*
 * Renderiza escena.html cuadro a cuadro con Playwright, genera la pista de
 * audio con audio.py, codifica con FFmpeg y deja el video incrustado en
 * src/generated/video-data.js (script clásico, funciona en file://).
 *
 * Uso: node generators/video/render.mjs
 */
import { createRequire } from 'module';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const req = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = req('playwright')); } catch { ({ chromium } = createRequire('/opt/npm-tools/node_modules/')('playwright')); }

const aquí = path.dirname(fileURLToPath(import.meta.url));
const raíz = path.resolve(aquí, '..', '..');
const tmp = path.join(raíz, '.video-tmp');
const FPS = 30, DUR = 45;
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });

const navegador = await chromium.launch();
const página = await navegador.newPage({ viewport: { width: 960, height: 540 } });
await página.goto('file://' + path.join(aquí, 'escena.html'));
await página.evaluate(() => window.listo);
const total = FPS * DUR;
for (let i = 0; i < total; i++) {
  const b64 = await página.evaluate((t) => { window.render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.92).split(',')[1]; }, i / FPS);
  fs.writeFileSync(path.join(tmp, `f${String(i).padStart(5, '0')}.jpg`), Buffer.from(b64, 'base64'));
  if (i % 150 === 0) console.log(`cuadro ${i}/${total}`);
}
// Póster y cuadros para la galería
const galería = path.join(raíz, 'generated-preview');
fs.mkdirSync(galería, { recursive: true });
const pósters = {};
for (const [nombre, t] of [['poster', 2.6], ['alveolo', 11], ['corazon', 18.5], ['musculo', 35]]) {
  const b64 = await página.evaluate((t) => { window.render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.82).split(',')[1]; }, t);
  fs.writeFileSync(path.join(galería, `video-${nombre}.jpg`), Buffer.from(b64, 'base64'));
  pósters[nombre] = 'data:image/jpeg;base64,' + b64;
}
await navegador.close();

execFileSync('python3', [path.join(aquí, 'audio.py'), path.join(tmp, 'audio.wav')], { stdio: 'inherit' });
const mp4 = path.join(tmp, 'video.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, 'f%05d.jpg'),
  '-i', path.join(tmp, 'audio.wav'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '80k', '-shortest', '-movflags', '+faststart', mp4], { stdio: 'inherit' });
fs.copyFileSync(mp4, path.join(galería, 'el-viaje-del-oxigeno.mp4'));
const datos = fs.readFileSync(mp4).toString('base64');
const js = '/* Video «El viaje del oxígeno», generado por generators/video/render.mjs. Script clásico. */\n' +
  'window.VIDEO_DATA = ' + JSON.stringify({ mime: 'video/mp4', b64: datos, posters: pósters }) + ';\n';
fs.writeFileSync(path.join(raíz, 'src', 'generated', 'video-data.js'), js);
console.log(`video: ${(fs.statSync(mp4).size / 1024).toFixed(0)} KB`);
fs.rmSync(tmp, { recursive: true, force: true });
