/**
 * Router - Handles page navigation and routing
 */

export class Router {
    static instance = null;

    constructor() {
        if (Router.instance) {
            return Router.instance;
        }
        Router.instance = this;
        this.pages = {};
        this.currentPage = 'dashboard';
        this.pageCache = new Map();
    }

    static getInstance() {
        if (!Router.instance) {
            Router.instance = new Router();
        }
        return Router.instance;
    }

    /**
     * Setup the router
     */
    setup() {
        this.pages = {
            dashboard: document.getElementById('page-dashboard'),
            lessons: document.getElementById('page-lessons'),
            playground: document.getElementById('page-playground'),
            quiz: document.getElementById('page-quiz'),
            games: document.getElementById('page-games'),
            projects: document.getElementById('page-projects'),
            profile: document.getElementById('page-profile'),
            settings: document.getElementById('page-settings')
        };

        // Update navigation links
        this.updateNavLinks();
    }

    /**
     * Navigate to a page
     */
    navigate(page) {
        // Skip if already on this page
        if (this.currentPage === page) return;

        // Check if page exists
        if (!this.pages[page]) {
            console.warn(`Page "${page}" not found, redirecting to dashboard`);
            page = 'dashboard';
        }

        // Hide all pages
        Object.values(this.pages).forEach(el => {
            if (el) el.classList.remove('active');
        });

        // Show target page
        const targetPage = this.pages[page];
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;
            window.location.hash = page;

            // Update navigation
            this.updateNavLinks();

            // Dispatch page change event
            const event = new CustomEvent('page-change', {
                detail: { page }
            });
            document.dispatchEvent(event);

            // Scroll to top
            document.getElementById('main-content')?.scrollTo(0, 0);
        }
    }

    /**
     * Update navigation links
     */
    updateNavLinks() {
        const links = document.querySelectorAll('.nav-links a, .bottom-nav a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                const page = href.replace('#', '');
                if (page === this.currentPage) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });
    }

    /**
     * Get current page
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Check if page exists
     */
    hasPage(page) {
        return !!this.pages[page];
    }

    /**
     * Get all pages
     */
    getPages() {
        return Object.keys(this.pages);
    }
}