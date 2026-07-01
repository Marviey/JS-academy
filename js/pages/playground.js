/**
 * Playground - Interactive coding environment
 */

import { Store } from '../store.js';
import { Router } from '../router.js';
import { debounce } from '../utils/helpers.js';

let store;
let router;
let editor;
let output;
let consoleOutput = [];
let isFullscreen = false;
let codeHistory = [];
let historyIndex = -1;

/**
 * Initialize the playground
 */
export function initializePlayground() {
    store = Store.getInstance();
    router = Router.getInstance();

    const container = document.getElementById('page-playground');
    if (!container) return;

    renderPlayground(container);
    setupPlaygroundEvents(container);

    // Listen for load code events
    document.addEventListener('load-code', (e) => {
        if (e.detail && e.detail.code !== undefined) {
            loadCode(e.detail.code);
        }
    });

    // Listen for load challenge events
    document.addEventListener('load-challenge', (e) => {
        if (e.detail && e.detail.challenge) {
            loadChallenge(e.detail.challenge);
        }
    });

    console.log('💻 Playground initialized');
}

/**
 * Render the playground
 */
function renderPlayground(container) {
    container.innerHTML = `
        <div class="playground-container">
            <!-- Challenge Section -->
            <div class="playground-challenge" id="playground-challenge" style="display: none;">
                <div class="challenge-header">
                    <span class="challenge-title">⚡ Quick Challenge</span>
                    <span class="challenge-difficulty easy" id="challenge-difficulty">Easy</span>
                </div>
                <div class="challenge-description" id="challenge-description">
                    Write code to solve the challenge below.
                </div>
                <div class="challenge-hint" id="challenge-hint">
                    💡 Hint: Think about how you can solve this step by step.
                </div>
                <button class="btn btn-secondary btn-sm" id="challenge-hint-btn">
                    💡 Show Hint
                </button>
            </div>

            <!-- Playground Layout -->
            <div class="playground-layout">
                <!-- Editor -->
                <div class="playground-editor">
                    <div class="editor-header">
                        <div class="editor-title">
                            <span>📝 Code Editor</span>
                            <span style="font-size: var(--font-size-xs); color: var(--text-tertiary);" id="line-count">Line 1</span>
                        </div>
                        <div class="editor-actions">
                            <button id="run-code-btn" title="Run Code (Ctrl+Enter)">
                                ▶️ Run
                            </button>
                            <button id="reset-code-btn" title="Reset Code">
                                🔄 Reset
                            </button>
                            <button id="copy-code-btn" title="Copy Code">
                                📋 Copy
                            </button>
                            <button id="format-code-btn" title="Format Code">
                                ✨ Format
                            </button>
                            <button id="fullscreen-btn" title="Fullscreen">
                                ⛶
                            </button>
                        </div>
                    </div>
                    <div class="playground-tabs">
                        <button class="active" data-tab="javascript">JavaScript</button>
                        <button data-tab="html">HTML</button>
                        <button data-tab="css">CSS</button>
                    </div>
                    <div class="editor-body">
                        <div class="line-numbers" id="line-numbers">
                            <span>1</span>
                        </div>
                        <textarea id="code-editor" spellcheck="false" wrap="off">// Welcome to JavaScript Academy!
// Write your code here and click Run!

console.log('Hello, World!');

// Try changing the code and see what happens!</textarea>
                    </div>
                </div>

                <!-- Output -->
                <div class="playground-output">
                    <div class="output-header">
                        <div class="output-title">
                            <span>📊 Output</span>
                            <span style="font-size: var(--font-size-xs); color: var(--text-tertiary);" id="output-status">Ready</span>
                        </div>
                        <div class="output-actions">
                            <button id="clear-output-btn" title="Clear Output">
                                🗑️ Clear
                            </button>
                            <button id="expected-output-btn" title="Expected Output">
                                🎯 Expected
                            </button>
                        </div>
                    </div>
                    <div class="output-body" id="output-body">
                        <div class="output-line output-info">
                            <span class="output-arrow">▸</span>
                            <span>JavaScript Academy Playground</span>
                        </div>
                        <div class="output-line output-info">
                            <span class="output-arrow">▸</span>
                            <span>Write your code and click "Run" to execute</span>
                        </div>
                        <div class="expected-output" id="expected-output" style="display: none;">
                            <div class="expected-label">🎯 Expected Output</div>
                            <div class="expected-content" id="expected-content">
                                Hello, World!
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Store references
    editor = document.getElementById('code-editor');
    output = document.getElementById('output-body');

    // Set initial line numbers
    updateLineNumbers();

    // Load saved code from storage
    const savedCode = store.get('playgroundCode');
    if (savedCode) {
        editor.value = savedCode;
    }

    // Show expected output
    const expectedBtn = document.getElementById('expected-output-btn');
    if (expectedBtn) {
        expectedBtn.addEventListener('click', () => {
            const expected = document.getElementById('expected-output');
            if (expected) {
                expected.style.display = expected.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
}

/**
 * Setup playground events
 */
function setupPlaygroundEvents(container) {
    // Run code
    const runBtn = document.getElementById('run-code-btn');
    if (runBtn) {
        runBtn.addEventListener('click', () => {
            runCode();
        });
    }

    // Keyboard shortcut: Ctrl+Enter to run
    if (editor) {
        editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                runCode();
            }
            // Ctrl+Z for undo
            if (e.ctrlKey && e.key === 'z') {
                // Native undo
                return;
            }
            // Track history for undo/redo
            if (!e.ctrlKey) {
                saveHistory();
            }
        });

        // Auto-update line numbers
        editor.addEventListener('input', debounce(() => {
            updateLineNumbers();
            // Auto-save code
            store.set('playgroundCode', editor.value);
        }, 300));

        // Tab support
        editor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = editor.selectionStart;
                const end = editor.selectionEnd;
                editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
                editor.selectionStart = editor.selectionEnd = start + 2;
                updateLineNumbers();
            }
        });
    }

    // Reset code
    const resetBtn = document.getElementById('reset-code-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const defaultCode = `// Welcome to JavaScript Academy!
// Write your code here and click Run!

console.log('Hello, World!');

// Try changing the code and see what happens!`;
            editor.value = defaultCode;
            clearOutput();
            updateLineNumbers();
            store.set('playgroundCode', defaultCode);
            showToast('🔄 Code reset to default', 'info');
        });
    }

    // Copy code
    const copyBtn = document.getElementById('copy-code-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(editor.value).then(() => {
                showToast('📋 Code copied to clipboard!', 'success');
            }).catch(() => {
                // Fallback
                editor.select();
                document.execCommand('copy');
                showToast('📋 Code copied!', 'success');
            });
        });
    }

    // Format code
    const formatBtn = document.getElementById('format-code-btn');
    if (formatBtn) {
        formatBtn.addEventListener('click', () => {
            formatCode();
        });
    }

    // Fullscreen
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            toggleFullscreen();
        });
    }

    // Clear output
    const clearBtn = document.getElementById('clear-output-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            clearOutput();
        });
    }

    // Tab switching
    const tabs = container.querySelectorAll('.playground-tabs button');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabType = tab.dataset.tab;
            switchTab(tabType);
        });
    });

    // Challenge hint
    const hintBtn = document.getElementById('challenge-hint-btn');
    if (hintBtn) {
        hintBtn.addEventListener('click', () => {
            const hint = document.getElementById('challenge-hint');
            if (hint) {
                hint.classList.toggle('active');
                hintBtn.textContent = hint.classList.contains('active') ? '🙈 Hide Hint' : '💡 Show Hint';
            }
        });
    }

    // Monitor console.log
    overrideConsole();
}

