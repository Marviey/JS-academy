/**
 * Storage - Local Storage wrapper with error handling
 */

export class Storage {
    constructor() {
        this.prefix = 'js_academy_';
        this.available = this.checkAvailability();
    }

    /**
     * Check if localStorage is available
     */
    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('LocalStorage is not available:', e);
            return false;
        }
    }

    /**
     * Get a value from storage
     */
    get(key, defaultValue = null) {
        if (!this.available) return defaultValue;

        try {
            const value = localStorage.getItem(this.prefix + key);
            if (value === null) return defaultValue;

            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        } catch (e) {
            console.warn(`Failed to get "${key}" from storage:`, e);
            return defaultValue;
        }
    }

    /**
     * Set a value in storage
     */
    set(key, value) {
        if (!this.available) return false;

        try {
            const serialized = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(this.prefix + key, serialized);
            return true;
        } catch (e) {
            console.warn(`Failed to set "${key}" in storage:`, e);
            return false;
        }
    }

    /**
     * Remove a value from storage
     */
    remove(key) {
        if (!this.available) return false;

        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (e) {
            console.warn(`Failed to remove "${key}" from storage:`, e);
            return false;
        }
    }

    /**
     * Clear all prefixed keys from storage
     */
    clear() {
        if (!this.available) return false;

        try {
            const keys = Object.keys(localStorage);
            const prefixedKeys = keys.filter(k => k.startsWith(this.prefix));
            prefixedKeys.forEach(k => localStorage.removeItem(k));
            return true;
        } catch (e) {
            console.warn('Failed to clear storage:', e);
            return false;
        }
    }

    /**
     * Get all prefixed keys
     */
    keys() {
        if (!this.available) return [];

        try {
            const keys = Object.keys(localStorage);
            return keys
                .filter(k => k.startsWith(this.prefix))
                .map(k => k.slice(this.prefix.length));
        } catch (e) {
            console.warn('Failed to get storage keys:', e);
            return [];
        }
    }

    /**
     * Get all values
     */
    getAll() {
        if (!this.available) return {};

        try {
            const result = {};
            const keys = this.keys();
            for (const key of keys) {
                result[key] = this.get(key);
            }
            return result;
        } catch (e) {
            console.warn('Failed to get all storage values:', e);
            return {};
        }
    }

    /**
     * Get storage usage in bytes
     */
    getUsage() {
        if (!this.available) return 0;

        try {
            let total = 0;
            for (const key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            return total;
        } catch (e) {
            console.warn('Failed to get storage usage:', e);
            return 0;
        }
    }

    /**
     * Get storage usage in a readable format
     */
    getUsageReadable() {
        const bytes = this.getUsage();
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
}