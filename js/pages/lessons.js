/**
 * Lessons - Complete lesson management system
 */

import { Store } from '../store.js';
import { Router } from '../router.js';
import { capitalize, shuffle } from '../utils/helpers.js';
import { animate, slideIn, bounce } from '../utils/animations.js';

let lessonData = { lessons: [] };
let quizData = { quizzes: [] };
let store;
let router;
let currentLessonId = 0;
let currentQuizIndex = 0;
let quizScore = 0;
let quizAnswered = false;
let flashcardsFlipped = new Set();

async function loadLessonData() {
    try {
        const [lessonsResponse, quizzesResponse] = await Promise.all([
            fetch('data/lessons.json'),
            fetch('data/quizzes.json')
        ]);

        if (!lessonsResponse.ok || !quizzesResponse.ok) {
            throw new Error('Failed to load lesson or quiz data');
        }

        lessonData = await lessonsResponse.json();
        quizData = await quizzesResponse.json();
    } catch (error) {
        console.error('Failed to load lesson or quiz data:', error);
    }
}

/**
 * Initialize the lessons page
 */
export function initializeLessons() {
    store = Store.getInstance();
    router = Router.getInstance();

    const container = document.getElementById('page-lessons');
    if (!container) return;

    loadLessonData().then(() => {
        renderLessonList(container);
        setupLessonListEvents(container);

        // Listen for load lesson events
        document.addEventListener('load-lesson', (e) => {
            if (e.detail && e.detail.lessonId !== undefined) {
                renderLesson(container, e.detail.lessonId);
            }
        });

        console.log('📚 Lessons initialized');
    }).catch(error => {
        console.error('Failed to initialize lessons:', error);
        container.innerHTML = '<div class="container"><p>Failed to load lessons data.</p></div>';
    });
}

/**
 * Render the lesson list
 */
