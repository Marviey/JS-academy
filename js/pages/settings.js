/**
 * Settings - Application settings page
 */

import { Store } from '../store.js';
import { Theme } from '../theme.js';

let store;
let theme;

/**
 * Initialize the settings page
 */
export function initializeSettings() {
    store = Store.getInstance();
    theme = Theme.getInstance();

    const container = document.getElementById('page-settings');
    if (!container) return;

    renderSettings(container);
    setupEventListeners(container);

    console.log('⚙️ Settings initialized');
}

/**
 * Render the settings page
 */
function renderSettings(container) {
    const settings = {
        theme: store.get('theme', 'light'),
        soundEnabled: store.get('soundEnabled', true),
        animationsEnabled: store.get('animationsEnabled', true),
        fontSize: store.get('fontSize', 'medium')
    };

    container.innerHTML = `
        <div class="container">
            <h1 style="margin-bottom: var(--spacing-xl);">⚙️ Settings</h1>

            <!-- Appearance -->
            <div class="card" style="margin-bottom: var(--spacing-xl);">
                <h3 style="margin-bottom: var(--spacing-md);">🎨 Appearance</h3>

                <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
                    <div class="toggle" data-setting="theme">
                        <input type="checkbox" id="theme-toggle" ${settings.theme === 'dark' ? 'checked' : ''}>
                        <label class="toggle-slider" for="theme-toggle"></label>
                        <span class="toggle-label">
                            <span class="theme-icon">${settings.theme === 'dark' ? '🌙' : '☀️'}</span>
                            ${settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </span>
                    </div>

                    <div class="input-group">
                        <label for="font-size">Font Size</label>
                        <select id="font-size">
                            <option value="small" ${settings.fontSize === 'small' ? 'selected' : ''}>Small</option>
                            <option value="medium" ${settings.fontSize === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="large" ${settings.fontSize === 'large' ? 'selected' : ''}>Large</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Preferences -->
            <div class="card" style="margin-bottom: var(--spacing-xl);">
                <h3 style="margin-bottom: var(--spacing-md);">🔊 Preferences</h3>

                <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
                    <div class="toggle">
                        <input type="checkbox" id="sound-toggle" ${settings.soundEnabled ? 'checked' : ''}>
                        <label class="toggle-slider" for="sound-toggle"></label>
                        <span class="toggle-label">🔊 Sound Effects</span>
                    </div>

                    <div class="toggle">
                        <input type="checkbox" id="animations-toggle" ${settings.animationsEnabled ? 'checked' : ''}>
                        <label class="toggle-slider" for="animations-toggle"></label>
                        <span class="toggle-label">✨ Animations</span>
                    </div>
                </div>
            </div>

            <!-- Keyboard Shortcuts -->
            <div class="card" style="margin-bottom: var(--spacing-xl);">
                <h3 style="margin-bottom: var(--spacing-md);">⌨️ Keyboard Shortcuts</h3>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <div>
                        <div style="font-weight: 600; font-size: var(--font-size-sm);">Ctrl+K</div>
                        <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">Search</div>
                    </div>
                    <div>
                        <div style="font-weight: 600; font-size: var(--font-size-sm);">Ctrl+Shift+D</div>
                        <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">Toggle Dark Mode</div>
                    </div>
                    <div>
                        <div style="font-weight: 600; font-size: var(--font-size-sm);">Escape</div>
                        <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">Close Modals</div>
                    </div>
                    <div>
                        <div style="font-weight: 600; font-size: var(--font-size-sm);">Enter</div>
                        <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">Submit / Confirm</div>
                    </div>
                </div>
            </div>

            <!-- About -->
            <div class="card" style="margin-bottom: var(--spacing-xl);">
                <h3 style="margin-bottom: var(--spacing-md);">ℹ️ About</h3>

                <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                    <div><strong>JavaScript Academy</strong> v1.0.0</div>
                    <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                        Learn JavaScript from zero to React with interactive lessons, games, and projects.
                    </div>
                    <div style="font-size: var(--font-size-sm); color: var(--text-tertiary); margin-top: var(--spacing-sm);">
                        Made with ❤️ for learning
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Setup event listeners
 */
function setupEventListeners(container) {
    // Theme toggle
    const themeToggle = container.querySelector('#theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            theme.toggle();
            // Update label
            const label = themeToggle.closest('.toggle').querySelector('.toggle-label');
            if (label) {
                const icon = label.querySelector('.theme-icon');
                if (icon) {
                    icon.textContent = theme.isDark() ? '🌙' : '☀️';
                }
                label.childNodes[2].textContent = theme.isDark() ? 'Dark Mode' : 'Light Mode';
            }
        });
    }

    // Sound toggle
    const soundToggle = container.querySelector('#sound-toggle');
    if (soundToggle) {
        soundToggle.addEventListener('change', () => {
            store.set('soundEnabled', soundToggle.checked);
            showToast(soundToggle.checked ? '🔊 Sound effects enabled' : '🔇 Sound effects disabled', 'info');
        });
    }

    // Animations toggle
    const animToggle = container.querySelector('#animations-toggle');
    if (animToggle) {
        animToggle.addEventListener('change', () => {
            store.set('animationsEnabled', animToggle.checked);
            showToast(animToggle.checked ? '✨ Animations enabled' : '❌ Animations disabled', 'info');
            // Toggle animation class on body
            document.body.classList.toggle('animations-disabled', !animToggle.checked);
        });
    }

    // Font size
    const fontSizeSelect = container.querySelector('#font-size');
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', () => {
            const size = fontSizeSelect.value;
            store.set('fontSize', size);
            applyFontSize(size);
            showToast(`📏 Font size set to ${size}`, 'success');
        });
        // Apply initial font size
        applyFontSize(fontSizeSelect.value);
    }
}

/**
 * Apply font size to the document
 */
function applyFontSize(size) {
    const html = document.documentElement;
    const sizes = {
        small: '14px',
        medium: '16px',
        large: '18px'
    };
    html.style.fontSize = sizes[size] || '16px';
}

/**
 * Show a toast notification
 */
function showToast(message, type = 'info') {
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

    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 3000);

    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });
    }
}