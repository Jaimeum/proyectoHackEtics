/**
 * tracker.js — cliente compartido por las tres campanas.
 *
 * Hace dos cosas, y SOLO dos:
 *   1. Al cargar la pagina, registra un evento 'visit'.
 *   2. Al enviar el formulario, registra un evento 'submit' y muestra la
 *      pantalla educativa (la "revelacion").
 *
 * NUNCA lee, guarda ni envia lo que el participante teclea en los campos.
 * El servidor solo recibe {token, level, type}.
 *
 * La pagina debe definir window.PHISH = { token: "...", level: N } antes
 * de cargar este script.
 */
(function () {
  var cfg = window.PHISH || { token: 'DEMO', level: 0 };

  function logEvent(type) {
    try {
      fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Fijate: aqui NO va ningun valor de los inputs del formulario.
        body: JSON.stringify({ token: cfg.token, level: cfg.level, type: type })
      }).catch(function () { /* sin conexion: no pasa nada, es un laboratorio */ });
    } catch (e) { /* noop */ }
  }

  // 1) Visita
  logEvent('visit');

  // 2) Envio + revelacion
  function reveal() {
    logEvent('submit');
    var bait = document.getElementById('bait');
    var rev = document.getElementById('reveal');
    if (bait) bait.style.display = 'none';
    if (rev) rev.classList.add('show');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('claimBtn');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        reveal();
      });
    }
  });

  window.__reveal = reveal; // por si alguna pagina necesita dispararla
})();
