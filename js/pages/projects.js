import { Store } from '../store.js';

let store;

function ensureProjectsState() {
    const projects = store.get('projects', []);
    if (!Array.isArray(projects) || projects.length === 0) {
        const starterProject = {
            id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
            name: 'Starter Website',
            type: 'folder',
            createdAt: new Date().toISOString(),
            files: {
                'index.html': '<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Hello from your project</h1>\n  </body>\n</html>',
                'styles.css': 'body { font-family: Arial, sans-serif; padding: 2rem; }',
                'script.js': "console.log('Project ready');"
            }
        };
        store.set('projects', [starterProject]);
    }
}

/**
 * Initialize the projects page
 */
export function initializeProjects() {
    store = Store.getInstance();

    const container = document.getElementById('page-projects');
    if (!container) return;

    ensureProjectsState();
    renderProjects(container);
    console.log('📁 Projects initialized');
}

/**
 * Render the projects page
 */
function renderProjects(container) {
    const projects = store.get('projects', []);

    container.innerHTML = `
        <div class="projects-shell">
            <div class="projects-toolbar">
                <div>
                    <h1>📁 Projects</h1>
                    <p>Work like you are inside a local project folder. Everything is saved in your browser storage.</p>
                </div>
                <button class="btn btn-primary" id="new-project-btn">+ New Project</button>
            </div>

            <div class="projects-layout">
                <aside class="projects-sidebar">
                    <div class="sidebar-title">Projects</div>
                    <div class="project-tree">
                        ${projects.map((project, index) => `
                            <div class="project-item-row">
                                <button class="project-item ${index === 0 ? 'active' : ''}" data-project-id="${project.id}">
                                    <span class="project-icon">📁</span>
                                    <span>${project.name || 'Untitled Project'}</span>
                                </button>
                                <button class="project-delete-btn" data-project-id="${project.id}" title="Delete project" aria-label="Delete project">🗑️</button>
                            </div>
                        `).join('')}
                    </div>
                </aside>

                <section class="projects-workspace">
                    <div class="workspace-header">
                        <div>
                            <h2>${projects[0]?.name || 'Project'}</h2>
                            <p>Files are cached locally and stay available on this device.</p>
                        </div>
                        <span class="workspace-badge">Local Cache</span>
                    </div>

                    <div class="file-manager">
                        <div class="file-list">
                            ${Object.entries(projects[0]?.files || {}).map(([fileName]) => `
                                <button class="file-row" data-file-name="${fileName}">
                                    <span class="file-icon">📄</span>
                                    <span>${fileName}</span>
                                </button>
                            `).join('')}
                        </div>
                        <div class="file-editor">
                            <div class="editor-toolbar">
                                <span id="active-file-label">${Object.keys(projects[0]?.files || {})[0] || 'index.html'}</span>
                                <button class="btn btn-sm btn-secondary" id="save-project-btn">Save</button>
                            </div>
                            <textarea id="project-editor" spellcheck="false">${Object.values(projects[0]?.files || {})[0] || ''}</textarea>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    `;

    setupProjectInteractions(container);
}

function setupProjectInteractions(container) {
    const projectButtons = container.querySelectorAll('.project-item');
    projectButtons.forEach(button => {
        button.addEventListener('click', () => {
            projectButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            showToast('📁 Switched project view', 'info');
        });
    });

    const deleteButtons = container.querySelectorAll('.project-delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const projectId = button.dataset.projectId;
            const projects = store.get('projects', []);
            const filtered = projects.filter(project => project.id !== projectId);
            if (filtered.length === 0) {
                store.set('projects', []);
                renderProjects(container);
                showToast('🗑️ Deleted the last project. A fresh starter project will be created on next visit.', 'info');
                return;
            }
            store.set('projects', filtered);
            renderProjects(container);
            showToast('🗑️ Project deleted', 'success');
        });
    });

    const fileRows = container.querySelectorAll('.file-row');
    fileRows.forEach(row => {
        row.addEventListener('click', () => {
            const fileName = row.dataset.fileName;
            const projects = store.get('projects', []);
            const firstProject = projects[0];
            if (!firstProject) return;
            const editor = container.querySelector('#project-editor');
            const label = container.querySelector('#active-file-label');
            if (editor && label) {
                editor.value = firstProject.files[fileName] || '';
                label.textContent = fileName;
            }
        });
    });

    const saveBtn = container.querySelector('#save-project-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const editor = container.querySelector('#project-editor');
            const label = container.querySelector('#active-file-label');
            const projects = store.get('projects', []);
            const firstProject = projects[0];
            const fileName = label?.textContent || 'index.html';
            if (editor && firstProject) {
                firstProject.files[fileName] = editor.value;
                store.set('projects', projects);
                showToast('💾 Project file saved locally', 'success');
            }
        });
    }

    const newProjectBtn = container.querySelector('#new-project-btn');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', () => {
            const projects = store.get('projects', []);
            const newProject = {
                id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
                name: `Project ${projects.length + 1}`,
                type: 'folder',
                createdAt: new Date().toISOString(),
                files: {
                    'index.html': '<!DOCTYPE html>\n<html>\n  <body>\n    <h1>New project</h1>\n  </body>\n</html>',
                    'styles.css': 'body { font-family: Arial, sans-serif; padding: 2rem; }',
                    'script.js': "console.log('New project created');"
                }
            };
            projects.push(newProject);
            store.set('projects', projects);
            renderProjects(container);
            showToast('🆕 New project created', 'success');
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
