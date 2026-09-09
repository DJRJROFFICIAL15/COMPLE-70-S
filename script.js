/* =========================================================
   Marycielo 70's — script.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------------------
     0) TÍTULO DE LA PESTAÑA — refleja si ya se confirmó
     ----------------------------------------------------- */
  const ORIGINAL_TITLE = document.title;
  const RSVP_STORAGE_KEY = 'mn70_rsvp_status';

  function setTabTitle(asistencia) {
    if (asistencia === 'Sí asistiré') {
      document.title = '✅ Confirmado — Maricela 70\'s';
    } else if (asistencia === 'No podré asistir') {
      document.title = '💌 Respondido — Maricela 70\'s';
    } else {
      document.title = ORIGINAL_TITLE;
    }
  }

  function guardarRespuestaLocal(asistencia, folio) {
    try {
      localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify({ asistencia, folio, fecha: Date.now() }));
    } catch (err) {
      // Si el navegador bloquea localStorage (modo incógnito, etc.) no pasa nada grave
      console.warn('No se pudo guardar la respuesta localmente:', err);
    }
  }

  function leerRespuestaLocal() {
    try {
      const raw = localStorage.getItem(RSVP_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  // Si esta persona ya confirmó antes desde este mismo navegador,
  // la pestaña lo muestra de inmediato al volver a entrar.
  const respuestaPrevia = leerRespuestaLocal();
  if (respuestaPrevia) setTabTitle(respuestaPrevia.asistencia);

  /* -----------------------------------------------------
     1) SOBRE INTERACTIVO → abre y revela el contenido
     ----------------------------------------------------- */
  const envelopePage = document.getElementById('page-envelope');
  const mainPage = document.getElementById('page-main');
  const envelope = document.getElementById('envelope');
  const seal = document.getElementById('seal');

  let opened = false;

  function openInvitation() {
    if (opened) return;
    opened = true;

    envelope.classList.add('is-open');

    // Espera a que corra la animación del sobre antes de hacer scroll-swap
    setTimeout(() => {
      envelopePage.classList.add('is-leaving');
      document.body.style.overflow = '';
      window.scrollTo({ top: 0 });

      mainPage.classList.add('is-visible');

      setTimeout(() => {
        envelopePage.style.display = 'none';
        revealOnScroll(); // dispara el primer chequeo de secciones visibles
      }, 700);
    }, 900);
  }

  // Bloquea el scroll mientras el sobre está en pantalla
  document.body.style.overflow = 'hidden';

  if (seal) {
    seal.addEventListener('click', (e) => {
      e.stopPropagation();
      openInvitation();
    });
  }

  if (envelope) {
    envelope.addEventListener('click', openInvitation);
    envelope.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openInvitation();
      }
    });
  }

  /* -----------------------------------------------------
     2) CONTADOR REGRESIVO (mini, sección "Llega rápido")
     Sábado 26 de septiembre de 2026, 9:30 a.m.
     ----------------------------------------------------- */
  const EVENT_DATE = new Date(2026, 8, 26, 9, 30, 0); // mes 8 = septiembre (0-indexado)

  const cdMini = {
    days: document.getElementById('cd-mini-days'),
    hours: document.getElementById('cd-mini-hours'),
    minutes: document.getElementById('cd-mini-minutes'),
    seconds: document.getElementById('cd-mini-seconds'),
  };

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function updateCountdown() {
    if (!cdMini.days || !cdMini.hours || !cdMini.minutes || !cdMini.seconds) return;

    const now = new Date();
    let diff = EVENT_DATE - now;

    if (diff <= 0) {
      cdMini.days.textContent = '00';
      cdMini.hours.textContent = '00';
      cdMini.minutes.textContent = '00';
      cdMini.seconds.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);

    const seconds = Math.floor(diff / 1000);

    cdMini.days.textContent = pad(days);
    cdMini.hours.textContent = pad(hours);
    cdMini.minutes.textContent = pad(minutes);
    cdMini.seconds.textContent = pad(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* -----------------------------------------------------
     3) REVEAL ON SCROLL
     ----------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  function revealOnScroll() {
    revealEls.forEach((el) => observer.observe(el));
  }

  /* -----------------------------------------------------
     4) RSVP — botón de asistencia + link para declinar + envío
     ----------------------------------------------------- */
  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpConfirmed = document.getElementById('rsvp-confirmed');
  const rsvpConfirmedTitle = document.getElementById('rsvp-confirmed-title');
  const rsvpConfirmedSubtitle = document.getElementById('rsvp-confirmed-subtitle');
  const rsvpError = document.getElementById('rsvp-error');

  function mostrarConfirmacion(asistencia) {
    if (rsvpForm) rsvpForm.classList.add('hidden');
    const questionTitle = document.getElementById('rsvp-question-title');
    if (questionTitle) questionTitle.classList.add('hidden');
    if (rsvpConfirmedTitle) {
      rsvpConfirmedTitle.textContent = asistencia === 'Sí asistiré'
        ? '¡Gracias por confirmar!'
        : 'Gracias por avisarnos';
    }
    if (rsvpConfirmedSubtitle) {
      rsvpConfirmedSubtitle.textContent = asistencia === 'Sí asistiré'
        ? 'Te esperamos el 26 de septiembre. ✨'
        : 'Lamentamos que no puedas acompañarnos, ¡gracias por tu mensaje! 💛';
    }
    if (rsvpConfirmed) rsvpConfirmed.classList.remove('hidden');
  }

  const rsvpChangeBtn = document.getElementById('rsvp-change');
  if (rsvpChangeBtn) {
    rsvpChangeBtn.addEventListener('click', () => {
      try { localStorage.removeItem(RSVP_STORAGE_KEY); } catch (err) { /* no-op */ }
      document.title = ORIGINAL_TITLE;
      if (rsvpConfirmed) rsvpConfirmed.classList.add('hidden');
      const questionTitle = document.getElementById('rsvp-question-title');
      if (questionTitle) questionTitle.classList.remove('hidden');
      if (rsvpForm) {
        rsvpForm.classList.remove('hidden');
        rsvpForm.reset();
      }
      // Regresa el formulario a su estado inicial (sin opción elegida todavía)
      const asistenciaInput = document.getElementById('rsvp-asistencia');
      const btnSi = document.getElementById('btn-si');
      const btnNo = document.getElementById('btn-no');
      const headingEl = document.getElementById('rsvp-heading');
      const nameWrap = document.getElementById('rsvp-name-wrap');
      const messageWrap = document.getElementById('rsvp-message-wrap');
      const submitBtn = document.getElementById('rsvp-submit');
      if (asistenciaInput) asistenciaInput.value = '';
      if (btnSi) btnSi.classList.remove('is-active');
      if (btnNo) btnNo.classList.remove('is-active', 'is-active--decline');
      if (headingEl) headingEl.classList.add('hidden');
      if (nameWrap) nameWrap.classList.add('hidden');
      if (messageWrap) messageWrap.classList.add('hidden');
      if (submitBtn) {
        submitBtn.textContent = 'Selecciona una opción';
        submitBtn.setAttribute('disabled', 'true');
      }
    });
  }

  if (rsvpForm) {
    const btnSi = document.getElementById('btn-si');
    const btnNo = document.getElementById('btn-no');
    const asistenciaInput = document.getElementById('rsvp-asistencia');
    const folioInput = document.getElementById('rsvp-folio');
    const headingEl = document.getElementById('rsvp-heading');
    const nameWrap = document.getElementById('rsvp-name-wrap');
    const nameInput = document.getElementById('rsvp-name');
    const messageWrap = document.getElementById('rsvp-message-wrap');
    const messageLabel = document.getElementById('rsvp-message-label');
    const messageInput = document.getElementById('rsvp-message');
    const submitBtn = document.getElementById('rsvp-submit');

    // ---- Overlay animado: carta enviándose / recibida / falló ----
    const statusOverlay = document.getElementById('rsvp-status');
    const statusTitle = document.getElementById('rsvp-status-title');
    const statusSubtitle = document.getElementById('rsvp-status-subtitle');
    const statusClose = document.getElementById('rsvp-status-close');
    let statusHideTimer;

    function showRsvpStatus(state, title, subtitle, opts = {}) {
      if (!statusOverlay) return;
      clearTimeout(statusHideTimer);
      statusOverlay.classList.remove('state-sending', 'state-success', 'state-error');
      // Forzar reflow para poder re-disparar las animaciones si se envía dos veces
      void statusOverlay.offsetWidth;
      statusOverlay.classList.add('is-visible', `state-${state}`);
      if (statusTitle) statusTitle.textContent = title;
      if (statusSubtitle) statusSubtitle.textContent = subtitle;
      if (statusClose) statusClose.classList.toggle('hidden', !opts.closable);
      if (opts.autoHideMs) {
        statusHideTimer = setTimeout(hideRsvpStatus, opts.autoHideMs);
      }
    }

    function hideRsvpStatus() {
      if (!statusOverlay) return;
      statusOverlay.classList.remove('is-visible');
    }

    if (statusClose) statusClose.addEventListener('click', hideRsvpStatus);

    function generarFolio() {
      const fecha = Date.now().toString(36).toUpperCase();
      const azar = Math.random().toString(36).slice(2, 6).toUpperCase();
      return `MN70-${fecha}-${azar}`;
    }

    function mostrarCampos() {
      if (headingEl) headingEl.classList.remove('hidden');
      if (nameWrap) nameWrap.classList.remove('hidden');
      if (nameInput) nameInput.setAttribute('required', 'true');
      if (messageWrap) messageWrap.classList.remove('hidden');
      if (messageInput) messageInput.setAttribute('required', 'true');
    }

    function setAttending() {
      asistenciaInput.value = 'Sí asistiré';
      folioInput.value = generarFolio();

      if (btnSi) btnSi.classList.add('is-active');
      if (btnNo) btnNo.classList.remove('is-active', 'is-active--decline');

      mostrarCampos();
      if (headingEl) headingEl.textContent = 'Déjale una emotiva felicitación, esto formara parte de un gran regalo sopresa';
      if (messageLabel) messageLabel.textContent = 'Tu mensaje';
      if (messageInput) messageInput.placeholder = 'Escribe tu mensaje de felicitación...';

      if (submitBtn) {
        submitBtn.textContent = 'Confirmar Asistencia';
        submitBtn.removeAttribute('disabled');
      }
    }

    function setDeclining() {
      asistenciaInput.value = 'No podré asistir';
      folioInput.value = generarFolio();

      if (btnNo) btnNo.classList.add('is-active', 'is-active--decline');
      if (btnSi) btnSi.classList.remove('is-active');

      mostrarCampos();
      if (headingEl) headingEl.textContent = 'Aunque no puedas estar, que sienta tu felicitación a la distancia, esto formara parte de un gran regalo sopresa';
      if (messageLabel) messageLabel.textContent = 'Tu mensaje';
      if (messageInput) messageInput.placeholder = 'Escribe tu mensaje para ella...';

      if (submitBtn) {
        submitBtn.textContent = 'Enviar Mensaje';
        submitBtn.removeAttribute('disabled');
      }
    }

    if (btnSi) btnSi.addEventListener('click', setAttending);
    if (btnNo) btnNo.addEventListener('click', setDeclining);

    // Si esta persona ya había confirmado antes desde este navegador,
    // mostramos directamente el estado de "ya respondido" en vez del formulario.
    if (respuestaPrevia) {
      mostrarConfirmacion(respuestaPrevia.asistencia);
    }

    rsvpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!asistenciaInput.value) return;

      const originalLabel = submitBtn ? submitBtn.textContent : 'Enviar';
      if (submitBtn) {
        submitBtn.setAttribute('disabled', 'true');
        submitBtn.textContent = 'Enviando...';
      }
      if (rsvpError) rsvpError.classList.add('hidden');

      showRsvpStatus(
        'sending',
        'Enviando tu carta…',
        'Un momento, la estamos entregando ✉️'
      );

      // Enviamos como JSON dentro de un body "text/plain": esto evita el preflight
      // de CORS (que Apps Script no sabe responder) pero SÍ nos permite leer
      // la respuesta real del servidor, a diferencia de mode: 'no-cors'.
      const payload = {
        asistencia: asistenciaInput.value,
        folio: folioInput.value,
        nombre: nameInput ? nameInput.value : '',
        mensaje: messageInput ? messageInput.value : '',
      };

      try {
        const res = await fetch(rsvpForm.action, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const result = await res.json();

        if (result.status !== 'success') {
          throw new Error(result.message || 'El servidor respondió con un error');
        }

        mostrarConfirmacion(asistenciaInput.value);
        setTabTitle(asistenciaInput.value);
        guardarRespuestaLocal(asistenciaInput.value, folioInput.value);
        showRsvpStatus(
          'success',
          '¡Carta recibida!',
          'Gracias por confirmar. Te esperamos el 26 de septiembre ✨',
          { autoHideMs: 3200 }
        );
      } catch (err) {
        console.error('Error al enviar:', err);
        if (rsvpError) rsvpError.classList.remove('hidden');
        if (submitBtn) {
          submitBtn.removeAttribute('disabled');
          submitBtn.textContent = originalLabel;
        }
        showRsvpStatus(
          'error',
          'La carta no llegó',
          'Hubo un problema al enviarla. Ciérra esta ventana e inténtalo de nuevo.',
          { closable: true }
        );
      }
    });
  }

});