/**
 * Run the code in the editor
 */
function runCode() {
    const code = editor.value;
    if (!code || code.trim() === '') {
        addOutput('💡 No code to run. Write some code first!', 'info');
        return;
    }

    clearOutput();
    consoleOutput = [];

    try {
        // Capture console.log output
        const logs = [];
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;

        console.log = (...args) => {
            logs.push({ type: 'log', args });
            originalLog(...args);
        };
        console.error = (...args) => {
            logs.push({ type: 'error', args });
            originalError(...args);
        };
        console.warn = (...args) => {
            logs.push({ type: 'warn', args });
            originalWarn(...args);
        };
        console.info = (...args) => {
            logs.push({ type: 'info', args });
            originalInfo(...args);
        };

        // Execute the code
        const result = eval(code);

        // Restore console
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
        console.info = originalInfo;

        // Display logs
        if (logs.length === 0 && result !== undefined) {
            // If no console.log but there's a result, show it
            addOutput(formatValue(result), 'value');
        } else {
            logs.forEach(log => {
                const formatted = log.args.map(arg => formatValue(arg)).join(' ');
                const type = log.type === 'error' ? 'error' : 
                             log.type === 'warn' ? 'warning' : 
                             log.type === 'info' ? 'info' : 'success';
                addOutput(formatted, type);
            });
        }

        if (logs.length === 0 && result === undefined) {
            addOutput('✅ Code executed successfully!', 'success');
        }

        updateStatus('Success');

    } catch (error) {
        // Restore console
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
        console.info = originalInfo;

        addOutput(`❌ Error: ${error.message}`, 'error');
        updateStatus('Error');
    }
}

/**
 * Format a value for display
 */
