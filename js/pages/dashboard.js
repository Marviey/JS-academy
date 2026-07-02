/**
 * Dashboard - Main dashboard page
 */

import { Store } from '../store.js';
import { Theme } from '../theme.js';
import { Router } from '../router.js';
import { formatTime, getRelativeTime, capitalize } from '../utils/helpers.js';
import { animate, slideIn, bounce } from '../utils/animations.js';

let store;
let router;
let theme;
let dashboardData = {};
let updateInterval = null;

/**
 * Initialize the dashboard
 */
export function initializeDashboard() {
    store = Store.getInstance();
    router = Router.getInstance();
    theme = Theme.getInstance();

    const container = document.getElementById('page-dashboard');
    if (!container) return;

    // Render dashboard
    renderDashboard(container);

    // Setup event listeners
    setupEventListeners(container);

    // Listen for refresh events
    document.addEventListener('refresh-dashboard', () => {
        refreshDashboard(container);
    });

    console.log('📊 Dashboard initialized');
}

/**
 * Render the dashboard
 */
function renderDashboard(container) {
    const data = getDashboardData();

    container.innerHTML = `
        <!-- Welcome Section -->
        <div class="welcome-section">
            <div class="welcome-text">
                <h1>👋 Welcome back, ${data.userName}!</h1>
                <p>Continue your JavaScript journey. You're doing great!</p>
            </div>
            <div class="welcome-actions">
                <button class="btn btn-primary" id="continue-learning-btn">
                    📚 Continue Learning
                </button>
                <button class="btn btn-secondary" id="quick-play-btn">
                    ⚡ Quick Challenge
                </button>
            </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
            ${createStatCard('⭐', 'Total XP', data.xp, `Level ${data.level}`, 'xp')}
            ${createStatCard('🪙', 'Coins', data.coins, `+${data.coinsEarnedToday} today`, 'coins')}
            ${createStatCard('📚', 'Lessons', data.completedLessons, `/ ${data.totalLessons} completed`, 'lessons')}
            ${createStatCard('🔥', 'Daily Streak', `${data.streak} days`, data.streak > 0 ? 'Keep going!' : 'Start your streak!', 'streak')}
        </div>

        <!-- Continue Learning -->
        ${createContinueLearning(data)}

        <!-- Dashboard Grid -->
        <div class="dashboard-grid">
            <!-- Main Column -->
            <div class="dashboard-main">
                <!-- Progress Ring -->
                ${createProgressRing(data)}

                <!-- Quick Challenge -->
                ${createQuickChallenge(data)}

                <!-- Upcoming Lessons -->
                ${createUpcomingLessons(data)}

                <!-- Achievements -->
                ${createAchievements(data)}
            </div>

            <!-- Sidebar Column -->
            <div class="dashboard-sidebar">
                <!-- Leaderboard -->
                ${createLeaderboard(data)}

                <!-- Badges -->
                ${createBadges(data)}

                <!-- Notifications -->
                ${createNotifications(data)}
            </div>
        </div>
    `;

    // Animate cards on load
    animateCards(container);
}

/**
 * Get dashboard data
 */
function getDashboardData() {
    const completedLessons = store.get('completedLessons', []);
    const totalLessons = 48; // Total lessons across all levels

    // Calculate XP needed for next level
    const currentXP = store.get('xp', 0);
    const currentLevel = store.get('level', 1);
    const xpForNextLevel = currentLevel * 100;
    const xpProgress = (currentXP % 100) / 100 * 100;

    // Get today's coins earned
    const today = new Date().toDateString();
    const progress = store.get('progress', {});
    let coinsEarnedToday = 0;
    for (const key in progress) {
        if (progress[key].completedAt) {
            const date = new Date(progress[key].completedAt).toDateString();
            if (date === today && progress[key].coins) {
                coinsEarnedToday += progress[key].coins || 0;
            }
        }
    }

    return {
        userName: store.get('user.name', 'Student'),
        xp: currentXP,
        coins: store.get('coins', 0),
        level: currentLevel,
        streak: store.get('streak', 0),
        completedLessons: completedLessons.length,
        totalLessons: totalLessons,
        xpProgress: xpProgress,
        xpForNextLevel: xpForNextLevel,
        coinsEarnedToday: coinsEarnedToday,
        currentLesson: getCurrentLesson(),
        achievements: store.get('achievements', []),
        badges: store.get('badges', []),
        notifications: getNotifications(),
        leaderboardData: getLeaderboardData()
    };
}

