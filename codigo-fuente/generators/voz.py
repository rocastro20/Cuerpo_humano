"""
Narración con voz neuronal Kokoro (modelo abierto, ejecutado localmente).
Genera un MP3 por bloque de narración y los incrusta en src/generated/narracion.js
(script clásico) para que funcione también con doble clic (file://).

Uso: python3 generators/voz.py [--prueba]
Requiere: pip install kokoro-onnx soundfile ; modelos en ../modelos/
"""
import base64
import json
import os
import re
import subprocess
import sys
import tempfile

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

RAIZ = os.path.join(os.path.dirname(__file__), '..')
MODELOS = os.environ.get('KOKORO_MODELOS', os.path.join(RAIZ, '..', 'modelos'))
VOZ = os.environ.get('KOKORO_VOZ', 'ef_dora')
VELOCIDAD = float(os.environ.get('KOKORO_VELOCIDAD', '0.92'))

kokoro = Kokoro(os.path.join(MODELOS, 'kokoro-v1.0.onnx'), os.path.join(MODELOS, 'voices-v1.0.bin'))


def frases(texto):
    return [f.strip() for f in re.findall(r'[^.!?…]+(?:[.!?…]+[»"”]?|$)', texto) if f.strip()]


def preparar(frase):
    # Pequeños ajustes de pronunciación para la voz
    frase = frase.replace('¿', '').replace('¡', '')
    frase = re.sub(r'\b(\d+)\s*%', r'\1 por ciento', frase)
    frase = frase.replace('lpm', 'latidos por minuto').replace('FR', 'frecuencia respiratoria')
    frase = frase.replace('m/s', 'metros por segundo').replace('kcal', 'kilocalorías')
    frase = frase.replace('O2', 'oxígeno').replace('CO2', 'dióxido de carbono')
    return frase


def sintetizar(texto, pausa=0.42):
    partes, tiempos, sr, t = [], [], 24000, 0.0
    for f in frases(texto):
        audio, sr = kokoro.create(preparar(f), voice=VOZ, speed=VELOCIDAD, lang='es')
        audio = np.asarray(audio, dtype=np.float32)
        # recorta silencio inicial/final
        idx = np.where(np.abs(audio) > 0.01)[0]
        if len(idx):
            audio = audio[max(0, idx[0] - int(0.05 * sr)): idx[-1] + int(0.08 * sr)]
        tiempos.append({'ini': round(t, 2), 'fin': round(t + len(audio) / sr, 2), 'texto': f})
        partes.append(audio)
        partes.append(np.zeros(int(pausa * sr), np.float32))
        t += len(audio) / sr + pausa
    return np.concatenate(partes), sr, tiempos


def a_mp3(audio, sr, ruta, kbps='48k'):
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as w:
        sf.write(w.name, audio, sr)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', w.name, '-ac', '1', '-ar', '24000', '-b:a', kbps, ruta], check=True)
    os.unlink(w.name)


if __name__ == '__main__':
    if '--prueba' in sys.argv:
        a, sr, tt = sintetizar('Las dos y catorce. El tablero pasa de verde a ámbar. Hoy vamos a seguir a Sofía: tiene once años y el miércoles juega un partido en el descanso.')
        a_mp3(a, sr, '/tmp/prueba-voz.mp3')
        print(json.dumps(tt, ensure_ascii=False)); print('dur', len(a) / sr)
        sys.exit()
    # Lee los bloques desde content.js con Node
    bloques = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', """
import * as c from './src/content.js';
const b = { inicio: c.introduccion.narracion, final: c.conclusion.narracion };
for (const p of c.paradas) b[p.id] = p.narracion;
console.log(JSON.stringify({ bloques: b, video: c.video.subtitulos }));
"""], cwd=RAIZ))
    salida, tiempos = {}, {}
    os.makedirs(os.path.join(RAIZ, 'generated-preview', 'narracion'), exist_ok=True)
    for k, texto in bloques['bloques'].items():
        a, sr, tt = sintetizar(texto)
        ruta = os.path.join(RAIZ, 'generated-preview', 'narracion', f'{k}.mp3')
        a_mp3(a, sr, ruta)
        salida[k] = base64.b64encode(open(ruta, 'rb').read()).decode()
        tiempos[k] = tt
        print(f'{k}: {len(a)/sr:.0f} s, {os.path.getsize(ruta)/1024:.0f} KB')
    js = ('/* Narración generada con la voz neuronal Kokoro (generators/voz.py). Script clásico. */\n'
          'window.NARRACION_DATA = ' + json.dumps({'mime': 'audio/mpeg', 'voz': f'Kokoro {VOZ}', 'audios': salida, 'tiempos': tiempos}, ensure_ascii=False) + ';\n')
    with open(os.path.join(RAIZ, 'src', 'generated', 'narracion.js'), 'w') as f:
        f.write(js)
    print('ok -> src/generated/narracion.js')
