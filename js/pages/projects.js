import { Store } from '../store.js';

let store;

async function loadProjectsData() {
    try {
        const response = await fetch('data/projects.json');
        if (!response.ok) {
            throw new Error('Failed to load project data');
        }
        const data = await response.json();
        if (data.projects && data.projects.length > 0) {
            store.set('projects', data.projects);
        }
    } catch (error) {
        console.error('Failed to load projects data:', error);
    }
}

/**
 * Initialize the projects page
 */
export function initializeProjects() {
    store = Store.getInstance();

    const container = document.getElementById('page-projects');
    if (!container) return;

    loadProjectsData().then(() => {
        renderProjects(container);
        setupEventListeners(container);
        console.log('📁 Projects initialized');
    });
}

/**
 * Render the projects page
 */
function renderProjects(container) {
    const projects = store.get('projects', []);

    container.innerHTML = `
        <div class="container">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-xl);">
                <div>
                    <h1>📁 Projects</h1>
                    <p style="color: var(--text-secondary);">Manage your coding projects and track progress.</p>
                </div>
                <button class="btn btn-primary" id="new-project-btn">+ New Project</button>
            </div>

            <div class="project-list">
                ${projects.length === 0 ? '<div class="card"><p>No projects yet. Create a project or complete a lesson to get started.</p></div>' : projects.map(renderProjectCard).join('')}
            </div>
        </div>
    `;
}

/**
 * Render a single project card
 */
function renderProjectCard(project) {
    return `
        <div class="card project-card" style="margin-bottom: var(--spacing-md);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
                <h3>${project.title || 'Untitled Project'}</h3>
                <span class="project-status">${project.status || 'Draft'}</span>
            </div>
            <p style="color: var(--text-secondary); margin-bottom: var(--spacing-md);">${project.description || 'No description available.'}</p>
            <div style="display: flex; gap: var(--spacing-sm); flex-wrap: wrap; font-size: var(--font-size-sm); color: var(--text-secondary);">
                <span>⭐ XP: ${project.xp || 0}</span>
                <span>🪙 Coins: ${project.coins || 0}</span>
            </div>
        </div>
    `;
}

/**
 * Setup event listeners for the projects page
 */
function setupEventListeners(container) {
    const newProjectBtn = container.querySelector('#new-project-btn');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', () => {
            showToast('✏️ Project creation is coming soon!', 'info');
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
