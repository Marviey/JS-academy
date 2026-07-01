/**
 * Profile - User profile page
 */

import { Store } from '../store.js';
import { Theme } from '../theme.js';
import { Router } from '../router.js';
import { getRelativeTime } from '../utils/helpers.js';

let store;
let router;
let theme;

/**
 * Initialize the profile page
 */
export function initializeProfile() {
    store = Store.getInstance();
    router = Router.getInstance();
    theme = Theme.getInstance();

    const container = document.getElementById('page-profile');
    if (!container) return;

    renderProfile(container);
    setupEventListeners(container);

    console.log('👤 Profile initialized');
}

/**
 * Render the profile page
 */
function renderProfile(container) {
    const user = store.get('user', {});
    const xp = store.get('xp', 0);
    const coins = store.get('coins', 0);
    const level = store.get('level', 1);
    const streak = store.get('streak', 0);
    const completedLessons = store.get('completedLessons', []).length;
    const totalLessons = 48;
    const achievements = store.get('achievements', []).length;
    const badges = store.get('badges', []).length;
    const joined = store.get('user.joined', new Date().toISOString());

    container.innerHTML = `
        <div class="container">
            <!-- Profile Header -->
            <div class="profile-header" style="text-align: center; padding: var(--spacing-xl) 0;">
                <div class="profile-avatar" style="font-size: 80px; margin-bottom: var(--spacing-md);">
                    ${user.avatar || '👨‍🎓'}
                </div>
                <h1 style="margin-bottom: var(--spacing-xs);">${user.name || 'Student'}</h1>
                <p style="color: var(--text-secondary);">
                    Joined ${new Date(joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                <div style="display: flex; gap: var(--spacing-lg); justify-content: center; margin-top: var(--spacing-md);">
                    <div>
                        <div style="font-weight: 700; font-size: var(--font-size-xl);">${level}</div>
                        <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">Level</div>
                    </div>
                    <div>
                        <div style="font-weight: 700; font-size: var(--font-size-xl);">${streak}</div>
                        <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">Day Streak</div>
                    </div>
                    <div>
                        <div style="font-weight: 700; font-size: var(--font-size-xl);">${completedLessons}/${totalLessons}</div>
                        <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">Lessons</div>
                    </div>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid" style="margin-bottom: var(--spacing-xl);">
                <div class="stat-card">
                    <div class="stat-icon xp">⭐</div>
                    <div class="stat-content">
                        <div class="stat-label">Total XP</div>
                        <div class="stat-value">${xp}</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon coins">🪙</div>
                    <div class="stat-content">
                        <div class="stat-label">Total Coins</div>
                        <div class="stat-value">${coins}</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon level">🏅</div>
                    <div class="stat-content">
                        <div class="stat-label">Achievements</div>
                        <div class="stat-value">${achievements}</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon lessons">🎖️</div>
                    <div class="stat-content">
                        <div class="stat-label">Badges</div>
                        <div class="stat-value">${badges}</div>
                    </div>
                </div>
            </div>

            <!-- Edit Profile -->
            <div class="card" style="margin-bottom: var(--spacing-xl);">
                <h3 style="margin-bottom: var(--spacing-md);">✏️ Edit Profile</h3>
                <div class="form-group" style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                    <div class="input-group">
                        <label for="profile-name">Name</label>
                        <input type="text" id="profile-name" value="${user.name || 'Student'}" placeholder="Enter your name">
                    </div>
                    <div class="input-group">
                        <label for="profile-avatar">Avatar (emoji)</label>
                        <input type="text" id="profile-avatar" value="${user.avatar || '👨‍🎓'}" placeholder="Enter an emoji" maxlength="2">
                    </div>
                    <button class="btn btn-primary" id="save-profile-btn">💾 Save Profile</button>
                </div>
            </div>

            <!-- Statistics -->
            <div class="card" style="margin-bottom: var(--spacing-xl);">
                <h3 style="margin-bottom: var(--spacing-md);">📊 Statistics</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <div>
                        <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">Lessons Completed</div>
                        <div style="font-size: var(--font-size-xl); font-weight: 700;">${completedLessons}</div>
                    </div>
                    <div>
                        <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">Completion Rate</div>
                        <div style="font-size: var(--font-size-xl); font-weight: 700;">${Math.round((completedLessons / totalLessons) * 100)}%</div>
                    </div>
                    <div>
                        <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">Current Streak</div>
                        <div style="font-size: var(--font-size-xl); font-weight: 700;">${streak} days</div>
                    </div>
                    <div>
                        <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">Total Coins Earned</div>
                        <div style="font-size: var(--font-size-xl); font-weight: 700;">${coins}</div>
                    </div>
                </div>
            </div>

            <!-- Danger Zone -->
            <div class="card" style="border-color: var(--danger); margin-bottom: var(--spacing-xl);">
                <h3 style="color: var(--danger); margin-bottom: var(--spacing-md);">⚠️ Danger Zone</h3>
                <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--spacing-md);">
                    Reset all your progress. This action cannot be undone.
                </p>
                <button class="btn btn-danger" id="reset-progress-btn">🗑️ Reset All Progress</button>
            </div>
        </div>
    `;
}

/**
 * Setup event listeners
 */
function setupEventListeners(container) {
    // Save profile
    const saveBtn = container.querySelector('#save-profile-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const nameInput = container.querySelector('#profile-name');
            const avatarInput = container.querySelector('#profile-avatar');

            if (nameInput && nameInput.value.trim()) {
                store.set('user.name', nameInput.value.trim());
            }
            if (avatarInput && avatarInput.value.trim()) {
                store.set('user.avatar', avatarInput.value.trim());
            }

            showToast('✅ Profile updated successfully!', 'success');
            renderProfile(container);
            setupEventListeners(container);
        });
    }

    // Reset progress
    const resetBtn = container.querySelector('#reset-progress-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('⚠️ Are you sure you want to reset ALL progress? This cannot be undone!')) {
                if (confirm('⚠️ Last chance! All XP, coins, and progress will be permanently deleted.')) {
                    store.resetProgress();
                    showToast('🗑️ All progress has been reset', 'warning');
                    setTimeout(() => {
                        renderProfile(container);
                        setupEventListeners(container);
                    }, 500);
                }
            }
        });
    }
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