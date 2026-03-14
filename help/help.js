/* ========================================
   GlyphFex Help Center — help.js
   TOC generation, scroll spy, sidebar, search
   ======================================== */

(function () {
    'use strict';

    // ---------- TOC Auto-Generation ----------
    function buildTOC() {
        const toc = document.getElementById('helpToc');
        if (!toc) return;

        const headings = document.querySelectorAll('.help-content h2[id]');
        if (headings.length === 0) {
            toc.style.display = 'none';
            return;
        }

        const ul = toc.querySelector('ul');
        if (!ul) return;

        ul.innerHTML = '';
        headings.forEach(function (h) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#' + h.id;
            a.textContent = h.textContent;
            a.addEventListener('click', function (e) {
                e.preventDefault();
                h.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.replaceState(null, '', '#' + h.id);
            });
            li.appendChild(a);
            ul.appendChild(li);
        });
    }

    // ---------- Scroll Spy ----------
    function initScrollSpy() {
        const toc = document.getElementById('helpToc');
        if (!toc) return;

        const links = toc.querySelectorAll('a');
        if (links.length === 0) return;

        const headings = document.querySelectorAll('.help-content h2[id]');

        function updateActive() {
            var current = '';
            headings.forEach(function (h) {
                var rect = h.getBoundingClientRect();
                if (rect.top <= 120) {
                    current = h.id;
                }
            });

            links.forEach(function (link) {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        }

        window.addEventListener('scroll', updateActive, { passive: true });
        updateActive();
    }

    // ---------- Active Sidebar Link ----------
    function highlightSidebarLink() {
        var currentPage = window.location.pathname.split('/').pop() || 'index.html';
        var links = document.querySelectorAll('.sidebar-nav a');
        links.forEach(function (link) {
            link.classList.remove('active');
            var href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    // ---------- Sidebar Toggle (Mobile) ----------
    function initSidebarToggle() {
        var toggle = document.getElementById('sidebarToggle');
        var sidebar = document.getElementById('helpSidebar');
        var overlay = document.querySelector('.sidebar-overlay');

        if (!toggle || !sidebar) return;

        toggle.addEventListener('click', function () {
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('active');
        });

        if (overlay) {
            overlay.addEventListener('click', function () {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            });
        }

        // Close sidebar when a link is clicked (mobile)
        sidebar.querySelectorAll('.sidebar-nav a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                    if (overlay) overlay.classList.remove('active');
                }
            });
        });
    }

    // ---------- Client-Side Search ----------
    var searchIndex = null;
    var searchResultsFocusIdx = -1;

    function initSearch() {
        var inputs = document.querySelectorAll('#helpSearch, #helpHomeSearch');
        inputs.forEach(function (input) {
            if (!input) return;

            var resultsContainer = input.closest('.sidebar-search, .help-home-search')
                ?.querySelector('.search-results');
            if (!resultsContainer) return;

            // Load index on first focus
            input.addEventListener('focus', function () {
                if (!searchIndex) {
                    loadSearchIndex();
                }
            });

            // Debounced search
            var debounceTimer;
            input.addEventListener('input', function () {
                clearTimeout(debounceTimer);
                var query = input.value.trim();

                if (query.length < 2) {
                    resultsContainer.classList.remove('active');
                    resultsContainer.innerHTML = '';
                    searchResultsFocusIdx = -1;
                    return;
                }

                debounceTimer = setTimeout(function () {
                    performSearch(query, resultsContainer);
                }, 200);
            });

            // Keyboard navigation
            input.addEventListener('keydown', function (e) {
                var items = resultsContainer.querySelectorAll('.search-result-item');
                if (items.length === 0) return;

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    searchResultsFocusIdx = Math.min(searchResultsFocusIdx + 1, items.length - 1);
                    updateFocusedResult(items);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    searchResultsFocusIdx = Math.max(searchResultsFocusIdx - 1, 0);
                    updateFocusedResult(items);
                } else if (e.key === 'Enter' && searchResultsFocusIdx >= 0) {
                    e.preventDefault();
                    items[searchResultsFocusIdx].click();
                } else if (e.key === 'Escape') {
                    resultsContainer.classList.remove('active');
                    resultsContainer.innerHTML = '';
                    searchResultsFocusIdx = -1;
                }
            });

            // Close on outside click
            document.addEventListener('click', function (e) {
                if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
                    resultsContainer.classList.remove('active');
                    searchResultsFocusIdx = -1;
                }
            });
        });
    }

    function updateFocusedResult(items) {
        items.forEach(function (item, i) {
            item.classList.toggle('focused', i === searchResultsFocusIdx);
        });
    }

    function loadSearchIndex() {
        var basePath = '';
        // Determine base path for search-index.json
        if (window.location.pathname.includes('/help/')) {
            basePath = '';
        } else {
            basePath = 'help/';
        }

        fetch(basePath + 'search-index.json')
            .then(function (r) { return r.json(); })
            .then(function (data) { searchIndex = data; })
            .catch(function () { searchIndex = []; });
    }

    function performSearch(query, container) {
        if (!searchIndex) {
            container.innerHTML = '<div class="search-no-results">Loading...</div>';
            container.classList.add('active');
            return;
        }

        var q = query.toLowerCase();
        var results = [];

        searchIndex.forEach(function (page) {
            page.sections.forEach(function (section) {
                var titleMatch = section.title.toLowerCase().includes(q);
                var keywordMatch = section.keywords && section.keywords.toLowerCase().includes(q);
                var pageMatch = page.title.toLowerCase().includes(q);

                if (titleMatch || keywordMatch || pageMatch) {
                    results.push({
                        page: page.page,
                        pageTitle: page.title,
                        sectionId: section.id,
                        sectionTitle: section.title,
                        score: titleMatch ? 3 : (keywordMatch ? 2 : 1)
                    });
                }
            });
        });

        // Sort by relevance
        results.sort(function (a, b) { return b.score - a.score; });

        // Limit results
        results = results.slice(0, 10);
        searchResultsFocusIdx = -1;

        if (results.length === 0) {
            container.innerHTML = '<div class="search-no-results">No results found for "' +
                query.replace(/</g, '&lt;') + '"</div>';
            container.classList.add('active');
            return;
        }

        container.innerHTML = results.map(function (r) {
            return '<a class="search-result-item" href="' + r.page + '#' + r.sectionId + '">' +
                '<div class="search-result-page">' + r.pageTitle + '</div>' +
                '<div class="search-result-title">' + r.sectionTitle + '</div>' +
                '</a>';
        }).join('');

        container.classList.add('active');
    }

    // ---------- Navbar scroll effect (from main site) ----------
    function initNavbarScroll() {
        var navbar = document.getElementById('navbar');
        if (!navbar) return;

        window.addEventListener('scroll', function () {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        }, { passive: true });
    }

    // ---------- Mobile nav toggle (from main site) ----------
    function initMobileNav() {
        var toggle = document.getElementById('navToggle');
        var links = document.getElementById('navLinks');
        if (!toggle || !links) return;

        toggle.addEventListener('click', function () {
            links.classList.toggle('open');
            toggle.classList.toggle('open');
        });
    }

    // ---------- Init ----------
    document.addEventListener('DOMContentLoaded', function () {
        buildTOC();
        initScrollSpy();
        highlightSidebarLink();
        initSidebarToggle();
        initSearch();
        initNavbarScroll();
        initMobileNav();
    });
})();