function formatValue(value) {
    if (value === undefined) {
        return '<span class="output-undefined">undefined</span>';
    }
    if (value === null) {
        return '<span class="output-null">null</span>';
    }
    if (typeof value === 'string') {
        return `<span class="output-string">"${value}"</span>`;
    }
    if (typeof value === 'number') {
        return `<span class="output-number">${value}</span>`;
    }
    if (typeof value === 'boolean') {
        return `<span class="output-boolean">${value}</span>`;
    }
    if (Array.isArray(value)) {
        return `<span class="output-value">[${value.map(v => formatValue(v)).join(', ')}]</span>`;
    }
    if (typeof value === 'object') {
        try {
            return `<span class="output-value">${JSON.stringify(value, null, 2)}</span>`;
        } catch {
            return `<span class="output-value">${String(value)}</span>`;
        }
    }
    if (typeof value === 'function') {
        return `<span class="output-value">[Function]</span>`;
    }
    return `<span class="output-value">${String(value)}</span>`;
}

/**
 * Add output to the console
 */
function addOutput(message, type = 'info') {
    if (!output) return;

    const line = document.createElement('div');
    line.className = `output-line output-${type}`;
    
    const arrow = document.createElement('span');
    arrow.className = 'output-arrow';
    arrow.textContent = '▸';
    
    const content = document.createElement('span');
    content.innerHTML = message;
    
    line.appendChild(arrow);
    line.appendChild(content);
    output.appendChild(line);
    
    // Scroll to bottom
    output.scrollTop = output.scrollHeight;
}

/**
 * Clear the output
 */
function clearOutput() {
    if (!output) return;
    
    // Keep only the info lines
    const infoLines = output.querySelectorAll('.output-line.output-info');
    output.innerHTML = '';
    
    if (infoLines.length === 0) {
        addOutput('🔄 Output cleared. Run your code again!', 'info');
    } else {
        infoLines.forEach(line => {
            output.appendChild(line.cloneNode(true));
        });
    }
    
    // Hide expected output
    const expected = document.getElementById('expected-output');
    if (expected) {
        expected.style.display = 'none';
    }
    
    updateStatus('Ready');
}

/**
 * Update line numbers
 */
function updateLineNumbers() {
    if (!editor) return;
    
    const lines = editor.value.split('\n').length;
    const lineNumbers = document.getElementById('line-numbers');
    const lineCount = document.getElementById('line-count');
    
    if (lineNumbers) {
        let html = '';
        for (let i = 1; i <= lines; i++) {
            html += `<span>${i}</span>`;
        }
        lineNumbers.innerHTML = html;
    }
    
    if (lineCount) {
        lineCount.textContent = `Line ${editor.value.split('\n').length}`;
    }
}

/**
 * Update output status
 */
function updateStatus(status) {
    const statusEl = document.getElementById('output-status');
    if (statusEl) {
        statusEl.textContent = status;
        statusEl.style.color = status === 'Success' ? 'var(--success)' : 
                               status === 'Error' ? 'var(--danger)' : 'var(--text-tertiary)';
    }
}

/**
 * Override console methods
 */
function overrideConsole() {
    // Store original methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    // Override with our custom methods
    console.log = function(...args) {
        originalLog(...args);
        if (output) {
            const formatted = args.map(arg => formatValue(arg)).join(' ');
            addOutput(formatted, 'success');
        }
    };

    console.error = function(...args) {
        originalError(...args);
        if (output) {
            const formatted = args.map(arg => formatValue(arg)).join(' ');
            addOutput(formatted, 'error');
        }
    };

    console.warn = function(...args) {
        originalWarn(...args);
        if (output) {
            const formatted = args.map(arg => formatValue(arg)).join(' ');
            addOutput(formatted, 'warning');
        }
    };

    console.info = function(...args) {
        originalInfo(...args);
        if (output) {
            const formatted = args.map(arg => formatValue(arg)).join(' ');
            addOutput(formatted, 'info');
        }
    };
}

/**
 * Format code
 */
function formatCode() {
    if (!editor) return;

    let code = editor.value;
    
    // Simple formatting
    try {
        // Remove extra whitespace
        code = code.replace(/^\s*$/gm, '');
        // Ensure consistent indentation
        const lines = code.split('\n');
        let indentLevel = 0;
        const formatted = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed) return '';
            
            // Decrease indent for closing braces
            if (trimmed.startsWith('}') || trimmed.startsWith(')') || trimmed.startsWith(']')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            const indent = '  '.repeat(indentLevel);
            
            // Increase indent for opening braces
            if (trimmed.endsWith('{') || trimmed.endsWith('(') || trimmed.endsWith('[')) {
                indentLevel++;
            }
            
            return indent + trimmed;
        });
        
        editor.value = formatted.join('\n');
        updateLineNumbers();
        showToast('✨ Code formatted!', 'success');
    } catch (error) {
        showToast('❌ Could not format code', 'error');
    }
}

