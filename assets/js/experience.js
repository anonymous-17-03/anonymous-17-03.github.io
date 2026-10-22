'use strict';
(() => {
  const root = document.documentElement;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  root.classList.add('js-enabled');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let userPaused = false;
  try { userPaused = localStorage.getItem('novahacking-motion-paused') === 'true'; } catch (_) {}
  let motion = !reduced.matches && !userPaused;
  const motionButton = $('.motion-toggle');
  function applyMotion() {
    motion = !reduced.matches && !userPaused;
    root.classList.toggle('motion-on', motion);
    root.classList.toggle('motion-off', !motion);
    if (motionButton) {
      motionButton.setAttribute('aria-pressed', String(!motion));
      motionButton.textContent = reduced.matches ? 'Efectos reducidos' : userPaused ? 'Activar efectos' : 'Pausar efectos';
      motionButton.disabled = reduced.matches;
      motionButton.title = reduced.matches ? 'Se respeta la preferencia de movimiento reducido de tu sistema.' : '';
    }
    if (!motion) {
      $$('.reveal-ready').forEach(element => element.classList.add('is-visible'));
      const portrait = $('.portrait');
      if (portrait) portrait.style.transform = '';
      $$('.project-small').forEach(card => card.style.transform = '');
    }
  }
  applyMotion();
  reduced.addEventListener('change', applyMotion);
  motionButton?.addEventListener('click', () => {
    userPaused = !userPaused;
    try { localStorage.setItem('novahacking-motion-paused', String(userPaused)); } catch (_) {}
    applyMotion();
  });
  const menu = $('.menu-toggle');
  const nav = $('#main-nav');
  if (menu && nav) {
    menu.hidden = false;
    const closeMenu = () => { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); }
    });
  }
  // Scroll events update once per animation frame, without taking over scrolling.
  let scrollPending = false;
  const sectionLinks = $$('.main-nav a[href^="#"]');
  const sections = sectionLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);
  const progress = $('.reading-progress span');
  const header = $('.site-header');
  function updateScroll() {
    scrollPending = false;
    const distance = root.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0})`;
    header?.classList.toggle('is-scrolled', window.scrollY > 20);
    let active = null;
    sections.forEach(section => { if (section.getBoundingClientRect().top < window.innerHeight * .4) active = section.id; });
    sectionLinks.forEach(link => {
      if (link.hash === `#${active}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();
  if ('IntersectionObserver' in window && motion) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .06 });
    $$('.section-heading, .about-copy, .featured-project, .project-small, .skill-list article, .timeline article, .contact-grid').forEach(element => {
      if (element.getBoundingClientRect().top > window.innerHeight) { element.classList.add('reveal-ready'); observer.observe(element); }
    });
  }
  // Pointer effects are restricted to precise pointing devices and stop when paused.
  let pointerFrame = 0;
  document.addEventListener('pointermove', event => {
    if (!motion || !finePointer.matches || pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      root.style.setProperty('--pointer-x', `${event.clientX}px`);
      root.style.setProperty('--pointer-y', `${event.clientY}px`);
      pointerFrame = 0;
    });
  }, { passive: true });
  $$('.project-small, .archive-card, .hero-visual').forEach(card => {
    let frame = 0;
    card.addEventListener('pointermove', event => {
      if (!motion || !finePointer.matches || frame) return;
      frame = requestAnimationFrame(() => {
        const bounds = card.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        card.style.setProperty('--card-x', `${x}px`);
        card.style.setProperty('--card-y', `${y}px`);
        if (card.classList.contains('hero-visual')) {
          const portrait = card.querySelector('.portrait');
          portrait.style.transform = `rotate(2deg) rotateX(${-(y / bounds.height - .5) * 6}deg) rotateY(${(x / bounds.width - .5) * 8}deg)`;
        }
        frame = 0;
      });
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame); frame = 0;
      const portrait = card.querySelector('.portrait');
      if (portrait) portrait.style.transform = '';
    });
  });
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const toolbar = $('[data-filter-toolbar]');
  if (toolbar) {
    toolbar.hidden = false;
    const cards = $$('[data-platform]');
    const filters = $$('[data-filter]');
    const search = $('#archive-search');
    let category = 'all';
    function filterCards() {
      const query = normalize(search?.value || '');
      let count = 0;
      cards.forEach(card => {
        const match = (category === 'all' || category === card.dataset.platform) && normalize(card.textContent).includes(query);
        card.hidden = !match;
        if (match) count++;
      });
      $('#archive-count').textContent = `${count} ${count === 1 ? 'publicación' : 'publicaciones'}`;
      $('#archive-empty').hidden = count > 0;
    }
    filters.forEach(button => button.addEventListener('click', () => {
      category = button.dataset.filter;
      filters.forEach(other => {
        const active = other === button;
        other.classList.toggle('active', active);
        other.setAttribute('aria-pressed', String(active));
      });
      filterCards();
    }));
    search?.addEventListener('input', filterCards);
  }
  const dialog = $('#command-dialog');
  const input = $('#command-input');
  const results = $('#command-results');
  const commandEntries = [
    { name: 'Sobre mí', description: 'Mi perfil y forma de aprender', href: '#sobre-mi', icon: '01', keywords: 'victor whoami' },
    { name: 'Proyectos', description: 'NovaHacking, My_Nvim y DockerLabs', href: '#proyectos', icon: '02', keywords: 'codigo programacion' },
    { name: 'Herramientas y conocimientos', description: 'Pentesting, reversing, programación y Linux', href: '#habilidades', icon: '03', keywords: 'skills python gdb nmap' },
    { name: 'Archivo de writeups', description: 'Mis primeras resoluciones de CTFs', href: '#writeups', icon: '04', keywords: 'maquinas laboratorios' },
    { name: 'Formación', description: 'Estudios y aprendizaje', href: '#formacion', icon: '05', keywords: 'educacion universidad' },
    { name: 'Contacto', description: 'Correo, LinkedIn y GitHub', href: '#contacto', icon: '06', keywords: 'email hablar' },
    { name: 'Currículum', description: 'Consultar mi perfil profesional', href: 'cv/', icon: 'CV', keywords: 'cv pdf curriculum' },
    { name: 'NovaHacking · GitBook', description: 'Nuevos artículos y writeups', href: 'https://novahacking.gitbook.io/anonymous17', icon: '↗', keywords: 'documentacion blog' },
    { name: 'My_Nvim', description: 'Mi configuración de Neovim', href: 'https://github.com/anonymous-17-03/My_Nvim', icon: '↗', keywords: 'lua codigo linux' },
    { name: 'DockerLabs', description: 'Mi actividad en la plataforma', href: 'https://dockerlabs.es/perfil/anonymous17', icon: '↗', keywords: 'ctf perfil' }
  ];
  $$('.archive-card').forEach(card => {
    const link = card.querySelector('h3 a');
    commandEntries.push({ name: link.textContent.replace('↗', '').trim(), description: `Writeup original · ${card.dataset.platform === 'vulnhub' ? 'VulnHub' : 'DockerLabs'}`, href: link.getAttribute('href'), icon: '↗', keywords: 'ctf maquina writeup' });
  });
  function renderCommands() {
    const query = normalize(input.value);
    const matches = commandEntries.filter(item => normalize(`${item.name} ${item.description} ${item.keywords}`).includes(query));
    results.replaceChildren();
    matches.forEach(item => {
      const anchor = document.createElement('a'); anchor.className = 'command-result'; anchor.href = item.href;
      const icon = document.createElement('span'); icon.className = 'result-icon'; icon.setAttribute('aria-hidden', 'true'); icon.textContent = item.icon;
      const copy = document.createElement('span'); copy.textContent = item.name;
      const detail = document.createElement('small'); detail.textContent = item.description; copy.append(detail);
      const arrow = document.createElement('span'); arrow.className = 'result-arrow'; arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
      anchor.append(icon, copy, arrow);
      anchor.addEventListener('click', () => {
        dialog.close();
        if (item.href.startsWith('#')) {
          const target = $(item.href);
          target?.setAttribute('tabindex', '-1');
          target?.focus({ preventScroll: true });
        }
      });
      results.append(anchor);
    });
    $('#command-empty').hidden = matches.length > 0;
  }
  function openCommands() {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    input.value = ''; renderCommands();
    if (!dialog.open) dialog.showModal();
    input.focus();
  }
  if (dialog && typeof dialog.showModal === 'function') {
    $('.utility-dock').hidden = false;
    $('.command-trigger').hidden = false;
    $$('.command-trigger, .dock-search').forEach(button => button.addEventListener('click', openCommands));
    $('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
    input.addEventListener('input', renderCommands);
    input.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') { event.preventDefault(); results.querySelector('a')?.focus(); }
      if (event.key === 'Enter') { event.preventDefault(); results.querySelector('a')?.click(); }
    });
    results.addEventListener('keydown', event => {
      if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
      const links = [...results.querySelectorAll('a')];
      const index = links.indexOf(document.activeElement);
      if (index < 0) return;
      event.preventDefault();
      const next = index + (event.key === 'ArrowDown' ? 1 : -1);
      if (next < 0) input.focus(); else links[next]?.focus();
    });
    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); if (dialog.open) dialog.close(); else openCommands();
      }
    });
  }
  const copy = $('.copy-email');
  let toastTimer;
  function announce(message) {
    const toast = $('.toast'); toast.textContent = message; toast.classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
  }
  if (copy && navigator.clipboard?.writeText) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText('victordgarciap2003@gmail.com'); announce('Correo copiado. ¡Hablemos!'); }
      catch (_) { announce('No se pudo copiar. Puedes seleccionar el correo o pulsar Escríbeme.'); }
    });
  }
})();
