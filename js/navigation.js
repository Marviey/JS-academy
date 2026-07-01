/**
 * Navigation - Handles navigation UI (sidebar, bottom nav, mobile menu)
 */

import { Theme } from './theme.js';
import { Store } from './store.js';

export class Navigation {
    static instance = null;

    constructor() {
        if (Navigation.instance) {
            return Navigation.instance;
        }
        Navigation.instance = this;
        this.isOpen = false;
        this.nav = document.getElementById('main-nav');
        this.toggle = document.getElementById('nav-toggle');
        this.overlay = null;
        this.store = Store.getInstance();
        this.theme = Theme.getInstance();
    }

    static getInstance() {
        if (!Navigation.instance) {
            Navigation.instance = new Navigation();
        }
        return Navigation.instance;
    }

    /**
     * Setup navigation
     */
    setup() {
        this.createOverlay();
        this.setupToggle();
        this.setupNavLinks();
        this.setupBottomNav();
        this.setupThemeToggle();
        this.setupResize();
        this.updateUserInfo();

        // Close mobile nav on page change
        document.addEventListener('page-change', () => {
            if (window.innerWidth <= 768) {
                this.close();
            }
        });
    }

    /**
     * Create overlay for mobile nav
     */
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'nav-overlay';
        this.overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.overlay);

        this.overlay.addEventListener('click', () => {
            this.close();
        });
    }

    /**
     * Setup the toggle button
     */
    setupToggle() {
        if (!this.toggle) return;

        this.toggle.addEventListener('click', () => {
            this.toggleNav();
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    /**
     * Setup navigation links
     */
    setupNavLinks() {
        const links = document.querySelectorAll('.nav-links a');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                // Close mobile nav
                if (window.innerWidth <= 768) {
                    this.close();
                }
            });
        });
    }

    /**
     * Setup bottom navigation (mobile)
     */
    setupBottomNav() {
        let bottomNav = document.querySelector('.bottom-nav');
        if (!bottomNav) {
            this.createBottomNav();
            bottomNav = document.querySelector('.bottom-nav');
        }

        if (!bottomNav) {
            return;
        }

        const links = bottomNav.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                // Update active state
                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Close mobile nav
                if (window.innerWidth <= 768) {
                    this.close();
                }
            });
        });
    }

    /**
     * Create bottom navigation (mobile)
     */
    createBottomNav() {
        const nav = document.createElement('nav');
        nav.className = 'bottom-nav';
        nav.setAttribute('role', 'navigation');
        nav.setAttribute('aria-label', 'Bottom navigation');

        const items = [
            { icon: '📊', label: 'Dashboard', page: 'dashboard' },
            { icon: '📚', label: 'Lessons', page: 'lessons' },
            { icon: '💻', label: 'Playground', page: 'playground' },
            { icon: '🎮', label: 'Games', page: 'games' },
            { icon: '📁', label: 'Projects', page: 'projects' },
            { icon: '👤', label: 'Profile', page: 'profile' }
        ];

        items.forEach(item => {
            const a = document.createElement('a');
            a.href = `#${item.page}`;
            a.setAttribute('data-page', item.page);
            a.setAttribute('role', 'menuitem');

            const iconSpan = document.createElement('span');
            iconSpan.textContent = item.icon;
            iconSpan.style.fontSize = '20px';

            const labelSpan = document.createElement('span');
            labelSpan.textContent = item.label;

            a.appendChild(iconSpan);
            a.appendChild(labelSpan);
            nav.appendChild(a);
        });

        document.body.appendChild(nav);
    }

    /**
     * Setup theme toggle
     */
    setupThemeToggle() {
        const toggle = document.querySelector('.theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                this.theme.toggle();
                this.updateThemeIcon(toggle);
            });
            this.updateThemeIcon(toggle);
        }
    }

    /**
     * Update theme icon
     */
    updateThemeIcon(toggle) {
        const icon = toggle.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = this.theme.isDark() ? '🌙' : '☀️';
        }
    }

    /**
     * Update user info in nav
     */
    updateUserInfo() {
        const nameEl = document.querySelector('.nav-user-name');
        const avatarEl = document.querySelector('.nav-user-avatar');
        const xpEl = document.querySelector('.nav-user-xp');

        if (nameEl) {
            nameEl.textContent = this.store.get('user.name', 'Student');
        }
        if (avatarEl) {
            avatarEl.textContent = this.store.get('user.avatar', '👨‍🎓');
        }
        if (xpEl) {
            xpEl.textContent = `⭐ ${this.store.get('xp', 0)} XP`;
        }
    }

    /**
     * Toggle navigation
     */
    toggleNav() {
        this.isOpen = !this.isOpen;
        this.nav.classList.toggle('open', this.isOpen);
        this.overlay.classList.toggle('active', this.isOpen);
        this.toggle.classList.toggle('active', this.isOpen);

        // Update ARIA
        this.nav.setAttribute('aria-expanded', this.isOpen);
        if (this.toggle) {
            this.toggle.setAttribute('aria-expanded', this.isOpen.toString());
        }

        // Prevent body scroll when nav is open
        document.body.style.overflow = this.isOpen ? 'hidden' : '';
    }

    /**
     * Open navigation
     */
    open() {
        if (!this.isOpen) {
            this.toggleNav();
        }
    }

    /**
     * Close navigation
     */
    close() {
        if (this.isOpen) {
            this.toggleNav();
        }
    }

    /**
     * Setup resize handler
     */
    setupResize() {
        let timeout;
        window.addEventListener('resize', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (window.innerWidth > 768 && this.isOpen) {
                    this.close();
                }
            }, 250);
        });
    }
}