function renderLessonList(container) {
    const completed = store.get('completedLessons', []);
    const unlocked = store.get('unlockedLessons', [0]);
    const lessons = lessonData.lessons;

    let html = `
        <div class="container">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-xl);">
                <div>
                    <h1>📚 All Lessons</h1>
                    <p style="color: var(--text-secondary);">
                        ${completed.length} of ${lessons.length} lessons completed
                    </p>
                </div>
                <div style="display: flex; gap: var(--spacing-sm);">
                    <button class="btn btn-primary" id="continue-lesson-btn">
                        📖 Continue Learning
                    </button>
                </div>
            </div>

            <div class="lesson-list">
    `;

    lessons.forEach((lesson, index) => {
        const isCompleted = completed.includes(index);
        const isUnlocked = unlocked.includes(index);
        const status = isCompleted ? 'completed' : isUnlocked ? 'unlocked' : 'locked';
        const statusIcon = isCompleted ? '✅' : isUnlocked ? '📖' : '🔒';

        html += `
            <div class="lesson-card ${status}" data-lesson="${index}" data-status="${status}">
                <div class="lesson-card-header">
                    <span class="lesson-number">Lesson ${index + 1}</span>
                    <span class="lesson-status">${statusIcon}</span>
                </div>
                <h4>${lesson.title}</h4>
                <p>${lesson.description || 'Learn the fundamentals of JavaScript'}</p>
                <div class="lesson-meta">
                    <span>⭐ +${lesson.xp || 50} XP</span>
                    <span>🪙 +${lesson.coins || 20} Coins</span>
                    ${isCompleted ? '<span style="color: var(--success);">✅ Completed</span>' : ''}
                    ${!isUnlocked ? '<span style="color: var(--text-tertiary);">🔒 Locked</span>' : ''}
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Setup lesson list events
 */
function setupLessonListEvents(container) {
    // Continue learning button
    const continueBtn = container.querySelector('#continue-lesson-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            const completed = store.get('completedLessons', []);
            const unlocked = store.get('unlockedLessons', [0]);
            let nextLesson = 0;
            
            // Find first unlocked but not completed lesson
            for (const id of unlocked) {
                if (!completed.includes(id)) {
                    nextLesson = id;
                    break;
                }
            }
            
            // If all unlocked are completed, find next locked lesson
            if (nextLesson === 0 && unlocked.length > 0) {
                // Check if there are more lessons
                const totalLessons = lessonData.lessons.length;
                const lastUnlocked = unlocked[unlocked.length - 1];
                if (lastUnlocked < totalLessons - 1) {
                    nextLesson = lastUnlocked + 1;
                } else {
                    // All lessons completed!
                    showToast('🎉 You\'ve completed all lessons!', 'success');
                    return;
                }
            }
            
            renderLesson(container, nextLesson);
        });
    }

    // Lesson cards
    const cards = container.querySelectorAll('.lesson-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const index = parseInt(card.dataset.lesson);
            const status = card.dataset.status;
            
            if (status === 'locked') {
                showToast('🔒 Complete previous lessons to unlock this one.', 'warning');
                return;
            }
            
            renderLesson(container, index);
        });
    });
}

/**
 * Render a specific lesson
 */
function renderLesson(container, lessonId) {
    const lessons = lessonData.lessons;
    const lesson = lessons[lessonId];
    
    if (!lesson) {
        showToast('Lesson not found', 'error');
        renderLessonList(container);
        return;
    }

    currentLessonId = lessonId;
    currentQuizIndex = 0;
    quizScore = 0;
    quizAnswered = false;
    flashcardsFlipped = new Set();

    const completed = store.get('completedLessons', []);
    const isCompleted = completed.includes(lessonId);
    const unlocked = store.get('unlockedLessons', [0]);
    const isUnlocked = unlocked.includes(lessonId);

    // Get quiz for this lesson
    const quiz = quizData.quizzes[lessonId] || null;

    let html = `
        <div class="lesson-container">
            <!-- Navigation -->
            <div class="lesson-nav">
                <button class="btn btn-secondary" id="back-to-lessons">
                    ← Back to Lessons
                </button>
                <span class="lesson-counter">Lesson ${lessonId + 1} of ${lessons.length}</span>
                <div class="nav-buttons">
                    ${lessonId > 0 ? `<button class="btn btn-secondary" id="prev-lesson">← Previous</button>` : ''}
                    ${lessonId < lessons.length - 1 ? `<button class="btn btn-secondary" id="next-lesson">Next →</button>` : ''}
                </div>
            </div>

            <!-- Lesson Header -->
            <div class="lesson-header">
                <div class="lesson-badge">${isCompleted ? '✅ Completed' : isUnlocked ? '📖 Available' : '🔒 Locked'}</div>
                <h1>${lesson.title}</h1>
                <p style="color: var(--text-secondary);">${lesson.description || ''}</p>
                <div class="lesson-meta">
                    <span>⭐ ${lesson.xp || 50} XP</span>
                    <span>🪙 ${lesson.coins || 20} Coins</span>
                    <span>⏱️ ${lesson.duration || '10'} min</span>
                    <span>📊 ${isCompleted ? 'Completed' : 'In Progress'}</span>
                </div>
                <div class="lesson-progress">
                    <div class="lesson-progress-bar" style="width: ${isCompleted ? 100 : 0}%"></div>
                </div>
            </div>

            <!-- Lesson Content -->
            <div class="lesson-content" id="lesson-content">
                ${renderLessonContent(lesson, isCompleted)}
            </div>

            <!-- Lesson Actions -->
            <div class="lesson-actions" id="lesson-actions">
                ${!isCompleted && isUnlocked ? `
                    <button class="btn btn-success" id="complete-lesson-btn">
                        ✅ Complete Lesson
                    </button>
                ` : ''}
                ${isCompleted ? `
                    <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                        <span style="color: var(--success); font-weight: 600;">✅ Lesson Complete!</span>
                        <button class="btn btn-primary" id="review-lesson-btn">🔄 Review</button>
                    </div>
                ` : ''}
                <button class="btn btn-secondary" id="practice-playground">
                    💻 Practice in Playground
                </button>
            </div>
        </div>
    `;

    container.innerHTML = html;
    setupLessonEvents(container, lessonId);
    
    // Animate content
    const content = container.querySelector('#lesson-content');
    if (content) {
        slideIn(content, 'up', 300);
    }
}

/**
 * Render lesson content
 */
function renderLessonContent(lesson, isCompleted) {
    let html = '';

    // Mission
    if (lesson.mission) {
        html += `
            <div class="section">
                <div class="section-title"><span class="icon">🎯</span> Mission</div>
                <p class="section-description">${lesson.mission}</p>
            </div>
        `;
    }

    // Objectives
    if (lesson.objectives && lesson.objectives.length > 0) {
        html += `
            <div class="section">
                <div class="section-title"><span class="icon">✅</span> Objectives</div>
                <ul style="list-style: none; padding: 0;">
        `;
        lesson.objectives.forEach(obj => {
            html += `<li style="padding: var(--spacing-xs) 0; display: flex; align-items: center; gap: var(--spacing-sm);">
                <span style="color: var(--primary);">▸</span> ${obj}
            </li>`;
        });
        html += `
                </ul>
            </div>
        `;
    }

    // Story / Real Life Example
    if (lesson.story) {
        html += `
            <div class="section">
                <div class="section-title"><span class="icon">📖</span> Real Life Story</div>
                <div class="story-block">
                    <div class="story-title">💡 ${lesson.storyTitle || 'Real World Connection'}</div>
                    <p>${lesson.story}</p>
                </div>
            </div>
        `;
    }

    // Real Life Comparison
    if (lesson.comparisons && lesson.comparisons.length > 0) {
        html += `
            <div class="section">
                <div class="section-title"><span class="icon">🔄</span> Real Life Comparison</div>
                <div class="comparison-grid">
        `;
        lesson.comparisons.forEach(comp => {
            html += `
                <div class="comparison-item">
                    <div class="comparison-icon">${comp.icon || '📦'}</div>
                    <div style="font-weight: 600; margin-bottom: var(--spacing-xs);">${comp.concept}</div>
                    <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">${comp.example}</div>
                </div>
            `;
        });
        html += `
                </div>
            </div>
        `;
    }

    // Explanation
    if (lesson.explanation) {
        html += `
            <div class="section">
                <div class="section-title"><span class="icon">💡</span> Simple Explanation</div>
                <div class="section-description">${lesson.explanation}</div>
            </div>
        `;
    }

    // Code Walkthrough
    if (lesson.codeExamples && lesson.codeExamples.length > 0) {
        html += `
            <div class="section">
                <div class="section-title"><span class="icon">💻</span> Code Walkthrough</div>
        `;
        lesson.codeExamples.forEach((example, idx) => {
            html += `
                <div class="code-example">
                    <div class="code-label">
                        <span>${example.title || `Example ${idx + 1}`}</span>
                        <button class="copy-btn" data-code="${example.code.replace(/"/g, '&quot;')}">📋 Copy</button>
                    </div>
                    <pre><code>${highlightSyntax(example.code)}</code></pre>
                    ${example.explanation ? `<p style="margin-top: var(--spacing-sm); font-size: var(--font-size-sm); color: var(--text-secondary);">${example.explanation}</p>` : ''}
                </div>
            `;
        });
        html += `
            </div>
        `;
    }

    // Interactive Example
    if (lesson.interactiveExample) {
        html += `
            <div class="section">
                <div class="section-title"><span class="icon">🎮</span> Try It Yourself</div>
                <div class="interactive-example">
                    <p style="margin-bottom: var(--spacing-md);">${lesson.interactiveExample.description || 'Click the button to see the code in action!'}</p>
                    <button class="btn btn-primary" id="interactive-btn">
                        ▶️ Run Interactive Example
                    </button>
                    <div class="example-output" id="interactive-output">
                        <span style="color: var(--text-tertiary);">Click the button to see output...</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Flashcards
    if (lesson.flashcards && lesson.flashcards.length > 0) {
        html += `
            <div class="section">
                <div class="section-title"><span class="icon">🃏</span> Flashcards</div>
                <p class="section-description">Click each card to flip it and test your knowledge.</p>
                <div class="flashcard-container">
        `;
        lesson.flashcards.forEach((card, idx) => {
            html += `
                <div class="flashcard" data-flashcard="${idx}" id="flashcard-${idx}">
                    <div class="flashcard-inner">
                        <div class="flashcard-front">
                            <div style="font-size: var(--font-size-2xl); margin-bottom: var(--spacing-sm);">${card.icon || '📝'}</div>
                            <div style="font-weight: 600; font-size: var(--font-size-lg);">${card.question}</div>
                            <div class="card-hint">👆 Click to reveal answer</div>
                        </div>
                        <div class="flashcard-back">
                            <div style="font-size: var(--font-size-3xl); margin-bottom: var(--spacing-sm);">💡</div>
                            <div style="font-size: var(--font-size-lg);">${card.answer}</div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `
                </div>
            </div>
        `;
    }

    // Quiz
    if (lesson.quiz && lesson.quiz.length > 0) {
        html += `
            <div class="section">
                <div class="section-title"><span class="icon">📝</span> Quick Quiz</div>
                <div id="quiz-container">
                    ${renderQuiz(lesson.quiz, 0)}
                </div>
            </div>
        `;
    }

    // Summary
    if (lesson.summary) {
        html += `
            <div class="section">
                <div class="section-title"><span class="icon">📌</span> Summary</div>
                <div class="section-description">${lesson.summary}</div>
            </div>
        `;
    }

    return html;
}

/**
 * Render a quiz
 */
function renderQuiz(quiz, index) {
    if (!quiz || index >= quiz.length) {
        return `<div style="text-align: center; padding: var(--spacing-xl); color: var(--text-tertiary);">🎉 All questions answered!</div>`;
    }

    const question = quiz[index];
    const letters = ['A', 'B', 'C', 'D'];

    let html = `
        <div class="quiz-section" id="quiz-section">
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-md);">
                <span style="font-weight: 600;">Question ${index + 1} of ${quiz.length}</span>
                <span style="color: var(--text-secondary);">⭐ ${question.xp || 10} XP</span>
            </div>
            <div class="quiz-question">${question.question}</div>
            <div class="quiz-options" id="quiz-options">
    `;

    const options = shuffle([...question.options]);
    options.forEach((option, idx) => {
        const letter = letters[idx];
        html += `
            <div class="quiz-option" data-option="${letter}" data-correct="${option === question.correct}">
                <span class="option-letter">${letter}</span>
                <span class="option-text">${option}</span>
            </div>
        `;
    });

    html += `
            </div>
            <div id="quiz-result"></div>
            <div style="margin-top: var(--spacing-md); display: flex; gap: var(--spacing-sm);">
                <button class="btn btn-secondary" id="quiz-next" style="display: none;">Next Question →</button>
                <button class="btn btn-primary" id="quiz-submit" style="display: none;">Submit Answer</button>
            </div>
        </div>
    `;

    return html;
}

/**
 * Setup lesson events
 */
function setupLessonEvents(container, lessonId) {
    // Back to lessons
    const backBtn = container.querySelector('#back-to-lessons');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            renderLessonList(container);
        });
    }

    // Previous lesson
    const prevBtn = container.querySelector('#prev-lesson');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (lessonId > 0) {
                renderLesson(container, lessonId - 1);
            }
        });
    }

    // Next lesson
    const nextBtn = container.querySelector('#next-lesson');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const unlocked = store.get('unlockedLessons', [0]);
            if (unlocked.includes(lessonId + 1)) {
                renderLesson(container, lessonId + 1);
            } else {
                showToast('🔒 Complete this lesson to unlock the next one.', 'warning');
            }
        });
    }

    // Practice in playground
    const practiceBtn = container.querySelector('#practice-playground');
    if (practiceBtn) {
        practiceBtn.addEventListener('click', () => {
            router.navigate('playground');
            // Load lesson code into playground
            const lessons = lessonData.lessons;
            const lesson = lessons[lessonId];
            if (lesson && lesson.codeExamples && lesson.codeExamples.length > 0) {
                const event = new CustomEvent('load-code', {
                    detail: { code: lesson.codeExamples[0].code }
                });
                document.dispatchEvent(event);
            }
        });
    }

    // Complete lesson
    const completeBtn = container.querySelector('#complete-lesson-btn');
    if (completeBtn) {
        completeBtn.addEventListener('click', () => {
            completeLesson(container, lessonId);
        });
    }

    // Review lesson
    const reviewBtn = container.querySelector('#review-lesson-btn');
    if (reviewBtn) {
        reviewBtn.addEventListener('click', () => {
            // Re-render lesson content
            const lessons = lessonData.lessons;
            const lesson = lessons[lessonId];
            const content = container.querySelector('#lesson-content');
            if (content) {
                content.innerHTML = renderLessonContent(lesson, false);
                setupInteractiveExample(content, lessonId);
                setupFlashcards(content);
                setupQuiz(container, lessonId);
            }
        });
    }

    // Interactive example
    setupInteractiveExample(container, lessonId);

    // Flashcards
    setupFlashcards(container);

    // Quiz
    setupQuiz(container, lessonId);

    // Copy code buttons
    const copyBtns = container.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.dataset.code;
            if (code) {
                navigator.clipboard.writeText(code).then(() => {
                    const originalText = btn.textContent;
                    btn.textContent = '✅ Copied!';
                    setTimeout(() => {
                        btn.textContent = originalText;
                    }, 2000);
                }).catch(() => {
                    // Fallback
                    const textarea = document.createElement('textarea');
                    textarea.value = code;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    textarea.remove();
                    const originalText = btn.textContent;
                    btn.textContent = '✅ Copied!';
                    setTimeout(() => {
                        btn.textContent = originalText;
                    }, 2000);
                });
            }
        });
    });
}

/**
 * Setup interactive example
 */
function setupInteractiveExample(container, lessonId) {
    const btn = container.querySelector('#interactive-btn');
    if (!btn) return;

    const output = container.querySelector('#interactive-output');
    if (!output) return;

    const lessons = lessonData.lessons;
    const lesson = lessons[lessonId];

    btn.addEventListener('click', () => {
        if (lesson.interactiveExample && lesson.interactiveExample.code) {
            try {
                // Execute the code
                const result = eval(lesson.interactiveExample.code);
                output.innerHTML = result !== undefined ? result : '✅ Code executed successfully!';
                output.style.color = 'var(--text-primary)';
                animate(output, 'fadeIn', 300);
            } catch (error) {
                output.innerHTML = `❌ Error: ${error.message}`;
                output.style.color = 'var(--danger)';
            }
        } else {
            output.innerHTML = '💡 No code to execute. Try the playground!';
            output.style.color = 'var(--text-secondary)';
        }
    });
}

/**
 * Setup flashcards
 */
function setupFlashcards(container) {
    const flashcards = container.querySelectorAll('.flashcard');
    flashcards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
            const id = card.dataset.flashcard;
            if (card.classList.contains('flipped')) {
                flashcardsFlipped.add(id);
            } else {
                flashcardsFlipped.delete(id);
            }
        });
    });
}

/**
 * Setup quiz
 */
function setupQuiz(container, lessonId) {
    const lessons = lessonData.lessons;
    const lesson = lessons[lessonId];
    
    if (!lesson || !lesson.quiz || lesson.quiz.length === 0) return;

    const quizContainer = container.querySelector('#quiz-container');
    if (!quizContainer) return;

    // Handle quiz options
    const options = container.querySelectorAll('.quiz-option');
    const submitBtn = container.querySelector('#quiz-submit');
    const nextBtn = container.querySelector('#quiz-next');
    const resultDiv = container.querySelector('#quiz-result');

    let selectedOption = null;
    let answered = false;

    options.forEach(option => {
        option.addEventListener('click', () => {
            if (answered) return;
            
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedOption = option;
            
            if (submitBtn) {
                submitBtn.style.display = 'inline-flex';
            }
        });
    });

    // Submit button
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (!selectedOption || answered) return;
            
            const isCorrect = selectedOption.dataset.correct === 'true';
            answered = true;
            
            if (isCorrect) {
                selectedOption.classList.add('correct');
                quizScore++;
                const xp = lesson.quiz[currentQuizIndex]?.xp || 10;
                store.addXP(xp);
                showToast(`✅ Correct! +${xp} XP`, 'success');
            } else {
                selectedOption.classList.add('wrong');
                options.forEach(opt => {
                    if (opt.dataset.correct === 'true') {
                        opt.classList.add('correct');
                    }
                });
                showToast('❌ Not quite. Try again!', 'error');
            }
            
            if (resultDiv) {
                resultDiv.className = `quiz-result ${isCorrect ? 'correct' : 'wrong'}`;
                resultDiv.textContent = isCorrect ? '✅ Correct! Well done!' : '❌ Incorrect. The correct answer is highlighted.';
            }
            
            submitBtn.style.display = 'none';
            
            // Show next button if there are more questions
            if (currentQuizIndex < lesson.quiz.length - 1) {
                if (nextBtn) {
                    nextBtn.style.display = 'inline-flex';
                }
            } else {
                // All questions answered
                const totalQuestions = lesson.quiz.length;
                const percentage = Math.round((quizScore / totalQuestions) * 100);
                
                setTimeout(() => {
                    if (resultDiv) {
                        resultDiv.className = `quiz-result ${percentage >= 70 ? 'correct' : 'wrong'}`;
                        resultDiv.innerHTML = `
                            <div style="font-size: var(--font-size-2xl); margin-bottom: var(--spacing-sm);">
                                ${percentage >= 70 ? '🎉' : '💪'}
                            </div>
                            <div>Quiz Complete!</div>
                            <div style="font-size: var(--font-size-sm);">Score: ${quizScore}/${totalQuestions} (${percentage}%)</div>
                            ${percentage >= 70 ? '<div style="font-size: var(--font-size-sm); margin-top: var(--spacing-xs);">⭐ +${lesson.quiz.reduce((sum, q) => sum + (q.xp || 10), 0)} XP earned!</div>' : ''}
                        `;
                    }
                    if (nextBtn) {
                        nextBtn.textContent = '🔄 Review Quiz';
                        nextBtn.style.display = 'inline-flex';
                        nextBtn.onclick = () => {
                            // Reset quiz
                            currentQuizIndex = 0;
                            quizScore = 0;
                            answered = false;
                            selectedOption = null;
                            quizContainer.innerHTML = renderQuiz(lesson.quiz, 0);
                            setupQuiz(container, lessonId);
                        };
                    }
                }, 1000);
            }
        });
    }

    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentQuizIndex++;
            answered = false;
            selectedOption = null;
            quizContainer.innerHTML = renderQuiz(lesson.quiz, currentQuizIndex);
            setupQuiz(container, lessonId);
        });
    }
}

/**
 * Complete a lesson
 */
function completeLesson(container, lessonId) {
    const lessons = lessonData.lessons;
    const lesson = lessons[lessonId];
    
    // Check if quiz was completed
    if (lesson.quiz && lesson.quiz.length > 0) {
        // Check if all quiz questions were answered
        const quizContainer = container.querySelector('#quiz-container');
        if (quizContainer) {
            // Simple check - if quiz result doesn't show completion
            const result = quizContainer.querySelector('.quiz-result');
            if (!result || !result.textContent.includes('Quiz Complete')) {
                showToast('📝 Complete the quiz first!', 'warning');
                return;
            }
        }
    }

    // Add XP and Coins
    const xp = lesson.xp || 50;
    const coins = lesson.coins || 20;
    store.addXP(xp);
    store.addCoins(coins);
    store.completeLesson(lessonId);

    // Check achievements
    checkAchievements();

    // Show completion message
    const actions = container.querySelector('#lesson-actions');
    if (actions) {
        actions.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: var(--spacing-md); width: 100%;">
                <div class="lesson-complete">
                    <div class="complete-icon">🎉</div>
                    <h2>Lesson Complete!</h2>
                    <p style="color: var(--text-secondary);">Great job! You've mastered ${lesson.title}</p>
                    <div class="reward-summary">
                        <div class="reward-item">
                            <span class="reward-value" style="color: var(--warning);">+${xp}</span>
                            <span class="reward-label">XP Earned</span>
                        </div>
                        <div class="reward-item">
                            <span class="reward-value" style="color: var(--warning);">+${coins}</span>
                            <span class="reward-label">Coins Earned</span>
                        </div>
                        <div class="reward-item">
                            <span class="reward-value" style="color: var(--success);">✅</span>
                            <span class="reward-label">Completed</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" id="next-lesson-complete">
                        📚 Continue Learning
                    </button>
                </div>
            </div>
        `;

        const continueBtn = actions.querySelector('#next-lesson-complete');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                // Find next unlocked lesson
                const completed = store.get('completedLessons', []);
                const unlocked = store.get('unlockedLessons', [0]);
                let nextLesson = 0;
                
                for (const id of unlocked) {
                    if (!completed.includes(id)) {
                        nextLesson = id;
                        break;
                    }
                }
                
                if (nextLesson === 0) {
                    // Check if there are more lessons
                    const totalLessons = lessonData.lessons.length;
                    const lastUnlocked = unlocked[unlocked.length - 1];
                    if (lastUnlocked < totalLessons - 1) {
                        nextLesson = lastUnlocked + 1;
                    } else {
                        showToast('🎉 Congratulations! You\'ve completed all lessons!', 'success');
                        renderLessonList(container);
                        return;
                    }
                }
                
                renderLesson(container, nextLesson);
            });
        }

        // Update header
        const header = container.querySelector('.lesson-header');
        if (header) {
            const badge = header.querySelector('.lesson-badge');
            if (badge) {
                badge.textContent = '✅ Completed';
                badge.style.background = 'var(--success)';
            }
            const progressBar = header.querySelector('.lesson-progress-bar');
            if (progressBar) {
                progressBar.style.width = '100%';
            }
        }
    }

    showToast(`🎉 Lesson Complete! +${xp} XP, +${coins} Coins`, 'success');
    bounce(container.querySelector('.lesson-complete'));
}

