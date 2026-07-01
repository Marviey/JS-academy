/**
 * Games Module - Educational mini-games for lessons
 */

import { Store } from '../store.js';
import { shuffle } from '../utils/helpers.js';

let store;

/**
 * Initialize the games module
 */
export function initGames() {
    store = Store.getInstance();
}

/**
 * Game 1: Match the Concept (Level 1 - Programming Basics)
 */
export function matchConceptGame(container) {
    const concepts = [
        { term: 'Programming', definition: 'Writing instructions for a computer' },
        { term: 'Code', definition: 'The set of instructions you write' },
        { term: 'Console', definition: 'A place where programs show output' },
        { term: 'Comment', definition: 'Text in code that computers ignore' }
    ];

    const shuffledTerms = shuffle([...concepts]);
    const shuffledDefs = shuffle([...concepts]);

    let score = 0;
    let matches = 0;
    let selectedTerm = null;
    let selectedDef = null;

    const gameHTML = `
        <div class="mini-game-container">
            <h3>🎯 Match the Concept</h3>
            <p style="margin-bottom: var(--spacing-md);">Match each programming term with its definition.</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                <div>
                    <h4 style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--spacing-sm);">Terms</h4>
                    ${shuffledTerms.map((item, idx) => `
                        <div class="game-card" data-type="term" data-id="${idx}" data-concept="${item.term}" style="padding: var(--spacing-md); background: var(--bg-card); border-radius: var(--radius-md); margin-bottom: var(--spacing-xs); cursor: pointer; border: 2px solid var(--border-color); transition: all var(--transition-fast);">
                            ${item.term}
                        </div>
                    `).join('')}
                </div>
                <div>
                    <h4 style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--spacing-sm);">Definitions</h4>
                    ${shuffledDefs.map((item, idx) => `
                        <div class="game-card" data-type="def" data-id="${idx}" data-definition="${item.definition}" style="padding: var(--spacing-md); background: var(--bg-card); border-radius: var(--radius-md); margin-bottom: var(--spacing-xs); cursor: pointer; border: 2px solid var(--border-color); transition: all var(--transition-fast);">
                            ${item.definition}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div style="margin-top: var(--spacing-md);">
                <span style="font-weight: 600;">Score: <span id="match-score">${score}</span></span>
                <span style="margin-left: var(--spacing-lg); font-weight: 600;">Matches: <span id="match-count">${matches}</span>/${concepts.length}</span>
            </div>
            <button class="btn btn-primary" id="reset-match-game" style="margin-top: var(--spacing-md);">🔄 Reset Game</button>
        </div>
    `;

    container.innerHTML = gameHTML;

    // Game logic
    const cards = container.querySelectorAll('.game-card');
    let selectedTermEl = null;
    let selectedDefEl = null;

    cards.forEach(card => {
        card.addEventListener('click', function() {
            if (this.dataset.type === 'term') {
                if (selectedTermEl === this) {
                    this.style.borderColor = 'var(--border-color)';
                    selectedTermEl = null;
                    return;
                }
                if (selectedTermEl) {
                    selectedTermEl.style.borderColor = 'var(--border-color)';
                }
                this.style.borderColor = 'var(--primary)';
                selectedTermEl = this;
                checkMatch();
            } else if (this.dataset.type === 'def') {
                if (selectedDefEl === this) {
                    this.style.borderColor = 'var(--border-color)';
                    selectedDefEl = null;
                    return;
                }
                if (selectedDefEl) {
                    selectedDefEl.style.borderColor = 'var(--border-color)';
                }
                this.style.borderColor = 'var(--primary)';
                selectedDefEl = this;
                checkMatch();
            }
        });
    });

    function checkMatch() {
        if (!selectedTermEl || !selectedDefEl) return;

        const term = selectedTermEl.dataset.concept;
        const def = selectedDefEl.dataset.definition;

        // Find if this term and definition match
        const match = concepts.find(c => c.term === term && c.definition === def);

        if (match) {
            // Correct match
            selectedTermEl.style.borderColor = 'var(--success)';
            selectedDefEl.style.borderColor = 'var(--success)';
            selectedTermEl.style.pointerEvents = 'none';
            selectedDefEl.style.pointerEvents = 'none';
            selectedTermEl.style.opacity = '0.6';
            selectedDefEl.style.opacity = '0.6';
            matches++;
            score += 10;
            document.getElementById('match-score').textContent = score;
            document.getElementById('match-count').textContent = `${matches}/${concepts.length}`;

            // Check if game complete
            if (matches === concepts.length) {
                setTimeout(() => {
                    const xp = 50;
                    store.addXP(xp);
                    showToast(`🎉 Game Complete! +${xp} XP`, 'success');
                    document.getElementById('match-count').textContent = `✅ Complete!`;
                }, 300);
            }

            selectedTermEl = null;
            selectedDefEl = null;
        } else {
            // Wrong match - flash red
            selectedTermEl.style.borderColor = 'var(--danger)';
            selectedDefEl.style.borderColor = 'var(--danger)';
            setTimeout(() => {
                if (selectedTermEl) {
                    selectedTermEl.style.borderColor = 'var(--border-color)';
                }
                if (selectedDefEl) {
                    selectedDefEl.style.borderColor = 'var(--border-color)';
                }
                selectedTermEl = null;
                selectedDefEl = null;
            }, 500);
        }
    }

    // Reset
    const resetButton = container.querySelector('#reset-match-game');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            matchConceptGame(container);
        });
    }
}