/**
 * RADCON 9B - The Hitchhiker's Guide to RadCon
 * Interactive functionality for a mostly harmless convention website
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    autoCategorizeSchedule();  // Must run first to add category classes
    initScheduleTabs();
    initBackToTop();
    initSmoothScroll();
    initAnimateOnScroll();
    initNavHighlight();
    initTowelStatus();
    initArtworkCarousel();
    initLightbox();
    initBannerScroll();
    initScheduleFilters();
    initCollapsibles();
    initScheduleSearch();
    initKeyboardShortcuts();
    initFavorites();
    initEasterEggs();
    initHamburgerMenu();
    initGuestModal();
    initCollapsibleSections();
});

/**
 * Don't Panic Banner - Hides on scroll
 * Because panic is best left at the top
 */
function initBannerScroll() {
    const banner = document.querySelector('.dont-panic-banner');
    const nav = document.querySelector('.main-nav');
    let lastScroll = 0;
    let bannerHidden = false;

    if (!banner || !nav) return;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 100 && !bannerHidden) {
            banner.classList.add('hidden');
            nav.classList.add('banner-hidden');
            bannerHidden = true;
        } else if (currentScroll <= 50 && bannerHidden) {
            banner.classList.remove('hidden');
            nav.classList.remove('banner-hidden');
            bannerHidden = false;
        }

        lastScroll = currentScroll;
    });
}

/**
 * Auto-Categorize Schedule Panels
 * Uses keyword matching to assign category classes
 */
function autoCategorizeSchedule() {
    const panels = document.querySelectorAll('.panel-card');

    const categoryPatterns = {
        workshop: /workshop|hands-on|learn to|how to|create your|make your|demo|101|basics|beginner|introduction to/i,
        performance: /dance|show|competition|concert|reading|demo|extravaganza|filk|sing|perform|display/i,
        gaming: /d&d|dungeons|game|rpg|tournament|magic|tabletop|quest|starfinder|traveler|tabletop/i,
        art: /art|draw|paint|cosplay|costume|fabric|craft|airbrush|pewter|chainmail|metal paint/i,
        writing: /writ|author|publish|story|fiction|book|manuscript|novel|podcast|edit|cover/i,
        science: /science|space|physics|tech|ai|robot|nasa|nuclear|energy|genetics|aerospace|fusion|reactor/i,
        social: /social|community|fandom|culture|history|etiquette|japanese|filipino|starfleet|religion|belief/i,
        panel: /discuss|panel|talk|history|analysis|debate|define|prophecy|influences/i
    };

    panels.forEach(panel => {
        // Skip if already has a main category or is adult
        if (panel.classList.contains('workshop') ||
            panel.classList.contains('performance') ||
            panel.classList.contains('gaming') ||
            panel.classList.contains('art') ||
            panel.classList.contains('writing') ||
            panel.classList.contains('science') ||
            panel.classList.contains('social') ||
            panel.classList.contains('panel')) {
            return;
        }

        const title = panel.querySelector('h5')?.textContent || '';
        const description = panel.querySelector('p')?.textContent || '';
        const text = title + ' ' + description;

        // Check each category pattern
        for (const [category, pattern] of Object.entries(categoryPatterns)) {
            if (pattern.test(text)) {
                panel.classList.add(category);
                break;
            }
        }

        // Default to panel if no category matched
        if (!panel.className.match(/workshop|performance|gaming|art|writing|science|social|panel/)) {
            panel.classList.add('panel');
        }
    });

    // Add favorite buttons to all panels
    panels.forEach((panel, index) => {
        if (!panel.querySelector('.favorite-btn')) {
            const btn = document.createElement('button');
            btn.className = 'favorite-btn';
            btn.innerHTML = '♡';
            btn.setAttribute('aria-label', 'Add to favorites');
            btn.dataset.panelId = `panel-${index}`;
            panel.insertBefore(btn, panel.firstChild);
        }
    });
}

/**
 * Schedule Filters
 * Filter panels by type and age restriction with After Dark theme
 */