/**
 * Toggle fullscreen
 */
function toggleFullscreen() {
    const container = document.querySelector('.playground-container');
    if (!container) return;

    isFullscreen = !isFullscreen;
    
    if (isFullscreen) {
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.right = '0';
        container.style.bottom = '0';
        container.style.zIndex = '9999';
        container.style.background = 'var(--bg-primary)';
        container.style.padding = 'var(--spacing-lg)';
        document.body.style.overflow = 'hidden';
        document.getElementById('fullscreen-btn').textContent = '⛶ Exit';
        showToast('⛶ Fullscreen mode activated', 'info');
    } else {
        container.style.position = '';
        container.style.top = '';
        container.style.left = '';
        container.style.right = '';
        container.style.bottom = '';
        container.style.zIndex = '';
        container.style.background = '';
        container.style.padding = '';
        document.body.style.overflow = '';
        document.getElementById('fullscreen-btn').textContent = '⛶';
        showToast('⛶ Exited fullscreen', 'info');
    }
}

/**
 * Switch between tabs
 */
function switchTab(tabType) {
    const examples = {
        javascript: `// JavaScript Example
console.log('Hello, World!');

// Try changing this code
const name = 'Student';
console.log('Welcome, ' + name + '!');

// Arrays and Objects
const colors = ['red', 'green', 'blue'];
console.log('Colors:', colors);

// Functions
function greet(person) {
    return 'Hello, ' + person + '!';
}
console.log(greet('Friend'));`,
        
        html: `<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is HTML</p>
    <button onclick="alert('Clicked!')">Click Me</button>
</body>
</html>`,
        
        css: `/* CSS Styles */
body {
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
}

h1 {
    font-size: 3rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

button {
    padding: 12px 24px;
    background: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: transform 0.3s;
}

button:hover {
    transform: scale(1.05);
}`
    };

    if (editor && examples[tabType]) {
        editor.value = examples[tabType];
        updateLineNumbers();
        store.set('playgroundCode', editor.value);
        clearOutput();
        showToast(`📝 Switched to ${tabType.toUpperCase()}`, 'info');
    }
}

/**
 * Load code into the editor
 */
function loadCode(code) {
    if (editor && code !== undefined) {
        editor.value = code;
        updateLineNumbers();
        store.set('playgroundCode', code);
        clearOutput();
        showToast('📝 Code loaded!', 'success');
    }
}

/**
 * Load a challenge
 */
function loadChallenge(challenge) {
    const challengeEl = document.getElementById('playground-challenge');
    if (!challengeEl) return;

    challengeEl.style.display = 'block';

    const titleEl = document.querySelector('.challenge-title');
    if (titleEl) {
        titleEl.textContent = challenge.title ? `⚡ ${challenge.title}` : '⚡ Quick Challenge';
    }

    document.getElementById('challenge-description').textContent = challenge.description;

    const difficultyEl = document.getElementById('challenge-difficulty');
    if (difficultyEl) {
        difficultyEl.textContent = challenge.difficulty ? challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1) : 'Easy';
        difficultyEl.className = `challenge-difficulty ${challenge.difficulty || 'easy'}`;
    }

    const hintEl = document.getElementById('challenge-hint');
    if (hintEl) {
        hintEl.textContent = challenge.hint || '💡 Hint: Think about how you can solve this step by step.';
        hintEl.classList.remove('active');
    }

    const hintBtn = document.getElementById('challenge-hint-btn');
    if (hintBtn) {
        hintBtn.textContent = '💡 Show Hint';
    }

    if (challenge.template) {
        loadCode(challenge.template);
    }

    const expected = document.getElementById('expected-content');
    if (expected && challenge.expectedOutput) {
        expected.textContent = challenge.expectedOutput;
        expected.style.display = 'block';
    }

    updateStatus('Challenge loaded');
    showToast(`⚡ Challenge: ${challenge.title}`, 'info');
}

/**
 * Save code history
 */
function saveHistory() {
    if (!editor) return;
    const currentCode = editor.value;
    if (codeHistory.length === 0 || codeHistory[codeHistory.length - 1] !== currentCode) {
        codeHistory.push(currentCode);
        if (codeHistory.length > 50) {
            codeHistory.shift();
        }
        historyIndex = codeHistory.length - 1;
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

    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }

    setTimeout(() => {
        toast.classList.add('toast-hide');
    }, 3000);

    toast.addEventListener('transitionend', () => {
        if (toast.classList.contains('toast-hide') && toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
}