/**
 * Get current lesson
 */
function getCurrentLesson() {
    const completed = store.get('completedLessons', []);
    const unlocked = store.get('unlockedLessons', [0]);
    
    // Find the first unlocked but not completed lesson
    for (const id of unlocked) {
        if (!completed.includes(id)) {
            return id;
        }
    }
    // If all unlocked are completed, return the last completed
    return completed.length > 0 ? completed[completed.length - 1] : 0;
}

/**
 * Get notifications
 */
function getNotifications() {
    const notifications = [];
    const streak = store.get('streak', 0);

    // Streak notification
    if (streak > 0) {
        notifications.push({
            id: 'streak',
            icon: '🔥',
            title: `Daily Streak: ${streak} days`,
            message: `You're on a ${streak}-day learning streak! Keep it up!`,
            time: new Date().toISOString(),
            type: 'success'
        });
    }

    // Achievement notifications
    const achievements = store.get('achievements', []);
    const achievementNames = {
        'first_lesson': '🎓 First Lesson',
        'five_lessons': '🌟 Five Lessons',
        'ten_lessons': '💎 Ten Lessons',
        'twenty_five_lessons': '🏆 25 Lessons',
        'streak_7': '🔥 7-Day Streak',
        'streak_30': '⚡ 30-Day Streak'
    };

    achievements.forEach(id => {
        if (achievementNames[id]) {
            notifications.push({
                id: `achievement_${id}`,
                icon: '🏅',
                title: 'Achievement Unlocked!',
                message: `You earned "${achievementNames[id]}"`,
                time: new Date().toISOString(),
                type: 'success'
            });
        }
    });

    // Level up notifications
    const level = store.get('level', 1);
    if (level > 1) {
        notifications.push({
            id: 'level_up',
            icon: '⬆️',
            title: `Level ${level} Achieved!`,
            message: `You've reached level ${level}! Keep learning!`,
            time: new Date().toISOString(),
            type: 'success'
        });
    }

    return notifications.slice(0, 5); // Show latest 5
}

/**
 * Get leaderboard data (dummy data)
 */
function getLeaderboardData() {
    const names = [
        'Alex Johnson', 'Sarah Chen', 'Michael Kim', 
        'Emma Davis', 'James Wilson', 'Lisa Park',
        'David Lee', 'Maria Garcia', 'John Smith',
        'Jane Doe', 'Student', 'Coding Pro'
    ];

    const avatars = ['👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎓', '👩‍🎓', '🧑‍🎓'];

    const data = [];
    for (let i = 0; i < 10; i++) {
        const name = names[i % names.length];
        data.push({
            name: name,
            avatar: avatars[i % avatars.length],
            xp: Math.floor(Math.random() * 5000) + 1000,
            streak: Math.floor(Math.random() * 50) + 1,
            isCurrentUser: i === 0
        });
    }

    // Sort by XP
    data.sort((a, b) => b.xp - a.xp);

    // Add current user if not in list
    const currentUser = {
        name: store.get('user.name', 'Student'),
        avatar: store.get('user.avatar', '👨‍🎓'),
        xp: store.get('xp', 0),
        streak: store.get('streak', 0),
        isCurrentUser: true
    };

    // Check if user is already in list
    const userIndex = data.findIndex(d => d.name === currentUser.name);
    if (userIndex >= 0) {
        data[userIndex] = currentUser;
    } else {
        data.push(currentUser);
    }

    data.sort((a, b) => b.xp - a.xp);
    return data.slice(0, 10);
}

/**
 * Create a stat card
 */
function createStatCard(icon, label, value, subtitle, type) {
    return `
        <div class="stat-card" data-type="${type}">
            <div class="stat-icon ${type}">${icon}</div>
            <div class="stat-content">
                <div class="stat-label">${label}</div>
                <div class="stat-value">${value}</div>
                ${subtitle ? `<div class="stat-change positive">${subtitle}</div>` : ''}
            </div>
            <div class="stat-progress">
                <div class="stat-progress-bar" style="width: 100%"></div>
            </div>
        </div>
    `;
}

