/**
 * Games - Application games page
 */

import { Store } from '../store.js';
import { Router } from '../router.js';

let store;
let router;
let games = [];

export function initializeGames() {
    store = Store.getInstance();
    router = Router.getInstance();

    const container = document.getElementById('page-games');
    if (!container) return;

    loadGamesData().then(() => {
        renderGames(container);
        setupEventListeners(container);
        console.log('🎮 Games initialized');
    });
}

async function loadGamesData() {
    try {
        const response = await fetch('data/games.json', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('Failed to load games data');
        }
        const data = await response.json();
        games = data.games || [];
        if (games.length > 0) {
            store.set('games', games);
        }
    } catch (error) {
        console.error(error);
        games = store.get('games', []);
    }
}

function renderGames(container) {
    const gameList = games.length ? games : store.get('games', []);

    container.innerHTML = `
        <div class="container">
            <div class="page-header">
                <div>
                    <h1>🎮 Games</h1>
                    <p>Play mini coding games, then use the Playground to practice and refine your code.</p>
                </div>
                <div class="games-header-actions">
                    <span class="badge badge-primary">${gameList.length} Games</span>
                </div>
            </div>
            <div class="game-spotlight" id="game-spotlight" style="display:none;"></div>
            <div class="games-grid">
                ${gameList.length === 0 ? '<div class="card"><p>No games available yet.</p></div>' : gameList.map(renderGameCard).join('')}
            </div>
        </div>
    `;
}

function renderGameCard(game) {
    const statusClass = game.status === 'Ready' ? 'badge-success' : 'badge-warning';
    const actionButton = game.status === 'Ready'
        ? `<button class="btn btn-primary game-play-btn" data-game-id="${game.id}">Play Game</button>`
        : `<button class="btn btn-secondary" disabled>${game.status}</button>`;

    return `
        <div class="card game-card">
            <div class="game-card-header">
                <div>
                    <h3>${game.title || 'Untitled Game'}</h3>
                    <span class="badge ${statusClass}">${game.status || 'Coming Soon'}</span>
                </div>
                <span class="game-difficulty">${game.difficulty || 'Easy'}</span>
            </div>
            <p class="game-description">${game.description || 'Play a challenge in the Playground to sharpen your skills.'}</p>
            <div class="game-progress">
                <span class="badge badge-primary">⭐ ${game.xp || 20} XP</span>
                <span class="badge badge-warning">🪙 ${game.coins || 10} Coins</span>
            </div>
            <div class="game-actions">
                ${actionButton}
            </div>
        </div>
    `;
}

function setupEventListeners(container) {
    const buttons = container.querySelectorAll('.game-play-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const gameId = button.dataset.gameId;
            const game = games.find(item => item.id === gameId) || store.get('games', []).find(item => item.id === gameId);

            if (!game) {
                showToast('Game not found.', 'error');
                return;
            }

            if (game.status !== 'Ready') {
                showToast('This game is not ready yet. Check back soon!', 'warning');
                return;
            }

            if (game.challenge) {
                showChallenge(game);
                showToast(`🎮 ${game.title} challenge ready`, 'success');
                return;
            }

            showToast('Game launch coming soon! Try the playground challenge instead.', 'info');
        });
    });
}

function showChallenge(game) {
    const spotlight = document.getElementById('game-spotlight');
    if (!spotlight) return;

    spotlight.innerHTML = `
        <div class="card game-spotlight-card">
            <div class="game-card-header">
                <div>
                    <h3>${game.title || 'Challenge'}</h3>
                    <span class="badge badge-success">Ready</span>
                </div>
                <span class="game-difficulty">${game.difficulty || 'Easy'}</span>
            </div>
            <p class="game-description">${game.challenge?.description || game.description || 'Solve the challenge below.'}</p>
            <div class="game-hint">💡 ${game.challenge?.hint || 'Use the Playground workspace to write and test your solution.'}</div>
            <div class="game-progress">
                <span class="badge badge-primary">⭐ ${game.xp || 20} XP</span>
                <span class="badge badge-warning">🪙 ${game.coins || 10} Coins</span>
            </div>
            <div class="game-actions">
                <button class="btn btn-primary" id="game-open-playground">Practice in Playground</button>
            </div>
        </div>
    `;

    spotlight.style.display = 'block';

    const openBtn = document.getElementById('game-open-playground');
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            router.navigate('playground');
            const event = new CustomEvent('load-challenge', {
                detail: { challenge: game.challenge }
            });
            document.dispatchEvent(event);
        });
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : '💡'}</span>
        <div class="toast-content"><div class="toast-message">${message}</div></div>
        <button class="toast-close" aria-label="Close notification">×</button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) closeBtn.addEventListener('click', () => toast.remove());

    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 3000);
}
