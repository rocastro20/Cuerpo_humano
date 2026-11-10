"""Sintetiza los subtítulos del video con Kokoro y deja un JSON con los WAV y sus tiempos."""
import json, os, subprocess, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
import soundfile as sf
import voz  # generators/voz.py

raiz = os.path.join(os.path.dirname(__file__), '..', '..')
subs = json.loads(subprocess.check_output(['node', '--input-type=module', '-e',
    "import * as c from './src/content.js'; console.log(JSON.stringify(c.video.subtitulos));"], cwd=raiz))
out_dir = sys.argv[1]
os.makedirs(out_dir, exist_ok=True)
segs = []
for i, s in enumerate(subs):
    a, sr, _ = voz.sintetizar(s['texto'], pausa=0)
    ruta = os.path.join(out_dir, f'sub{i:02d}.wav')
    sf.write(ruta, a, sr)
    dur = len(a) / sr
    # Si la voz dura más que la ventana del subtítulo, se adelanta un poco el inicio
    ini = s['ini'] if dur <= (s['fin'] - s['ini']) else max(0, s['fin'] - dur)
    segs.append({'wav': ruta, 'ini': round(ini, 2), 'dur': round(dur, 2), 'texto': s['texto']})
    print(f"{i}: {s['ini']}-{s['fin']} voz {dur:.1f}s -> ini {ini:.1f}")
json.dump(segs, open(os.path.join(out_dir, 'voz.json'), 'w'), ensure_ascii=False)
