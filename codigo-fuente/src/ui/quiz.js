/* Quiz de 8 preguntas: una respuesta correcta y retroalimentación inmediata explicada. */
import { esc } from './panels.js';

const LETRAS = ['A', 'B', 'C', 'D'];

export function iniciarQuiz({ raiz, preguntas, audio, estado, alTerminar, abrirBitacora }) {
  const cont = raiz.querySelector('[data-quiz]');
  let i = 0, puntaje = 0;

  function pintar() {
    if (i >= preguntas.length) return final();
    const q = preguntas[i];
    cont.innerHTML = `
      <div class="quiz-barra" role="progressbar" aria-label="Avance del quiz" aria-valuemin="0" aria-valuemax="${preguntas.length}" aria-valuenow="${i}"><span style="width:${(i / preguntas.length) * 100}%"></span></div>
      <p style="color:var(--tinta-suave);font-size:14px;margin-bottom:6px">Pregunta ${i + 1} de ${preguntas.length} · Aciertos: ${puntaje}</p>
      <fieldset style="border:0;margin:0;padding:0">
        <legend class="quiz-pregunta">${esc(q.pregunta)}</legend>
        <div class="quiz-opciones">${q.opciones.map((o, k) => `<button type="button" data-k="${k}"><span class="letra" aria-hidden="true">${LETRAS[k]}</span><span>${esc(o)}</span></button>`).join('')}</div>
      </fieldset>
      <div data-retro aria-live="polite"></div>`;
    cont.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => responder(+b.dataset.k)));
  }

  function responder(k) {
    const q = preguntas[i];
    const bien = k === q.correcta;
    if (bien) { puntaje++; audio.fx.acierto(); } else audio.fx.error();
    cont.querySelectorAll('[data-k]').forEach((b) => {
      b.disabled = true;
      const n = +b.dataset.k;
      if (n === q.correcta) { b.classList.add('correcta'); b.setAttribute('aria-label', `${b.textContent.trim()} (respuesta correcta)`); }
      else if (n === k) b.classList.add('incorrecta');
    });
    const retro = cont.querySelector('[data-retro]');
    retro.innerHTML = `<div class="quiz-retro ${bien ? 'bien' : 'mal'}"><strong>${bien ? '¡Correcto!' : `No es esa. La correcta es la ${LETRAS[q.correcta]}.`}</strong>${esc(q.explicacion)}</div>
      <button type="button" class="boton-principal" data-siguiente>${i + 1 < preguntas.length ? 'Siguiente pregunta' : 'Ver mi resultado'}</button>`;
    const sig = retro.querySelector('[data-siguiente]');
    sig.addEventListener('click', () => { i++; pintar(); cont.querySelector('[data-k]')?.focus(); });
    sig.focus();
  }

  function final() {
    estado.quiz = puntaje;
    alTerminar?.(puntaje);
    const msj = puntaje === preguntas.length ? '¡Perfecto! Tu cuerpo y tu cerebro trabajaron en equipo.'
      : puntaje >= 6 ? '¡Muy bien! Revisa las que fallaste y vuelve a intentarlo.'
      : 'Buen comienzo. Vuelve a las paradas y repite el quiz.';
    cont.innerHTML = `<div class="quiz-final" tabindex="-1">
      <p style="color:var(--tinta-suave);margin-bottom:4px">Tu resultado</p>
      <p class="numero">${puntaje}/${preguntas.length}</p>
      <p style="font-size:18px">${msj}</p>
      <div class="fila-botones"><button type="button" class="boton-principal" data-cert>Abrir bitácora y certificado</button>
      <button type="button" class="boton-secundario" data-repetir>Repetir el quiz</button></div></div>`;
    cont.querySelector('[data-cert]').addEventListener('click', abrirBitacora);
    cont.querySelector('[data-repetir]').addEventListener('click', () => { i = 0; puntaje = 0; pintar(); });
    cont.querySelector('.quiz-final').focus();
  }

  pintar();
}
