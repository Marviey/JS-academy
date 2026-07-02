/**
 * Store - Manages application state with Local Storage
 */

import { Storage } from './utils/storage.js';

export class Store {
    static instance = null;

    constructor() {
        if (Store.instance) {
            return Store.instance;
        }
        Store.instance = this;
        this.storage = new Storage();
        this.state = this.getDefaultState();
        this.observers = [];
    }

    static getInstance() {
        if (!Store.instance) {
            Store.instance = new Store();
        }
        return Store.instance;
    }

    /**
     * Get default application state
     */
    getDefaultState() {
        return {
            user: {
                name: 'Student',
                avatar: '👨‍🎓',
                joined: new Date().toISOString()
            },
            xp: 0,
            coins: 0,
            level: 1,
            streak: 0,
            lastActive: null,
            currentLesson: null,
            completedLessons: [],
            unlockedLessons: [0], // First lesson is unlocked
            games: [],
            projects: [],
            achievements: [],
            badges: [],
            certificates: [],
            progress: {},
            theme: 'light',
            soundEnabled: true,
            animationsEnabled: true,
            fontSize: 'medium',
            hasSeenWelcome: false
        };
    }

    /**
     * Load state from storage
     */
    async load() {
        try {
            const saved = this.storage.get('js_academy_state');
            if (saved) {
                const parsed = typeof saved === 'string' ? JSON.parse(saved) : saved;
                this.state = this.mergeState(this.getDefaultState(), parsed);
                this.applyMigrations();
            } else {
                // First time user - save default state
                await this.save();
            }
        } catch (error) {
            console.error('Failed to load state:', error);
            this.state = this.getDefaultState();
            await this.save();
        }
    }

    /**
     * Merge saved state with defaults
     */
    mergeState(defaultState, savedState) {
        const merged = { ...defaultState };
        for (const key in savedState) {
            if (merged.hasOwnProperty(key)) {
                if (typeof merged[key] === 'object' && !Array.isArray(merged[key]) && merged[key] !== null) {
                    merged[key] = { ...merged[key], ...savedState[key] };
                } else {
                    merged[key] = savedState[key];
                }
            }
        }
        return merged;
    }

    /**
     * Apply data migrations for version updates
     */
    applyMigrations() {
        // Ensure arrays exist
        if (!this.state.completedLessons) {
            this.state.completedLessons = [];
        }
        if (!this.state.unlockedLessons) {
            this.state.unlockedLessons = [0];
        }
        if (!this.state.achievements) {
            this.state.achievements = [];
        }
        if (!this.state.badges) {
            this.state.badges = [];
        }
        if (!this.state.certificates) {
            this.state.certificates = [];
        }
        if (!this.state.progress) {
            this.state.progress = {};
        }
    }

