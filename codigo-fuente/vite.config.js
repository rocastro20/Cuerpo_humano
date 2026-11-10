import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'fs';
import path from 'path';

/*
 * Incrusta las texturas y el video como scripts CLÁSICOS (no módulos) dentro del
 * HTML. Así el sitio funciona en un hosting y también abierto con doble clic.
 */
function scriptsClasicos() {
  const leer = (archivo, respaldo) => {
    const ruta = path.resolve(__dirname, 'src/generated', archivo);
    return fs.existsSync(ruta) ? fs.readFileSync(ruta, 'utf8') : respaldo;
  };
  return {
    name: 'scripts-clasicos',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const tex = leer('textures.js', 'window.TEXTURAS = {};');
        const vid = leer('video-data.js', 'window.VIDEO_DATA = null;');
        return html.replace('<!--SCRIPTS_CLASICOS-->', `<script>${tex}</script>\n<script>${vid}</script>`);
      },
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [scriptsClasicos(), viteSingleFile({ removeViteModuleLoader: true })],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 5000,
    target: 'es2020',
  },
});