function initScheduleFilters() {
    const filterContainer = document.querySelector('.schedule-filters');
    const scheduleSection = document.querySelector('.schedule-section');
    if (!filterContainer || !scheduleSection) return;

    const allFilterBtns = filterContainer.querySelectorAll('.filter-btn');
    const panels = document.querySelectorAll('.panel-card');

    // All filter buttons are mutually exclusive
    allFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all buttons
            allFilterBtns.forEach(b => b.classList.remove('active'));
            // Set this one active
            btn.classList.add('active');

            // Toggle After Dark mode when 21+ filter is active
            if (btn.dataset.filter === 'adult') {
                scheduleSection.classList.add('afterdark-mode');
            } else {
                scheduleSection.classList.remove('afterdark-mode');
            }

            applyFilters();
        });
    });

    // Click on panel card to favorite it
    panels.forEach(panel => {
        panel.addEventListener('click', (e) => {
            // Don't favorite if clicking on a link or button
            if (e.target.closest('a, button')) return;

            const favBtn = panel.querySelector('.favorite-btn');
            if (favBtn) {
                favBtn.click();
            }
        });
    });

    applyFilters();

    function applyFilters() {
        const activeBtn = filterContainer.querySelector('.filter-btn.active');
        const filter = activeBtn?.dataset.filter || 'all';
        const roomFilter = activeBtn?.dataset.room || null;
        const searchQuery = document.getElementById('schedule-search')?.value.toLowerCase() || '';

        let visibleCount = 0;

        panels.forEach(panel => {
            let show = true;

            // Type/category filter
            if (filter === 'all') {
                show = true;
            } else if (filter === 'favorites') {
                const favBtn = panel.querySelector('.favorite-btn');
                show = favBtn && favBtn.classList.contains('favorited');
            } else if (filter === 'adult') {
                show = panel.classList.contains('adult');
            } else if (filter === 'family') {
                show = !panel.classList.contains('adult');
            } else if (filter) {
                show = panel.classList.contains(filter);
            }

            // Room filter
            if (roomFilter) {
                const roomTag = panel.querySelector('.room-tag')?.textContent || '';
                show = roomTag.includes(roomFilter);
            }

            // Search filter
            if (show && searchQuery) {
                const title = panel.querySelector('h5')?.textContent.toLowerCase() || '';
                const description = panel.querySelector('p')?.textContent.toLowerCase() || '';
                const presenter = panel.querySelector('.presenter')?.textContent.toLowerCase() || '';
                show = title.includes(searchQuery) ||
                       description.includes(searchQuery) ||
                       presenter.includes(searchQuery);
            }

            if (show) {
                panel.style.display = '';
                panel.style.animation = 'fadeIn 0.3s ease';
                visibleCount++;
            } else {
                panel.style.display = 'none';
            }
        });

        // Hide empty time blocks
        document.querySelectorAll('.time-block').forEach(block => {
            const visiblePanels = block.querySelectorAll('.panel-card:not([style*="display: none"])');
            block.style.display = visiblePanels.length > 0 ? '' : 'none';
        });

        // Hide day tabs and columns with no visible events
        const days = ['friday', 'saturday', 'sunday'];
        days.forEach(day => {
            const daySchedule = document.getElementById(`${day}-schedule`);
            const dayTab = document.querySelector(`.tab-btn[data-day="${day}"]`);
            if (daySchedule && dayTab) {
                const visiblePanels = daySchedule.querySelectorAll('.panel-card:not([style*="display: none"])');
                const hasEvents = visiblePanels.length > 0;
                dayTab.style.display = hasEvents ? '' : 'none';
                // Toggle class for hiding empty days in 3-column view
                daySchedule.classList.toggle('no-events', !hasEvents);
            }
        });

        // Update panel count
        updatePanelCount(visibleCount);

        // Show/hide favorites filter based on whether there are any favorites
        const favoritesBtn = filterContainer.querySelector('.filter-btn[data-filter="favorites"]');
        if (favoritesBtn) {
            const hasFavorites = document.querySelectorAll('.favorite-btn.favorited').length > 0;
            favoritesBtn.classList.toggle('no-favorites', !hasFavorites);

            // If favorites filter is active but no favorites exist, switch to "All"
            if (!hasFavorites && favoritesBtn.classList.contains('active')) {
                favoritesBtn.classList.remove('active');
                const allBtn = filterContainer.querySelector('.filter-btn[data-filter="all"]');
                if (allBtn) {
                    allBtn.classList.add('active');
                    applyFilters(); // Re-apply with "All" filter
                }
            }
        }
    }

    // Expose applyFilters globally for search
    window.applyScheduleFilters = applyFilters;
}


