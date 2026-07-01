/**
 * Animations - Animation utilities
 */

/**
 * Animate an element with a CSS class
 */
export function animate(element, animationClass, duration = 400) {
    return new Promise(resolve => {
        if (!element) {
            resolve();
            return;
        }

        element.classList.add(animationClass);

        const timeout = setTimeout(() => {
            element.classList.remove(animationClass);
            resolve();
        }, duration);

        // Clean up if animation ends early
        element.addEventListener('animationend', () => {
            clearTimeout(timeout);
            element.classList.remove(animationClass);
            resolve();
        }, { once: true });
    });
}

/**
 * Fade in an element
 */
export function fadeIn(element, duration = 300) {
    return new Promise(resolve => {
        if (!element) {
            resolve();
            return;
        }

        element.style.opacity = '0';
        element.style.display = 'block';
        element.style.transition = `opacity ${duration}ms ease`;

        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });

        setTimeout(() => {
            element.style.transition = '';
            resolve();
        }, duration);
    });
}

/**
 * Fade out an element
 */
export function fadeOut(element, duration = 300) {
    return new Promise(resolve => {
        if (!element) {
            resolve();
            return;
        }

        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';

        setTimeout(() => {
            element.style.display = 'none';
            element.style.transition = '';
            resolve();
        }, duration);
    });
}

/**
 * Slide in an element
 */
export function slideIn(element, direction = 'up', duration = 400) {
    return new Promise(resolve => {
        if (!element) {
            resolve();
            return;
        }

        const directions = {
            up: { transform: 'translateY(20px)' },
            down: { transform: 'translateY(-20px)' },
            left: { transform: 'translateX(20px)' },
            right: { transform: 'translateX(-20px)' }
        };

        const start = directions[direction] || directions.up;

        element.style.opacity = '0';
        element.style.transform = start.transform;
        element.style.transition = `all ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;

        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translate(0, 0)';
        });

        setTimeout(() => {
            element.style.transition = '';
            resolve();
        }, duration);
    });
}

/**
 * Slide out an element
 */
export function slideOut(element, direction = 'up', duration = 400) {
    return new Promise(resolve => {
        if (!element) {
            resolve();
            return;
        }

        const directions = {
            up: { transform: 'translateY(20px)' },
            down: { transform: 'translateY(-20px)' },
            left: { transform: 'translateX(20px)' },
            right: { transform: 'translateX(-20px)' }
        };

        const end = directions[direction] || directions.up;

        element.style.transition = `all ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
        element.style.opacity = '0';
        element.style.transform = end.transform;

        setTimeout(() => {
            element.style.transition = '';
            resolve();
        }, duration);
    });
}

/**
 * Shake an element
 */
export function shake(element, intensity = 5, duration = 400) {
    return new Promise(resolve => {
        if (!element) {
            resolve();
            return;
        }

        const startTime = Date.now();
        const originalX = 0;
        const shakeCount = Math.floor(duration / 30);

        let count = 0;
        const interval = setInterval(() => {
            const progress = count / shakeCount;
            const magnitude = intensity * (1 - progress);
            const x = (Math.random() - 0.5) * magnitude * 2;
            element.style.transform = `translateX(${x}px)`;
            count++;

            if (count >= shakeCount) {
                clearInterval(interval);
                element.style.transform = '';
                resolve();
            }
        }, 30);
    });
}

/**
 * Bounce an element
 */
export function bounce(element, distance = 20, duration = 600) {
    return new Promise(resolve => {
        if (!element) {
            resolve();
            return;
        }

        element.style.transition = `all ${duration}ms cubic-bezier(0.36, 0.07, 0.19, 0.97)`;
        element.style.transform = `translateY(-${distance}px)`;

        setTimeout(() => {
            element.style.transform = 'translateY(0)';
            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, 150);
        }, duration * 0.7);
    });
}

/**
 * Scale animation
 */
export function scale(element, from = 0, to = 1, duration = 300) {
    return new Promise(resolve => {
        if (!element) {
            resolve();
            return;
        }

        element.style.transition = `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
        element.style.transform = `scale(${from})`;

        requestAnimationFrame(() => {
            element.style.transform = `scale(${to})`;
        });

        setTimeout(() => {
            element.style.transition = '';
            resolve();
        }, duration);
    });
}

/**
 * Typewriter effect
 */
export function typewriter(element, text, speed = 50, delay = 0) {
    return new Promise(resolve => {
        if (!element) {
            resolve();
            return;
        }

        setTimeout(() => {
            element.textContent = '';
            let index = 0;

            const interval = setInterval(() => {
                if (index < text.length) {
                    element.textContent += text.charAt(index);
                    index++;
                } else {
                    clearInterval(interval);
                    resolve();
                }
            }, speed);
        }, delay);
    });
}

/**
 * Pulse animation (loop)
 */
export function pulse(element, duration = 1000) {
    if (!element) return;

    element.style.animation = `pulse ${duration}ms ease-in-out infinite`;
    element.style.transformOrigin = 'center';
}

/**
 * Stop pulse animation
 */
export function stopPulse(element) {
    if (!element) return;
    element.style.animation = '';
}