/**
 * Check and unlock achievements
 */
function checkAchievements() {
    const completed = store.get('completedLessons', []).length;
    const streak = store.get('streak', 0);
    const coins = store.get('coins', 0);
    const xp = store.get('xp', 0);

    // Lesson count achievements
    if (completed >= 1) store.addAchievement('first_lesson');
    if (completed >= 5) store.addAchievement('five_lessons');
    if (completed >= 10) store.addAchievement('ten_lessons');
    if (completed >= 25) store.addAchievement('twenty_five_lessons');

    // Streak achievements
    if (streak >= 7) store.addAchievement('streak_7');
    if (streak >= 30) store.addAchievement('streak_30');

    // Coin achievements
    if (coins >= 100) store.addAchievement('coins_100');
    if (coins >= 500) store.addAchievement('coins_500');

    // XP achievements
    if (xp >= 1000) store.addAchievement('xp_1000');
    if (xp >= 5000) store.addAchievement('xp_5000');
}

/**
 * Highlight syntax (simple version)
 */
function highlightSyntax(code) {
    if (!code) return '';
    
    // Simple syntax highlighting
    let highlighted = code
        .replace(/\/\/.*/g, match => `<span class="comment">${match}</span>`)
        .replace(/\/\*[\s\S]*?\*\//g, match => `<span class="comment">${match}</span>`)
        .replace(/\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|try|catch|finally|throw|new|class|extends|super|import|export|default|from|async|await|yield)\b/g, match => `<span class="keyword">${match}</span>`)
        .replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g, match => `<span class="boolean">${match}</span>`)
        .replace(/".*?"|'.*?'|`.*?`/g, match => `<span class="string">${match}</span>`)
        .replace(/\b(\d+)\b/g, match => `<span class="number">${match}</span>`)
        .replace(/\b(console|document|window|Array|Object|String|Number|Boolean|Function|Promise)\b/g, match => `<span class="function">${match}</span>`);
    
    return highlighted;
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