document.addEventListener('DOMContentLoaded', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 1000px)');
    const navbar = document.querySelector('.navbar');
    const toggle = document.querySelector('.menu-toggle');
    const links = document.querySelector('.nav-links');

    function closeMenu() {
        navbar.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu';
    }

    function syncMenu() {
        closeMenu();
        toggle.hidden = !mobile.matches;
    }

    if (navbar && toggle && links) {
        navbar.classList.add('menu-ready');
        syncMenu();
        mobile.addEventListener('change', syncMenu);
        toggle.addEventListener('click', () => {
            const open = navbar.classList.toggle('menu-open');
            toggle.setAttribute('aria-expanded', String(open));
            toggle.textContent = open ? 'Fechar' : 'Menu';
        });
        links.addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                // Move o foco antes de ocultar o link no menu móvel.
                const target = document.querySelector(event.target.closest('a').hash);
                if (target && mobile.matches) {
                    target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: true });
                }
                closeMenu();
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && navbar.classList.contains('menu-open')) {
                closeMenu();
                toggle.focus();
            }
        });
    }

    const phrases = ['Segurança da informação', 'Análise de logs', 'Linux & Redes', 'Desenvolvimento web'];
    const text = document.getElementById('typewriter-text');
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer;

    function typeWriter() {
        if (!text || reducedMotion.matches) return;
        const phrase = phrases[phraseIndex];
        charIndex += deleting ? -1 : 1;
        text.textContent = phrase.slice(0, charIndex);
        let delay = deleting ? 40 : 80;
        if (!deleting && charIndex === phrase.length) {
            deleting = true;
            delay = 2000;
        } else if (deleting && charIndex === 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            delay = 500;
        }
        timer = window.setTimeout(typeWriter, delay);
    }

    const scenes = Array.from(document.querySelectorAll('[data-parallax]'), section => ({
        section,
        viewport: section.querySelector('.footer-viewport'),
        layers: Array.from(section.querySelectorAll('[data-depth]'))
    }));
    let frame = null;

    function renderParallax() {
        frame = null;
        if (reducedMotion.matches) return;
        // Todas as medições são feitas antes de atualizar os estilos.
        const positions = scenes.map(scene => scene.section.getBoundingClientRect());
        const viewportHeights = scenes.map(scene => scene.viewport?.offsetHeight || window.innerHeight);
        scenes.forEach((scene, index) => {
            const rect = positions[index];
            if (rect.bottom < 0 || rect.top > window.innerHeight) return;
            if (scene.section.hasAttribute('data-rising')) {
                // O rodapé permanece visível enquanto a rolagem move o cenário para cima.
                const height = viewportHeights[index];
                const distance = Math.max(1, rect.height - height);
                const progress = Math.max(0, Math.min(1, -rect.top / distance));
                scene.layers.forEach(layer => {
                    const offset = progress * height * Number(layer.dataset.depth);
                    layer.style.setProperty('--parallax-y', `${offset}px`);
                });
                return;
            }
            if (scene.section.hasAttribute('data-cinematic')) {
                const distance = Math.max(1, rect.height - window.innerHeight);
                const progress = Math.max(0, Math.min(1, -rect.top / distance));
                scene.section.style.setProperty('--title-opacity', String(Math.max(0, 1 - progress * 1.7)));
                scene.layers.forEach(layer => {
                    const offset = progress * window.innerHeight * Number(layer.dataset.depth);
                    layer.style.setProperty('--parallax-y', `${offset}px`);
                    layer.style.setProperty('--scene-scale', String(1 + progress * (layer.classList.contains('scene-foreground') ? 0.24 : 0.06)));
                });
                return;
            }
            scene.layers.forEach(layer => {
                const depth = Number(layer.dataset.depth) * (mobile.matches ? 0.55 : 1);
                const offset = Math.max(-80, Math.min(80, -rect.top * depth));
                layer.style.setProperty('--parallax-y', `${offset}px`);
            });
        });
    }

    function scheduleParallax() {
        if (!reducedMotion.matches && frame === null) {
            frame = window.requestAnimationFrame(renderParallax);
        }
    }

    function syncMotion() {
        window.clearTimeout(timer);
        if (frame !== null) window.cancelAnimationFrame(frame);
        frame = null;
        phraseIndex = 0;
        charIndex = phrases[0].length;
        deleting = true;
        if (text) text.textContent = phrases[0];
        if (reducedMotion.matches) {
            scenes.forEach(scene => {
                scene.section.style.removeProperty('--title-opacity');
                scene.layers.forEach(layer => {
                    layer.style.removeProperty('--parallax-y');
                    layer.style.removeProperty('--scene-scale');
                });
            });
        } else {
            timer = window.setTimeout(typeWriter, 2000);
            scheduleParallax();
        }
    }

    window.addEventListener('scroll', scheduleParallax, { passive: true });
    window.addEventListener('resize', scheduleParallax, { passive: true });
    reducedMotion.addEventListener('change', syncMotion);
    syncMotion();
});