    /**
     * Save state to storage
     */
    async save() {
        try {
            this.storage.set('js_academy_state', JSON.stringify(this.state));
            this.notifyObservers();
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }

    /**
     * Get value from state
     */
    get(key, defaultValue = null) {
        const keys = key.split('.');
        let value = this.state;
        for (const k of keys) {
            if (value === undefined || value === null) {
                return defaultValue;
            }
            value = value[k];
        }
        return value !== undefined ? value : defaultValue;
    }

    /**
     * Set value in state
     */
    set(key, value) {
        const keys = key.split('.');
        let target = this.state;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) {
                target[keys[i]] = {};
            }
            target = target[keys[i]];
        }
        target[keys[keys.length - 1]] = value;
        this.save();
    }

    /**
     * Update multiple values at once
     */
    update(values) {
        for (const [key, value] of Object.entries(values)) {
            this.set(key, value);
        }
    }

    /**
     * Add XP to the user
     */
    addXP(amount) {
        const currentXP = this.get('xp');
        const newXP = currentXP + amount;
        this.set('xp', newXP);

        // Check for level up
        const newLevel = Math.floor(newXP / 100) + 1;
        const currentLevel = this.get('level');
        if (newLevel > currentLevel) {
            this.set('level', newLevel);
            this.notifyObservers('level-up', { oldLevel: currentLevel, newLevel });
        }

        return newXP;
    }

    /**
     * Add coins to the user
     */
    addCoins(amount) {
        const currentCoins = this.get('coins');
        const newCoins = currentCoins + amount;
        this.set('coins', newCoins);
        return newCoins;
    }

    /**
     * Update the daily streak
     */
    updateStreak() {
        const today = new Date().toDateString();
        const lastActive = this.get('lastActive');

        if (!lastActive) {
            this.set('streak', 1);
            this.set('lastActive', today);
            return 1;
        }

        const lastDate = new Date(lastActive);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastActive === today) {
            // Already active today
            return this.get('streak');
        }

        if (lastActive === yesterday.toDateString()) {
            // Consecutive day
            const newStreak = this.get('streak') + 1;
            this.set('streak', newStreak);
            this.set('lastActive', today);

            // Reward for streak milestones
            if (newStreak === 7) {
                this.addCoins(50);
                this.addXP(100);
                this.notifyObservers('streak-milestone', { days: 7 });
            } else if (newStreak === 30) {
                this.addCoins(200);
                this.addXP(500);
                this.notifyObservers('streak-milestone', { days: 30 });
            }

            return newStreak;
        }

        // Streak broken
        this.set('streak', 1);
        this.set('lastActive', today);
        return 1;
    }

    /**
     * Complete a lesson
     */
    completeLesson(lessonId) {
        const completed = this.get('completedLessons', []);
        if (!completed.includes(lessonId)) {
            completed.push(lessonId);
            this.set('completedLessons', completed);

            // Add progress
            const progress = this.get('progress', {});
            progress[lessonId] = {
                completed: true,
                completedAt: new Date().toISOString()
            };
            this.set('progress', progress);

            // Unlock next lesson
            const nextLesson = lessonId + 1;
            const unlocked = this.get('unlockedLessons', []);
            if (!unlocked.includes(nextLesson)) {
                unlocked.push(nextLesson);
                this.set('unlockedLessons', unlocked);
            }

            // Update streak
            this.updateStreak();
        }
    }

    /**
     * Check if a lesson is completed
     */
    isLessonCompleted(lessonId) {
        return this.get('completedLessons', []).includes(lessonId);
    }

    /**
     * Check if a lesson is unlocked
     */
    isLessonUnlocked(lessonId) {
        return this.get('unlockedLessons', []).includes(lessonId);
    }

    /**
     * Add an achievement
     */
    addAchievement(achievementId) {
        const achievements = this.get('achievements', []);
        if (!achievements.includes(achievementId)) {
            achievements.push(achievementId);
            this.set('achievements', achievements);
            this.notifyObservers('achievement-unlocked', { achievementId });
            return true;
        }
        return false;
    }

    /**
     * Add a badge
     */
    addBadge(badgeId) {
        const badges = this.get('badges', []);
        if (!badges.includes(badgeId)) {
            badges.push(badgeId);
            this.set('badges', badges);
            this.notifyObservers('badge-earned', { badgeId });
            return true;
        }
        return false;
    }

    /**
     * Subscribe to state changes
     */
    subscribe(observer) {
        this.observers.push(observer);
    }

    /**
     * Notify all observers of state changes
     */
    notifyObservers(event = 'update', data = null) {
        this.observers.forEach(observer => {
            try {
                observer(event, data);
            } catch (error) {
                console.error('Observer error:', error);
            }
        });
    }

    /**
     * Reset all progress
     */
    resetProgress() {
        if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
            const theme = this.get('theme');
            const soundEnabled = this.get('soundEnabled');
            const animationsEnabled = this.get('animationsEnabled');
            const fontSize = this.get('fontSize');

            this.state = this.getDefaultState();
            this.state.theme = theme;
            this.state.soundEnabled = soundEnabled;
            this.state.animationsEnabled = animationsEnabled;
            this.state.fontSize = fontSize;

            this.save();
            this.notifyObservers('progress-reset');
            return true;
        }
        return false;
    }
}