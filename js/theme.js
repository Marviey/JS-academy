/**
 * Theme - Manages application theming (Dark/Light mode)
 */

export class Theme {
    static instance = null;

    constructor() {
        if (Theme.instance) {
            return Theme.instance;
        }
        Theme.instance = this;
        this.current = 'light';
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    }

    static getInstance() {
        if (!Theme.instance) {
            Theme.instance = new Theme();
        }
        return Theme.instance;
    }

    /**
     * Apply the current theme
     */
    apply() {
        const html = document.documentElement;
        const stored = localStorage.getItem('js_academy_theme');

        if (stored) {
            this.current = stored;
        } else {
            // Use system preference
            this.current = this.mediaQuery.matches ? 'dark' : 'light';
        }

        html.setAttribute('data-theme', this.current);
        this.updateMetaThemeColor();

        // Update toggle buttons
        this.updateToggleButtons();
    }

    /**
     * Toggle between light and dark mode
     */
    toggle() {
        this.current = this.current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.current);
        localStorage.setItem('js_academy_theme', this.current);
        this.updateMetaThemeColor();
        this.updateToggleButtons();
    }

    /**
     * Set a specific theme
     */
    set(theme) {
        if (theme !== 'light' && theme !== 'dark') return;
        this.current = theme;
        document.documentElement.setAttribute('data-theme', this.current);
        localStorage.setItem('js_academy_theme', this.current);
        this.updateMetaThemeColor();
        this.updateToggleButtons();
    }

    /**
     * Update the meta theme color for mobile browsers
     */
    updateMetaThemeColor() {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            const color = this.current === 'dark' ? '#0F0F1A' : '#6C63FF';
            meta.setAttribute('content', color);
        }
    }

    /**
     * Update theme toggle buttons
     */
    updateToggleButtons() {
        const toggles = document.querySelectorAll('.theme-toggle');
        toggles.forEach(toggle => {
            const isDark = this.current === 'dark';
            toggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
            toggle.classList.toggle('dark', isDark);

            // Update icon if present
            const icon = toggle.querySelector('.theme-icon');
            if (icon) {
                icon.textContent = isDark ? '🌙' : '☀️';
            }
        });
    }

    /**
     * Get current theme
     */
    getTheme() {
        return this.current;
    }

    /**
     * Check if dark mode is active
     */
    isDark() {
        return this.current === 'dark';
    }

    /**
     * Check if light mode is active
     */
    isLight() {
        return this.current === 'light';
    }
}