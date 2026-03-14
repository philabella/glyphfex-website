/* ========================================
   GlyphFex Website — script.js
   Navigation, FAQ, scroll animations,
   counter effects, micro-interactions
   ======================================== */

(function () {
    'use strict';

    // ---------- Navbar scroll effect ----------
    var navbar = document.getElementById('navbar');

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
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
        });

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

    // ---------- Scroll Reveal Animations ----------
    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    });

    // Grid containers that should stagger their children
    var gridParentClasses = [
        'features-grid', 'comparison-grid', 'pricing-grid',
        'requirements-grid', 'trial-grid', 'demo-grid', 'proof-stats'
    ];

    // Elements to animate on scroll
    var revealSelectors = [
        '.feature-card', '.step', '.comparison-card', '.pricing-card',
        '.faq-item', '.diff-card', '.proof-stat', '.feature-section',
        '.requirement-card', '.trial-item', '.demo-card',
        '.download-card', '.upsell-card', '.pricing-example',
        '.section-header'
    ];

    revealSelectors.forEach(function (selector) {
        document.querySelectorAll(selector).forEach(function (el) {
            el.classList.add('reveal');

            // Add stagger delay for grid children
            var parent = el.parentElement;
            if (parent) {
                for (var i = 0; i < gridParentClasses.length; i++) {
                    if (parent.classList.contains(gridParentClasses[i])) {
                        var siblings = Array.from(parent.querySelectorAll(selector));
                        var childIndex = siblings.indexOf(el);
                        if (childIndex > 0) {
                            el.style.transitionDelay = (childIndex * 0.08) + 's';
                        }
                        break;
                    }
                }
            }

            revealObserver.observe(el);
        });
    });

    // ---------- Animated Number Counters ----------
    var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.proof-number').forEach(function (el) {
        counterObserver.observe(el);
    });

    function animateCounter(el) {
        var text = el.textContent.trim();
        var match;

        // "5 min" format
        if ((match = text.match(/^(\d+)\s+(.+)$/))) {
            animateNumber(el, 0, parseInt(match[1], 10), 1200, ' ' + match[2]);
        }
        // "50x" format
        else if ((match = text.match(/^(\d+)x$/i))) {
            animateNumber(el, 0, parseInt(match[1], 10), 1200, 'x');
        }
        // "100%" format
        else if ((match = text.match(/^(\d+)%$/))) {
            animateNumber(el, 0, parseInt(match[1], 10), 1200, '%');
        }
        // Text like "Zero" — just ensure visible
        // (no animation needed, already handled by reveal)
    }

    function animateNumber(el, start, end, duration, suffix) {
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.round(start + (end - start) * eased);
            el.textContent = current + (suffix || '');

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    // ---------- Active Nav Link Highlighting ----------
    var sections = document.querySelectorAll('section[id]');

    if (sections.length > 0) {
        var allNavLinks = document.querySelectorAll('.nav-links a[href^="#"]');

        window.addEventListener('scroll', function () {
            var scrollPos = window.scrollY + 100;

            sections.forEach(function (section) {
                var top = section.offsetTop;
                var height = section.offsetHeight;
                var id = section.getAttribute('id');

                if (scrollPos >= top && scrollPos < top + height) {
                    allNavLinks.forEach(function (link) {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { passive: true });
    }

    // ---------- Features page quick nav tracking ----------
    var featuresSections = document.querySelectorAll('.feature-section[id]');
    var featuresNavLinks = document.querySelectorAll('.features-nav-link');

    if (featuresSections.length > 0 && featuresNavLinks.length > 0) {
        window.addEventListener('scroll', function () {
            var scrollPos = window.scrollY + 160;
            var activeId = null;

            featuresSections.forEach(function (section) {
                if (scrollPos >= section.offsetTop) {
                    activeId = section.getAttribute('id');
                }
            });

            featuresNavLinks.forEach(function (link) {
                link.classList.remove('active');
                if (activeId && link.getAttribute('href') === '#' + activeId) {
                    link.classList.add('active');
                }
            });
        }, { passive: true });
    }

    // ---------- Hero mockup entrance animation ----------
    // Animate pipeline stages (grow from left)
    document.querySelectorAll('.mockup-stage').forEach(function (stage, index) {
        stage.style.opacity = '0';
        stage.style.transform = 'scaleX(0)';
        stage.style.transformOrigin = 'left center';
        stage.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        stage.style.transitionDelay = (0.3 + index * 0.1) + 's';

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                stage.style.opacity = '1';
                stage.style.transform = 'scaleX(1)';
            });
        });
    });

    // Animate cards (slide in from right)
    document.querySelectorAll('.mockup-card').forEach(function (card, index) {
        card.style.opacity = '0';
        card.style.transform = 'translateX(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.transitionDelay = (0.6 + index * 0.15) + 's';

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                card.style.opacity = '1';
                card.style.transform = 'translateX(0)';
            });
        });
    });

    // Animate sidebar items
    document.querySelectorAll('.mockup-nav-item').forEach(function (item, index) {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-10px)';
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        item.style.transitionDelay = (0.15 + index * 0.06) + 's';

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            });
        });
    });

})();
