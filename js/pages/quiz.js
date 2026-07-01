/**
 * Quiz - Dedicated quiz page for JavaScript Academy
 */

import { Store } from '../store.js';
import { Router } from '../router.js';
import { shuffle } from '../utils/helpers.js';

let store;
let router;
let quizData = { quizzes: {} };
let currentQuizId = 0;
let currentQuestionIndex = 0;
let score = 0;

async function loadQuizData() {
    try {
        const response = await fetch('data/quizzes.json');
        if (!response.ok) {
            throw new Error('Failed to load quiz data');
        }
        quizData = await response.json();
    } catch (error) {
        console.error(error);
    }
}

export function initializeQuiz() {
    store = Store.getInstance();
    router = Router.getInstance();

    const container = document.getElementById('page-quiz');
    if (!container) return;

    loadQuizData().then(() => {
        renderQuizPage(container);
        setupQuizEvents(container);
        console.log('🧠 Quiz initialized');
    });
}

function setupQuizEvents(container) {
    if (container.__quizEventsAttached) {
        return;
    }
    container.__quizEventsAttached = true;

    container.addEventListener('click', (event) => {
        const quizSelect = event.target.closest('[data-quiz]');
        const nextBtn = event.target.closest('#quiz-next');
        const resetBtn = event.target.closest('#quiz-reset');
        const optionBtn = event.target.closest('.quiz-option');

        if (quizSelect) {
            currentQuizId = parseInt(quizSelect.dataset.quiz, 10);
            currentQuestionIndex = 0;
            score = 0;
            renderQuizPage(container);
            return;
        }

        if (nextBtn) {
            handleNextQuestion(container);
            return;
        }

        if (resetBtn) {
            currentQuestionIndex = 0;
            score = 0;
            renderQuizPage(container);
            return;
        }

        if (optionBtn) {
            handleOptionSelection(optionBtn, container);
            return;
        }
    });
}

function renderQuizPage(container) {
    const completedLessons = store.get('completedLessons', []).length;
    const totalLessons = 48;
    const userXp = store.get('xp', 0);
    const userCoins = store.get('coins', 0);
    const currentLesson = currentQuizId + 1;

    container.innerHTML = `
        <div class="container">
            <div class="page-header">
                <h1>🧠 JavaScript Quiz</h1>
                <p>Test your skills with quick challenges and earn XP.</p>
            </div>

            <div class="quiz-overview-grid">
                <div class="quiz-stat-card">
                    <span class="quiz-stat-label">Total XP</span>
                    <span class="quiz-stat-value">${userXp}</span>
                </div>
                <div class="quiz-stat-card">
                    <span class="quiz-stat-label">Coins</span>
                    <span class="quiz-stat-value">${userCoins}</span>
                </div>
                <div class="quiz-stat-card">
                    <span class="quiz-stat-label">Lessons Completed</span>
                    <span class="quiz-stat-value">${completedLessons}/${totalLessons}</span>
                </div>
                <div class="quiz-stat-card">
                    <span class="quiz-stat-label">Quizzes Available</span>
                    <span class="quiz-stat-value">${Object.keys(quizData.quizzes).length}</span>
                </div>
            </div>

            <div class="quiz-body">
                <div class="quiz-sidebar">
                    <div class="quiz-sidebar-header">
                        <h2>Choose a quiz</h2>
                        <p class="quiz-sidebar-info">Selected: Lesson ${currentLesson}</p>
                    </div>
                    <div class="quiz-list" id="quiz-list">
                        ${renderQuizList()}
                    </div>
                </div>

                <div class="quiz-main" id="quiz-main">
                    ${renderQuestionArea()}
                </div>
            </div>
        </div>
    `;
}

function renderQuizList() {
    const quizzes = quizData.quizzes || {};
    const lessonCount = Object.keys(quizzes).length;
    if (lessonCount === 0) {
        return `<div class="card"><p>No quizzes available yet.</p></div>`;
    }

    return Object.keys(quizzes).map(key => {
        const lessonId = parseInt(key, 10);
        const lessonNumber = lessonId + 1;
        const activeClass = lessonId === currentQuizId ? ' active' : '';
        return `
            <button class="quiz-list-item${activeClass}" data-quiz="${key}">
                <span>Lesson ${lessonNumber}</span>
                <small>${quizzes[key].length} questions</small>
            </button>
        `;
    }).join('');
}

