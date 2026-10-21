'use strict';
// Añade el CV final en esta ruta. No necesitas modificar el HTML para activarlo.
// La ruta se resuelve desde cv/index.html y respeta subdirectorios de alojamiento.
const cvUrl = new URL('../assets/docs/victor-garcia-cv.pdf', window.location.href);
async function loadCurriculum() {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(cvUrl.href, { signal: controller.signal, cache: 'no-cache' });
    if (!response.ok) return;
    const blob = await response.blob();
    // Evita confundir una página 404 o una redirección HTML con el currículum.
    if (await blob.slice(0, 5).text() !== '%PDF-') return;
    ['cv-open', 'cv-download', 'cv-fallback'].forEach(id => {
      document.getElementById(id).href = cvUrl.href;
    });
    document.getElementById('cv-viewer').data = `${cvUrl.href}#view=FitH`;
    document.getElementById('cv-pending').hidden = true;
    document.getElementById('cv-pdf').hidden = false;
    document.getElementById('cv-announcement').textContent = 'Currículum en PDF disponible para consultar o descargar.';
  } catch (_) {
    // Sin PDF, sin conexión o en file://, el enlace original a Canva sigue visible.
  } finally {
    window.clearTimeout(timeout);
  }
}
loadCurriculum();
