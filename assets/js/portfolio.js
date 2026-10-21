'use strict';
document.documentElement.classList.add('js-enabled');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
if (menuButton && navigation) {
  menuButton.hidden = false;
  const closeMenu = () => { menuButton.setAttribute('aria-expanded', 'false'); navigation.classList.remove('is-open'); };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });
  navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); }
  });
}
const toolbar = document.querySelector('[data-filter-toolbar]');
if (toolbar) {
  const cards = [...document.querySelectorAll('[data-platform]')];
  const buttons = [...toolbar.querySelectorAll('[data-filter]')];
  const count = document.querySelector('#archive-count');
  toolbar.hidden = false;
  buttons.forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.filter;
    buttons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    let visible = 0;
    cards.forEach(card => {
      card.hidden = category !== 'all' && category !== card.dataset.platform;
      if (!card.hidden) visible++;
    });
    count.textContent = `${visible} ${visible === 1 ? 'publicación' : 'publicaciones'}`;
  }));
}
