// Main Application Logic - Integrates all components

// Sound generation using Web Audio API
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.enabled = true;
        this.init();
    }

    init() {
        // Create audio context on first user interaction
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.createSounds();
            }
        }, { once: true });
    }

    createSounds() {
        // Generate sound for eating food
        this.sounds.eat = () => {
            if (!this.enabled || !this.audioContext) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };

        // Generate sound for game over
        this.sounds.gameover = () => {
            if (!this.enabled || !this.audioContext) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = 200;
            oscillator.type = 'sawtooth';

            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

            oscillator.start(this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        };

        // Generate sound for level up
        this.sounds.levelup = () => {
            if (!this.enabled || !this.audioContext) return;

            const oscillator1 = this.audioContext.createOscillator();
            const oscillator2 = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator1.frequency.value = 523.25; // C5
            oscillator2.frequency.value = 659.25; // E5
            oscillator1.type = 'sine';
            oscillator2.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

            oscillator1.start(this.audioContext.currentTime);
            oscillator2.start(this.audioContext.currentTime);
            oscillator1.stop(this.audioContext.currentTime + 0.3);
            oscillator2.stop(this.audioContext.currentTime + 0.3);
        };

        // Update audio elements to use our sound generator
        this.wireUpSounds();
    }

    wireUpSounds() {
        const eatSound = document.getElementById('eatSound');
        const gameOverSound = document.getElementById('gameOverSound');
        const levelUpSound = document.getElementById('levelUpSound');

        if (eatSound) {
            eatSound.play = () => this.play('eat');
        }
        if (gameOverSound) {
            gameOverSound.play = () => this.play('gameover');
        }
        if (levelUpSound) {
            levelUpSound.play = () => this.play('levelup');
        }
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// Leaderboard Manager
class LeaderboardManager {
    constructor() {
        this.recordsList = document.getElementById('recordsList');
        this.load();
    }

    load() {
        this.updateDisplay();
    }

    updateDisplay() {
        if (!this.recordsList) return;

        const records = this.getRecords();

        if (records.length === 0) {
            this.recordsList.innerHTML = '<p class="no-records">No records yet. Play your first game!</p>';
            return;
        }

        this.recordsList.innerHTML = records.map((record, index) => {
            const date = new Date(record.date);
            const formattedDate = date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';

            return `
                <div class="record-item">
                    <div class="record-info">
                        <div class="record-rank">${medal}</div>
                        <div>
                            <div class="record-details">
                                <strong>Score: ${record.score}</strong> | Length: ${record.length} | Level: ${record.level}
                            </div>
                            <div class="record-details" style="font-size: 0.8em; opacity: 0.7;">
                                ${formattedDate}
                            </div>
                            ${record.wallet !== 'Not connected' ? `
                                <div class="record-details" style="font-size: 0.75em; opacity: 0.6; font-family: monospace;">
                                    ${this.formatWalletAddress(record.wallet)}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="record-score">${record.score}</div>
                </div>
            `;
        }).join('');
    }

    getRecords() {
        const records = localStorage.getItem('snakeRecords');
        return records ? JSON.parse(records) : [];
    }

    formatWalletAddress(address) {
        if (!address || address === 'Not connected') return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    clear() {
        if (confirm('Are you sure you want to clear all records?')) {
            localStorage.removeItem('snakeRecords');
            this.updateDisplay();
        }
    }
}

// Statistics Manager
class StatsManager {
    constructor() {
        this.stats = this.load();
    }

    load() {
        const stats = localStorage.getItem('snakeStats');
        return stats ? JSON.parse(stats) : {
            gamesPlayed: 0,
            totalScore: 0,
            totalLength: 0,
            highestLevel: 1,
            totalPlayTime: 0
        };
    }

    save() {
        localStorage.setItem('snakeStats', JSON.stringify(this.stats));
    }

    update(gameData) {
        this.stats.gamesPlayed++;
        this.stats.totalScore += gameData.score || 0;
        this.stats.totalLength += gameData.length || 0;
        this.stats.highestLevel = Math.max(this.stats.highestLevel, gameData.level || 1);
        this.save();
    }

    getAverageScore() {
        if (this.stats.gamesPlayed === 0) return 0;
        return Math.round(this.stats.totalScore / this.stats.gamesPlayed);
    }

    reset() {
        if (confirm('Are you sure you want to reset all statistics?')) {
            this.stats = {
                gamesPlayed: 0,
                totalScore: 0,
                totalLength: 0,
                highestLevel: 1,
                totalPlayTime: 0
            };
            this.save();
        }
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.frames = 0;
        this.lastTime = performance.now();
    }

    update() {
        this.frames++;
        const currentTime = performance.now();

        if (currentTime >= this.lastTime + 1000) {
            this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime));
            this.frames = 0;
            this.lastTime = currentTime;
        }
    }

    getFPS() {
        return this.fps;
    }
}

// Canvas Resizer - Makes the game responsive
class CanvasResizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.originalWidth = canvas.width;
        this.originalHeight = canvas.height;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth - 40; // Account for padding

        if (window.innerWidth <= 768) {
            const size = Math.min(containerWidth, window.innerHeight * 0.5);
            this.canvas.style.width = size + 'px';
            this.canvas.style.height = size + 'px';
        } else {
            const size = Math.min(containerWidth, 600);
            this.canvas.style.width = size + 'px';
            this.canvas.style.height = size + 'px';
        }
    }
}

// Global update function for leaderboard
window.updateLeaderboard = function() {
    if (window.leaderboardManager) {
        window.leaderboardManager.updateDisplay();
    }
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🐍 Crypto Snake - Liquid Glass Edition');
    console.log('Initializing application...');

    // Initialize managers
    window.soundManager = new SoundManager();
    window.leaderboardManager = new LeaderboardManager();
    window.statsManager = new StatsManager();
    window.performanceMonitor = new PerformanceMonitor();

    // Setup canvas resizer
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        window.canvasResizer = new CanvasResizer(canvas);
    }

    // Add keyboard shortcuts info
    console.log('⌨️  Keyboard shortcuts:');
    console.log('  - Arrow Keys or WASD: Move snake');
    console.log('  - SPACE: Start/Restart game');
    console.log('  - P or ESC: Pause/Resume');

    // Add developer tools
    window.devTools = {
        clearRecords: () => {
            if (window.leaderboardManager) {
                window.leaderboardManager.clear();
            }
        },
        resetStats: () => {
            if (window.statsManager) {
                window.statsManager.reset();
            }
        },
        toggleSound: () => {
            if (window.soundManager) {
                const enabled = window.soundManager.toggle();
                console.log(`Sound ${enabled ? 'enabled' : 'disabled'}`);
                return enabled;
            }
        },
        getStats: () => {
            if (window.statsManager) {
                return window.statsManager.stats;
            }
        },
        getFPS: () => {
            if (window.performanceMonitor) {
                return window.performanceMonitor.getFPS();
            }
        }
    };

    console.log('✅ Application initialized successfully!');
    console.log('💡 Tip: Open DevTools and use window.devTools for developer commands');

    // Show welcome message after a short delay
    setTimeout(() => {
        if (window.walletManager && !window.walletManager.connected) {
            console.log('💰 Connect your MetaMask wallet to track your records!');
        }
    }, 2000);
});

// Service Worker Registration (for PWA support - optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable PWA
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered:', registration))
        //     .catch(error => console.log('SW registration failed:', error));
    });
}

// Prevent default touch behaviors for better mobile experience
document.addEventListener('touchmove', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
}, { passive: false });

// Handle visibility change (pause game when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.game && window.game.gameRunning && !window.game.gamePaused) {
        window.game.togglePause();
    }
});