/**
 * Update visible panel count with easter egg
 */
function updatePanelCount(count) {
    const countEl = document.getElementById('panel-count');
    if (countEl) {
        countEl.textContent = count;

        // Easter egg: 42 is The Answer!
        if (count === 42) {
            countEl.classList.add('answer-toast');
            countEl.innerHTML = '42 <span style="color: var(--friendly-yellow)">— The Answer!</span>';
        } else {
            countEl.classList.remove('answer-toast');
        }
    }
}

/**
 * Collapsible Sections
 * For hiding less important details
 */
function initCollapsibles() {
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isOpen = header.classList.contains('open');

            header.classList.toggle('open');

            if (isOpen) {
                content.style.maxHeight = '0';
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
}

/**
 * Schedule Tab Switching
 * Because time is an illusion (lunchtime doubly so)
 */
function initScheduleTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const scheduleDays = document.querySelectorAll('.schedule-day');
    const scheduleSection = document.querySelector('.schedule-section');
    const viewAllBtn = document.querySelector('.view-all-btn');
    const isDesktop = window.innerWidth >= 1024;

    // Determine which day to show by default
    function getDefaultDay() {
        const today = new Date();
        const eventDates = {
            friday: new Date('2026-02-13'),
            saturday: new Date('2026-02-14'),
            sunday: new Date('2026-02-15')
        };

        // Check if today is during the event
        if (today >= eventDates.friday && today <= eventDates.sunday) {
            if (today.toDateString() === eventDates.friday.toDateString()) return 'friday';
            if (today.toDateString() === eventDates.saturday.toDateString()) return 'saturday';
            if (today.toDateString() === eventDates.sunday.toDateString()) return 'sunday';
        }
        return 'friday'; // Default to Friday before/after event
    }

    // Show all days in columns (desktop only)
    function showAllDays() {
        if (!isDesktop) return;
        scheduleSection.classList.add('show-all-days');
        tabBtns.forEach(b => b.classList.remove('active'));
    }

    // Show single day
    function showDay(day) {
        scheduleSection.classList.remove('show-all-days');
        tabBtns.forEach(b => b.classList.remove('active'));
        scheduleDays.forEach(schedule => schedule.classList.remove('active'));

        const dayBtn = document.querySelector(`.tab-btn[data-day="${day}"]`);
        const daySchedule = document.getElementById(`${day}-schedule`);

        if (dayBtn) dayBtn.classList.add('active');
        if (daySchedule) daySchedule.classList.add('active');
    }

    // Initialize: Desktop shows all days, mobile shows default day
    if (isDesktop) {
        showAllDays();
    } else {
        showDay(getDefaultDay());
    }

    // Tab click handlers
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showDay(btn.dataset.day);
        });
    });

    // View All button handler
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            showAllDays();
        });
    }

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const nowDesktop = window.innerWidth >= 1024;
            if (nowDesktop && !scheduleSection.classList.contains('show-all-days')) {
                // Switched to desktop while in single-day mode - keep single day
            } else if (!nowDesktop && scheduleSection.classList.contains('show-all-days')) {
                // Switched to mobile while in all-days mode - show default day
                showDay(getDefaultDay());
            }
        }, 250);
    });
}

/**
 * Back to Top Button
 * For when you need to hitchhike back to the beginning
 */
function initBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top');

    if (!backToTopBtn) return;

    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    // Smooth scroll to top
    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Smooth Scrolling for Navigation Links
 * Because jerky scrolling is for Vogons
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return; // Skip back-to-top button

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                // If target is a collapsible section that's collapsed, expand it
                if (target.classList.contains('collapsible-section') && target.classList.contains('is-collapsed')) {
                    const content = target.querySelector('.section-content');
                    const icon = target.querySelector('.expand-icon');
                    if (content) {
                        content.classList.remove('collapsed');
                        target.classList.remove('is-collapsed');
                        content.style.maxHeight = content.scrollHeight + 'px';
                        if (icon) icon.textContent = '−';
                    }
                }

                const navHeight = document.querySelector('.main-nav').offsetHeight;
                const bannerHeight = document.querySelector('.dont-panic-banner').offsetHeight;
                const offset = navHeight + bannerHeight + 20;

                const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Animate Elements on Scroll
 * Making things appear as if by improbability drive
 */
function initAnimateOnScroll() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements that should animate
    const animateElements = document.querySelectorAll(
        '.guest-card, .event-card, .panel-card, .vendor-category, .group-card, .hour-card, .division-card'
    );

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Add animate-in class styles
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

/**
 * Navigation Highlight on Scroll
 * Know where you are in the galaxy
 */
function initNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const navOffset = 150;

            if (window.scrollY >= sectionTop - navOffset) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Add active link styles
const navStyle = document.createElement('style');
navStyle.textContent = `
    .nav-links a.active {
        color: var(--guide-green);
    }
    .nav-links a.active::after {
        width: 100%;
    }
`;
document.head.appendChild(navStyle);

/**
 * Towel Status Easter Egg
 * A hoopy frood always knows where their towel is
 */
function initTowelStatus() {
    const towelCounter = document.querySelector('.towel-counter');
    if (!towelCounter) return;

    const statuses = [
        { text: 'LOCATED', color: '#00ff88' },
        { text: 'MISPLACED', color: '#ffd700' },
        { text: 'IN WASH', color: '#4facfe' },
        { text: 'BORROWED BY VOGON', color: '#ff4757' },
        { text: 'ACHIEVING ORBIT', color: '#a855f7' },
        { text: 'QUANTUM SUPERPOSITION', color: '#ff6b35' }
    ];

    let clickCount = 0;

    towelCounter.addEventListener('click', () => {
        clickCount++;
        const status = statuses[clickCount % statuses.length];
        const statusText = towelCounter.querySelector('.towel-text strong');

        if (statusText) {
            statusText.textContent = status.text;
            statusText.style.color = status.color;
        }

        // Secret message after 42 clicks
        if (clickCount === 42) {
            towelCounter.querySelector('.towel-text').innerHTML =
                'Towel Status: <strong style="color: #ffd700">THE ANSWER!</strong>';

            // Create celebration effect
            createParticles(towelCounter);
        }
    });
}

/**
 * Create particle celebration effect
 */
function createParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 42; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: ${['#00ff88', '#ffd700', '#4facfe', '#ff6b35', '#a855f7'][Math.floor(Math.random() * 5)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            left: ${centerX}px;
            top: ${centerY}px;
        `;

        document.body.appendChild(particle);

        const angle = (Math.PI * 2 * i) / 42;
        const velocity = 100 + Math.random() * 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        let x = 0;
        let y = 0;
        let opacity = 1;

        const animate = () => {
            x += vx * 0.02;
            y += vy * 0.02 + 2; // Add gravity
            opacity -= 0.02;

            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = opacity;

            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };

        requestAnimationFrame(animate);
    }
}

/**
 * Lightbox for Full-Screen Image Viewing
 * Like looking out the window of the Heart of Gold
 */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const carouselSlides = document.querySelectorAll('.carousel-slide');

    if (!lightbox) return;

    // Open lightbox when clicking carousel slides
    carouselSlides.forEach(slide => {
        slide.addEventListener('click', () => {
            const img = slide.querySelector('img');
            if (img) {
                lightboxImage.src = img.src;
                lightboxImage.alt = img.alt;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeLightbox);

    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

/**
 * Artwork Carousel
 * Infinite improbability drive for viewing art
 */
function initArtworkCarousel() {
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.carousel-dot');

    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Auto-advance every 5 seconds
    let autoPlay = setInterval(nextSlide, 5000);

    // Pause on hover
    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlay));
    carouselContainer.addEventListener('mouseleave', () => {
        autoPlay = setInterval(nextSlide, 5000);
    });

    // Keyboard navigation
    carouselContainer.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchStartX - touchEndX > swipeThreshold) {
            nextSlide();
        } else if (touchEndX - touchStartX > swipeThreshold) {
            prevSlide();
        }
    }
}

/**
 * Schedule Search
 * Fuzzy search through panel titles, descriptions, and presenters
 */
function initScheduleSearch() {
    const searchInput = document.getElementById('schedule-search');
    if (!searchInput) return;

    let debounceTimer;

    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (window.applyScheduleFilters) {
                window.applyScheduleFilters();
            }
        }, 200);
    });

    // Clear search on Escape
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            searchInput.blur();
            if (window.applyScheduleFilters) {
                window.applyScheduleFilters();
            }
        }
    });
}

/**
 * Keyboard Shortcuts
 * Quick navigation for hoopy froods
 */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger if typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const scheduleSection = document.querySelector('.schedule-section');
        const filterContainer = document.querySelector('.schedule-filters');

        switch (e.key) {
            case '1':
                document.querySelector('[data-day="friday"]')?.click();
                scheduleSection?.scrollIntoView({ behavior: 'smooth' });
                break;
            case '2':
                document.querySelector('[data-day="saturday"]')?.click();
                scheduleSection?.scrollIntoView({ behavior: 'smooth' });
                break;
            case '3':
                document.querySelector('[data-day="sunday"]')?.click();
                scheduleSection?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'f':
            case 'F':
                const featuredBtn = filterContainer?.querySelector('[data-filter="featured"]');
                if (featuredBtn) {
                    featuredBtn.click();
                    scheduleSection?.scrollIntoView({ behavior: 'smooth' });
                }
                break;
            case 'a':
            case 'A':
                const adultBtn = filterContainer?.querySelector('[data-filter="adult"]');
                if (adultBtn) {
                    adultBtn.click();
                    scheduleSection?.scrollIntoView({ behavior: 'smooth' });
                }
                break;
            case '/':
                e.preventDefault();
                document.getElementById('schedule-search')?.focus();
                break;
        }
    });
}

/**
 * Favorites System
 * Save favorite panels to localStorage
 */
function initFavorites() {
    const favorites = JSON.parse(localStorage.getItem('radcon-favorites') || '[]');

    // Mark previously favorited panels
    favorites.forEach(id => {
        const btn = document.querySelector(`.favorite-btn[data-panel-id="${id}"]`);
        if (btn) {
            btn.classList.add('favorited');
            btn.innerHTML = '♥';
        }
    });

    // Handle favorite button clicks
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('favorite-btn')) {
            const btn = e.target;
            const panelId = btn.dataset.panelId;
            const favorites = JSON.parse(localStorage.getItem('radcon-favorites') || '[]');

            if (btn.classList.contains('favorited')) {
                // Remove from favorites
                btn.classList.remove('favorited');
                btn.innerHTML = '♡';
                const index = favorites.indexOf(panelId);
                if (index > -1) favorites.splice(index, 1);
            } else {
                // Add to favorites
                btn.classList.add('favorited');
                btn.innerHTML = '♥';
                if (!favorites.includes(panelId)) {
                    favorites.push(panelId);
                }
            }

            localStorage.setItem('radcon-favorites', JSON.stringify(favorites));

            // Refresh filters if favorites filter is active
            if (window.applyScheduleFilters) {
                window.applyScheduleFilters();
            }
        }
    });
}

/**
 * Easter Eggs
 * Hidden delights for the hoopy frood
 */
function initEasterEggs() {
    const panels = document.querySelectorAll('.panel-card');

    panels.forEach(panel => {
        const title = panel.querySelector('h5')?.textContent || '';
        const description = panel.querySelector('p')?.textContent || '';
        const text = title + ' ' + description;

        // Add Vogon warning icon to particularly long or dense panels
        if (text.length > 200 || text.toLowerCase().includes('poetry')) {
            const titleEl = panel.querySelector('h5');
            if (titleEl && !titleEl.querySelector('.vogon-warning')) {
                const warning = document.createElement('span');
                warning.className = 'vogon-warning';
                warning.innerHTML = '📜';
                warning.title = 'This panel may approach Vogon poetry levels of density';
                titleEl.appendChild(warning);
            }
        }

        // Add "Mostly Harmless" rating to beginner-friendly workshops
        if (panel.classList.contains('workshop') &&
            (text.toLowerCase().includes('beginner') ||
             text.toLowerCase().includes('101') ||
             text.toLowerCase().includes('introduction') ||
             text.toLowerCase().includes('no experience'))) {
            const container = panel.querySelector('.presenter')?.parentElement || panel;
            if (!container.querySelector('.mostly-harmless')) {
                const rating = document.createElement('span');
                rating.className = 'mostly-harmless';
                rating.textContent = '★★★★★ Mostly Harmless';
                container.appendChild(rating);
            }
        }
    });

    // Secret: Konami code reveals a special message
    let konamiProgress = 0;
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === konamiCode[konamiProgress]) {
            konamiProgress++;
            if (konamiProgress === konamiCode.length) {
                showKonamiReward();
                konamiProgress = 0;
            }
        } else {
            konamiProgress = 0;
        }
    });
}

/**
 * Konami code reward
 */
function showKonamiReward() {
    const message = document.createElement('div');
    message.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0f 100%);
            border: 3px solid #00ff88;
            border-radius: 20px;
            padding: 3rem;
            text-align: center;
            z-index: 10001;
            box-shadow: 0 0 50px rgba(0, 255, 136, 0.5);
            animation: fadeIn 0.5s ease;
        ">
            <h2 style="font-family: 'Orbitron', sans-serif; color: #00ff88; font-size: 2rem; margin-bottom: 1rem;">
                🚀 DON'T PANIC! 🚀
            </h2>
            <p style="font-family: 'Space Mono', monospace; color: #ffd700; font-size: 1.2rem; margin-bottom: 1rem;">
                You found the infinite improbability drive!
            </p>
            <p style="font-family: 'Exo 2', sans-serif; color: #e8e8e8;">
                The Answer to Life, the Universe, and Everything is still 42.<br>
                But you knew that already, hoopy frood.
            </p>
            <button onclick="this.parentElement.parentElement.remove()" style="
                margin-top: 1.5rem;
                font-family: 'Orbitron', sans-serif;
                background: #00ff88;
                color: #0a0a0f;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 700;
            ">So Long, and Thanks!</button>
        </div>
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
        " onclick="this.parentElement.remove()"></div>
    `;
    document.body.appendChild(message);

    // Create particle celebration
    for (let i = 0; i < 42; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${['#00ff88', '#ffd700', '#4facfe', '#ff6b35', '#a855f7'][Math.floor(Math.random() * 5)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 10002;
                left: ${Math.random() * 100}vw;
                top: -10px;
                animation: particleFall ${2 + Math.random() * 3}s linear forwards;
            `;
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 5000);
        }, i * 50);
    }
}

// Add particle fall animation
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    @keyframes particleFall {
        to {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(particleStyle);

/**
 * Hamburger Menu
 * Mobile navigation toggle
 */
function initHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger-btn');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu on outside click
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}


/**
 * Toast Notification
 * Show temporary feedback messages
 */
function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = 'toast' + (type ? ` ${type}` : '');

    // Trigger reflow for animation
    void toast.offsetWidth;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Guest Modal
 * Show guest info when clicking keynote events
 */
const guestData = {
    'Brittany Torres': {
        title: 'Artist Guest of Honor',
        photo: 'images/radcon-067.png',
        bio: 'Award-winning fantasy artist with a unique style of digital painting focusing on luminous, fantastical female portraits. Specializing in King Arthur, Beowulf, and manuscript research.',
        quote: 'I strive to create the type of artwork I would personally buy to hang in my home; work that evokes the magic, mystery, and power of women in the fantasy genre.',
        links: [
            { text: 'Website', url: 'https://torresfantasyart.com' },
            { text: 'Instagram', url: 'https://www.instagram.com/torresfantasyart' }
        ]
    },
    'David Gerrold': {
        title: 'Author Guest of Honor',
        photo: 'images/radcon-115.jpg',
        bio: 'Author of Star Trek\'s "The Trouble With Tribbles." Ten-time Hugo and Nebula nominee. His "The Martian Child" won Hugo, Nebula, and Locus Poll. 2022 Heinlein Award winner. His TV scripts have been seen by over a billion viewers.',
        quote: null,
        links: [
            { text: 'Patreon', url: 'https://patreon.com/davidgerrold' },
            { text: 'Facebook', url: 'https://www.facebook.com/david.gerrold' }
        ]
    },
    'Bob Brown': {
        title: 'Publishing Guest of Honor',
        photo: 'images/radcon-113.png',
        bio: 'Richland, Washington based editor and publisher, Navy veteran. Founded B Cubed Press with "Alternative Truths" - joining the noble tradition of using the pen to poke the powerful.',
        quote: 'B Cubed is a press dedicated to raising the words of truth, unbound by ideology, so they can be heard.',
        links: [
            { text: 'B Cubed Press', url: 'https://bcubedpress.wordpress.com' }
        ]
    },
    'Yoshi Vu': {
        title: 'Returning Special Guest - VFX & Game Artist',
        photo: 'images/yoshi-vu.jpg',
        bio: 'Marine Corps veteran. Worked on Journey 2, Green Lantern, and Call of Duty: Black Ops 3 at Treyarch.',
        quote: null,
        links: [
            { text: 'Website', url: 'https://www.artificialempire.com' },
            { text: 'ArtStation', url: 'https://www.artstation.com/yoshivu' }
        ]
    },
    'Jeff Sturgeon': {
        title: 'Returning Special Guest - Metal Painter & Illustrator',
        photo: 'images/jeff-sturgeon.jpg',
        bio: 'Northwest artist known for award-winning metal paintings. 30+ year career spanning EA games to Harper Collins and NASA JPL cover work.',
        quote: null,
        links: [
            { text: 'Website', url: 'https://www.jeffsturgeon.com' }
        ]
    },
    'Isaac Singleton Jr.': {
        title: 'Returning Special Guest - Actor & Voice Artist',
        photo: 'images/isaac-singleton.jpg',
        bio: 'Voice of Thanos in Avengers Assemble & Guardians of the Galaxy. Credits include Pirates of the Caribbean, Galaxy Quest, Deadpool, The Mandalorian, and World of Warcraft.',
        quote: null,
        links: [
            { text: 'Website', url: 'https://www.isaacsingleton.com' },
            { text: 'IMDb', url: 'https://www.imdb.com/name/nm0802012/' }
        ]
    }
};

function initGuestModal() {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'guest-modal';
    modal.id = 'guest-modal';
    modal.innerHTML = `
        <div class="guest-modal-overlay"></div>
        <div class="guest-modal-content">
            <button class="guest-modal-close" aria-label="Close">&times;</button>
            <div class="guest-modal-photo">
                <img src="" alt="" class="guest-modal-img">
            </div>
            <div class="guest-modal-info">
                <h3 class="guest-modal-name"></h3>
                <p class="guest-modal-title"></p>
                <blockquote class="guest-modal-quote"></blockquote>
                <p class="guest-modal-bio"></p>
                <div class="guest-modal-links"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const overlay = modal.querySelector('.guest-modal-overlay');
    const closeBtn = modal.querySelector('.guest-modal-close');

    // Close modal function
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    overlay.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Add click handlers to keynote panels
    document.querySelectorAll('.panel-card[data-guest]').forEach(panel => {
        panel.style.cursor = 'pointer';
        panel.addEventListener('click', (e) => {
            // Don't trigger if clicking on a link inside the panel
            if (e.target.closest('a')) return;

            const guestName = panel.dataset.guest;
            const guest = guestData[guestName];

            if (!guest) return;

            // Populate modal
            modal.querySelector('.guest-modal-name').textContent = guestName;
            modal.querySelector('.guest-modal-title').textContent = guest.title;
            modal.querySelector('.guest-modal-bio').textContent = guest.bio;

            const img = modal.querySelector('.guest-modal-img');
            img.src = guest.photo;
            img.alt = guestName;

            const quoteEl = modal.querySelector('.guest-modal-quote');
            if (guest.quote) {
                quoteEl.textContent = `"${guest.quote}"`;
                quoteEl.style.display = '';
            } else {
                quoteEl.style.display = 'none';
            }

            const linksContainer = modal.querySelector('.guest-modal-links');
            linksContainer.innerHTML = guest.links.map(link =>
                `<a href="${link.url}" class="guest-modal-link" target="_blank">${link.text}</a>`
            ).join('');

            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
}

/**
 * Collapsible Sections
 * All sections are collapsible, first one open by default
 */
function initCollapsibleSections() {
    const sections = document.querySelectorAll('.collapsible-section');

    sections.forEach((section, index) => {
        const trigger = section.querySelector('.collapsible-trigger');
        const content = section.querySelector('.section-content');
        const icon = section.querySelector('.expand-icon');

        if (!trigger || !content) return;

        // Info section open by default, all others collapsed
        if (section.id === 'info') {
            content.classList.remove('collapsed');
            section.classList.remove('is-collapsed');
            content.style.maxHeight = 'none';
            if (icon) icon.textContent = '−';
        } else {
            content.classList.add('collapsed');
            section.classList.add('is-collapsed');
            content.style.maxHeight = '0';
            if (icon) icon.textContent = '+';
        }

        trigger.addEventListener('click', () => {
            const isCollapsed = content.classList.contains('collapsed');

            if (isCollapsed) {
                content.classList.remove('collapsed');
                section.classList.remove('is-collapsed');
                content.style.maxHeight = content.scrollHeight + 'px';
                if (icon) icon.textContent = '−';
            } else {
                content.classList.add('collapsed');
                section.classList.add('is-collapsed');
                content.style.maxHeight = '0';
                if (icon) icon.textContent = '+';
            }
        });
    });
}

/**
 * Console Easter Egg
 * For the curious developer hitchhiking through the code
 */
console.log(`
%c██████╗  █████╗ ██████╗  ██████╗ ██████╗ ███╗   ██╗     █████╗ ██████╗
██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔═══██╗████╗  ██║    ██╔══██╗██╔══██╗
██████╔╝███████║██║  ██║██║     ██║   ██║██╔██╗ ██║    ╚██████║██████╔╝
██╔══██╗██╔══██║██║  ██║██║     ██║   ██║██║╚██╗██║     ╚═══██║██╔══██╗
██║  ██║██║  ██║██████╔╝╚██████╗╚██████╔╝██║ ╚████║     █████╔╝██████╔╝
╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝     ╚════╝ ╚═════╝
`, 'color: #00ff88; font-family: monospace;');

console.log('%cDON\'T PANIC', 'color: #ff4757; font-size: 24px; font-weight: bold;');
console.log('%cRemember to bring your towel!', 'color: #ffd700; font-size: 14px;');
console.log('%cThe Answer to Life, the Universe, and Everything is 42', 'color: #4facfe; font-size: 12px;');
console.log('%cFeb 13-15, 2026 | Red Lion Hotel, Pasco, WA', 'color: #888; font-size: 11px;');
