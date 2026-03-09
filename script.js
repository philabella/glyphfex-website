/* ========================================
   GlyphFex Landing Page — script.js
   Navigation, FAQ, scroll effects
   ======================================== */

(function () {
    'use strict';

    // ---------- Navbar scroll effect ----------
    const navbar = document.getElementById('navbar');

    function updateNavbar() {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();

    // ---------- Mobile nav toggle ----------
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
            const isOpen = navLinks.classList.contains('open');
            navToggle.setAttribute('aria-expanded', isOpen);
        });

        // Close mobile nav when a link is clicked
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ---------- FAQ Accordion ----------
    document.querySelectorAll('.faq-question').forEach(function (button) {
        button.addEventListener('click', function () {
            var item = this.closest('.faq-item');
            var answer = item.querySelector('.faq-answer');
            var isOpen = item.classList.contains('open');

            // Close all other items
            document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
                if (openItem !== item) {
                    openItem.classList.remove('open');
                    openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                    openItem.querySelector('.faq-answer').style.maxHeight = '0';
                }
            });

            // Toggle current item
            if (isOpen) {
                item.classList.remove('open');
                this.setAttribute('aria-expanded', 'false');
                answer.style.maxHeight = '0';
            } else {
                item.classList.add('open');
                this.setAttribute('aria-expanded', 'true');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // ---------- Smooth scroll for anchor links ----------
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;

            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ---------- Intersection Observer for fade-in animations ----------
    var observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    var fadeObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for fade-in
    var fadeTargets = [
        '.feature-card',
        '.step',
        '.comparison-card',
        '.pricing-card',
        '.faq-item',
        '.diff-card',
        '.proof-stat'
    ];

    fadeTargets.forEach(function (selector) {
        document.querySelectorAll(selector).forEach(function (el) {
            el.classList.add('fade-target');
            fadeObserver.observe(el);
        });
    });

    // Add CSS for fade animation dynamically
    var style = document.createElement('style');
    style.textContent = [
        '.fade-target {',
        '    opacity: 0;',
        '    transform: translateY(20px);',
        '    transition: opacity 0.5s ease, transform 0.5s ease;',
        '}',
        '.fade-target.visible {',
        '    opacity: 1;',
        '    transform: translateY(0);',
        '}',
        /* Stagger animation for grid children */
        '.features-grid .fade-target:nth-child(2) { transition-delay: 0.05s; }',
        '.features-grid .fade-target:nth-child(3) { transition-delay: 0.1s; }',
        '.features-grid .fade-target:nth-child(4) { transition-delay: 0.15s; }',
        '.features-grid .fade-target:nth-child(5) { transition-delay: 0.2s; }',
        '.features-grid .fade-target:nth-child(6) { transition-delay: 0.25s; }',
        '.features-grid .fade-target:nth-child(7) { transition-delay: 0.3s; }',
        '.features-grid .fade-target:nth-child(8) { transition-delay: 0.35s; }',
        '.features-grid .fade-target:nth-child(9) { transition-delay: 0.4s; }'
    ].join('\n');
    document.head.appendChild(style);

})();