/**
 * Create continue learning section
 */
function createContinueLearning(data) {
    const lessonId = data.currentLesson;
    const lessonNames = [
        'Introduction to Programming',
        'JavaScript Introduction',
        'Variables',
        'Data Types',
        'Operators',
        'Conditions',
        'Loops',
        'Functions',
        'Arrays',
        'Objects',
        'DOM Manipulation',
        'Events',
        'Forms',
        'ES6 Features',
        'Modules',
        'Promises',
        'Async/Await',
        'Fetch API',
        'JSON',
        'Local Storage',
        'Error Handling',
        'OOP',
        'Classes',
        'Design Patterns',
        'Projects',
        'React Introduction',
        'JSX & Components',
        'Props & State',
        'Hooks',
        'React Router'
    ];

    const lessonName = lessonNames[lessonId] || 'Getting Started';
    const completed = store.get('completedLessons', []);
    const progress = Math.round((completed.length / data.totalLessons) * 100);

    return `
        <div class="continue-learning" id="continue-learning">
            <div class="learning-content">
                <div class="learning-badge">📖 Continue Learning</div>
                <h3>${lessonName}</h3>
                <p>Complete this lesson to earn XP and unlock the next level.</p>
                <div class="learning-meta">
                    <span>📚 Lesson ${lessonId + 1} of ${data.totalLessons}</span>
                    <span>⭐ +50 XP</span>
                    <span>🪙 +20 Coins</span>
                </div>
                <div class="learning-progress">
                    <div class="learning-progress-bar">
                        <div class="learning-progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="learning-progress-text">${progress}%</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Create progress ring
 */
function createProgressRing(data) {
    const completed = store.get('completedLessons', []);
    const total = data.totalLessons;
    const percentage = Math.round((completed.length / total) * 100);
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;

    return `
        <div class="progress-ring-widget">
            <div class="ring-wrapper">
                <div class="progress-ring">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" class="bg"/>
                        <circle cx="50" cy="50" r="45" class="progress" 
                                stroke-dasharray="${circumference}" 
                                stroke-dashoffset="${offset}"/>
                    </svg>
                    <div class="label">${percentage}%</div>
                </div>
            </div>
            <div class="ring-info">
                <h4>Course Progress</h4>
                <p>${completed.length} of ${total} lessons completed</p>
                <div style="margin-top: var(--spacing-sm); display: flex; gap: var(--spacing-md);">
                    <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                        ⭐ Level ${data.level}
                    </span>
                    <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                        🔥 ${data.streak} day streak
                    </span>
                </div>
                <div style="margin-top: var(--spacing-sm);">
                    <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                        XP to next level: ${Math.round(100 - data.xpProgress)} / 100
                    </div>
                    <div style="height: 4px; background: var(--bg-tertiary); border-radius: var(--radius-full); margin-top: var(--spacing-xs); overflow: hidden;">
                        <div style="height: 100%; width: ${data.xpProgress}%; background: var(--primary-gradient); border-radius: var(--radius-full); transition: width var(--transition-slow);"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Create quick challenge
 */
function createQuickChallenge(data) {
    const challenges = [
        {
            title: 'Variable Challenge',
            description: 'Create a variable to store your name and display it.',
            difficulty: 'easy',
            xp: 30,
            coins: 15
        },
        {
            title: 'Loop Challenge',
            description: 'Write a loop that counts from 1 to 10.',
            difficulty: 'medium',
            xp: 50,
            coins: 25
        },
        {
            title: 'Function Challenge',
            description: 'Create a function that adds two numbers.',
            difficulty: 'easy',
            xp: 40,
            coins: 20
        },
        {
            title: 'Array Challenge',
            description: 'Find the largest number in an array.',
            difficulty: 'hard',
            xp: 70,
            coins: 35
        }
    ];

    const challenge = challenges[Math.floor(Math.random() * challenges.length)];

    return `
        <div class="quick-challenge">
            <div class="challenge-header">
                <span class="challenge-title">⚡ Quick Challenge</span>
                <span class="challenge-difficulty ${challenge.difficulty}">${capitalize(challenge.difficulty)}</span>
            </div>
            <h4>${challenge.title}</h4>
            <p class="challenge-description">${challenge.description}</p>
            <div class="challenge-actions">
                <button class="btn btn-primary btn-sm quick-challenge-btn" data-challenge='${JSON.stringify(challenge)}'>
                    🚀 Start Challenge
                </button>
                <span style="font-size: var(--font-size-sm); color: var(--text-secondary); display: flex; align-items: center; gap: var(--spacing-sm);">
                    <span>⭐ +${challenge.xp} XP</span>
                    <span>🪙 +${challenge.coins} Coins</span>
                </span>
            </div>
        </div>
    `;
}

/**
 * Create upcoming lessons
 */
function createUpcomingLessons(data) {
    const completed = store.get('completedLessons', []);
    const unlocked = store.get('unlockedLessons', [0]);
    const lessonNames = [
        'Introduction to Programming',
        'JavaScript Introduction',
        'Variables',
        'Data Types',
        'Operators',
        'Conditions',
        'Loops',
        'Functions',
        'Arrays',
        'Objects',
        'DOM Manipulation',
        'Events',
        'Forms',
        'ES6 Features',
        'Modules',
        'Promises',
        'Async/Await',
        'Fetch API',
        'JSON',
        'Local Storage',
        'Error Handling',
        'OOP',
        'Classes',
        'Design Patterns',
        'Projects',
        'React Introduction',
        'JSX & Components',
        'Props & State',
        'Hooks',
        'React Router'
    ];

    let html = `
        <div class="card">
            <div class="section-header">
                <span class="section-title">📚 Upcoming Lessons</span>
                <span class="section-action" id="view-all-lessons">View All →</span>
            </div>
    `;

    // Show next 5 lessons
    const startIdx = Math.max(0, data.currentLesson);
    const endIdx = Math.min(startIdx + 5, lessonNames.length);

    for (let i = startIdx; i < endIdx; i++) {
        const isCompleted = completed.includes(i);
        const isUnlocked = unlocked.includes(i);
        let status = 'locked';
        let statusText = '🔒 Locked';
        let statusClass = 'locked';

        if (isCompleted) {
            status = 'completed';
            statusText = '✅ Completed';
            statusClass = 'completed';
        } else if (isUnlocked) {
            status = 'in-progress';
            statusText = '📖 Available';
            statusClass = 'in-progress';
        }

        html += `
            <div class="upcoming-lesson" data-lesson="${i}">
                <div class="lesson-number ${status}">${i + 1}</div>
                <div class="lesson-info">
                    <div class="lesson-title">${lessonNames[i]}</div>
                    <div class="lesson-meta">${status === 'completed' ? '⭐ +50 XP' : status === 'in-progress' ? 'Ready to learn' : 'Complete previous to unlock'}</div>
                </div>
                <span class="lesson-status ${statusClass}">${statusText}</span>
            </div>
        `;
    }

    html += `</div>`;
    return html;
}

/**
 * Create achievements
 */
function createAchievements(data) {
    const achievements = store.get('achievements', []);
    const allAchievements = [
        { id: 'first_lesson', icon: '🎓', name: 'First Lesson', description: 'Complete your first lesson' },
        { id: 'five_lessons', icon: '🌟', name: 'Five Lessons', description: 'Complete 5 lessons' },
        { id: 'ten_lessons', icon: '💎', name: 'Ten Lessons', description: 'Complete 10 lessons' },
        { id: 'twenty_five_lessons', icon: '🏆', name: '25 Lessons', description: 'Complete 25 lessons' },
        { id: 'streak_7', icon: '🔥', name: '7-Day Streak', description: 'Maintain a 7-day streak' },
        { id: 'streak_30', icon: '⚡', name: '30-Day Streak', description: 'Maintain a 30-day streak' },
        { id: 'coins_100', icon: '🪙', name: 'Coin Collector', description: 'Earn 100 coins' },
        { id: 'coins_500', icon: '💰', name: 'Coin Master', description: 'Earn 500 coins' },
        { id: 'xp_1000', icon: '⭐', name: 'XP Warrior', description: 'Earn 1000 XP' },
        { id: 'xp_5000', icon: '👑', name: 'XP Legend', description: 'Earn 5000 XP' }
    ];

    const unlockedAchievements = allAchievements.filter(a => achievements.includes(a.id));
    const lockedAchievements = allAchievements.filter(a => !achievements.includes(a.id));

    let html = `
        <div class="achievements-section">
            <div class="section-header">
                <span class="section-title">🏅 Achievements</span>
                <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                    ${unlockedAchievements.length}/${allAchievements.length}
                </span>
            </div>
    `;

    // Show unlocked achievements
    if (unlockedAchievements.length > 0) {
        html += `<div style="margin-bottom: var(--spacing-md);">`;
        unlockedAchievements.forEach(a => {
            html += `
                <div class="achievement-item">
                    <span class="achievement-icon">${a.icon}</span>
                    <div class="achievement-content">
                        <div class="achievement-title">${a.name}</div>
                        <div class="achievement-description">${a.description}</div>
                    </div>
                    <span class="achievement-xp">✅</span>
                </div>
            `;
        });
        html += `</div>`;
    }

    // Show locked achievements
    if (lockedAchievements.length > 0) {
        html += `<div style="opacity: 0.6;">`;
        lockedAchievements.slice(0, 3).forEach(a => {
            html += `
                <div class="achievement-item" style="border-left-color: var(--border-color);">
                    <span class="achievement-icon">🔒</span>
                    <div class="achievement-content">
                        <div class="achievement-title">${a.name}</div>
                        <div class="achievement-description">${a.description}</div>
                    </div>
                    <span class="achievement-xp">🔒</span>
                </div>
            `;
        });
        if (lockedAchievements.length > 3) {
            html += `
                <div style="text-align: center; padding: var(--spacing-sm); font-size: var(--font-size-sm); color: var(--text-tertiary);">
                    +${lockedAchievements.length - 3} more locked achievements
                </div>
            `;
        }
        html += `</div>`;
    }

    html += `</div>`;
    return html;
}

/**
 * Create leaderboard
 */
function createLeaderboard(data) {
    const players = data.leaderboardData;

    let html = `
        <div class="leaderboard">
            <div class="leaderboard-header">
                <span class="section-title">🏆 Leaderboard</span>
                <div class="leaderboard-tabs">
                    <button class="active" data-tab="xp">XP</button>
                    <button data-tab="streak">Streak</button>
                </div>
            </div>
    `;

    players.slice(0, 5).forEach((player, index) => {
        const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
        const rank = index + 1;
        const isCurrentUser = player.isCurrentUser;

        html += `
            <div class="leaderboard-item${isCurrentUser ? ' current-user' : ''}" style="${isCurrentUser ? 'background: var(--primary); color: white;' : ''}">
                <div class="rank ${rankClass}">${rank}</div>
                <div class="player-info">
                    <div class="player-avatar">${player.avatar}</div>
                    <div class="player-name" style="${isCurrentUser ? 'color: white;' : ''}">
                        ${player.name} ${isCurrentUser ? '(You)' : ''}
                    </div>
                </div>
                <div class="player-score" style="${isCurrentUser ? 'color: white;' : ''}">
                    ⭐ ${player.xp}
                </div>
            </div>
        `;
    });

    html += `</div>`;
    return html;
}

/**
 * Create badges
 */
function createBadges(data) {
    const badges = store.get('badges', []);
    const allBadges = [
        { id: 'js_badge', icon: '🟡', name: 'JS Basics', description: 'Complete JavaScript basics' },
        { id: 'dom_badge', icon: '🟢', name: 'DOM Master', description: 'Master DOM manipulation' },
        { id: 'react_badge', icon: '🔵', name: 'React Developer', description: 'Build React apps' },
        { id: 'project_badge', icon: '🟣', name: 'Project Builder', description: 'Complete a project' },
        { id: 'quiz_badge', icon: '🔴', name: 'Quiz Champion', description: 'Score 100% on a quiz' },
        { id: 'game_badge', icon: '🟠', name: 'Game Master', description: 'Win a mini-game' }
    ];

    let html = `
        <div class="card">
            <div class="section-header">
                <span class="section-title">🏅 Badges</span>
                <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                    ${badges.length}/${allBadges.length}
                </span>
            </div>
            <div class="badges-grid">
    `;

    allBadges.forEach(badge => {
        const unlocked = badges.includes(badge.id);
        html += `
            <div class="badge-item ${unlocked ? 'unlocked' : 'locked'}">
                <div class="badge-icon">${unlocked ? badge.icon : '❓'}</div>
                <div class="badge-name">${unlocked ? badge.name : '???'}</div>
                <div class="badge-description">${unlocked ? badge.description : 'Locked'}</div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;
    return html;
}

/**
 * Create notifications
 */
function createNotifications(data) {
    const notifications = data.notifications;

    let html = `
        <div class="card">
            <div class="section-header">
                <span class="section-title">🔔 Notifications</span>
                <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                    ${notifications.length} new
                </span>
            </div>
    `;

    if (notifications.length === 0) {
        html += `
            <div style="text-align: center; padding: var(--spacing-xl); color: var(--text-tertiary);">
                <div style="font-size: var(--font-size-3xl); margin-bottom: var(--spacing-sm);">🎉</div>
                <p>No notifications yet. Keep learning!</p>
            </div>
        `;
    } else {
        notifications.forEach(notification => {
            const time = getRelativeTime(notification.time);
            html += `
                <div class="notification-item">
                    <span class="notification-icon">${notification.icon}</span>
                    <div class="notification-content">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-time">${time}</div>
                    </div>
                </div>
            `;
        });
    }

    html += `</div>`;
    return html;
}

/**
 * Setup event listeners
 */
function setupEventListeners(container) {
    // Continue Learning button
    const continueBtn = container.querySelector('#continue-learning-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            router.navigate('lessons');
        });
    }

    // Continue Learning card
    const continueCard = container.querySelector('#continue-learning');
    if (continueCard) {
        continueCard.addEventListener('click', () => {
            router.navigate('lessons');
        });
    }

    // Quick Play button
    const quickPlayBtn = container.querySelector('#quick-play-btn');
    if (quickPlayBtn) {
        quickPlayBtn.addEventListener('click', () => {
            const challenge = container.querySelector('.quick-challenge-btn');
            if (challenge) {
                challenge.click();
            } else {
                router.navigate('playground');
            }
        });
    }

    // Quick Challenge button
    const challengeBtn = container.querySelector('.quick-challenge-btn');
    if (challengeBtn) {
        challengeBtn.addEventListener('click', () => {
            const challengeData = JSON.parse(challengeBtn.dataset.challenge);
            startQuickChallenge(challengeData);
        });
    }

    // View all lessons
    const viewAll = container.querySelector('#view-all-lessons');
    if (viewAll) {
        viewAll.addEventListener('click', () => {
            router.navigate('lessons');
        });
    }

    // Upcoming lessons
    const lessons = container.querySelectorAll('.upcoming-lesson');
    lessons.forEach(lesson => {
        lesson.addEventListener('click', () => {
            const lessonId = parseInt(lesson.dataset.lesson);
            const unlocked = store.get('unlockedLessons', [0]);
            if (unlocked.includes(lessonId)) {
                router.navigate('lessons');
                setTimeout(() => {
                    document.dispatchEvent(new CustomEvent('load-lesson', {
                        detail: { lessonId }
                    }));
                }, 60);
            } else {
                showToast('🔒 Complete previous lessons to unlock this one.', 'warning');
            }
        });
    });

    // Leaderboard tabs
    const tabs = container.querySelectorAll('.leaderboard-tabs button');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Re-render leaderboard with different sorting
            const tabType = tab.dataset.tab;
            const leaderboard = container.querySelector('.leaderboard');
            if (leaderboard) {
                const data = getDashboardData();
                const sorted = [...data.leaderboardData];
                if (tabType === 'streak') {
                    sorted.sort((a, b) => b.streak - a.streak);
                } else {
                    sorted.sort((a, b) => b.xp - a.xp);
                }
                // Update leaderboard items
                const items = leaderboard.querySelectorAll('.leaderboard-item');
                sorted.slice(0, 5).forEach((player, index) => {
                    if (items[index]) {
                        const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
                        items[index].querySelector('.rank').textContent = index + 1;
                        items[index].querySelector('.rank').className = `rank ${rankClass}`;
                        items[index].querySelector('.player-name').textContent = `${player.name} ${player.isCurrentUser ? '(You)' : ''}`;
                        items[index].querySelector('.player-avatar').textContent = player.avatar;
                        items[index].querySelector('.player-score').textContent = tabType === 'streak' ? `🔥 ${player.streak}` : `⭐ ${player.xp}`;
                    }
                });
            }
        });
    });

    // Search functionality
    const searchInput = container.querySelector('.search-bar input');
    if (searchInput) {
        const debounce = (fn, delay) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => fn(...args), delay);
            };
        };

        const handleSearch = debounce((query) => {
            if (query.length > 1) {
                performSearch(query);
            } else {
                const results = container.querySelector('.search-results');
                if (results) {
                    results.classList.remove('active');
                    results.innerHTML = '';
                }
            }
        }, 300);

        searchInput.addEventListener('input', (e) => {
            handleSearch(e.target.value);
        });

        // Keyboard shortcut: Ctrl+K
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }
}

/**
 * Perform search
 */
function performSearch(query) {
    const results = document.querySelector('.search-results');
    if (!results) return;

    const lessonNames = [
        'Introduction to Programming',
        'JavaScript Introduction',
        'Variables',
        'Data Types',
        'Operators',
        'Conditions',
        'Loops',
        'Functions',
        'Arrays',
        'Objects',
        'DOM Manipulation',
        'Events',
        'Forms',
        'ES6 Features',
        'Modules',
        'Promises',
        'Async/Await',
        'Fetch API',
        'JSON',
        'Local Storage',
        'Error Handling',
        'OOP',
        'Classes',
        'Design Patterns',
        'Projects',
        'React Introduction',
        'JSX & Components',
        'Props & State',
        'Hooks',
        'React Router'
    ];

    const lowerQuery = query.toLowerCase();
    const matches = lessonNames
        .map((name, index) => ({ name, index }))
        .filter(item => item.name.toLowerCase().includes(lowerQuery))
        .slice(0, 5);

    if (matches.length === 0) {
        results.innerHTML = `
            <div style="padding: var(--spacing-lg); text-align: center; color: var(--text-tertiary);">
                No results found for "${query}"
            </div>
        `;
        results.classList.add('active');
        return;
    }

    let html = '';
    matches.forEach(match => {
        const completed = store.get('completedLessons', []);
        const unlocked = store.get('unlockedLessons', [0]);
        const isCompleted = completed.includes(match.index);
        const isUnlocked = unlocked.includes(match.index);

        html += `
            <div class="search-result-item" data-lesson="${match.index}">
                <div class="result-title">
                    📚 ${match.name}
                    <span class="result-type">${isCompleted ? '✅ Completed' : isUnlocked ? '📖 Available' : '🔒 Locked'}</span>
                </div>
                <div class="result-description">Lesson ${match.index + 1} of ${lessonNames.length}</div>
            </div>
        `;
    });

    results.innerHTML = html;
    results.classList.add('active');

    // Click handler for results
    results.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const lessonId = parseInt(item.dataset.lesson);
            const unlocked = store.get('unlockedLessons', [0]);
            if (unlocked.includes(lessonId)) {
                router.navigate('lessons');
                const event = new CustomEvent('load-lesson', {
                    detail: { lessonId }
                });
                document.dispatchEvent(event);
            } else {
                showToast('🔒 Complete previous lessons to unlock this one.', 'warning');
            }
        });
    });
}

/**
 * Start a quick challenge
 */
function startQuickChallenge(challenge) {
    // Show a modal with the challenge
    showToast(`🚀 Starting: ${challenge.title}`, 'info');

    // Navigate to playground with a preset
    router.navigate('playground');

    // Dispatch event to load challenge in playground
    const event = new CustomEvent('load-challenge', {
        detail: { challenge }
    });
    document.dispatchEvent(event);
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
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }
    }, 3000);

    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });
    }
}

/**
 * Animate cards on load
 */
function animateCards(container) {
    const cards = container.querySelectorAll('.stat-card, .card, .continue-learning, .quick-challenge, .achievement-item, .leaderboard-item');
    cards.forEach((card, index) => {
        setTimeout(() => {
            slideIn(card, 'up', 300);
        }, index * 50);
    });
}

/**
 * Refresh dashboard
 */
function refreshDashboard(container) {
    const data = getDashboardData();
    renderDashboard(container);
    setupEventListeners(container);
    animateCards(container);
}

// Export for use in other modules
export { refreshDashboard };