/* =========================================================
   Marycielo 70's — script.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

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

  seal.addEventListener('click', (e) => {
    e.stopPropagation();
    openInvitation();
  });

  envelope.addEventListener('click', openInvitation);
  envelope.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openInvitation();
    }
  });

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
     5) RSVP — botón de asistencia + link para declinar + envío
     ----------------------------------------------------- */
  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpSuccess = document.getElementById('rsvp-success');
  const rsvpError = document.getElementById('rsvp-error');

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

    function generarFolio() {
      const fecha = Date.now().toString(36).toUpperCase();
      const azar = Math.random().toString(36).slice(2, 6).toUpperCase();
      return `MN70-${fecha}-${azar}`;
    }

    function mostrarCampos() {
      headingEl.classList.remove('hidden');
      nameWrap.classList.remove('hidden');
      nameInput.setAttribute('required', 'true');
      messageWrap.classList.remove('hidden');
      messageInput.setAttribute('required', 'true');
    }

    function setAttending() {
      asistenciaInput.value = 'Sí asistiré';
      folioInput.value = generarFolio();

      btnSi.classList.add('is-active');
      btnNo.classList.remove('is-active', 'is-active--decline');

      mostrarCampos();
      headingEl.textContent = 'Déjale una emotiva felicitación a Maricela, esto formara parte de un gran regalo sopresa';
      messageLabel.textContent = 'Tu mensaje';
      messageInput.placeholder = 'Escribe tu mensaje de felicitación...';

      submitBtn.textContent = 'Confirmar Asistencia';
      submitBtn.removeAttribute('disabled');
    }

    function setDeclining() {
      asistenciaInput.value = 'No podré asistir';
      folioInput.value = generarFolio();

      btnNo.classList.add('is-active', 'is-active--decline');
      btnSi.classList.remove('is-active');

      mostrarCampos();
      headingEl.textContent = 'Aunque no puedas estar, que sienta tu felicitación a la distancia, esto formara parte de un gran regalo sopresa';
      messageLabel.textContent = 'Tu mensaje';
      messageInput.placeholder = 'Escribe tu mensaje para ella...';

      submitBtn.textContent = 'Enviar Mensaje';
      submitBtn.removeAttribute('disabled');
    }

    btnSi.addEventListener('click', setAttending);
    btnNo.addEventListener('click', setDeclining);

    rsvpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!asistenciaInput.value) return;

      const originalLabel = submitBtn.textContent;
      submitBtn.setAttribute('disabled', 'true');
      submitBtn.textContent = 'Enviando...';
      rsvpError.classList.add('hidden');

      const formData = new FormData(rsvpForm);

      try {
        const response = await fetch(rsvpForm.action, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) throw new Error('Respuesta no válida del servidor');

        rsvpForm.classList.add('hidden');
        rsvpSuccess.classList.remove('hidden');
      } catch (err) {
        rsvpError.classList.remove('hidden');
        submitBtn.removeAttribute('disabled');
        submitBtn.textContent = originalLabel;
      }
    });
  }

});