function renderQuestionArea() {
    const quiz = quizData.quizzes[currentQuizId] || [];
    if (quiz.length === 0) {
        return `
            <div class="card quiz-empty">
                <h2>Select a quiz from the list</h2>
                <p>Pick a lesson quiz to begin testing your knowledge.</p>
            </div>
        `;
    }

    const question = quiz[currentQuestionIndex];
    if (!question) {
        return `
            <div class="card quiz-empty">
                <h2>No question found</h2>
                <p>Please select a different lesson quiz.</p>
            </div>
        `;
    }

    const options = shuffle([...question.options]);
    const letters = ['A', 'B', 'C', 'D'];

    return `
        <div class="quiz-question-card">
            <div class="quiz-question-header">
                <div>
                    <span class="quiz-badge">Question ${currentQuestionIndex + 1}/${quiz.length}</span>
                    <h2>${question.question}</h2>
                </div>
                <div class="quiz-question-meta">⭐ ${question.xp || 10} XP</div>
            </div>

            <div class="quiz-options" id="quiz-options">
                ${options.map((option, index) => `
                    <button class="quiz-option" data-correct="${option === question.correct}">
                        <span>${letters[index]}</span>
                        <span>${option}</span>
                    </button>
                `).join('')}
            </div>

            <div class="quiz-footer">
                <button class="btn btn-secondary" id="quiz-reset">Reset</button>
                <button class="btn btn-primary" id="quiz-next" disabled>Next</button>
            </div>
            <div class="quiz-result" id="quiz-result"></div>
        </div>
    `;
}

function handleOptionSelection(optionEl, container) {
    const quiz = quizData.quizzes[currentQuizId] || [];
    const question = quiz[currentQuestionIndex];
    const resultEl = container.querySelector('#quiz-result');
    const nextBtn = container.querySelector('#quiz-next');
    const optionButtons = container.querySelectorAll('.quiz-option');

    if (!question || !optionEl || !resultEl) return;

    optionButtons.forEach(btn => btn.disabled = true);
    optionButtons.forEach(btn => btn.classList.remove('correct', 'wrong', 'selected'));
    optionEl.classList.add('selected');

    const isCorrect = optionEl.dataset.correct === 'true';
    if (isCorrect) {
        optionEl.classList.add('correct');
        score += question.xp || 10;
        store.addXP(question.xp || 10);
        resultEl.textContent = '✅ Correct! Great work.';
        resultEl.className = 'quiz-result correct';
    } else {
        optionEl.classList.add('wrong');
        resultEl.textContent = '❌ Incorrect. The correct answer is highlighted.';
        resultEl.className = 'quiz-result wrong';
        optionButtons.forEach(btn => {
            if (btn.dataset.correct === 'true') {
                btn.classList.add('correct');
            }
        });
    }

    if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.textContent = currentQuestionIndex < quiz.length - 1 ? 'Next Question →' : 'Finish Quiz';
    }
}

function handleNextQuestion(container) {
    const quiz = quizData.quizzes[currentQuizId] || [];
    if (currentQuestionIndex < quiz.length - 1) {
        currentQuestionIndex += 1;
        renderQuizPage(container);
        setupQuizEvents(container);
    } else {
        const quizScore = score;
        const totalXp = quiz.reduce((sum, q) => sum + (q.xp || 10), 0);
        const percent = Math.round((quizScore / totalXp) * 100);
        const summary = percent >= 70 ? 'Great job!' : 'Nice effort!';

        container.querySelector('.quiz-main').innerHTML = `
            <div class="card quiz-summary">
                <h2>${summary}</h2>
                <p>You scored ${quizScore} XP out of ${totalXp} XP.</p>
                <p>Your final score: ${Math.round((quizScore / totalXp) * 100)}%</p>
                <button class="btn btn-primary" id="quiz-reset">Try another quiz</button>
            </div>
        `;
        setupQuizEvents(container);
    }
}
