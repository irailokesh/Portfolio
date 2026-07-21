/* ==========================================================================
   Iraiyanbu Suresh — Portfolio
   script.js — modular, dependency-free interactivity
   ========================================================================== */
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------------------- Loading screen ---------------------------- */
  const initLoader = () => {
    const loader = $('#loader');
    if (!loader) return;
    const dots = $('#loader-dots');
    let count = 0;
    const dotTimer = setInterval(() => {
      count = (count + 1) % 4;
      if (dots) dots.textContent = '.'.repeat(count);
    }, 350);

    window.addEventListener('load', () => {
      clearInterval(dotTimer);
      setTimeout(() => loader.classList.add('hide'), 400);
    });
    // Fallback in case load event already fired
    setTimeout(() => {
      clearInterval(dotTimer);
      loader.classList.add('hide');
    }, 2500);
  };

  /* ------------------------------ Theme toggle ----------------------------- */
  const initTheme = () => {
    const root = document.documentElement;
    const toggle = $('#themeToggle');
    const saved = localStorage.getItem('portfolio-theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const initial = saved || (prefersLight ? 'light' : 'dark');
    root.setAttribute('data-theme', initial);
    if (toggle) toggle.setAttribute('aria-pressed', String(initial === 'light'));

    toggle?.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', current);
      localStorage.setItem('portfolio-theme', current);
      toggle.setAttribute('aria-pressed', String(current === 'light'));
    });
  };

  /* -------------------------------- Nav / menu ------------------------------ */
  const initNav = () => {
    const navbar = $('#navbar');
    const hamburger = $('#hamburger');
    const mobileMenu = $('#mobileMenu');

    const onScroll = () => {
      if (window.scrollY > 24) navbar.classList.add('is-scrolled');
      else navbar.classList.remove('is-scrolled');
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const closeMenu = () => {
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
    };

    hamburger?.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    $$('#mobileMenu a').forEach(a => a.addEventListener('click', closeMenu));

    // Smooth scroll for in-page anchors, accounting for sticky nav height
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        closeMenu();
        const navH = navbar ? navbar.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        history.pushState(null, '', id);
      });
    });

    // Active link highlighting via IntersectionObserver
    const sections = $$('main section[id]');
    const navLinks = $$('.nav-links a');
    if ('IntersectionObserver' in window && sections.length) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const link = navLinks.find(a => a.getAttribute('href') === `#${entry.target.id}`);
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(a => a.classList.remove('active'));
            link.classList.add('active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(sec => obs.observe(sec));
    }
  };

  /* ------------------------------ Scroll progress ---------------------------- */
  const initScrollProgress = () => {
    const bar = $('#scrollProgress');
    if (!bar) return;
    const update = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop || document.body.scrollTop;
      const height = h.scrollHeight - h.clientHeight;
      bar.style.width = height > 0 ? `${(scrolled / height) * 100}%` : '0%';
    };
    document.addEventListener('scroll', update, { passive: true });
    update();
  };

  /* --------------------------------- Back to top ------------------------------ */
  const initBackToTop = () => {
    const btn = $('#backToTop');
    if (!btn) return;
    document.addEventListener('scroll', () => {
      btn.classList.toggle('show', window.scrollY > 480);
    }, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  };

  /* --------------------------------- Reveal on scroll -------------------------- */
  const initReveal = () => {
    const targets = $$('.reveal, .reveal-stagger');
    if (!targets.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(t => t.classList.add('in-view'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach(t => obs.observe(t));
  };

  /* ------------------------------ Animated counters ---------------------------- */
  const initCounters = () => {
    const counters = $$('[data-counter]');
    if (!counters.length) return;

    const animate = (el) => {
      const target = parseFloat(el.dataset.target || '0');
      const decimal = el.dataset.decimal;
      const finalValue = decimal ? parseFloat(`${target}.${decimal}`) : target;
      if (prefersReducedMotion) {
        el.textContent = decimal ? finalValue.toFixed(2) : String(Math.round(finalValue));
        return;
      }
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = finalValue * eased;
        el.textContent = decimal ? value.toFixed(2) : String(Math.round(value));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animate(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach(c => obs.observe(c));
    } else {
      counters.forEach(animate);
    }
  };

  /* ------------------------------ Education progress bars ----------------------- */
  const initProgressBars = () => {
    const bars = $$('.progress-fill[data-progress]');
    if (!bars.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.style.width = `${el.dataset.progress}%`;
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(b => obs.observe(b));
  };

  /* --------------------------------- Typing effect ------------------------------ */
  const initTypingRole = () => {
    const el = $('#typedRole');
    if (!el) return;
    const roles = ['Java Developer', 'Backend Enthusiast', 'Problem Solver', 'Lifelong Learner'];
    if (prefersReducedMotion) { el.textContent = roles[0]; return; }

    let roleIndex = 0, charIndex = roles[0].length, deleting = false;

    const tick = () => {
      const word = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        if (charIndex > word.length) { deleting = true; charIndex = word.length; setTimeout(tick, 1400); return; }
      } else {
        charIndex--;
        if (charIndex < 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; charIndex = 0; }
      }
      el.textContent = word.slice(0, charIndex);
      setTimeout(tick, deleting ? 45 : 90);
    };
    setTimeout(tick, 1200);
  };

  /* --------------------------------- Terminal animation -------------------------- */
  const initTerminal = () => {
    const body = $('#terminalBody');
    if (!body) return;

    const lines = [
      { type: 'cmd', text: 'whoami' },
      { type: 'out', text: 'Iraiyanbu Suresh — Java Developer' },
      { type: 'cmd', text: 'javac Career.java' },
      { type: 'ok', text: 'Compiled successfully.' },
      { type: 'cmd', text: 'java Career --skills' },
      { type: 'out', text: 'Core Java · OOP · SQL · DBMS' },
      { type: 'out', text: 'Backend Development · Clean Code' },
      { type: 'cmd', text: 'java Career --status' },
      { type: 'ok', text: 'Open to Java Developer roles ✓' },
    ];

    if (prefersReducedMotion) {
      body.innerHTML = lines.map(renderStaticLine).join('');
      return;
    }

    let li = 0;
    const typeNextLine = () => {
      if (li >= lines.length) return;
      const line = lines[li];
      const rowEl = document.createElement('div');
      rowEl.className = 'terminal-line';
      body.appendChild(rowEl);

      if (line.type === 'cmd') {
        let ci = 0;
        const prefix = document.createElement('span');
        prefix.className = 'prompt';
        prefix.textContent = '$ ';
        rowEl.appendChild(prefix);
        const textNode = document.createElement('span');
        rowEl.appendChild(textNode);
        const typeChar = () => {
          if (ci <= line.text.length) {
            textNode.textContent = line.text.slice(0, ci);
            ci++;
            setTimeout(typeChar, 32);
          } else {
            li++;
            setTimeout(typeNextLine, 260);
          }
        };
        typeChar();
      } else {
        rowEl.classList.add(line.type === 'ok' ? 'ok' : 'out');
        rowEl.textContent = line.text;
        li++;
        setTimeout(typeNextLine, 320);
      }
    };
    setTimeout(typeNextLine, 500);
  };

  function renderStaticLine(line) {
    if (line.type === 'cmd') return `<div class="terminal-line"><span class="prompt">$ </span>${line.text}</div>`;
    const cls = line.type === 'ok' ? 'ok' : 'out';
    return `<div class="terminal-line ${cls}">${line.text}</div>`;
  }

  /* --------------------------------- Skill tabs ---------------------------------- */
  const initSkillTabs = () => {
    const tabs = $$('.skills-tabs .tab-btn');
    if (!tabs.length) return;
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        $$('.skill-panel').forEach(p => { p.classList.remove('active'); p.hidden = true; });
        const panel = document.getElementById(tab.dataset.panel);
        if (panel) { panel.classList.add('active'); panel.hidden = false; }
      });
    });
  };

  /* --------------------------------- Project filter ------------------------------- */
  const initProjectFilter = () => {
    const buttons = $$('.filter-row .tab-btn');
    const cards = $$('#projectsGrid .project-card');
    if (!buttons.length || !cards.length) return;
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        cards.forEach(card => {
          const tech = card.dataset.tech || '';
          const show = filter === 'all' || tech.includes(filter);
          card.style.display = show ? '' : 'none';
        });
      });
    });
  };

  /* ------------------------------------ Ripple ------------------------------------- */
  const initRipple = () => {
    $$('.btn, .btn-icon').forEach(btn => {
      btn.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 650);
      });
    });
  };

  /* -------------------------------------- Copy email -------------------------------- */
  const initCopyEmail = () => {
    const btn = $('#copyEmail');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const email = 'irailokesh369@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        const icon = btn.querySelector('i');
        icon.className = 'ri-check-line';
        btn.setAttribute('aria-label', 'Email copied');
        setTimeout(() => { icon.className = 'ri-file-copy-line'; btn.setAttribute('aria-label', 'Copy email address'); }, 1800);
      } catch (err) {
        window.location.href = `mailto:${email}`;
      }
    });
  };

  /* -------------------------------------- Contact form ------------------------------- */
  const initContactForm = () => {
    const form = $('#contactForm');
    if (!form) return;
    const status = $('#formStatus');
    const submitBtn = $('#submitBtn');

    const validators = {
      name: (v) => v.trim().length > 1,
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      subject: (v) => v.trim().length > 1,
      message: (v) => v.trim().length > 4,
    };

    const validateField = (field) => {
      const row = form.querySelector(`[data-field="${field}"]`);
      const input = row.querySelector('input, textarea');
      const isValid = validators[field](input.value);
      row.classList.toggle('has-error', !isValid);
      return isValid;
    };

    Object.keys(validators).forEach(field => {
      const row = form.querySelector(`[data-field="${field}"]`);
      const input = row.querySelector('input, textarea');
      input.addEventListener('blur', () => validateField(field));
      input.addEventListener('input', () => { if (row.classList.contains('has-error')) validateField(field); });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot spam trap
      const honeypot = $('#company');
      if (honeypot && honeypot.value.trim() !== '') return;

      const allValid = Object.keys(validators).map(validateField).every(Boolean);
      if (!allValid) return;

      submitBtn.disabled = true;
      submitBtn.style.opacity = '.7';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          status.textContent = "Message sent — I'll get back to you soon.";
          status.className = 'form-status show success';
          form.reset();
        } else {
          throw new Error('Submission failed');
        }
      } catch (err) {
        status.textContent = 'Something went wrong. Please email me directly instead.';
        status.className = 'form-status show error';
      } finally {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
      }
    });
  };

  /* -------------------------------------- Particles (lightweight) -------------------- */
  const initParticles = () => {
    const canvas = $('#particles');
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height;
    const COUNT = Math.min(50, Math.floor(window.innerWidth / 28));

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const rootStyles = getComputedStyle(document.documentElement);
    const colorA = 'rgba(124, 108, 240, 0.5)';
    const colorB = 'rgba(34, 211, 201, 0.5)';

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.r = Math.random() * 1.6 + 0.4;
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = (Math.random() - 0.5) * 0.15;
        this.color = Math.random() > 0.5 ? colorA : colorB;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    particles = Array.from({ length: COUNT }, () => new Particle());

    let rafId;
    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => { p.update(); p.draw(); });
      rafId = requestAnimationFrame(loop);
    };
    loop();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(rafId);
      else loop();
    });
  };

  /* -------------------------------------- Misc ---------------------------------------- */
  const initMisc = () => {
    const year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());
  };

  /* -------------------------------------- Init ----------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initTheme();
    initNav();
    initScrollProgress();
    initBackToTop();
    initReveal();
    initCounters();
    initProgressBars();
    initTypingRole();
    initTerminal();
    initSkillTabs();
    initProjectFilter();
    initRipple();
    initCopyEmail();
    initContactForm();
    initParticles();
    initMisc();
  });
})();
