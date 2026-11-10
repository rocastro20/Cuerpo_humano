"""
Pista de audio del video «El viaje del oxígeno», sintetizada por código.
Acorde ambiental + respiración (ruido filtrado) + latidos en la escena del
corazón + destellos de energía + patada y acorde final.

Uso: python3 generators/video/audio.py salida.wav
"""
import sys
import wave

import numpy as np

SR = 44100
DUR = 45.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(45)


def env(a, b, ataque=1.0, caida=1.0):
    e = np.clip((t - a) / ataque, 0, 1) * np.clip((b - t) / caida, 0, 1)
    return e


def nota(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def lowpass(x, alpha):
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += alpha * (x[i] - acc)
        y[i] = acc
    return y


mix = np.zeros(N)

# Acorde de fondo (Re mayor con novena), con leve vibración
for m, amp in [(50, 0.05), (57, 0.04), (62, 0.035), (66, 0.03), (64, 0.02)]:
    f = nota(m)
    mix += amp * np.sin(2 * np.pi * f * t + 0.4 * np.sin(2 * np.pi * 0.11 * t)) * env(0, DUR, 3.0, 3.0)

# Respiración: ruido filtrado que sube y baja (0–6 s)
ruido = rng.normal(0, 1, N)
suave = lowpass(ruido[: SR * 7], 0.04)
resp = np.zeros(N)
resp[: SR * 7] = suave
resp *= np.clip(np.sin(np.pi * np.clip((t - 0.6) / 4.8, 0, 1)), 0, 1) ** 1.5
mix += 0.18 * resp

# Burbujas del intercambio (6–14 s)
for k in range(18):
    c = 6.4 + k * 0.42 + rng.random() * 0.2
    i0 = int(c * SR)
    n = int(0.09 * SR)
    tt = np.arange(n) / SR
    f = 900 + rng.random() * 700
    s = np.sin(2 * np.pi * (f + 2400 * tt) * tt) * np.exp(-tt * 40) * 0.06
    mix[i0 : i0 + n] += s[: max(0, min(n, N - i0))]

# Latidos a 78 lpm (14–22 s): «lub-dub»
def golpe(c, f0, amp):
    i0 = int(c * SR)
    n = int(0.16 * SR)
    tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * (f0 * np.exp(-tt * 9)) * tt) * np.exp(-tt * 22) * amp
    mix[i0 : i0 + n] += s[: max(0, min(n, N - i0))]

c = 14.3
while c < 22:
    golpe(c, 70, 0.55)
    golpe(c + 0.16, 58, 0.38)
    c += 60 / 78

# Pulso suave en las arterias (22–32 s)
c = 22.4
while c < 32:
    golpe(c, 62, 0.18)
    c += 60 / 78

# Destellos de energía (33–37 s)
for k in range(14):
    cc = 33.0 + k * 0.28
    i0 = int(cc * SR)
    n = int(0.5 * SR)
    tt = np.arange(n) / SR
    f = nota([74, 78, 81, 86][k % 4])
    s = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 7) * 0.05
    mix[i0 : i0 + n] += s[: max(0, min(n, N - i0))]

# Patada (≈ 37.8 s)
golpe(37.8, 110, 0.7)
i0 = int(37.8 * SR)
n = int(0.25 * SR)
mix[i0 : i0 + n] += lowpass(rng.normal(0, 1, n), 0.25) * np.exp(-np.arange(n) / SR * 18) * 0.25

# Acorde final (40.5 s)
for m in (62, 66, 69, 74):
    mix += 0.05 * np.sin(2 * np.pi * nota(m) * t) * env(40.5, DUR, 0.05, 2.5) * np.exp(-np.clip(t - 40.5, 0, None) * 0.35)

mix *= 0.9 / max(1e-6, np.max(np.abs(mix)))
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("audio ok")
