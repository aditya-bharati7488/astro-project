(() => {
  const config = window.ASTRONOMY_ACES_CONFIG || { instagramUrl: '' };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('[data-instagram-link]').forEach((link) => {
    if (config.instagramUrl) {
      link.href = config.instagramUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else {
      link.href = 'about.html#instagram';
      link.title = 'Official Instagram link will be added here.';
    }
  });

  const canvas = document.querySelector('[data-cosmic-field]');
  if (canvas) {
    const context = canvas.getContext('2d', { alpha: true });
    const pointer = { x: 0.5, y: 0.5 };
    let stars = [];
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let lastFrame = 0;
    let shootingStar = null;

    function makeStar() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.35 + Math.random() * 1.3,
        speed: 0.004 + Math.random() * 0.025,
        depth: 0.15 + Math.random() * 0.85,
        alpha: 0.18 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2
      };
    }

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(bounds.height));
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const targetCount = Math.min(115, Math.max(48, Math.round(width * height / 17000)));
      stars = Array.from({ length: targetCount }, makeStar);
    }

    function draw(now) {
      const seconds = now * 0.001;
      context.clearRect(0, 0, width, height);
      const parallaxX = (pointer.x - 0.5) * 14;
      const parallaxY = (pointer.y - 0.5) * 10;

      stars.forEach((star) => {
        const twinkle = 0.65 + Math.sin(seconds * 1.6 + star.phase) * 0.35;
        const x = star.x + parallaxX * star.depth;
        const y = star.y + parallaxY * star.depth;
        context.beginPath();
        context.fillStyle = `rgba(216, 244, 255, ${star.alpha * twinkle})`;
        context.arc(x, y, star.radius, 0, Math.PI * 2);
        context.fill();
      });

      if (!reducedMotion.matches && !shootingStar && Math.random() < 0.0017) {
        shootingStar = { x: width * (0.55 + Math.random() * 0.35), y: 20 + Math.random() * height * 0.28, age: 0 };
      }
      if (shootingStar) {
        shootingStar.age += 0.022;
        const length = 80 + shootingStar.age * 150;
        const opacity = Math.max(0, 0.58 - shootingStar.age * 0.38);
        context.beginPath();
        context.moveTo(shootingStar.x + shootingStar.age * 180, shootingStar.y + shootingStar.age * 86);
        context.lineTo(shootingStar.x + shootingStar.age * 180 - length, shootingStar.y + shootingStar.age * 86 - length * 0.42);
        context.strokeStyle = `rgba(157, 220, 255, ${opacity})`;
        context.lineWidth = 1;
        context.stroke();
        if (shootingStar.age > 1.45) shootingStar = null;
      }

      if (!reducedMotion.matches && !document.hidden) requestAnimationFrame(draw);
    }

    resize();
    addEventListener('resize', resize, { passive: true });
    addEventListener('pointermove', (event) => {
      pointer.x = event.clientX / window.innerWidth;
      pointer.y = event.clientY / window.innerHeight;
    }, { passive: true });
    requestAnimationFrame(draw);
    reducedMotion.addEventListener('change', () => requestAnimationFrame(draw));
  }

  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  document.querySelectorAll('.magnetic').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      if (reducedMotion.matches) return;
      const bounds = button.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) * 0.11;
      const y = (event.clientY - bounds.top - bounds.height / 2) * 0.11;
      button.style.transform = `translate(${x}px, ${y}px)`;
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
  });
})();
