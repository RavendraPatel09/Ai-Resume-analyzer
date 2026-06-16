/* ============================================================
   AI Career Mentor — shared client helpers
   - Theme toggle (persisted to localStorage, key: acm-theme)
   - Magnetic buttons  [data-magnetic]
   - 3D tilt + glow     [data-tilt]
   Pages must include a tiny inline <head> script that applies the
   saved theme class BEFORE paint to avoid a flash (see pages).
============================================================ */
(function () {
  'use strict';
  var KEY = 'acm-theme';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = window.matchMedia('(hover: none)').matches;

  function current() {
    return document.documentElement.classList.contains('light') ? 'light' : 'dark';
  }

  function refreshToggleUI(theme) {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      // icon = current mode; label = destination (clear for screen readers)
      btn.innerHTML = theme === 'light'
        ? '<i data-lucide="sun" class="h-5 w-5"></i>'
        : '<i data-lucide="moon" class="h-5 w-5"></i>';
      btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
      btn.setAttribute('title', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    });
    if (window.lucide) window.lucide.createIcons();
  }

  function apply(theme) {
    var el = document.documentElement;
    el.classList.remove('light', 'dark');
    el.classList.add(theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    refreshToggleUI(theme);
    window.dispatchEvent(new CustomEvent('acm:themechange', { detail: { theme: theme } }));
  }

  function toggle() { apply(current() === 'light' ? 'dark' : 'light'); }

  function initToggles() {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', toggle);
    });
    refreshToggleUI(current());
  }

  function initMagnetic() {
    if (touch || reduced) return;
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + mx * 0.22 + 'px,' + my * 0.32 + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = 'translate(0,0)'; });
    });
  }

  function initTilt() {
    if (touch || reduced) return;
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', px * 100 + '%');
        card.style.setProperty('--my', py * 100 + '%');
        card.style.transform = 'perspective(900px) rotateX(' + (0.5 - py) * 10 + 'deg) rotateY(' + (px - 0.5) * 12 + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }

  // expose for pages that re-render dynamic content (e.g. dashboard tool cards)
  window.ACM = { apply: apply, current: current, toggle: toggle, initMagnetic: initMagnetic, initTilt: initTilt };

  window.addEventListener('load', function () {
    initToggles();
    initMagnetic();
    initTilt();
  });
})();
