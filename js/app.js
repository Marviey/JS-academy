/**
 * JavaScript Academy - Main Application
 * Entry point for the educational PWA
 */

import { Router } from './router.js?v=20260701';
import { Store } from './store.js?v=20260701';
import { Theme } from './theme.js?v=20260701';
import { Navigation } from './navigation.js?v=20260701';
import { initializeDashboard } from './pages/dashboard.js?v=20260701';
import { initializeLessons } from './pages/lessons.js?v=20260701';
import { initializePlayground } from './pages/playground.js?v=20260701';
import { initializeQuiz } from './pages/quiz.js?v=20260701';
import { initializeGames } from './pages/games.js?v=20260701';
import { initializeProjects } from './pages/projects.js?v=20260701';
import { initializeProfile } from './pages/profile.js?v=20260701';
import { initializeSettings } from './pages/settings.js?v=20260701';

class App {
    constructor() {
        this.store = Store.getInstance();
        this.router = Router.getInstance();
        this.theme = Theme.getInstance();
        this.navigation = Navigation.getInstance();
        this.initialized = false;
        this.isAuthenticated = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) return;

        console.log('🚀 JavaScript Academy v1.0.0');

        this.setupLoginFlow();
        console.log('📚 Loading application...');

        try {
            // Load user data from storage
            await this.store.load();

            // Apply theme
            this.theme.apply();

            if (!this.isAuthenticated) {
                this.showLoginScreen();
                return;
            }

            // Setup navigation
            this.navigation.setup();

            // Initialize all pages
            this.initializePages();

            // Setup router
            this.router.setup();

            // Handle initial route
            this.handleInitialRoute();

            // Setup event listeners
            this.setupEventListeners();

            this.initialized = true;

            console.log('✅ Application initialized successfully');
            console.log(`👤 User: ${this.store.get('user.name') || 'Student'}`);
            console.log(`⭐ XP: ${this.store.get('xp')}`);
            console.log(`🪙 Coins: ${this.store.get('coins')}`);

            // Show welcome toast for new users
            if (!this.store.get('hasSeenWelcome')) {
                this.showWelcomeMessage();
                this.store.set('hasSeenWelcome', true);
            }

        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showError('Failed to load application. Please refresh the page.');
        }
    }

    setupLoginFlow() {
        const loginScreen = document.getElementById('login-screen');
        const form = document.getElementById('login-form');
        const guestBtn = document.getElementById('guest-login-btn');
        const nameInput = document.getElementById('login-name');

        if (!loginScreen || !form) return;

        const finishLogin = (name) => {
            this.isAuthenticated = true;
            this.store.set('user.name', name || 'Student');
            loginScreen.style.display = 'none';
            document.getElementById('app').classList.add('app-ready');
            this.init();
        };

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            finishLogin(nameInput?.value || 'Student');
        });

        guestBtn?.addEventListener('click', () => {
            finishLogin('Guest');
        });
    }

    showLoginScreen() {
        const loginScreen = document.getElementById('login-screen');
        const app = document.getElementById('app');
        if (loginScreen) {
            loginScreen.style.display = 'flex';
        }
        if (app) {
            app.classList.remove('app-ready');
        }
    }

    /**
     * Initialize all page modules
     */
    initializePages() {
        try {
            initializeDashboard();
            initializeLessons();
            initializePlayground();
            initializeQuiz();
            initializeGames();
            initializeProjects();
            initializeProfile();
            initializeSettings();
        } catch (error) {
            console.error('Failed to initialize pages:', error);
        }
    }

    /**
     * Handle the initial route
     */
    handleInitialRoute() {
        const hash = window.location.hash || '#dashboard';
        const page = hash.substring(1) || 'dashboard';
        this.router.navigate(page);
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const page = window.location.hash.substring(1) || 'dashboard';
            this.router.navigate(page);
        });

        // Handle online/offline events
        window.addEventListener('online', () => {
            this.showToast('Back online! 🎉', 'success');
        });

        window.addEventListener('offline', () => {
            this.showToast('You are offline. Some features may not work.', 'warning');
        });

        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Refresh streak or data when user returns
                this.refreshUserData();
            }
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+D for dark mode toggle
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.theme.toggle();
                this.showToast(`Switched to ${this.theme.current} mode`, 'success');
            }

            // Ctrl+K for search
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                // Open search
                this.openSearch();
            }
        });
    }

    /**
     * Show welcome message for new users
     */
    showWelcomeMessage() {
        setTimeout(() => {
            this.showToast(
                '👋 Welcome to JavaScript Academy! Start your coding journey today.',
                'success'
            );
        }, 500);

        // Show another welcome message after a few seconds
        setTimeout(() => {
            this.showToast(
                '💡 Tip: Use Ctrl+Shift+D to toggle dark mode',
                'info'
            );
        }, 3000);
    }

    /**
     * Refresh user data
     */
    refreshUserData() {
        // Update streak
        const streak = this.store.updateStreak();
        if (streak) {
            // Show streak notification
            this.showToast(`🔥 Daily streak: ${streak} days!`, 'success');
        }
        // Update dashboard if visible
        if (document.querySelector('#page-dashboard.active')) {
            // Refresh dashboard data
            const event = new CustomEvent('refresh-dashboard');
            document.dispatchEvent(event);
        }
    }

    /**
     * Show a toast notification
     */
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: '💡'
        };

        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || '💡'}</span>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">×</button>
        `;

        container.appendChild(toast);

        // Auto dismiss
        const timeout = setTimeout(() => {
            this.dismissToast(toast);
        }, duration);

        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                clearTimeout(timeout);
                this.dismissToast(toast);
            });
        }

        // Dismiss on click outside
        toast.addEventListener('click', (e) => {
            if (e.target === toast) {
                clearTimeout(timeout);
                this.dismissToast(toast);
            }
        });
    }

    /**
     * Dismiss a toast notification
     */
    dismissToast(toast) {
        if (!toast || !toast.parentElement) return;
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }

    /**
     * Show an error message
     */
    showError(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast toast-error';
        toast.innerHTML = `
            <span class="toast-icon">❌</span>
            <div class="toast-content">
                <div class="toast-title">Error</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">×</button>
        `;

        container.appendChild(toast);

        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                toast.remove();
            });
        }

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    /**
     * Open search modal
     */
    openSearch() {
        // Will be implemented with search functionality
        this.showToast('🔍 Search feature coming soon!', 'info');
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();

    // Expose app to global scope for debugging
    window.__app = app;
});

// Handle service worker updates
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker updated');
        window.location.reload();
    });
}